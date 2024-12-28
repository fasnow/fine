//https://juejin.cn/post/7359203560167178250
import React, {CSSProperties, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {Button, Drawer, Flex, Input, InputNumber, Modal, Spin, TableColumnsType, Tag, Tooltip} from "antd";
import TabsV2 from "@/component/TabsV2";
import {errorNotification} from '@/component/Notification';
import {appActions, RootState} from '@/store/store';
import {useDispatch, useSelector} from 'react-redux';
import {config, constant, tianyancha} from '../../wailsjs/go/models';
import {buttonProps} from './Setting';
import {UserOutlined} from "@ant-design/icons";
import {GetHolder, GetInvestee, SetAuth, Suggest} from "../../wailsjs/go/tianyancha/Bridge";
import {TYC} from "@/pages/Constants";
import {CheckboxOptionType} from "antd/es/checkbox/Group";
import type {CascaderProps} from 'antd/es/cascader'
import {copy} from "@/util/util";
import {WithIndex} from "@/component/Interface";
import Candidate, {ItemType} from "@/component/Candidate";
import './TianYanCha.css'
import PenetrationItem = tianyancha.PenetrationItem;
import {FindByPartialKey} from "../../wailsjs/go/history/Bridge";
import History = constant.History;

interface Options {
    width:any
    height:any
    nodeGapX: number
    nodeGapY: number
    nodeWidth: number
    nodeHeight: number
    rootNodeHeight: number
    addChildren?:(item:PenetrationItem, direction:string)=>Promise<PenetrationItem[] | undefined>
    filterForShow?:(data:PenetrationItem)=>boolean,
    onNodeClick?:(node:PenetrationItem)=>void
}

type  PageDataType = WithIndex<tianyancha.SearchCompanyV4Item>

const pageSizeOptions = [50, 100, 150, 200, 500]

const Data: PageDataType[]=Array.from({ length: 100 }, (v,k) => ({
    index:k+1,
    "id": 4463868045,
    "name": "平昌县民兴小学工会委员会会会会会会会会会会会会会会会会会会会会会会会会会会会会会会会会",
    "type": 1,
    "matchType": null,
    "base": "四川",
    "legalPersonName": "苟佳文",
    "estiblishTime": "1952-08-18 00:00:00.0",
    "regCapital": "基层工会",
    "regStatus": "正常",
    "score": '',
    "orginalScore": '',
    "bonusScore": '',
    "companyScore": '',
    "historyNames": "中国教育工会平昌县民兴小学委员会",
    "categoryCode": "",
    "industry": '',
    "humanNames": '',
    "trademarks": '',
    "tmList": '',
    "productList": '',
    "usedBondName": '',
    "bondName": '',
    "bondNum": 0,
    "bondType": '',
    "newtestName": "",
    "regNumber": "",
    "orgNumber": "",
    "creditCode": "81511923MC0497145J",
    "businessScope": "-",
    "regLocation": "平昌县镇龙镇民兴社区",
    "phone": "",
    "phoneList": [],
    "phoneInfoList": null,
    "businessItemList": null,
    "phoneNum": "",
    "logo": "",
    "city": "巴中市",
    "district": "",
    "emails": "",
    "emailList": null,
    "websites": "",
    "hiddenPhones": "",
    "abbr": null,
    "tagList": null,
    "companyType": 9,
    "companyOrgType": null,
    "labelList": null,
    "matchField": null,
    "latitude": null,
    "longitude": null,
    "legalPersonId": "",
    "legalPersonType": "0",
    "distance": null,
    "categoryStr": null,
    "isClaimed": 0,
    "claimPkgType": null,
    "realClaimPkgType": null,
    "baiduUrl": null,
    "isBranch": 0,
    "alias": "民兴小学",
    "claimInfo": null,
    "hidden": 0,
    "legalPersonShowStr": "负责人",
    "regCapitalShowStr": "企业类型",
    "estiblishTimeShowStr": "成立日期",
    "multiMatchField": [
        {
            "isLink": 1,
            "field": "曾用名",
            "content": "<em>中国</em>教育工会平昌县民兴小学委员会"
        }
    ],
    "labelListV2": null,
    "labelJsonList": null,
    "taxCode": "81511923MC0497145J",
    "socialSecurityStaff_num": null,
    "categoryCodeStd": null,
    "hasMorePhone": null,
    "hasVideo": null,
    "videoId": null,
    "isRecommend": null,
    "englishName": null,
    "firstPositionShowStr": "负责人",
    "secondPositionShowStr": "企业类型",
    "firstPositionValue": "苟佳文",
    "secondPositionValue": "基层工会",
    "bizType": "0",
    "docFeature": "{\"isFollowed\":0,\"isMonitored\":0,\"historyClicks\":0,\"byAnn\":0,\"timeClicks\":[],\"byBaidu\":0}",
    "companyNum": null,
    "department": "",
    "illegalType": "0",
    "targetGid": "",
    "targetName": "",
    "changeTime": "",
    "isIn": "",
    "mainId": "",
    "targetRegCapitalAmount": "",
    "targetRegCapitalCurrency": "",
    "legalPerson": "",
    "gidForB": "4463868045",
    "geoLocation": null,
    "websiteFilingCount": 0,
    "repCurrency": null,
    "province": null,
    "areaCodes": null,
    "address": null,
    "establishmentTime": "19520818",
    "icps": null,
    "icp": "",
    "changeRatio": "",
    "afterRatio": "",
    "changeAmt": "",
    "registerInstitute": "平昌县总工会",
    "companyScale": null,
    "abstractsBaseInfo": "平昌县民兴小学工会委员会 (曾用名：中国教育工会平昌县民兴小学委员会) ，成立于1952年，位于四川省巴中市。",
    "financingRound": "-",
    "staffNumReportYear": null,
    "categoryCode2017List": null,
    "institutionTypeList": null,
    "companyBrandInfo": null,
    "companyGroupInfo": null,
    "contantMap": null,
    "companyPhoneBook": null,
    "companyQuestions": null,
    "selfRiskCount": 0,
    "legalPersonLogo": null,
    "legalPersonAlias": null,
    "relatedRiskCount": 0,
    "historyRiskCount": 0,
    "followLabel": null,
    "contentType": 1,
    "normalWord": null,
    "suggestWordList": null,
    "companyHumanInfo": null,
    "phoneType": null,
    "phoneTips": null,
    "publicSentimentNewsInfo": null,
    "enterpriseServiceGoodsInfo": null,
    "qfLabels": null,
    "productShowMore": null,
    "goodsAndProducts": null,
    "shortVideoList": null,
    "focusCompanyList": null,
    "isBrandArea": 0,
    "areaType": 0,
    "customizedImagePath": "",
    "isBrandAreaControlGroup": 0,
    "adsFlag": null,
    "isCooperationShow": null,
    "cooperationUrl": "",
    "albumHeadImgPath": null,
    "albumCount": null,
    "websiteUrl": null,
    "websiteRiskType": 0,
    "hotMsg": null,
    "hotType": null,
    "competitorName": null,
    "brandInstitutionGroupCard": null,
    "publishDemandCard": null,
    "appDynamicCompanyCard": null,
    "emptyRecommendTextCard": null,
    "emptyRecommendCompanyCard": null,
    "recommendScene": null,
    "companyBrand": null,
    "companyGroup": null,
    "institutionCard": null,
    "verticalCard": null,
    "phoneTagType": 1,
    "aladdinCompanyCard": null,
    "illegalSocialOrganization": null,
    "labelListV3": [],
    "regStatusLabel": [
        {
            "companyId": 4463868045,
            "profileTagId": 42,
            "profileTagTypeId": 5,
            "profileTagNameOnPage": "正常",
            "profileTagLogo": "",
            "borderTransparency": "0.1",
            "guideTransparency": "0.4",
            "borderWidth": "0.5",
            "borderColor": "#089944",
            "guideColor": "#089944",
            "fontSize": 12,
            "fontFamily": "系统",
            "color": "#089944",
            "background": "#E9FCF1"
        }
    ],
    "newlyCompanyCard": null,
    "deepSearchCard": null,
    "legalPersonForList": "苟佳文",
    "regCapitalForList": "-",
    "provinceName": "四川省",
    "cityName": "巴中市",
    "districtName": "平昌县",
    "categoryNameLv1": null,
    "categoryNameLv2": null,
    "categoryNameLv3": null,
    "categoryNameLv4": null,
    "orgType": "基层工会",
    "approveDate": "-",
    "businessTerm": "-",
    "socialSecurityStaffNum": "-",
    "companyScaleInfo": null,
    "followInfo": { "status": 0, "tagId": null, "tagName": null },
    "legalPersonList": [
        { "hid": 0, "cid": 4463868045, "type": 0, "name": "苟佳文" }
    ],
    "englishNameForTab": "",
    convertValues(a: any, classs: any, asMap: boolean = false): any {
    },
}));

type NodeType = PenetrationItem & {
    children?: PenetrationItem[]
    parents?: PenetrationItem[]
}

class StockTreeVertical {
    private ref: any;
    private onLoad: any;
    private clonedSvgBoxInfo: any;
    private svg: any;
    private gAll: any;
    private gLinks: any;
    private gNodes: any;
    private tree: any;
    private rootOfDown: any;
    private rootOfUp: any;
    private nodeColorList: any;
    private transition: any;
    private zoomHandler:any
    private opts:Options
    private treeData:NodeType
    constructor(ref:any, root:PenetrationItem, children:PenetrationItem[], parents:PenetrationItem[], options:Options) {
        this.opts = options
        this.ref = ref // 宿主元素选择器,是个ref对象
        this.treeData = {...root,children:children,parents:parents} as NodeType

        this.onLoad =
            function () {
                console.log('--------加载完毕---------')
            }

        // 节点的颜色列表
        this.nodeColorList = [
            {
                name: 'white',
                rectColor: '#ffffff',
                textColor: '#000000',
                percentBarColor: '#95C3FF'
            },
            {
                // 节点颜色方案名称
                name: 'blue',
                // 节点背景颜色
                rectColor: '#6f90fb',
                // 节点文字颜色
                textColor: '#ffffff',
                // 控股比例条的颜色
                percentBarColor: '#95C3FF'
            },
            {
                name: 'orange',
                rectColor: '#feba07',
                textColor: '#000000',
                percentBarColor: '#fff9f1'
            },
            {
                name: 'green',
                rectColor: '#AAF69F',
                textColor: '#000000',
                percentBarColor: '#90C2FF'
            },
            {
                name: 'yellow',
                rectColor: '#FEEC70',
                textColor: '#000000',
                percentBarColor: '#90C2FF'
            }
        ]

        this.transition = d3.transition().duration(500).ease(d3.easeCubicOut)

        // 被克隆的svgbox的信息
        this.clonedSvgBoxInfo = {
            // 宽度
            borderWidth: 0,
            // 下半部分的高度
            downSectionHeight: 0,
            // 上半部分的高度
            upSectionHeight: 0
        }
        this.zoomHandler = d3
            .zoom<SVGSVGElement,undefined>()
            .scaleExtent([0.01, 5])
            .on('zoom', (e) => {
                this.svg
                    .select('g') // 确保从 svg 中选择 gAll
                    .transition()
                    .duration(500)
                    .ease(d3.easeCubicOut)
                    .attr('transform', () => {
                        return `translate(${e.transform.x},${e.transform.y}) scale(${e.transform.k})`;
                    });
            })



        // 设置好节点之间距离的tree方法
        this.tree = d3.tree().nodeSize([this.opts.nodeGapX, this.opts.nodeGapY])



        this.process()

        this.update(null)

        this.onLoad()
        // this.drawChart({
        //     type: 'fold'
        // })
    }

    private process(){
        // 投资公司树的根节点
        const t = {...this.treeData}
        t.children = t.children?.filter(child=>{
            if (this.opts.filterForShow){
                return this.opts.filterForShow(child)
            }
            return true
        })
        this.rootOfDown = d3.hierarchy(t, (d:any) => d.children)

        // 股东树的根节点
        this.rootOfUp = d3.hierarchy(this.treeData, (d:any) => d.parents)
        console.log(this.rootOfDown, this.rootOfUp);
        [this.rootOfDown.descendants(), this.rootOfUp.descendants()].forEach((nodes) => {
            nodes.forEach((node:any) => {
                node._children = node.children || null
                // if (options.type === 'all') {
                //     //如果是all的话，则表示全部都展开
                //     node.children = node._children
                // } else if (options.type === 'fold') {
                //     //如果是fold则表示除了父节点全都折叠
                //     // 将非根节点的节点都隐藏掉（其实对于这个组件来说加不加都一样）
                //     if (node.depth) {
                //         node.children = null
                //     }
                // }
            })
        })

        // 清空并重新绘制
        const container = d3.select(this.ref);
        container.selectAll('*').remove();
        const host = container.append("div")
            .attr("id", "svgBox")
            .style("width", this.opts.width)
            .style("height", this.opts.height);
        const domRect = (host.node() as HTMLElement)?.getBoundingClientRect()
        this.svg = host
            .append('svg')
            .attr('viewBox', () => {
                let parentsLength = this.treeData.parents ? this.treeData.parents.length : 0
                return [
                    -Math.floor(domRect.width / 2),
                    parentsLength > 0 ? -Math.floor(domRect.height / 2) : -Math.floor(domRect.height / 3),
                    Math.floor(domRect.width),
                    1 // width height设置成百分比，这个height只需要设置有效数字即可
                ];
            })
            .attr('width', this.opts.width)
            .attr('height', `calc(calc(${this.opts.height}) - 5px)`)
            .style('user-select', 'none')
            .style('cursor', 'move')

        //箭头(下半部分)
        this.svg
            .append('marker')
            .attr('id', 'markerOfDown')
            .attr('markerUnits', 'userSpaceOnUse')
            .attr('viewBox', '0 -5 10 10') //坐标系的区域
            .attr('refX', 10) //箭头坐标
            .attr('refY', 0)
            .attr('markerWidth', 13) //标识的大小
            .attr('markerHeight', 13)
            .attr('orient', '90') //绘制方向，可设定为：auto（自动确认方向）和 角度值
            .attr('stroke-width', 2) //箭头宽度
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5') //箭头的路径
            .attr('fill', '#9DA8BA') //箭头颜色

        //箭头(上半部分)
        this.svg
            .append('marker')
            .attr('id', 'markerOfUp')
            .attr('markerUnits', 'userSpaceOnUse')
            .attr('viewBox', '0 -5 10 10') //坐标系的区域
            .attr('refX', -20) //箭头坐标
            .attr('refY', 0)
            .attr('markerWidth', 13) //标识的大小
            .attr('markerHeight', 13)
            .attr('orient', '90') //绘制方向，可设定为：auto（自动确认方向）和 角度值
            .attr('stroke-width', 2) //箭头宽度
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5') //箭头的路径
            .attr('fill', '#9DA8BA') //箭头颜色

        this.svg
            .append('defs')
            .append('filter')
            .attr('id', 'rect-shadow')
            .append('feDropShadow')
            .attr('stdDeviation', 8)
            .attr('flood-color', 'rgba(32,52,128,0.15)')
        // .attr('flood-opacity', 0.4)

        this.svg.call(this.zoomHandler).on('dblclick.zoom', null) // 取消默认的双击放大事件
        this.zoomHandler.translateTo(this.svg, 0, 0)

        // 包括连接线和节点的总集合
        this.gAll = this.svg.append('g').attr('id', 'all')

        // 连接线集合
        this.gLinks = this.gAll.append('g').attr('id', 'linkGroup')

        // 节点集合
        this.gNodes = this.gAll.append('g').attr('id', 'nodeGroup')
    }

    reset(){
        // const t = {...this.treeData}
        // t.children = t.children?.filter(child=>{
        //     if (this.opts.filterForShow){
        //         return this.opts.filterForShow(child)
        //     }
        //     return true
        // })
        // this.rootOfDown = d3.hierarchy(t, (d:any) => d.children)
        this.process()
        this.update(null);
    }

    // 更新数据
    private update(source:any) {
        if (!source) {
            source = {
                x0: 0,
                y0: 0,
                x: 0,
                y: 0
            }
            // 设置根节点所在的位置（原点）
            this.rootOfDown.x0 = 0
            this.rootOfDown.y0 = 0
            this.rootOfUp.x0 = 0
            this.rootOfUp.y0 = 0
        }

        let nodesOfDown = this.rootOfDown.descendants().reverse()
        let linksOfDown = this.rootOfDown.links()
        let nodesOfUp = this.rootOfUp.descendants().reverse()
        let linksOfUp = this.rootOfUp.links()

        this.tree(this.rootOfDown)
        this.tree(this.rootOfUp)

        const myTransition = this.svg.transition().duration(500).ease(d3.easeCubicOut);

        /***  绘制子公司树  ***/
        const node1 = this.gNodes.selectAll('g.nodeOfDownItemGroup').data(nodesOfDown, (d:any) => {
            return d.data.id
        })

        const node1Enter = node1
            .enter()
            .append('g')
            .attr('class', 'nodeOfDownItemGroup')
            .attr('transform', (d:any) => {
                return `translate(${source.x0},${source.y0})`
            })
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            // .style('opacity', 0)
            .style('cursor', 'pointer')
            .on('click', (e:any, d:any) => {
                if (this.opts.onNodeClick){
                    this.opts.onNodeClick(d.data)
                }
            })

        // 外层的矩形框
        node1Enter
            .append('rect')
            .attr('width', (d:any) => {
                if (d.depth === 0) {
                    return (d.data.name.length + 4) * 16
                }
                return this.opts.nodeWidth
            })
            .attr('height', (d:any) => {
                if (d.depth === 0) {
                    return this.opts.rootNodeHeight
                }
                return this.opts.nodeHeight
            })
            .attr('x', (d:any) => {
                if (d.depth === 0) {
                    return (-(d.data.name.length + 4) * 16) / 2
                }
                return -this.opts.nodeWidth / 2
            })
            .attr('y', (d:any) => {
                if (d.depth === 0) {
                    return -this.opts.rootNodeHeight / 2
                }
                return -this.opts.nodeHeight / 2
            })
            .attr('stroke-width', 1)
            .attr('stroke', (d:any) => {
                if (d.depth === 0) {
                    return '#EBD1BB'  // 根节点边框颜色
                }
                return '#cfd4df' // 其他节点的边框颜色
            })
            .attr('rx', 8)  // 圆角
            .attr('fill', (d:any) => {
                if (d.depth === 0) {
                    return '#3982f7'  // 根节点背景颜色
                } else {
                    return "#ffffff"  // 其他节点的背景颜色
                }
            })
        // .attr('filter', 'url(#rect-shadow)')  // 应用阴影效果

        node1Enter
            .append('foreignObject')
            .attr('width', '50')
            .attr('height', '20')
            .attr('x', (d:any) => {
                return - this.opts.nodeWidth / 2 - 0.5;
            })
            .attr('y', (d:any) => {
                return -this.opts.nodeHeight / 2 - 10;
            })
            .append('xhtml:div')
            .attr('class', 'extra-info-text') // 添加类名方便样式调整
            .style('display', 'flex')
            .style('width', '100%')
            .style('height', '100%')
            .style('justify-content', 'left')  // 水平居中
            .style('align-items', 'center')  // 垂直居中
            .append('xhtml:div')
            .style('display', 'flex')
            .style('text-overflow', 'ellipsis')
            .style('overflow', 'hidden')
            .style('text-align', 'center')
            .style('padding', '3px')
            .style('font-size', '12px')
            .style('line-height','12px')
            .style('border-radius', '3px')
            .style('color','#eb4e3e')
            .style('background-color', '#fcf1ef')
            .style('display',(d:any)=>{
                return d.depth !== 0 && d.data.statusTag.name === "注销" ? 'block' : 'none';
            })
            .text((d: any) => {
                return d.depth!== 0? d.data.statusTag.name : '';
            })


        // 添加字体自适应的功能
        node1Enter
            .append('foreignObject')
            .attr('width', (d:any) => {
                if (d.depth === 0) {
                    return (d.data.name.length + 4) * 16
                }
                return this.opts.nodeWidth
            })
            .attr('height', (d:any) => {
                if (d.depth === 0) {
                    return this.opts.rootNodeHeight
                }
                return this.opts.nodeHeight
            })
            .attr('x', (d:any) => {
                if (d.depth === 0) {
                    return (-(d.data.name.length + 4) * 16) / 2
                }
                return -this.opts.nodeWidth / 2
            })
            .attr('y', (d:any) => {
                if (d.depth === 0) {
                    return -this.opts.rootNodeHeight / 2
                }
                return -this.opts.nodeHeight / 2
            })
            .append('xhtml:div')
            .style('display', 'flex')
            .style('width', '100%')
            .style('height', '100%')
            .style('justify-content', 'center')  // 水平居中
            .style('align-items', 'center')  // 垂直居中
            .append('xhtml:div')
            .style('display', '-webkit-box')
            .style('-webkit-box-orient', 'vertical')
            .style('-webkit-line-clamp', 2)
            .style('-webkit-box-align', 'center')
            .style('text-overflow', 'ellipsis')
            .style('overflow', 'hidden')
            .style('text-align', 'center')
            .style('padding', '0 5px 0 12px')
            .style('font-weight', '500')
            .style('font-size', (d:any) => {
                if (d.depth === 0) {
                    return '16px'
                } else {
                    return '14px'
                }
            }) // 设置字体大小
            .style('color', (d:any) => {
                if (d.depth === 0) {
                    return '#ffffff'
                } else {
                    return 'none'
                }
            })
            .style('font-weight', (d:any) => {
                if (d.depth === 0) {
                    return 'bold'
                }
            })
            .attr('title', (d:any) => {
                return d.data.name
            })
            .text((d:any) => {
                return d.data.name
            })

        // 有元素update更新和元素新增enter的时候
        node1
            .merge(node1Enter)
            .transition(myTransition)
            .attr('transform', (d:any) => {
                return `translate(${d.x},${d.y})`
            })
            .attr('fill-opacity', 1)
            .attr('stroke-opacity', 1)
            .style('opacity', 1)

        // 有元素消失时
        node1
            .exit()
            .transition(myTransition)
            .remove()
            .attr('transform', () => {
                return `translate(${source.x0},${source.y0})`
            })
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .style('opacity', 0)

        const link1 = this.gLinks
            .selectAll('path.linkOfDownItem')
            .data(linksOfDown, (d: any) => d.target.data.id);

        link1
            .enter()
            .append('path')
            .attr('class', 'linkOfDownItem')
            .attr('d', (d: any) => {
                // 初始路径，从 source 自身到自身
                const o = { x: source.x0, y: source.y0 };
                return this.drawLink("down", { source: o, target: o });
            })
            .attr('fill', 'none')
            .attr('stroke', '#9DA8BA')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#markerOfDown)')
            .style('opacity', 0) // 初始透明度
            .merge(link1) // 合并进入更新部分
            .transition()
            .duration(500)
            .attr('d', (d: any) => this.drawLink("down", d)) // 更新路径到最终位置
            .style('opacity', 1); // 逐渐显现

        link1
            .exit()
            .transition()
            .duration(500)
            .attr('d', (d: any) => {
                // 终止路径，模拟收缩回 source
                const o = { x: d.source.x, y: d.source.y };
                return this.drawLink("down", { source: o, target: o });
            })
            .style('opacity', 0)
            .remove();

        const linkLabels = this.gLinks
            .selectAll('text.linkLabel')
            .data(linksOfDown, (d: any) => d.target.data.id);

        linkLabels
            .enter()
            .append('text')
            .attr('class', 'linkLabel')
            .attr('x', (d: any) => d.source.x) // 初始位置为父节点
            .attr('y', (d: any) => d.source.y) // 初始位置为父节点
            .text((d: any) => {
                return `${Math.round(d.target.data.ratio * 100 * 100) / 100}%`
            }) // 设置标签内容
            .style('fill', '#3982f7')
            .merge(linkLabels) // 更新文字标签
            .transition(myTransition)
            .attr('x', (d: any) => d.target.x + 10) // 更新位置
            .attr('y', (d: any) => d.target.y - this.opts.nodeHeight / 2 - 20)
            .style('opacity', 1); // 逐渐显现

        linkLabels
            .exit()
            .transition()
            .duration(500)
            .attr('x', (d: any) => d.source.x)
            .attr('y', (d: any) => d.source.y)
            .style('opacity', 0)
            .remove();


        // 添加展开按钮
        const expandBtnG = node1Enter
            .append('g')
            .attr('class', 'expandBtn')
            .attr('transform', () => {
                return `translate(${0},${this.opts.nodeHeight / 2})`
            })
            .style('display', (d:any) => {
                // 如果是根节点，不显示
                if (d.depth === 0) {
                    return 'none'
                }
                // // 如果没有子节点，则不显示
                // if (!d._children) {
                //     return 'none'
                // }
                if (!d.data?.hasInvestor){
                    return 'none'
                }
                // if (!d.data?.hasInvestor || !d.visible){
                //     return 'none'
                // }
            })
            .on('click', async (e: any, d: any) => {
                // https://www.cnblogs.com/shihuc/p/6064448.html
                e.stopPropagation()
                if (d.children && d.children.length > 0) {
                    // 如果当前节点有子节点并且通过过滤条件，则收起子节点
                    // if (d.depth !== 0 && this.opts.filterForShow && !this.opts.filterForShow(d.data)) {
                    //     d.visible = true
                    //     return;
                    // }
                    d._children = d.children;
                    d.children = null;
                } else if (d._children && d._children.length > 0) {
                    // // 如果当前节点有隐藏的子节点并且通过过滤条件，则展开子节点
                    // if (d.depth !== 0 && this.opts.filterForShow && !this.opts.filterForShow(d.data)) {
                    //     d.visible = true
                    //     return;
                    // }
                    d.children = d._children;
                    d._children = null;
                } else {
                    // 如果当前节点没有子节点，通过 addChildren 动态加载，并应用过滤条件
                    if (this.opts.addChildren) {
                         // 应用过滤条件
                        const t = (await this.opts.addChildren(d.data, "OUT"))
                        if (t === undefined){
                            return
                        }
                        const tt = t
                            .map((child) => {
                                const childNode = d3.hierarchy(child);
                                return {
                                    ...childNode,
                                    depth: d.depth + 1,
                                    parent: d,
                                };
                            })
                            .filter((child) => {
                                if (this.opts.filterForShow) {
                                    return this.opts.filterForShow(child.data)
                                }
                                return true
                            })
                        if(!tt || tt.length === 0){
                            d3.select(d3.select(e.target).node().parentNode).style("display", "none");
                            return
                        }
                        d.children = tt;
                    }
                    // if (this.opts.addChildren){
                    //     d.children = (await this.opts.addChildren(d.data.id, "OUT")).map((child) => {
                    //             const a = d3.hierarchy(child)
                    //             return {
                    //                 ...a,
                    //                 depth: d.depth + 1,
                    //                 parent: d,
                    //             }
                    //         }
                    //     )
                    // }
                }

                this.update(d)
            })


        // 添加圆形背景
        expandBtnG
            .append('circle')
            .attr('r', 7.5)
            .attr('stroke', '#9EA9BB')
            .attr('stroke-width', 1)
            .attr('fill', '#EAF3FF')
            .attr('cy', 0)

        // 添加加减号文本
        expandBtnG
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', '#9EA9BB')
            .attr('y', 7.5)
            .style('font-size', 30)
            .style('font-family', '黑体')
            .text((d:any) => {
                return d.children ? '-' : '+'
                // return d.children ? '-' : '+'
            })

        /***  绘制股东树  ***/

        nodesOfUp.forEach((node:any) => {
            node.y = -node.y
        })

        const link2 = this.gLinks
            .selectAll('path.linkOfUpItem')
            .data(linksOfUp, (d:any) => {
                return d.target.data.id
            })

        link2
            .enter()
            .append('path')
            .attr('class', 'linkOfUpItem')
            .attr('d', (d: any) => {
                // 初始路径，从 source 自身到自身
                const o = { x: source.x0, y: source.y0 };
                return this.drawLink("up", { source: o, target: o });
            })
            .attr('fill', 'none')
            .attr('stroke', '#9DA8BA')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#markerOfUp)')
            .style('opacity', 0) // 初始透明度
            .merge(link2) // 合并进入更新部分
            .transition()
            .duration(500)
            .attr('d', (d: any) => this.drawLink("up", d)) // 更新路径到最终位置
            .style('opacity', 1); // 逐渐显现

        link2
            .exit()
            .transition()
            .duration(500)
            .attr('d', (d: any) => {
                // 终止路径，模拟收缩回 source
                const o = { x: d.source.x, y: d.source.y };
                return this.drawLink("up", { source: o, target: o });
            })
            .style('opacity', 0)
            .remove();

        const linkLabels2 = this.gLinks
            .selectAll('text.linkLabel2')
            .data(linksOfUp, (d: any) => d.target.data.id);

        linkLabels2
            .enter()
            .append('text')
            .attr('class', 'linkLabel2')
            .attr('x', (d: any) => d.source.x) // 初始位置为父节点
            .attr('y', (d: any) => d.source.y) // 初始位置为父节点
            .attr('dy',10) // 默认字体大小14px，修正基线误差
            .text((d: any) => {
                return `${Math.round(d.target.data.ratio * 100 * 100) / 100}%`
            }) // 设置标签内容
            .style('fill', '#3982f7')
            .merge(linkLabels2) // 更新文字标签
            .transition(myTransition)
            .attr('x', (d: any) => d.target.x + 10) // 更新位置
            .attr('y', (d: any) => d.target.y + this.opts.nodeHeight / 2 + 10)
            .style('opacity', 1); // 逐渐显现

        linkLabels2
            .exit()
            .transition()
            .duration(500)
            .attr('x', (d: any) => d.source.x)
            .attr('y', (d: any) => d.source.y)
            .style('opacity', 0)
            .remove();

        const node2 = this.gNodes.selectAll('g.nodeOfUpItemGroup').data(nodesOfUp, (d:any) => {
            return d.data.id
            // return d.data.id
        })

        const node2Enter = node2
            .enter()
            .append('g')
            .attr('class', 'nodeOfUpItemGroup')
            .attr('transform', () => {
                return `translate(${source.x0},${source.y0})`
            })
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .style('opacity', 0)
            .style('cursor', 'pointer')
            .style('display', (d:any) => {
                if (d.depth === 0) return 'none'
            })
            .on('click', (e:any, d:any) => {
                if (this.opts.onNodeClick){
                    this.opts.onNodeClick(d.data)
                }
            })

        // 外层的矩形框
        node2Enter
            .append('rect')
            .attr('width', (d:any) => {
                if (d.depth === 0) {
                    return (d.data.name.length + 4) * 16
                }
                return this.opts.nodeWidth
            })
            .attr('height', (d:any) => {
                if (d.depth === 0) {
                    return this.opts.rootNodeHeight
                }
                return this.opts.nodeHeight
            })
            .attr('x', (d:any) => {
                if (d.depth === 0) {
                    return (-(d.data.name.length + 4) * 16) / 2
                }
                return -this.opts.nodeWidth / 2
            })
            .attr('y', (d:any) => {
                if (d.depth === 0) {
                    return -this.opts.rootNodeHeight / 2
                }
                return -this.opts.nodeHeight / 2
            })
            .attr('stroke-width', 1)
            .attr('stroke', (d:any) => {
                if (d.depth === 0) {
                    return '#EBD1BB'  // 根节点边框颜色
                }
                return '#cfd4df' // 其他节点的边框颜色
            })
            .attr('rx', 8)
            .attr('fill', (d:any) => {
                if (d.depth === 0) {
                    return '#FFF9F1'  // 根节点背景颜色
                } else {
                    return "#ffffff"  // 其他节点的背景颜色
                }
            })
        // todo => 这个阴影效果，还不好，后续优化
        // .attr('filter', 'url(#rect-shadow)')

        // 添加字体自适应的功能
        node2Enter
            .append('foreignObject')
            .attr('width', (d:any) => {
                if (d.depth === 0) {
                    return (d.data.name.length + 4) * 16
                }
                return this.opts.nodeWidth
            })
            .attr('height', (d:any) => {
                if (d.depth === 0) {
                    return this.opts.rootNodeHeight
                }
                return this.opts.nodeHeight
            })
            .attr('x', (d:any) => {
                if (d.depth === 0) {
                    return (-(d.data.name.length + 4) * 16) / 2
                }
                return -this.opts.nodeWidth / 2
            })
            .attr('y', (d:any) => {
                if (d.depth === 0) {
                    return -this.opts.rootNodeHeight / 2
                }
                return -this.opts.nodeHeight / 2
            })
            .append('xhtml:div')
            .style('display', 'flex')
            .style('width', '100%')
            .style('height', '100%')
            .style('justify-content', 'center')  // 水平居中
            .style('align-items', 'center')  // 垂直居中
            .append('xhtml:div')
            .style('display', '-webkit-box')
            .style('-webkit-box-orient', 'vertical')
            .style('-webkit-line-clamp', 2)
            .style('-webkit-box-align', 'center')
            .style('text-overflow', 'ellipsis')
            .style('overflow', 'hidden')
            .style('text-align', 'center')
            .style('padding', '0 5px 0 12px')
            .style('font-weight', '500')
            .style('font-size', (d:any) => {
                if (d.depth === 0) {
                    return '16px'
                } else {
                    return '14px'
                }
            }) // 设置字体大小
            .style('color', (d:any) => {
                if (d.depth === 0) {
                    return '#ffffff'
                } else {
                    return 'none'
                }
            })
            .style('font-weight', (d:any) => {
                if (d.depth === 0) {
                    return 'bold'
                }
            })
            .attr('title', (d:any) => {
                return d.data.name
            })
            .text((d:any) => {
                return d.data.name
            })

        // 有元素update更新和元素新增enter的时候
        node2
            .merge(node2Enter)
            .transition(myTransition)
            .attr('transform', (d:any) => {
                return `translate(${d.x},${d.y})`
            })
            .attr('fill-opacity', 1)
            .attr('stroke-opacity', 1)
            .style('opacity', 1)

        // 有元素消失时
        node2
            .exit()
            .transition(myTransition)
            .remove()
            .attr('transform', () => {
                return `translate(${source.x0},${source.y0})`
            })
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .style('opacity', 0)

        // 添加展开按钮
        const expandBtnG2 = node2Enter
            .append('g')
            .attr('class', 'expandBtn')
            .attr('transform', () => {
                return `translate(${0},-${this.opts.nodeHeight / 2})`
            })
            .style('display', (d:any) => {
                // 如果是根节点，不显示
                if (d.depth === 0) {
                    return 'none'
                }
                // // 如果没有子节点，则不显示
                // if (!d._children) {
                //     return 'none'
                // }
                if (!d.data?.hasHolder){
                    return 'none'
                }
            })
            .on('click', async (e: any, d: any) => {
                e.stopPropagation()
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else if (d._children) {
                    d.children = d._children;
                    d._children = null;
                } else {
                    if (this.opts.addChildren){
                        const t = (await this.opts.addChildren(d.data, "IN"))
                        if (t === undefined){
                            return
                        }
                        d.children = t.map((item) => {
                                const a = d3.hierarchy(item)
                                return {
                                    ...a,
                                    depth: d.depth + 1,
                                    parent: d,
                                }
                            }
                        )
                    }
                }
                this.update(d)
            })

        // 添加圆形背景
        expandBtnG2
            .append('circle')
            .attr('r', 7.5)
            .attr('stroke', '#9EA9BB')
            .attr('stroke-width', 1)
            .attr('fill', '#EAF3FF')
            .attr('cy', 0)

        // 添加加减号文本
        expandBtnG2
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', '#9EA9BB')
            .attr('y', 7.5)
            .style('font-size', 30)
            .style('font-family', '黑体')
            .text((d:any) => {
                return d.children ? '-' : '+'
            })


        // node数据改变的时候更改一下加减号
        const expandButtonsSelection = d3.selectAll('g.expandBtn')

        expandButtonsSelection
            .select('text')
            .transition()
            .text((d:any) => {
                return d.children ? '-' : '+'
            })

        this.rootOfDown.eachBefore((d:any) => {
            d.x0 = d.x
            d.y0 = d.y
        })
        this.rootOfUp.eachBefore((d:any) => {
            d.x0 = d.x
            d.y0 = d.y
        })

        // let transform = d3.zoomTransform(this.gAll.node())
        // this.gAll.transition(myTransition).attr("transform", () => {
        //   return `translate(${-source.x},${-source.y}) scale(${transform.k})`
        // })
        // console.log(transform)
        // this.gAll.attr('transform');
        // 使用translateTo省去繁琐的计算，直接将svg元素的中心坐标移至点击的节点坐标。
        // this.zoomHandler.translateTo(this.svg, source.x, source.y)
        this.svg
            .call(
                this.zoomHandler.scaleTo, // 设置缩放比例
                0.8
            )
            .call(() => {
                this.zoomHandler.translateTo(this.svg, source.x, source.y); // 移动到指定坐标
            });
    }

    // 直角连接线 by wushengyuan
    private drawLink(direction:any,{source, target}:{source:any,target:any}) {
        if (direction === "up"){
            const bottom = target.y + this.opts.nodeHeight/2
            return `M${source.x},${source.y} 
                L${source.x},
                ${bottom + 40} ${target.x},
                ${bottom + 40} ${target.x},
                ${bottom}`
        }else if (direction === "down"){
            const top = target.y - this.opts.nodeHeight/2
            return `M${source.x},${source.y} 
                    L${source.x},
                    ${top - 40} ${target.x},
                    ${top - 40} ${target.x},
                    ${top}`
        }
    }

    clear(){
        const container = d3.select(this.ref);
        container.selectAll('*').remove();
    }
}

type ChildType = {
    id: string,
    name: string,
    percent: number,
    hasInvestor?: boolean
}

type ParentType = {
    id: string,
    name: string,
    percent: number,
    hasHolder?: boolean
}

let childrenItems:ChildType[] = [
    {
        id: "BG00001",
        name: "京海控股集团有限公司",
        percent: 1,
        hasInvestor:false
    },
    {
        id: "BG00008",
        name: "中国邮政集团有限公司四川省宜宾市分公司啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊",
        percent: 1,
        hasInvestor:true
    },
    {
        id: "BG00048",
        name: "京海企业投资有限公司",
        percent: 0.01,
        hasInvestor:false
    },
]

let parentsItems:ParentType[] = [
    {
        id: "BG00001",
        name: "京海控股集团有限公司",
        percent: 1,
        hasHolder:false
    },
    {
        id: "JH00001",
        name: "高启强",
        percent: 0.1,
        hasHolder:true
    },
    {
        id: "JH00002",
        name: "高启盛",
        percent: 0.1,
    },
]

const LabelCssProps:CSSProperties={
    textAlign:"left",paddingRight:"5px",minWidth:"70px", width:"70px",height:"24px"
}

const AuthSetting: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state:RootState)=>state.app.global.config || new config.Config())
    const [key, setKey] = useState("")

    useEffect(()=>{
        setKey(cfg.TianYanCha.token)
    }, [cfg.TianYanCha])


    const save = ()=>{
        SetAuth(key).then(
            ()=>{
                const t = { ...cfg, TianYanCha: { ...cfg.TianYanCha, token: key } } as config.Config;
                dispatch(appActions.setConfig(t))
                setOpen(false)
                setEditable(false)
            }
        ).catch(
            err => {
                errorNotification("错误", err)
                setKey(cfg.TianYanCha.token)
            }
        )
    }

    const cancel=() => {
        setEditable(false);
        setOpen(false)
        setKey(cfg.TianYanCha.token)
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

const SharedOptions: CascaderProps<any>= {
    allowClear: true,
    multiple: true,
    size: 'small',
    maxTagCount: 'responsive',
    maxTagPlaceholder: (omittedValues) => (
        <Tooltip
            overlayStyle={{ pointerEvents: 'none' }}
            title={omittedValues.map(({ label }) => label).join('\n')}
        >
            {omittedValues.length}
        </Tooltip>
    ),
    expandTrigger: 'hover',
};

let selectedRow: { item: PageDataType | undefined, rowIndex: number | undefined, colKey: string } | undefined = {
    item: undefined,
    rowIndex: 0,
    colKey: ''
}

const TabContent: React.FC = () => {
    const defaultColumns: TableColumnsType<PageDataType> = [
        {
            title: '序号', dataIndex: "index", ellipsis: true, width: 50, fixed: true, onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "index"),
                    onClick: () => copy(record.index)
                }
            }
        },
        {
            title: '企业名称', dataIndex: "name", ellipsis: true, width: 400, fixed: true, onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "name"),
                    onClick: () => copy(record.name)
                }
            }
        },
        {
            title: '登记状态', dataIndex: "regStatus", ellipsis: true, width: 80,  onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "regStatus"),
                    onClick: () => copy(record.regStatus)
                }
            },render:(text, record, index) =>{
                return <span>{record.regStatusLabel.map((item:any)=>{
                    return <Tag color={item.background} style={{color:item.color}}>{item.profileTagNameOnPage}</Tag>
                })}</span>
            }
        },
        {
            title: '法定代表人', dataIndex: "legalPersonName", ellipsis: true, width: 90, onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "legalPersonName"),
                    onClick: () => copy(record.legalPersonName)
                }
            }
        },
        {
            title: '注册资本', dataIndex: "regCapital", ellipsis: true, width: 80, onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "regCapital"),
                    onClick: () => copy(record.regCapital)
                }
            }
        },
        {
            title: '成立日期', dataIndex: "estiblishTime", ellipsis: true, width: 110, onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "estiblishTime"),
                    onClick: () => copy(record.estiblishTime)
                }
            }
        },
        {
            title: '统一社会信用代码', dataIndex: "creditCode", ellipsis: true, width: 180, onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "creditCode"),
                    onClick: () => copy(record.creditCode)
                }
            }
        },
        {
            title: '地址', dataIndex: "regLocation", ellipsis: true, width: 180, onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "regLocation"),
                    onClick: () => copy(record.regLocation)
                }
            }
        },
        {
            title: '电话', dataIndex: "phoneNum", ellipsis: true, width: 150,  onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "phoneNum"),
                    onClick: () => copy(record.phoneNum)
                }
            }
        },
        {
            title: '网址', dataIndex: "websites", ellipsis: true, width: 100, onCell: (record, index) => {
                return {
                    onContextMenu: () => handleOnContextMenu(record, index, "websites"),
                    onClick: () => copy(record.websites)
                }
            }
        },
        {
            title: '操作', dataIndex: "operation", ellipsis: true, width: 100,fixed: 'right', render:(text, record, index)=>{
                return <span><Button size={"small"} color="primary" variant="filled">股权结构图</Button></span>
            }
        },
        ]
    const [treeInstance,setTreeInstance] = useState<StockTreeVertical>();
    const [processedData, setProcessedData] = useState<any>();
    const graphRef = useRef<HTMLDivElement | null>(null); // 用于绑定 SVG 容器
    const [isComposing, setIsComposing] = useState(false);
    const [value, setValue] = useState("");
    // const [childrenItems,setChildrenItems] = useState<ChildrenType[]>([])
    // const [parentsItems,setParentsItems] = useState<ParentsItemType[]>([])
    const filterRef = useRef<HTMLDivElement | null>(null);
    // const [pageData, setPageData] = useState<PageDataType[]>([])
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[1])
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const [open, setOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [currentCompany, setCurrentCompany] = React.useState<{name:string,id:string}>({id: "", name: ""});
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerHeight,setContainerHeight] = useState(0)
    const [tableHeight,setTableHeight] = useState(0)
    const [ratioMin, setRatioMin] = useState(0)
    const [ratioMax, setRatioMax] = useState(100)
    const ratioMinRef = useRef(ratioMin)
    const ratioMaxRef = useRef(ratioMax)
    const history = useSelector((state:RootState)=>state.app.global.history || new History())

    useEffect(() => {
        if (filterRef.current){
            setTableHeight(window.innerHeight - filterRef.current?.getBoundingClientRect().height - 153)
            window.addEventListener("resize", ()=>{
                if (filterRef.current){
                    setTableHeight(window.innerHeight - filterRef.current?.getBoundingClientRect().height - 153)
                }
            })
            setContainerHeight(window.innerHeight - 90)
            window.addEventListener("resize", ()=>{
                if (filterRef.current){
                    setContainerHeight(window.innerHeight - 90)
                }
            })
        }
    }, []);

    const handleOnContextMenu = (item: PageDataType, rowIndex: number | undefined, colKey: string) => {
        selectedRow = {item: item, rowIndex: rowIndex, colKey: colKey};
    }

    const query = async (name: string, id: string) => {
        treeInstance?.clear()
        setCurrentCompany({name: name, id: id})
        setOpen(true)
        setLoading(true)
        try {
            const t: PenetrationItem[] = await GetInvestee(id)
            const tt: PenetrationItem[] = await GetHolder(id)
            setTreeInstance(new StockTreeVertical(
                graphRef.current,
                {
                    id: id,
                    name: name,
                    hasInvestor: false,
                } as PenetrationItem,
                t, tt,
                {
                    width: "100%",
                    height: "100%",
                    nodeGapX: 220,
                    nodeGapY: 180,
                    nodeHeight: 100,
                    nodeWidth: 200,
                    rootNodeHeight: 45,
                    addChildren: add,
                    filterForShow:filterForShow,
                    onNodeClick:(node)=>{
                        copy(node.name)
                    }
                }
            ))
        } catch (e) {
            errorNotification("错误", e)
        } finally {
            setLoading(false)
        }
    }

    const add=async (item: PenetrationItem, direction: string) => {
        try {
            setLoading(true)
            if (direction === "IN") {
                return await GetHolder(item.id)
            } else if (direction === "OUT") {
                return await GetInvestee(item.id)
            }

        } catch (e) {
            errorNotification("错误",e)
        } finally {
            setLoading(false)
        }
    }

    const getRegStatus=()=>{
        const t:CheckboxOptionType[] = []
        TYC.regStatus.items.forEach(item=>{
            item.childList.forEach(i=>{
                t.push({label: i.name, value: i.value})
            })
        })
        return t
    }

    const handlePaginationChange=(page:number,pageSize:number)=>{

    }

    const filterForShow=(item:PenetrationItem)=>{
        return item.ratio * 100 >= ratioMinRef.current && item.ratio * 100 <= ratioMaxRef.current;
    }
    return (
        <div ref={containerRef} style={{
            height: containerHeight,
            overflow: 'hidden',
        }}
        >
            <div ref={filterRef}>
                <Flex vertical gap={10}>
                    <Flex justify={'center'}>
                        {/*<Dropdown menu={{ items: suggestItem, onClick:handleSelectSuggest }} placement="bottomCenter">*/}
                        {/*    <Input.Search size={"small"}*/}
                        {/*                  style={{width:"400px"}}*/}
                        {/*                  value={value}*/}
                        {/*                  onChange={handleChange}*/}
                        {/*                  onCompositionStart={handleCompositionStart}*/}
                        {/*                  onCompositionEnd={handleCompositionEnd}*/}
                        {/*                  placeholder="输入内容"*/}
                        {/*                  onSearch={()=>{*/}

                        {/*                  }}*/}
                        {/*    />*/}
                        {/*</Dropdown>*/}
                        <Candidate
                            style={{width:400}}
                            size={"small"}
                            items={[
                                {
                                    fetchOnOpen : (items)=>{return items.length===0},
                                    onSelectItem: (item)=>{
                                        query(item.label as string, item.data.graphId.toString())
                                    },
                                    title: '相关企业',
                                    filter: (v)=>{return !!(v && v.length > 1)},
                                    fetch: async (v) => {
                                        try {
                                            const response = await Suggest(v); // 等待Suggest函数执行完成获取原始数据
                                            const a: ItemType[] = response.map(item => {
                                                const t:ItemType={
                                                    value: item.name,
                                                    label: item.name,
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
                                },
                                // {
                                //     title:"历史记录",
                                //     fetch: async (v) => {
                                //         try {
                                //             const response = await FindByPartialKey(history.tyc, v); // 等待Suggest函数执行完成获取原始数据
                                //             const a: ItemType[] = response.map(item => {
                                //                 const t:ItemType={
                                //                     value: item,
                                //                     label: item,
                                //                     data: item
                                //                 }
                                //                 return t;
                                //             });
                                //             return a;
                                //         } catch (e) {
                                //             errorNotification("错误", String(e));
                                //             return []; // 如果出现错误，返回空数组，避免组件出现异常
                                //         }
                                //     }
                                // }
                            ]
                            }

                        >
                        </Candidate>
                    {/*</Flex>*/}
                    {/*<Flex gap={10}>*/}
                    {/*    <span style={LabelCssProps}>{TYC.scopeType.name}</span>*/}
                    {/*    <Checkbox.Group*/}
                    {/*        options={TYC.scopeType.items.map(item=>{return {label: item.name, value: item.value}})}*/}
                    {/*    />*/}
                    {/*</Flex>*/}
                    {/*<Flex gap={10} wrap>*/}
                    {/*    <Flex gap={10}>*/}
                    {/*        <span style={LabelCssProps}>{TYC.industryCode.name}</span>*/}
                    {/*        <Cascader*/}
                    {/*            {...SharedOptions}*/}
                    {/*            style={{width:"140px"}}*/}
                    {/*            options={TYC.industryCode.items}/>*/}
                    {/*    </Flex>*/}
                    {/*    <Flex gap={10}>*/}
                    {/*        <span style={LabelCssProps}>{TYC.areaCode.name}</span>*/}
                    {/*        <Cascader*/}
                    {/*            {...SharedOptions}*/}
                    {/*            style={{width:"140px"}}*/}
                    {/*            options={TYC.areaCode.items}*/}
                    {/*        />*/}
                    {/*    </Flex>*/}
                    {/*    <Flex gap={10}>*/}
                    {/*        <BadgeWrapper info={TYC.companyScale.right.toUpperCase()}>*/}
                    {/*            <span style={LabelCssProps}>{TYC.companyScale.name}</span>*/}
                    {/*        </BadgeWrapper>*/}
                    {/*        <Cascader*/}
                    {/*            {...SharedOptions}*/}
                    {/*            style={{width:"140px"}}*/}
                    {/*            options={TYC.companyScale.items.map(item=>{return {label: item.name, value: item.value}})}/>*/}
                    {/*    </Flex>*/}
                    {/*    <Flex gap={10}>*/}
                    {/*        <BadgeWrapper info={TYC.tycScore.right.toUpperCase()}>*/}
                    {/*            <span style={LabelCssProps}>{TYC.tycScore.name}</span>*/}
                    {/*        </BadgeWrapper>*/}
                    {/*        <Cascader*/}
                    {/*            {...SharedOptions}*/}
                    {/*            style={{width:"140px"}}*/}
                    {/*            options={TYC.tycScore.items.map(item=>{return {label: item.name, value: item.value}})}/>*/}
                    {/*    </Flex>*/}
                    {/*    <Flex gap={10}>*/}
                    {/*        <BadgeWrapper info={TYC.scienceTechnologyGrade.right.toUpperCase()}>*/}
                    {/*            <span style={LabelCssProps}>{TYC.scienceTechnologyGrade.name}</span>*/}
                    {/*        </BadgeWrapper>*/}
                    {/*        <Cascader*/}
                    {/*            {...SharedOptions}*/}
                    {/*            style={{width:"140px"}}*/}
                    {/*            options={TYC.scienceTechnologyGrade.items.map(item=>{return {label: item.name, value: item.value}})}/>*/}
                    {/*    </Flex>*/}
                    {/*</Flex>*/}
                    {/*<Flex>*/}
                    {/*    <Flex gap={10}>*/}
                    {/*        <span style={LabelCssProps}>{TYC.paidCapital.name}</span>*/}
                    {/*        <Checkbox.Group*/}
                    {/*            options={TYC.paidCapital.items.map(item=>{return {label: item.name, value: item.value}})}*/}
                    {/*        />*/}
                    {/*    </Flex>*/}
                    {/*</Flex>*/}
                    {/*<Flex vertical>*/}
                    {/*    <Flex gap={10}>*/}
                    {/*        <BadgeWrapper info={"VIP"}>*/}
                    {/*            <span style={{...LabelCssProps}}>{TYC.regStatus.name}</span>*/}
                    {/*        </BadgeWrapper>*/}
                    {/*        <Checkbox.Group*/}
                    {/*            defaultValue={["存续/在业", "迁入", "迁出"]}*/}
                    {/*            options={getRegStatus()}*/}
                    {/*        />*/}
                    {/*    </Flex>*/}
                    {/*</Flex>*/}
                    {/*<Flex vertical>*/}
                    {/*    <Flex gap={10}>*/}
                    {/*        <span style={LabelCssProps}>{TYC.branchType.name}</span>*/}
                    {/*        <Checkbox.Group*/}
                    {/*            options={TYC.branchType.items.map(item=>{return {label: item.name, value: item.value}})}*/}
                    {/*        />*/}
                    {/*    </Flex>*/}
                    </Flex>
                </Flex>
            </div>
            {/*<Table*/}
            {/*    rowKey={"index"}*/}
            {/*    bordered*/}
            {/*    sticky*/}
            {/*    size="small"*/}
            {/*    virtual*/}
            {/*    columns={defaultColumns}*/}
            {/*    scroll={{y: tableHeight, x: '100%', scrollToFirstRowOnChange: true}}*/}
            {/*    dataSource={pageData}*/}
            {/*    pagination={false}*/}
            {/*    footer={()=>{*/}
            {/*        return <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>*/}
            {/*            <Pagination*/}
            {/*                showQuickJumper*/}
            {/*                showSizeChanger*/}
            {/*                total={total}*/}
            {/*                pageSizeOptions={pageSizeOptions}*/}
            {/*                defaultPageSize={pageSizeOptions[1]}*/}
            {/*                defaultCurrent={1}*/}
            {/*                current={currentPage}*/}
            {/*                showTotal={(total) => `${total} items`}*/}
            {/*                size="small"*/}
            {/*                onChange={(page, size) => handlePaginationChange(page, size)}*/}
            {/*            />*/}
            {/*            /!*<this.ExportDataPanel id={pageIDMap.current[1]} total={total} currentPageSize={currentPageSize}/>*!/*/}
            {/*        </div>*/}
            {/*    }}*/}
            {/*/>*/}
            <Drawer
                closable={false}
                open={open}
                getContainer={false}
                width={'100%'}
                forceRender
                styles={{
                    body: {
                        padding: '3px',
                    }
                }}
                placement="right"
                // drawerRender={(dom)=>{
                //     return <div style={{height:"100%"}}>{dom}</div>
                // }}
            >
                <Flex vertical style={{ height: "100%",position:'relative'}}>
                    {/*<Spin spinning={loading} style={{position: "absolute", height: "100%", width: "100%"}}>*/}
                    {/*    */}
                    {/*</Spin>*/}
                    <Flex gap={20} style={{zIndex: 10, position: "absolute", backgroundColor:"#ffffff", right: "0"}}>
                        <Tag bordered={false} color="#108ee9" style={{fontSize:"14px", fontWeight:"bold"}}>{currentCompany.name}</Tag>
                        {/*<span>*/}
                        {/*    <Tag bordered={false} color="cyan" style={{fontSize:"14px"}}>经营状态</Tag>*/}
                        {/*    <Radio.Group size={"small"} onChange={e=>{}} defaultValue={"存续/在业"}>*/}
                        {/*        <Radio value={"不限"}>不限</Radio>*/}
                        {/*        <Radio value={"存续/在业"}>存续/在业</Radio>*/}
                        {/*    </Radio.Group>*/}
                        {/*</span>*/}

                        <Flex>
                            <Tag bordered={false} color="cyan" style={{fontSize:"14px"}}>控股比例</Tag>
                            <InputNumber value={ratioMin} size={"small"} max={100} min={0} suffix={"%"}
                                         onChange={(v)=>{
                                             ratioMinRef.current = v===null?0:v
                                             setRatioMin(ratioMinRef.current)
                                             treeInstance?.reset()
                                         }}
                            />-<InputNumber value={ratioMax} size={"small"} max={100} min={0} suffix={"%"}
                                            onChange={(v)=>{
                                                ratioMaxRef.current = v===null?100:v
                                                setRatioMax(ratioMaxRef.current)
                                                treeInstance?.reset()
                                            }}
                        />
                        </Flex>
                        <Button color="danger" variant="filled" size={"small"} onClick={()=>{setOpen(false)}}>返回</Button>
                    </Flex>
                    <Spin spinning={loading} style={{height:"100%"}} wrapperClassName={"wrapper"} >
                        <div ref={graphRef} style={{height:"100%", width: "100%"}}>
                            {/* 动态生成内容由 D3.js 完成 */}
                        </div>
                    </Spin>
                </Flex>
            </Drawer>
        </div>
    );
};

const TianYanCha=()=>{
    return <TabsV2 defaultTabContent={<TabContent/>} tabBarExtraContent={{
        left: <div style={{
            width: "auto",
            height: "23px",
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f1f3f4"
        }}><AuthSetting/></div>
    }}/>
}

export default TianYanCha;
