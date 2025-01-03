import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Flex,
    Input,
    InputNumber,
    Modal,
    Pagination,
    Popover,
    Row,
    Select,
    Space,
    Spin,
    Switch,
    Tabs,
    Tooltip,
    Upload
} from 'antd';
import {
    CloudDownloadOutlined,
    ExclamationCircleOutlined,
    InboxOutlined,
    LoadingOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import { errorNotification } from '@/component/Notification';
import { RootState, appActions, userActions } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import PointBuy from "@/assets/images/point-buy.svg"
import { ExportDataPanelProps } from './Props';
import { buttonProps } from './Setting';
import { copy, RangePresets } from '@/util/util';
import { config, hunter } from "../../wailsjs/go/models";
import { Export, GetRestToken, Query, SetAuth } from "../../wailsjs/go/hunter/Bridge";
import { BrowserOpenURL, EventsOn } from "../../wailsjs/runtime";
import type { Tab } from 'rc-tabs/lib/interface';
import { Dots } from "@/component/Icon";
import { md5 } from "js-md5"
import { Fetch } from "../../wailsjs/go/app/App";
import { toUint8Array } from "js-base64";
import { WithIndex } from "@/component/Interface";
import TabLabel from "@/component/TabLabel";
import { TargetKey } from "@/pages/Constants";
import Candidate, { ItemType } from "@/component/Candidate";
import { FindByPartialKey } from "../../wailsjs/go/history/Bridge";
import { AgGridReact } from "ag-grid-react";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import { ColDef, GetContextMenuItemsParams, ICellRendererParams, MenuItemDef, SideBarDef } from "ag-grid-community";
import Help from "@/pages/HunterUsage";

const pageSizeOptions = [10, 20, 50, 100]

const defaultQueryOption: QueryOptions = {
    isWeb: 3,
    statusCode: "",
    portFilter: false,
    dateRange: []
}

interface TabContentProps {
    colDefs?: ColDef[] | undefined | null,
    input?: string,
    newTab?: (input: string, colDefs: ColDef[] | undefined | null, opts: QueryOptions) => void,
    queryOption?: QueryOptions
}

type PageDataType = WithIndex<hunter.Item>

interface QueryOptions {
    isWeb: 1 | 2 | 3;
    statusCode: string;
    portFilter: boolean;
    dateRange: string[]
}

const AuthSetting: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config || new config.Config())
    const [key, setKey] = useState("")

    useEffect(() => {
        setKey(cfg.Hunter.token)
    }, [cfg.Hunter])

    const save = () => {
        SetAuth(key).then(
            () => {
                const t = { ...cfg, Hunter: { ...cfg.Hunter, token: key } } as config.Config;
                dispatch(appActions.setConfig(t))
                setOpen(false)
                setEditable(false)
            }
        ).catch(
            err => {
                errorNotification("错误", err)
                setKey(cfg.Hunter.token)
            }
        )
    }

    const cancel = () => {
        setEditable(false);
        setOpen(false)
        setKey(cfg.Hunter.token)
    }

    return <>
        <Tooltip title="设置" placement={"right"}>
            <Button type='link' onClick={() => setOpen(true)}><UserOutlined /></Button>
        </Tooltip>
        <Modal
            open={open}
            onCancel={() => setOpen(false)}
            onOk={() => {
                setOpen(false)
            }}
            footer={null}
            closeIcon={null}
            width={420}
            destroyOnClose
            getContainer={false}
        >
            <Flex vertical gap={10}>
                <Input.Password value={key} placeholder="token" onChange={
                    e => {
                        if (!editable) return
                        setKey(e.target.value)
                    }
                } />
                <Flex gap={10} justify={"end"}>
                    {
                        !editable ?
                            <Button {...buttonProps} onClick={() => setEditable(true)}>修改</Button>
                            :
                            <>
                                <Button {...buttonProps} htmlType="submit"
                                    onClick={save}
                                >保存</Button>
                                <Button {...buttonProps} htmlType="submit"
                                    onClick={cancel}
                                >取消</Button>
                            </>
                    }
                </Flex>
            </Flex>
        </Modal>
    </>
}

const ExportDataPanel = (props: { id: number, total: number, currentPageSize: number }) => {
    const user = useSelector((state: RootState) => state.user.hunter)
    const [page, setPage] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(props.currentPageSize)
    const [maxPage, setMaxPage] = useState<number>(0)
    const [cost, setCost] = useState<number>(0)
    const [status, setStatus] = useState<"" | "error" | "warning">("")
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [exportable, setExportable] = useState<boolean>(false)
    const dispatch = useDispatch()
    const [disable, setDisable] = useState<boolean>(false)
    const event = useSelector((state: RootState) => state.app.global.event)

    const exportData = (page: number) => {
        setIsExporting(true)
        setDisable(true)
        Export(props.id, page, pageSize).then().catch(
            err => {
                errorNotification("错误", err)
                setIsExporting(false)
                setDisable(false)
            }
        )
    }
    useEffect(() => {
        EventsOn(String(event?.hasNewHunterDownloadItem), function () {
            setIsExporting(false)
            setDisable(false)
            GetRestToken().then(
                result => {
                    dispatch(userActions.setHunterUser({ restToken: result }))
                }
            )
        })
    }, []);
    useEffect(() => {
        const maxPage = Math.ceil(props.total / pageSize)
        setMaxPage(maxPage)
        if (page >= maxPage) {
            setPage(maxPage)
            setCost(props.total)
        } else {
            setCost(page * pageSize)
        }
    }, [pageSize, props.total])
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
            onOk={() => {
                if ((maxPage === 0) || (maxPage > 0 && (maxPage < page || page <= 0))) {
                    setStatus("error")
                    return
                } else {
                    setStatus("")
                }
                setExportable(false)
                exportData(page)
            }}
            onCancel={() => {
                setExportable(false);
                setStatus("")
            }}
        >
            <span style={{ display: 'grid', gap: "3px" }}>
                <Row>
                    <span style={{
                        display: 'flex',
                        flexDirection: "row",
                        gap: "10px",
                        backgroundColor: '#f3f3f3',
                        width: "100%"
                    }}>当前积分: <span style={{ color: "red" }}>{user.restToken}</span></span>
                </Row>
                <Row>
                    <Col span={10}>
                        <span>导出分页大小</span>
                    </Col>
                    <Col span={14}>
                        <Select
                            size='small'
                            style={{ width: '80px' }}
                            defaultValue={pageSize}
                            options={pageSizeOptions.map(size => ({ label: size.toString(), value: size }))}
                            onChange={(size) => {
                                setPageSize(size)
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={10}>
                        <span style={{ display: 'flex', whiteSpace: 'nowrap' }}>导出页数(max:{maxPage})</span>
                    </Col>
                    <Col span={14}>
                        <InputNumber
                            size='small'
                            status={status}
                            value={page}
                            min={0}
                            onChange={(value: number | null) => {
                                if (value) {
                                    if (value >= maxPage) {
                                        setPage(maxPage);
                                        setCost(props.total)
                                    } else {
                                        setCost(pageSize * value)
                                        setPage(value)
                                    }
                                }
                            }}
                            keyboard={true}
                        />=
                        <Input
                            style={{ width: '100px' }}
                            size='small'
                            value={cost}
                            suffix={"积分"}
                        />
                    </Col>
                </Row>
            </span>
        </Modal></>
}

const TabContent: React.FC<TabContentProps> = (props) => {
    const gridRef = useRef<AgGridReact>(null);
    const [input, setInput] = useState<string>(props.input || "")
    const [inputCache, setInputCache] = useState<string>(input)
    const [queryOption, setQueryOption] = useState<QueryOptions>(props.queryOption || defaultQueryOption)
    const [loading, setLoading] = useState<boolean>(false)
    const [loading2, setLoading2] = useState<boolean>(false)
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap = useRef<{ [key: number]: number }>({})
    const dispatch = useDispatch()
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const [clicked, setClicked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [faviconUrl, setFaviconUrl] = useState("");
    const allowEnterPress = useSelector((state: RootState) => state.app.global.config?.QueryOnEnter.assets)
    const event = useSelector((state: RootState) => state.app.global.event)
    const history = useSelector((state: RootState) => state.app.global.history)
    const [columnDefs] = useState<ColDef[]>(props.colDefs || [
        { headerName: '序号', field: "index", width: 80, pinned: 'left' },
        { headerName: 'URL', field: "url", width: 250, hide: true },
        { headerName: '域名', field: "domain", width: 200, pinned: 'left' },
        { headerName: 'IP', field: "ip", width: 150, },
        { headerName: '端口', field: "port", width: 80, },
        { headerName: '协议', field: "protocol", width: 80, },
        { headerName: '网站标题', field: "web_title", width: 200, },
        { headerName: '备案号', field: "number", width: 180, },
        { headerName: '备案单位', field: "company", width: 100, },
        { headerName: '响应码', field: "status_code", width: 80, },
        {
            headerName: '组件', field: "components", width: 100, cellRenderer: (params: ICellRendererParams) => {
                const tmp = params.data.component?.map((component: hunter.Component) => {
                    return component.name + component.version
                })
                return tmp?.join(" | ") || ""
            }
        },
        { headerName: '操作系统', field: "os", width: 100, hide: true },
        { headerName: '城市', field: "city", width: 100, hide: true },
        { headerName: '更新时间', field: "updated_at", width: 100, },
        { headerName: 'web应用', field: "is_web", width: 100, hide: true },
        { headerName: 'Banner', field: "banner", width: 100, hide: true },
        { headerName: '风险资产', field: "is_risk", width: 100, hide: true },
        { headerName: '注册机构', field: "as_org", width: 100, hide: true },
        { headerName: '运营商', field: "isp", width: 100, hide: true },
    ]);
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
                    },
                },
            ],
        }
    }, [])
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

    useEffect(() => {
        EventsOn(String(event?.hasNewHunterDownloadItem), function () {
            GetRestToken().then(
                result => {
                    dispatch(userActions.setHunterUser({ restToken: result }))
                }
            )
        })
        if (props.input) {
            handleNewQuery(input, currentPageSize)
        }
    }, [])

    const getContextMenuItems = useCallback(
        (
            params: GetContextMenuItemsParams,
        ): (MenuItemDef)[] => {
            let value: any
            if ('components' === params.column?.getColId()) {
                const tmp = params.node?.data.component?.map((component: hunter.Component) => {
                    return component.name + component.version
                })
                value = tmp?.join(" | ")
            } else {
                value = params.value
            }
            return [
                {
                    name: "浏览器打开URL",
                    disabled: !params.node?.data.url,
                    action: () => {
                        props.newTab && BrowserOpenURL(params.node?.data.url)
                    },
                },
                {
                    name: "查询C段",
                    disabled: !params.node?.data.ip,
                    action: () => {
                        props.newTab && props.newTab("ip=" + params.node?.data.ip + "/24", getColDefs(), queryOption)
                    },
                },
                {
                    name: "查询IP",
                    disabled: !params.node?.data.ip,
                    action: () => {
                        props.newTab && props.newTab("ip=" + params.node?.data.ip, getColDefs(), queryOption)
                    },
                },
                {
                    name: "查询标题",
                    disabled: !params.node?.data.web_title,
                    action: () => {
                        props.newTab && props.newTab("title=" + params.node?.data.title, getColDefs(), queryOption)
                    },
                },
                {
                    name: "复制单元格",
                    disabled: !value,
                    action: () => {
                        copy(value)
                    },
                },
                {
                    name: "复制该行",
                    disabled: !params.node?.data,
                    action: () => {
                        for (let i = 0; i < pageData.length; i++) {
                            if (pageData[i].index === params.node?.data.index) {
                                copy(pageData[i])
                                break
                            }
                        }
                    },
                },
                {
                    name: "复制该列",
                    action: () => {
                        const colId = params.column?.getColId()
                        const colValues = pageData.map((item: PageDataType) => {
                            for (const key in item) {
                                if (Object.prototype.hasOwnProperty.call(item, key)) {
                                    if ('components' === colId) {
                                        const tmp = item.component?.map((component: hunter.Component) => {
                                            return component.name + component.version
                                        })
                                        return tmp?.join(" | ") || ""
                                    } else if (key === colId) {
                                        return item[key as keyof PageDataType]
                                    }
                                }
                            }
                            return ""
                        })
                        copy(colValues)
                    },
                },
                {
                    name: "复制URL列",
                    disabled: !params.node?.data.ip,
                    action: () => {
                        const colValues = pageData.map(item => {
                            for (const key in item) {
                                if (Object.prototype.hasOwnProperty.call(item, key) && key === 'url') {
                                    return item[key as keyof PageDataType]
                                }
                            }
                            return null
                        })
                        copy(colValues)
                    },
                },
            ]
        }, [pageData, queryOption]);

    const getColDefs = () => {
        if (gridRef.current?.api) {
            console.log(gridRef.current.api.getColumnDefs())
            return gridRef.current.api.getColumnDefs()
        }
        return columnDefs
    }

    const handleNewQuery = async (query: string, pageSize: number) => {
        const tmpInput = query.trim()
        setCurrentPageSize(pageSize)
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)
        setLoading(true)
        setCurrentPage(1)
        setTotal(0)
        pageIDMap.current = []
        Query(0, tmpInput, 1, pageSize, queryOption.dateRange[0] ? queryOption.dateRange[0] : "", queryOption.dateRange[1] ? queryOption.dateRange[1] : "", queryOption.isWeb, queryOption.statusCode, queryOption.portFilter).then(
            result => {
                let index = 0
                setPageData(result.items?.map((item) => {
                    const instance = new hunter.Item(item)
                    const { convertValues, ...reset } = instance
                    return { index: ++index, ...item, convertValues, ...reset }
                }))
                setTotal(result.total)
                setLoading(false)
                pageIDMap.current[1] = result.taskID
                dispatch(userActions.setHunterUser({
                    restToken: result.restQuota
                }))
            }
        ).catch(
            err => {
                errorNotification("Hunter查询出错", err)
                setLoading(false)
                setPageData([])
            }
        )
    }

    const handlePaginationChange = async (newPage: number, newSize: number) => {
        //page发生变换，size使用原size
        if (newPage !== currentPage && newSize === currentPageSize) {
            setLoading(true)
            let pageID = pageIDMap.current[newPage]
            pageID = pageID ? pageID : 0
            Query(pageID, inputCache, newPage, currentPageSize, queryOption.dateRange[0] ? queryOption.dateRange[0] : "", queryOption.dateRange[1] ? queryOption.dateRange[1] : "", queryOption.isWeb, queryOption.statusCode, queryOption.portFilter).then(
                result => {
                    let index = (newPage - 1) * currentPageSize
                    setPageData(result.items.map(item => {
                        const instance = new hunter.Item(item)
                        const { convertValues, ...rest } = instance
                        return { index: ++index, ...rest, convertValues }
                    }))
                    setCurrentPage(newPage)
                    setTotal(result.total)
                    pageIDMap.current[newPage] = result.taskID
                    dispatch(userActions.setHunterUser({
                        restToken: result.restQuota
                    }))
                    setLoading(false)
                }
            ).catch(
                err => {
                    errorNotification("Hunter查询出错", err)
                    setLoading(false)
                }
            )
        }

        //size发生变换，page设为1
        if (newSize !== currentPageSize) {
            handleNewQuery(inputCache, newSize)
        }
    }

    const hide = () => {
        setClicked(false);
        setHovered(false);
    };

    const handleHoverChange = (open: boolean) => {
        setHovered(open);
        setClicked(false);
    };

    const handleClickChange = (open: boolean) => {
        setHovered(false);
        setClicked(open);
    };

    const getFaviconFromUrl = () => {
        if (!faviconUrl) {
            return
        }
        setLoading2(true)
        Fetch(faviconUrl)
            .then(data => {
                // @ts-ignore
                queryIconHash(toUint8Array(data).buffer)
            })
            .catch(error => {
                errorNotification("获取favicon出现错误", error);
            }).finally(() => {
                setLoading2(false)
            })

    }

    const queryIconHash = (iconArrayBuffer: string | ArrayBuffer | null | undefined) => {
        if (iconArrayBuffer instanceof ArrayBuffer) {
            const hash = md5(iconArrayBuffer)
            setInput(`web.icon="${hash}"`)
            handleNewQuery(`web.icon="${hash}"`, currentPageSize)
            hide()
        }
    }

    const iconSearchView = (
        <Popover
            placement={"bottom"}
            style={{ width: 500 }}
            content={<Button size={"small"} type={"text"}
                onClick={() => handleClickChange(true)}>icon查询</Button>}
            trigger="hover"
            open={hovered}
            onOpenChange={handleHoverChange}
        >
            <Popover
                placement={"bottom"}
                title={"填入Icon URL或上传文件"}
                content={
                    <Spin spinning={loading2}>
                        <Flex vertical gap={5} style={{ width: "600px" }}>
                            <Input
                                onChange={e => setFaviconUrl(e.target.value)}
                                size={"small"}
                                placeholder={"icon地址"}
                                suffix={<Button type='text' size="small" icon={<SearchOutlined />}
                                    onClick={getFaviconFromUrl} />}
                            />
                            <Upload.Dragger
                                showUploadList={false}
                                multiple={false}
                                customRequest={(options) => {
                                    const { file, onError } = options;
                                    ;
                                    if (file instanceof Blob) {
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            const arrayBuffer = e.target?.result;
                                            queryIconHash(arrayBuffer)
                                        };
                                        reader.readAsArrayBuffer(file);
                                    }
                                }
                                }
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-hint">
                                    点击或拖拽文件
                                </p>
                            </Upload.Dragger>
                        </Flex>
                    </Spin>
                }
                trigger="click"
                open={clicked}
                onOpenChange={handleClickChange}
            >
                <Button size={"small"} type={"text"} icon={<Dots />} />
            </Popover>
        </Popover>
    )

    const footer = <Flex justify={"space-between"} align={'center'} style={{ padding: '5px' }}>
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
        <ExportDataPanel id={pageIDMap.current[1]} total={total}
            currentPageSize={currentPageSize} />
    </Flex>

    return <Flex vertical gap={5} style={{ height: '100%' }}>
        <Flex vertical gap={5}>
            <Flex justify={"center"} align={'center'}>
                <Candidate
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
                                    const response = await FindByPartialKey(history.hunter, !v ? "" : v.toString());
                                    const a: ItemType[] = response?.map(item => {
                                        const t: ItemType = {
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
                {iconSearchView}
                <Help />
            </Flex>
            <Flex justify={"center"} align={'center'} gap={10}>
                <Flex gap={5} align={'center'}>
                    资产类型
                    <Select size="small"
                        style={{ width: "110px" }}
                        defaultValue={3 as 1 | 2 | 3}
                        options={[{ label: "web资产", value: 1 }, { label: "非web资产", value: 2 }, { label: "全部", value: 3 }]}
                        onChange={(value) => setQueryOption(prevState => ({ ...prevState, isWeb: value }))} />
                </Flex>
                <DatePicker.RangePicker
                    presets={[
                        ...RangePresets,
                    ]}
                    style={{ width: "230px" }}
                    size="small"
                    onChange={(_dates, dateStrings) => setQueryOption(prevState => ({ ...prevState, dateRange: dateStrings }))}
                    allowEmpty={[true, true]}
                    showNow
                />
                <Input style={{ width: "300px" }} size="small" placeholder='状态码列表，以逗号分隔，如”200,401“'
                    onChange={(e) => setQueryOption(prevState => ({ ...prevState, statusCode: e.target.value }))} />
                <Flex gap={5} align={'center'}>
                    数据过滤
                    <Switch size="small" checkedChildren="开启" unCheckedChildren="关闭" onChange={(value) => setQueryOption(prevState => ({ ...prevState, portFilter: value }))} />
                </Flex>
            </Flex>
        </Flex>
        <div style={{ width: "100%", height: "100%" }}>
            <AgGridReact
                ref={gridRef}
                loading={loading}
                embedFullWidthRows
                rowData={pageData}
                columnDefs={columnDefs}
                getContextMenuItems={getContextMenuItems}
                sideBar={defaultSideBarDef}
                headerHeight={32}
                rowHeight={32}
                defaultColDef={defaultColDef}
                noRowsOverlayComponent={() => <NotFound />}
                loadingOverlayComponent={() => <Loading />}
            />
        </div>
        {footer}
    </Flex>
}

const UserPanel = () => {
    const user = useSelector((state: RootState) => state.user.hunter)
    return <div style={{
        width: "auto",
        height: "23px",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f1f3f4"
    }}>
        <AuthSetting />
        <Divider type="vertical" />
        <Space>
            <Tooltip title="剩余总积分">
                <div style={{
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    color: "#f5222d"
                }}>
                    <img src={PointBuy} />
                    {user.restToken}
                </div>
            </Tooltip>
            <Tooltip title="查询后自动获取">
                <Button size="small" shape="circle" type="text" icon={<ExclamationCircleOutlined />} />
            </Tooltip>
        </Space>
    </div>
}

const Hunter = () => {
    const [activeKey, setActiveKey] = useState<string>("")
    const [items, setItems] = useState<Tab[]>([])
    const indexRef = useRef(1)

    useEffect(() => {
        const key = `${indexRef.current}`;
        setItems([{
            label: <TabLabel label={key} />,
            key: key,
            children: <TabContent newTab={addTab} />,
        }])
        setActiveKey(key)
    }, [])

    const onTabChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey)
    };

    const addTab = (input: string, colDefs: ColDef[] | undefined | null, opts: QueryOptions) => {
        const newActiveKey = `${++indexRef.current}`;
        setActiveKey(newActiveKey)
        setItems(prevState => [
            ...prevState,
            {
                label: <TabLabel label={newActiveKey} />,
                key: newActiveKey,
                children: <TabContent input={input} colDefs={colDefs} newTab={addTab} queryOption={opts} />,
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
            addTab("", null, defaultQueryOption);
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

export default Hunter;