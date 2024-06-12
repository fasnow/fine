import React, {ReactNode, useEffect, useRef, useState} from 'react';
import { Button, Divider, Form, Input, InputNumber, Modal, Pagination, Select, Space, Switch, Table, Tabs, Tooltip, message } from 'antd';
import { SearchOutlined, QuestionOutlined, UserOutlined, SyncOutlined, CloudDownloadOutlined, LoadingOutlined, CloudOutlined, CopyOutlined, GlobalOutlined } from '@ant-design/icons';
import { errorNotification } from '@/component/Notification';
import { QUERY_FIRST, MenuItemsKey, copy } from '@/type';
import { ColumnGroupType, ColumnType, ColumnsType } from 'antd/es/table';
import ColumnsFilter, {CheckboxValueType, DataSourceItemType} from '@/component/ColumnFilter';
import ContextMenu from '@/component/ContextMenu';
import { RootState, setFofaAuth, setFofaUser } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import PointBuy from "@/assets/images/point-buy.svg"
import PointFree from "@/assets/images/point-free.svg"
import { ResizeCallbackData } from 'react-resizable';
import ResizableTitle from '@/component/ResizableTitle';
import { ExportDataPanelProps } from './Props';
import helpIcon from '@/assets/images/help.svg'
import { buttonProps, authFormProps } from '../setting/Setting';
import {fofa} from "../../../wailsjs/go/models";
import {Export, GetUserInfo, Query, SetAuth} from "../../../wailsjs/go/fofa/Bridge";
import {BrowserOpenURL, EventsOn} from "../../../wailsjs/runtime";

import {GetAllEvents} from "../../../wailsjs/go/event/Event";
import {GetFofa} from "../../../wailsjs/go/config/Config";
import {ItemType} from "antd/es/menu/interface";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

interface PageDataType extends fofa.Item{
   index:number
}

let selectedRow: { item: fofa.Item | undefined, rowIndex: number, colKey: string }|undefined = {
    item: undefined,
    rowIndex: 0,
    colKey: ''
}

const pageSizeOptions = [50, 100, 150, 200, 500]

const defaultCheckedColsValue: string[] = [
    "index",
    "ip",
    "port",
    "protocol",
    "title",
    "icp",
    "link",
    "options"
]

const columnFilterDataSource: DataSourceItemType[] = [
    { label: '序号', value: "index", },
    { label: '资产URL', value: "link", },//资产的URL链接,权限：无
    { label: 'ip地址', value: "ip", },//ip地址,权限：无
    { label: '端口', value: "port", },//端口,权限：无
    { label: '协议名', value: "protocol", },//协议名,权限：无
    { label: '基础协议', value: "base_protocol", },//基础协议，比如tcp,权限：无
    { label: '网站标题', value: "title", },//网站标题,权限：无
    { label: 'icp备案号', value: "icp", },//icp备案号,权限：无
    { label: '主机名', value: "host", },//主机名,权限：无
    { label: '域名', value: "domain", },//域名,权限：无
    { label: '网站header', value: "header", },//网站header,权限：无
    { label: '协议banner', value: "banner", },//协议banner,权限：无
    { label: '证书', value: "cert", },//证书,权限：无
    { label: '操作系统', value: "os", },//操作系统,权限：无
    { label: '网站server', value: "server", },//网站server,权限：无
    { label: '国家代码', value: "country", },//国家代码,权限：无
    { label: '国家名', value: "country_name", },//国家名,权限：无
    { label: '区域', value: "region", },//区域,权限：无
    { label: '城市', value: "city", },//城市,权限：无
    { label: '经度', value: "longitude", },//地理位置经度,权限：无
    { label: '纬度', value: "latitude", },//地理位置纬度,权限：无
    { label: 'asn编号', value: "as_number", },//asn编号,权限：无
    { label: 'asn组织', value: "as_organization", },//asn组织,权限：无
    { label: 'jarm指纹', value: "jarm", },//jarm指纹,权限：无
    { label: '产品名', value: "product", comment: "专业版本及以上" },//产品名,权限：专业版本及以上
    { label: '产品分类', value: "product_category", comment: "专业版本及以上" },//产品分类,权限：专业版本及以上
    { label: '版本号', value: "version", comment: "专业版本及以上" },//版本号,权限：专业版本及以上
    { label: '更新时间', value: "lastupdatetime", comment: "专业版本及以上" },//FOFA最后更新时间,权限：专业版本及以上
    { label: '域名cname', value: "cname", comment: "专业版本及以上" },//域名cname,权限：专业版本及以上
    { label: 'icon_hash', value: "icon_hash", comment: "商业版本及以上" },//返回的icon_hash值,权限：商业版本及以上
    { label: '证书是否有效', value: "certs_valid", comment: "商业版本及以上" },//证书是否有效,权限：商业版本及以上
    { label: 'cname的域名', value: "cname_domain", comment: "商业版本及以上" },//cname的域名,权限：商业版本及以上
    { label: '网站正文内容', value: "body", comment: "商业版本及以上" },//网站正文内容,权限：商业版本及以上
    { label: 'icon', value: "icon", comment: "企业会员" },//icon图标,权限：企业会员
    { label: 'fid', value: "fid", comment: "企业会员" },//fid,权限：企业会员
    { label: '结构化信息', value: "structinfo", comment: "企业会员" },//结构化信息(部分协议支持、比如elastic、mongodb),权限：企业会员
]

let index = 1

type TabContentProps = {
    // interface TabContentProps{
    onContextMenu: {
        addTab: (input: string) => void,
        input: string,
    }
    checkedColsValue: string[],
    // updateUserInfo: () => void,
}

type TabContentState = {
    checkedColsValue: string[],
    input: string,
    inputCache: string,
    checkedFields: string[],
    full: boolean,//全量搜索
}

const menuItems:ItemType[] = [
    {
        label: '浏览器打开URL',
        key: MenuItemsKey.OpenUrl,
        icon: <GlobalOutlined />
    },
    {
        label: '查询C段',
        key: MenuItemsKey.IpCidr,
        icon: <CloudOutlined />
    },
    {
        label: '查询IP',
        key: MenuItemsKey.Ip,
        icon: <CloudOutlined />
    },
    {
        label: '复制单元格',
        key: MenuItemsKey.CopyCell,
        icon: <CopyOutlined />
    },
    {
        label: '复制行',
        key: MenuItemsKey.CopyRow,
        icon: <CopyOutlined />
    },
    {
        label: '复制列',
        key: MenuItemsKey.CopyCol,
        icon: <CopyOutlined />
    },
];

class TabContent extends React.Component<TabContentProps, TabContentState>{
    constructor(props: TabContentProps) {
        super(props);
        this.state = {
            checkedColsValue: props.checkedColsValue,
            input: props.onContextMenu?.input || "",
            inputCache: '',
            checkedFields: props.checkedColsValue,
            full: false,
        }
    }

    tableId = `fofa-${index++}`

    // async componentDidMount() {
    //     window.addEventListener("resize", this.handleResize);
    //     this.handleResize()
    //     let tmpCols: (ColumnGroupType<fofa.Item> | ColumnType<fofa.Item>)[]
    //     let tmp: (ColumnGroupType<fofa.Item> | ColumnType<fofa.Item>)[]
    //     if (this.props.checkedColsValue) {
    //         tmpCols = this.defaultColumns.filter(col => this.props.checkedColsValue.includes((col as any)["dataIndex"]))
    //         tmp = tmpCols.map(col => ({ ...col }));
    //     } else {
    //         tmpCols = this.defaultColumns.filter(col => defaultCheckedColsValue.includes((col as any)["dataIndex"]))
    //         tmp = tmpCols.map(col => ({ ...col }));

    //     }
    //     // if (tmp.length > 0) {
    //     //     delete tmp[tmp.length - 1]["width"]
    //     // }
    //     await this.setState({ columns: tmp })//需要使用await，不然在query中的columns还没更新
    //     if (this.props.onContextMenu?.input) {
    //         this.query()
    //     }
    //     const elementWithId2 = document.getElementById(this.tableId);
    //     if (elementWithId2) {
    //         const antTableBody = document.querySelector('.ant-table-body');
    //         if (antTableBody) {
    //             antTableBody.addEventListener('scroll', this.handleScroll as unknown as EventListener);
    //             return () => {
    //                 // 在组件卸载时移除滚动事件监听器
    //                 antTableBody.removeEventListener('scroll', this.handleScroll as unknown as EventListener);
    //             };
    //         } else {
    //             console.log('找不到具有类名 ant-table-body 的元素');
    //         }
    //     }
    // }

    handleScroll = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const scrollTop = event.currentTarget.scrollTop;
        console.log('滚动条位置:', scrollTop, event);

        // 在这里可以执行滚动时的操作
    };

    getCheckedFields = () => {
        return this.state.checkedFields;
    };

    getInput = () => {
        return this.state.inputCache
    }

    private ExportDataPanel = (props: { id: number; total: number; currentPageSize: number, }) => {
        const user = useSelector((state: RootState) => state.user.fofa)
        const [page, setPage] = useState<number>(0)
        const [pageSize, setPageSize] = useState<number>(props.currentPageSize)
        const [status, setStatus] = useState<"" | "error" | "warning">("")
        const [isExporting, setIsExporting] = useState<boolean>(false)
        const [exportable, setExportable] = useState<boolean>(false)
        const [maxPage, setMaxPage] = useState<number>(0)
        const [disable,setDisable] = useState<boolean>(false)
        useEffect(() => {
            GetAllEvents().then(
                result=>{
                    EventsOn(String(result.hasNewFofaDownloadItem),()=>{
                        setIsExporting(false)
                        setDisable(false)
                    })
                }
            )
        }, []);

        useEffect(() => {
            const maxPage = Math.ceil(props.total / pageSize)
            setMaxPage(maxPage)
            if(page>maxPage){
                setPage(maxPage)
            }
        }, [pageSize, props.total])
        useEffect(() => {
            if (page > maxPage) {
              setPage(maxPage)
            }
          }, [page])
        const exportData = async (page: number) => {
            setIsExporting(true)
            if (!props.id) {
                errorNotification("导出结果", QUERY_FIRST)
                setIsExporting(false)
                return
            }
            setDisable(true)
            Export(Number(props.id),page,pageSize).catch(
                err=>{
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
                    if ((maxPage == 0) || (maxPage > 0 && (maxPage < page || page <= 0))) {
                        setStatus("error")
                        return
                    } else {
                        setStatus("")
                    }
                    setExportable(false)
                    exportData(page)
                }}
                onCancel={() => { setExportable(false); setStatus("") }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: "5px" }}>

                    <span style={{ display: 'flex', flexDirection: "row", gap: "10px", backgroundColor: '#f3f3f3', width: "100%" }}>当前F点: <label style={{ color: "red" }}>{user.fofa_point}</label></span>
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
                                onChange={(value: number|null) => {
                                    if(value!=null) {
                                        if(value > maxPage){
                                            setPage(maxPage)
                                        }else{
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

    private Content = () => {
        const [messageApi, contextHolder] = message.useMessage();
        const defaultColumns: ColumnsType<fofa.Item> = [
            {
                title: '序号', dataIndex: "index", ellipsis: true, width: 50, fixed: true, onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "index", }); },
                    }
                }
            },
            {
                title: 'URL', dataIndex: "link", width: 200, ellipsis: true, sorter: ((a, b) => a.link.localeCompare(b.link)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&   (selectedRow = { item: record, rowIndex: index, colKey: "link", }) },
                        onClick: () => copyCell(record.link)
                    }
                }
            },//资产的URL链接,权限：无
            {
                title: 'ip地址', dataIndex: "ip", ellipsis: true, width: 120, sorter: ((a, b) => a.ip.localeCompare(b.ip)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => {index != undefined &&   (selectedRow = { item: record, rowIndex: index, colKey: "ip" }) },
                        onClick: () => copyCell(record.ip)
                    }
                }
            },//ip地址,权限：无
            {
                title: '端口', dataIndex: "port", ellipsis: true, width: 80, sorter: ((a, b) => a.port.localeCompare(b.port)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "port" }) },
                        onClick: () => copyCell(record.port)
                    }
                }
            },//端口,权限：无
            {
                title: '协议名', dataIndex: "protocol", ellipsis: true, width: 80, sorter: ((a, b) => a.protocol.localeCompare(b.protocol)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "protocol" }) },
                        onClick: () => copyCell(record.protocol)
                    }
                }
            },//协议名,权限：无
            {
                title: '基础协议', dataIndex: "base_protocol", ellipsis: true, width: 100, sorter: ((a, b) => a.base_protocol.localeCompare(b.base_protocol)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "base_protocol" }) },
                        onClick: () => copyCell(record.base_protocol)
                    }
                }
            },//基础协议，比如tcp,权限：无
            {
                title: '网站标题', dataIndex: "title", width: 400, ellipsis: true, sorter: ((a, b) => a.title.localeCompare(b.title)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => {index != undefined &&   (selectedRow = { item: record, rowIndex: index, colKey: "title" }) },
                        onClick: () => copyCell(record.title)
                    }
                }
            },//网站标题,权限：无
            {
                title: 'icp备案号', dataIndex: "icp", width: 100, ellipsis: true, sorter: ((a, b) => a.icp.localeCompare(b.icp)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "icp" }) },
                        onClick: () => copyCell(record.icp)
                    }
                }
            },//icp备案号,权限：无
            {
                title: '主机名', dataIndex: "host", width: 200, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.host.localeCompare(b.host)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => {index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "host" }) },
                        onClick: () => copyCell(record.host)
                    }
                }
            },//主机名,权限：无
            {
                title: '域名', dataIndex: "domain", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.domain.localeCompare(b.domain)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "domain" }) },
                        onClick: () => copyCell(record.domain)
                    }
                }
            },//域名,权限：无
            {
                title: '证书', dataIndex: "cert", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.cert.localeCompare(b.cert)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "cert" }) },
                        onClick: () => copyCell(record.cert)
                    }
                }
            },//证书,权限：无
            {
                title: '操作系统', dataIndex: "os", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.os.localeCompare(b.os)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "os" }) },
                        onClick: () => copyCell(record.os)
                    }
                }
            },//操作系统,权限：无
            {
                title: '网站server', dataIndex: "server", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.server.localeCompare(b.server)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "server" }) },
                        onClick: () => copyCell(record.server)
                    }
                }
            },//网站server,权限：无
            {
                title: '网站header', dataIndex: "header", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.header.localeCompare(b.header)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "header" }) },
                        onClick: () => copyCell(record.header)
                    }
                }
            },//网站header,权限：无
            {
                title: '协议banner', dataIndex: "banner", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.banner.localeCompare(b.banner)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "banner" }) },
                        onClick: () => copyCell(record.banner)
                    }
                }
            },//协议banner,权限：无
            {
                title: '产品名', dataIndex: "product", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.product.localeCompare(b.product)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "product" }) },
                        onClick: () => copyCell(record.product)
                    }
                }
            },//产品名,权限：专业版本及以上
            {
                title: '产品分类', dataIndex: "product_category", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.product_category.localeCompare(b.product_category)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "product_category" }) },
                        onClick: () => copyCell(record.product_category)
                    }
                }
            },//产品分类,权限：专业版本及以上
            {
                title: '版本号', dataIndex: "version", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.version.localeCompare(b.version)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "version" }) },
                        onClick: () => copyCell(record.version)
                    }
                }
            },//版本号,权限：专业版本及以上
            {
                title: '更新时间', dataIndex: "lastupdatetime", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.lastupdatetime.localeCompare(b.lastupdatetime)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "lastupdatetime" }) },
                        onClick: () => copyCell(record.lastupdatetime)
                    }
                }
            },//FOFA最后更新时间,权限：专业版本及以上
            {
                title: '域名cname', dataIndex: "cname", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.cname.localeCompare(b.cname)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "cname" }) },
                        onClick: () => copyCell(record.cname)
                    }
                }
            },//域名cname,权限：专业版本及以上
            {
                title: 'icon_hash', dataIndex: "icon_hash", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.icon_hash.localeCompare(b.icon_hash)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "icon_hash" }) },
                        onClick: () => copyCell(record.icon_hash)
                    }
                }
            },//返回的icon_hash值,权限：商业版本及以上
            {
                title: '证书是否有效', dataIndex: "certs_valid", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.certs_valid.localeCompare(b.certs_valid)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "certs_valid" }) },
                        onClick: () => copyCell(record.certs_valid)
                    }
                }
            },//证书是否有效,权限：商业版本及以上
            {
                title: 'cname的域名', dataIndex: "cname_domain", width: 120, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.cname_domain.localeCompare(b.cname_domain)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "cname_domain" }) },
                        onClick: () => copyCell(record.cname_domain)
                    }
                }
            },//cname的域名,权限：商业版本及以上
            {
                title: '网站正文内容', dataIndex: "body", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.body.localeCompare(b.body)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "body" }) },
                        onClick: () => copyCell(record.body)
                    }
                }
            },//网站正文内容,权限：商业版本及以上
            {
                title: 'icon', dataIndex: "icon", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.icon.localeCompare(b.icon)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "icon" }) },
                        onClick: () => copyCell(record.icon)
                    }
                }
            },//icon图标,权限：企业会员
            {
                title: 'fid', dataIndex: "fid", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.link.localeCompare(b.fid)), onCell: (record, fid) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "fid" }) },
                        onClick: () => copyCell(record.fid)
                    }
                }
            },//fid,权限：企业会员
            {
                title: '结构化信息', dataIndex: "structinfo", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.structinfo.localeCompare(b.structinfo)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "structinfo" }) },
                        onClick: () => copyCell(record.structinfo)
                    }
                }
            },//结构化信息(部分协议支持、比如elastic、mongodb),权限：企业会员
            {
                title: '国家代码', dataIndex: "country", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.country.localeCompare(b.country)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "country" }) },
                        onClick: () => copyCell(record.country)
                    }
                }
            },//国家代码,权限：无
            {
                title: '国家名', dataIndex: "country_name", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.country_name.localeCompare(b.country_name)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "country_name" }) },
                        onClick: () => copyCell(record.country_name)
                    }
                }
            },//国家名,权限：无
            {
                title: '区域', dataIndex: "region", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.region.localeCompare(b.region)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "region" }) },
                        onClick: () => copyCell(record.region)
                    }
                }
            },//区域,权限：无
            {
                title: '城市', dataIndex: "city", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.city.localeCompare(b.city)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "city" }) },
                        onClick: () => copyCell(record.city)
                    }
                }
            },//城市,权限：无
            {
                title: '经度', dataIndex: "longitude", width: 100, ellipsis: true, onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "longitude" }) },
                        onClick: () => copyCell(record.longitude)
                    }
                }
            },//地理位置经度,权限：无
            {
                title: '纬度', dataIndex: "latitude", width: 100, ellipsis: true, onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "latitude" }) },
                        onClick: () => copyCell(record.latitude)
                    }
                }
            },//地理位置纬度,权限：无
            {
                title: 'asn编号', dataIndex: "as_number", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.as_number.localeCompare(b.as_number)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "as_number" }) },
                        onClick: () => copyCell(record.as_number)
                    }
                }
            },//asn编号,权限：无
            {
                title: 'asn组织', dataIndex: "as_organization", width: 100, ellipsis: true, sorter: ((a: fofa.Item, b: fofa.Item) => a.as_organization.localeCompare(b.as_organization)), onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "as_organization" }) },
                        onClick: () => copyCell(record.as_organization)
                    }
                }
            },//asn组织,权限：无
            {
                title: 'jarm指纹', dataIndex: "jarm", width: 100, ellipsis: true, onCell: (record, index) => {
                    return {
                        onContextMenu: () => { index != undefined &&  (selectedRow = { item: record, rowIndex: index, colKey: "jarm" }) },
                        onClick: () => copyCell(record.jarm)
                    }
                }
            },//jarm指纹,权限：无

        ];
        const [columns, setColumns] = useState<ColumnsType<fofa.Item>>(defaultColumns)
        const [loading, setLoading] = useState<boolean>(false)
        const [pageData, setPageData] = useState<PageDataType[]>([])
        const pageIDMap=useRef<{ [key: number]: number }>({})
        const [total, setTotal] = useState<number>(0)
        const [currentPage, setCurrentPage] = useState<number>(1)
        const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[1])
        const { input, checkedColsValue } = this.state
        const dispatch = useDispatch()
        useEffect(() => {
            const init = async () => {
                let tmpCols: (ColumnGroupType<fofa.Item> | ColumnType<fofa.Item>)[]
                let tmp: (ColumnGroupType<fofa.Item> | ColumnType<fofa.Item>)[]
                if (this.props.checkedColsValue) {
                    tmpCols = defaultColumns.filter(col => this.props.checkedColsValue.includes((col as any)["dataIndex"]))
                    tmp = tmpCols.map(col => ({ ...col }));
                } else {
                    tmpCols = defaultColumns.filter(col => defaultCheckedColsValue.includes((col as any)["dataIndex"]))
                    tmp = tmpCols.map(col => ({ ...col }));

                }
                // if (tmp.length > 0) {
                //     delete tmp[tmp.length - 1]["width"]
                // }
                setColumns(tmp)
                if (this.props.onContextMenu?.input) {
                    handleFirstQuery(this.props.onContextMenu.input,tmp,currentPageSize)
                }
                const elementWithId2 = document.getElementById(this.tableId);
                if (elementWithId2) {
                    const antTableBody = document.querySelector('.ant-table-body');
                    if (antTableBody) {
                        antTableBody.addEventListener('scroll', this.handleScroll as unknown as EventListener);
                        return () => {
                            // 在组件卸载时移除滚动事件监听器
                            antTableBody.removeEventListener('scroll', this.handleScroll as unknown as EventListener);
                        };
                    } else {
                        console.log('找不到具有类名 ant-table-body 的元素');
                    }
                }
            }
            init()

        }, [])

        const updateUser=()=>{
            GetUserInfo().then(
                result=>{
                    dispatch(setFofaUser(result))
                }
            ).catch(
                err=>errorNotification("Fofa用户信息", err)
            )
        }

        const copyCell = (value: string | number | boolean) => {
            if (!value) {
                return
            }
            copy(value)
            messageApi.success("复制成功", 0.5)
        }

        const handleHeaderResize =
            (index: number) => (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
                const newColumns = [...columns];
                newColumns[index] = {
                    ...newColumns[index],
                    width: size.width,
                };
                setColumns(newColumns)
            };

        const handleMenuItemClick = (key:MenuItemsKey) => {
            switch (key) {
                case MenuItemsKey.IpCidr:
                    this.props?.onContextMenu.addTab("ip=" + selectedRow?.item?.ip + "/24")
                    break
                case MenuItemsKey.Ip:
                    this.props?.onContextMenu.addTab("ip=" + selectedRow?.item?.ip)
                    break
                case MenuItemsKey.OpenUrl:
                    if (selectedRow?.item?.link) {
                        BrowserOpenURL(selectedRow.item.link)
                    }
                    break
                case MenuItemsKey.CopyCell:
                    {
                        const item = selectedRow?.item as fofa.Item
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow?.colKey) {
                                copy(item[key as keyof fofa.Item])
                            }
                        }
                    }
                    break
                case MenuItemsKey.CopyRow:
                    copy(selectedRow?.item)
                    break
                case MenuItemsKey.CopyCol:
                    {
                        const colValues = pageData.map(item => {
                            for (const key in item) {
                                if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow?.colKey) {
                                    return item[key as keyof fofa.Item]
                                }
                            }
                        })
                        copy(colValues)
                        break
                    }
            }
            selectedRow = undefined
        };
        const getMergeColumns = (): ColumnsType<fofa.Item> => {

            if (!columns) {
                return defaultColumns
            }

            return columns?.map((col, index) => ({
                ...col,
                onHeaderCell: (column: ColumnsType<fofa.Item>[number]) => ({
                    width: column.width,
                    onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
                }),
            }));
        }

        const handleFirstQuery = async (query:string,columns: ColumnsType<fofa.Item>,pageSize: number) => {
            const tmpInput = query.trim()
            setCurrentPageSize(pageSize)
            if (query === "") {
                return
            }
            setLoading(true)
            setTotal(0)
            setCurrentPage(1)
            pageIDMap.current = {}
            this.setState({
                inputCache: tmpInput,
            })
            const tmp: string[] = []
            columns.forEach((item) => {
                const field = (item as any)["dataIndex"]
                if (field != "index") {
                    tmp.push(field)
                }
            })
            //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
            Query(0, tmpInput,  1,  pageSize, tmp.join(","),  this.state.full).then(
                (result)=>{
                    console.log(result)
                    updateUser()
                    let index = 0
                    setPageData(result.items.map(item=>({index:++index,...item})))
                    setTotal(result.total)
                    setLoading(false)
                    pageIDMap.current[1] = result.id
                }
            ).catch(
                err=>{
                    errorNotification("Fofa查询出错", err)
                    setLoading(false)
                    setPageData([])
                    return
                }
            )
        }

        const preHandleFirstQuery = async () => {
            const { input } = this.state
            const tmpInput = input.trim()
            if (tmpInput === "") {
                return
            }
            handleFirstQuery(tmpInput,columns,currentPageSize)
        }

        const handlePaginationChange = async (newPage: number, newPageSize: number) => {
            const { inputCache } = this.state

            //page发生变换，size使用原size
            if (newPage != currentPage && newPageSize==currentPageSize) {
                setLoading(true)
                const tmp: string[] = []
                columns.forEach((item) => {
                    const field = (item as any)["dataIndex"]
                    if (field != "index") {
                        tmp.push(field)
                    }
                })
                let pageID=pageIDMap.current[newPage]
                pageID = pageID ? pageID:0
                Query(pageID, inputCache,newPage, currentPageSize, tmp.join(","), this.state.full ).then(
                    result=>{
                        updateUser()
                        let index = (newPage - 1) * currentPageSize
                        setPageData(result.items.map(item=>({index:++index,...item})))
                        setCurrentPage(newPage)
                        setLoading(false)
                        pageIDMap.current[newPage] = result.id
                    }
                ).catch(
                    err=>{
                        errorNotification("Fofa查询出错", err)
                        setLoading(false)
                    }
                )
            }

            //size发生变换，page设为1
            if (newPageSize != currentPageSize) {
                handleFirstQuery(this.state.input,columns,newPageSize)
            }
        }

        const onFieldsChange = (fields: CheckboxValueType[]) => {
            console.log(fields)
            const tmpCols = defaultColumns.filter(col => fields.includes((col as any)["dataIndex"]))
            const tmp = tmpCols.map(col => ({ ...col }));
            // if (tmp.length > 0) {
            //     delete tmp[tmp.length - 1]["width"]
            // }
            this.setState({
                checkedFields: tmp.map(item => (item as any).dataIndex)
            })
            setColumns(tmp)
        }

        return <div >
            {contextHolder}
            <div style={{ display: "flex", justifyContent: 'center', alignItems: "center" }}>
                <Input
                    style={{ width: "600px" }}
                    size="small"
                    allowClear
                    value={input}
                    onPressEnter={preHandleFirstQuery}
                    onChange={(e) => this.setState({ input: e.target.value })}
                    placeholder='Search...'
                />
                <Button type='text' size="small" icon={<SearchOutlined />} onClick={preHandleFirstQuery} />
                <Help />
                <ColumnsFilter
                    dataSource={columnFilterDataSource}
                    checkedSource={checkedColsValue}
                    onChange={(checkedList: CheckboxValueType[]) => onFieldsChange(checkedList)} />
                <Tooltip title='默认搜索一年内的数据，指定为true即可搜索全部数据' placement='bottom'>
                    <Switch size="small" checkedChildren="开启" unCheckedChildren="关闭" onChange={(value) => this.setState({ full: value })} />
                </Tooltip>
            </div>
            <ContextMenu
                items={menuItems}
                onItemClick={(key:string) => {
                    handleMenuItemClick(key as MenuItemsKey)
                }}
                hidden={pageData.length === 0}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Table
                        id={this.tableId}
                        // locale={{ emptyText: "暂无数据" }}
                        // virtual
                        showSorterTooltip={false}
                        scroll={{ y: 'calc(100vh - 195px)', scrollToFirstRowOnChange: true }}
                        bordered
                        columns={getMergeColumns()}
                        components={{
                            header: {
                                cell: ResizableTitle,
                            },
                        }}
                        dataSource={pageData}
                        onRow={(record) => {
                            return {

                            };
                        }}
                        loading={loading}
                        size="small"
                        pagination={false}
                        sticky
                        rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
                        footer={() => <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                            <this.ExportDataPanel id={pageIDMap.current[1]} total={total} currentPageSize={currentPageSize} />
                        </div>}
                    />
                </div>
            </ContextMenu>
        </div>
    }

    render() {
        return <this.Content />
    }
}

type TabType = {
    label: string,
    key: string,
    children: ReactNode,
    closable?: boolean
}

interface AdvancedHelpDataType {
    index: number;
    connector: string;
    description: string;
}

const advancedHelpColumns: ColumnsType<AdvancedHelpDataType> = [
    { title: '序号', dataIndex: "index", },
    { title: '逻辑连接符', dataIndex: "connector", width: 100 },
    {
        title: '具体含义', dataIndex: "description", render: (text, record, index) => (
            <>
                {
                    index == 5 ? <>
                        模糊匹配，使用*或者?进行搜索，比如banner*=\"mys??\" (个人版及以上可用)
                        <Button
                            size='small' icon={<img style={{ height: "12px" }} src={helpIcon}></img>} type="link"
                            onClick={() => BrowserOpenURL("https://github.com/FofaInfo/Awesome-FOFA/blob/main/Basic%20scenario/Basic%20scenario_ZH/FOFA%E6%A8%A1%E7%B3%8A%E6%90%9C%E7%B4%A2%E7%9A%84%E6%AD%A3%E7%A1%AE%E5%A7%BF%E5%8A%BF.md")}
                        />。
                    </> : record.description
                }
            </>
        ),
    },
];

const advancedHelpData: AdvancedHelpDataType[] = [
    {
        index: 1,
        connector: '=',
        description: "匹配，=\"\"时，可查询不存在字段或者值为空的情况。",
    },
    {
        index: 2,
        connector: '==',
        description: "完全匹配，==\"\"时，可查询存在且值为空的情况。",
    },
    {
        index: 3,
        connector: '&&',
        description: "与",
    },
    {
        index: 4,
        connector: '||',
        description: "或者",
    },
    {
        index: 5,
        connector: '!=',
        description: "不匹配，!=\"\"时，可查询值为空的情况。",
    },
    {
        index: 6,
        connector: '*=',
        description: "模糊匹配，使用*或者?进行搜索，比如banner*=\"mys??\" (个人版及以上可用)。",
    },
    {
        index: 7,
        connector: '()',
        description: "确认查询优先级，括号内容优先级最高。",
    },
];

interface ExampleHelpDataType {
    index: number;
    example: string;
    description: string;
    tip: string;
}

const exampleHelpColumns: ColumnsType<ExampleHelpDataType> = [
    { title: '序号', dataIndex: "index", width: 50 },
    { title: '例句', dataIndex: "example", width: 300 },
    { title: '用途说明', dataIndex: "description", width: 250 },
    { title: '注', dataIndex: "tip" },
];

const exampleHelpData: ExampleHelpDataType[] = [
    { index: 1, example: 'title="beijing"', description: "从标题中搜索“北京”", tip: "" },
    { index: 2, example: 'header="elastic"', description: "从http头中搜索“elastic”", tip: "" },
    { index: 3, example: 'body="网络空间测绘"', description: "从html正文中搜索“网络空间测绘”", tip: "" },
    { index: 4, example: 'fid="sSXXGNUO2FefBTcCLIT/2Q==""', description: "查找相同的网站指纹", tip: "搜索网站类型资产" },
    { index: 5, example: 'domain="qq.com"', description: "搜索根域名带有qq.com的网站", tip: "" },
    { index: 6, example: 'icp="京ICP证030173号""', description: "查找备案号为“京ICP证030173号”的网站", tip: "搜索网站类型资产" },
    { index: 7, example: 'js_name="js/jquery.js""', description: "查找网站正文中包含js/jquery.js的资产", tip: "搜索网站类型资产" },
    { index: 8, example: 'js_md5="82ac3f14327a8b7ba49baa208d4eaa15"', description: "查找js源码与之匹配的资产", tip: "" },
    { index: 9, example: 'cname="ap21.inst.siteforce.com"', description: "查找cname为\"ap21.inst.siteforce.com\"的网站", tip: "" },
    { index: 10, example: 'cname_domain="siteforce.com"', description: "查找cname包含“siteforce.com”的网站", tip: "" },
    { index: 11, example: 'cloud_name="Aliyundun"', description: "通过云服务名称搜索资产", tip: "" },
    { index: 12, example: 'product="NGINX"', description: "搜索此产品的资产", tip: "个人版及以上可用" },
    { index: 13, example: 'category="服务"', description: "搜索此产品分类的资产", tip: "个人版及以上可用" },
    { index: 14, example: 'sdk_hash=="Mkb4Ms4R96glv/T6TRzwPWh3UDatBqeF"', description: "搜索使用此sdk的资产", tip: "商业版及以上可用" },
    { index: 15, example: 'icon_hash="-247388890"', description: "搜索使用此 icon 的资产", tip: "" },
    { index: 16, example: 'host=".gov.cn"', description: "从url中搜索”.gov.cn”", tip: "搜索要用host作为名称" },
    { index: 17, example: 'port="6379"', description: "查找对应“6379”端口的资产", tip: "" },
    { index: 18, example: 'ip="1.1.1.1"', description: "从ip中搜索包含“1.1.1.1”的网站", tip: "搜索要用ip作为名称" },
    { index: 19, example: 'ip="220.181.111.1/24"', description: "查询IP为“220.181.111.1”的C网段资产", tip: "" },
    { index: 20, example: 'status_code="402"', description: "查询服务器状态为“402”的资产", tip: "查询网站类型数据" },
    { index: 21, example: 'protocol="quic"', description: "查询quic协议资产", tip: "搜索指定协议类型(在开启端口扫描的情况下有效)" },
    { index: 22, example: 'country="CN"', description: "搜索指定国家(编码)的资产", tip: "" },
    { index: 23, example: 'region="Xinjiang Uyghur Autonomous Region"', description: "搜索指定行政区的资产", tip: "" },
    { index: 24, example: 'city="Ürümqi"', description: "搜索指定城市的资产", tip: "" },
    { index: 25, example: 'cert="baidu"', description: "搜索证书(https或者imaps等)中带有baidu的资产", tip: "" },
    { index: 26, example: 'cert.subject="Oracle Corporation"', description: "搜索证书持有者是Oracle Corporation的资产", tip: "" },
    { index: 27, example: 'cert.issuer="DigiCert"', description: "搜索证书颁发者为DigiCert Inc的资产", tip: "" },
    { index: 28, example: 'cert.is_valid=true"', description: "验证证书是否有效，true有效，false无效", tip: "个人版及以上可用" },
    { index: 29, example: 'cert.is_match=true', description: "证书和域名是否匹配；true匹配、false不匹配", tip: "个人版及以上可用" },
    { index: 30, example: 'cert.is_expired=false', description: "证书是否过期；true过期、false未过期", tip: "个人版及以上可用" },
    { index: 31, example: 'jarm="2ad...83e81"', description: "搜索JARM指纹", tip: "" },
    { index: 32, example: 'banner="users" && protocol="ftp"', description: "搜索FTP协议中带有users文本的资产", tip: "" },
    { index: 33, example: 'type="service"', description: "搜索所有协议资产，支持subdomain和service两种", tip: "搜索所有协议资产" },
    { index: 34, example: 'os="centos"', description: "搜索CentOS资产", tip: "" },
    { index: 35, example: 'server=="Microsoft-IIS/10"', description: "搜索IIS 10服务器", tip: "" },
    { index: 36, example: 'app="Microsoft-Exchange"', description: "搜索Microsoft-Exchange设备", tip: "" },
    { index: 37, example: 'after="2017" && before="2017-10-01"', description: "时间范围段搜索", tip: "" },
    { index: 38, example: 'asn="19551"', description: "搜索指定asn的资产", tip: "" },
    { index: 39, example: 'org="LLC Baxet"', description: "搜索指定org(组织)的资产", tip: "" },
    { index: 40, example: 'base_protocol="udp"', description: "搜索指定udp协议的资产", tip: "" },
    { index: 41, example: 'is_fraud=false', description: "排除仿冒/欺诈数据", tip: "专业版及以上可用" },
    { index: 42, example: 'is_honeypot=false', description: "排除蜜罐数据", tip: "专业版及以上可用" },
    { index: 43, example: 'is_ipv6=true', description: "搜索ipv6的资产", tip: "搜索ipv6的资产,只接受true和false" },
    { index: 44, example: 'is_domain=true', description: "搜索域名的资产", tip: "搜索域名的资产,只接受true和false" },
    { index: 45, example: 'is_cloud=true', description: "筛选使用了云服务的资产", tip: "" },
    { index: 46, example: 'port_size="6"', description: "查询开放端口数量等于\"6\"的资产", tip: "个人版及以上可用" },
    { index: 47, example: 'port_size_gt="6"', description: "查询开放端口数量大于\"6\"的资产", tip: "个人版及以上可用" },
    { index: 48, example: 'port_size_lt="12"', description: "查询开放端口数量小于\"12\"的资产", tip: "个人版及以上可用" },
    { index: 49, example: 'ip_ports="80,161"', description: "搜索同时开放80和161端口的ip", tip: "搜索同时开放80和161端口的ip资产(以ip为单位的资产数据)" },
    { index: 50, example: 'ip_country="CN"', description: "搜索中国的ip资产(以ip为单位的资产数据)", tip: "搜索中国的ip资产" },
    { index: 51, example: 'ip_region="Zhejiang"', description: "搜索指定行政区的ip资产(以ip为单位的资产数据)", tip: "搜索指定行政区的资产" },
    { index: 52, example: 'ip_city="Hangzhou"', description: "搜索指定城市的ip资产(以ip为单位的资产数据)", tip: "搜索指定城市的资产" },
    { index: 53, example: 'ip_after="2021-03-18"', description: "搜索2021-03-18以后的ip资产(以ip为单位的资产数据)", tip: "搜索2021-03-18以后的ip资产" },
    { index: 54, example: 'ip_before="2019-09-09"', description: "搜索2019-09-09以前的ip资产(以ip为单位的资产数据)", tip: "搜索2019-09-09以前的ip资产" },
];

const Help: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    return <>
        <Tooltip title='帮助信息' placement='bottom'>
            <Button type='text' size="small" icon={<QuestionOutlined />} onClick={() => setOpen(true)} />
        </Tooltip>
        <Modal
            style={{ top: "10%" }}
            width={800}
            mask={false}
            maskClosable={true}
            title="帮助信息"
            open={open}
            footer={null}
            onCancel={() => setOpen(false)}
            destroyOnClose={true}
            bodyStyle={{ height: window.innerHeight - 200, overflowY: "scroll" }}
        >
            <Space direction="vertical">
                <span style={{ color: "red" }}>【查询字段】与【导出字段】在"列展示"中设置，设置后需要重新搜索</span>
                <div style={{ borderLeft: "solid 2px #05f2f2", color: "#90a6ba", fontSize: "14px", paddingLeft: "5px" }}>
                    直接输入查询语句，将从标题，html内容，http头信息，url字段中搜索；<br />
                    如果查询表达式有多个与或关系，尽量在外面用（）包含起来<br />
                    新增==完全匹配的符号，可以加快搜索速度，比如查找qq.com所有host，可以是domain=="qq.com"
                </div>
                <Table bordered size="small" columns={advancedHelpColumns} dataSource={advancedHelpData} pagination={false} rowKey={"index"} />
                <span>关于建站软件的搜索语法请参考：<Button type="link" size='small'
                    onClick={() => BrowserOpenURL("https://fofa.info/library")}
                >组件列表</Button></span>
                <Table bordered size="small" columns={exampleHelpColumns} dataSource={exampleHelpData} pagination={false} rowKey={"index"} />
            </Space>
        </Modal></>
}

const AuthSetting: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [form] = Form.useForm()
    const [editable, setEditable] = useState(false)
    const dispatch = useDispatch()
    function save(values: any) {
        setOpen(false)
        setEditable(false)
        form.setFieldsValue(values);
        dispatch(setFofaAuth({email:values.email,key:values.key}))
        SetAuth(values.email,values.key).catch(
            err=>errorNotification("错误",err)
        )
    }
    return <>
        <Tooltip title="设置">
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
            afterOpenChange={open=>{
                open && GetFofa().then(
                    result=>{
                        console.log(result)
                        form.setFieldsValue({
                            email: result.email,
                            key: result.token,
                        });
                    }
                )
            }}
        >
            <Form
                {...authFormProps}
                form={form}
                disabled={!editable}
                onFinish={(values) => save(values)}
            >
                <Form.Item name="email">
                    <Input placeholder="email" />
                </Form.Item>
                <Form.Item name="key">
                    <Input.Password placeholder="token" />
                </Form.Item>
            </Form>
            <div style={{ display: 'flex', justifyContent: "flex-end" }}>
                {
                    !editable ?
                        <Button {...buttonProps} onClick={() => setEditable(true)} >修改</Button>
                        :
                        <>
                            <Button {...buttonProps} htmlType="submit"
                                onClick={() => form.submit()}
                            >保存</Button>
                            <Button {...buttonProps} htmlType="submit"
                                onClick={() => { setEditable(false); setOpen(false) }}
                            >取消</Button>
                        </>
                }
            </div>
        </Modal>
    </>
}

class Fofa extends React.Component {
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
                children: <TabContent
                    ref={
                    (r: TabContent) => {
                        if (r) {this.setState({ tabRefs: [r] });}
                    }}
                   onContextMenu={{
                        addTab: (i) => this.addTab(i),
                        input: "",
                    }}
                    checkedColsValue={defaultCheckedColsValue}
                />,
            }],
        })
    }

    onTabChange = (newActiveKey: string) => {
        this.setState({ activeKey: newActiveKey });
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
                            this.state.tabRefs.push(r);
                            console.log(r);
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
        this.setState({ items: newPanes, activeKey: newActiveKey });
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
        this.setState({ items: newPanes, activeKey: newActiveKey });
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

    UserPanel:React.FC = () => {
        const [spin, setSpin] = useState<boolean>(false)
        const dispatch = useDispatch()
        const user = useSelector((stroe:RootState)=>stroe.user.fofa)
        useEffect(() => {
            GetUserInfo().then(
                result=>{
                    dispatch(setFofaUser(result))
                }
            ).catch(
                err=>errorNotification("Fofa用户信息", err)
            )
        }, []);

        const updateUser=()=>{
            setSpin(true)
            GetUserInfo().then(
                result=>{
                    dispatch(setFofaUser(result))
                }
            ).catch(
                err=>errorNotification("Fofa用户信息", err)
            ).finally(()=>{
                setSpin(false)
            })
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
                <Tooltip title="F币" >
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
                            updateUser()
                        }}
                    />}></Button>
                </Tooltip>
            </Space>
        </div>
    }

    render(): React.ReactNode {
        return (
            <Tabs
                size="small"
                tabBarExtraContent={{
                    left: <this.UserPanel />
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

export default Fofa;