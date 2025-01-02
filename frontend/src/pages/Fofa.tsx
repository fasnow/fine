import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {GetRef} from 'antd';
import {
    Button,
    Divider,
    Dropdown, Empty,
    Flex,
    Form,
    Input,
    InputNumber,
    MenuProps,
    Modal,
    Pagination,
    Popover,
    Select,
    Space,
    Spin,
    Switch,
    Table,
    Tabs, Tag,
    Tooltip,
    Upload
} from 'antd';
import {
    CloudDownloadOutlined,
    InboxOutlined,
    LoadingOutlined,
    QuestionOutlined,
    SearchOutlined,
    SyncOutlined,
    UserOutlined
} from '@ant-design/icons';
import {errorNotification} from '@/component/Notification';
import {QUERY_FIRST} from '@/component/type';
import {ColumnGroupType, ColumnsType, ColumnType} from 'antd/es/table';
import ColumnsFilter, {CheckboxValueType, DataSourceItemType} from '@/component/ColumnFilter';
import {RootState, appActions, userActions} from '@/store/store';
import {useDispatch, useSelector} from 'react-redux';
import PointBuy from "@/assets/images/point-buy.svg"
import PointFree from "@/assets/images/point-free.svg"
import {ResizeCallbackData} from 'react-resizable';
import ResizableTitle from '@/component/ResizableTitle';
import {ExportDataPanelProps} from './Props';
import helpIcon from '@/assets/images/help.svg'
import {buttonProps} from './Setting';
import {config, constant, fofa} from "../../wailsjs/go/models";
import {Export, GetUserInfo, Query, SetAuth} from "../../wailsjs/go/fofa/Bridge";
import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";
import {Dots} from "@/component/Icon";
import MurmurHash3 from "murmurhash3js"
import {Buffer} from "buffer"
import {Fetch} from "../../wailsjs/go/app/App";
import {toUint8Array} from "js-base64";
import {copy} from "@/util/util";
import {MenuItems, WithIndex} from "@/component/Interface";
import {MenuItemType} from "antd/es/menu/interface";
import {TargetKey} from "@/pages/Constants";
import TabLabel from "@/component/TabLabel";
import type {Tab} from "rc-tabs/lib/interface"
import Candidate, {ItemType} from "@/component/Candidate";
import {FindByPartialKey} from "../../wailsjs/go/history/Bridge";
import '@/pages/Fofa.css'
import Event = constant.Event;

import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import {
    ColDef,
    ColumnValueChangedEvent,
    ColumnVisibleEvent,
    GetContextMenuItemsParams, MenuItemDef, SideBarDef,
    themeQuartz
} from "ag-grid-community";
import {GridReadyEvent} from "ag-grid-enterprise";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";

interface AdvancedHelpDataType {
    index: number;
    connector: string;
    description: string;
}

const advancedHelpColumns: ColumnsType<AdvancedHelpDataType> = [
    {title: '序号', dataIndex: "index",},
    {title: '逻辑连接符', dataIndex: "connector", width: 100},
    {
        title: '具体含义', dataIndex: "description", render: (text, record, index) => (
            <>
                {
                    index === 5 ? <>
                        模糊匹配，使用*或者?进行搜索，比如banner*=\"mys??\" (个人版及以上可用)
                        <Button
                            size='small' icon={<img style={{height: "12px"}} src={helpIcon}></img>} type="link"
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
    {title: '序号', dataIndex: "index", width: 50},
    {title: '例句', dataIndex: "example", width: 300},
    {title: '用途说明', dataIndex: "description", width: 250},
    {title: '注', dataIndex: "tip"},
];

const exampleHelpData: ExampleHelpDataType[] = [
    {index: 1, example: 'title="beijing"', description: "从标题中搜索“北京”", tip: ""},
    {index: 2, example: 'header="elastic"', description: "从http头中搜索“elastic”", tip: ""},
    {index: 3, example: 'body="网络空间测绘"', description: "从html正文中搜索“网络空间测绘”", tip: ""},
    {index: 4, example: 'fid="sSXXGNUO2FefBTcCLIT/2Q==""', description: "查找相同的网站指纹", tip: "搜索网站类型资产"},
    {index: 5, example: 'domain="qq.com"', description: "搜索根域名带有qq.com的网站", tip: ""},
    {
        index: 6,
        example: 'icp="京ICP证030173号""',
        description: "查找备案号为“京ICP证030173号”的网站",
        tip: "搜索网站类型资产"
    },
    {
        index: 7,
        example: 'js_name="js/jquery.js""',
        description: "查找网站正文中包含js/jquery.js的资产",
        tip: "搜索网站类型资产"
    },
    {index: 8, example: 'js_md5="82ac3f14327a8b7ba49baa208d4eaa15"', description: "查找js源码与之匹配的资产", tip: ""},
    {
        index: 9,
        example: 'cname="ap21.inst.siteforce.com"',
        description: "查找cname为\"ap21.inst.siteforce.com\"的网站",
        tip: ""
    },
    {index: 10, example: 'cname_domain="siteforce.com"', description: "查找cname包含“siteforce.com”的网站", tip: ""},
    {index: 11, example: 'cloud_name="Aliyundun"', description: "通过云服务名称搜索资产", tip: ""},
    {index: 12, example: 'product="NGINX"', description: "搜索此产品的资产", tip: "个人版及以上可用"},
    {index: 13, example: 'category="服务"', description: "搜索此产品分类的资产", tip: "个人版及以上可用"},
    {
        index: 14,
        example: 'sdk_hash=="Mkb4Ms4R96glv/T6TRzwPWh3UDatBqeF"',
        description: "搜索使用此sdk的资产",
        tip: "商业版及以上可用"
    },
    {index: 15, example: 'icon_hash="-247388890"', description: "搜索使用此 icon 的资产", tip: ""},
    {index: 16, example: 'host=".gov.cn"', description: "从url中搜索”.gov.cn”", tip: "搜索要用host作为名称"},
    {index: 17, example: 'port="6379"', description: "查找对应“6379”端口的资产", tip: ""},
    {index: 18, example: 'ip="1.1.1.1"', description: "从ip中搜索包含“1.1.1.1”的网站", tip: "搜索要用ip作为名称"},
    {index: 19, example: 'ip="220.181.111.1/24"', description: "查询IP为“220.181.111.1”的C网段资产", tip: ""},
    {index: 20, example: 'status_code="402"', description: "查询服务器状态为“402”的资产", tip: "查询网站类型数据"},
    {
        index: 21,
        example: 'protocol="quic"',
        description: "查询quic协议资产",
        tip: "搜索指定协议类型(在开启端口扫描的情况下有效)"
    },
    {index: 22, example: 'country="CN"', description: "搜索指定国家(编码)的资产", tip: ""},
    {index: 23, example: 'region="Xinjiang Uyghur Autonomous Region"', description: "搜索指定行政区的资产", tip: ""},
    {index: 24, example: 'city="Ürümqi"', description: "搜索指定城市的资产", tip: ""},
    {index: 25, example: 'cert="baidu"', description: "搜索证书(https或者imaps等)中带有baidu的资产", tip: ""},
    {
        index: 26,
        example: 'cert.subject="Oracle Corporation"',
        description: "搜索证书持有者是Oracle Corporation的资产",
        tip: ""
    },
    {index: 27, example: 'cert.issuer="DigiCert"', description: "搜索证书颁发者为DigiCert Inc的资产", tip: ""},
    {
        index: 28,
        example: 'cert.is_valid=true"',
        description: "验证证书是否有效，true有效，false无效",
        tip: "个人版及以上可用"
    },
    {
        index: 29,
        example: 'cert.is_match=true',
        description: "证书和域名是否匹配；true匹配、false不匹配",
        tip: "个人版及以上可用"
    },
    {
        index: 30,
        example: 'cert.is_expired=false',
        description: "证书是否过期；true过期、false未过期",
        tip: "个人版及以上可用"
    },
    {index: 31, example: 'jarm="2ad...83e81"', description: "搜索JARM指纹", tip: ""},
    {index: 32, example: 'banner="users" && protocol="ftp"', description: "搜索FTP协议中带有users文本的资产", tip: ""},
    {
        index: 33,
        example: 'type="service"',
        description: "搜索所有协议资产，支持subdomain和service两种",
        tip: "搜索所有协议资产"
    },
    {index: 34, example: 'os="centos"', description: "搜索CentOS资产", tip: ""},
    {index: 35, example: 'server=="Microsoft-IIS/10"', description: "搜索IIS 10服务器", tip: ""},
    {index: 36, example: 'app="Microsoft-Exchange"', description: "搜索Microsoft-Exchange设备", tip: ""},
    {index: 37, example: 'after="2017" && before="2017-10-01"', description: "时间范围段搜索", tip: ""},
    {index: 38, example: 'asn="19551"', description: "搜索指定asn的资产", tip: ""},
    {index: 39, example: 'org="LLC Baxet"', description: "搜索指定org(组织)的资产", tip: ""},
    {index: 40, example: 'base_protocol="udp"', description: "搜索指定udp协议的资产", tip: ""},
    {index: 41, example: 'is_fraud=false', description: "排除仿冒/欺诈数据", tip: "专业版及以上可用"},
    {index: 42, example: 'is_honeypot=false', description: "排除蜜罐数据", tip: "专业版及以上可用"},
    {index: 43, example: 'is_ipv6=true', description: "搜索ipv6的资产", tip: "搜索ipv6的资产,只接受true和false"},
    {index: 44, example: 'is_domain=true', description: "搜索域名的资产", tip: "搜索域名的资产,只接受true和false"},
    {index: 45, example: 'is_cloud=true', description: "筛选使用了云服务的资产", tip: ""},
    {index: 46, example: 'port_size="6"', description: "查询开放端口数量等于\"6\"的资产", tip: "个人版及以上可用"},
    {index: 47, example: 'port_size_gt="6"', description: "查询开放端口数量大于\"6\"的资产", tip: "个人版及以上可用"},
    {index: 48, example: 'port_size_lt="12"', description: "查询开放端口数量小于\"12\"的资产", tip: "个人版及以上可用"},
    {
        index: 49,
        example: 'ip_ports="80,161"',
        description: "搜索同时开放80和161端口的ip",
        tip: "搜索同时开放80和161端口的ip资产(以ip为单位的资产数据)"
    },
    {
        index: 50,
        example: 'ip_country="CN"',
        description: "搜索中国的ip资产(以ip为单位的资产数据)",
        tip: "搜索中国的ip资产"
    },
    {
        index: 51,
        example: 'ip_region="Zhejiang"',
        description: "搜索指定行政区的ip资产(以ip为单位的资产数据)",
        tip: "搜索指定行政区的资产"
    },
    {
        index: 52,
        example: 'ip_city="Hangzhou"',
        description: "搜索指定城市的ip资产(以ip为单位的资产数据)",
        tip: "搜索指定城市的资产"
    },
    {
        index: 53,
        example: 'ip_after="2021-03-18"',
        description: "搜索2021-03-18以后的ip资产(以ip为单位的资产数据)",
        tip: "搜索2021-03-18以后的ip资产"
    },
    {
        index: 54,
        example: 'ip_before="2019-09-09"',
        description: "搜索2019-09-09以前的ip资产(以ip为单位的资产数据)",
        tip: "搜索2019-09-09以前的ip资产"
    },
];

const Help: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    return <>
        <Tooltip title='帮助信息' placement='bottom'>
            <Button type='text' size="small" icon={<QuestionOutlined/>} onClick={() => setOpen(true)}/>
        </Tooltip>
        <Modal
            style={{top: "10%"}}
            width={800}
            mask={false}
            maskClosable={true}
            title="帮助信息"
            open={open}
            footer={null}
            onCancel={() => setOpen(false)}
            destroyOnClose={true}
            styles={{body:{height: window.innerHeight - 200, overflowY: "scroll"}}}
        >
            <Space direction="vertical">
                <span style={{color: "red"}}>【查询字段】与【导出字段】在"列展示"中设置，设置后需要重新搜索</span>
                <div style={{borderLeft: "solid 2px #05f2f2", color: "#90a6ba", fontSize: "14px", paddingLeft: "5px"}}>
                    直接输入查询语句，将从标题，html内容，http头信息，url字段中搜索；<br/>
                    如果查询表达式有多个与或关系，尽量在外面用（）包含起来<br/>
                    新增==完全匹配的符号，可以加快搜索速度，比如查找qq.com所有host，可以是domain=="qq.com"
                </div>
                <Table bordered size="small" columns={advancedHelpColumns} dataSource={advancedHelpData}
                       pagination={false} rowKey={"index"}/>
                <span>关于建站软件的搜索语法请参考：<Button type="link" size='small'
                                                           onClick={() => BrowserOpenURL("https://fofa.info/library")}
                >组件列表</Button></span>
                <Table bordered size="small" columns={exampleHelpColumns} dataSource={exampleHelpData}
                       pagination={false} rowKey={"index"}/>
            </Space>
        </Modal></>
}

const AuthSetting: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state:RootState)=>state.app.global.config || new config.Config())
    const [key, setKey] = useState("")

    useEffect(()=>{
        setKey(cfg.Fofa.token)
    }, [cfg.Fofa])


    const save = ()=>{
        SetAuth(key).then(
            ()=>{
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

    const cancel=() => {
        setEditable(false);
        setOpen(false)
        setKey(cfg.Fofa.token)
    }

    return <>
        <Tooltip title="设置" placement={"right"}>
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
            getContainer={false}
        >
            <Flex vertical gap={10}>
                <Input.Password value={key} placeholder="token" onChange={
                    e=>{
                        if(!editable)return
                        setKey(e.target.value)
                    }
                }/>
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

const UserPanel = ()=> {
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
        <AuthSetting/>
        <Divider type="vertical"/>
        <Space>
            <Tooltip title="F币">
                <div style={{
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    color: "#f5222d"
                }}>
                    <img src={PointFree}/>
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
                    <img src={PointBuy}/>
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
            icon={isExporting ? <LoadingOutlined/> : <CloudDownloadOutlined/>}
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
            <div style={{display: 'flex', flexDirection: 'column', gap: "5px"}}>

                    <span style={{
                        display: 'flex',
                        flexDirection: "row",
                        gap: "10px",
                        backgroundColor: '#f3f3f3',
                        width: "100%"
                    }}>当前F点: <label style={{color: "red"}}>{user.fofa_point}</label></span>
                <Form layout="inline" size='small'>
                    <Form.Item label={"导出分页大小"}>
                        <Select
                            style={{width: '80px'}}
                            defaultValue={pageSize}
                            options={pageSizeOptions.map(size => ({label: size.toString(), value: size}))}
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

const defaultMenuItems = [
    MenuItems.OpenUrl,
    MenuItems.QueryIP,
    MenuItems.QueryIpCidr,
    MenuItems.QueryTitle,
    MenuItems.CopyCell,
    MenuItems.CopyRow,
    MenuItems.CopyCol,
    MenuItems.CopyUrlCol
];

type  PageDataType = WithIndex<fofa.Item>

const pageSizeOptions = [50, 100, 150, 200, 500]

interface TabContentProps {
    colDefs?: ColDef[] | undefined | null,
    input?: string,
    full?: boolean,//全量搜索
    newTab?:(input:string,colDef:ColDef[] | undefined | null)=>void
}

const TabContent:React.FC<TabContentProps> =(props)=> {
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
    const allowEnterPress = useSelector((state:RootState) =>state.app.global.config?.QueryOnEnter.assets)
    const ref = useRef<HTMLDivElement | null>(null)
    const history = useSelector((state: RootState) => state.app.global.history)
    const [columnDefs] = useState<ColDef[]>(props.colDefs || [
        { headerName : '序号', field : "index", width : 80, pinned: 'left'},
        { headerName : 'URL', field : "link", width : 200, pinned: 'left'}, //资产的URL链接, 权限：无
        { headerName : '域名', field : "domain", width : 150, hide: true}, //域名, 权限：无
        { headerName : 'IP', field : "ip", width : 150 }, //ip地址, 权限：无
        { headerName : '端口', field : "port", width : 80}, //端口, 权限：无
        { headerName : '协议名', field : "protocol", width : 80, }, //协议名, 权限：无
        { headerName : '基础协议', field : "base_protocol", width : 100, hide: true }, //基础协议，比如tcp, 权限：无
        { headerName : '网站标题', field : "title", width : 200}, //网站标题, 权限：无
        { headerName : 'icp备案号', field : "icp", width : 100}, //icp备案号, 权限：无
        { headerName : '主机名', field : "host", width : 200, hide: true}, //主机名, 权限：无
        { headerName : '证书', field : "cert", width : 100, hide: true}, //证书, 权限：无
        { headerName : '操作系统', field : "os", width : 100, hide: true}, //操作系统, 权限：无
        { headerName : '网站server', field : "server", width : 100, hide: true}, //网站server, 权限：无
        { headerName : '网站header', field : "header", width : 100, hide: true}, //网站header, 权限：无
        { headerName : '协议banner', field : "banner", width : 100, hide: true}, //协议banner, 权限：无
        { headerName : '产品名', field : "product", width : 100, hide: true, toolPanelClass: 'professional-privilege'}, //产品名, 权限：专业版本及以上
        { headerName : '产品分类', field : "product_category", width : 100, hide: true, toolPanelClass: 'professional-privilege'}, //产品分类, 权限：专业版本及以上
        { headerName : '版本号', field : "version", width : 100, hide: true, toolPanelClass: 'professional-privilege'}, //版本号, 权限：专业版本及以上
        { headerName : '更新时间', field : "lastupdatetime", width : 100, hide: true, toolPanelClass: 'professional-privilege'}, //FOFA最后更新时间, 权限：专业版本及以上
        { headerName : '域名cname', field : "cname", width : 100, hide: true, toolPanelClass: 'professional-privilege'}, //域名cname, 权限：专业版本及以上
        { headerName : 'icon_hash', field : "icon_hash", width : 100, hide: true, toolPanelClass: 'commercial-privilege' }, //返回的icon_hash值, 权限：商业版本及以上
        { headerName : '证书是否有效', field : "certs_valid", width : 100, hide: true, toolPanelClass: 'commercial-privilege'}, //证书是否有效, 权限：商业版本及以上
        { headerName : 'cname的域名', field : "cname_domain", width : 120, hide: true, toolPanelClass: 'commercial-privilege'}, //cname的域名, 权限：商业版本及以上
        { headerName : '网站正文内容', field : "body", width : 100, hide: true, toolPanelClass: 'commercial-privilege'}, //网站正文内容, 权限：商业版本及以上
        { headerName : 'icon', field : "icon", width : 100, hide: true, toolPanelClass: 'enterprise-privilege'}, //icon图标, 权限：企业会员
        { headerName : 'fid', field : "fid", width : 100, hide: true, toolPanelClass: 'enterprise-privilege'}, //fid, 权限：企业会员
        { headerName : '结构化信息', field : "structinfo", width : 100, hide: true, toolPanelClass: 'enterprise-privilege'}, //结构化信息(部分协议支持、比如elastic、mongodb), 权限：企业会员
        { headerName : '国家代码', field : "country", width : 100, hide: true}, //国家代码, 权限：无
        { headerName : '国家名', field : "country_name", width : 100, hide: true }, //国家名, 权限：无
        { headerName : '区域', field : "region", width : 100, hide: true}, //区域, 权限：无
        { headerName : '城市', field : "city", width : 100, hide: true}, //城市, 权限：无
        { headerName : '经度', field : "longitude", width : 100, hide: true}, //地理位置经度, 权限：无
        { headerName : '纬度', field : "latitude", width : 100, hide: true}, //地理位置纬度, 权限：无
        { headerName : 'asn编号', field : "as_number", width : 100, hide: true}, //asn编号, 权限：无
        { headerName : 'asn组织', field : "as_organization", width : 100, hide: true}, //asn组织, 权限：无
        { headerName : 'jarm指纹', field : "jarm", width : 100, hide: true }, //jarm指纹, 权限：无
    ]);
    const [pageData, setPageData] = useState<PageDataType[]>([]);

    useEffect(() => {
        if (props.input) {
            setInput(props.input)
            handleNewQuery(props.input, currentPageSize)
        }
    }, [])

    const getColKeysNoIndex=useCallback(()=>{
        if (gridRef.current?.api){
            console.log(gridRef.current.api.getColumnDefs())
            const selectedCols = gridRef.current.api.getAllDisplayedColumns()
            const fields:string[] = []
            selectedCols?.forEach(col=>{
                const field = col.getColId()
                field !== 'index' && fields.push(field)
            })
            return fields
        }
        const fields:string[] = []
        columnDefs?.forEach(col=>{
            const hide = col.hide === undefined ? false : col.hide
            if(!hide && col.field &&  col.field !== 'index'){
                 fields.push(col.field)
            }
        })
        return fields
    },[columnDefs])

    const getColDefs=()=>{
        if (gridRef.current?.api){
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
        Query(0, t , 1, pageSize, getColKeysNoIndex().join(","), full).then(
            (result) => {
                updateRestToken()
                let index = 0
                setPageData(result.items.map(item => ({index: ++index, ...item})))
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
            const fields:string[] = []
            selectedCols?.forEach(col=>{
                const field = col.getColId()
                field !== 'index' && fields.push(field)
            })
            let pageID = pageIDMap.current[newPage]
            pageID = pageID ? pageID : 0
            Query(pageID, inputCache, newPage, currentPageSize, fields.join(","),full).then(
                result => {
                    updateRestToken()
                    let index = (newPage - 1) * currentPageSize
                    setPageData(result.items.map(item => ({index: ++index, ...item})))
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

    const IconSearchPanel=(<Popover
            placement={"bottom"}
            style={{width: 500}}
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
        </Popover>)

    const footer = (
        <Flex justify={"space-between"} align={'center'} style={{padding: '5px'}}>
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
            <ExportDataPanel id={pageIDMap.current[1]} total={total} currentPageSize={currentPageSize}/>
        </Flex>)

    const getContextMenuItems = useCallback(
        (
            params: GetContextMenuItemsParams,
        ): (MenuItemDef)[] => {
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
                        for (let i = 0;i<pageData.length;i++){
                            if (pageData[i].index === params.node?.data.index){
                                copy(pageData[i])
                                break
                            }
                        }
                    },
                },
                {
                    name: "复制该列",
                    action: () => {
                        const colValues = pageData.map((item:PageDataType) => {
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
        },
        [pageData],
    );

    const defaultColDef = useMemo<ColDef>(()=>{
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
    },[])

    const defaultSideBarDef = useMemo<SideBarDef>(()=>{
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
    },[])

    return <Flex vertical gap={5} style={{height: '100%'}}>
        <Flex ref={ref} justify={'center'} align={"center"} gap={5}>
            <Candidate
                size={"small"}
                style={{width:600}}
                placeholder='Search...'
                allowClear
                value={input}
                onSearch={(value)=>handleNewQuery(value, currentPageSize)}
                onPressEnter={(value)=> {
                    if(!allowEnterPress)return
                    handleNewQuery(value, currentPageSize)
                }}
                items={[
                    {
                        fetch:async (v) => {
                            try {
                                // @ts-ignore
                                const response = await FindByPartialKey(history.fofa,!v?"":v.toString());
                                const a: ItemType[] = response?.map(item => {
                                    const t:ItemType={
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
                        }}
                ]}
            />
            {IconSearchPanel}
            <Help/>
            <Tooltip title='默认搜索一年内的数据，指定为true即可搜索全部数据' placement='bottom'>
                <Switch size="small" checkedChildren="开启" unCheckedChildren="关闭"
                        onChange={(value) => setFull(value)}/>
            </Tooltip>
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
                noRowsOverlayComponent={()=><NotFound/>}
                loadingOverlayComponent={()=><Loading/>}
            />
        </div>
        {footer}
    </Flex>
}

const Fofa = ()=> {
    const [activeKey, setActiveKey] = useState<string>("")
    const [items, setItems] = useState<Tab[]>([])
    const indexRef = useRef(1)

    useEffect(()=>{
        const key = `${indexRef.current}`;
        setItems([{
            label: <TabLabel label={key}/>,
            key: key,
            children: <TabContent newTab={addTab}/>,
            // children:<GridExample></GridExample>
        }])
        setActiveKey(key)
    },[])

    const onTabChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey)
    };

    const addTab = (input: string, colDef: ColDef[] | undefined | null) => {
        const newActiveKey = `${++indexRef.current}`;
        setActiveKey(newActiveKey)
        setItems(prevState => [
            ...prevState,
            {
                label: <TabLabel label={newActiveKey}/>,
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
        const newActiveKey = t.length && activeKey === targetKey ? t[t.length-1]?.key : activeKey
        setItems(t)
        setActiveKey(newActiveKey)
    };

    const onEditTab = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            addTab("",null);
        } else {
            removeTab(targetKey);
        }
    };

    return (
        <Tabs
            style={{height: '100%', width: '100%'}}
            size="small"
            tabBarExtraContent={{
                left: <UserPanel/>
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