import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    Row,
    Select,
    Space,
    Switch,
    Tabs,
    Tooltip
} from 'antd';
import {
    CloudDownloadOutlined,
    CrownTwoTone,
    LoadingOutlined,
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
import { copy, RangePresets } from '@/util/util';
import { BrowserOpenURL, EventsOn } from "../../wailsjs/runtime";
import { GetUserInfo, RealtimeServiceDataExport, RealtimeServiceDataQuery, SetAuth } from "../../wailsjs/go/quake/Bridge";
import { config, quake } from "../../wailsjs/go/models";
import { MenuItemType } from "antd/es/menu/interface";
import { MenuItems, WithIndex } from "@/component/Interface";
import TabLabel from "@/component/TabLabel";
import type { Tab } from "rc-tabs/lib/interface"
import { TargetKey } from "@/pages/Constants";
import Candidate, { ItemType } from "@/component/Candidate";
import { FindByPartialKey } from "../../wailsjs/go/history/Bridge";
import { ColDef, GetContextMenuItemsParams, ICellRendererParams, MenuItemDef, SideBarDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import Help from "@/pages/QukeUsage";
const { Option } = Select;
const { RangePicker } = DatePicker;

const optionCssStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
}

const vipIcon = <CrownTwoTone twoToneColor="red" />

const realtimeServiceFields = (
    <>
        <Option label="ip" value="ip"><span style={optionCssStyle}>ip</span></Option>
        <Option label="port" value="port"><span style={optionCssStyle}>port</span></Option>
        <Option label="hostname" value="hostname"><span style={optionCssStyle}>hostname</span></Option>
        <Option label="transport" value="transport"><span style={optionCssStyle}>transport</span></Option>
        <Option label="asn" value="asn"><span style={optionCssStyle}>asn</span></Option>
        <Option label="org" value="org"><span style={optionCssStyle}>org</span></Option>
        <Option label="service.name" value="service.name"><span style={optionCssStyle}>service.name</span></Option>
        <Option label="location.country_cn" value="location.country_cn"><span
            style={optionCssStyle}>location.country_cn</span></Option>
        <Option label="location.province_cn" value="location.province_cn"><span
            style={optionCssStyle}>location.province_cn</span></Option>
        <Option label="location.city_cn" value="location.city_cn"><span
            style={optionCssStyle}>location.city_cn</span></Option>
        <Option label="service.http.host" value="service.http.host"><span
            style={optionCssStyle}>service.http.host</span></Option>
        <Option label="service.http.title" value="service.http.title"><span
            style={optionCssStyle}>service.http.title</span></Option>
        <Option label="service.http.server" value="service.http.server"><span
            style={optionCssStyle}>service.http.server</span></Option>

        <Option label="time" value="time"><span style={optionCssStyle}>time{vipIcon}</span></Option>
        <Option label="service.response" value="service.response"><span
            style={optionCssStyle}>service.response{vipIcon}</span></Option>
        <Option label="service.cert" value="service.cert"><span
            style={optionCssStyle}>service.cert{vipIcon}</span></Option>
        <Option label="components.product_catalog" value="components.product_catalog"><span
            style={optionCssStyle}>components.product_catalog{vipIcon}</span></Option>
        <Option label="components.product_type" value="components.product_type"><span
            style={optionCssStyle}>components.product_type{vipIcon}</span></Option>
        <Option label="components.product_level" value="components.product_level"><span
            style={optionCssStyle}>components.product_level{vipIcon}</span></Option>
        <Option label="components.product_vendor" value="components.product_vendor"><span
            style={optionCssStyle}>components.product_vendor{vipIcon}</span></Option>
        <Option label="location.country_en" value="location.country_en"><span
            style={optionCssStyle}>location.country_en{vipIcon}</span></Option>
        <Option label="location.province_en" value="location.province_en"><span
            style={optionCssStyle}>location.province_en{vipIcon}</span></Option>
        <Option label="location.city_en" value="location.city_en"><span
            style={optionCssStyle}>location.city_en{vipIcon}</span></Option>
        <Option label="location.district_en" value="location.district_en"><span
            style={optionCssStyle}>location.district_en{vipIcon}</span></Option>
        <Option label="location.district_cn" value="location.district_cn"><span
            style={optionCssStyle}>location.district_cn{vipIcon}</span></Option>
        <Option label="location.isp" value="location.isp"><span
            style={optionCssStyle}>location.isp{vipIcon}</span></Option>
        <Option label="service.http.body" value="service.http.body"><span
            style={optionCssStyle}>service.http.body{vipIcon}</span></Option>
        <Option label="components.product_name_cn" value="components.product_name_cn"><span
            style={optionCssStyle}>components.product_name_cn{vipIcon}</span></Option>
        <Option label="components.version" value="components.version"><span
            style={optionCssStyle}>components.version{vipIcon}</span></Option>
        <Option label="service.http.infomation.mail" value="service.http.infomation.mail"><span
            style={optionCssStyle}>service.http.infomation.mail{vipIcon}</span></Option>
        <Option label="service.http.favicon.hash" value="service.http.favicon.hash"><span
            style={optionCssStyle}>service.http.favicon.hash{vipIcon}</span></Option>
        <Option label="service.http.favicon.data" value="service.http.favicon.data"><span
            style={optionCssStyle}>service.http.favicon.data{vipIcon}</span></Option>
        <Option label="domain" value="domain"><span style={optionCssStyle}>domain{vipIcon}</span></Option>
        <Option label="service.http.status_code" value="service.http.status_code"><span
            style={optionCssStyle}>service.http.status_code{vipIcon}</span></Option>
    </>
)

const pageSizeOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500]

interface TabContentProps {
    colDefs?: ColDef[] | undefined | null,
    input?: string,
    newTab?: (input: string, colDefs: ColDef[] | undefined | null, opts: QueryOptions) => void,
    queryOption?: QueryOptions
}

interface QueryOptions {
    checkedColsValue: string[],
    inputCache: string,
    queryFields: { value: string, label: string }[],
    ignoreCache: boolean//忽略缓存，true为开启，false为关闭，默认关闭
    latest: boolean//忽略缓存，true为开启，false为关闭，默认关闭
    dateRange: string[],
    exclude: string[],
    include: string[],
    ipList: string[],
}

const defaultMenuItems: MenuItemType[] = [
    MenuItems.OpenUrl,
    MenuItems.QueryIP,
    MenuItems.QueryIpCidr,
    MenuItems.QueryTitle,
    MenuItems.CopyRow,
    MenuItems.CopyCol,
    MenuItems.CopyUrlCol
];

type PageDataType = WithIndex<quake.RealtimeServiceItem>

const defaultQueryOption: QueryOptions = {
    checkedColsValue: [],
    dateRange: [],
    exclude: [],
    ignoreCache: false,
    include: [],
    inputCache: "",
    ipList: [],
    latest: false,
    queryFields: []
}

const AuthSetting: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config || new config.Config())
    const [key, setKey] = useState("")

    useEffect(() => {
        setKey(cfg.Quake.token)
    }, [cfg.Quake])


    const save = () => {
        SetAuth(key).then(
            () => {
                const t = { ...cfg, Quake: { ...cfg.Quake, token: key } } as config.Config;
                dispatch(appActions.setConfig(t))
                setOpen(false)
                setEditable(false)
            }
        ).catch(
            err => {
                errorNotification("错误", err)
                setKey(cfg.Quake.token)
            }
        )
    }

    const cancel = () => {
        setEditable(false);
        setOpen(false)
        setKey(cfg.Quake.token)
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

const ExportDataPanel = (props: { id: number; total: number; currentPageSize: number, }) => {
    const dispatch = useDispatch()
    const user = useSelector((state: RootState) => state.user.quake)
    const [page, setPage] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(props.currentPageSize)
    const [cost, setCost] = useState<number>(0)
    const [status, setStatus] = useState<"" | "error" | "warning">("")
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [exportable, setExportable] = useState<boolean>(false)
    const [maxPage, setMaxPage] = useState<number>(0)
    const [disable, setDisable] = useState<boolean>(false)
    const event = useSelector((state: RootState) => state.app.global.event)

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

    useEffect(() => {
        EventsOn(String(event?.hasNewQuakeDownloadItem), function () {
            updateRestToken()
            setIsExporting(false)
            setDisable(false)
        })
    }, []);

    const updateRestToken = () => {
        GetUserInfo().then(
            result => {
                dispatch(userActions.setQuakeUser(result))
            }
        ).catch(
            err => errorNotification("更新Quake剩余积分", err)
        )
    }

    const exportData = async (page: number) => {
        const { id } = props
        if (id === 0) {
            errorNotification("导出结果", QUERY_FIRST)
            return
        }
        setIsExporting(true)
        setDisable(true)
        RealtimeServiceDataExport(id, page, pageSize).catch(
            err => {
                errorNotification("导出结果", err)
                setIsExporting(false)
                setDisable(false)
            }
        )
    }

    return <>
        <Button disabled={disable}
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
            getContainer={false}
        >

            <span style={{ display: 'grid', gap: "3px" }}>
                <Row>
                    <span
                        style={{ display: 'flex', flexDirection: "row", gap: "5px", backgroundColor: '#f3f3f3', width: "100%" }}>
                        <span>月度积分: <span style={{ color: "#f5222d" }}>{user.month_remaining_credit}</span></span>
                        <span>永久积分: <span style={{ color: "#f5222d" }}>{user.persistent_credit}</span></span>
                    </span>
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
                            onChange={(value) => {
                                if (!value) {
                                    return
                                }
                                if (value >= maxPage) {
                                    setPage(maxPage);
                                    setCost(props.total)
                                } else {
                                    setCost(pageSize * value)
                                    setPage(value)
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
    const [input, setInput] = useState<string>(props.input || "")
    const [inputCache, setInputCache] = useState<string>(input)
    const [queryOption, setQueryOption] = useState<QueryOptions>(props.queryOption || defaultQueryOption)
    const [loading, setLoading] = useState<boolean>(false)
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap = useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const dispatch = useDispatch()
    const history = useSelector((state: RootState) => state.app.global.history)
    const allowEnterPress = useSelector((state: RootState) => state.app.global.config?.QueryOnEnter.assets)
    const [columnDefs] = useState<ColDef[]>(props.colDefs || [
        { headerName: '序号', field: "index", width: 80, pinned: 'left' },
        { headerName: 'IP', field: "ip", width: 150, pinned: 'left' },
        { headerName: '域名', field: "domain", width: 200 },
        { headerName: '端口', field: "port", width: 80 },
        { headerName: '协议', field: "protocol", width: 80, cellRenderer: (params: ICellRendererParams) => params.data?.service?.name || "" },
        { headerName: '网站标题', field: "web_title", width: 200, cellRenderer: (params: ICellRendererParams) => params.data?.service?.http?.title },
        { headerName: '响应码', field: "status_code", width: 80, cellRenderer: (params: ICellRendererParams) => params.data?.service?.http?.status_code },
        {
            headerName: '产品应用', field: "components", width: 100, cellRenderer: (params: ICellRendererParams) => {
                const tmp = params.data.components?.map((component: quake.Component) => {
                    return component.product_name_en + component.version
                })
                return tmp?.join(" | ") || ""
            }
        },
        { headerName: '网站服务器', field: "os", width: 100 },
        { headerName: '网站路径', field: "path", width: 100, cellRenderer: (params: ICellRendererParams) => params.data?.service?.http?.path },
        {
            headerName: '地理位置', field: "location", width: 100, cellRenderer: (params: ICellRendererParams) => {
                const location: string[] = []
                if (params.data.location.country_cn) {
                    location.push(params.data.location.country_cn)
                }
                if (params.data.location.province_cn) {
                    location.push(params.data.location.province_cn)
                }
                if (params.data.location.city_cn) {
                    location.push(params.data.location.city_cn)
                }
                if (params.data.location.street_cn) {
                    location.push(params.data.location.street_cn)
                }
                return location.join(" ") || ""
            }
        },
        { headerName: '更新时间', field: "time", width: 100 },
        { headerName: 'ASN', field: "asn", width: 100 },
        { headerName: '运营商', field: "isp", width: 100, cellRenderer: (params: ICellRendererParams) => params.data?.location?.isp },
    ]);
    const gridRef = useRef<AgGridReact>(null);

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
                dispatch(userActions.setQuakeUser(result))
            }
        ).catch(
            err => errorNotification("错误", err)
        )
    }

    const handleNewQuery = async (query: string, pageSize: number) => {
        // const {input, dateRange: dataRange, ignoreCache, ipList, include, exclude, latest} = this.state
        const t = query.trim()
        if (t === "") {
            return
        }
        setInputCache(t)
        setLoading(true)
        setTotal(0)
        setCurrentPage(1)
        pageIDMap.current = {}

        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        RealtimeServiceDataQuery(0, {
            query: t, page: 1, size: pageSize,
            startTime: queryOption.dateRange[0] || "",
            endTime: queryOption.dateRange[1] || "",
            rule: '',
            ipList: queryOption.ipList,
            ignoreCache: queryOption.ignoreCache,
            include: queryOption.include,
            exclude: queryOption.exclude,
            latest: queryOption.latest
        }).then(
            result => {
                updateRestToken()
                let index = 0
                setPageData(result.result.items.map(item => {
                    const instance = new quake.RealtimeServiceItem(item)
                    const { convertValues, ...rest } = instance
                    return { index: ++index, ...item, convertValues, ...rest }
                }))
                setTotal(result.result.total)
                pageIDMap.current[1] = result.taskID
            }
        ).catch(
            err => {
                errorNotification("Quake查询出错", err)
                setPageData([])
            }
        ).finally(
            () => setLoading(false)
        )
    }

    const handlePaginationChange = async (newPage: number, newSize: number) => {
        // const {inputCache, dateRange: dataRange, ignoreCache, ipList, include, exclude, latest} = this.state
        //page发生变换
        if (newPage !== currentPage && newSize === currentPageSize) {
            setLoading(true)
            let pageID = pageIDMap.current[newPage]
            pageID = pageID ? pageID : 0
            RealtimeServiceDataQuery(pageID, {
                query: inputCache,
                page: newPage,
                size: currentPageSize,
                startTime: queryOption.dateRange[0] || "",
                endTime: queryOption.dateRange[1] || "",
                rule: '',
                ipList: queryOption.ipList,
                ignoreCache: queryOption.ignoreCache,
                include: queryOption.include,
                exclude: queryOption.exclude,
                latest: queryOption.latest
            })
                .then(
                    result => {
                        let index = (newPage - 1) * currentPageSize
                        setPageData(result.result.items.map(item => {
                            const instance = new quake.RealtimeServiceItem(item)
                            const { convertValues, ...rest } = instance
                            return { index: ++index, ...item, convertValues, ...rest }
                        }))
                        setCurrentPage(newPage)
                        pageIDMap.current[newPage] = result.taskID
                        updateRestToken()
                    }
                )
                .catch(
                    err => {
                        errorNotification("Quake查询出错", err)
                    }
                ).finally(
                    () => setLoading(false)
                )
        }

        //size发生变换
        if (newSize !== currentPageSize) {
            setCurrentPageSize(newSize)
            handleNewQuery(inputCache, newSize)
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
            <ExportDataPanel id={pageIDMap.current[1]} total={total} currentPageSize={currentPageSize} />
        </Flex>
    )

    const getContextMenuItems = useCallback(
        (
            params: GetContextMenuItemsParams,
        ): (MenuItemDef)[] => {
            const domain = params.node?.data.domain
            const ip = params.node?.data.ip
            const schema = params.node?.data.service?.name
            const port = params.node?.data.port
            let url = ""
            if (schema && schema.startsWith("http") && (domain || ip.indexOf("*") === -1)) {
                if (schema.startsWith("http/ssl")) {
                    url = `https://${(domain || ip)}:${port.toString()}`
                } else if (schema.startsWith("http")) {
                    url = `http://${(domain || ip)}:${port.toString()}`
                }
            }

            const colId = params.column?.getColId()
            let value: any
            switch (colId) {
                case "protocol":
                    value = params.node?.data.service?.name
                    break
                case "web_title":
                    value = params.node?.data.service?.http?.title
                    break
                case "status_code":
                    value = params.node?.data.service?.http?.status_code
                    break
                case "path":
                    value = params.node?.data.service?.http?.path
                    break
                case "isp":
                    value = params.node?.data?.location?.isp
                    break
                case "location": {
                    const location: string[] = []
                    if (params.node?.data.location.country_cn) {
                        location.push(params.node?.data.location.country_cn)
                    }
                    if (params.node?.data.location.province_cn) {
                        location.push(params.node?.data.location.province_cn)
                    }
                    if (params.node?.data.location.city_cn) {
                        location.push(params.node?.data.location.city_cn)
                    }
                    if (params.node?.data.location.street_cn) {
                        location.push(params.node?.data.location.street_cn)
                    }
                    value = location.join(" ")
                    break
                }
                case "components": {
                    const tmp = params.node?.data.components?.map((component: quake.Component) => {
                        return component.product_name_en + component.version
                    })
                    value = tmp?.join(" | ")
                    break
                }
                default:
                    value = params.value
            }
            return [
                {
                    name: "浏览器打开URL",
                    disabled: !url,
                    action: () => {
                        BrowserOpenURL(url)
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
                        props.newTab && props.newTab(`ip:"${params.node?.data.ip}"`, getColDefs(), queryOption)
                    },
                },
                {
                    name: "查询标题",
                    disabled: !params.node?.data.service.http.title,
                    action: () => {
                        props.newTab && props.newTab(`service.http.title:"${params.node?.data.service.http.title}"`, getColDefs(), queryOption)
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
                        const colValues = pageData.map(item => {
                            for (const key in item) {
                                if (Object.prototype.hasOwnProperty.call(item, key)) {
                                    switch (colId) {
                                        case "protocol":
                                            return item.service?.name ? item.service?.name : ""
                                        case "web_title":
                                            return item.service?.http?.title ? item.service?.http?.title : ""
                                        case "status_code":
                                            return item.service?.http?.status_code ? item.service?.http?.status_code : ""
                                        case "path":
                                            return item.service?.http?.path ? item.service?.http?.path : ""
                                        case "isp":
                                            return item?.location?.isp ? item?.location?.isp : ""
                                        case "location": {
                                            const location: string[] = []
                                            if (item.location.country_cn) {
                                                location.push(item.location.country_cn)
                                            }
                                            if (item.location.province_cn) {
                                                location.push(item.location.province_cn)
                                            }
                                            if (item.location.city_cn) {
                                                location.push(item.location.city_cn)
                                            }
                                            if (item.location.street_cn) {
                                                location.push(item.location.street_cn)
                                            }
                                            return location.join(" ")
                                        }
                                        case "components": {
                                            const tmp = item.components?.map((component: quake.Component) => {
                                                return component.product_name_en + component.version
                                            })
                                            return tmp?.join(" | ") || ""
                                        }
                                    }
                                    return item[key as keyof PageDataType];
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
                        const t: string[] = pageData.map(item => {
                            const domain = item.domain
                            const ip = item.ip
                            const schema = item.service?.name
                            const port = item.port
                            let url
                            const host = domain || ip
                            console.log(host, domain, ip)
                            if (schema === 'http/ssl') {
                                url = (port === 443 ? 'https://' : 'http://') + host + ":" + port
                            } else {
                                url = schema + '://' + host + ":" + port
                            }
                            return url
                        })
                        copy(t.join("\n"))
                    },
                },
            ];
        },
        [pageData, queryOption],
    );

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
                    },
                },
            ],
        }
    }, [])


    return <Flex vertical gap={5} style={{ height: '100%' }}>
        <Flex vertical gap={5}>
            <Flex align={'center'} justify={'center'}>
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
                                    const response = await FindByPartialKey(history.quake, !v ? "" : v.toString());
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
            </Flex>
            <Flex wrap justify={'center'} gap={5}>
                <RangePicker
                    presets={[...RangePresets]}
                    style={{ width: "330px" }} size="small" format="YYYY-MM-DD HH:mm:ss"
                    onChange={async (_dates, dateStrings) => {
                        console.log(_dates, dateStrings)
                        setQueryOption(prevState => ({ ...prevState, dateRange: dateStrings }))
                    }}
                    allowEmpty={[true, true]}
                    showTime
                    showNow
                />
                <Select
                    maxTagTextLength={10}
                    disabled onChange={(value) => {
                        setQueryOption(prevState => ({ ...prevState, include: value }))
                    }}
                    allowClear
                    maxTagCount={1}
                    mode="multiple"
                    optionLabelProp="value"
                    placeholder='包含字段,尚不成熟,暂禁用'
                    size='small'
                    style={{
                        width: "260px",
                        whiteSpace: "nowrap"
                    }}>
                    {realtimeServiceFields}
                </Select>
                <Select
                    maxTagTextLength={10}
                    disabled onChange={(value) => {
                        setQueryOption(prevState => ({ ...prevState, exclude: value }))
                    }}
                    allowClear
                    maxTagCount={1}
                    mode="multiple"
                    optionLabelProp="value"
                    placeholder='排除字段,尚不成熟,暂禁用'
                    size='small'
                    style={{ width: "260px" }}>
                    {realtimeServiceFields}
                </Select>
                <Input style={{ width: "250px" }} size="small" placeholder='IP列表，以逗号分隔' onChange={(e) => {
                    const value = e.target.value
                    setQueryOption(prevState => ({ ...prevState, ipList: value.trim() === "" ? [] : value.split(",") }))
                }} />

                <Flex align={"center"}>
                    <label style={{ fontSize: "14px", marginRight: "5px" }}>忽略缓存</label>
                    <Switch size="small"
                        defaultChecked={queryOption.ignoreCache}
                        checkedChildren="开启"
                        unCheckedChildren="关闭"
                        onChange={(value) => setQueryOption(prevState => ({ ...prevState, ignoreCache: value }))}
                    />
                </Flex>
                <Flex align={"center"}>
                    <label style={{ fontSize: "14px", marginRight: "5px" }}>最新数据</label>
                    <Switch size="small"
                        defaultChecked={queryOption.latest}
                        checkedChildren="开启"
                        unCheckedChildren="关闭"
                        onChange={(value) => setQueryOption(prevState => ({ ...prevState, latest: value }))}
                    />
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
    const user = useSelector((state: RootState) => state.user.quake)
    const [spin, setSpin] = useState<boolean>(false)
    const dispatch = useDispatch()

    useEffect(() => {
        updateRestToken()
    }, []);

    const updateRestToken = async () => {
        try {
            const user = await GetUserInfo()
            dispatch(userActions.setQuakeUser(user))
        } catch (err) {
            errorNotification("Quake用户信息", err)
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
            <Tooltip title="永久积分">
                <div style={{
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    color: "#f5222d"
                }}>
                    <img src={PointBuy} />
                    {user.persistent_credit}
                </div>
            </Tooltip>
            <Tooltip title="月度积分">
                <div style={{
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    color: "#f5222d"
                }}>
                    <img src={PointFree} />
                    {user.month_remaining_credit}
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

const Quake = () => {
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
            style={{ width: '100%', height: '100%' }}
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

export default Quake
