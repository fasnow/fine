import {Button, Collapse, Divider, List, Modal, Popover, Tabs, Tooltip} from "antd";
import React, {useState} from "react";
import {QuestionOutlined} from "@ant-design/icons";
import {ColDef, ICellRendererParams} from "ag-grid-community";
import type {Tab} from 'rc-tabs/es/interface'
import {AgGridReact} from "ag-grid-react";
import {AGGridCommonOptionsNoCopy} from "@/pages/Props";

interface AdvancedHelpDataType {
    index: number;
    connector: string;
    description: string;
}

const advancedHelpColumns: ColDef<AdvancedHelpDataType>[] = [
    {headerName: '序号', field: "index", maxWidth: 80},
    {headerName: '连接符', field: "connector", width: 100},
    {headerName: '查询含义', field: "description", autoHeight: true, wrapText: true, flex: 1},
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

const exampleHelpColumns: ColDef<ExampleHelpDataType>[] = [
    {headerName: '序号', field: "index", maxWidth: 80},
    {
        headerName: '语法内容', field: "example", width: 300, cellRenderer: (params: ICellRendererParams) => {
            return params.value
        }, autoHeight: true, wrapText: true, flex: 1
    },
    {
        headerName: '语法说明', field: "description", cellRenderer: (params: ICellRendererParams) => {
            return params.value
        }, autoHeight: true, wrapText: true, width: 300, flex: 1
    },
];

const exampleHelpDataTabs: Tab[] = [
    {
        key: "1",
        label: "hot热门语法",
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        />
    },
    {
        key: "13",
        label: "AS",
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
        children: <AgGridReact
            {...AGGridCommonOptionsNoCopy}
            columnDefs={exampleHelpColumns}
            rowData={[
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
            styles={{body: {overflowY: 'scroll', height: window.innerHeight - 160}}}
            width={'80%'}
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
                children: <AgGridReact
                    {...AGGridCommonOptionsNoCopy}
                    domLayout={'autoHeight'}
                    columnDefs={advancedHelpColumns}
                    rowData={advancedHelpData}
                />
            }]} defaultActiveKey={['1']}
            />
            <Divider style={{marginTop: "20px", marginBottom: "20px"}}/>
            <Tabs items={exampleHelpDataTabs} size='small' tabPosition={'left'} style={{height: "100%"}}/>
        </Modal></>
}

export default Help