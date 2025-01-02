import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    Button,
    Col,
    Collapse,
    DatePicker,
    Divider,
    Dropdown,
    Flex, GetRef,
    Input,
    InputNumber,
    List,
    MenuProps,
    Modal,
    Pagination,
    Popover,
    Row,
    Select,
    Space,
    Spin,
    Switch,
    Table,
    Tabs,
    Tooltip,
    Upload
} from 'antd';
import {
    CloudDownloadOutlined,
    ExclamationCircleOutlined,
    InboxOutlined,
    LoadingOutlined,
    QuestionOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import {errorNotification} from '@/component/Notification';
import {ColumnGroupType, ColumnsType, ColumnType} from 'antd/es/table';
import ColumnsFilter, {CheckboxValueType, DataSourceItemType} from '../component/ColumnFilter';
import {HunterUserType, RootState, appActions, userActions} from '@/store/store';
import {useDispatch, useSelector} from 'react-redux';
import PointBuy from "@/assets/images/point-buy.svg"
import {ResizeCallbackData} from 'react-resizable';
import {ExportDataPanelProps} from './Props';
import {buttonProps} from './Setting';
import {copy, localeCompare, RangePresets} from '@/util/util';
import {config, fofa, hunter} from "../../wailsjs/go/models";
import {Export, GetRestToken, Query, SetAuth} from "../../wailsjs/go/hunter/Bridge";
import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";
import ResizableTitle from "@/component/ResizableTitle";
import type {Tab} from 'rc-tabs/lib/interface';
import {Dots} from "@/component/Icon";
import {md5} from "js-md5"
import {Fetch} from "../../wailsjs/go/app/App";
import {toUint8Array} from "js-base64";
import {MenuItems, WithIndex} from "@/component/Interface";
import {MenuItemType} from "antd/es/menu/interface";
import TabLabel from "@/component/TabLabel";
import {TargetKey} from "@/pages/Constants";
import Candidate, {ItemType} from "@/component/Candidate";
import {FindByPartialKey} from "../../wailsjs/go/history/Bridge";
import {AgGridReact} from "ag-grid-react";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import {ColDef, GetContextMenuItemsParams, ICellRendererParams, MenuItemDef, SideBarDef} from "ag-grid-community";

const pageSizeOptions = [10, 20, 50, 100]

const defaultCheckedColKeys: string[] = [
    "index",
    "ip",
    "port",
    "domain",
    "protocol",
    "web_title",
    "status_code",
    "company",
    "number"
]

const defaultQueryOption:QueryOptions = {
    isWeb: 3,
    statusCode: "",
    portFilter: false,
    dateRange: []
}

interface TabContentProps {
    colDefs?: ColDef[] | undefined | null,
    input?: string,
    newTab?: (input:string,colDefs:ColDef[] | undefined | null, opts:QueryOptions)=>void,
    queryOption?: QueryOptions
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

type PageDataType = WithIndex<hunter.Item>

interface QueryOptions{
    isWeb: 1|2|3;
    statusCode: string;
    portFilter: boolean;
    dateRange: string[]
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
            styles={{body:{overflowY: 'scroll', height: window.innerHeight - 160}}}
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

const AuthSetting: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state:RootState)=>state.app.global.config || new config.Config())
    const [key, setKey] = useState("")

    useEffect(()=>{
        setKey(cfg.Hunter.token)
    }, [cfg.Hunter])

    const save=()=> {
        SetAuth(key).then(
            ()=>{
                const t = { ...cfg, Hunter: {...cfg.Hunter, token: key} } as config.Config;
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

    const cancel=()=> {
        setEditable(false);
        setOpen(false)
        setKey(cfg.Hunter.token)
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
                    dispatch(userActions.setHunterUser({restToken: result}))
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
            icon={isExporting ? <LoadingOutlined/> : <CloudDownloadOutlined/>}
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

const TabContent:React.FC<TabContentProps>=(props)=> {
    const gridRef = useRef<AgGridReact>(null);
    const [input, setInput] = useState<string>(props.input || "")
    const [inputCache, setInputCache] = useState<string>(input)
    const [queryOption,setQueryOption] = useState<QueryOptions>(props.queryOption || defaultQueryOption)
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
    const allowEnterPress = useSelector((state:RootState)=>state.app.global.config?.QueryOnEnter.assets)
    const event = useSelector((state: RootState) => state.app.global.event)
    const history = useSelector((state: RootState) => state.app.global.history)
    const [columnDefs] = useState<ColDef[]>(props.colDefs || [
        {headerName: '序号', field: "index", width : 80, pinned: 'left'},
        {headerName: 'URL', field: "url", width : 250, hide: true},
        {headerName: '域名', field: "domain", width : 200, pinned: 'left'},
        {headerName: 'IP', field: "ip", width : 150,},
        {headerName: '端口', field: "port", width : 80,},
        {headerName: '协议', field: "protocol", width : 80,},
        {headerName: '网站标题', field: "web_title", width : 200,},
        {headerName: '备案号', field: "number", width : 180,},
        {headerName: '备案单位', field: "company", width : 100,},
        {headerName: '响应码', field: "status_code", width : 80,},
        {headerName: '组件', field: "components", width : 100, cellRenderer:(params: ICellRendererParams)=>{
            const tmp = params.data.component?.map((component:hunter.Component) => {
                    return component.name + component.version
                })
                return tmp?.join(" | ") || ""
            }},
        {headerName: '操作系统', field: "os", width : 100, hide: true},
        {headerName: '城市', field: "city", width : 100, hide: true},
        {headerName: '更新时间', field: "updated_at", width : 100,},
        {headerName: 'web应用', field: "is_web", width : 100, hide: true},
        {headerName: 'Banner', field: "banner", width : 100, hide: true},
        {headerName: '风险资产', field: "is_risk", width : 100, hide: true},
        {headerName: '注册机构', field: "as_org", width : 100, hide: true},
        {headerName: '运营商', field: "isp", width : 100, hide: true},
    ]);
    const defaultSideBarDef = useMemo<SideBarDef>(()=>{
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
    },[])
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

    useEffect(() => {
        EventsOn(String(event?.hasNewHunterDownloadItem), function () {
            GetRestToken().then(
                result => {
                    dispatch(userActions.setHunterUser({restToken: result}))
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
            let value:any
            if('components' === params.column?.getColId()){
                const tmp = params.node?.data.component?.map((component:hunter.Component) => {
                    return component.name + component.version
                })
                value = tmp?.join(" | ")
            }else {
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
                    const colId = params.column?.getColId()
                    const colValues = pageData.map((item:PageDataType) => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key)) {
                                if('components' === colId){
                                    const tmp = item.component?.map((component:hunter.Component) => {
                                        return component.name + component.version
                                    })
                                    return tmp?.join(" | ") || ""
                                }else if(key === colId){
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
    },[pageData, queryOption]);

    const getColDefs=()=>{
        if (gridRef.current?.api){
            console.log(gridRef.current.api.getColumnDefs())
            return gridRef.current.api.getColumnDefs()
        }
        return columnDefs
    }

    const handleNewQuery = async (query:string, pageSize: number) => {
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
                    const {convertValues, ...reset} = instance
                    return {index: ++index, ...item, convertValues, ...reset}
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
                        const {convertValues, ...rest} = instance
                        return {index: ++index, ...rest, convertValues}
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
    )

    const footer =  <Flex justify={"space-between"} align={'center'} style={{padding: '5px'}}>
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
                         currentPageSize={currentPageSize}/>
    </Flex>

    return <Flex vertical gap={5} style={{height: '100%'}}>
        <Flex vertical gap={5}>
            <Flex justify={"center"} align={'center'}>
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
                            onSelectItem: (item)=>{
                                setInput(item.data)
                            },
                            fetch: async (v) => {
                                try {
                                    // @ts-ignore
                                    const response = await FindByPartialKey(history.hunter,!v?"":v.toString());
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
                {iconSearchView}
                <Help/>
            </Flex>
            <Flex justify={"center"} align={'center'} gap={10}>
                <Flex gap={5} align={'center'}>
                    资产类型
                    <Select size="small"
                            style={{width: "110px"}}
                            defaultValue={3 as 1 | 2 | 3}
                            options={[{label: "web资产", value: 1}, {label: "非web资产", value: 2}, {label: "全部",value: 3}]}
                            onChange={(value) => setQueryOption(prevState => ({...prevState, isWeb: value}))}/>
                </Flex>
                <DatePicker.RangePicker
                    presets={[
                        ...RangePresets,
                    ]}
                    style={{width: "230px"}}
                    size="small"
                    onChange={(_dates, dateStrings) => setQueryOption(prevState => ({...prevState, dateRange: dateStrings}))}
                    allowEmpty={[true, true]}
                    showNow
                />
                <Input style={{width: "300px"}} size="small" placeholder='状态码列表，以逗号分隔，如”200,401“'
                       onChange={(e) => setQueryOption(prevState => ({...prevState, statusCode: e.target.value}))}/>
                <Flex gap={5} align={'center'}>
                    数据过滤
                    <Switch size="small" checkedChildren="开启" unCheckedChildren="关闭" onChange={(value) => setQueryOption(prevState => ({...prevState, portFilter:value}))}/>
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
                noRowsOverlayComponent={()=><NotFound/>}
                loadingOverlayComponent={()=><Loading/>}
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

const Hunter =()=>{
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

    const addTab = (input: string, colDefs: ColDef[] | undefined | null, opts: QueryOptions) => {
        const newActiveKey = `${++indexRef.current}`;
        setActiveKey(newActiveKey)
        setItems(prevState => [
            ...prevState,
            {
                label: <TabLabel label={newActiveKey}/>,
                key: newActiveKey,
                children: <TabContent input={input} colDefs={colDefs} newTab={addTab} queryOption={opts}/>,
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
            addTab("", null, defaultQueryOption);
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

export default Hunter;