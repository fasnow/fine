import React, { useState } from "react";
import { Button, Modal, Tabs, TabsProps, Tooltip } from "antd";
import { QuestionOutlined } from "@ant-design/icons";
import { ColDef } from "ag-grid-community";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import { AgGridReact } from "ag-grid-react";
import {GridOptions} from "ag-grid-community/dist/types/src/entities/gridOptions";

interface ExampleHelpDataType {
    index: number;
    field: string;
    fieldDescription: string
    mode?: string
    description: any;
    example: any;
}

const gridOptions:GridOptions = {
    defaultColDef:{
        // allow every column to be aggregated
        enableValue: true,
        // allow every column to be grouped
        enableRowGroup: true,
        // allow every column to be pivoted
        enablePivot: true,
        filter: true,
        suppressHeaderMenuButton: true,
        suppressHeaderFilterButton: true,
    },
    headerHeight:32,
    rowHeight:32,
    noRowsOverlayComponent:() => <NotFound />,
    loadingOverlayComponent:() => <Loading />,
}

const exampleHelpColumns1: ColDef<ExampleHelpDataType>[] = [
    { headerName: '序号', field: "index", maxWidth: 80 },
    { headerName: '检索语法', field: "field", width: 100, autoHeight: true, wrapText: true, flex: 0.5},
    { headerName: '字段名称', field: "fieldDescription", width: 100, autoHeight: true, wrapText: true, flex: 0.5 },
    { headerName: '支持的数据模式', field: "mode", width: 150, autoHeight: true, wrapText: true, flex: 0.7 },
    { headerName: '解释说明', field: "description", width: 250 , autoHeight: true, wrapText: true, flex: 1},
    { headerName: '范例', field: "example", autoHeight: true, wrapText: true, flex: 1 },
];

const exampleHelpColumns2: ColDef<ExampleHelpDataType>[] = [
    { headerName: '序号', field: "index", maxWidth: 80 },
    { headerName: '检索语法', field: "field", width: 100, autoHeight: true, wrapText: true, flex: 1 },
    { headerName: '字段名称', field: "fieldDescription", width: 100, autoHeight: true, wrapText: true, flex: 1 },
    { headerName: '解释说明', field: "description", width: 250, autoHeight: true, wrapText: true, flex: 4 },
    { headerName: '范例', field: "example", autoHeight: true, wrapText: true, flex: 2 },
];

const exampleHelpDataTabs: TabsProps['items'] = [
    {
        key: "1", label: "基本信息部分", children: <AgGridReact
            {...gridOptions}
            rowData={[
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
            columnDefs={exampleHelpColumns1}
        />
    },
    {
        key: "2",
        label: "ASN网络自治域相关部分",
        children: <AgGridReact
            {...gridOptions}
            columnDefs={exampleHelpColumns1}
            rowData={[
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
        children: <AgGridReact
            {...gridOptions}
            columnDefs={exampleHelpColumns1}
            rowData={[
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
        key: "4", label: "服务数据部分", children: <AgGridReact
            {...gridOptions}
            columnDefs={exampleHelpColumns1}
            rowData={[
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
                        response:"奇虎科技"：端口原生返回数据中包含"奇虎科技"的主机<br />
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
        children: <AgGridReact
            {...gridOptions}
            columnDefs={exampleHelpColumns1}
            rowData={[
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
        children: <AgGridReact
            {...gridOptions}
            columnDefs={exampleHelpColumns1}
            rowData={[
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
        children: <AgGridReact
            {...gridOptions}
            columnDefs={exampleHelpColumns2}
            rowData={[
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
    }
]

const Help: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    return <>
        <Tooltip title='帮助信息' placement='bottom'>
            <Button type='text' size="small" icon={<QuestionOutlined />} onClick={() => setOpen(true)} />
        </Tooltip>
        <Modal
            style={{ top: "10%" }}
            width={'80%'}
            mask={false}
            maskClosable={true}
            title="帮助信息"
            open={open}
            footer={null}
            onCancel={() => setOpen(false)}
            destroyOnClose={true}
            styles={{ body: { height: window.innerHeight - 200, overflowY: "scroll" } }}
        >
            <Tabs items={exampleHelpDataTabs} size='small' style={{ height: '100%' }} />
        </Modal></>
}

export default Help