import React, {CSSProperties, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {Button, Drawer, Flex, Input, InputNumber, Modal, Spin, TableColumnsType, Tag, Tooltip} from "antd";
import TabsV2 from "@/component/TabsV2";
import {errorNotification} from '@/component/Notification';
import {appActions, RootState} from '@/store/store';
import {useDispatch, useSelector} from 'react-redux';
import {config, tianyancha} from '../../wailsjs/go/models';
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

interface BaseNodeType {
    nodeName: string
    nodeId: string | number
}

interface NodeType<T1, T2 = T1> extends BaseNodeType{
    children?: (T1 & BaseNodeType) []
    parents?: (T2 & BaseNodeType)[]
}

interface Options<T1, T2=T1> {
    width: any
    height: any
    nodeGapX: number
    nodeGapY: number
    nodeWidth: number
    nodeHeight: number
    rootNodeHeight: number
    addChildren?: (node: T1 | T2, direction: string) => Promise<((T1 | T2) & BaseNodeType)[] | undefined>
    showLoadBtn?: (node: T1 | T2) => boolean
    filterForShow?: (node: T1 | T2) => boolean
    linkText?: (node: T1 | T2) => string | number
    onNodeClick?: (node: T1 | T2) => void,
    nodeTopLeftText?: (node: T1 | T2)=>{
        text: string | number,
        color: string,
        backgroundColor: string,
    } | undefined,
    nodeTopRightText?: (node: T1 | T2) => {text:string | number, backgroundColor:string},
}

type PageDataType = WithIndex<tianyancha.SearchCompanyV4Item>

const pageSizeOptions = [50, 100, 150, 200, 500]

//https://juejin.cn/post/7359203560167178250
class StockTreeVertical<T1,T2=T1> {
    private ref: any;
    private clonedSvgBoxInfo: any;
    private svg: any;
    private gAll: any;
    private gLinks: any;
    private gNodes: any;
    private tree: any;
    private rootOfDown: any;
    private rootOfUp: any;
    private zoomHandler: any
    private opts: Options<T1, T2>
    private treeData: NodeType<T1, T2>
    constructor(ref: any, data:NodeType<T1, T2>, options: Options<T1,T2>) {
        this.opts = options
        this.ref = ref // 宿主元素选择器,是个ref对象
        this.treeData = data

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
            .zoom<SVGSVGElement, undefined>()
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
    }

    private drawBottom(source:any){
        const transition = this.svg.transition().duration(500).ease(d3.easeCubicOut)
        let nodesOfDown = this.rootOfDown.descendants().reverse()
        let linksOfDown = this.rootOfDown.links()

        /***  绘制子公司树  ***/

        const node1 = this.gNodes.selectAll('g.nodeOfDownItemGroup').data(nodesOfDown, (d: any) => {
            return `${d.depth}-${d.data.nodeId}`  // 注意提供唯一值
        })

        const node1Enter = node1
            .enter()
            .append('g')
            .attr('class', 'nodeOfDownItemGroup')
            .attr('transform', (d: any) => {
                return `translate(${source.x0},${source.y0})`
            })
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            // .style('opacity', 0)
            .style('cursor', 'pointer')
            .on('click', (e: any, d: any) => {
                if (this.opts.onNodeClick) {
                    this.opts.onNodeClick(d.data)
                }
            })

        // 外层的矩形框
        node1Enter
            .append('rect')
            .attr('width', (d: any) => {
                if (d.depth === 0) {
                    return (d.data.nodeName.length + 4) * 16
                }
                return this.opts.nodeWidth
            })
            .attr('height', (d: any) => {
                if (d.depth === 0) {
                    return this.opts.rootNodeHeight
                }
                return this.opts.nodeHeight
            })
            .attr('x', (d: any) => {
                if (d.depth === 0) {
                    return (-(d.data.nodeName.length + 4) * 16) / 2
                }
                return -this.opts.nodeWidth / 2
            })
            .attr('y', (d: any) => {
                if (d.depth === 0) {
                    return -this.opts.rootNodeHeight / 2
                }
                return -this.opts.nodeHeight / 2
            })
            .attr('stroke-width', 1)
            .attr('stroke', (d: any) => {
                if (d.depth === 0) {
                    return '#EBD1BB'  // 根节点边框颜色
                }
                return '#cfd4df' // 其他节点的边框颜色
            })
            .attr('rx', 8)  // 圆角
            .attr('fill', (d: any) => {
                if (d.depth === 0) {
                    return '#3982f7'  // 根节点背景颜色
                } else {
                    return "#ffffff"  // 其他节点的背景颜色
                }
            })
        // .attr('filter', 'url(#rect-shadow)')  // 应用阴影效果

        // 添加字体自适应的功能
        node1Enter
            .append('foreignObject')
            .attr('width', (d: any) => {
                if (d.depth === 0) {
                    return (d.data.nodeName.length + 4) * 16
                }
                return this.opts.nodeWidth
            })
            .attr('height', (d: any) => {
                if (d.depth === 0) {
                    return this.opts.rootNodeHeight
                }
                return this.opts.nodeHeight
            })
            .attr('x', (d: any) => {
                if (d.depth === 0) {
                    return (-(d.data.nodeName.length + 4) * 16) / 2
                }
                return -this.opts.nodeWidth / 2
            })
            .attr('y', (d: any) => {
                if (d.depth === 0) {
                    return -this.opts.rootNodeHeight / 2
                }
                return -this.opts.nodeHeight / 2
            })
            .append('xhtml:div')
            .style('display', 'flex')
            .style('width', '100%')
            .style('height', '100%')
            .style('justify-content', 'center')
            .style('align-items', 'center')
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
            .style('font-size', (d: any) => {
                if (d.depth === 0) {
                    return '16px'
                } else {
                    return '14px'
                }
            }) // 设置字体大小
            .style('color', (d: any) => {
                if (d.depth === 0) {
                    return '#ffffff'
                } else {
                    return 'none'
                }
            })
            .style('font-weight', (d: any) => {
                if (d.depth === 0) {
                    return 'bold'
                }
            })
            .attr('title', (d: any) => {
                return d.data.nodeName
            })
            .text((d: any) => {
                return d.data.nodeName
            })

        if (this.opts.nodeTopLeftText){
            const t = this.opts.nodeTopLeftText
            node1Enter
                .append('foreignObject')
                .attr('width', '50')
                .attr('height', '20')
                .attr('x', (d: any) => {
                    return - this.opts.nodeWidth / 2 - 0.5;
                })
                .attr('y', (d: any) => {
                    return -this.opts.nodeHeight / 2 - 10;
                })
                .append('xhtml:div')
                .attr('class', 'nodeTopLeftText')
                .style('display', 'flex')
                .style('width', '100%')
                .style('height', '100%')
                .style('justify-content', 'left')
                .style('align-items', 'center')
                .append('xhtml:div')
                .style('display', '-webkit-box')
                .style('-webkit-box-orient', 'vertical')
                .style('-webkit-line-clamp', 2)
                .style('-webkit-box-align', 'center')
                .style('text-overflow', 'ellipsis')
                .style('overflow', 'hidden')
                .style('text-align', 'center')
                .style('padding', '3px')
                .style('font-size', '12px')
                .style('line-height', '12px')
                .style('border-radius', '3px')
                .text(function (this: SVGGElement, d: any) {
                    if (d.depth === 0)return
                    const result = t(d.data);
                    if (!result) return
                    const element = d3.select(this);
                    element.style('color', result.color || '#eb4e3e');
                    element.style('background-color', result.backgroundColor || '#fff');
                    return result.text;
                })
        }

        // 有元素update更新和元素新增enter的时候
        node1
            .merge(node1Enter)
            .transition(transition)
            .attr('transform', (d: any) => {
                return `translate(${d.x},${d.y})`
            })
            .attr('fill-opacity', 1)
            .attr('stroke-opacity', 1)
            .style('opacity', 1)

        // 有元素消失时
        node1
            .exit()
            .transition(transition)
            .remove()
            .attr('transform', () => {
                return `translate(${source.x0},${source.y0})`
            })
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .style('opacity', 0)

        const link1 = this.gLinks
            .selectAll('path.linkOfDownItem')
            .data(linksOfDown, (d: any) => {
                return `${d.target.depth}-${d.target.data.nodeId}` // 注意提供唯一值
            });

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
            .transition(transition)
            .attr('d', (d: any) => this.drawLink("down", d)) // 更新路径到最终位置
            .style('opacity', 1); // 逐渐显现

        link1
            .exit()
            .transition(transition)
            .attr('d', (d: any) => {
                // 终止路径，模拟收缩回 source
                const o = { x: d.source.x, y: d.source.y };
                return this.drawLink("down", { source: o, target: o });
            })
            .style('opacity', 0)
            .remove();

        const t = this.opts?.linkText
        if(t){
            const linkLabels = this.gLinks
                .selectAll('text.linkLabel')
                .data(linksOfDown, (d: any) => {
                    return `${d.target.depth}-${d.target.data.nodeId}`
                });
            linkLabels
                .enter()
                .append('text')
                .attr('class', 'linkLabel')
                .attr('x', (d: any) => d.source.x) // 初始位置为父节点
                .attr('y', (d: any) => d.source.y) // 初始位置为父节点
                .text((d: any) => {
                    return t(d.target.data)
                })
                .style('fill', '#3982f7')
                .merge(linkLabels)
                // .transition()
                .attr('x', (d: any) => d.target.x + 10)
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
        }

        // 添加展开按钮
        const expandBtnG = node1Enter
            .append('g')
            .attr('class', 'expandBtn')
            .attr('transform', () => {
                return `translate(${0},${this.opts.nodeHeight / 2})`
            })
            .style('display', (d: any) => {
                // console.log("expandBtnG", d)
                // 如果是根节点，不显示
                if (d.depth === 0) {
                    return 'none'
                }
                // // 如果没有子节点，则不显示
                // if (!d._children) {
                //     return 'none'
                // }
                if (this.opts.showLoadBtn){
                    return !this.opts.showLoadBtn(d.data) && 'none'
                }
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
                    if (this.opts.addChildren) {
                        const t = (await this.opts.addChildren(d.data, "OUT"))
                        if (t === undefined) {
                            return
                        }
                        const tt = t
                            .filter((child) => {
                                if (this.opts.filterForShow) {
                                    return this.opts.filterForShow(child)
                                }
                                return true
                            })
                            .map((child) => {
                                const childNode = d3.hierarchy(child);
                                return {
                                    ...childNode,
                                    depth: d.depth + 1,
                                    parent: d,
                                };
                            })
                        if (!tt || tt.length === 0) {
                            d3.select(d3.select(e.target).node().parentNode).style("display", "none");
                            d.children = null;
                        }else {
                            d.children = tt;
                        }
                    }
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
            .text((d: any) => {
                return d.children ? '-' : '+'
            })
    }

    private drawTop(source: any){
        const transition = this.svg.transition().duration(500).ease(d3.easeCubicOut)
        let nodesOfUp = this.rootOfUp.descendants().reverse()
        let linksOfUp = this.rootOfUp.links()

        /***  绘制股东树  ***/

        nodesOfUp.forEach((node: any) => {
            node.y = -node.y
        })

        const node2 = this.gNodes.selectAll('g.nodeOfUpItemGroup').data(nodesOfUp, (d: any) => {
            return `${d.depth}-${d.data.nodeId}`
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
            .style('display', (d: any) => {
                if (d.depth === 0) return 'none'
            })
            .on('click', (e: any, d: any) => {
                if (this.opts.onNodeClick) {
                    this.opts.onNodeClick(d.data)
                }
            })

        // 外层的矩形框
        node2Enter
            .append('rect')
            .attr('width', (d: any) => {
                if (d.depth === 0) {
                    return (d.data.nodeName.length + 4) * 16
                }
                return this.opts.nodeWidth
            })
            .attr('height', (d: any) => {
                if (d.depth === 0) {
                    return this.opts.rootNodeHeight
                }
                return this.opts.nodeHeight
            })
            .attr('x', (d: any) => {
                if (d.depth === 0) {
                    return (-(d.data.nodeName.length + 4) * 16) / 2
                }
                return -this.opts.nodeWidth / 2
            })
            .attr('y', (d: any) => {
                if (d.depth === 0) {
                    return -this.opts.rootNodeHeight / 2
                }
                return -this.opts.nodeHeight / 2
            })
            .attr('stroke-width', 1)
            .attr('stroke', (d: any) => {
                if (d.depth === 0) {
                    return '#EBD1BB'  // 根节点边框颜色
                }
                return '#cfd4df' // 其他节点的边框颜色
            })
            .attr('rx', 8)
            .attr('fill', (d: any) => {
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
            .attr('width', (d: any) => {
                if (d.depth === 0) {
                    return (d.data.nodeName.length + 4) * 16
                }
                return this.opts.nodeWidth
            })
            .attr('height', (d: any) => {
                if (d.depth === 0) {
                    return this.opts.rootNodeHeight
                }
                return this.opts.nodeHeight
            })
            .attr('x', (d: any) => {
                if (d.depth === 0) {
                    return (-(d.data.nodeName.length + 4) * 16) / 2
                }
                return -this.opts.nodeWidth / 2
            })
            .attr('y', (d: any) => {
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
            .style('font-size', (d: any) => {
                if (d.depth === 0) {
                    return '16px'
                } else {
                    return '14px'
                }
            }) // 设置字体大小
            .style('color', (d: any) => {
                if (d.depth === 0) {
                    return '#ffffff'
                } else {
                    return 'none'
                }
            })
            .style('font-weight', (d: any) => {
                if (d.depth === 0) {
                    return 'bold'
                }
            })
            .attr('title', (d: any) => {
                return d.data.nodeName
            })
            .text((d: any) => {
                return d.data.nodeName
            })

        // 有元素update更新和元素新增enter的时候
        node2
            .merge(node2Enter)
            .transition(transition)
            .attr('transform', (d: any) => {
                return `translate(${d.x},${d.y})`
            })
            .attr('fill-opacity', 1)
            .attr('stroke-opacity', 1)
            .style('opacity', 1)

        // 有元素消失时
        node2
            .exit()
            .transition(transition)
            .remove()
            .attr('transform', () => {
                return `translate(${source.x0},${source.y0})`
            })
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .style('opacity', 0)

        const link2 = this.gLinks
            .selectAll('path.linkOfUpItem')
            .data(linksOfUp, (d: any) => {
                return `${d.target.depth}-${d.target.data.nodeId}` // 注意提供唯一值
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
            .transition(transition)
            .attr('d', (d: any) => this.drawLink("up", d)) // 更新路径到最终位置
            .style('opacity', 1); // 逐渐显现

        link2
            .exit()
            .transition(transition)
            .attr('d', (d: any) => {
                // 终止路径，模拟收缩回 source
                const o = { x: d.source.x, y: d.source.y };
                return this.drawLink("up", { source: o, target: o });
            })
            .style('opacity', 0)
            .remove();

        const t = this.opts.linkText
        if(t){
            const linkLabels2 = this.gLinks
                .selectAll('text.linkLabel2')
                .data(linksOfUp, (d: any) => {
                    return `${d.target.depth}-${d.target.data.nodeId}`
                });
            linkLabels2
                .enter()
                .append('text')
                .attr('class', 'linkLabel2')
                .attr('x', (d: any) => d.source.x) // 初始位置为父节点
                .attr('y', (d: any) => d.source.y) // 初始位置为父节点
                .attr('dy', 10) // 默认字体大小14px，修正基线误差
                .text((d: any) => {
                    return t(d.target.data)
                }) // 设置标签内容
                .style('fill', '#3982f7')
                .merge(linkLabels2) // 更新文字标签
                .transition(transition)
                .attr('x', (d: any) => d.target.x + 10) // 更新位置
                .attr('y', (d: any) => d.target.y + this.opts.nodeHeight / 2 + 10)
                .style('opacity', 1); // 逐渐显现
            linkLabels2
                .exit()
                .transition(transition)
                .attr('x', (d: any) => d.source.x)
                .attr('y', (d: any) => d.source.y)
                .style('opacity', 0)
                .remove();
        }

        // 添加展开按钮
        const expandBtnG2 = node2Enter
            .append('g')
            .attr('class', 'expandBtn')
            .attr('transform', () => {
                return `translate(${0},-${this.opts.nodeHeight / 2})`
            })
            .style('display', (d: any) => {
                // 如果是根节点，不显示
                if (d.depth === 0) {
                    return 'none'
                }
                // // 如果没有子节点，则不显示
                // if (!d._children) {
                //     return 'none'
                // }
                if (this.opts.showLoadBtn){
                    return !this.opts.showLoadBtn(d.data) && 'none'
                }
            })
            .on('click', async (e: any, d: any) => {
                // https://www.cnblogs.com/shihuc/p/6064448.html
                e.stopPropagation()
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else if (d._children) {
                    d.children = d._children;
                    d._children = null;
                } else {
                    if (this.opts.addChildren) {
                        const t = (await this.opts.addChildren(d.data, "IN"))
                        if (t === undefined) {
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
            .text((d: any) => {
                return d.children ? '-' : '+'
            })

    }


    private process() {
        // 投资公司树的根节点
        const t = { ...this.treeData }
        t.children = t.children?.filter(child => {
            if (this.opts.filterForShow) {
                return this.opts.filterForShow(child)
            }
            return true
        })
        this.rootOfDown = d3.hierarchy<NodeType<T1, T2>>(t, (d) => {
            return d.children
        })

        // 股东树的根节点
        this.rootOfUp = d3.hierarchy<NodeType<T1, T2>>(this.treeData, (d) => d.parents)
        console.log(this.rootOfDown, this.rootOfUp);
        [this.rootOfDown.descendants(), this.rootOfUp.descendants()].forEach((nodes) => {
            nodes.forEach((node: any) => {
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

    reset() {
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
    private update(source: any) {
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

        this.tree(this.rootOfDown)
        this.tree(this.rootOfUp)

        this.drawBottom(source)
        this.drawTop(source)

        // node数据改变的时候更改一下加减号
        const expandButtonsSelection = d3.selectAll('g.expandBtn')

        expandButtonsSelection
            .select('text')
            .transition()
            .text((d: any) => {
                return d.children ? '-' : '+'
            })

        this.rootOfDown.eachBefore((d: any) => {
            d.x0 = d.x
            d.y0 = d.y
        })
        this.rootOfUp.eachBefore((d: any) => {
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
            // .call(
            //     this.zoomHandler.scaleTo, // 设置缩放比例
            //     0.8
            // )
            .call(() => {
                this.zoomHandler.translateTo(this.svg, source.x, source.y); // 移动到指定坐标
            });
    }

    // 直角连接线 by wushengyuan
    private drawLink(direction: any, { source, target }: { source: any, target: any }) {
        if (direction === "up") {
            const bottom = target.y + this.opts.nodeHeight / 2
            return `M${source.x},${source.y} 
                L${source.x},
                ${bottom + 40} ${target.x},
                ${bottom + 40} ${target.x},
                ${bottom}`
        } else if (direction === "down") {
            const top = target.y - this.opts.nodeHeight / 2
            return `M${source.x},${source.y} 
                    L${source.x},
                    ${top - 40} ${target.x},
                    ${top - 40} ${target.x},
                    ${top}`
        }
    }

    clear() {
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

let childrenItems: ChildType[] = [
    {
        id: "BG00001",
        name: "京海控股集团有限公司",
        percent: 1,
        hasInvestor: false
    },
    {
        id: "BG00008",
        name: "中国邮政集团有限公司四川省宜宾市分公司啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊",
        percent: 1,
        hasInvestor: true
    },
    {
        id: "BG00048",
        name: "京海企业投资有限公司",
        percent: 0.01,
        hasInvestor: false
    },
]

let parentsItems: ParentType[] = [
    {
        id: "BG00001",
        name: "京海控股集团有限公司",
        percent: 1,
        hasHolder: false
    },
    {
        id: "JH00001",
        name: "高启强",
        percent: 0.1,
        hasHolder: true
    },
    {
        id: "JH00002",
        name: "高启盛",
        percent: 0.1,
    },
]

const LabelCssProps: CSSProperties = {
    textAlign: "left", paddingRight: "5px", minWidth: "70px", width: "70px", height: "24px"
}

const AuthSetting: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config || new config.Config())
    const [key, setKey] = useState("")

    useEffect(() => {
        setKey(cfg.TianYanCha.Token)
    }, [cfg.TianYanCha])

    const save = () => {
        SetAuth(key).then(
            () => {
                const t = { ...cfg, TianYanCha: { ...cfg.TianYanCha, Token: key } } as config.Config;
                dispatch(appActions.setConfig(t))
                setOpen(false)
                setEditable(false)
            }
        ).catch(
            err => {
                errorNotification("错误", err)
                setKey(cfg.TianYanCha.Token)
            }
        )
    }

    const cancel = () => {
        setEditable(false);
        setOpen(false)
        setKey(cfg.TianYanCha.Token)
    }

    return <>
        <Tooltip title="设置" placement={"right"}>
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
        >
            <Flex vertical gap={10}>
                <Input.Password value={key} placeholder="token" onChange={
                    e => {
                        if (!editable) return
                        setKey(e.target.value)
                    }
                } />
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

const SharedOptions: CascaderProps<any> = {
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


const TabContent: React.FC = () => {
    const [treeInstance, setTreeInstance] = useState<StockTreeVertical<PenetrationItem,PenetrationItem>>();
    const graphRef = useRef<HTMLDivElement | null>(null); // 用于绑定 SVG 容器
    const filterRef = useRef<HTMLDivElement | null>(null);
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[1])
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const [open, setOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [currentCompany, setCurrentCompany] = React.useState<{ name: string, id: string }>({ id: "", name: "" });
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerHeight, setContainerHeight] = useState(0)
    const [, setTableHeight] = useState(0)
    const [ratioMin, setRatioMin] = useState(0)
    const [ratioMax, setRatioMax] = useState(100)
    const ratioMinRef = useRef(ratioMin)
    const ratioMaxRef = useRef(ratioMax)

    useEffect(() => {
        if (filterRef.current) {
            setTableHeight(window.innerHeight - filterRef.current?.getBoundingClientRect().height - 153)
            window.addEventListener("resize", () => {
                if (filterRef.current) {
                    setTableHeight(window.innerHeight - filterRef.current?.getBoundingClientRect().height - 153)
                }
            })
            setContainerHeight(window.innerHeight - 90)
            window.addEventListener("resize", () => {
                if (filterRef.current) {
                    setContainerHeight(window.innerHeight - 90)
                }
            })
        }
    }, []);


    const query = async (name: string, id: string) => {
        treeInstance?.clear()
        setCurrentCompany({ name: name, id: id })
        setOpen(true)
        setLoading(true)
        try {
            const t: PenetrationItem[] = await GetInvestee(id)
            const tt: PenetrationItem[] = await GetHolder(id)
            setTreeInstance(new StockTreeVertical<PenetrationItem, PenetrationItem>(
                graphRef.current,
                {
                    nodeId: id,
                    nodeName: name,
                    children:t.map(item=>({...item, nodeId: item.id, nodeName: item.name} as (PenetrationItem & BaseNodeType))),
                    parents:tt.map(item=>({...item, nodeId: item.id, nodeName: item.name} as (PenetrationItem & BaseNodeType))),
                },
                {
                    width: "100%",
                    height: "100%",
                    nodeGapX: 220,
                    nodeGapY: 180,
                    nodeHeight: 100,
                    nodeWidth: 200,
                    rootNodeHeight: 45,
                    addChildren: add,
                    showLoadBtn:(data)=>{
                        return data.hasInvestor || data.hasHolder
                    },
                    filterForShow: filterForShow,
                    linkText:(data)=>{
                        return (data.ratio * 100).toString()+"%"
                    },
                    onNodeClick: (node) => {
                        if('nodeName' in node ) {
                            copy(node["nodeName"])
                            return
                        }
                        copy(node.name)
                    },
                    nodeTopLeftText:(node)=>{
                        if (node.statusTag.name === "注销"){
                            return {text: node.statusTag.name, backgroundColor:"#fcf1ef", color: "#eb4e3e"}
                        }
                    }
                }
            ))
        } catch (e) {
            errorNotification("错误", e)
        } finally {
            setLoading(false)
        }
    }

    const add = async (item: PenetrationItem, direction: string) => {
        try {
            setLoading(true)
            if (direction === "IN") {
                return (await GetHolder(item.id)).map(item=>({...item, nodeId: item.id, nodeName: item.name} as (PenetrationItem & BaseNodeType)))
            } else if (direction === "OUT") {
                return (await GetInvestee(item.id)).map(item=>({...item, nodeId: item.id, nodeName: item.name} as (PenetrationItem & BaseNodeType)))
            }

        } catch (e) {
            errorNotification("错误", e)
        } finally {
            setLoading(false)
        }
    }

    const getRegStatus = () => {
        const t: CheckboxOptionType[] = []
        TYC.regStatus.items.forEach(item => {
            item.childList.forEach(i => {
                t.push({ label: i.name, value: i.value })
            })
        })
        return t
    }

    const handlePaginationChange = (page: number, pageSize: number) => {

    }

    const filterForShow = (item: PenetrationItem) => {
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
                        <Candidate<tianyancha.SuggestItem>
                            style={{ width: 400 }}
                            size={"small"}
                            backFillDataOnSelectItem={false}
                            items={[
                                {
                                    fetchOnOpen: (items) => { return items.length === 0 },
                                    onSelectItem: (item) => {
                                        query(item.label as string, item.data.graphId.toString())
                                    },
                                    title: '相关企业',
                                    filter: (v) => { return !!(v && v.toString().length > 1) },
                                    fetch: async (v) => {
                                        try {
                                            const response = await Suggest(v.toString()); // 等待Suggest函数执行完成获取原始数据
                                            return response.map(item => {
                                                const t: ItemType<tianyancha.SuggestItem> = {
                                                    value: item.name,
                                                    label: item.name,
                                                    data: item
                                                }
                                                return t;
                                            });
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
            >
                <Flex vertical style={{ height: "100%", position: 'relative' }}>
                    <Flex gap={20} style={{ zIndex: 10, position: "absolute", backgroundColor: "#ffffff", right: "0" }}>
                        <Tag bordered={false} color="#108ee9" style={{ fontSize: "14px", fontWeight: "bold" }}>{currentCompany.name}</Tag>
                        <Flex>
                            <Tag bordered={false} color="cyan" style={{ fontSize: "14px" }}>控股比例</Tag>
                            <InputNumber value={ratioMin} size={"small"} max={100} min={0} suffix={"%"}
                                onChange={(v) => {
                                    ratioMinRef.current = v === null ? 0 : v
                                    setRatioMin(ratioMinRef.current)
                                    treeInstance?.reset()
                                }}
                            />-<InputNumber value={ratioMax} size={"small"} max={100} min={0} suffix={"%"}
                                onChange={(v) => {
                                    ratioMaxRef.current = v === null ? 100 : v
                                    setRatioMax(ratioMaxRef.current)
                                    treeInstance?.reset()
                                }}
                            />
                        </Flex>
                        <Button color="danger" variant="filled" size={"small"} onClick={() => { setOpen(false) }}>返回</Button>
                    </Flex>
                    <Spin spinning={loading} style={{ height: "100%" }} wrapperClassName={"wrapper"} >
                        <div ref={graphRef} style={{ height: "100%", width: "100%" }}>
                            {/* 动态生成内容由 D3.js 完成 */}
                        </div>
                    </Spin>
                </Flex>
            </Drawer>
        </div>
    );
};

const TianYanCha = () => {
    return <TabsV2 defaultTabContent={<TabContent />} tabBarExtraContent={{
        left: <div style={{
            width: "auto",
            height: "23px",
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f1f3f4"
        }}><AuthSetting /></div>
    }} />
}

export default TianYanCha;
