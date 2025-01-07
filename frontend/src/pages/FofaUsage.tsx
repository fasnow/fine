import { Button, Flex, Modal, Tooltip } from "antd";
import helpIcon from "@/assets/images/help.svg";
import { BrowserOpenURL } from "../../wailsjs/runtime";
import React, { useState } from "react";
import { QuestionOutlined } from "@ant-design/icons";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import {GridOptions} from "ag-grid-community/dist/types/src/entities/gridOptions";

interface AdvancedHelpDataType {
    index: number;
    connector: string;
    description: string;
}

const advancedHelpColumns: ColDef<AdvancedHelpDataType>[] = [
    { headerName: '序号', field: "index", maxWidth: 80, pinned: 'left' },
    { headerName: '逻辑连接符', field: "connector", width: 130, },
    {
        headerName: '具体含义', field: "description", cellRenderer: (params: ICellRendererParams) => {
            if(!params.value || !params.node || !params.node.data)return <></>
            return <>
                {
                    params.node.data.index === 5 ? <>
                        模糊匹配，使用*或者?进行搜索，比如banner*=\"mys??\" (个人版及以上可用)
                        <Button
                            size='small' icon={<img style={{ height: "12px" }} src={helpIcon}></img>} type="link"
                            onClick={() => BrowserOpenURL("https://github.com/FofaInfo/Awesome-FOFA/blob/main/Basic%20scenario/Basic%20scenario_ZH/FOFA%E6%A8%A1%E7%B3%8A%E6%90%9C%E7%B4%A2%E7%9A%84%E6%AD%A3%E7%A1%AE%E5%A7%BF%E5%8A%BF.md")}
                        />。
                    </> : params.value
                }
            </>
        }, wrapText: true, autoHeight: true, flex: 1
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

const exampleHelpColumns: ColDef<ExampleHelpDataType>[] = [
    { headerName: '序号', field: "index", maxWidth: 80, pinned: 'left' },
    { headerName: '例句', field: "example", width: 300, pinned: 'left', autoHeight: true, wrapText: true, flex: 1},
    { headerName: '用途说明', field: "description", width: 250, autoHeight: true, wrapText: true, flex: 1 },
    { headerName: '注', field: "tip", autoHeight: true, wrapText: true, flex: 1 },
];

const exampleHelpData: ExampleHelpDataType[] = [
    { index: 1, example: 'headerName="beijing"', description: "从标题中搜索“北京”", tip: "" },
    { index: 2, example: 'header="elastic"', description: "从http头中搜索“elastic”", tip: "" },
    { index: 3, example: 'body="网络空间测绘"', description: "从html正文中搜索“网络空间测绘”", tip: "" },
    { index: 4, example: 'fid="sSXXGNUO2FefBTcCLIT/2Q==""', description: "查找相同的网站指纹", tip: "搜索网站类型资产" },
    { index: 5, example: 'domain="qq.com"', description: "搜索根域名带有qq.com的网站", tip: "" },
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
    { index: 8, example: 'js_md5="82ac3f14327a8b7ba49baa208d4eaa15"', description: "查找js源码与之匹配的资产", tip: "" },
    {
        index: 9,
        example: 'cname="ap21.inst.siteforce.com"',
        description: "查找cname为\"ap21.inst.siteforce.com\"的网站",
        tip: ""
    },
    { index: 10, example: 'cname_domain="siteforce.com"', description: "查找cname包含“siteforce.com”的网站", tip: "" },
    { index: 11, example: 'cloud_name="Aliyundun"', description: "通过云服务名称搜索资产", tip: "" },
    { index: 12, example: 'product="NGINX"', description: "搜索此产品的资产", tip: "个人版及以上可用" },
    { index: 13, example: 'category="服务"', description: "搜索此产品分类的资产", tip: "个人版及以上可用" },
    {
        index: 14,
        example: 'sdk_hash=="Mkb4Ms4R96glv/T6TRzwPWh3UDatBqeF"',
        description: "搜索使用此sdk的资产",
        tip: "商业版及以上可用"
    },
    { index: 15, example: 'icon_hash="-247388890"', description: "搜索使用此 icon 的资产", tip: "" },
    { index: 16, example: 'host=".gov.cn"', description: "从url中搜索”.gov.cn”", tip: "搜索要用host作为名称" },
    { index: 17, example: 'port="6379"', description: "查找对应“6379”端口的资产", tip: "" },
    { index: 18, example: 'ip="1.1.1.1"', description: "从ip中搜索包含“1.1.1.1”的网站", tip: "搜索要用ip作为名称" },
    { index: 19, example: 'ip="220.181.111.1/24"', description: "查询IP为“220.181.111.1”的C网段资产", tip: "" },
    { index: 20, example: 'status_code="402"', description: "查询服务器状态为“402”的资产", tip: "查询网站类型数据" },
    {
        index: 21,
        example: 'protocol="quic"',
        description: "查询quic协议资产",
        tip: "搜索指定协议类型(在开启端口扫描的情况下有效)"
    },
    { index: 22, example: 'country="CN"', description: "搜索指定国家(编码)的资产", tip: "" },
    { index: 23, example: 'region="Xinjiang Uyghur Autonomous Region"', description: "搜索指定行政区的资产", tip: "" },
    { index: 24, example: 'city="Ürümqi"', description: "搜索指定城市的资产", tip: "" },
    { index: 25, example: 'cert="baidu"', description: "搜索证书(https或者imaps等)中带有baidu的资产", tip: "" },
    {
        index: 26,
        example: 'cert.subject="Oracle Corporation"',
        description: "搜索证书持有者是Oracle Corporation的资产",
        tip: ""
    },
    { index: 27, example: 'cert.issuer="DigiCert"', description: "搜索证书颁发者为DigiCert Inc的资产", tip: "" },
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
    { index: 31, example: 'jarm="2ad...83e81"', description: "搜索JARM指纹", tip: "" },
    { index: 32, example: 'banner="users" && protocol="ftp"', description: "搜索FTP协议中带有users文本的资产", tip: "" },
    {
        index: 33,
        example: 'type="service"',
        description: "搜索所有协议资产，支持subdomain和service两种",
        tip: "搜索所有协议资产"
    },
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
    const [gridOptions] = useState<GridOptions>({
        headerHeight: 32,
        rowHeight: 32,
        noRowsOverlayComponent:() => <NotFound />,
        loadingOverlayComponent:() => <Loading />,
        defaultColDef: {
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
    })
    return <>
        <Tooltip title='帮助信息' placement='bottom'>
            <Button type='text' size="small" icon={<QuestionOutlined />} onClick={() => setOpen(true)} />
        </Tooltip>
        <Modal
            style={{ top: "10%" }}
            width={"80%"}
            mask={false}
            maskClosable={true}
            title="帮助信息"
            open={open}
            footer={null}
            onCancel={() => setOpen(false)}
            destroyOnClose={true}
            styles={{ body: { height: window.innerHeight - 200, overflowY: "scroll" } }}
        >
            <Flex vertical gap={5} style={{ height: '100%' }}>
                <span style={{ color: "red" }}>【查询字段】与【导出字段】在"列展示"中设置，设置后需要重新搜索</span>
                <div style={{ borderLeft: "solid 2px #05f2f2", color: "#90a6ba", fontSize: "14px", paddingLeft: "5px" }}>
                    直接输入查询语句，将从标题，html内容，http头信息，url字段中搜索；<br />
                    如果查询表达式有多个与或关系，尽量在外面用（）包含起来<br />
                    新增==完全匹配的符号，可以加快搜索速度，比如查找qq.com所有host，可以是domain=="qq.com"
                </div>
                <div style={{ height: '100%', width: '100%' }}>
                    <AgGridReact
                        {...gridOptions}
                        domLayout={"autoHeight"}
                        rowData={advancedHelpData}
                        columnDefs={advancedHelpColumns}
                    />
                </div>

                <span>关于建站软件的搜索语法请参考：<Button type="link" size='small'
                    onClick={() => BrowserOpenURL("https://fofa.info/library")}
                >组件列表</Button></span>
                <div style={{ height: 400 }}>
                    <AgGridReact
                        {...gridOptions}
                        rowData={exampleHelpData}
                        columnDefs={exampleHelpColumns}
                    />
                </div>
            </Flex>
        </Modal></>
}

export default Help