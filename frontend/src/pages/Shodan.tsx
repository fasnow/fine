import React, {CSSProperties, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    Button,
    Divider,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Pagination,
    Popover,
    Select,
    Space,
    Spin,
    Switch,
    Tabs,
    Tooltip,
    Upload,
    Radio, Tag
} from 'antd';
import {
    GlobalOutlined,
    DiffOutlined,
    BugOutlined,
    CloudDownloadOutlined,
    InboxOutlined,
    LoadingOutlined,
    SearchOutlined, SyncOutlined,
    UserOutlined, FileTextOutlined
} from '@ant-design/icons';
import {errorNotification, errorNotification1} from '@/component/Notification';
import { QUERY_FIRST } from '@/component/type';
import { RootState, appActions, userActions } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { ExportDataPanelProps } from './Props';
import {config, event, properties} from "../../wailsjs/go/models";
import { BrowserOpenURL, EventsOn } from "../../wailsjs/runtime";
import {Coin1, Coin2, Dots} from "@/component/Icon";
import MurmurHash3 from "murmurhash3js"
import { Buffer } from "buffer"
import { toUint8Array } from "js-base64";
import {
    copy,
    getAllDisplayedColumnKeys,
    getAllDisplayedColumnKeysNoIndex,
    getSortedData,
    truncateString
} from "@/util/util";
import { WithIndex } from "@/component/Interface";
import { TargetKey } from "@/pages/Constants";
import TabLabel from "@/component/TabLabel";
import type { Tab } from "rc-tabs/lib/interface"
import Candidate, { ItemType } from "@/component/Candidate";
import { FindByPartialKey } from "../../wailsjs/go/history/Bridge";
import {AgGridReact, CustomCellRendererProps, CustomTooltipProps} from "ag-grid-react";
import "ag-grid-enterprise";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import {
    ColDef,
    GetContextMenuItemsParams,
    ICellRendererComp,
    ICellRendererParams, ITooltipParams,
    SideBarDef,
    ValueFormatterParams
} from "ag-grid-community";
import {GetUserInfo, HostSearch, SetAuth} from "../../wailsjs/go/shodan/Bridge";
import Label from "@/component/Label";
import Password from "@/component/Password";

const UserPanel: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config)
    const user = useSelector((state: RootState) => state.user.shodan)
    const [spin, setSpin] = useState(false)

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        try {
            const r = await GetUserInfo()
            dispatch(userActions.setShodanUser(r))
        } catch (e) {
            errorNotification("错误", e)
        }
    }

    const save = async (key: string) => {
        try {
            await SetAuth(key)
            const t = {...cfg, Shodan: {...cfg.Shodan, Token: key}} as config.Config;
            dispatch(appActions.setConfig(t))
            return true
        } catch (e) {
            errorNotification("错误", e)
            return false
        }
    }

    return <div style={{
        width: "auto",
        height: "23px",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f1f3f4"
    }}>
        <Flex align={"center"}>
            <Tooltip title="设置" placement={"bottom"}>
                <Button type='link' onClick={() => setOpen(true)}><UserOutlined /></Button>
            </Tooltip>
            <Flex gap={10}>
                <Tooltip title="剩余查询积分" placement={"bottom"}>
                    <div style={{
                        display: 'flex',
                        alignItems: "center",
                        color: "#f5222d"
                    }}>
                        <Coin1 />
                        {user.query_credits || 0}
                    </div>
                </Tooltip>
                <Tooltip title="剩余扫描积分" placement={"bottom"}>
                    <div style={{
                        display: 'flex',
                        alignItems: "center",
                        color: "#f5222d"
                    }}>
                        <Coin2/>
                        {user.scan_credits || 0}
                    </div>
                </Tooltip>
                <Tooltip title="刷新余额" placement={"bottom"}>
                    <Button size="small" shape="circle" type="text"
                            icon={<SyncOutlined
                                spin={spin}
                                onClick={async () => {
                                    setSpin(true)
                                    await getUserInfo()
                                    setSpin(false)
                                }
                                }
                            />}/>
                </Tooltip>
            </Flex>
        </Flex>
        <Modal
            open={open}
            onCancel={() => setOpen(false)}
            onOk={() => {
                setOpen(false)
            }}
            footer={null}
            closeIcon={null}
            width={600}
            destroyOnClose
        >
            <Flex vertical gap={10}>
                <Tag bordered={false} color="processing">
                    API信息
                </Tag>
                <Password labelWidth={100} value={cfg.Shodan.Token} label={"API key"} onSubmit={save} />
                <Flex vertical gap={5}>
                    <Label labelWidth={100} label="订阅计划" value={user.plan}/>
                    <Label labelWidth={100} label="剩余查询积分" value={`${user.query_credits||0}/${user.usage_limits?.query_credits||0}`}/>
                    <Label labelWidth={100} label="剩余扫描积分" value={`${user.scan_credits||0}/${user.usage_limits?.scan_credits||0}`}/>
                    <Label labelWidth={100} label="已监控IP数" value={`${user.monitored_ips||0}/${user.usage_limits?.monitored_ips||0}`}/>
                    <Label labelWidth={100} label="已锁定" value={user.unlocked?"否":"是"}/>
                </Flex>
            </Flex>
        </Modal>
    </div>
}

const ExportDataPanel = (props: { id: number; total: number; currentPageSize: number, }) => {
    const user = useSelector((state: RootState) => state.user.shodan)
    const [pageNum, setPageNum] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(props.currentPageSize)
    const [status, setStatus] = useState<"" | "error" | "warning">("")
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [exportable, setExportable] = useState<boolean>(false)
    const [maxPage, setMaxPage] = useState<number>(0)
    const [disable, setDisable] = useState<boolean>(false)
    const dispatch = useDispatch()
    const event = useSelector((state: RootState) => state.app.global.event)
    const stat = useSelector((state: RootState) => state.app.global.status)
    const exportID = useRef(0)

    useEffect(() => {
        EventsOn(event.FOFAExport, (eventDetail:any) => {
            if (eventDetail.ID !== exportID.current){
                return
            }
            if (eventDetail.Status === stat.Stopped){
                setIsExporting(false)
                setDisable(false)
                updateRestToken()
            } else if (eventDetail.Status === stat.Error){
                errorNotification("错误",eventDetail.Error)
            }
        })
    }, []);

    useEffect(() => {
        const maxPage = Math.ceil(props.total / pageSize)
        setMaxPage(maxPage)
        if (pageNum > maxPage) {
            setPageNum(maxPage)
        }
    }, [pageSize, props.total])

    useEffect(() => {
        if (pageNum > maxPage) {
            setPageNum(maxPage)
        }
    }, [pageNum])

    const updateRestToken = () => {
        GetUserInfo().then(
            result => {
                dispatch(userActions.setFofaUser(result))
            }
        ).catch(
            err => errorNotification("更新FOFA剩余积分", err)
        )
    }

    const exportData = async (page: number) => {
        setIsExporting(true)
        if (!props.id) {
            errorNotification("导出结果", QUERY_FIRST)
            setIsExporting(false)
            return
        }
        setDisable(true)
        // Export(props.id, page, pageSize)
        //     .then(r=>exportID.current = r)
        //     .catch(
        //         err => {
        //             errorNotification("导出结果", err)
        //             setIsExporting(false)
        //             setDisable(false)
        //         })
    }

    return <>
        <Button
            disabled={disable}
            size="small"
            onClick={() => setExportable(true)}
            icon={isExporting ? <LoadingOutlined /> : <CloudDownloadOutlined />}
        >
            {isExporting ? "正在导出" : "导出结果"}
        </Button>
        <Modal
            {...ExportDataPanelProps}
            title="导出结果"
            open={exportable}
            onOk={async () => {
                if ((maxPage === 0) || (maxPage > 0 && (maxPage < pageNum || pageNum <= 0))) {
                    setStatus("error")
                    return
                } else {
                    setStatus("")
                }
                setExportable(false)
                exportData(pageNum)
            }}
            onCancel={() => {
                setExportable(false);
                setStatus("")
            }}
        >
            {/*<div style={{ display: 'flex', flexDirection: 'column', gap: "5px" }}>*/}

            {/*    <span style={{*/}
            {/*        display: 'flex',*/}
            {/*        flexDirection: "row",*/}
            {/*        gap: "10px",*/}
            {/*        backgroundColor: '#f3f3f3',*/}
            {/*        width: "100%"*/}
            {/*    }}>当前F点: <label style={{ color: "red" }}>{user.fofa_point}</label></span>*/}
            {/*    <Form layout="inline" size='small'>*/}
            {/*        <Form.Item label={"导出分页大小"}>*/}
            {/*            <Select*/}
            {/*                style={{ width: '80px' }}*/}
            {/*                defaultValue={pageSize}*/}
            {/*                options={pageSizeOptions.map(size => ({ label: size.toString(), value: size }))}*/}
            {/*                onChange={(size) => {*/}
            {/*                    setPageSize(size)*/}
            {/*                }}*/}
            {/*            />*/}
            {/*        </Form.Item>*/}
            {/*        <Form.Item label={`导出页数(max:${maxPage})`}>*/}
            {/*            <InputNumber*/}
            {/*                status={status}*/}
            {/*                min={0}*/}
            {/*                value={pageNum}*/}
            {/*                onChange={(value: number | null) => {*/}
            {/*                    if (value != null) {*/}
            {/*                        if (value > maxPage) {*/}
            {/*                            setPageNum(maxPage)*/}
            {/*                        } else {*/}
            {/*                            setPageNum(value)*/}
            {/*                        }*/}
            {/*                    }*/}
            {/*                }}*/}
            {/*                keyboard={true}*/}
            {/*            />*/}
            {/*        </Form.Item>*/}
            {/*    </Form>*/}
            {/*</div>*/}
        </Modal></>
}


type PageDataType = WithIndex<properties.General>

const pageSizeOptions = [100]

interface TabContentProps {
    colDefs?: ColDef[] | undefined | null,
    input?: string,
    full?: boolean,//全量搜索
    newTab?: (input: string, colDef: ColDef[] | undefined | null) => void
}

class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
        const flag = `<img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/flags/${params.data.code}.png">`;

        const eTemp = document.createElement("div");
        eTemp.innerHTML = `<span style="cursor: default;">${flag} ${params.value}</span>`;
        this.eGui = eTemp.firstElementChild as HTMLElement;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

const HTTPDetailView = (props:{http:properties.HTTP})=>{
    const LabelCss:CSSProperties = {
        display:'inline-block',
        whiteSpace: 'nowrap',
        marginRight: '5px',
        width: '100px',
    }
    const title_hash = props.http?.title_hash
    const headers_hash =props.http?.headers_hash
    const dom_hash =props.http?.dom_hash
    const favicon_data =props.http?.favicon?.data
    const favicon_hash =props.http?.favicon?.hash
    return <table style={{
        padding: "10px",
        borderRadius: '10px',
        boxShadow: 'rgba(0,0,0, 0.3) 0px 5px 30px', // 添加边框阴影
        backgroundColor: 'rgba(255, 255, 255,1)', /* 设置背景颜色和透明度 */
        maxHeight: '400px',
        maxWidth: '600px',
        overflow: 'auto',
    }}>
        <tbody>
        <tr>
            <td>Title</td><td>{props.http?.title}</td>
        </tr>
        <tr>
            <td>TitleHash</td><td>{title_hash}</td>
        </tr>
        <tr>
            <td>HeadersHash</td><td>{headers_hash}</td>
        </tr>
        <tr>
            <td>DOMHash</td><td>{dom_hash}</td>
        </tr>
        <tr>
            <td>FaviconHash</td><td>{favicon_hash}</td>
        </tr>
        <tr>
            <td>Components</td><td>{props.http?.components && Object.keys(props.http.components).join(" | ")}</td>
        </tr>
        </tbody>
    </table>
}

const TabContent: React.FC<TabContentProps> = (props) => {
    const [input, setInput] = useState<string>(props.input || "")
    const [inputCache, setInputCache] = useState<string>(input)
    const [loading, setLoading] = useState<boolean>(false)
    const [loading2, setLoading2] = useState<boolean>(false)
    const pageIDMap = useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const [clicked, setClicked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [faviconUrl, setFaviconUrl] = useState("");
    const dispatch = useDispatch()
    const allowEnterPress = useSelector((state: RootState) => state.app.global.config?.QueryOnEnter.Assets)
    const history = useSelector((state: RootState) => state.app.global.history)
    const [pageData, setPageData] = useState<PageDataType[]>([]);
    const [columnDefs] = useState<ColDef[]>(props.colDefs || [
        { headerName: '序号', field: "index", width: 80,pinned: "left"},
        { headerName: 'IP', field: "ip_str", width: 150,pinned: "left", tooltipField: 'ip_str',},
        { headerName: '端口', field: "port", width: 80,pinned: "left", tooltipField: 'port',},
        { headerName: '标题', field: "http", width: 200,
            valueFormatter:(params:ValueFormatterParams)=> params.value?.title,
            tooltipField: "http",
            tooltipComponent: (params: CustomTooltipProps ) =>{
                if (params.value){
                    return <HTTPDetailView http={params.value}/>
                }
            },
            cellRenderer:(params:ICellRendererParams)=><>{params.value?.title}</>,
        },
        { headerName: '响应体Hash', field: "hash", width: 150,tooltipField: "data",
            tooltipComponent: (params: CustomTooltipProps ) =>{
                if (params.value){
                    return <pre style={{
                        padding: "10px",
                        borderRadius: '10px',
                        boxShadow: 'rgba(0,0,0, 0.3) 0px 5px 30px', // 添加边框阴影
                        backgroundColor: 'rgba(255, 255, 255,1)', /* 设置背景颜色和透明度 */
                        maxHeight: '400px',
                        maxWidth: '600px',
                        overflow: 'auto',
                    }}>
                        <code>{params.value}</code>
                    </pre>
                }
            },
            cellRenderer:(params:ICellRendererParams)=><Space size={5}><FileTextOutlined />{params.value}</Space>,
        },
        { headerName: '子域名', field: "hostnames", width: 80,
            valueFormatter:(params:ValueFormatterParams)=>params.value && Object.keys(params.value).join(","),
            tooltipField: "hostnames",
            tooltipComponent: (params: CustomTooltipProps ) =>{
                return <Flex vertical style={{
                    padding: "10px",
                    borderRadius: '10px',
                    boxShadow: 'rgba(0,0,0, 0.3) 0px 5px 30px', // 添加边框阴影
                    backgroundColor: 'rgba(255, 255, 255,1)', /* 设置背景颜色和透明度 */
                    maxHeight: '200px',
                    maxWidth: '600px',
                    overflow: 'auto'
                }} gap={5}>
                    {params.value?.map((name:string)=>{
                        return <span key={name}>{name}</span>
                    })}
                </Flex>
            },
            cellRenderer:(params:ICellRendererParams)=>params.value?.length > 0 && <Space size={5}><GlobalOutlined />{params.value.length}</Space>,
        },
        { headerName: '域名', field: "domains", width: 80,
            valueFormatter:(params:ValueFormatterParams)=>params.value && Object.keys(params.value).join(","),
            tooltipField: "domains",
            tooltipComponent: (params: CustomTooltipProps ) =>{
                return <Flex vertical style={{
                    padding: "10px",
                    borderRadius: '10px',
                    boxShadow: 'rgba(0,0,0, 0.3) 0px 5px 30px', // 添加边框阴影
                    backgroundColor: 'rgba(255, 255, 255,1)', /* 设置背景颜色和透明度 */
                    maxHeight: '200px',
                    maxWidth: '600px',
                    overflow: 'auto'
                }} gap={5}>
                    {params.value?.map((name:string)=>{
                        return <span key={name}>{name}</span>
                    })}
                </Flex>
            },
            cellRenderer:(params:ICellRendererParams)=>params.value?.length > 0 && <Space size={5}><GlobalOutlined />{params.value.length}</Space>,
        },
        { headerName: '漏洞', field: "vulns", width: 80,
            valueFormatter:(params:ValueFormatterParams)=>params.value && Object.keys(params.value).join(" "),
            tooltipField: "vulns",
            tooltipComponent: (params: CustomTooltipProps ) =>{
                if (params.value){
                    const keys = Object.keys(params.value)
                    return <div  style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: "5px",
                        borderRadius: '10px',
                        boxSizing: 'content-box',
                        boxShadow: 'rgba(0,0,0, 0.3) 0px 5px 30px', // 添加边框阴影
                        backgroundColor: 'rgba(241, 241, 241,1)', /* 设置背景颜色和透明度 */
                        maxHeight: '200px',
                        maxWidth: '600px',
                        overflow: 'auto'
                    }} >
                        {keys.map(name=>{
                            return <span style={{whiteSpace: 'nowrap'}} key={name}>{name}</span>
                        })}
                    </div>
                }
            },
            cellRenderer:(params:ICellRendererParams)=>params.value && Object.keys(params.value).length > 0 && <Space size={5}><BugOutlined />{Object.keys(params.value).length}</Space>,
        },
        { headerName: '标签', field: "tags", width: 80, tooltipField: 'tags',},
        { headerName: '地理位置', field: "location", width: 100,
            valueFormatter:(params:ValueFormatterParams)=> params.value && `${params.value?.country_code} ${params.value?.city}`,
            tooltipValueGetter:(params:ITooltipParams)=> params.value && `${params.value?.country_name} ${params.value?.city}`,
        },
        { headerName: 'ASN', field: "asn", width: 110, tooltipField: 'asn',},
        { headerName: '运营商', field: "isp", width: 120, tooltipField: 'isp',},
        { headerName: '组织', field: "org", width: 120, tooltipField: 'org',},
        { headerName: '更新时间', field: "timestamp", width: 200, pinned: "right", tooltipField: 'timestamp',},
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
    const defaultSideBarDef = useMemo<SideBarDef>(() => {
        return {
            toolPanels: [
                {
                    id: "columns",
                    labelDefault: "表格字段",
                    labelKey: "columns",
                    iconKey: "columns",
                    toolPanel: "agColumnsToolPanel",
                    toolPanelParams: {
                        suppressRowGroups: false,
                        suppressValues: false,
                        suppressPivots: true,
                        suppressPivotMode: true,
                        suppressColumnFilter: false,
                        suppressColumnSelectAll: true,
                        suppressColumnExpandAll: true,
                        suppressCellSelection: true
                    },
                },
            ],
        }
    }, [])
    const gridRef = useRef<AgGridReact>(null)
    const getContextMenuItems = useCallback((params: GetContextMenuItemsParams):any => {
        if(!pageData || pageData.length === 0 || !params.node)return []
        // return [
        //     {
        //         name: "浏览器打开URL",
        //         disabled: !params.node?.data.link,
        //         action: () => {
        //             props.newTab && BrowserOpenURL(params.node?.data.link)
        //         },
        //     },
        //     {
        //         name: "查询C段",
        //         disabled: !params.node?.data.ip,
        //         action: () => {
        //             props.newTab && props.newTab("ip=" + params.node?.data.ip + "/24", getColDefs())
        //         },
        //     },
        //     {
        //         name: "查询IP",
        //         disabled: !params.node?.data.ip,
        //         action: () => {
        //             props.newTab && props.newTab("ip=" + params.node?.data.ip, getColDefs())
        //         },
        //     },
        //     {
        //         name: "查询标题",
        //         disabled: !params.node?.data.title,
        //         action: () => {
        //             props.newTab && props.newTab("title=" + params.node?.data.title, getColDefs())
        //         },
        //     },
        //     "separator",
        //     {
        //         name: "复制单元格",
        //         disabled: !params.value,
        //         action: () => {
        //             copy(params.value)
        //         },
        //     },
        //     {
        //         name: "复制该行",
        //         disabled: !params.node?.data,
        //         action: () => {
        //             const data:PageDataType = params.node?.data
        //             const values:any[] = [];
        //             getAllDisplayedColumnKeys(gridRef.current?.api, columnDefs).forEach(key=>{
        //                 values.push(data[key as keyof PageDataType]);
        //             })
        //             copy(values.join(gridRef.current?.api.getGridOption("clipboardDelimiter")))
        //         },
        //     },
        //     {
        //         name: "复制该列",
        //         action: () => {
        //             const colValues = getSortedData<PageDataType>(gridRef.current?.api).map((item: PageDataType) => {
        //                 return item[params.column?.getColId() as keyof PageDataType]
        //             })
        //             copy(colValues.join('\n'))
        //         },
        //     },
        //     {
        //         name: "复制URL列",
        //         disabled: !params.node?.data.ip,
        //         action: () => {
        //             const colValues = getSortedData<PageDataType>(gridRef.current?.api).map((item: PageDataType) => {
        //                 return item['link']
        //             })
        //             copy(colValues)
        //         },
        //     },
        // ];
    },[pageData]);

    useEffect(() => {
        if (props.input) {
            setInput(props.input)
            handleNewQuery(props.input, currentPageSize)
        }
        // const t = shodanData.matches as unknown as PageDataType[]
        // setPageData(t)
    }, [])

    const getColDefs = () => {
        if (gridRef.current?.api) {
            console.log(gridRef.current.api.getColumnDefs())
            return gridRef.current.api.getColumnDefs()
        }
        return columnDefs
    }

    const handleNewQuery = (query: string, pageSize: number) => {
        setPageData([])
        const t = query.trim()
        if (t === "") {
            return
        }
        setInputCache(t)
        setLoading(true)
        setTotal(0)
        setCurrentPage(1)
        pageIDMap.current = {}
        HostSearch(0, t, "", 1,false).then(
            (result) => {
                console.log(result)
                GetUserInfo().then(
                    r=>dispatch(userActions.setShodanUser(r))
                )
                let index = 0
                setPageData(result.matches.map(item => ({ index: ++index, ...item } as PageDataType)))
                setTotal(result.total)
                setLoading(false)
                pageIDMap.current[1] = result.pageID
            }
        ).catch(
            err => {
                errorNotification("Shodan查询出错", err)
                setLoading(false)
                setPageData([])
                return
            }
        )
    }

    const handlePaginationChange = async (newPage: number, newPageSize: number) => {
        //page发生变换，size使用原size
        if (newPage !== currentPage && newPageSize === currentPageSize) {
            setLoading(true)
            let pageID = pageIDMap.current[newPage]
            pageID = pageID ? pageID : 0
            HostSearch(pageID, inputCache, "", newPage,false).then(
                (result) => {
                    GetUserInfo().then(
                        r=>dispatch(userActions.setShodanUser(r))
                    )
                    let index = (newPage - 1) * currentPageSize
                    setPageData(result.matches.map(item => ({ index: ++index, ...item } as PageDataType)))
                    setTotal(result.total)
                    setCurrentPage(newPage)
                    setLoading(false)
                    pageIDMap.current[newPage] = result.pageID
                }
            ).catch(
                err => {
                    errorNotification("Shodan查询出错", err)
                    setLoading(false)
                    return
                }
            )
        }

        //size发生变换，page设为1
        if (newPageSize !== currentPageSize) {
            setCurrentPageSize(newPageSize)
            handleNewQuery(inputCache, newPageSize)
        }
    }


    const footer = (
        <Flex justify={"space-between"} align={'center'} style={{ padding: '5px' }}>
            <Pagination
                showQuickJumper
                showSizeChanger
                total={total}
                pageSizeOptions={pageSizeOptions}
                defaultPageSize={pageSizeOptions[0]}
                defaultCurrent={1}
                current={currentPage}
                showTotal={(total) => `${total} items`}
                size="small"
                onChange={(page, size) => handlePaginationChange(page, size)}
            />
            {/*<ExportDataPanel id={pageIDMap.current[1]} total={total} currentPageSize={currentPageSize} />*/}
        </Flex>)

    return <Flex vertical gap={5} style={{ height: '100%' }}>
        <Flex justify={"center"} align={'center'}>
            <Candidate<string>
                size={"small"}
                style={{ width: 600 }}
                placeholder='Search...'
                allowClear
                value={input}
                onSearch={(value) => handleNewQuery(value, currentPageSize)}
                onPressEnter={(value) => {
                    if (!allowEnterPress) return
                    handleNewQuery(value, currentPageSize)
                }}
                items={[
                    {
                        onSelectItem: (item) => {
                            setInput(item.data)
                        },
                        fetch: async (v) => {
                            try {
                                // @ts-ignore
                                const response = await FindByPartialKey(history.Shodan, !v ? "" : v.toString());
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
            />
        </Flex>
        <div style={{width: "100%", height: "100%"}}>
            <Flex vertical style={{width: "100%", height: "100%"}}>
                <AgGridReact
                    ref={gridRef}
                    embedFullWidthRows
                    loading={loading}
                    rowData={pageData}
                    columnDefs={columnDefs}
                    getContextMenuItems={getContextMenuItems}
                    sideBar={defaultSideBarDef}
                    headerHeight={32}
                    rowHeight={40}
                    defaultColDef={defaultColDef}
                    noRowsOverlayComponent={() => <NotFound />}
                    loadingOverlayComponent={() => <Loading />}
                    cellSelection={true}
                    tooltipInteraction={true}
                    tooltipShowDelay={0}
                    // isFullWidthRow={()=>true}
                    // fullWidthCellRenderer={fullWidthCellRenderer}
                    // getRowHeight={()=>200}
                    // autoSizeStrategy={{
                    //     type:'fitGridWidth'
                    // }}
                />
                {footer}
            </Flex>
        </div>

    </Flex>
}

const Shodan = () => {
    const [activeKey, setActiveKey] = useState<string>("")
    const [items, setItems] = useState<Tab[]>([])
    const indexRef = useRef(1)

    useEffect(() => {
        const key = `${indexRef.current}`;
        setItems([{
            label: <TabLabel label={key} />,
            key: key,
            children: <TabContent newTab={addTab} />,
            // children:<GridExample></GridExample>
        }])
        setActiveKey(key)
    }, [])

    const onTabChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey)
    };

    const addTab = (input: string, colDef: ColDef[] | undefined | null) => {
        const newActiveKey = `${++indexRef.current}`;
        setActiveKey(newActiveKey)
        setItems(prevState => [
            ...prevState,
            {
                label: <TabLabel label={newActiveKey} />,
                key: newActiveKey,
                children: <TabContent
                    colDefs={colDef}
                    input={input}
                    newTab={addTab}
                />,
            },
        ])
    };

    const removeTab = (targetKey: TargetKey) => {
        const t = items.filter((item) => item.key !== targetKey);
        const newActiveKey = t.length && activeKey === targetKey ? t[t.length - 1]?.key : activeKey
        setItems(t)
        setActiveKey(newActiveKey)
    };

    const onEditTab = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            addTab("", null);
        } else {
            removeTab(targetKey);
        }
    };

    return (
        <Tabs
            style={{ height: '100%', width: '100%' }}
            size="small"
            tabBarExtraContent={{
                left: <UserPanel />
            }}
            type="editable-card"
            onChange={onTabChange}
            activeKey={activeKey}
            onEdit={onEditTab}
            items={items}
        />
    );
}

export default Shodan;