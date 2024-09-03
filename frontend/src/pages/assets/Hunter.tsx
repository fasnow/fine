import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {
    Button,
    Col,
    Collapse,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    List,
    Modal,
    Pagination,
    Popover,
    Row,
    Select,
    Space,
    Switch,
    Table,
    Tabs,
    Tooltip,
    message,
    Upload,
    Flex,
    Spin,
    Dropdown, MenuProps
} from 'antd';
import {
    SearchOutlined,
    InboxOutlined,
    QuestionOutlined,
    UserOutlined,
    CloudDownloadOutlined,
    LoadingOutlined,
    ExclamationCircleOutlined,
    CloudOutlined,
    CopyOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import {errorNotification} from '@/component/Notification';
import {ColumnGroupType, ColumnType, ColumnsType} from 'antd/es/table';
import ColumnsFilter, {CheckboxValueType, DataSourceItemType} from '../../component/ColumnFilter';
import {HunterUserType, RootState, setHunterAuth, setHunterUser} from '@/store/store';
import {useDispatch, useSelector} from 'react-redux';
import PointBuy from "@/assets/images/point-buy.svg"
import dayjs from 'dayjs';
import {ResizeCallbackData} from 'react-resizable';
import {ExportDataPanelProps} from './Props';
import {buttonProps, authFormProps} from '../setting/Setting';
import {copy, localeCompare, RangePresets} from '@/util/util';
import {fofa, hunter} from "../../../wailsjs/go/models";
import {Export, GetRestToken, Query, SetAuth} from "../../../wailsjs/go/hunter/Bridge";
import {BrowserOpenURL, EventsOn} from "../../../wailsjs/runtime";
import ResizableTitle from "@/component/ResizableTitle";
import type {Tab} from 'rc-tabs/lib/interface';
import {GetHunter} from "../../../wailsjs/go/config/Config";
import {GetAllEvents} from "../../../wailsjs/go/event/Event";
import {Dots} from "@/component/Icon";
import {md5} from "js-md5"
import {Fetch} from "../../../wailsjs/go/app/App";
import {toUint8Array} from "js-base64";
import {MenuItem} from "@/component/MenuItem";
import {MenuItemType} from "antd/es/menu/interface";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
const pageSizeOptions = [10, 20, 50, 100]
const defaultCheckedColsDataIndex: string[] = [
    "index",
    "ip",
    "port",
    "domain",
    "protocol",
    "web_title",
    "status_code",
    "company"
]

interface HunterComponentType {
    name: string,//组件名称
    version: string,//组件版本
}

const columnFilterDataSource: DataSourceItemType[] = [
    {label: '序号', value: "index"},
    {label: 'IP', value: "ip"},
    {label: '域名', value: "domain"},
    {label: '端口', value: "port"},
    {label: '协议', value: "protocol"},
    {label: '网站标题', value: "web_title"},
    {label: 'URL', value: "url"},
    {label: '响应码', value: "status_code"},
    {label: '组件', value: "component",},
    {label: '操作系统', value: "os",},
    {label: '备案单位', value: "company",},
    {label: '城市', value: "city",},
    {label: '更新时间', value: "updated_at",},
    {label: 'web应用', value: "is_web",},
    {label: 'Banner', value: "banner",},
    {label: '风险资产', value: "is_risk",},
    {label: '备案号', value: "number",},
    {label: '注册机构', value: "as_org",},
    {label: '运营商', value: "isp",},
]
type TabContentProps = {
    user?: HunterUserType
    setHunterUser?: (user: HunterUserType) => void
    onContextMenu?: {
        addTab: (input: string) => void,
        input: string,
    }
    checkedColsValue: string[],
    onCost?: () => string[],
}
type TabContentState = {
    checkedColsValue: string[],
    input: string,
    inputCache: string,
    checkedFields: string[],
    isWeb: 1 | 2 | 3,//资产类型，1代表”web资产“，2代表”非web资产“，3代表”全部“
    statusCode: string,//状态码列表，以逗号分隔，如”200,401“
    portFilter: boolean//数据过滤参数，true为开启，false为关闭
    dateRange: string[]
}

const defaultMenuItems = [
    MenuItem.OpenUrl,
    MenuItem.QueryIP,
    MenuItem.QueryIpCidr,
    MenuItem.QueryTitle,
    MenuItem.CopyCell,
    MenuItem.CopyRow,
    MenuItem.CopyCol,
    MenuItem.CopyUrlCol
];

interface PageDataType extends hunter.Item {
    index: number
}


let selectedRow: { item: hunter.Item | undefined, rowIndex: number | undefined, colKey: string } | undefined = {
    item: undefined,
    rowIndex: 0,
    colKey: ''
}

class TabContent extends React.Component<TabContentProps, TabContentState> {
    constructor(props: TabContentProps) {
        super(props);
        this.state = {
            checkedColsValue: props.checkedColsValue || defaultCheckedColsDataIndex,
            input: props.onContextMenu?.input || "",
            inputCache: '',
            checkedFields: props.checkedColsValue || defaultCheckedColsDataIndex,
            isWeb: 3,
            statusCode: "",
            portFilter: false,
            dateRange: []
        }
    }

    getCheckedFields = () => {
        return this.state.checkedFields;
    };

    getInput = () => {
        return this.state.inputCache
    }

    private ExportDataPanel = (props: { id: number, total: number, currentPageSize: number }) => {
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
            GetAllEvents().then(
                result => {
                    EventsOn(String(result.hasNewHunterDownloadItem), function () {
                        setIsExporting(false)
                        setDisable(false)
                        GetRestToken().then(
                            result => {
                                dispatch(setHunterUser({restToken: result}))
                            }
                        )
                    })
                }
            )
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
                icon={isExporting ? <LoadingOutlined/> : <CloudDownloadOutlined/>}
            >
                {isExporting ? "正在导出" : "导出结果"}
            </Button>
            <Modal
                {...ExportDataPanelProps}
                title="导出结果"
                open={exportable}
                onOk={() => {
                    if ((maxPage == 0) || (maxPage > 0 && (maxPage < page || page <= 0))) {
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
                <span style={{display: 'grid', gap: "3px"}}>
                    <Row>
                        <span style={{
                            display: 'flex',
                            flexDirection: "row",
                            gap: "10px",
                            backgroundColor: '#f3f3f3',
                            width: "100%"
                        }}>当前积分: <span style={{color: "red"}}>{user.restToken}</span></span>
                    </Row>
                    <Row>
                        <Col span={10}>
                            <span>导出分页大小</span>
                        </Col>
                        <Col span={14}>
                            <Select
                                size='small'
                                style={{width: '80px'}}
                                defaultValue={pageSize}
                                options={pageSizeOptions.map(size => ({label: size.toString(), value: size}))}
                                onChange={(size) => {
                                    setPageSize(size)
                                }}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            <span style={{display: 'flex', whiteSpace: 'nowrap'}}>导出页数(max:{maxPage})</span>
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
                                style={{width: '100px'}}
                                size='small'
                                value={cost}
                                suffix={"积分"}
                            />
                        </Col>
                    </Row>
                </span>
            </Modal></>
    }

    Content = () => {
        const defaultColumns: ColumnsType<hunter.Item> = [
            {
                title: '序号',
                dataIndex: "index",
                width: 52,
                ellipsis: true,
                fixed: "left",
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"index"),
                    }
                }
            },
            {
                title: 'URL',
                dataIndex: "url",
                ellipsis: true,
                width: 250,
                fixed: "left",
                sorter: ((a, b) => localeCompare(a.url, b.url)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"url"),
                        onClick: () => copy(record.url)
                    }
                }
            },
            {
                title: '域名',
                dataIndex: "domain",
                ellipsis: true,
                width: 100,
                sorter: ((a, b) => localeCompare(a.domain, b.domain)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"domain"),
                        onClick: () => copy(record.domain)
                    }
                }
            },
            {
                title: 'IP',
                dataIndex: "ip",
                ellipsis: true,
                width: 90,
                sorter: ((a, b) => localeCompare(a.ip, b.ip)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"ip"),
                        onClick: () => copy(record.ip)
                    }
                }
            },
            {
                title: '端口',
                dataIndex: "port",
                ellipsis: true,
                width: 80,
                sorter: ((a, b) => localeCompare(a.port, b.port)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"port"),
                        onClick: () => copy(record.port)
                    }
                }
            },
            {
                title: '协议',
                dataIndex: "protocol",
                ellipsis: true,
                width: 80,
                sorter: ((a, b) => localeCompare(a.protocol, b.protocol)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"protocol"),
                        onClick: () => copy(record.protocol)
                    }
                }
            },
            {
                title: '网站标题',
                dataIndex: "web_title",
                ellipsis: true,
                width: 200,
                sorter: ((a, b) => localeCompare(a.web_title, b.web_title)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"web_title"),
                        onClick: () => copy(record.web_title)
                    }
                }
            },
            {
                title: '响应码',
                dataIndex: "status_code",
                ellipsis: true,
                width: 80,
                sorter: ((a, b) => localeCompare(a.status_code, b.status_code)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"status_code"),
                        onClick: () => copy(record.status_code)
                    }
                }
            },
            {
                title: '组件',
                dataIndex: "component",
                ellipsis: true,
                width: 100,
                render: (components: HunterComponentType[]) => {
                    const tmp = components?.map((component) => {
                        return component.name + component.version
                    })
                    return <>
                        {
                            tmp?.join(" | ")
                        }
                    </>
                },
                onCell: (record, index) => {
                    const tmp = record.component?.map((component) => {
                        return component.name + component.version
                    })
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"component"),
                        onClick: () => copy(tmp?.join(" | "))
                    }
                }
            },
            {
                title: '操作系统',
                dataIndex: "os",
                ellipsis: true,
                width: 100,
                sorter: ((a, b) => localeCompare(a.os, b.os)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"os"),
                        onClick: () => copy(record.os)
                    }
                }
            },
            {
                title: '备案单位',
                dataIndex: "company",
                ellipsis: true,
                width: 100,
                sorter: ((a, b) => localeCompare(a.company, b.company)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"company"),
                        onClick: () => copy(record.company)
                    }
                }
            },
            {
                title: '城市',
                dataIndex: "city",
                ellipsis: true,
                sorter: ((a, b) => localeCompare(a.city, b.city)),
                width: 100,
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"city"),
                        onClick: () => copy(record.city)
                    }
                }
            },
            {
                title: '更新时间', dataIndex: "updated_at", ellipsis: true, width: 100, onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"updated_at"),
                        onClick: () => copy(record.updated_at)
                    }
                }
            },
            {
                title: 'web应用',
                dataIndex: "is_web",
                ellipsis: true,
                width: 100,
                sorter: ((a, b) => localeCompare(a.is_web, b.is_web)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"is_web"),
                        onClick: () => copy(record.is_web)
                    }
                }
            },
            {
                title: 'Banner', dataIndex: "banner", ellipsis: true, width: 100, onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"banner"),
                        onClick: () => copy(record.banner)
                    }
                }
            },
            {
                title: '风险资产',
                dataIndex: "is_risk",
                ellipsis: true,
                width: 100,
                sorter: ((a, b) => localeCompare(a.is_risk, b.is_risk)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"is_risk"),
                        onClick: () => copy(record.is_risk)
                    }
                }
            },
            {
                title: '备案号',
                dataIndex: "number",
                ellipsis: true,
                width: 100,
                sorter: ((a, b) => localeCompare(a.number, b.number)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"number"),
                        onClick: () => copy(record.number)
                    }
                }
            },
            {
                title: '注册机构',
                dataIndex: "as_org",
                ellipsis: true,
                width: 100,
                sorter: ((a, b) => localeCompare(a.as_org, b.as_org)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"as_org"),
                        onClick: () => copy(record.as_org)
                    }
                }
            },
            {
                title: '运营商',
                dataIndex: "isp",
                ellipsis: true,
                width: 100,
                sorter: ((a, b) => localeCompare(a.isp, b.isp)),
                onCell: (record, index) => {
                    return {
                        onContextMenu: () => handleOnContextMenu(record,index,"isp"),
                        onClick: () => copy(record.isp)
                    }
                }
            },
        ];
        const [columns, setColumns] = useState<ColumnsType<hunter.Item>>(defaultColumns)
        const [loading, setLoading] = useState<boolean>(false)
        const [loading2, setLoading2] = useState<boolean>(false)
        const [pageData, setPageData] = useState<PageDataType[]>([])
        const pageIDMap = useRef<{ [key: number]: number }>({})
        const dispatch = useDispatch()
        const [total, setTotal] = useState<number>(0)
        const [currentPage, setCurrentPage] = useState<number>(1)
        const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
        const {input, checkedColsValue} = this.state
        const [clicked, setClicked] = useState(false);
        const [hovered, setHovered] = useState(false);
        const [faviconUrl, setFaviconUrl] = useState("");
        const [openContextMenu, setOpenContextMenu] = useState(false);
        const [tableScrollHeight, setTableScrollHeight] = useState<number>(window.innerHeight - 234)
        const [menuItems, setMenuItems] = useState(defaultMenuItems)

        useEffect(() => {
            window.addEventListener("resize", () => {
                setTableScrollHeight(window.innerHeight - 234)
            })
            let tmpCols: (ColumnGroupType<hunter.Item> | ColumnType<hunter.Item>)[]
            let tmp: (ColumnGroupType<hunter.Item> | ColumnType<hunter.Item>)[]
            if (this.props.checkedColsValue) {
                tmpCols = defaultColumns.filter(col => this.props.checkedColsValue.includes((col as any)["dataIndex"]))
                tmp = tmpCols.map(col => ({...col}));
            } else {
                tmpCols = defaultColumns.filter(col => defaultCheckedColsDataIndex.includes((col as any)["dataIndex"]))
                tmp = tmpCols.map(col => ({...col}));

            }
            // if (tmp.length > 0) {
            //     delete tmp[tmp.length - 1]["width"]
            // }
            setColumns(tmp)
            if (this.props.onContextMenu?.input) {
                handleFirstQuery(currentPageSize)
            }

            let index = 0;
            // setPageData(result?.map((item) => {
            //     const instance = new hunter.Item(item)
            //     const {convertValues, ...reset} = instance
            //     return {index: ++index, ...item, convertValues, ...reset}
            // }))
        }, [])

        useEffect(() => {
            GetAllEvents().then(
                result => {
                    EventsOn(String(result.hasNewHunterDownloadItem), function () {
                        GetRestToken().then(
                            result => {
                                dispatch(setHunterUser({restToken: result}))
                            }
                        )
                    })
                }
            )
        }, []);

        const handleOnContextMenu = (item: hunter.Item, rowIndex: number | undefined, colKey: string)=>{
            selectedRow = {item: item, rowIndex: rowIndex, colKey: colKey};
            beforeContextMenuOpen();
        }

        const beforeContextMenuOpen = () => {
            if (!selectedRow || !selectedRow.item) {
                return
            }
            let t: MenuItemType[] = []
            for (const key in menuItems) {
                const tt = menuItems[key]
                switch (menuItems[key].key) {
                    case MenuItem.OpenUrl.key:
                        tt["disabled"] = !selectedRow.item.url;
                        break;
                    case MenuItem.CopyCell.key:
                        tt["disabled"] = !selectedRow.item[selectedRow?.colKey as keyof hunter.Item];
                        break;
                    case MenuItem.QueryTitle.key:
                        tt["disabled"] = !selectedRow.item.web_title;
                        break;
                }
                t.push(tt)
            }
            setMenuItems(t)
        }

        const handleMenuItemClick: MenuProps['onClick'] = (e) => {
            if (!this.props.onContextMenu || !selectedRow || !selectedRow.item || !selectedRow.colKey) {
                return
            }
            switch (e.key) {
                case MenuItem.QueryTitle.key:
                    this.props?.onContextMenu.addTab("web.title=" + selectedRow.item.web_title)
                    break
                case MenuItem.QueryIpCidr.key:
                    this.props?.onContextMenu.addTab("ip=" + selectedRow.item.ip + "/24")
                    break
                case MenuItem.QueryIP.key:
                    this.props?.onContextMenu.addTab("ip=" + selectedRow.item.ip)
                    break
                case MenuItem.OpenUrl.key:
                    if (selectedRow.item.url) {
                        BrowserOpenURL(selectedRow.item.url)
                    }
                    break
                case MenuItem.CopyCell.key: {
                    const item = selectedRow.item
                    for (const key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.colKey) {
                            const value = item[key as keyof hunter.Item]
                            copy(value)
                        }
                    }
                }
                    break
                case MenuItem.CopyRow.key:
                    copy(selectedRow)
                    break
                case MenuItem.CopyUrlCol.key: {
                    const colValues = pageData.map(item => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === 'url') {
                                return item[key as keyof hunter.Item]
                            }
                        }
                        return ""
                    })
                    copy(colValues)
                    break
                }
                case MenuItem.CopyCol.key: {
                    const colValues = pageData.map(item => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow?.colKey) {
                                return item[key as keyof hunter.Item]
                            }
                        }
                        return ""
                    })
                    copy(colValues)
                    break
                }
            }
            selectedRow = undefined
        };

        const handleHeaderResize =
            (index: number) => (_: React.SyntheticEvent<Element>, {size}: ResizeCallbackData) => {
                const newColumns = [...columns];
                newColumns[index] = {
                    ...newColumns[index],
                    width: size.width,
                };
                setColumns(newColumns)
            };

        const getMergeColumns = (): ColumnsType<hunter.Item> => {

            if (!columns) {
                return defaultColumns
            }

            return columns?.map((col, index) => ({
                ...col,
                onHeaderCell: (column: ColumnsType<hunter.Item>[number]) => ({
                    width: column.width,
                    onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
                }),
            }));
        }

        const handleFirstQuery = async (pageSize: number) => {
            const {input, isWeb, dateRange, statusCode, portFilter} = this.state
            const tmpInput = input.trim()
            setCurrentPageSize(pageSize)
            if (tmpInput === "") {
                return
            }
            setLoading(true)
            setCurrentPage(1)
            setTotal(0)
            pageIDMap.current = []
            this.setState({
                inputCache: tmpInput,
            })

            //不能使用ineputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
            Query(0, tmpInput, 1, pageSize, dateRange[0] ? dateRange[0] : "", dateRange[1] ? dateRange[1] : "", isWeb, statusCode, portFilter).then(
                result => {
                    let index = 0
                    setPageData(result.items?.map((item) => {
                        const instance = new hunter.Item(item)
                        const {convertValues, ...reset} = instance
                        return {index: ++index, ...item, convertValues, ...reset}
                    }))
                    setTotal(result.total)
                    setLoading(false)
                    pageIDMap.current[1] = result.id
                    dispatch(setHunterUser({
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
            const {isWeb, statusCode, portFilter, dateRange, inputCache} = this.state

            //page发生变换，size使用原size
            if (newPage != currentPage && newSize == currentPageSize) {
                setLoading(true)
                let pageID = pageIDMap.current[newPage]
                pageID = pageID ? pageID : 0
                Query(pageID, inputCache, newPage, currentPageSize, dateRange[0] ? dateRange[0] : "", dateRange[1] ? dateRange[1] : "", isWeb, statusCode, portFilter).then(
                    result => {
                        let index = (newPage - 1) * currentPageSize
                        setPageData(result.items.map(item => {
                            const instance = new hunter.Item(item)
                            const {convertValues, ...rest} = instance
                            return {index: ++index, ...rest, convertValues}
                        }))
                        setCurrentPage(newPage)
                        setTotal(result.total)
                        pageIDMap.current[newPage] = result.id
                        dispatch(setHunterUser({
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
                // const result = await $hunterQuery({
                //     page: newPage, size: currentPageSize, query: inputCache,
                //     isWeb: isWeb,
                //     startTime: dateRange[0] ? dateRange[0] : "",
                //     endTime: dateRange[1] ? dateRange[1] : "",
                //     statusCode: statusCode,
                //     portFilter: portFilter
                // })
                // if (result.error) {
                //     errorNotification("Hunter查询出错", result.error)
                //     setLoading(false)
                //     return
                // }

            }

            //size发生变换，page设为1
            if (newSize != currentPageSize) {
                handleFirstQuery(newSize)
            }
        }

        const onFieldsChange = (fields: CheckboxValueType[]) => {
            const tmpCols = defaultColumns.filter(col => fields.includes((col as any)["dataIndex"]))
            const tmp = tmpCols.map(col => ({...col}));
            // if (tmp.length > 0) {
            //     delete tmp[tmp.length - 1]["width"]
            // }
            setColumns(tmp)
            this.setState({
                checkedFields: tmp.map(item => (item as any).dataIndex)
            })
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
                this.setState({input: `web.icon="${hash}"`})
                handleFirstQuery(currentPageSize)
                hide()
            }
        }

        return <div>
            <Flex justify={"center"} style={{marginBottom: "5px"}}>
                <Input
                    style={{width: "600px"}}
                    size="small"
                    allowClear
                    value={input}
                    onPressEnter={() => handleFirstQuery(currentPageSize)}
                    onChange={(e) => this.setState({input: e.target.value})}
                    suffix={
                        <Popover
                            placement={"bottom"}
                            style={{width: 500}}
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
                                        <Flex vertical gap={5} style={{width: "600px"}}>
                                            <Input
                                                onChange={e => setFaviconUrl(e.target.value)}
                                                size={"small"}
                                                placeholder={"icon地址"}
                                                suffix={<Button type='text' size="small" icon={<SearchOutlined/>}
                                                                onClick={getFaviconFromUrl}/>}
                                            />
                                            <Upload.Dragger
                                                showUploadList={false}
                                                multiple={false}
                                                customRequest={(options) => {
                                                    const {file, onError} = options;
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
                                                    <InboxOutlined/>
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
                                <Button size={"small"} type={"text"} icon={<Dots/>}/>
                            </Popover>
                        </Popover>
                    }
                    placeholder='Search...'
                />
                <Button type='text' size="small" icon={<SearchOutlined/>}
                        onClick={() => handleFirstQuery(currentPageSize)}/>
                <Help/>
            </Flex>
            <Space
                style={{display: "flex", justifyContent: 'center', alignItems: "center", marginBottom: "5px"}}
                split={<Divider type="vertical" style={{margin: "0px"}}/>}
            >
                <label style={{fontSize: "14px", marginRight: "5px"}}>
                    资产类型
                    <Select size="small"
                            style={{width: "110px"}}
                            defaultValue={3 as 1 | 2 | 3}
                            options={[{label: "web资产", value: 1}, {label: "非web资产", value: 2}, {
                                label: "全部",
                                value: 3
                            },]}
                            onChange={(value) => this.setState({isWeb: value})}/>
                </label>
                <DatePicker.RangePicker
                    presets={[
                        ...RangePresets,
                    ]}
                    style={{width: "230px"}}
                    size="small"
                    onChange={async (_dates, dateStrings) => {
                        this.setState({dateRange: dateStrings})
                    }}
                    allowEmpty={[true, true]}
                    showNow
                />
                <Input style={{width: "300px"}} size="small" placeholder='状态码列表，以逗号分隔，如”200,401“'
                       onChange={(e) => this.setState({statusCode: e.target.value})}/>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                }}>
                    <label style={{marginRight: "5px"}}>数据过滤</label><Switch size="small" checkedChildren="开启"
                                                                                unCheckedChildren="关闭"
                                                                                onChange={(value) => this.setState({portFilter: value})}/>
                </div>
                <div>
                    <label>列设置</label>
                    <ColumnsFilter
                        dataSource={columnFilterDataSource}
                        checkedSource={checkedColsValue}
                        onChange={(checkedList: CheckboxValueType[]) => onFieldsChange(checkedList)}/>
                </div>
            </Space>
            <Dropdown
                menu={{items: menuItems, onClick: handleMenuItemClick}}
                trigger={['contextMenu']}
                open={openContextMenu}
                onOpenChange={(v) => {
                    setOpenContextMenu(v ? pageData.length > 0 : false)
                }}
            >
                <div>
                    <Table
                        // locale={{ emptyText: "暂无数据" }}
                        showSorterTooltip={false}
                        scroll={{y: tableScrollHeight, scrollToFirstRowOnChange: true}}
                        bordered
                        columns={getMergeColumns()}
                        components={{
                            header: {
                                cell: ResizableTitle,
                            },
                        }}
                        dataSource={pageData}
                        loading={loading}
                        size="small"
                        pagination={false}
                        footer={() => <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
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
                            <this.ExportDataPanel id={pageIDMap.current[1]} total={total}
                                                  currentPageSize={currentPageSize}/>
                        </div>}
                        rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
                    />
                </div>
            </Dropdown>

        </div>
        // const result = Array.from({ length: 100 }, ()=>{
        //     return {
        //         is_risk: "1",
        //         url: "baidu.com",
        //         ip: "string",
        //         port: 8080,
        //         web_title: "string",
        //         domain: "string",
        //         is_risk_protocol: "string",
        //         protocol: "string",
        //         base_protocol: "string",
        //         status_code: 200,
        //         component: [],
        //         os: "string",
        //         company: "string",
        //         number: "string",
        //         country: "string",
        //         province: "string",
        //         city: "string",
        //         updated_at: "string",
        //         is_web: "string",
        //         as_org: "string",
        //         isp: "string",
        //         banner: "string",
        //     };
        // })
        // return <div style={{maxHeight:"calc(100vh - 110px)",overflow:"scroll"}}>
        //     <Table
        //         sticky={{ offsetHeader: 0 }}
        //         summary={() => (
        //             <Table.Summary fixed={'bottom'}>
        //                 <Table.Summary.Row>
        //                     <Table.Summary.Cell index={0} colSpan={columns.length}>
        //                         <div
        //                             style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        //                             <Pagination
        //                                 showQuickJumper
        //                                 showSizeChanger
        //                                 total={total}
        //                                 pageSizeOptions={pageSizeOptions}
        //                                 defaultPageSize={pageSizeOptions[0]}
        //                                 defaultCurrent={1}
        //                                 current={currentPage}
        //                                 showTotal={(total) => `${total} items`}
        //                                 size="small"
        //                                 onChange={(page, size) => handlePaginationChange(page, size)}
        //                             />
        //                             <this.ExportDataPanel id={pageIDMap.current[1]} total={total}
        //                                                   currentPageSize={currentPageSize}/>
        //                         </div>
        //                     </Table.Summary.Cell>
        //                 </Table.Summary.Row>
        //             </Table.Summary>
        //         )}
        //
        //         // locale={{ emptyText: "暂无数据" }}
        //         showSorterTooltip={false}
        //         // scroll={{y: 'calc(100vh - 229px)', scrollToFirstRowOnChange: true}}
        //         // scroll={{y: 1500, scrollToFirstRowOnChange: true}}
        //         bordered
        //         columns={getMergeColumns()}
        //         components={{
        //             header: {
        //                 cell: ResizableTitle,
        //             },
        //         }}
        //         dataSource={pageData}
        //         loading={loading}
        //         size="small"
        //         pagination={false}
        //         // footer={() => <div
        //         //     style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        //         //     <Pagination
        //         //         showQuickJumper
        //         //         showSizeChanger
        //         //         total={total}
        //         //         pageSizeOptions={pageSizeOptions}
        //         //         defaultPageSize={pageSizeOptions[0]}
        //         //         defaultCurrent={1}
        //         //         current={currentPage}
        //         //         showTotal={(total) => `${total} items`}
        //         //         size="small"
        //         //         onChange={(page, size) => handlePaginationChange(page, size)}
        //         //     />
        //         //     <this.ExportDataPanel id={pageIDMap.current[1]} total={total}
        //         //                           currentPageSize={currentPageSize}/>
        //         // </div>}
        //         rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
        //     />
        // </div>
    }

    render() {
        return <this.Content/>
    }
}


type TabType = {
    label: string,
    key: string,
    children: ReactNode,
    closable?: boolean
}

const AuthSetting: React.FC = () => {
    const [form] = Form.useForm()
    const [editable, setEditable] = useState(false)
    useSelector((state: RootState) => state.config.auth?.hunter);
    const [open, setOpen] = useState<boolean>(false)
    const dispatch = useDispatch()

    function save(values: any) {
        setOpen(false)
        setEditable(false)
        form.setFieldsValue(values);
        dispatch(setHunterAuth(values))
        SetAuth(values.key).catch(
            err => errorNotification("错误", err)
        )
    }

    return (
        <><Tooltip title="设置">
            <Button type='link' onClick={() => setOpen(true)}><UserOutlined/></Button>
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
                afterOpenChange={open => {
                    open && GetHunter().then(
                        result => {
                            form.setFieldsValue({
                                key: result.token,
                            });
                        }
                    ).catch(
                        err => errorNotification("错误", err)
                    )
                }}
            >
                <Form
                    {...authFormProps}
                    form={form}
                    disabled={!editable}
                    onFinish={(values) => {
                        save(values);
                    }}
                >
                    <Form.Item name="key">
                        <Input.Password placeholder="token"/>
                    </Form.Item>
                </Form>
                <div style={{display: 'flex', justifyContent: "flex-end"}}>
                    {!editable ?
                        <Button {...buttonProps} onClick={() => setEditable(true)}>修改</Button>
                        :
                        <>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={() => form.submit()}
                            >保存</Button>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={() => {
                                        setEditable(false);
                                        setOpen(false)
                                    }}
                            >取消</Button>
                        </>}
                </div>
            </Modal>
        </>)
}

class Hunter extends React.Component {
    state = {
        activeKey: "",
        tabCount: 0,
        tabRefs: [] as TabContent[],
        items: [] as TabType[],
    };

    componentDidMount(): void {
        const initialTabKey = `${++this.state.tabCount}`;
        this.setState({
            activeKey: initialTabKey,
            items: [{
                label: initialTabKey,
                key: initialTabKey,
                // children: <TabContent ref={(r: TabContent) => {
                //     if (r) {
                //         this.setState({ tabRefs: [r] });
                //     }
                // }}
                //     runCallBack={(e) => this.addTab(e)}
                // />,
                children: <TabContent
                    ref={(r: TabContent) => {
                        if (r) {
                            this.setState({tabRefs: [r]});
                        }
                    }}
                    onContextMenu={{
                        addTab: (i) => this.addTab(i),
                        input: "",
                    }}
                    checkedColsValue={defaultCheckedColsDataIndex}/>,
            }],
        });
    }

    onTabChange = (newActiveKey: string) => {
        this.setState({activeKey: newActiveKey});
    };

    addTab = (input: string) => {
        const newActiveKey = `${++this.state.tabCount}`;
        const checkedFields = this.state.tabRefs[parseInt(this.state.activeKey) - 1]?.getCheckedFields()

        const newPanes = [
            ...this.state.items,
            {
                label: newActiveKey,
                key: newActiveKey,
                children: <TabContent
                    ref={(r: TabContent) => {
                        if (r) {
                            this.setState({tabRefs: [r]});
                        }
                    }}
                    checkedColsValue={checkedFields}
                    onContextMenu={{
                        addTab: (i) => this.addTab(i),
                        input: input,
                    }}
                />,

            },
        ];
        this.setState({items: newPanes, activeKey: newActiveKey});
    };

    removeTab = (targetKey: TargetKey) => {
        let newActiveKey = this.state.activeKey;
        const lastIndex = -1;
        const newPanes = this.state.items.filter((item) => item.key !== targetKey);
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key;
            } else {
                newActiveKey = newPanes[0].key;
            }
        }
        this.setState({items: newPanes, activeKey: newActiveKey});
    };

    onEditTab = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            this.addTab("");
        } else {
            this.removeTab(targetKey);
        }
    };

    UserPanel = () => {
        const user = useSelector((state: RootState) => state.user.hunter)
        return <div style={{
            width: "auto",
            height: "23px",
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f1f3f4"
        }}>
            <AuthSetting/>
            <Divider type="vertical"/>
            <Space>
                <Tooltip title="剩余总积分">
                    <div style={{
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        color: "#f5222d"
                    }}>
                        <img src={PointBuy}/>
                        {user.restToken}
                    </div>
                </Tooltip>
                <Tooltip title="查询后自动获取">
                    <Button size="small" shape="circle" type="text" icon={<ExclamationCircleOutlined/>}/>
                </Tooltip>
            </Space>


        </div>
    }

    render(): React.ReactNode {
        return (
            <Tabs
                size="small"
                tabBarExtraContent={{
                    left: <this.UserPanel/>
                }}
                type="editable-card"
                onChange={this.onTabChange}
                activeKey={this.state.activeKey}
                onEdit={this.onEditTab}
                items={this.state.items}
            />
        );
    }
}


interface AdvancedHelpDataType {
    index: number;
    connector: string;
    description: string;
}

const advancedHelpColumns: ColumnsType<AdvancedHelpDataType> = [
    {title: '序号', dataIndex: "index", width: 50},
    {title: '连接符', dataIndex: "connector", width: 100},
    {title: '查询含义', dataIndex: "description",},
];

const advancedHelpData: AdvancedHelpDataType[] = [
    {
        index: 1,
        connector: '=',
        description: "模糊查询，表示查询包含关键词的资产",
    },
    {
        index: 2,
        connector: '==',
        description: "精确查询，表示查询有且仅有关键词的资产",
    },
    {
        index: 3,
        connector: '!=',
        description: "模糊剔除，表示剔除包含关键词的资产",
    },
    {
        index: 4,
        connector: '!==',
        description: "精确剔除，表示剔除有且仅有关键词的资产",
    },
    {
        index: 5,
        connector: '&&、||',
        description: "多种条件组合查询，&&同and，表示和；||同or，表示或",
    },
    {
        index: 6,
        connector: '()',
        description: "括号内表示查询优先级最高",
    },
];

type ExampleHelpDataType = {
    index: number;
    example: any;
    description: any;
}

const exampleHelpColumns: ColumnsType<ExampleHelpDataType> = [
    {title: '序号', dataIndex: "index", width: 50},
    {title: '语法内容', dataIndex: "example", width: 300},
    {title: '语法说明', dataIndex: "description"},
];

const exampleHelpDataTabs: Tab[] = [
    {
        key: "1",
        label: "hot热门语法",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: <>ip.tag="CDN"</>,
                                 description: <>查询包含IP标签"CDN"的资产<Popover destroyTooltipOnHide
                                                                                  content={<List size='small'
                                                                                                 split={false}
                                                                                                 dataSource={["云厂商", "CDN", "蜜罐"]}
                                                                                                 renderItem={(item) => (
                                                                                                     <List.Item>
                                                                                                         {item}
                                                                                                     </List.Item>
                                                                                                 )}
                                                                                  />}
                                                                                  trigger="hover">
                                     <Button size='small' type='link'>(查看枚举值)</Button>
                                 </Popover>
                                 </>
                             },
                             {
                                 index: 2, example: <>web.similar="baidu.com:443"</>,
                                 description: <>查询与baidu.com:443网站的特征相似的资产</>
                             },
                             {
                                 index: 3, example: <>web.similar_icon=="17262739310191283300"</>,
                                 description: <>查询网站icon与该icon相似的资产</>
                             },
                             {
                                 index: 4, example: <>web.similar_id="3322dfb483ea6fd250b29de488969b35"</>,
                                 description: <>查询与该网页相似的资产</>
                             },
                             {
                                 index: 5, example: <>web.tag="登录页面"</>,
                                 description:
                                     <>查询包含资产标签"登录页面"的资产<Popover destroyTooltipOnHide
                                                                                content={<List size='small'
                                                                                               split={false} style={{
                                                                                    maxHeight: "200px",
                                                                                    overflowY: "scroll"
                                                                                }} renderItem={(item) => (
                                                                                    <List.Item>{item}</List.Item>)}
                                                                                               dataSource={["登录页面", "主机面板", "CDN", "CMS", "网络摄像设备", "防火墙设备", "WAF", "信息页面", "OA", "数据库管理器", "版本管理仓库", "任务管理器", "VoIP", "API Manager", "SaaS", "Blogs", "IaaS", "航班跟踪系统", "人机界面", "Payment processors", "电力适配设备", "警卫追踪系统", "蜜罐", "RoIP", "Comment systems", "SEO", "Tag managers"]}
                                                                                               footer={<span><Divider
                                                                                                   style={{margin: "0px 0 10px 0"}}/><span
                                                                                                   style={{
                                                                                                       display: "flex",
                                                                                                       justifyContent: "center",
                                                                                                       color: "#bfbfbf"
                                                                                                   }}>最多展示top30</span></span>}
                                                                                />}
                                                                                trigger="hover">
                                         <Button size='small' type='link'>(查看枚举值)</Button>
                                     </Popover>
                                     </>
                             },
                             {
                                 index: 6, example: <>domain.suffix="qianxin.com"</>,
                                 description: "搜索主域为\"qianxin.com\"的网站"
                             },
                             {
                                 index: 7, example: <>web.icon="22eeab765346f14faf564a4709f98548"</>,
                                 description: "查询网站icon与该icon相同的资产"
                             },
                             {
                                 index: 8, example: "ip.port_count>\"2\"",
                                 description: "搜索开放端口大于2的IP（支持等于、大于、小于）"
                             },
                             {
                                 index: 9, example: "is_web=true",
                                 description: "is_web=true"
                             },
                             {
                                 index: 10, example: "cert.is_trust=true",
                                 description: "cert.is_trust=true"
                             },
                         ]}
        />
    },
    {
        key: "2",
        label: "new新上语法",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "is_domain.cname=true",
                                 description: "搜索含有cname解析记录的网站"
                             },
                             {
                                 index: 2, example: "domain.cname=\"a6c56dbcc1f22283.qaxanyu.com\"",
                                 description: "搜索cname包含“a6c56dbcc1f22283.qaxanyu.com”的网站"
                             },
                             {
                                 index: 3, example: "domain.status=\"clientDeleteProhibited\"",
                                 description: <>搜索域名状态为"client Delete Prohibited"的网站<Popover
                                     destroyTooltipOnHide
                                     content={<List size='small' split={false}
                                                    style={{maxHeight: "200px", overflowY: "scroll"}}
                                                    renderItem={(item) => (<List.Item>{item}</List.Item>)}
                                                    dataSource={["clientDeleteProhibited", "clientTransferProhibited", "clientUpdateProhibited", "serverDeleteProhibited", "serverTransferProhibited", "serverUpdateProhibited"]}
                                     />}
                                     trigger="hover">
                                     <Button size='small' type='link'>(查看枚举值)</Button>
                                 </Popover>
                                 </>
                             },
                             {
                                 index: 4, example: "domain.whois_server=\"whois.markmonitor.com\"",
                                 description: "搜索whois服务器为\"whois.markmonitor.com\"的网站"
                             },
                             {
                                 index: 5, example: "domain.name_server=\"ns1.qq.com\"",
                                 description: "domain.name_server=\"ns1.qq.com\""
                             },
                             {
                                 index: 6, example: "domain.created_date=\"2022-06-01\"",
                                 description: "搜索域名创建时间为\"2022-06-01\"的网站"
                             },
                             {
                                 index: 7, example: "domain.expires_date=\"2022-06-01\"",
                                 description: "搜索域名到期时间为\"2022-06-01\"的网站"
                             },
                             {
                                 index: 8, example: "domain.updated_date=\"2022-06-01\"",
                                 description: "搜索域名更新时间为\"2022-06-01\"的网站"
                             },
                             {
                                 index: 9, example: "cert.subject.suffix=\"qianxin.com\"",
                                 description: "搜索证书使用者为qianxin.com的资产"
                             },
                             {
                                 index: 10, example: "icp.industry=\"软件和信息技术服务业\"",
                                 description: <>搜索ICP备案行业为“软件和信息技术服务业”的资产<Popover
                                     destroyTooltipOnHide
                                     content={<List size='small' split={false}
                                                    style={{maxHeight: "200px", overflowY: "scroll"}}
                                                    renderItem={(item) => (<List.Item>{item}</List.Item>)}
                                                    dataSource={
                                                        ["软件和信息技术服务业", "科技推广和应用服务业", "批发业", "建筑装饰、装修和其他建筑业", "商务服务业", "研究和试验发展", "互联网和相关服务", "零售业", "专业技术服务业", "土木工程建筑业", "航空运输业", "金属制品业", "计算机、通信和其他电子设备制造业", "通用设备制造业", "专用设备制造业", "电气机械和器材制造业", "文化艺术业", "货币金融服务", "卫生", "租赁业", "房地产业", "居民服务业", "道路运输业", "医药制造业", "汽车制造业", "新闻和出版业", "农业", "橡胶和塑料制品业", "广播、电视、电影和录音制作业", "非金属矿物制品业", "资本市场服务", "化学原料和化学制品制造业", "多式联运和运输代理业", "纺织服装、服饰业", "食品制造业", "其他服务业", "餐饮业", "娱乐业", "电信、广播电视和卫星传输服务", "仪器仪表制造业", "保险业", "家具制造业", "其他制造业", "机动车、电子产品和日用产品修理业", "房屋建筑业", "文教、工美、体育和娱乐用品制造业", "建筑安装业", "住宿业", "电力、热力生产和供应业", "体育", "装卸搬运和仓储业", "其他金融业", "印刷和记录媒介复制业", "纺织业", "畜牧业", "农副食品加工业", "农、林、牧、渔专业及辅助性活动", "皮革、毛皮、羽毛及其制品和制鞋业", "水的生产和供应业", "铁路、船舶、航空航天和其他运输设备制造业", "教育", "酒、饮料和精制茶制造业", "公共设施管理业", "木材加工和木、竹、藤、棕、草制品业", "水上运输业", "社会工作", "造纸和纸制品业", "黑色金属冶炼和压延加工业", "生态保护和环境治理业", "邮政业", "有色金属冶炼和压延加工业", "林业", "燃气生产和供应业", "废弃资源综合利用业", "金属制品、机械和设备修理业", "石油、煤炭及其他燃料加工业", "渔业", "有色金属矿采选业", "水利管理业", "煤炭开采和洗选业", "化学纤维制造业", "开采专业及辅助性活动", "烟草制品业", "非金属矿采选业"]
                                                    }
                                                    footer={<span><Divider style={{margin: "0px 0 10px 0"}}/><span
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            color: "#bfbfbf"
                                                        }}>最多展示top30</span></span>}
                                     />}
                                     trigger="hover">
                                     <Button size='small' type='link'>(查看枚举值)</Button>
                                 </Popover>
                                 </>
                             },
                             {
                                 index: 11, example: "ip.tag=\"CDN\"",
                                 description: <>查询包含IP标签"CDN"的资产<Popover destroyTooltipOnHide
                                                                                  content={<List size='small'
                                                                                                 split={false}
                                                                                                 dataSource={["云厂商", "CDN", "蜜罐"]}
                                                                                                 renderItem={(item) => (
                                                                                                     <List.Item>
                                                                                                         {item}
                                                                                                     </List.Item>
                                                                                                 )}
                                                                                  />}
                                                                                  trigger="hover">
                                     <Button size='small' type='link'>(查看枚举值)</Button>
                                 </Popover>
                                 </>
                             },
                             {
                                 index: 12, example: "is_web=true",
                                 description: "搜索web资产"
                             },
                             {
                                 index: 13,
                                 example: "tls-jarm.hash=\"21d19d00021d21d21c21d19d21d21da1a818a999858855445ec8a8fdd38eb5\"",
                                 description: "搜索tls-jarm哈希为21d19d00021d21d21c21d19d21d21da1a818a999858855445ec8a8fdd38eb5的资产"
                             },
                             {
                                 index: 14,
                                 example: "tls-jarm.ans=\"c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,00c0|0303|h2|ff01-0000-0001-0023-0010-0017,|||,c013|0303||ff01-0000-0001-000b-0023-0017,c013|0303||ff01-0000-0001-000b-0023-0017,c013|0302|h2|ff01-0000-0001-000b-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,00c0|0303|h2|ff01-0000-0001-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017\"",
                                 description: "搜索tls-jarmANS为c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,00c0|0303|h2|ff01-0000-0001-0023-0010-0017,|||,c013|0303||ff01-0000-0001-000b-0023-0017,c013|0303||ff01-0000-0001-000b-0023-0017,c013|0302|h2|ff01-0000-0001-000b-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,00c0|0303|h2|ff01-0000-0001-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017的资产"
                             },
                             {
                                 index: 15, example: "web.tag=\"登录页面\"",
                                 description: <>查询包含资产标签"登录页面"的资产<Popover destroyTooltipOnHide
                                                                                         content={<List size='small'
                                                                                                        split={false}
                                                                                                        style={{
                                                                                                            maxHeight: "200px",
                                                                                                            overflowY: "scroll"
                                                                                                        }}
                                                                                                        renderItem={(item) => (
                                                                                                            <List.Item>{item}</List.Item>)}
                                                                                                        dataSource={["登录页面", "主机面板", "CDN", "CMS", "网络摄像设备", "防火墙设备", "WAF", "信息页面", "OA", "数据库管理器", "版本管理仓库", "任务管理器", "VoIP", "API Manager", "SaaS", "Blogs", "IaaS", "航班跟踪系统", "人机界面", "Payment processors", "电力适配设备", "警卫追踪系统", "蜜罐", "RoIP", "Comment systems", "SEO", "Tag managers"]}
                                                                                                        footer={
                                                                                                            <span><Divider
                                                                                                                style={{margin: "0px 0 10px 0"}}/><span
                                                                                                                style={{
                                                                                                                    display: "flex",
                                                                                                                    justifyContent: "center",
                                                                                                                    color: "#bfbfbf"
                                                                                                                }}>最多展示top30</span></span>}
                                                                                         />}
                                                                                         trigger="hover">
                                     <Button size='small' type='link'>(查看枚举值)</Button>
                                 </Popover>
                                 </>
                             },
                             {
                                 index: 16, example: "web.is_vul=true",
                                 description: "查询存在历史漏洞的资产"
                             },
                         ]}
        />
    },
    {
        key: "3",
        label: "char特色语法",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "web.similar=\"baidu.com:443\"",
                                 description: "通过网络特征搜索资产"
                             },
                             {
                                 index: 2, example: "web.similar_id=\"3322dfb483ea6fd250b29de488969b35\"",
                                 description: "搜索相似网站"
                             },
                             {
                                 index: 3, example: "web.similar_icon==\"17262739310191283300\"",
                                 description: "搜索相似网站icon搜索资产"
                             },
                             {
                                 index: 4, example: "web.tag=\"登录页面\"",
                                 description:
                                     <>查询包含资产标签"登录页面"的资产<Popover destroyTooltipOnHide
                                                                                content={<List size='small'
                                                                                               split={false} style={{
                                                                                    maxHeight: "200px",
                                                                                    overflowY: "scroll"
                                                                                }} renderItem={(item) => (
                                                                                    <List.Item>{item}</List.Item>)}
                                                                                               dataSource={["登录页面", "主机面板", "CDN", "CMS", "网络摄像设备", "防火墙设备", "WAF", "信息页面", "OA", "数据库管理器", "版本管理仓库", "任务管理器", "VoIP", "API Manager", "SaaS", "Blogs", "IaaS", "航班跟踪系统", "人机界面", "Payment processors", "电力适配设备", "警卫追踪系统", "蜜罐", "RoIP", "Comment systems", "SEO", "Tag managers"]}
                                                                                               footer={<span><Divider
                                                                                                   style={{margin: "0px 0 10px 0"}}/><span
                                                                                                   style={{
                                                                                                       display: "flex",
                                                                                                       justifyContent: "center",
                                                                                                       color: "#bfbfbf"
                                                                                                   }}>最多展示top30</span></span>}
                                                                                />}
                                                                                trigger="hover">
                                         <Button size='small' type='link'>(查看枚举值)</Button>
                                     </Popover>
                                     </>
                             },
                             {
                                 index: 5, example: "ip.tag=\"CDN\"",
                                 description: <>查询包含IP标签"CDN"的资产<Popover destroyTooltipOnHide
                                                                                  content={<List size='small'
                                                                                                 split={false}
                                                                                                 dataSource={["云厂商", "CDN", "蜜罐"]}
                                                                                                 renderItem={(item) => (
                                                                                                     <List.Item>
                                                                                                         {item}
                                                                                                     </List.Item>
                                                                                                 )}
                                                                                  />}
                                                                                  trigger="hover">
                                     <Button size='small' type='link'>(查看枚举值)</Button>
                                 </Popover>
                                 </>
                             },
                         ]}
        />
    },
    {
        key: "4",
        label: "IP",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "ip.city=\"北京\"",
                                 description: "搜索IP对应主机所在城市为”北京“市的资产"
                             },
                             {
                                 index: 2, example: "ip.isp=\"电信\"",
                                 description: "搜索运营商为”中国电信”的资产"
                             },
                             {
                                 index: 3, example: "ip.os=\"Windows\"",
                                 description: "搜索操作系统标记为”Windows“的资产"
                             },
                             {
                                 index: 4, example: "app=\"Hikvision 海康威视 Firmware 5.0+\" && ip.ports=\"8000\"",
                                 description: "检索使用了Hikvision且ip开放8000端口的资产"
                             },
                             {
                                 index: 5, example: "ip.port_count>\"2\"",
                                 description: "搜索开放端口大于2的IP（支持等于、大于、小于）"
                             },
                             {
                                 index: 6, example: "ip.ports=\"80\" && ip.ports=\"443\"",
                                 description: "搜索含有cname解析记录的网站"
                             },
                             {
                                 index: 7, example: "ip.tag=\"CDN\"",
                                 description: <>查询包含IP标签"CDN"的资产<Popover destroyTooltipOnHide
                                                                                  content={<List size='small'
                                                                                                 split={false}
                                                                                                 dataSource={["云厂商", "CDN", "蜜罐"]}
                                                                                                 renderItem={(item) => (
                                                                                                     <List.Item>
                                                                                                         {item}
                                                                                                     </List.Item>
                                                                                                 )}
                                                                                  />}
                                                                                  trigger="hover">
                                     <Button size='small' type='link'>(查看枚举值)</Button>
                                 </Popover>
                                 </>
                             },
                         ]}
        />
    },
    {
        key: "5",
        label: "domain域名",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "is_domain=true",
                                 description: "搜索域名标记不为空的资产"
                             },
                             {
                                 index: 2, example: "domain=\"qianxin.com\"",
                                 description: "搜索域名包含\"qianxin.com\"的网站"
                             },
                             {
                                 index: 3, example: "domain.suffix=\"qianxin.com\"",
                                 description: "搜索主域为\"qianxin.com\"的网站"
                             },
                             {
                                 index: 4, example: "domain.status=\"clientDeleteProhibited\"",
                                 description: <>搜索域名状态为"client Delete Prohibited"的网站<Popover
                                     destroyTooltipOnHide
                                     content={<List size='small' split={false}
                                                    style={{maxHeight: "200px", overflowY: "scroll"}}
                                                    renderItem={(item) => (<List.Item>{item}</List.Item>)}
                                                    dataSource={["clientDeleteProhibited", "clientTransferProhibited", "clientUpdateProhibited", "serverDeleteProhibited", "serverTransferProhibited", "serverUpdateProhibited"]}
                                     />}
                                     trigger="hover">
                                     <Button size='small' type='link'>(查看枚举值)</Button>
                                 </Popover>
                                 </>
                             },
                             {
                                 index: 5, example: "domain.whois_server=\"whois.markmonitor.com\"",
                                 description: "搜索whois服务器为\"whois.markmonitor.com\"的网站"
                             },
                             {
                                 index: 6, example: "domain.name_server=\"ns1.qq.com\"",
                                 description: "搜索名称服务器为\"ns1.qq.com\"的网站"
                             },
                             {
                                 index: 7, example: "domain.created_date=\"2022-06-01\"",
                                 description: "搜索域名创建时间为\"2022-06-01\"的网站"
                             },
                             {
                                 index: 8, example: "domain.expires_date=\"2022-06-01\"",
                                 description: "搜索域名到期时间为\"2022-06-01\"的网站"
                             },
                             {
                                 index: 9, example: "domain.updated_date=\"2022-06-01\"",
                                 description: "搜索域名更新时间为\"2022-06-01\"的网站"
                             },
                             {
                                 index: 10, example: "domain.cname=\"a6c56dbcc1f22283.qaxanyu.com\"",
                                 description: "搜索cname包含“a6c56dbcc1f22283.qaxanyu.com”的网站"
                             },
                             {
                                 index: 11, example: "is_domain.cname=true",
                                 description: "搜索含有cname解析记录的网站"
                             }
                         ]}
        />
    },
    {
        key: "6",
        label: "header请求头",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "header.server==\"Microsoft-IIS/10\"",
                                 description: "搜索server全名为“Microsoft-IIS/10”的服务器"
                             },
                             {
                                 index: 2, example: "header.content_length=\"691\"",
                                 description: "搜索HTTP消息主体的大小为691的网站"
                             },
                             {
                                 index: 3, example: "header.status_code=\"402\"",
                                 description: "搜索HTTP请求返回状态码为”402”的资产"
                             },
                             {
                                 index: 4, example: "header=\"elastic\"",
                                 description: "搜索HTTP请求头中含有”elastic“的资产"
                             }
                         ]}
        />
    },
    {
        key: "7",
        label: "web网站信息",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "is_web=true",
                                 description: "搜索web资产"
                             },
                             {
                                 index: 2, example: "web.title=\"北京\"",
                                 description: "从网站标题中搜索“北京”"
                             },
                             {
                                 index: 3, example: "web.body=\"网络空间测绘\"",
                                 description: "搜索网站正文包含”网络空间测绘“的资产"
                             },
                             {
                                 index: 4, example: "after=\"2021-01-01\" && before=\"2021-12-31\"",
                                 description: "搜索2021年的资产"
                             }
                             ,
                             {
                                 index: 5, example: "web.similar=\"baidu.com:443\"",
                                 description: "查询与baidu.com:443网站的特征相似的资产"
                             }
                             ,
                             {
                                 index: 6, example: "web.similar_icon==\"17262739310191283300\"",
                                 description: "查询网站icon与该icon相似的资产"
                             }
                             ,
                             {
                                 index: 7, example: "web.icon=\"22eeab765346f14faf564a4709f98548\"",
                                 description: "查询网站icon与该icon相同的资产"
                             },
                             {
                                 index: 8, example: "web.similar_id=\"3322dfb483ea6fd250b29de488969b35\"",
                                 description: "查询与该网页相似的资产"
                             }
                             ,
                             {
                                 index: 9, example: "web.tag=\"登录页面\"",
                                 description:
                                     <>查询包含资产标签"登录页面"的资产<Popover destroyTooltipOnHide
                                                                                content={<List size='small'
                                                                                               split={false} style={{
                                                                                    maxHeight: "200px",
                                                                                    overflowY: "scroll"
                                                                                }} renderItem={(item) => (
                                                                                    <List.Item>{item}</List.Item>)}
                                                                                               dataSource={["登录页面", "主机面板", "CDN", "CMS", "网络摄像设备", "防火墙设备", "WAF", "信息页面", "OA", "数据库管理器", "版本管理仓库", "任务管理器", "VoIP", "API Manager", "SaaS", "Blogs", "IaaS", "航班跟踪系统", "人机界面", "Payment processors", "电力适配设备", "警卫追踪系统", "蜜罐", "RoIP", "Comment systems", "SEO", "Tag managers"]}
                                                                                               footer={<span><Divider
                                                                                                   style={{margin: "0px 0 10px 0"}}/><span
                                                                                                   style={{
                                                                                                       display: "flex",
                                                                                                       justifyContent: "center",
                                                                                                       color: "#bfbfbf"
                                                                                                   }}>最多展示top30</span></span>}
                                                                                />}
                                                                                trigger="hover">
                                         <Button size='small' type='link'>(查看枚举值)</Button>
                                     </Popover>
                                     </>
                             }

                         ]}
        />
    },
    {
        key: "8",
        label: "icp备案信息",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "icp.number=\"京ICP备16020626号-8\"",
                                 description: "搜索通过域名关联的ICP备案号为”京ICP备16020626号-8”的网站资产"
                             },
                             {
                                 index: 2, example: "icp.web_name=\"奇安信\"",
                                 description: "搜索ICP备案网站名中含有“奇安信”的资产"
                             },
                             {
                                 index: 3, example: "icp.name=\"奇安信\"",
                                 description: "搜索ICP备案单位名中含有“奇安信”的资产"
                             },
                             {
                                 index: 4, example: "icp.type=\"企业\"",
                                 description: "搜索ICP备案主体为“企业”的资产"
                             }
                             ,
                             {
                                 index: 5, example: "icp.industry=\"软件和信息技术服务业\"",
                                 description: <>搜索ICP备案行业为“软件和信息技术服务业”的资产<Popover
                                     destroyTooltipOnHide
                                     content={<List size='small' split={false}
                                                    style={{maxHeight: "200px", overflowY: "scroll"}}
                                                    renderItem={(item) => (<List.Item>{item}</List.Item>)}
                                                    dataSource={
                                                        ["软件和信息技术服务业", "科技推广和应用服务业", "批发业", "建筑装饰、装修和其他建筑业", "商务服务业", "研究和试验发展", "互联网和相关服务", "零售业", "专业技术服务业", "土木工程建筑业", "航空运输业", "金属制品业", "计算机、通信和其他电子设备制造业", "通用设备制造业", "专用设备制造业", "电气机械和器材制造业", "文化艺术业", "货币金融服务", "卫生", "租赁业", "房地产业", "居民服务业", "道路运输业", "医药制造业", "汽车制造业", "新闻和出版业", "农业", "橡胶和塑料制品业", "广播、电视、电影和录音制作业", "非金属矿物制品业", "资本市场服务", "化学原料和化学制品制造业", "多式联运和运输代理业", "纺织服装、服饰业", "食品制造业", "其他服务业", "餐饮业", "娱乐业", "电信、广播电视和卫星传输服务", "仪器仪表制造业", "保险业", "家具制造业", "其他制造业", "机动车、电子产品和日用产品修理业", "房屋建筑业", "文教、工美、体育和娱乐用品制造业", "建筑安装业", "住宿业", "电力、热力生产和供应业", "体育", "装卸搬运和仓储业", "其他金融业", "印刷和记录媒介复制业", "纺织业", "畜牧业", "农副食品加工业", "农、林、牧、渔专业及辅助性活动", "皮革、毛皮、羽毛及其制品和制鞋业", "水的生产和供应业", "铁路、船舶、航空航天和其他运输设备制造业", "教育", "酒、饮料和精制茶制造业", "公共设施管理业", "木材加工和木、竹、藤、棕、草制品业", "水上运输业", "社会工作", "造纸和纸制品业", "黑色金属冶炼和压延加工业", "生态保护和环境治理业", "邮政业", "有色金属冶炼和压延加工业", "林业", "燃气生产和供应业", "废弃资源综合利用业", "金属制品、机械和设备修理业", "石油、煤炭及其他燃料加工业", "渔业", "有色金属矿采选业", "水利管理业", "煤炭开采和洗选业", "化学纤维制造业", "开采专业及辅助性活动", "烟草制品业", "非金属矿采选业"]
                                                    }
                                                    footer={<span><Divider style={{margin: "0px 0 10px 0"}}/><span
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            color: "#bfbfbf"
                                                        }}>最多展示top30</span></span>}
                                     />}
                                     trigger="hover">
                                     <Button size='small' type='link'>(查看枚举值)</Button>
                                 </Popover>
                                 </>
                             }
                         ]}
        />
    },
    {
        key: "9",
        label: "protocol协议/端口响应",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "protocol=\"http\"",
                                 description: "搜索协议为”http“的资产"
                             },
                             {
                                 index: 2, example: "protocol.transport=\"udp\"",
                                 description: "搜索传输层协议为”udp“的资产"
                             },
                             {
                                 index: 3, example: "protocol.banner=\"nginx\"",
                                 description: "查询端口响应中包含\"nginx\"的资产"
                             },
                         ]}
        />
    },
    {
        key: "10",
        label: "app组件信息",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "app.name=\"小米 Router\"",
                                 description: "搜索标记为”小米 Router“的资产"
                             },
                             {
                                 index: 2, example: "app.type=\"开发与运维\"",
                                 description: "查询包含组件分类为\"开发与运维\"的资产"
                             },
                             {
                                 index: 3, example: "app.vendor=\"PHP\"",
                                 description: "查询包含组件厂商为\"PHP\"的资产"
                             },
                             {
                                 index: 4, example: "app.version=\"1.8.1\"",
                                 description: "查询包含组件版本为\"1.8.1\"的资产"
                             },
                         ]}
        />
    },
    {
        key: "11",
        label: "cert证书",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "cert=\"baidu\"",
                                 description: "搜索证书中带有baidu的资产"
                             },
                             {
                                 index: 2, example: "cert.subject=\"qianxin.com\"",
                                 description: "搜索证书使用者包含qianxin.com的资产"
                             },
                             {
                                 index: 3, example: "cert.subject.suffix=\"qianxin.com\"",
                                 description: "搜索证书使用者为qianxin.com的资产"
                             },
                             {
                                 index: 4, example: "cert.subject_org=\"奇安信科技集团股份有限公司\"",
                                 description: "搜索证书使用者组织是奇安信科技集团股份有限公司的资产"
                             },
                             {
                                 index: 5, example: "cert.issuer=\"Let's Encrypt Authority X3\"",
                                 description: "搜索证书颁发者是Let's Encrypt Authority X3的资产"
                             },
                             {
                                 index: 6, example: "cert.issuer_org=\"Let's Encrypt\"",
                                 description: "搜索证书颁发者组织是Let's Encrypt的资产"
                             },
                             {
                                 index: 7, example: "cert.sha-1=\"be7605a3b72b60fcaa6c58b6896b9e2e7442ec50\"",
                                 description: "搜索证书签名哈希算法sha1为be7605a3b72b60fcaa6c58b6896b9e2e7442ec50的资产"
                             },
                             {
                                 index: 8,
                                 example: "cert.sha-256=\"4e529a65512029d77a28cbe694c7dad1e60f98b5cb89bf2aa329233acacc174e\"",
                                 description: "搜索证书签名哈希算法sha256为4e529a65512029d77a28cbe694c7dad1e60f98b5cb89bf2aa329233acacc174e的资产"
                             },
                             {
                                 index: 9, example: "cert.sha-md5=\"aeedfb3c1c26b90d08537523bbb16bf1\"",
                                 description: "搜索证书签名哈希算法shamd5为aeedfb3c1c26b90d08537523bbb16bf1的资产"
                             },
                             {
                                 index: 10, example: "cert.serial_number=\"35351242533515273557482149369\"",
                                 description: "搜索证书序列号是35351242533515273557482149369的资产"
                             },
                             {
                                 index: 11, example: "cert.is_expired=true",
                                 description: "搜索证书已过期的资产"
                             },
                             {
                                 index: 12, example: "cert.is_trust=true",
                                 description: "搜索证书可信的资产"
                             },
                         ]}
        />
    },
    {
        key: "12",
        label: "vul漏洞信息",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "vul.gev=\"GEV-2021-1075\"",
                                 description: "查询存在该专项漏洞的资产"
                             },
                             {
                                 index: 2, example: "vul.cve=\"CVE-2021-2194\"",
                                 description: "查询存在该漏洞的资产"
                             },
                             {
                                 index: 3, example: "vul.gev=\"GEV-2021-1075\" && vul.state=\"已修复\"",
                                 description: "查询存在该专项漏洞资产中，已修复漏洞的资产"
                             },
                             {
                                 index: 4, example: "web.is_vul=true",
                                 description: "web.is_vul=true"
                             },
                         ]}
                         footer={() => <span style={{color: "red"}}>该语法仅监管用户可用</span>}
        />
    },
    {
        key: "13",
        label: "AS",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1, example: "as.number=\"136800\"",
                                 description: "搜索asn为\"136800\"的资产"
                             },
                             {
                                 index: 2, example: "as.name=\"CLOUDFLARENET\"",
                                 description: "搜索asn名称为\"CLOUDFLARENET\"的资产"
                             },
                             {
                                 index: 3, example: "as.org=\"PDR\"",
                                 description: "搜索asn注册机构为\"PDR\"的资产"
                             }
                         ]}
        />
    },
    {
        key: "14",
        label: "tls-jarm",
        children: <Table scroll={{y: 400}} size='small' pagination={false} columns={exampleHelpColumns}
                         dataSource={[
                             {
                                 index: 1,
                                 example: "tls-jarm.hash=\"21d19d00021d21d21c21d19d21d21da1a818a999858855445ec8a8fdd38eb5\"",
                                 description: "搜索tls-jarm哈希为21d19d00021d21d21c21d19d21d21da1a818a999858855445ec8a8fdd38eb5的资产"
                             },
                             {
                                 index: 2,
                                 example: "tls-jarm.ans=\"c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,00c0|0303|h2|ff01-0000-0001-0023-0010-0017,|||,c013|0303||ff01-0000-0001-000b-0023-0017,c013|0303||ff01-0000-0001-000b-0023-0017,c013|0302|h2|ff01-0000-0001-000b-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,00c0|0303|h2|ff01-0000-0001-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017\"",
                                 description: "搜索tls-jarmANS为c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,00c0|0303|h2|ff01-0000-0001-0023-0010-0017,|||,c013|0303||ff01-0000-0001-000b-0023-0017,c013|0303||ff01-0000-0001-000b-0023-0017,c013|0302|h2|ff01-0000-0001-000b-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,00c0|0303|h2|ff01-0000-0001-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017,c013|0303|h2|ff01-0000-0001-000b-0023-0010-0017的资产"
                             },
                         ]}
        />
    },
]

const Help: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    return <>
        <Tooltip title='帮助信息' placement='bottom'>
            <Button type='text' size="small" icon={<QuestionOutlined/>} onClick={() => setOpen(true)}/>
        </Tooltip>
        <Modal
            style={{top: "10%"}}
            bodyStyle={{overflowY: 'scroll', height: window.innerHeight - 160}}
            width={800}
            mask={false}
            maskClosable={true}
            title="帮助信息"
            open={open}
            footer={null}
            onCancel={() => setOpen(false)}
            destroyOnClose={true}
        >
            <Collapse expandIconPosition={"end"} items={[{
                key: "1", label: "搜索技巧",
                children: <Table scroll={{y: 500}} size="small" columns={advancedHelpColumns}
                                 dataSource={advancedHelpData} pagination={false} rowKey={"index"}/>
            }]} defaultActiveKey={['1']}
            />
            <Divider style={{marginTop: "20px", marginBottom: "20px"}}/>
            <div><Tabs items={exampleHelpDataTabs} tabPosition='left' size='small' tabBarGutter={0}/></div>
        </Modal></>
}


export default Hunter;