import {
    CloudDownloadOutlined,
    LoadingOutlined, QuestionOutlined, SendOutlined, SettingOutlined
} from '@ant-design/icons';
import {
    Button,
    Radio,
    Flex,
    Modal,
    Pagination,
    Select,
    Tag,
    Tooltip,
} from 'antd';
import React, {CSSProperties, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { QUERY_FIRST } from "@/component/type";
import { errorNotification } from '@/component/Notification';
import {useDispatch, useSelector} from 'react-redux';
import {copy, getAllDisplayedColumnKeys, getSortedData} from '@/util/util';
import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";

import {Export, ExportCache, Query, SetProxy, SetProxyTimeout} from "../../wailsjs/go/icp/Bridge";
import { WithIndex } from "@/component/Interface";
import {config, event, icp} from "../../wailsjs/go/models";
import {appActions, RootState} from "@/store/store";
import TabsV2 from "@/component/TabsV2";
import Candidate, { ItemType } from "@/component/Candidate";
import { FindByPartialKey } from "../../wailsjs/go/history/Bridge";
import { AgGridReact } from "ag-grid-react";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import { ColDef, GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import {Proxy} from "@/pages/Setting";
import IcpBulk from "@/pages/IcpBulk";
import Number from "@/component/Number";

type PageDataType = WithIndex<icp.Item>

const LabelCssProps: CSSProperties = {
    display: "inline-block",
    textAlign: "left",
    minWidth: "60px",
    width: "60px",
    fontWeight: "bold",
    color: "#333"
}

const ServiceOptions = [
    { value: '1', label: '网站', },
    { value: '6', label: 'APP', },
    { value: '7', label: '小程序', },
    { value: '8', label: '快应用', },
]

const TabContent: React.FC = () => {
    const gridRef = useRef<AgGridReact>(null)
    const [pageSizeOptions] = useState([40, 80, 100])
    const [inputCache, setInputCache] = useState<string>("")
    const [total, setTotal] = useState<number>(0)
    const [currentPageNum, setCurrentPageNum] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const [loading, setLoading] = useState<boolean>(false)
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [disable, setDisable] = useState<boolean>(false)
    const [serviceType, setServiceType] = useState<string>("1")
    const [serviceTypeCache, setServiceTypeCache] = useState<string>(serviceType)
    const pageIDMap = useRef<{ [key: number]: number }>({})
    const exportID = useRef(0)
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const allowEnterPress = useSelector((state: RootState) => state.app.global.config?.QueryOnEnter.ICP)
    const history = useSelector((state: RootState) => state.app.global.history)
    const event = useSelector((state: RootState) => state.app.global.event)
    const stat = useSelector((state: RootState) => state.app.global.status)
    const [columnDefs] = useState<ColDef[]>([
        { headerName: '序号', field: "index", width: 80, pinned: 'left' },
        { headerName: '名称', field: "unitName", width: 250, pinned: 'left' },
        { headerName: '备案类型', field: "serviceType", width: 100 },
        { headerName: '备案内容', field: "serviceName", width: 200 },
        { headerName: '备案号', field: "serviceLicence", width: 200 },
        { headerName: '备案法人', field: "leaderName", width: 150 },
        { headerName: '单位性质', field: "natureName", width: 100 },
        { headerName: '审核日期', field: "updateRecordTime", width: 200, },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            // allow every column to be aggregated
            enableValue: true,
            // allow every column to be grouped
            enableRowGroup: true,
            // allow every column to be pivoted
            enablePivot: true,
            filter: true,
            suppressHeaderMenuButton: true,
            suppressHeaderFilterButton: true,
        }
    }, [])
    const getContextMenuItems = useCallback((params: GetContextMenuItemsParams): (MenuItemDef)[] => {
        if(!pageData || pageData.length === 0 || !params.node)return []
        return [
            {
                name: "浏览器打开URL",
                disabled: serviceType !== "1",
                action: () => {
                    BrowserOpenURL("http://" + params.node?.data?.serviceName)
                },
            },
            {
                name: "复制单元格",
                disabled: !params.value,
                action: () => {
                    copy(params.value)
                },
            },
            {
                name: "复制该行",
                disabled: !params.node?.data,
                action: () => {
                    const data:PageDataType = params.node?.data
                    const values:any[] = [];
                    getAllDisplayedColumnKeys(gridRef.current?.api, columnDefs).forEach(key=>{
                        values.push(data[key as keyof PageDataType]);
                    })
                    copy(values.join(gridRef.current?.api.getGridOption("clipboardDelimiter")))
                },
            },
            {
                name: "复制该列",
                action: () => {
                    const colValues = getSortedData<PageDataType>(gridRef.current?.api).map((item: PageDataType) => {
                        return item[params.column?.getColId() as keyof PageDataType]
                    })
                    copy(colValues.join('\n'))
                },
            }
        ];
    }, [pageData, serviceType]);

    useEffect(() => {
        EventsOn(event.ICPExport,  (eventDetail:event.EventDetail)=> {
            if (eventDetail.ID !== exportID.current){
                return
            }
            setIsExporting(false)
            setDisable(false)
            if (eventDetail.Status === stat.Error){
                errorNotification("错误",eventDetail.Error)
            }
        })
    }, []);

    const preHandleQuery = async (v: string) => {
        if (v === "" && serviceType !== "0") {
            return
        }
        setInputCache(v)
        setServiceTypeCache(serviceType)
        handleNewQuery(0, v, currentPageSize)
    }

    const handleNewQuery = (taskID: number, unitName: string, pageSize: number) => {
        pageIDMap.current = {}
        setCurrentPageNum(1)
        setTotal(0)
        setLoading(true)
        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        Query(taskID, unitName, 1, pageSize, serviceType).then(
            result => {
                let index = 0
                setTotal(result.total)
                setPageData(result.items?.map((item) => {
                    index++
                    return { ...item, index: index }
                }))
                pageIDMap.current[1] = result.pageID
                setLoading(false)
            }
        ).catch(
            err => {
                errorNotification("ICP查询出错", err)
                setPageData([])
                setLoading(false)
            }
        )
    }

    const handlePaginationChange = (newPage: number, newSize: number) => {
        //page发生变换
        if (newPage !== currentPageNum && newSize === currentPageSize) {
            setLoading(true)
            let pageID = pageIDMap.current[newPage]
            Query(pageID ? pageID : 0, inputCache, newPage, newSize, serviceTypeCache).then(
                (result) => {
                    let index = (newPage - 1) * currentPageSize
                    setPageData(result.items?.map((item) => ({ index: ++index, ...item })))
                    setCurrentPageNum(newPage)
                    setLoading(false)
                    pageIDMap.current[newPage] = result.pageID
                }
            ).catch(
                err => {
                    errorNotification("ICP查询出错", err)
                    setLoading(false)
                }
            )
        }

        //size发生变换
        if (newSize !== currentPageSize) {
            setCurrentPageSize(newSize)
            handleNewQuery(0, inputCache, newSize)
        }
    }

    const exportData = async () => {
        if (pageIDMap.current[1] === undefined || (serviceType === "0" && total === 0)) {
            errorNotification("错误", QUERY_FIRST)
            setIsExporting(false);
            setDisable(false);
            return
        }
        setIsExporting(true)
        setDisable(true)
        try {
            if (serviceType !== "0"){
                exportID.current = await Export(pageIDMap.current[1])
            }else {
                exportID.current = await ExportCache(inputCache,total)
            }
        } catch (e) {
            errorNotification("导出结果", e)
            setDisable(false)
            setIsExporting(false)
        }
    }

    const footer = (<Flex justify={"space-between"} align={'center'} style={{ padding: '5px' }}>
        <Pagination
            showQuickJumper
            showSizeChanger
            total={total}
            pageSizeOptions={pageSizeOptions}
            defaultPageSize={pageSizeOptions[0]}
            defaultCurrent={1}
            current={currentPageNum}
            showTotal={(total) => `${total} items`}
            size="small"
            onChange={(page, size) => handlePaginationChange(page, size)}
        />
        <Button
            disabled={disable}
            size="small"
            onClick={ async () => {
                await exportData()
            }}
            icon={isExporting ? <LoadingOutlined /> : <CloudDownloadOutlined />}
        >
            {isExporting ? "正在导出" : "导出结果"}
        </Button>
    </Flex>)

    return (<Flex vertical style={{ width: "100%", height: "100%" }} gap={5} >
        <Flex vertical align={"center"}>
            <Candidate<string>
                size={"small"}
                style={{ width: 600 }}
                placeholder='Search...'
                allowClear
                onPressEnter={(v) => {
                    if (!allowEnterPress) return
                    preHandleQuery(v)
                }}
                onSearch={(v) => preHandleQuery(v)}
                items={[
                    {
                        fetch: async (v) => {
                            try {
                                const response = await FindByPartialKey(history.ICP, !v ? "" : v.toString());
                                const a: ItemType<string>[] = response?.map(item => {
                                    const t: ItemType<string> = {
                                        value: item,
                                        label: item,
                                        data: item
                                    }
                                    return t;
                                });
                                return a;
                            } catch (e) {
                                errorNotification("错误", String(e));
                                return []; // 如果出现错误，返回空数组，避免组件出现异常
                            }
                        }
                    }
                ]}
                addonBefore={<Select
                    onChange={(value) => {
                        setServiceType(value)
                    }}
                    defaultValue="1"
                    options={[
                        ...ServiceOptions,
                        { value: '0', label: '历史结果', },
                    ]}
                    style={{ minWidth: 90 }}
                />}
            />
            ICP备案查询：请输入单位名称或域名或备案号查询，请勿使用子域名或者带http://www等字符的网址查询
        </Flex>
        <div style={{ width: "100%", height: "100%"}}>
            <AgGridReact
                ref={gridRef}
                loading={loading}
                embedFullWidthRows
                rowData={pageData}
                columnDefs={columnDefs}
                getContextMenuItems={getContextMenuItems}
                sideBar={false}
                headerHeight={32}
                rowHeight={32}
                defaultColDef={defaultColDef}
                noRowsOverlayComponent={() => <NotFound />}
                loadingOverlayComponent={() => <Loading />}
            />
        </div>
        {footer}
    </Flex>)
}

const SettingPanel = () => {
    const [open, setOpen] = useState<boolean>(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state:RootState) => state.app.global.config)
    const proxy = useSelector((state:RootState) => state.app.global.config.ICP.Proxy)
    const [url, setUrl] = useState<string>("")

    useEffect(() => {
        setUrl(`${proxy?.Type}://${proxy?.Host}:${proxy?.Port}`)
    }, [proxy])

    const updateProxy = (p:config.Proxy) =>{
        SetProxy(p).then(() => {
            const tt = { ...cfg, ICP: {...cfg.ICP, Proxy: p} } as config.Config;
            dispatch(appActions.setConfig(tt))
        }).catch(
            err => {
                errorNotification("错误", err, 3)
            }
        )
    }

    const onCancel = () =>{
        setOpen(false)
    }
    const onOk = () =>{
        setOpen(false)
    }

    const onOpen = () =>{
        setOpen(true)
    }

    return <>
        <Flex gap={5} align={"center"} justify={"center"} style={{backgroundColor: '#f2f2f2'}}>
            <Button onClick={onOpen}
                    size={"small"}
                    type={"link"}
                    icon={<SettingOutlined />}
                    style={{minWidth:'100px'}}
            >{
                proxy.Enable &&
                <Tag bordered={false} style={{ lineHeight: "20px", fontSize: "14px", marginRight: "0px" }}>
                    <Flex>
                            <span style={{ display: "flex", marginBottom: "5px" }}>
                                <SendOutlined rotate={315} style={{ color: proxy?.Enable ? "red" : "" }} />
                            </span>
                        {url}
                    </Flex>
                </Tag>
            }代理</Button>
        </Flex>
        <Modal
            footer={null}
            closeIcon={null}
            destroyOnClose
            open={open}
            onCancel={onCancel}
            onOk={onOk}
            styles={{
                body:{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: 'center'
                }
            }}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: 'center'
            }}
        >
            <Flex vertical gap={10}>
                <Tag bordered={false} color="blue">优先级高于全局代理，关闭时使用全局代理</Tag>
                <Proxy labelWidth={40} proxy={proxy} update={updateProxy}/>
                <Number labelWidth={160} label={"批量查询代理超时（ns）"} width={200} value={cfg.ICP.Timeout} onChange={async value => {
                    try {
                        await SetProxyTimeout(value)
                        const tt = { ...cfg, ICP: {...cfg.ICP, Timeout: value} } as config.Config;
                        dispatch(appActions.setConfig(tt))
                        return true
                    } catch (e) {
                        errorNotification("错误", e)
                        return false
                    }
                }}/>
            </Flex>
        </Modal>
    </>
}

const Icp: React.FC = () => {
    const [queryType, setQueryType] = useState<1|2>(1)
    return (
        <Flex vertical style={{height: '100%', width: '100%'}}>
            <Flex >
                <SettingPanel/>
                <Radio.Group
                    optionType="button"
                    buttonStyle="solid"
                    style={{width: '100%',border: 'none'}}
                    size={'small'}
                    block
                    options={[
                        { label: <Flex align={"center"}>单个查询<Tooltip placement={"bottom"} title={"如同网页查询"}><QuestionOutlined
                                style={{fontSize:12, color: "blue"}}
                            /></Tooltip></Flex>, value: 1 },
                        { label: <Flex align={"center"}>批量查询（Beta）<Tooltip placement={"bottom"} title={"会直接导出全部结果，务必使用代理池工具，如：https://github.com/thinkoaa/Deadpool，如任务报错可点击 继续 继续任务"}><QuestionOutlined
                                style={{fontSize:12, color: "blue"}}
                            /></Tooltip></Flex>, value: 2 },
                    ]}
                    defaultValue={queryType}
                    onChange={(e)=>setQueryType(e.target.value)}
                />
            </Flex>
            <div style={{height: '100%', width: '100%', display : queryType === 1 ? 'block' : 'none'}}>
                <TabsV2 defaultTabContent={<TabContent/>} />
            </div>
            <div style={{height: '100%', width: '100%', display : queryType === 2 ? 'block' : 'none'}}>
                <TabsV2 defaultTabContent={<IcpBulk/>} />
            </div>
        </Flex>
    )
}

export default Icp