import React, {CSSProperties, useEffect, useRef, useState} from 'react';
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Dropdown,
    Flex,
    Input,
    InputNumber,
    MenuProps,
    Modal,
    Pagination,
    Row,
    Select,
    Space,
    Switch,
    Table,
    Tabs,
    TabsProps,
    Tooltip
} from 'antd';
import {
    CloudDownloadOutlined,
    CrownTwoTone,
    LoadingOutlined,
    QuestionOutlined,
    SyncOutlined,
    UserOutlined
} from '@ant-design/icons';
import {errorNotification} from '@/component/Notification';
import {QUERY_FIRST} from '@/component/type';
import {ColumnGroupType, ColumnsType, ColumnType} from 'antd/es/table';
import ColumnsFilter, {CheckboxValueType, DataSourceItemType} from '../component/ColumnFilter';
import {RootState, appActions, userActions} from '@/store/store';
import {useDispatch, useSelector} from 'react-redux';
import PointBuy from "@/assets/images/point-buy.svg"
import PointFree from "@/assets/images/point-free.svg"
import {ResizeCallbackData} from 'react-resizable';
import ResizableTitle from '../component/ResizableTitle';
import {ExportDataPanelProps} from './Props';
import {buttonProps} from './Setting';
import {copy, localeCompare, RangePresets} from '@/util/util';
import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";
import {GetUserInfo, RealtimeServiceDataExport, RealtimeServiceDataQuery, SetAuth} from "../../wailsjs/go/quake/Bridge";
import {config, quake} from "../../wailsjs/go/models";
import {MenuItemType} from "antd/es/menu/interface";
import {MenuItems, WithIndex} from "@/component/Interface";
import TabLabel from "@/component/TabLabel";
import type {Tab} from "rc-tabs/lib/interface"
import {TargetKey} from "@/pages/Constants";
import Candidate, {ItemType} from "@/component/Candidate";
import {FindByPartialKey} from "../../wailsjs/go/history/Bridge";
const {Option} = Select;
const {RangePicker} = DatePicker;

const optionCssStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
}

export type  LocationType = {
    owner: string
    province_cn: string
    province_en: string
    isp: string     //运营商
    country_en: string
    district_cn: string
    gps: number[]
    street_cn: string
    city_en: string
    district_en: string
    country_cn: string
    street_en: string
    city_cn: string
    country_code: string
    asname: string
    scene_cn: string
    scene_en: string
    radius: number
}

const vipIcon = <CrownTwoTone twoToneColor="red"/>

interface ExampleHelpDataType {
    index: number;
    field: string;
    fieldDescription: string
    mode?: string
    description: any;
    example: any;
}

const exampleHelpColumns1: ColumnsType<ExampleHelpDataType> = [
    {title: '序号', dataIndex: "index", width: 50},
    {title: '检索语法', dataIndex: "field", width: 100},
    {title: '字段名称', dataIndex: "fieldDescription", width: 100},
    {title: '支持的数据模式', dataIndex: "mode", width: 150},
    {title: '解释说明', dataIndex: "description", width: 250},
    {title: '范例', dataIndex: "example"},
];

const exampleHelpColumns2: ColumnsType<ExampleHelpDataType> = [
    {title: '序号', dataIndex: "index", width: 50},
    {title: '检索语法', dataIndex: "field", width: 100},
    {title: '字段名称', dataIndex: "fieldDescription", width: 100},
    {title: '解释说明', dataIndex: "description", width: 250},
    {title: '范例', dataIndex: "example"},
];
const Help: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    return <>
        <Tooltip title='帮助信息' placement='bottom'>
            <Button type='text' size="small" icon={<QuestionOutlined/>} onClick={() => setOpen(true)}/>
        </Tooltip>
        <Modal
            style={{top: "10%"}}
            width={1100}
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
                <Tabs items={exampleHelpDataTabs} size='small'/>
            </Space>

        </Modal></>
}

const exampleHelpDataTabs: TabsProps['items'] = [
    {
        key: "1", label: "基本信息部分", children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
                                                          dataSource={[
                                                              {
                                                                  index: 1,
                                                                  field: "ip",
                                                                  fieldDescription: "IP地址及网段",
                                                                  mode: "主机数据 服务数据",
                                                                  description: "支持检索单个IP、CIDR地址段、支持IPv6地址",
                                                                  example: `ip:"1.1.1.1" ip: "1.1.1.1/16" ip:"2804:29b8:500d:4184:40a8:2e48:9a5d:e2bd" ip:"2804:29b8:500d:4184:40a8:2e48:9a5d:e2bd/24"`
                                                              },
                                                              {
                                                                  index: 2,
                                                                  field: "is_ipv6",
                                                                  fieldDescription: "搜索ipv4的资产",
                                                                  mode: "主机数据 服务数据",
                                                                  description: "只接受 true 和 false",
                                                                  example: `is_ipv6:"true"：查询IPv6数据 is_ipv6:"false"：查询IPv4数据`,
                                                              },
                                                              {
                                                                  index: 3,
                                                                  field: "is_latest",
                                                                  fieldDescription: "搜索最新的资产",
                                                                  mode: "服务数据",
                                                                  description: "只接受 true 和 false",
                                                                  example: `is_latest :"true"：查询最新的资产数据`,
                                                              },
                                                              {
                                                                  index: 4,
                                                                  field: "port",
                                                                  fieldDescription: "端口",
                                                                  mode: "主机数据 服务数据",
                                                                  description: "搜索开放的端口",
                                                                  example: `port:"80"：查询开放80端口的主机`,
                                                              },
                                                              {
                                                                  index: 5,
                                                                  field: "ports",
                                                                  fieldDescription: "多端口",
                                                                  mode: "主机数据 服务数据",
                                                                  description: "搜索某个主机同时开放过的端口",
                                                                  example: `ports:"80,8080,8000"：查询同时开放过80、8080、8000端口的主机`,
                                                              },

                                                              {
                                                                  index: 6,
                                                                  field: `port:>或< port:>=或<=`,
                                                                  fieldDescription: "端口范围",
                                                                  mode: "主机数据 服务数据",
                                                                  description: "搜索满足某个端口范围的主机",
                                                                  example: `port:[* TO 80]：查询开放端口小于等于80的主机 port:[80 TO 1024]：查询开放的端口介入80和1024之间的主机 port:[80 TO *]：查询开放端口包含且大于80端口的主机`,
                                                              }, {
                                                                  index: 7,
                                                                  field: "transport",
                                                                  fieldDescription: "传输层协议",
                                                                  mode: "主机数据 服务数据",
                                                                  description: "只接受tcp、udp",
                                                                  example: `transport:"tcp"：查询tcp数据 transport:"udp"：查询udp数据`,
                                                              },
                                                          ]}
        />
    },
    {
        key: "2",
        label: "ASN网络自治域相关部分",
        children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
                         dataSource={[
                             {
                                 index: 1, field: "asn", fieldDescription: "自治域号码", mode: "主机数据 服务数据",
                                 description: "自治域号码",
                                 example: `asn:"12345"`
                             },
                             {
                                 index: 2,
                                 field: "org",
                                 fieldDescription: "自治域归属组织名称",
                                 mode: "主机数据 服务数据",
                                 description: "自治域归属组织名称",
                                 example: `org:"No.31,Jin-rong Street"`,
                             },
                         ]}
        />
    },
    {
        key: "3",
        label: "主机名与操作系统部分",
        children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
                         dataSource={[
                             {
                                 index: 1, field: "hostname", fieldDescription: "主机名", mode: "服务数据",
                                 description: "即rDNS数据",
                                 example: `hostname:"50-87-74-222.unifiedlayer.com"`
                             },
                             {
                                 index: 2, field: "domain", fieldDescription: "网站域名", mode: "服务数据",
                                 description: "网站域名信息",
                                 example: `domain:"360.cn" domain:*.360.cn`,
                             },
                             {
                                 index: 3, field: "os", fieldDescription: "操作系统部分", mode: "服务数据",
                                 description: "操作系统名称+版本	",
                                 example: `os:"Windows"`,
                             },
                         ]}
        />
    },
    {
        key: "4", label: "服务数据部分", children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
                                                          dataSource={[
                                                              {
                                                                  index: 1,
                                                                  field: "service",
                                                                  fieldDescription: "服务名称",
                                                                  mode: "主机数据 服务数据",
                                                                  description: "即应用协议名称",
                                                                  example: `service:"http"`
                                                              },
                                                              {
                                                                  index: 2,
                                                                  field: "services",
                                                                  fieldDescription: "多个服务名称",
                                                                  mode: "主机数据",
                                                                  description: `搜索某个主机同时支持的协议 仅在主机数据模式下可用`,
                                                                  example: `services:"rtsp,https,telnet"：支持rtsp、https、telnet的主机`,
                                                              },
                                                              {
                                                                  index: 3,
                                                                  field: "app",
                                                                  fieldDescription: "服务产品",
                                                                  mode: "主机数据 服务数据",
                                                                  description: `经过Quake指纹识别后的产品名称（未来会被精细化识别产品替代）`,
                                                                  example: `app:"Apache"Apache服务器产品`,
                                                              },
                                                              {
                                                                  index: 4,
                                                                  field: "app_version",
                                                                  fieldDescription: "产品版本",
                                                                  mode: "主机数据 服务数据",
                                                                  description: `经过Quake指纹识别后的产品版本`,
                                                                  example: `app_version:"1.2.1"`,
                                                              },
                                                              {
                                                                  index: 5,
                                                                  field: "response",
                                                                  fieldDescription: "服务原始响应",
                                                                  mode: "服务数据",
                                                                  description: `这里是包含端口信息最丰富的地方`,
                                                                  example: <>
                                                                      response:"奇虎科技"：端口原生返回数据中包含"奇虎科技"的主机<br/>
                                                                      response:"220 ProFTPD 1.3.5a
                                                                      Server"：端口原生返回数据中包含"220 ProFTPD 1.3.5a
                                                                      Server"字符串的主机`
                                                                  </>
                                                              },
                                                              {
                                                                  index: 6,
                                                                  field: "cert",
                                                                  fieldDescription: "SSL\\TLS证书信息",
                                                                  mode: "主机数据 服务数据",
                                                                  description: `这里存放了格式解析后的证书信息字符串`,
                                                                  example: `cert:"奇虎科技"：包含"奇虎科技"的证书 cert:"360.cn"：包含"360.cn"域名的证书`,
                                                              },
                                                          ]}
        />
    },
    {
        key: "5",
        label: "精细化应用识别部分",
        children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
                         dataSource={[
                             {
                                 index: 1, field: "catalog", fieldDescription: "应用类别", mode: "服务数据",
                                 description: "该字段是应用类型的集合，是一个更高层面应用的聚合",
                                 example: `catalog:"IoT物联网"  catalog:"IoT物联网" OR catalog:"网络安全设备"`
                             },
                             {
                                 index: 2, field: "type", fieldDescription: "应用类型", mode: "服务数据",
                                 description: "该字段是对应用进行的分类结果，指一类用途相同的资产",
                                 example: `type:"防火墙" type:"VPN"`,
                             },
                             {
                                 index: 3, field: "level", fieldDescription: "应用层级", mode: "服务数据",
                                 description: "对于所有应用进行分级，一共5个级别：硬件设备层、操作系统层、服务协议层、中间支持层、应用业务层",
                                 example: `level:"硬件设备层" level:"应用业务层"`,
                             },
                             {
                                 index: 4, field: "vendor", fieldDescription: "应用生产厂商", mode: "服务数据",
                                 description: "该字段指某个应用设备的生产厂商",
                                 example: `vendor:"Sangfor深信服科技股份有限公司" vendor:"Sangfor" OR vendor:"微软" vendor:"DrayTek台湾居易科技"`,
                             },
                         ]}
        />
    },
    {
        key: "6",
        label: "IP归属与定位部分",
        children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
                         dataSource={[
                             {
                                 index: 1,
                                 field: "country",
                                 fieldDescription: "国家（英文）与国家代码",
                                 mode: "主机数据 服务数据",
                                 description: "搜索 country:C hina country:CN 都可以",
                                 example: `country:"China" country:"CN"`
                             },
                             {
                                 index: 2,
                                 field: "country_cn",
                                 fieldDescription: "国家（中文）",
                                 mode: "主机数据 服务数据",
                                 description: "用于搜索中文国家名称",
                                 example: `country_cn:"中国"`,
                             },
                             {
                                 index: 3, field: "province", fieldDescription: "省份（英文）", mode: "主机数据 服务数据",
                                 description: "用于搜索英文省份名称",
                                 example: `province:"Sichuan"`,
                             },
                             {
                                 index: 4,
                                 field: "province_cn",
                                 fieldDescription: "省份（中文）",
                                 mode: "主机数据 服务数据",
                                 description: "用于搜索中文省份名称",
                                 example: `province_cn:"四川"`,
                             },
                             {
                                 index: 5, field: "city", fieldDescription: "城市（英文）", mode: "主机数据 服务数据",
                                 description: "用于搜索英文城市名称",
                                 example: `city:"Chengdu"`,
                             },
                             {
                                 index: 6, field: "city_cn", fieldDescription: "城市（中文", mode: "主机数据 服务数据",
                                 description: "用于搜索中文城市名称",
                                 example: `city_cn:"成都"`,
                             },
                             {
                                 index: 7, field: "district", fieldDescription: "区县（中文）", mode: "服务数据",
                                 description: "用于搜索中文城市下面的区县名称",
                                 example: `district:"朝阳区"`,
                             },
                             {
                                 index: 8, field: "owner", fieldDescription: "IP归属单位", mode: "主机数据 服务数据",
                                 description: "这里的归属并不精确，后期Quake会推出单位归属专用关键词",
                                 example: `owner: "tencent.com" owner: "清华大学"`,
                             }, {
                                 index: 9, field: "isp", fieldDescription: "运营商", mode: "主机数据 服务数据",
                                 description: "根据IP划分归属的运营商",
                                 example: `isp: "联通" isp: "amazon.com"`,
                             },
                         ]}
        />
    },
    {
        key: "7",
        label: "图像数据与应用场景部分",
        children: <Table size='small' pagination={false} columns={exampleHelpColumns2}
                         dataSource={[
                             {
                                 index: 1,
                                 field: "img_tag",
                                 fieldDescription: "图片标签",
                                 description: "用于搜索图片的标签",
                                 example: `img_tag: "windows"`
                             },
                             {
                                 index: 2,
                                 field: "img_ocr",
                                 fieldDescription: "图片OCR",
                                 description: "用于搜索图片中的信息",
                                 example: `img_ocr:"admin"`,
                             },
                             {
                                 index: 3,
                                 field: "img_ocr",
                                 fieldDescription: "系统标签",
                                 description: "用于搜索IP资产的应用场景，如：CDN、卫星互联网、IDC机房等",
                                 example: `sys_tag:"卫星互联网"`,
                             },
                         ]}
        />
    },
]

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

const defaultCheckedColKeys: string[] = [
    "index",
    "ip",
    "port",
    "domain",
    "protocol",
    "web_title",
    "status_code",
    "time",
]

const columnFilterDataSource: DataSourceItemType[] = [
    {label: '序号', value: "index"},
    {label: 'IP', value: "ip"},
    {label: '域名', value: "domain"},
    {label: '端口', value: "port"},
    {label: '协议', value: "protocol"},
    {label: '网站标题', value: "web_title"},
    {label: '响应码', value: "status_code"},
    {label: '产品应用', value: "component",},
    {label: '网站服务器', value: "os",},
    {label: '网站路径', value: "path",},
    {label: '地理位置', value: "location",},
    {label: '更新时间', value: "time",},
    {label: 'ASN', value: "asn",},
    {label: '运营商', value: "isp",},
]

interface TabContentProps  {
    checkedColKeys?: string[],
    input?: string,
    newTab?: (input:string,checkedColKeys:string[], opts:QueryOptions)=>void,
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

let selectedRow: { item: PageDataType, rowIndex: number | undefined, colKey: string } | undefined

const defaultMenuItems: MenuItemType[] = [
    MenuItems.OpenUrl,
    MenuItems.QueryIP,
    MenuItems.QueryIpCidr,
    MenuItems.QueryTitle,
    MenuItems.CopyRow,
    MenuItems.CopyCol,
];


type  PageDataType = WithIndex<quake.RealtimeServiceItem>

const defaultQueryOption:QueryOptions = {
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
    const cfg = useSelector((state:RootState)=>state.app.global.config || new config.Config())
    const [key, setKey] = useState("")

    useEffect(()=>{
        setKey(cfg.Quake.token)
    }, [cfg.Quake])


    const save=()=> {
        SetAuth(key).then(
            ()=>{
                const t = { ...cfg, Quake: {...cfg.Quake, token: key} } as config.Config;
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

    const cancel=() => {
        setEditable(false);
        setOpen(false)
        setKey(cfg.Quake.token)
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
        const {id} = props
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
            getContainer={false}
        >

        <span style={{display: 'grid', gap: "3px"}}>
          <Row>
            <span
                style={{display: 'flex', flexDirection: "row", gap: "5px", backgroundColor: '#f3f3f3', width: "100%"}}>
              <span>月度积分: <span style={{color: "#f5222d"}}>{user.month_remaining_credit}</span></span>
              <span>永久积分: <span style={{color: "#f5222d"}}>{user.persistent_credit}</span></span>
            </span>
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

const TabContent:React.FC<TabContentProps> =(props)=>{
    const defaultColumns: ColumnsType<PageDataType> = [
        {
            title: '序号',
            dataIndex: "index",
            width: 52,
            ellipsis: true,
            fixed: "left",
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "index"),
                    onClick: () => copy(record.index)
                }
            }
        },
        {
            title: '域名',
            dataIndex: "domain",
            ellipsis: true,
            width: 130,
            sorter: ((a, b) => localeCompare(a.domain, b.domain)),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "domain"),
                    onClick: () => copy(record.domain)
                }
            }
        },
        {
            title: 'IP',
            dataIndex: "ip",
            ellipsis: true,
            width: 120,
            fixed: "left",
            sorter: ((a, b) => localeCompare(a.ip, b.ip)),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "ip"),
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
                    onContextMenu: () => handleOnContextMenu(record, index, "port"),
                    onClick: () => copy(record.port)
                }
            }
        },
        {
            title: '协议',
            dataIndex: "protocol",
            ellipsis: true,
            width: 80,
            sorter: ((a, b) => localeCompare(a?.service?.name, b?.service?.name)),
            render: (value, record) => (record?.service?.name),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "protocol"),
                    onClick: () => copy(record?.service?.name)
                }
            }
        },
        {
            title: '网站标题',
            dataIndex: "web_title",
            ellipsis: true,
            width: 400,
            sorter: ((a, b) => localeCompare(a?.service?.http?.title, b?.service?.http?.title)),
            render: (value, record) => (record?.service?.http?.title),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "web_title"),
                    onClick: () => copy(record?.service?.http?.title)
                }
            }
        },
        {
            title: '响应码',
            dataIndex: "status_code",
            ellipsis: true,
            width: 80,
            sorter: ((a, b) => localeCompare(a?.service?.http?.status_code, b?.service?.http?.status_code)),
            render: (value, record) => (record?.service?.http?.status_code),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "status_code"),
                    onClick: () => copy(record?.service?.http?.status_code)
                }
            }
        },
        {
            title: '产品应用', dataIndex: "component", ellipsis: true, width: 100, onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "component"),
                    onClick: () => copy(record.ip)
                }
            }
        },
        {
            title: '网站服务器',
            dataIndex: "os_name",
            ellipsis: true,
            width: 100,
            sorter: ((a, b) => localeCompare(a.os_name, b.os_name)),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "os_name"),
                    onClick: () => copy(record.os_name)
                }
            }
        },
        {
            title: '网站路径',
            dataIndex: "path",
            ellipsis: true,
            width: 100,
            sorter: ((a, b) => localeCompare(a?.service?.http?.path, b?.service?.http?.path)),
            render: (value, record) => (record?.service?.http?.path),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "path"),
                    onClick: () => copy(record?.service?.http?.path)
                }
            }
        },
        {
            title: '地理位置', dataIndex: "location", ellipsis: true, width: 100, render: (value: LocationType) => {
                const location: string[] = []
                if (value.country_cn) {
                    location.push(value.country_cn)
                }
                if (value.province_cn) {
                    location.push(value.province_cn)
                }
                if (value.city_cn) {
                    location.push(value.city_cn)
                }
                if (value.street_cn) {
                    location.push(value.street_cn)
                }
                return <>{location.join(" ")}</>
            }, onCell: (record, index) => {
                const location: string[] = []
                if (record.location.country_cn) {
                    location.push(record.location.country_cn)
                }
                if (record.location.province_cn) {
                    location.push(record.location.province_cn)
                }
                if (record.location.city_cn) {
                    location.push(record.location.city_cn)
                }
                if (record.location.street_cn) {
                    location.push(record.location.street_cn)
                }
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "location"),
                    onClick: () => copy(location.join(" "))
                }
            }
        },
        {
            title: '更新时间',
            dataIndex: "time",
            ellipsis: true,
            width: 100,
            sorter: ((a, b) => localeCompare(a.time, b.time)),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "time"),
                    onClick: () => copy(record.time)
                }
            }
        },
        {
            title: 'ASN',
            dataIndex: "asn",
            ellipsis: true,
            width: 100,
            sorter: ((a, b) => localeCompare(a.asn, b.asn)),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "asn"),
                    onClick: () => copy(record.asn)
                }
            }
        },
        {
            title: '运营商',
            dataIndex: "isp",
            ellipsis: true,
            width: 100,
            sorter: ((a, b) => localeCompare(a?.location?.isp, b?.location?.isp)),
            render: (value, record) => (record?.location?.isp),
            onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "isp"),
                    onClick: () => copy(record?.location?.isp)
                }
            }
        },
    ];
    const [input, setInput] = useState<string>(props.input || "")
    const [inputCache, setInputCache] = useState<string>(input)
    const [checkedColKeys,setCheckedColKeys] = useState<string[]>(props.checkedColKeys || defaultCheckedColKeys)
    const [queryOption,setQueryOption] = useState<QueryOptions>(props.queryOption || defaultQueryOption)
    const [columns, setColumns] = useState<ColumnsType<PageDataType>>(defaultColumns)
    const [loading, setLoading] = useState<boolean>(false)
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap = useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const dispatch = useDispatch()
    const history = useSelector((state: RootState) => state.app.global.history)
    const [openContextMenu, setOpenContextMenu] = useState(false);
    const [menuItems, setMenuItems] = useState(defaultMenuItems)
    const [tableScrollHeight, setTableScrollHeight] = useState<number>(0)
    const allowEnterPress = useSelector((state:RootState)=>state.app.global.config?.QueryOnEnter.assets)
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        (()=>{
            if (ref.current){
                setTableScrollHeight(window.innerHeight - ref.current?.getBoundingClientRect().height - 175)
                window.addEventListener("resize", ()=>{
                    if (ref.current){
                        setTableScrollHeight(window.innerHeight - ref.current?.getBoundingClientRect().height - 175)
                    }
                })
            }
            let tmpCols: (ColumnGroupType<PageDataType> | ColumnType<PageDataType>)[]
            let tmp: (ColumnGroupType<PageDataType> | ColumnType<PageDataType>)[]
            if (checkedColKeys) {
                tmpCols = defaultColumns.filter(col => checkedColKeys.includes((col as any)["dataIndex"]))
                tmp = tmpCols.map(col => ({...col}));
            } else {
                tmpCols = defaultColumns.filter(col => defaultCheckedColKeys.includes((col as any)["dataIndex"]))
                tmp = tmpCols.map(col => ({...col}));

            }
            if (tmp.length > 0) {
                tmp[tmp.length - 1]["width"] = 100
            }
            setColumns(tmp)
            if (input) {
                handleNewQuery(input, currentPageSize)
            }
        })()
    }, [])

    const updateRestToken = () => {
        GetUserInfo().then(
            result => {
                dispatch(userActions.setQuakeUser(result))
            }
        ).catch(
            err => errorNotification("错误", err)
        )
    }

    const handleHeaderResize =
        (index: number) => (_: React.SyntheticEvent<Element>, {size}: ResizeCallbackData) => {
            const newColumns = [...columns];
            newColumns[index] = {
                ...newColumns[index],
                width: size.width,
            };
            setColumns(newColumns)
        };

    const getMergeColumns = (): ColumnsType<PageDataType> => {

        if (!columns) {
            return defaultColumns
        }

        return columns?.map((col, index) => ({
            ...col,
            onHeaderCell: (column: ColumnsType<PageDataType>[number]) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }));
    }

    const beforeContextMenuOpen = () => {
        if (!selectedRow || !selectedRow.item) {
            return
        }
        let t: MenuItemType[] = []
        for (const key in menuItems) {
            const tt = menuItems[key]
            switch (menuItems[key].key) {
                case MenuItems.OpenUrl.key: {
                    const domain = selectedRow.item.domain
                    const ip = selectedRow.item.ip
                    const schema = selectedRow.item.service?.name
                    tt["disabled"] = !(schema && schema.startsWith("http") && (domain || ip.indexOf("*") < 0));
                    break;
                }
                case MenuItems.QueryTitle.key:
                    tt["disabled"] = !selectedRow.item.service.http.title;
                    break;
            }
            t.push(tt)
        }
        setMenuItems(t)
    }

    const handleMenuItemClick: MenuProps['onClick'] = (e) => {
        if (!selectedRow) {
            return
        }
        switch (e.key) {
            case MenuItems.QueryTitle.key:
                props?.newTab && props.newTab(`service.http.title:"${selectedRow.item.service.http.title}"`, checkedColKeys, queryOption)
                break
            case MenuItems.QueryIpCidr.key:
                props?.newTab && props.newTab(`ip:"${selectedRow.item.ip}/24"`, checkedColKeys, queryOption)
                break
            case MenuItems.QueryIP.key:
                props?.newTab && props.newTab(`ip:"${selectedRow.item.ip}"`, checkedColKeys, queryOption)
                break
            case MenuItems.OpenUrl.key: {
                const domain = selectedRow.item.domain
                const ip = selectedRow.item.ip
                const schema = selectedRow.item.service?.name
                const port = selectedRow.item.port
                if (schema && schema.startsWith("http") && (domain || ip.indexOf("*") < 0)) {
                    if (schema.startsWith("http/ssl")) {
                        BrowserOpenURL(`https://${(selectedRow.item.domain || ip)}:${port.toString()}`)
                    } else if (schema.startsWith("http")) {
                        BrowserOpenURL(`http://${(selectedRow.item.domain || ip)}:${port.toString()}`)
                    }
                }
                break
            }
            case MenuItems.CopyRow.key:
                copy(selectedRow)
                break
            case MenuItems.CopyCol.key: {
                const colValues = pageData.map(item => {
                    for (const key in item) {
                        const ok = Object.prototype.hasOwnProperty.call(item, key)
                        if (ok && key === selectedRow?.colKey) {
                            return item[key as keyof PageDataType];
                        }
                        switch (selectedRow?.colKey) {
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

    const handleOnContextMenu = (item: PageDataType, rowIndex: number | undefined, colKey: string) => {
        selectedRow = {item: item, rowIndex: rowIndex, colKey: colKey};
        beforeContextMenuOpen();
    }

    const handleNewQuery = async (query:string, pageSize: number) => {
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
                    const {convertValues, ...rest} = instance
                    return {index: ++index, ...item, convertValues, ...rest}
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
                            const {convertValues, ...rest} = instance
                            return {index: ++index, ...item, convertValues, ...rest}
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

    const onFieldsChange = (fields: CheckboxValueType[]) => {
        console.log(fields)
        const tmpCols = defaultColumns.filter(col => fields.includes((col as any)["dataIndex"]))
        const tmp = tmpCols.map(col => ({...col}));
        if (tmp.length > 0) {
            // delete tmp[tmp.length - 1]["width"]
            tmp[tmp.length - 1]["width"] = 100
        }
        setColumns(tmp)
        setCheckedColKeys(tmp.map(item => (item as any).dataIndex))
    }

    return <Flex vertical gap={10}>
        <Flex vertical ref={ref} gap={5}>
            <Flex align={'center'} justify={'center'}>
                <Candidate
                    size={"small"}
                    style={{width:600}}
                    placeholder='Search...'
                    allowClear
                    value={input}
                    onSearch={(value)=>handleNewQuery(value, currentPageSize)}
                    onPressEnter={(value)=>{
                        if(!allowEnterPress)return
                        handleNewQuery(value, currentPageSize)
                    }}
                    items={[
                        {
                            onSelectItem:(item)=>{
                                setInput(item.data)
                            },
                            fetch: async (v) => {
                                try {
                                    // @ts-ignore
                                    const response = await FindByPartialKey(history.quake,!v?"":v.toString());
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
                            }
                        }
                    ]}
                />
                <Help/>
            </Flex>
            <Flex wrap justify={'center'} gap={5}>
                <RangePicker
                    presets={[ ...RangePresets]}
                    style={{width: "330px"}} size="small" format="YYYY-MM-DD HH:mm:ss"
                    onChange={async (_dates, dateStrings) => {
                        console.log(_dates, dateStrings)
                        setQueryOption(prevState => ({...prevState, dateRange: dateStrings}))
                    }}
                    allowEmpty={[true, true]}
                    showTime
                    showNow
                />
                <Select
                    maxTagTextLength={10}
                    disabled onChange={(value) => {
                    setQueryOption(prevState => ({...prevState, include: value}))
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
                    setQueryOption(prevState => ({...prevState, exclude: value}))
                }}
                    allowClear
                    maxTagCount={1}
                    mode="multiple"
                    optionLabelProp="value"
                    placeholder='排除字段,尚不成熟,暂禁用'
                    size='small'
                    style={{width: "260px"}}>
                    {realtimeServiceFields}
                </Select>
                <Input style={{width: "250px"}} size="small" placeholder='IP列表，以逗号分隔' onChange={(e) => {
                    const value = e.target.value
                    setQueryOption(prevState => ({...prevState, ipList: value.trim() === "" ? [] : value.split(",")}))
                }}/>

                <Flex align={"center"}>
                    <label style={{fontSize: "14px", marginRight: "5px"}}>忽略缓存</label>
                    <Switch size="small"
                            defaultChecked={queryOption.ignoreCache}
                            checkedChildren="开启"
                            unCheckedChildren="关闭"
                            onChange={(value) => setQueryOption(prevState => ({...prevState, ignoreCache: value}))}
                    />
                </Flex>
                <Flex align={"center"}>
                    <label style={{fontSize: "14px", marginRight: "5px"}}>最新数据</label>
                    <Switch size="small"
                            defaultChecked={queryOption.latest}
                            checkedChildren="开启"
                            unCheckedChildren="关闭"
                            onChange={(value) => setQueryOption(prevState => ({...prevState, latest: value}))}
                    />
                </Flex>
                <Flex align={'center'}>
                    <label style={{fontSize: "14px"}}>列设置</label>
                    <ColumnsFilter
                        dataSource={columnFilterDataSource}
                        checkedSource={checkedColKeys}
                        onChange={(checkedList: CheckboxValueType[]) => onFieldsChange(checkedList)}/>
                </Flex>
            </Flex>
        </Flex>
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
                    showSorterTooltip={false}
                    virtual
                    scroll={{y: tableScrollHeight,x: '100%', scrollToFirstRowOnChange: true}}
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
                    footer={() => <Flex justify={"space-between"} align={"center"}>
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
                        <ExportDataPanel id={pageIDMap.current[1]} total={total} currentPageSize={currentPageSize}/>
                    </Flex>}
                    sticky
                    rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
                />
            </div>
        </Dropdown>
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
        <AuthSetting/>
        <Divider type="vertical"/>
        <Space>
            <Tooltip title="永久积分">
                <div style={{
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    color: "#f5222d"
                }}>
                    <img src={PointBuy}/>
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
                    <img src={PointFree}/>
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

const Quake = () =>{
    const [activeKey, setActiveKey] = useState<string>("")
    const [items, setItems] = useState<Tab[]>([])
    const indexRef = useRef(1)

    useEffect(()=>{
        const key = `${indexRef.current}`;
        setItems([{
            label: <TabLabel label={key}/>,
                     key: key,
                     children: <TabContent newTab={addTab}/>,
                     }])
        setActiveKey(key)
    },[])

const onTabChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey)
};

const addTab = (input: string, checkedColKeys: string[], opts: QueryOptions) => {
    const newActiveKey = `${++indexRef.current}`;
    setActiveKey(newActiveKey)
    setItems(prevState => [
        ...prevState,
        {
            label: <TabLabel label={newActiveKey}/>,
            key: newActiveKey,
            children: <TabContent input={input} checkedColKeys={checkedColKeys} newTab={addTab} queryOption={opts}/>,
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
        addTab("", defaultCheckedColKeys, defaultQueryOption);
    } else {
        removeTab(targetKey);
    }
};
    return (
        <Tabs
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

export default Quake
