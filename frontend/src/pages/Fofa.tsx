import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    Radio
} from 'antd';
import {
    CloudDownloadOutlined,
    InboxOutlined,
    LoadingOutlined,
    SearchOutlined,
    SyncOutlined,
    UserOutlined
} from '@ant-design/icons';
import { errorNotification } from '@/component/Notification';
import { QUERY_FIRST } from '@/component/type';
import { RootState, appActions, userActions } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import PointBuy from "@/assets/images/point-buy.svg"
import PointFree from "@/assets/images/point-free.svg"
import { ExportDataPanelProps } from './Props';
import { buttonProps } from './Setting';
import { config, fofa } from "../../wailsjs/go/models";
import { Export, GetUserInfo, Query, SetAuth } from "../../wailsjs/go/fofa/Bridge";
import { BrowserOpenURL, EventsOn } from "../../wailsjs/runtime";
import { Dots } from "@/component/Icon";
import MurmurHash3 from "murmurhash3js"
import { Buffer } from "buffer"
import { Fetch } from "../../wailsjs/go/app/App";
import { toUint8Array } from "js-base64";
import { copy } from "@/util/util";
import { WithIndex } from "@/component/Interface";
import { TargetKey } from "@/pages/Constants";
import TabLabel from "@/component/TabLabel";
import type { Tab } from "rc-tabs/lib/interface"
import Candidate, { ItemType } from "@/component/Candidate";
import { FindByPartialKey } from "../../wailsjs/go/history/Bridge";
import '@/pages/Fofa.css'
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import Help from "@/pages/FofaUsage";
import {
    ColDef,
    GetContextMenuItemsParams,
    SideBarDef
} from "ag-grid-community";
import FofaStatisticalAggregation from "@/pages/FofaStatisticalAggregation";

const AuthSetting: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config || new config.Config())
    const [key, setKey] = useState("")

    useEffect(() => {
        setKey(cfg.Fofa.token)
    }, [cfg.Fofa])


    const save = () => {
        SetAuth(key).then(
            () => {
                const t = { ...cfg, Fofa: { ...cfg.Fofa, token: key } } as config.Config;
                dispatch(appActions.setConfig(t))
                setOpen(false)
                setEditable(false)
            }
        ).catch(
            err => {
                errorNotification("错误", err)
                setKey(cfg.Fofa.token)
            }
        )
    }

    const cancel = () => {
        setEditable(false);
        setOpen(false)
        setKey(cfg.Fofa.token)
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

const UserPanel = () => {
    const [spin, setSpin] = useState<boolean>(false)
    const dispatch = useDispatch()
    const user = useSelector((store: RootState) => store.user.fofa)

    useEffect(() => {
        updateRestToken()
    }, []);

    const updateRestToken = async () => {
        try {
            dispatch(userActions.setFofaUser(await GetUserInfo()))
        } catch (err) {
            errorNotification("Fofa用户信息", err)
        }
    }

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
            <Tooltip title="F币">
                <div style={{
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    color: "#f5222d"
                }}>
                    <img src={PointFree} />
                    {user.fcoin}
                </div>
            </Tooltip>
            <Tooltip title="F点">
                <div style={{
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    color: "#f5222d"
                }}>
                    <img src={PointBuy} />
                    {user.fofa_point}
                </div>
            </Tooltip>
            <Tooltip title="刷新余额">
                <Button size="small" shape="circle" type="text" icon={<SyncOutlined spin={spin}
                    onClick={async () => {
                        setSpin(true)
                        await updateRestToken()
                        setSpin(false)
                    }}
                />}></Button>
            </Tooltip>
        </Space>
    </div>
}

const ExportDataPanel = (props: { id: number; total: number; currentPageSize: number, }) => {
    const user = useSelector((state: RootState) => state.user.fofa)
    const [page, setPage] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(props.currentPageSize)
    const [status, setStatus] = useState<"" | "error" | "warning">("")
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [exportable, setExportable] = useState<boolean>(false)
    const [maxPage, setMaxPage] = useState<number>(0)
    const [disable, setDisable] = useState<boolean>(false)
    const dispatch = useDispatch()
    const event = useSelector((state: RootState) => state.app.global.event)

    useEffect(() => {
        EventsOn(String(event?.hasNewFofaDownloadItem), () => {
            updateRestToken()
            setIsExporting(false)
            setDisable(false)
        })
    }, []);

    useEffect(() => {
        const maxPage = Math.ceil(props.total / pageSize)
        setMaxPage(maxPage)
        if (page > maxPage) {
            setPage(maxPage)
        }
    }, [pageSize, props.total])

    useEffect(() => {
        if (page > maxPage) {
            setPage(maxPage)
        }
    }, [page])

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
        Export(Number(props.id), page, pageSize).catch(
            err => {
                errorNotification("导出结果", err)
                setIsExporting(false)
                setDisable(false)
            }
        )
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: "5px" }}>

                <span style={{
                    display: 'flex',
                    flexDirection: "row",
                    gap: "10px",
                    backgroundColor: '#f3f3f3',
                    width: "100%"
                }}>当前F点: <label style={{ color: "red" }}>{user.fofa_point}</label></span>
                <Form layout="inline" size='small'>
                    <Form.Item label={"导出分页大小"}>
                        <Select
                            style={{ width: '80px' }}
                            defaultValue={pageSize}
                            options={pageSizeOptions.map(size => ({ label: size.toString(), value: size }))}
                            onChange={(size) => {
                                setPageSize(size)
                            }}
                        />
                    </Form.Item>
                    <Form.Item label={`导出页数(max:${maxPage})`}>
                        <InputNumber
                            status={status}
                            min={0}
                            value={page}
                            onChange={(value: number | null) => {
                                if (value != null) {
                                    if (value > maxPage) {
                                        setPage(maxPage)
                                    } else {
                                        setPage(value)
                                    }
                                }
                            }}
                            keyboard={true}
                        />
                    </Form.Item>
                </Form>
            </div>
        </Modal></>
}


type PageDataType = WithIndex<fofa.Item>

const pageSizeOptions = [50, 100, 150, 200, 500]

interface TabContentProps {
    colDefs?: ColDef[] | undefined | null,
    input?: string,
    full?: boolean,//全量搜索
    newTab?: (input: string, colDef: ColDef[] | undefined | null) => void
}

const TabContent: React.FC<TabContentProps> = (props) => {
    const gridRef = useRef<AgGridReact>(null);
    const [input, setInput] = useState<string>(props.input || "")
    const [inputCache, setInputCache] = useState<string>(input)
    const [full, setFull] = useState<boolean>(props.full || false)
    const [loading, setLoading] = useState<boolean>(false)
    const [loading2, setLoading2] = useState<boolean>(false)
    const pageIDMap = useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[1])
    const dispatch = useDispatch()
    const [clicked, setClicked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [faviconUrl, setFaviconUrl] = useState("");
    const allowEnterPress = useSelector((state: RootState) => state.app.global.config?.QueryOnEnter.assets)
    const ref = useRef<HTMLDivElement | null>(null)
    const history = useSelector((state: RootState) => state.app.global.history)
    const [columnDefs] = useState<ColDef[]>(props.colDefs || [
        { headerName: '序号', field: "index", width: 80, pinned: 'left' },
        { headerName: 'URL', field: "link", width: 300, pinned: 'left' }, //资产的URL链接, 权限：无
        { headerName: '域名', field: "domain", width: 150, hide: true }, //域名, 权限：无
        { headerName: 'IP', field: "ip", width: 150 }, //ip地址, 权限：无
        { headerName: '端口', field: "port", width: 80 }, //端口, 权限：无
        { headerName: '协议名', field: "protocol", width: 80, }, //协议名, 权限：无
        { headerName: '基础协议', field: "base_protocol", width: 100, hide: true }, //基础协议，比如tcp, 权限：无
        { headerName: '网站标题', field: "title", width: 200 }, //网站标题, 权限：无
        { headerName: 'icp备案号', field: "icp", width: 200 }, //icp备案号, 权限：无
        { headerName: '主机名', field: "host", width: 200, hide: true }, //主机名, 权限：无
        { headerName: '证书', field: "cert", width: 100, hide: true }, //证书, 权限：无
        { headerName: '操作系统', field: "os", width: 100, hide: true }, //操作系统, 权限：无
        { headerName: '网站server', field: "server", width: 100, hide: true }, //网站server, 权限：无
        { headerName: '网站header', field: "header", width: 100, hide: true }, //网站header, 权限：无
        { headerName: '协议banner', field: "banner", width: 100, hide: true }, //协议banner, 权限：无
        { headerName: '产品名', field: "product", width: 100, hide: true, toolPanelClass: 'professional-privilege' }, //产品名, 权限：专业版本及以上
        { headerName: '产品分类', field: "product_category", width: 100, hide: true, toolPanelClass: 'professional-privilege' }, //产品分类, 权限：专业版本及以上
        { headerName: '版本号', field: "version", width: 100, hide: true, toolPanelClass: 'professional-privilege' }, //版本号, 权限：专业版本及以上
        { headerName: '更新时间', field: "lastupdatetime", width: 100, hide: true, toolPanelClass: 'professional-privilege' }, //FOFA最后更新时间, 权限：专业版本及以上
        { headerName: '域名cname', field: "cname", width: 100, hide: true, toolPanelClass: 'professional-privilege' }, //域名cname, 权限：专业版本及以上
        { headerName: 'icon_hash', field: "icon_hash", width: 100, hide: true, toolPanelClass: 'commercial-privilege' }, //返回的icon_hash值, 权限：商业版本及以上
        { headerName: '证书是否有效', field: "certs_valid", width: 100, hide: true, toolPanelClass: 'commercial-privilege' }, //证书是否有效, 权限：商业版本及以上
        { headerName: 'cname的域名', field: "cname_domain", width: 120, hide: true, toolPanelClass: 'commercial-privilege' }, //cname的域名, 权限：商业版本及以上
        { headerName: '网站正文内容', field: "body", width: 100, hide: true, toolPanelClass: 'commercial-privilege' }, //网站正文内容, 权限：商业版本及以上
        { headerName: 'icon', field: "icon", width: 100, hide: true, toolPanelClass: 'enterprise-privilege' }, //icon图标, 权限：企业会员
        { headerName: 'fid', field: "fid", width: 100, hide: true, toolPanelClass: 'enterprise-privilege' }, //fid, 权限：企业会员
        { headerName: '结构化信息', field: "structinfo", width: 100, hide: true, toolPanelClass: 'enterprise-privilege' }, //结构化信息(部分协议支持、比如elastic、mongodb), 权限：企业会员
        { headerName: '国家代码', field: "country", width: 100, hide: true }, //国家代码, 权限：无
        { headerName: '国家名', field: "country_name", width: 100, hide: true }, //国家名, 权限：无
        { headerName: '区域', field: "region", width: 100, hide: true }, //区域, 权限：无
        { headerName: '城市', field: "city", width: 100, hide: true }, //城市, 权限：无
        { headerName: '经度', field: "longitude", width: 100, hide: true }, //地理位置经度, 权限：无
        { headerName: '纬度', field: "latitude", width: 100, hide: true }, //地理位置纬度, 权限：无
        { headerName: 'asn编号', field: "as_number", width: 100, hide: true }, //asn编号, 权限：无
        { headerName: 'asn组织', field: "as_organization", width: 100, hide: true }, //asn组织, 权限：无
        { headerName: 'jarm指纹', field: "jarm", width: 100, hide: true }, //jarm指纹, 权限：无
    ]);
    const [pageData, setPageData] = useState<PageDataType[]>([]);
    const getContextMenuItems = useCallback((params: GetContextMenuItemsParams):any => {
        return [
            {
                name: "浏览器打开URL",
                disabled: !params.node?.data.link,
                action: () => {
                    props.newTab && BrowserOpenURL(params.node?.data.link)
                },
            },
            {
                name: "查询C段",
                disabled: !params.node?.data.ip,
                action: () => {
                    props.newTab && props.newTab("ip=" + params.node?.data.ip + "/24", getColDefs())
                },
            },
            {
                name: "查询IP",
                disabled: !params.node?.data.ip,
                action: () => {
                    props.newTab && props.newTab("ip=" + params.node?.data.ip, getColDefs())
                },
            },
            {
                name: "查询标题",
                disabled: !params.node?.data.title,
                action: () => {
                    props.newTab && props.newTab("title=" + params.node?.data.title, getColDefs())
                },
            },
            "separator",
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
                    const colValues = pageData.map((item: PageDataType) => {
                        const colId = params.column?.getColId()
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === colId) {
                                return item[key as keyof PageDataType]
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
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === 'link') {
                                return item[key as keyof PageDataType]
                            }
                        }
                        return null
                    })
                    copy(colValues)
                },
            },
        ];
    },[pageData]);
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
                    labelDefault: "查询字段",
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
    const getColKeysNoIndex = useCallback(() => {
        if (gridRef.current?.api) {
            console.log(gridRef.current.api.getColumnDefs())
            const selectedCols = gridRef.current.api.getAllDisplayedColumns()
            const fields: string[] = []
            selectedCols?.forEach(col => {
                const field = col.getColId()
                field !== 'index' && fields.push(field)
            })
            return fields
        }
        const fields: string[] = []
        columnDefs?.forEach(col => {
            const hide = col.hide === undefined ? false : col.hide
            if (!hide && col.field && col.field !== 'index') {
                fields.push(col.field)
            }
        })
        return fields
    }, [columnDefs])
    const [searchType, setSearchType] = useState<"普通搜索"|"统计聚合"|"Host聚合">("普通搜索")
    const statisticalAggsRef = React.createRef<any>()
    useEffect(() => {
        if (props.input) {
            setInput(props.input)
            handleNewQuery(props.input, currentPageSize)
        }
    }, [])

    const getColDefs = () => {
        if (gridRef.current?.api) {
            console.log(gridRef.current.api.getColumnDefs())
            return gridRef.current.api.getColumnDefs()
        }
        return columnDefs
    }

    const updateRestToken = () => {
        GetUserInfo().then(
            result => {
                dispatch(userActions.setFofaUser(result))
            }
        ).catch(
            err => errorNotification("错误", err)
        )
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
        Query(0, t, 1, pageSize, getColKeysNoIndex().join(","), full).then(
            (result) => {
                updateRestToken()
                let index = 0
                setPageData(result.items.map(item => ({ index: ++index, ...item })))
                setTotal(result.total)
                setLoading(false)
                pageIDMap.current[1] = result.taskID
            }
        ).catch(
            err => {
                errorNotification("FOFA查询出错", err)
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
            const selectedCols = gridRef.current?.api.getAllDisplayedColumns()
            const fields: string[] = []
            selectedCols?.forEach(col => {
                const field = col.getColId()
                field !== 'index' && fields.push(field)
            })
            let pageID = pageIDMap.current[newPage]
            pageID = pageID ? pageID : 0
            Query(pageID, inputCache, newPage, currentPageSize, fields.join(","), full).then(
                result => {
                    updateRestToken()
                    let index = (newPage - 1) * currentPageSize
                    setPageData(result.items.map(item => ({ index: ++index, ...item })))
                    setCurrentPage(newPage)
                    setLoading(false)
                    pageIDMap.current[newPage] = result.taskID
                }
            ).catch(
                err => {
                    errorNotification("FOFA查询出错", err)
                    setLoading(false)
                }
            )
        }

        //size发生变换，page设为1
        if (newPageSize !== currentPageSize) {
            setCurrentPageSize(newPageSize)
            handleNewQuery(inputCache, newPageSize)
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

    const formatStrWithCount = (e: string, t: number) => {
        for (var n = [], o = 0; o < e.length / t; o++)
            n.push(e.slice(t * o, t * (o + 1)));
        return n.join("\n") + "\n"
    }

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
            const base64 = Buffer.from(iconArrayBuffer).toString('base64')
            const hash = 0 | MurmurHash3.x86.hash32(formatStrWithCount(base64, 76), 0);
            setInput(`icon_hash="${hash}"`)
            handleNewQuery(`icon_hash="${hash}"`, currentPageSize)
            hide()
        }
    }

    const IconSearchPanel = (<Popover
        placement={"bottom"}
        style={{ width: 500 }}
        content={<Button size={"small"} type={"text"} onClick={() => handleClickChange(true)}>icon查询</Button>}
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
                                const { file } = options;
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
    </Popover>)

    const footer = (
        <Flex justify={"space-between"} align={'center'} style={{ padding: '5px' }}>
            <Pagination
                showQuickJumper
                showSizeChanger
                total={total}
                pageSizeOptions={pageSizeOptions}
                defaultPageSize={pageSizeOptions[1]}
                defaultCurrent={1}
                current={currentPage}
                showTotal={(total) => `${total} items`}
                size="small"
                onChange={(page, size) => handlePaginationChange(page, size)}
            />
            <ExportDataPanel id={pageIDMap.current[1]} total={total} currentPageSize={currentPageSize} />
        </Flex>)

    return <Flex vertical gap={5} style={{ height: '100%' }}>
        <Flex ref={ref} justify={'center'} align={"center"} gap={5}>
            <Candidate
                addonBefore={<Select
                    onChange={(value:typeof searchType) => {
                        setSearchType(value)
                    }}
                    defaultValue="普通搜索"
                    size={"small"}
                    value={searchType}
                    options={[
                        { label: '普通搜索', value: '普通搜索' },
                        { label: '统计聚合', value: '统计聚合' },
                        { label: 'Host聚合', value: 'Host聚合' },
                    ]}
                    style={{ minWidth: 90 }}
                />}
                size={"small"}
                style={{ width: 600 }}
                placeholder='Search...'
                allowClear
                value={input}
                onSearch={(value) => {
                    if(searchType === "普通搜索") {
                        handleNewQuery(value, currentPageSize)
                    }else if(searchType === "统计聚合") {
                        statisticalAggsRef.current.query(value)
                        setInputCache(value)
                    }
                }}
                onPressEnter={(value) => {
                    if (!allowEnterPress) return
                    if(searchType === "普通搜索") {
                        handleNewQuery(value, currentPageSize)
                    }else if(searchType === "统计聚合") {
                        statisticalAggsRef.current.query(value)
                        setInputCache(value)
                    }
                }}
                items={[
                    {
                        fetch: async (v) => {
                            try {
                                // @ts-ignore
                                const response = await FindByPartialKey(history.fofa, !v ? "" : v.toString());
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
            <Help />
            {searchType === "普通搜索" && <>
                {IconSearchPanel}
                <Tooltip title='默认搜索一年内的数据，指定为true即可搜索全部数据' placement='bottom'>
                    <Switch size="small" checkedChildren="开启" unCheckedChildren="关闭"
                            onChange={(value) => setFull(value)} />
                </Tooltip>
            </>}
        </Flex>
        {searchType==="统计聚合" && <FofaStatisticalAggregation ref={statisticalAggsRef} value={input}/>}
        {searchType === "普通搜索" && <>
            <div style={{ width: "100%", height: "100%", display: searchType === "普通搜索"?'block':"none"}}>
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
        </>}
    </Flex>
}

const Fofa = () => {
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

export default Fofa;