import { AutoComplete, Avatar, Badge, Button, Collapse, CollapseProps, ConfigProvider, Descriptions, Input, List, Popover, Space, TabPaneProps, Tabs, TabsProps, Tag, theme } from "antd"
import React, { CSSProperties, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { $tianYanChaApp, $tianYanChaBaseInfo, $tianYanChaInvestment, $tianYanChaShareholder, $tianYanChaSubsidiary, $tianYanChaSuggest, $tianYanChaSupplier, $tianYanChaWechat, $tianYanChaWeibo } from "../../http/api";
import { errorNotification } from "../../component/Notification";
import { CaretRightOutlined } from "@ant-design/icons";
import ScrollBar from "../../component/ScrollBar";
import { _openDefaultBrowser } from "../../electron/electronApi";
import RightPenetration from "./RightPenetration";
import MindMapGraphGraph from "./R";
import Zoomeye from "../assetsmap/Zoomeye";

export type BaseInfo = {
    legal_person_name: string //法定代表人
    phone: string[] //电话
    email: string[] //邮箱
    address: string //地址
    website: string //网址
    description: string //简介
    name: string //企业名称
    en_name: string //企业英文名称
    reg_status: string //经营状态
    establish_time: string //成立日期
    uscc: string //统一社会信用代码
    reg_capital: string //注册资本
    paid_capital: string //实缴资本
    tax_number: string //纳税人识别号
}


export type SuggestItem = {
    graphId: string //数据ID
    type: number //
    matchType: string //匹配类别
    comName: string//企业名称
    name: string//
    alias: string//企业名称别名
    logo: string //企业Logo
    claimLevel: string//
    regStatus: string//经营状态
}

export type SubsidiaryItem = {
    serviceType: number
    regStatus: string//经营状态
    estiblishTime: string//成立日期
    type: number
    legalPersonAlias: any//法人姓名别名
    legalPersonName: string//法人姓名
    legalPersonId: number
    toco: number
    companyId: number//企业ID
    serviceCount: number
    legalLogo: string
    name: string//企业名称
    alias: string//企业名称别名
    logo: string//企业Logo
    id: number//数据ID
    personType: number
}

export type ShareholderItem = {
    name: string //控股人/企业名称
    percent: number //控股比例
    amount: number //出资份额
    id: number //控股人/企业ID
}

export type InvestmentItem = {
    name: string //企业名称
    regStatus: string //经营状态
    percent: number //控股比例
    id: number //企业ID
    estiblishTime: string //成立时间日期
    legalPersonName: string //法人姓名
    amount: string //投资数额
}

export type SupplierItem = {
    summary: number
    announcement_date: number
    amt: string
    companyUrl: string
    source: string
    supplier_graphId: number
    logo: string
    alias: string
    supplier_name: string
    relationship: string
    category: string
    client_name: string
    dataSource: string
    source_name: string
    source_seq: number
    ratio: string
}


export type WeiboItem = {
    ico: string
    name: string
    href: string
    info: string
    tags: string[]
}

export type AppItem = {
    brief: string
    classes: string
    icon: string
    name: string
    filterName: string
    businessId: string
    id: number
    type: string
    uuid: string
}
export type WechatItem = {
    publicNum: string
    codeImg: string
    recommend: string
    title: string
    titleImgURL: string
}

type SuggestOption = {
    value: string
    label: ReactNode
    id: string
}
const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

const badgeCssStyle: React.CSSProperties = {
    display: "flex",
    borderRadius: "10px",
    height: "14px",
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 5px",
    color: "white",
    fontSize: "10px"
}

const labelCssStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
}

const TabContent: React.FC = () => {
    const [input, setInput] = useState<string>("")
    const [inputCache, setInputCache] = useState<string>("")
    const [baseInfo, setBaseInfo] = useState<BaseInfo>();
    const [options, setOptions] = useState<SuggestOption[]>([]);
    const [subsidiary, setSubsidiary] = useState<SubsidiaryItem[]>([]);
    const [shareholder, setShareholder] = useState<ShareholderItem[]>([]);
    const [investment, setInvestment] = useState<InvestmentItem[]>([]);
    const [supplier, setSupplier] = useState<SupplierItem[]>([]);
    const [weibo, setWeibo] = useState<WeiboItem[]>([]);
    const [app, setApp] = useState<AppItem[]>([]);
    const [wechat, setWechat] = useState<WechatItem[]>([]);
    const { token } = theme.useToken();
    const selected = useRef<boolean>(false)

    const panelStyle: React.CSSProperties = {
        marginBottom: 24,
        background: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        border: 'none',
    };

    const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
        {
            key: '1',
            label: <span style={labelCssStyle}>分公司<span style={badgeCssStyle}>{subsidiary?.length}</span></span>,
            children: <List
                itemLayout="horizontal"
                dataSource={subsidiary}
                split={false}
                renderItem={(item, index) => (
                    <List.Item>
                        <Descriptions
                            contentStyle={{ fontSize: "12px" }} size="small"
                            title={<span style={{ fontSize: "12px" }}>{item.name}</span>}
                            items={[
                                { key: "", children: item.legalPersonName },
                                { key: "", children: item.estiblishTime.substring(0, 10) },
                                { key: "", children: item.regStatus }
                            ]} />
                        {/* <div style={{fontSize:"14px"}}>
                        <span >{item.name}</span>
                        <span style={{display:"flex",flexDirection:"row"}}>
                            {item.legalPersonName}{item.estiblishTime.substring(0,10)}{item.regStatus}
                        </span>
                       </div> */}
                    </List.Item>
                )}
            />,
            style: panelStyle,
        },
        {
            key: '2',
            label: <span style={labelCssStyle}>微信<span style={badgeCssStyle}>{wechat?.length}</span></span>,
            children: <List
                itemLayout="horizontal"
                dataSource={wechat}
                renderItem={(item, index) => (
                    <List.Item>
                        <Descriptions
                            contentStyle={{ fontSize: "12px" }} size="small"
                            title={<span style={{ display: "flex", fontSize: "12px", justifyContent: "space-between" }} ><span>{item.title}</span><span>{item.publicNum}</span></span>}
                            items={[
                                { key: "", children: <img style={{ height: "40px" }} src={item.codeImg} /> },
                                { key: "", children: item.recommend },
                            ]} />
                    </List.Item>
                )}
            />,
            style: panelStyle,
        },
        {
            key: '3',
            label: <span style={labelCssStyle}>APP<span style={badgeCssStyle}>{app?.length}</span></span>,
            children: <List
                itemLayout="horizontal"
                dataSource={app}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={item.icon} />}
                            title={<span style={{ fontSize: "12px" }}>{item.name}</span>}
                        />
                    </List.Item>
                )}
            />,
            style: panelStyle,
        },
        {
            key: '4',
            label: <span style={labelCssStyle}>微博<span style={badgeCssStyle}>{weibo?.length}</span></span>,
            children: <List
                itemLayout="horizontal"
                dataSource={weibo}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={item.ico} />}
                            title={<div style={{ fontSize: "12px" }}>{item.name}<Button style={{ fontSize: "12px" }} size="small" type="link" >打开</Button></div>}
                            description={<span style={{ wordBreak: "break-all" }}>{item.info}</span>}
                        />
                        {/* <span style={{display:"flex",flexDirection:"row"}}><Avatar src={item.ico} /><>{item.name}</><>{item.info}</></span> */}
                    </List.Item>
                )}
            />,
            style: panelStyle,
        },
        {
            key: '5',
            label: <span style={labelCssStyle}>供应商<span style={badgeCssStyle}>{supplier?.length}</span></span>,
            children: <List
                itemLayout="horizontal"
                dataSource={supplier}
                renderItem={(item, index) => (
                    <List.Item>
                        <Descriptions
                            contentStyle={{ fontSize: "12px" }} size="small"
                            labelStyle={{ fontSize: "12px" }}
                            title={<span style={{ display: "flex", fontSize: "12px", justifyContent: "space-between" }} ><span>{item.supplier_name}</span></span>}
                            column={2}
                            items={[
                                { key: "", label: "报告日期", children: item.announcement_date },
                                { key: "", label: "采购占比", children: item.ratio || "-" },
                                { key: "", label: "采购金额", children: `${item.amt}万元` },
                                { key: "", label: "数据来源", children: item.dataSource },
                                { key: "", label: "关联关系", children: item.relationship || "-" },
                            ]} />
                    </List.Item>
                )}
            />,
            style: panelStyle,
        },
        {
            key: '6',
            label: <span style={labelCssStyle}>对外投资<span style={badgeCssStyle}>{investment?.length}</span></span>,
            children: <List
                itemLayout="horizontal"
                dataSource={investment}
                renderItem={(item, index) => (
                    <List.Item>
                        <Descriptions
                            contentStyle={{ fontSize: "12px" }} size="small"
                            labelStyle={{ fontSize: "12px" }}
                            title={<span style={{ display: "flex", fontSize: "12px", justifyContent: "space-between" }} ><span>{item.name}</span></span>}
                            column={2}
                            items={[
                                { key: "", label: "法人", children: item.legalPersonName },
                                { key: "", label: "成立日期", children: item.estiblishTime },
                                { key: "", label: "投资数额", children: (item.amount != "0" && item.amount) || "未公开" },
                                { key: "", label: "投资比例", children: item.percent || "未公开" },
                                { key: "", label: "经营状态", children: item.regStatus },
                            ]} />
                    </List.Item>
                )}
            />,
            style: panelStyle,
        },
    ];

    const handleInputChange = (key: string) => {
        if (key == "") { setOptions([]); return }
        suggest(key)
    }

    const renderLabel = (htmlString: string) => {
        htmlString = htmlString.replace("<em>", "<span style=\"color:red\">")
        htmlString = htmlString.replace("</em>", "</span>")
        const createMarkup = () => {
            return { __html: htmlString };
        };
        return <span dangerouslySetInnerHTML={createMarkup()} />;
    };

    const query = async (id: string) => {
        const tmpInput = input.trim()
        if (tmpInput == "") return
        setInputCache(tmpInput)
        console.log(id)
        $tianYanChaBaseInfo(id).then(
            (result: { error: Error, baseInfo: BaseInfo }) => {
                if (result.error) {
                    errorNotification("天眼查获取基本信息", result.error)
                } else {
                    setBaseInfo(result.baseInfo)
                    console.log(result.baseInfo)
                }
                return
            }
        ).catch(err => errorNotification("天眼查获取基本信息", err))
        $tianYanChaSubsidiary(id).then(
            (result: { error: Error, subsidiary: SubsidiaryItem[] }) => {
                if (result.error) {
                    errorNotification("天眼查获取子公司", result.error)
                } else {
                    setSubsidiary(result.subsidiary)
                }
                return
            }
        ).catch(err => errorNotification("天眼查获取子公司", err))
        $tianYanChaShareholder(id).then(
            (result: { error: Error, shareholder: ShareholderItem[] }) => {
                if (result.error) {
                    errorNotification("天眼查获取股东信息", result.error)
                } else {
                    setShareholder(result.shareholder)
                }
                return
            }
        ).catch(err => errorNotification("天眼查获取股东信息", err))
        $tianYanChaInvestment(id).then(
            (result: { error: Error, investment: InvestmentItem[] }) => {
                if (result.error) {
                    errorNotification("天眼查获取投资信息", result.error)
                } else {
                    setInvestment(result.investment)
                }
                return
            }
        ).catch(err => errorNotification("天眼查获取投资信息", err))
        $tianYanChaWechat(id).then(
            (result: { error: Error, wechat: WechatItem[] }) => {
                if (result.error) {
                    errorNotification("天眼查获取微信公众号信息", result.error)
                } else {
                    setWechat(result.wechat)
                }
                return
            }
        ).catch(err => errorNotification("天眼查获取微信公众号信息", err))
        $tianYanChaWeibo(id).then(
            (result: { error: Error, weibo: WeiboItem[] }) => {
                if (result.error) {
                    errorNotification("天眼查获取微博信息", result.error)
                } else {
                    setWeibo(result.weibo)
                }
                return
            }
        ).catch(err => errorNotification("天眼查获取微博信息", err))
        $tianYanChaSupplier(id).then(
            (result: { error: Error, supplier: SupplierItem[] }) => {
                if (result.error) {
                    errorNotification("天眼查获取供应商信息", result.error)
                } else {
                    setSupplier(result.supplier)
                }
                return
            }
        ).catch(err => errorNotification("天眼查获取供应商信息", err))
        $tianYanChaApp(id).then(
            (result: { error: Error, app: AppItem[] }) => {
                if (result.error) {
                    errorNotification("天眼查获取APP信息", result.error)
                } else {
                    setApp(result.app)
                }
                return
            }
        ).catch(err => errorNotification("天眼查获取APP信息", err))
    }

    const suggest = async (key: string) => {
        const result = await $tianYanChaSuggest(key)
        if (result.error) {
            errorNotification("Tianyancha", result.error, 5)
            return
        }
        if (result.items.length == 0) {
            setOptions([
                { value: "", label: <span style={{ color: "#bfbfbf" }}>暂无匹配项</span>, id: "" }
            ])
            return
        }
        const tmpOptions: SuggestOption[] | [] = result.items.map((item) => {
            const tmp: SuggestOption = {
                value: item.comName,
                label: renderLabel(item.name),
                id: item.graphId
            }
            return tmp
        })
        setOptions(tmpOptions)
    }
    return <Space direction="vertical" style={{ width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
            <AutoComplete
                style={{ width: "600px" }}
                size="small"
                allowClear
                value={input}
                onChange={setInput}
                onSearch={handleInputChange}
                onSelect={(value, option) => { query(option.id); setInputCache(value) }}
                placeholder='Search...'
                options={options}
            />
        </div>
        <div style={{ display: "flex", height: "50%" }}>
            <div style={{ width: "30%" }}>
                <ConfigProvider theme={{
                    components: {
                        Descriptions: {
                            titleMarginBottom: 1,
                        },
                        List: {
                            itemPadding: "2px 0",
                        }
                    }
                }}>
                    <ScrollBar height={"calc(100vh - 110px)"}>
                        <Descriptions
                            contentStyle={{ fontSize: "12px" }}
                            size="small"
                            labelStyle={{ fontSize: "12px" }}
                            column={2}
                            title={<span style={{ fontSize: "12px" }}>{inputCache}</span>}
                            items={[
                                {
                                    key: "", label: "电话", children:
                                        <>
                                            {
                                                (!baseInfo?.phone || baseInfo?.phone?.length == 0) && "-"
                                            }
                                            {
                                                baseInfo?.phone?.length == 1 && baseInfo.phone[0]
                                            }
                                            {
                                                baseInfo?.phone?.length > 1 && <Popover
                                                    destroyTooltipOnHide
                                                    content={
                                                        <List
                                                            split={false}
                                                            style={{ maxHeight: "200px", overflowY: "auto" }}
                                                            itemLayout="horizontal"
                                                            dataSource={baseInfo.phone.slice(1)}
                                                            renderItem={(item) => (
                                                                <List.Item>
                                                                    {item}
                                                                </List.Item>
                                                            )}
                                                        />
                                                    }
                                                >
                                                    {baseInfo.phone[0]}
                                                </Popover>
                                            }
                                        </>
                                },
                                {
                                    key: "", label: "邮箱", children:
                                        <>
                                            {
                                                (!baseInfo?.email || baseInfo?.email?.length == 0) && "-"
                                            }
                                            {
                                                baseInfo?.email?.length == 1 && baseInfo.email[0]
                                            }
                                            {
                                                baseInfo?.email?.length > 1 && <Popover
                                                    destroyTooltipOnHide
                                                    content={
                                                        <List
                                                            split={false}
                                                            dataSource={baseInfo.email.slice(1)}
                                                            renderItem={(item) => (
                                                                <List.Item>
                                                                    {item}
                                                                </List.Item>
                                                            )}
                                                        />
                                                    }
                                                >
                                                    {baseInfo.email[0]}
                                                </Popover>
                                            }
                                        </>
                                },
                                { key: "", label: "网址", children: baseInfo?.website, span: 2 },
                                { key: "", label: "地址", children: baseInfo?.address }
                            ]} />
                        <Collapse
                            bordered={false}
                            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            style={{ background: token.colorBgContainer, overflow: "auto", height: "auto" }}
                            items={getItems(panelStyle)}
                        />
                    </ScrollBar>
                </ConfigProvider>
            </div>
            <div style={{ width: "70%" }}>
                {/* {baseInfo?.description} */}
                {/* <RightPenetration treeData={
                    {
                        'name': '大公司',
                        'id': '1',
                        'children': [{
                            'children': [{
                                'children': [],
                                'money': 3000,
                                'scale': 30,
                                'name': '大公司黔西南分公司1',
                                'id': '1-1-1',
                                'type': '0'
                            }],
                            'money': 3000,
                            'scale': 30,
                            'name': '大公司黔西南分公司',
                            'id': '1-1',
                            'type': '0'
                        }, {
                            'children': [],
                            'money': 3000,
                            'scale': 30,
                            'name': '大公司六盘水分公司',
                            'id': '1-2',
                            'type': '0'
                        }, {
                            'children': [],
                            'money': 3000,
                            'scale': 30,
                            'name': '大公司贵阳分公司',
                            'id': '1-3',
                            'type': '0'
                        }, {
                            'children': [],
                            'money': 3000,
                            'scale': 30,
                            'name': '大公司安顺分公司',
                            'id': '1-4',
                            'type': '0'
                        }, {
                            'children': [],
                            'money': 3000,
                            'scale': 30,
                            'name': '大公司毕节分公司',
                            'id': '1-5',
                            'type': '0'
                        }, {
                            'children': [],
                            'money': 3000,
                            'scale': 30,
                            'name': '大公司遵义分公司',
                            'id': '1-6',
                            'type': '0'
                        }, {
                            'children': [],
                            'money': 3000,
                            'scale': 30,
                            'name': '大公司黔东南分公司',
                            'id': '1-7',
                            'type': '0'
                        }, {
                            'children': [
                                { 'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司1', 'id': '1-8-1', 'money': 200, 'scale': 20, 'type': '0' },
                                { 'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司2', 'id': '1-8-2', 'money': 200, 'scale': 20, 'type': '0' },
                            ],
                            'money': 3000,
                            'scale': 30,
                            'name': '大公司铜仁分公司',
                            'id': '1-8',
                            'type': '0'
                        }, {
                            'children': [
                                { 'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司1', 'id': '1-9-1', 'money': 200, 'scale': 20, 'type': '0' },
                                { 'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司2', 'id': '1-9-2', 'money': 200, 'scale': 20, 'type': '0' },
                            ],
                            'name': '大公司黔南分公司',
                            'id': '1-9',
                            'money': 3000,
                            'scale': 30,
                            'type': '0'
                        }
                        ],
                        'parents': [
                            {
                                'controlPerson': true,
                                'money': '3000',
                                'children': [
                                    { 'controlPerson': true, 'money': '3000', 'children': [], 'parentMoney': 3000, 'old': true, 'id': '1-01-1', 'name': '发展公司父级公司1', 'scale': 30, 'type': '0', 'oldUrlName': '' },
                                    { 'controlPerson': true, 'money': '3000', 'children': [], 'parentMoney': 3000, 'old': true, 'id': '2-01-1', 'name': '发展公司父级公司2', 'scale': 70, 'type': '0', 'oldUrlName': '' },
                                ],
                                'name': '发展公司',
                                'id': '01-1',
                                'scale': 90,
                                'type': '0',
                                'oldUrlName': ''
                            }
                        ]

                    }} ></RightPenetration> */}
                    {/* <MindMapGraphGraph/> */}
                    <Zoomeye/>
            </div>
        </div>

    </Space >
}


const TianYanCha: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string>();
    const [items, setItems] = useState<TabsProps['items']>([]);
    const newTabIndex = useRef(0);

    useEffect(() => {
        setItems([{
            label: `${++newTabIndex.current}`,
            key: `${newTabIndex.current}`,
            children: <TabContent />,
        }])

    }, [])
    const onChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey);
    };

    const add = () => {
        const newActiveKey = `${++newTabIndex.current}`;
        const newPanes = [...items];
        newPanes.push({ label: newActiveKey, children: <TabContent />, key: newActiveKey });
        setItems(newPanes);
        setActiveKey(newActiveKey);
    };

    const remove = (targetKey: any) => {
        let newActiveKey = activeKey;
        let lastIndex = -1;
        items.forEach((item, i) => {
            if (item.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const newPanes = items.filter((item) => item.key !== targetKey);
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key;
            } else {
                newActiveKey = newPanes[0].key;
            }
        }
        setItems(newPanes);
        setActiveKey(newActiveKey);
    };

    const onEdit = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            add();
        } else {
            remove(targetKey);
        }
    };




    return (
        <ConfigProvider theme={
            {
                components: {
                    Tabs: {
                        cardHeight: 24
                    }
                }
            }
        }>
            <Tabs
                size="small"
                type="editable-card"
                onChange={onChange}
                activeKey={activeKey}
                onEdit={onEdit}
                items={items}
            />
        </ConfigProvider>

    );
}

export default TianYanCha