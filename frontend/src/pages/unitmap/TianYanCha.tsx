import { AutoComplete, Avatar, Badge, Button, Collapse, CollapseProps, ConfigProvider, Descriptions, Input, List, Popover, Space, TabPaneProps, Tabs, TabsProps, Tag, theme } from "antd"
import React, { CSSProperties, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { errorNotification } from "@/component/Notification";
import { CaretRightOutlined } from "@ant-design/icons";
import ScrollBar from "../../component/ScrollBar";
import * as d3 from 'd3';
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
        // $tianYanChaBaseInfo(id).then(
        //     (result: { error: Error, baseInfo: BaseInfo }) => {
        //         if (result.error) {
        //             errorNotification("天眼查获取基本信息", result.error)
        //         } else {
        //             setBaseInfo(result.baseInfo)
        //             console.log(result.baseInfo)
        //         }
        //         return
        //     }
        // ).catch(err => errorNotification("天眼查获取基本信息", err))
        // $tianYanChaSubsidiary(id).then(
        //     (result: { error: Error, subsidiary: SubsidiaryItem[] }) => {
        //         if (result.error) {
        //             errorNotification("天眼查获取子公司", result.error)
        //         } else {
        //             setSubsidiary(result.subsidiary)
        //         }
        //         return
        //     }
        // ).catch(err => errorNotification("天眼查获取子公司", err))
        // $tianYanChaShareholder(id).then(
        //     (result: { error: Error, shareholder: ShareholderItem[] }) => {
        //         if (result.error) {
        //             errorNotification("天眼查获取股东信息", result.error)
        //         } else {
        //             setShareholder(result.shareholder)
        //         }
        //         return
        //     }
        // ).catch(err => errorNotification("天眼查获取股东信息", err))
        // $tianYanChaInvestment(id).then(
        //     (result: { error: Error, investment: InvestmentItem[] }) => {
        //         if (result.error) {
        //             errorNotification("天眼查获取投资信息", result.error)
        //         } else {
        //             setInvestment(result.investment)
        //         }
        //         return
        //     }
        // ).catch(err => errorNotification("天眼查获取投资信息", err))
        // $tianYanChaWechat(id).then(
        //     (result: { error: Error, wechat: WechatItem[] }) => {
        //         if (result.error) {
        //             errorNotification("天眼查获取微信公众号信息", result.error)
        //         } else {
        //             setWechat(result.wechat)
        //         }
        //         return
        //     }
        // ).catch(err => errorNotification("天眼查获取微信公众号信息", err))
        // $tianYanChaWeibo(id).then(
        //     (result: { error: Error, weibo: WeiboItem[] }) => {
        //         if (result.error) {
        //             errorNotification("天眼查获取微博信息", result.error)
        //         } else {
        //             setWeibo(result.weibo)
        //         }
        //         return
        //     }
        // ).catch(err => errorNotification("天眼查获取微博信息", err))
        // $tianYanChaSupplier(id).then(
        //     (result: { error: Error, supplier: SupplierItem[] }) => {
        //         if (result.error) {
        //             errorNotification("天眼查获取供应商信息", result.error)
        //         } else {
        //             setSupplier(result.supplier)
        //         }
        //         return
        //     }
        // ).catch(err => errorNotification("天眼查获取供应商信息", err))
        // $tianYanChaApp(id).then(
        //     (result: { error: Error, app: AppItem[] }) => {
        //         if (result.error) {
        //             errorNotification("天眼查获取APP信息", result.error)
        //         } else {
        //             setApp(result.app)
        //         }
        //         return
        //     }
        // ).catch(err => errorNotification("天眼查获取APP信息", err))
    }

    const suggest = async (key: string) => {
        // const result = await $tianYanChaSuggest(key)
        // if (result.error) {
        //     errorNotification("Tianyancha", result.error, 5)
        //     return
        // }
        // if (result.items.length == 0) {
        //     setOptions([
        //         { value: "", label: <span style={{ color: "#bfbfbf" }}>暂无匹配项</span>, id: "" }
        //     ])
        //     return
        // }
        // const tmpOptions: SuggestOption[] | [] = result.items.map((item) => {
        //     const tmp: SuggestOption = {
        //         value: item.comName,
        //         label: renderLabel(item.name),
        //         id: item.graphId
        //     }
        //     return tmp
        // })
        // setOptions(tmpOptions)
    }
    const nodeClickEvent = (e:any,d:any)=>{
        alert(d.name)
    }
    const svgRef = useRef<{
        svg: d3.Selection<SVGSVGElement, undefined, null, undefined>,
        width:number,
        height:number,
        gAll?: any,
        gLinks?: any,
        gNodes?: any,
        tree?: any,
        rootOfDown?: any,
        rootOfUp?: any,
        dx:number,
        dy:number,
        rectWidth:number,
        rectHeight:number,
    }>({
        svg:d3.create('svg').attr("viewBox",[-1600/2,-800/2,1600,800]).style("user-select","none"),
        // 节点的横向距离
        dx: 200, //diamonds.intervalW
        // 节点的纵向距离
        dy: 170, //diamonds.intervalH
        // svg的viewBox的宽度
        width: 0, //diamonds.w
        // svg的viewBox的高度
        height: 0,//diamonds.h
        // 节点的矩形框宽度
        rectWidth: 170,  //originDiamonds.w
        // 节点的矩形框高度
        rectHeight: 70, //originDiamonds.h
    })
    let data = {
        id: "abc1005",
        // 根节点名称
        name: "山东吠舍科技有限责任公司",
        // 子节点列表
        children: [
            {
                id:"abc1006",
                name: "山东第一首陀罗科技服务有限公司",
                percent: '100%',
            },
            {
                id:"abc1007",
                name: "山东第二首陀罗程技术有限公司",
                percent: '100%',
            },
            {
                id:"abc1008",
                name: "山东第三首陀罗光伏材料有限公司",
                percent: '100%',
            },
            {
                id:"abc1009",
                name: "山东第四首陀罗科技发展有限公司",
                percent: '100%',
                children: [
                    {
                        id:"abc1010",
                        name: "山东第一达利特瑞利分析仪器有限公司",
                        percent: '100%',
                        children:[
                            {
                                id:"abc1011",
                                name: "山东瑞利的子公司一",
                                percent: '80%',
                            },
                            {
                                id:"abc1012",
                                name: "山东瑞利的子公司二",
                                percent: '90%',
                            },
                            {
                                id:"abc1013",
                                name: "山东瑞利的子公司三",
                                percent: '100%',
                            },
                        ]
                    }
                ]
            },
            {
                id:"abc1014",
                name: "山东第五首陀罗电工科技有限公司",
                percent: '100%',
                children: [
                    {
                        id:"abc1015",
                        name: "山东第二达利特低自动化设备有限公司",
                        percent: '100%',
                        children:[
                            {
                                id:"abc1016",
                                name: "山东敬业的子公司一",
                                percent: '100%',
                            },
                            {
                                id:"abc1017",
                                name: "山东敬业的子公司二",
                                percent: '90%',
                            }
                        ]
                    }
                ]
            },
            {
                id: "abc1020",
                name: "山东第六首陀罗分析仪器(集团)有限责任公司",
                percent: '100%',
                children: [
                    {
                        id:"abc1021",
                        name: "山东第三达利特分气体工业有限公司",
                    }
                ]
            },
        ],
        // 父节点列表
        parents: [
            {
                id: "abc2001",
                name: "山东刹帝利集团有限责任公司",
                percent: '60%',
                parents: [
                    {
                        id: "abc2000",
                        name: "山东婆罗门集团有限公司",
                        percent: '100%',
                    },
                ]
            },
            {
                id: "abc2002",
                name: "吴小远",
                percent: '40%',
            }
        ],
    }
    useEffect(() => {
        drawChart('fold')
    }, []);

    // 初始化树结构数据
    const drawChart=(stype:string)=> {
        // 宿主元素的d3选择器对象
        let host = d3.select("#svg");
        // 宿主元素的DOM，通过node()获取到其DOM元素对象
        let dom = host.node();
        // 宿主元素的DOMRect
        // if(!dom)return
        // let domRect = dom.getBoundingClientRect();
        // svg的宽度和高度
        svgRef.current.width = 400
        svgRef.current.height = 200

        let oldSvg = d3.select('svg')
        // 如果宿主元素中包含svg标签了，那么则删除这个标签，再重新生成一个
        if(!oldSvg.empty()){
            oldSvg.remove();
        }

        const svg = d3
            .create("svg")
            .attr("viewBox", ():any => {
                let parentsLength = data.parents ? data.parents.length : 0;
                return [
                    -svgRef.current.width / 2,
                    // 如果有父节点，则根节点居中，否则根节点上浮一段距离
                    parentsLength > 0 ? -svgRef.current.height / 2 : -svgRef.current.height / 3,
                    svgRef.current.width,
                    svgRef.current.height,
                ]
            })
            .style("user-select", "none")
            .style("cursor","move");

        // 包括连接线和节点的总集合
        const gAll = svg.append("g").attr("id", "all");
        const zoomAction = zoom<SVGSVGElement, any>()
            .scaleExtent([0.2, 1])
            .on("zoom", (e: any) => {
                if (gAll) {
                    gAll.attr('transform', e.transform); // 应用缩放变换
                }
            })
        svg.call(
            zoomAction
        ).on("dblclick.zoom", null);
        // 设置初始缩放比例
        svg.call(zoomAction.scaleTo, 0.3);
        // svgRef.current.svg.call(zoom1).on("dblclick.zoom", null);
        svgRef.current.gAll = gAll;
        // 连接线集合
        svgRef.current.gLinks = gAll.append("g").attr("id", "linkGroup");
        // 节点集合
        svgRef.current.gNodes = gAll.append("g").attr("id", "nodeGroup");
        // 设置好节点之间距离的tree方法
        svgRef.current.tree = d3.tree().nodeSize([svgRef.current.dx, svgRef.current.dy]);

        svgRef.current.rootOfDown = d3.hierarchy(data,(d:any) => d.children);
        svgRef.current.rootOfUp = d3.hierarchy(data,(d:any) => d.parents);
        svgRef.current.tree(svgRef.current.rootOfDown);

        [svgRef.current.rootOfDown.descendants(), svgRef.current.rootOfUp.descendants()].forEach((nodes) => {
            nodes.forEach((node:any) => {
                node._children = node.children || undefined;
                if(stype === 'all'){
                    //如果是all的话，则表示全部都展开
                    node.children = node._children;
                } else if(stype === 'fold'){ //如果是fold则表示除了父节点全都折叠
                    // 将非根节点的节点都隐藏掉（其实对于这个组件来说加不加都一样）
                    if (node.depth) {
                        node.children = undefined;
                    }
                }
            });
        });

        //箭头(下半部分)
        svg
            .append("marker")
            .attr("id", "markerOfDown")
            .attr("markerUnits", "userSpaceOnUse")
            .attr("viewBox", "0 -5 10 10") //坐标系的区域
            .attr("refX", 55) //箭头坐标
            .attr("refY", 0)
            .attr("markerWidth", 10) //标识的大小
            .attr("markerHeight", 10)
            .attr("orient", "90") //绘制方向，可设定为：auto（自动确认方向）和 角度值
            .attr("stroke-width", 2) //箭头宽度
            .append("path")
            .attr("d", "M0,-5L10,0L0,5") //箭头的路径
            .attr("fill", "#215af3"); //箭头颜色

        //箭头(上半部分)
        svg
            .append("marker")
            .attr("id", "markerOfUp")
            .attr("markerUnits", "userSpaceOnUse")
            .attr("viewBox", "0 -5 10 10") //坐标系的区域
            .attr("refX", -50) //箭头坐标
            .attr("refY", 0)
            .attr("markerWidth", 10) //标识的大小
            .attr("markerHeight", 10)
            .attr("orient", "90") //绘制方向，可设定为：auto（自动确认方向）和 角度值
            .attr("stroke-width", 2) //箭头宽度
            .append("path")
            .attr("d", "M0,-5L10,0L0,5") //箭头的路径
            .attr("fill", "#215af3"); //箭头颜色

        svgRef.current.svg = svg;
        update(undefined);
        // 将svg置入宿主元素中
        host.append(function () {
            return svg.node();
        });
    }

    // 更新数据
   const update=(source:any)=> {
        if (!source) {
            source = {
                x0: 0,
                y0: 0,
            };
            // 设置根节点所在的位置（原点）
            svgRef.current.rootOfDown.x0 = 0;
            svgRef.current.rootOfDown.y0 = 0;
            svgRef.current.rootOfUp.x0 = 0;
            svgRef.current.rootOfUp.y0 = 0;
        }

        let nodesOfDown = svgRef.current.rootOfDown.descendants().reverse();
        let linksOfDown = svgRef.current.rootOfDown.links();
        let nodesOfUp = svgRef.current.rootOfUp.descendants().reverse();
        let linksOfUp = svgRef.current.rootOfUp.links();

       svgRef.current.tree(svgRef.current.rootOfDown);
       svgRef.current.tree(svgRef.current.rootOfUp);

        const myTransition = svgRef.current.svg.transition().duration(500);

        /***  绘制子公司树  ***/
        const node1 = svgRef.current.gNodes
            .selectAll("g.nodeOfDownItemGroup")
            .data(nodesOfDown, (d:any) => {
                return d.data.id;
            });

        const node1Enter = node1
            .enter()
            .append("g")
            .attr("class", "nodeOfDownItemGroup")
            .attr("transform", (d:any) => {
                return `translate(${source.x0},${source.y0})`;
            })
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .style("cursor", "pointer");

        // 外层的矩形框
        node1Enter
            .append("rect")
            .attr("width", (d:any) => {
                if (d.depth === 0) {
                    return (d.data.name.length + 2) * 16;
                }
                return svgRef.current.rectWidth;
            })
            .attr("height", (d:any) => {
                if (d.depth === 0) {
                    return 30;
                }
                return svgRef.current.rectHeight;
            })
            .attr("x", (d:any) => {
                if (d.depth === 0) {
                    return (-(d.data.name.length + 2) * 16) / 2;
                }
                return -svgRef.current.rectWidth / 2;
            })
            .attr("y", (d:any) => {
                if (d.depth === 0) {
                    return -15;
                }
                return -svgRef.current.rectHeight / 2;
            })
            .attr("rx", 5)
            .attr("stroke-width", 1)
            .attr("stroke", (d:any) => {
                if (d.depth === 0) {
                    return "#5682ec";
                }
                return "#7A9EFF";
            })
            .attr("fill", (d:any) => {
                if (d.depth === 0) {
                    return "#7A9EFF";
                }
                return "#FFFFFF";
            })
            .on("click", (e:any, d:any) => {
                nodeClickEvent(e,d)
            });
        // 文本主标题
        node1Enter
            .append("text")
            .attr("class", "main-title")
            .attr("x", (d:any) => {
                return 0;
            })
            .attr("y", (d:any) => {
                if (d.depth === 0) {
                    return 5;
                }
                return -14;
            })
            .attr("text-anchor", (d:any) => {
                return "middle";
            })
            .text((d:any) => {
                if (d.depth === 0) {
                    return d.data.name;
                } else {
                    return d.data.name.length > 11
                        ? d.data.name.substring(0, 11)
                        : d.data.name;
                }
            })
            .attr("fill", (d:any) => {
                if (d.depth === 0) {
                    return "#FFFFFF";
                }
                return "#000000";
            })
            .style("font-size", (d:any) => (d.depth === 0 ? 16 : 14))
            .style('font-family','黑体')
            .style("font-weight", "bold");
        // 副标题
        node1Enter
            .append("text")
            .attr("class", "sub-title")
            .attr("x", (d:any) => {
                return 0;
            })
            .attr("y", (d:any) => {
                return 5;
            })
            .attr("text-anchor", (d:any) => {
                return "middle";
            })
            .text(( d:any) => {
                if (d.depth !== 0) {
                    let subTitle = d.data.name.substring(11);
                    if (subTitle.length > 10) {
                        return subTitle.substring(0, 10) + "...";
                    }
                    return subTitle;
                }
            })
            .style("font-size", (d:any) => 14)
            .style('font-family','黑体')
            .style("font-weight", "bold");

        // 控股比例
        node1Enter
            .append("text")
            .attr("class", "percent")
            .attr("x", (d:any) => {
                return 12;
            })
            .attr("y", (d:any) => {
                return -45;
            })
            .text(( d:any) => {
                if (d.depth !== 0) {
                    return d.data.percent;
                }
            })
            .attr("fill", "#000000")
            .style('font-family','黑体')
            .style("font-size", (d:any) => 14);

        // 增加展开按钮
        const expandBtnG = node1Enter
            .append("g")
            .attr("class", "expandBtn")
            .attr("transform", (d:any) => {
                return `translate(${0},${svgRef.current.rectHeight / 2})`;
            })
            .style("display", (d:any) => {
                // 如果是根节点，不显示
                if (d.depth === 0) {
                    return "none";
                }
                // 如果没有子节点，则不显示
                if (!d._children) {
                    return "none";
                }
            })
            .on("click", (e:any, d:any) => {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                }
                update(d);
            });

        expandBtnG
            .append("circle")
            .attr("r", 8)
            .attr("fill", "#7A9EFF")
            .attr("cy", 8);

        expandBtnG
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .attr("y", 13)
            .style('font-size', 16)
            .style('font-family','微软雅黑')
            .text((d:any)=>{
                return d.children ? "-" : "+"
            });

        const link1 = svgRef.current.gLinks
            .selectAll("path.linkOfDownItem")
            .data(linksOfDown, (d:any) => d.target.data.id);

        const link1Enter = link1
            .enter()
            .append("path")
            .attr("class", "linkOfDownItem")
            .attr("d", (d:any) => {
                let o = {
                    source: {
                        x: source.x0,
                        y: source.y0,
                    },
                    target: {
                        x: source.x0,
                        y: source.y0,
                    },
                };
                return drawLink(o);
            })
            .attr("fill", "none")
            .attr("stroke", "#7A9EFF")
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#markerOfDown)");

        // 有元素update更新和元素新增enter的时候
        node1
            .merge(node1Enter)
            .transition(myTransition)
            .attr("transform", (d:any) => {
                return `translate(${d.x},${d.y})`;
            })
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // 有元素消失时
        node1
            .exit()
            .transition(myTransition)
            .remove()
            .attr("transform", (d:any) => {
                return `translate(${source.x0},${source.y0})`;
            })
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        link1.merge(link1Enter).transition(myTransition).attr("d", drawLink);

        link1
            .exit()
            .transition(myTransition)
            .remove()
            .attr("d", (d:any) => {
                let o = {
                    source: {
                        x: source.x,
                        y: source.y,
                    },
                    target: {
                        x: source.x,
                        y: source.y,
                    },
                };
                return drawLink(o);
            });

        /***  绘制股东树  ***/

        nodesOfUp.forEach((node:any) => {
            node.y = -node.y
        })

        const node2 = svgRef.current.gNodes
            .selectAll("g.nodeOfUpItemGroup")
            .data(nodesOfUp, (d:any) => {
                return d.data.id;
            });

        const node2Enter = node2
            .enter()
            .append("g")
            .attr("class", "nodeOfUpItemGroup")
            .attr("transform", (d:any) => {
                return `translate(${source.x0},${source.y0})`;
            })
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .style("cursor", "pointer");

        // 外层的矩形框
        node2Enter
            .append("rect")
            .attr("width", (d:any) => {
                if (d.depth === 0) {
                    return (d.data.name.length + 2) * 16;
                }
                return svgRef.current.rectWidth;
            })
            .attr("height", (d:any) => {
                if (d.depth === 0) {
                    return 30;
                }
                return svgRef.current.rectHeight;
            })
            .attr("x", (d:any) => {
                if (d.depth === 0) {
                    return (-(d.data.name.length + 2) * 16) / 2;
                }
                return -svgRef.current.rectWidth / 2;
            })
            .attr("y", (d:any) => {
                if (d.depth === 0) {
                    return -15;
                }
                return -svgRef.current.rectHeight / 2;
            })
            .attr("rx", 5)
            .attr("stroke-width", 1)
            .attr("stroke", (d:any) => {
                if (d.depth === 0) {
                    return "#5682ec";
                }
                return "#7A9EFF";
            })
            .attr("fill", (d:any) => {
                if (d.depth === 0) {
                    return "#7A9EFF";
                }
                return "#FFFFFF";
            })
            .on("click", (e:any, d:any) => {
                nodeClickEvent(e,d)
            });
        // 文本主标题
        node2Enter
            .append("text")
            .attr("class", "main-title")
            .attr("x", (d:any) => {
                return 0;
            })
            .attr("y", (d:any) => {
                if (d.depth === 0) {
                    return 5;
                }
                return -14;
            })
            .attr("text-anchor", (d:any) => {
                return "middle";
            })
            .text(( d:any) => {
                if (d.depth === 0) {
                    return d.data.name;
                } else {
                    return d.data.name.length > 11
                        ? d.data.name.substring(0, 11)
                        : d.data.name;
                }
            })
            .attr("fill", (d:any) => {
                if (d.depth === 0) {
                    return "#FFFFFF";
                }
                return "#000000";
            })
            .style("font-size", (d:any) => (d.depth === 0 ? 16 : 14))
            .style('font-family','黑体')
            .style("font-weight", "bold");
        // 副标题
        node2Enter
            .append("text")
            .attr("class", "sub-title")
            .attr("x", (d:any) => {
                return 0;
            })
            .attr("y", (d:any) => {
                return 5;
            })
            .attr("text-anchor", (d:any) => {
                return "middle";
            })
            .text(( d:any) => {
                if (d.depth !== 0) {
                    let subTitle = d.data.name.substring(11);
                    if (subTitle.length > 10) {
                        return subTitle.substring(0, 10) + "...";
                    }
                    return subTitle;
                }
            })
            .style("font-size", (d:any) => 14)
            .style('font-family','黑体')
            .style("font-weight", "bold");

        // 控股比例
        node2Enter
            .append("text")
            .attr("class", "percent")
            .attr("x", (d:any) => {
                return 12;
            })
            .attr("y", (d:any) => {
                return 55;
            })
            .text(( d:any) => {
                if (d.depth !== 0) {
                    return d.data.percent;
                }
            })
            .attr("fill", "#000000")
            .style('font-family','黑体')
            .style("font-size", (d:any) => 14);

        // 增加展开按钮
        const expandBtnG2 = node2Enter
            .append("g")
            .attr("class", "expandBtn")
            .attr("transform", (d:any) => {
                return `translate(${0},${-svgRef.current.rectHeight / 2})`;
            })
            .style("display", (d:any) => {
                // 如果是根节点，不显示
                if (d.depth === 0) {
                    return "none";
                }
                // 如果没有子节点，则不显示
                if (!d._children) {
                    return "none";
                }
            })
            .on("click", (e:any, d:any) => {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                }
                update( d);
            });

        expandBtnG2
            .append("circle")
            .attr("r", 8)
            .attr("fill", "#7A9EFF")
            .attr("cy", -8);

        expandBtnG2
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .attr("y", -3)
            .style('font-size', 16)
            .style('font-family','微软雅黑')
            .text(( d:any)=>{
                return d.children ? "-" : "+"
            });

        const link2 = svgRef.current.gLinks
            .selectAll("path.linkOfUpItem")
            .data(linksOfUp, (d:any) => d.target.data.id);

        const link2Enter = link2
            .enter()
            .append("path")
            .attr("class", "linkOfUpItem")
            .attr("d", (d:any) => {
                let o = {
                    source: {
                        x: source.x0,
                        y: source.y0,
                    },
                    target: {
                        x: source.x0,
                        y: source.y0,
                    },
                };
                return drawLink(o);
            })
            .attr("fill", "none")
            .attr("stroke", "#7A9EFF")
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#markerOfUp)");

        // 有元素update更新和元素新增enter的时候
        node2
            .merge(node2Enter)
            .transition(myTransition)
            .attr("transform", (d:any) => {
                return `translate(${d.x},${d.y})`;
            })
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // 有元素消失时
        node2
            .exit()
            .transition(myTransition)
            .remove()
            .attr("transform", (d:any) => {
                return `translate(${source.x0},${source.y0})`;
            })
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        link2.merge(link2Enter).transition(myTransition).attr("d", drawLink);

        link2
            .exit()
            .transition(myTransition)
            .remove()
            .attr("d", (d:any) => {
                let o = {
                    source: {
                        x: source.x,
                        y: source.y,
                    },
                    target: {
                        x: source.x,
                        y: source.y,
                    },
                };
                return drawLink(o);
            });

        // node数据改变的时候更改一下加减号
        const expandButtonsSelection = d3.selectAll('g.expandBtn')

        expandButtonsSelection.select('text').transition().text(( d:any) =>{
            return d.children ? "-" : "+";
        })

        svgRef.current.rootOfDown.eachBefore(( d:any) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
        svgRef.current.rootOfUp.eachBefore(( d:any) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }


    // 直角连接线 by wushengyuan
    const drawLink = ({ source, target }: { source: any; target: any })=> {
        const halfDistance = (target.y - source.y) / 2;
        const halfY = source.y + halfDistance;
        return `M${source.x},${source.y} L${source.x},${halfY} ${target.x},${halfY} ${target.x},${target.y}`;
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
            <Button onClick={()=>{
                data.children.push({
                    id:"abc10099",
                    name: "1111111111111111",
                    percent: '10%',
                },)
                update(data)
            }}>111</Button>
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
                                                (baseInfo && (!baseInfo?.phone || baseInfo?.phone?.length == 0)) && "-"
                                            }
                                            {
                                                baseInfo && (baseInfo?.phone?.length == 1 && baseInfo.phone[0])
                                            }
                                            {
                                                baseInfo && baseInfo?.phone?.length > 1 && <Popover
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
                                                (baseInfo && (!baseInfo?.email || baseInfo?.email?.length == 0)) && "-"
                                            }
                                            {
                                                baseInfo?.email?.length == 1 && baseInfo.email[0]
                                            }
                                            {
                                                baseInfo && baseInfo?.email?.length > 1 && <Popover
                                                    destroyTooltipOnHide
                                                    content={
                                                        <List
                                                            split={false}
                                                            dataSource={baseInfo?.email.slice(1)}
                                                            renderItem={(item) => (
                                                                <List.Item>
                                                                    {item}
                                                                </List.Item>
                                                            )}
                                                        />
                                                    }
                                                >
                                                    {baseInfo?.email[0]}
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
            <div style={{ width: "70%" }} id={"svg"}>

            </div>
        </div>

    </Space >
}

import {Tab} from 'rc-tabs/lib/interface'
import {Selection} from "d3-selection";
import {HierarchyNode, svg, TreeLayout, zoom, ZoomBehavior, ZoomTransform} from "d3";
const TianYanCha: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string>();
    const [items, setItems] = useState<Tab[]>([]);
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