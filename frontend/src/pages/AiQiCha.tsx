import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import * as d3 from 'd3';
import {
    Button,
    Checkbox,
    Drawer,
    Flex,
    GetProp,
    Input,
    InputNumber,
    Modal,
    Pagination,
    Spin,
    Tabs,
    Tag,
    Tooltip
} from "antd";
import TabsV2 from "@/component/TabsV2";
import {errorNotification} from '@/component/Notification';
import {appActions, RootState} from '@/store/store';
import {useDispatch, useSelector} from 'react-redux';
import {aiqicha, config} from '../../wailsjs/go/models';
import {buttonProps} from './Setting';
import {UserOutlined} from "@ant-design/icons";
import {TYC} from "@/pages/Constants";
import {CheckboxOptionType} from "antd/es/checkbox/Group";
import type {CascaderProps} from 'antd/es/cascader'
import Candidate, {ItemType} from "@/component/Candidate";
import './AiQiCha.css'
import {
    ExportInvestRecordByDepth,
    GetBranchList,
    GetCopyrightList,
    GetICPList,
    GetInvestRecord,
    GetShareholder,
    GetStockChart,
    SetAuth,
    Suggest
} from "../../wailsjs/go/aiqicha/Bridge";
import {AgGridReact} from "ag-grid-react";
import {AGGridCommonOptions} from "@/pages/Props";
import {WithIndex} from "@/component/Interface";
import {ColDef} from "ag-grid-community";
import Label from "@/component/Label";
import Number from "@/component/Number";
import {copy} from "@/util/util";
import {MessageContext} from "@/App";
import InvestRecord = aiqicha.InvestRecord;
import Shareholder = aiqicha.Shareholder;

interface Options<T1, T2 = T1> {
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
    nodeTopLeftText?: (node: T1 | T2) => {
        text: string | number,
        color: string,
        backgroundColor: string,
    } | undefined,
    nodeTopRightText?: (node: T1 | T2) => { text: string | number, backgroundColor: string },
}

type BaseNodeType = {
    nodeName: string
    nodeId: string | number
    // current?:T1 | T2
}

type NodeType<T1, T2 = T1> = BaseNodeType & {
    children?: (T1 & BaseNodeType) []
    parents?: (T2 & BaseNodeType)[]
}

//https://juejin.cn/post/7359203560167178250
class StockTreeVertical<T1, T2 = T1> {
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

    constructor(ref: any, data: NodeType<T1, T2>, options: Options<T1, T2>) {
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

    private drawBottom(source: any) {
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

        if (this.opts.nodeTopLeftText) {
            const t = this.opts.nodeTopLeftText
            node1Enter
                .append('foreignObject')
                .attr('width', '50')
                .attr('height', '20')
                .attr('x', (d: any) => {
                    return -this.opts.nodeWidth / 2 - 0.5;
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
                    if (d.depth === 0) return
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
                const o = {x: source.x0, y: source.y0};
                return this.drawLink("down", {source: o, target: o});
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
                const o = {x: d.source.x, y: d.source.y};
                return this.drawLink("down", {source: o, target: o});
            })
            .style('opacity', 0)
            .remove();

        const t = this.opts?.linkText
        if (t) {
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
                if (this.opts.showLoadBtn) {
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
                            d.children = null
                        } else {
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

    private drawTop(source: any) {
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
                const o = {x: source.x0, y: source.y0};
                return this.drawLink("up", {source: o, target: o});
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
                const o = {x: d.source.x, y: d.source.y};
                return this.drawLink("up", {source: o, target: o});
            })
            .style('opacity', 0)
            .remove();

        const t = this.opts.linkText
        if (t) {
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
                if (this.opts.showLoadBtn) {
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
        const t = {...this.treeData}
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
        console.log(this.tree, this.rootOfDown)
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
            .call(
                this.zoomHandler.scaleTo, // 设置缩放比例
                0.8
            )
            .call(() => {
                this.zoomHandler.translateTo(this.svg, source.x, source.y); // 移动到指定坐标
            });
    }

    // 直角连接线 by wushengyuan
    private drawLink(direction: any, {source, target}: { source: any, target: any }) {
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

const AuthSetting: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const [editable, setEditable] = useState(false)
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config)
    const [key, setKey] = useState("")

    useEffect(() => {
        setKey(cfg.AiQiCha.Cookie)
    }, [cfg.AiQiCha])


    const save = () => {
        SetAuth(key).then(
            () => {
                const t = {...cfg, AiQiCha: {...cfg.AiQiCha, Cookie: key}} as config.Config;
                dispatch(appActions.setConfig(t))
                setOpen(false)
                setEditable(false)
            }
        ).catch(
            err => {
                errorNotification("错误", err)
                setKey(cfg.AiQiCha.Cookie)
            }
        )
    }

    const cancel = () => {
        setEditable(false);
        setOpen(false)
        setKey(cfg.AiQiCha.Cookie)
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
                    e => {
                        if (!editable) return
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

const SharedOptions: CascaderProps<any> = {
    allowClear: true,
    multiple: true,
    size: 'small',
    maxTagCount: 'responsive',
    maxTagPlaceholder: (omittedValues) => (
        <Tooltip
            overlayStyle={{pointerEvents: 'none'}}
            title={omittedValues.map(({label}) => label).join('\n')}
        >
            {omittedValues.length}
        </Tooltip>
    ),
    expandTrigger: 'hover',
};

const TabContent: React.FC = () => {
    const [treeInstance, setTreeInstance] = useState<StockTreeVertical<aiqicha.InvestRecord, aiqicha.Shareholder>>();
    const graphRef = useRef<HTMLDivElement | null>(null); // 用于绑定 SVG 容器
    const filterRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [currentCompany, setCurrentCompany] = React.useState<{ name: string, id: string }>({id: "", name: ""});
    const [name, setName] = useState("")
    const [pid, setPid] = useState("")
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [ratioMin, setRatioMin] = useState(0)
    const [ratioMax, setRatioMax] = useState(100)
    const ratioMinRef = useRef(ratioMin)
    const ratioMaxRef = useRef(ratioMax)
    const history = useSelector((state: RootState) => state.app.global.history || new History())

    const query = async (name: string, id: string) => {
        treeInstance?.clear()
        setCurrentCompany({name: name, id: id})
        setName(name)
        setPid(id)
        setOpen(true)
        setLoading(true)
        try {
            const t: aiqicha.Penetration = await GetStockChart(id)
            setTreeInstance(new StockTreeVertical<InvestRecord, Shareholder>(
                graphRef.current,
                {
                    nodeName: name,
                    nodeId: id,
                    children: t.investRecords.map(item => ({...item, nodeId: item.pid, nodeName: item.entName})),
                    parents: t.shareholders.map(item => ({...item, nodeId: item.pid, nodeName: item.name})),
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
                    filterForShow: filterForShow,
                    onNodeClick: (data) => {
                        if ('name' in data) {
                            setPid(data.pid)
                            setName(data.name)
                            copy(data.name)
                            return
                        }
                        if ('entName' in data) {
                            setPid(data.pid)
                            setName(data.entName)
                            copy(data.entName)
                            return
                        }
                        if ('nodeName' in data) {
                            setPid(data["nodeId"])
                            setName(data["nodeName"])
                            copy(data["nodeName"])
                            return
                        }
                    },
                    showLoadBtn: (item) => {
                        if ('investment' in item) {
                            return item.investment
                        }
                        return item.shareholder
                    },
                    linkText: (data) => {
                        if ('regRate' in data) {
                            return data.regRate
                        }
                        return data.subRate
                    }
                }
            ))
        } catch (e) {
            errorNotification("错误", e)
        } finally {
            setLoading(false)
        }
    }

    const add = async (item: aiqicha.Shareholder | aiqicha.InvestRecord, direction: string) => {
        try {
            setLoading(true)
            if (direction === "IN") {
                return (await GetShareholder(item.pid)).map(item => ({...item, nodeId: item.pid, nodeName: item.name}))
            } else if (direction === "OUT") {
                return (await GetInvestRecord(item.pid)).map(item => ({
                    ...item,
                    nodeId: item.pid,
                    nodeName: item.entName
                }))
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
                t.push({label: i.name, value: i.value})
            })
        })
        return t
    }

    const handlePaginationChange = (page: number, pageSize: number) => {

    }

    const filterForShow = (item: aiqicha.Shareholder | aiqicha.InvestRecord) => {
        if ('regRate' in item) {
            if (item.regRate === '-') return true // 注销状态
            const t = parseFloat(item.regRate.replace('%', ''));
            return t >= ratioMinRef.current && t <= ratioMaxRef.current;
        }
        return true
    }

    return (
        <div ref={containerRef} style={{
            overflow: 'hidden',
            height: '100%'
        }}
        >
            <div ref={filterRef}>
                <Flex vertical gap={10}>
                    <Flex justify={'center'}>
                        <Candidate<aiqicha.SuggestItem>
                            style={{width: 400}}
                            size={"small"}
                            backFillDataOnSelectItem={false}
                            items={[
                                {
                                    fetchOnOpen: (items) => {
                                        return items.length === 0
                                    },
                                    onSelectItem: (item) => {
                                        query(item.data.name, item.data.pid)
                                    },
                                    title: '相关企业',
                                    filter: (v) => {
                                        return !!(v && v.toString().length >= 4)
                                    },
                                    fetch: async (v) => {
                                        try {
                                            const response = await Suggest(v.toString());
                                            console.log(response)
                                            return response.map(item => {
                                                const t: ItemType<aiqicha.SuggestItem> = {
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
                            ]
                            }

                        >
                        </Candidate>
                        {/*</Flex>*/}
                        {/*<Flex gap={10}>*/}
                        {/*    <span style={LabelCssProps}>{TYC.scopeType.nodeName}</span>*/}
                        {/*    <Checkbox.Group*/}
                        {/*        options={TYC.scopeType.items.map(item=>{return {label: item.nodeName, value: item.value}})}*/}
                        {/*    />*/}
                        {/*</Flex>*/}
                        {/*<Flex gap={10} wrap>*/}
                        {/*    <Flex gap={10}>*/}
                        {/*        <span style={LabelCssProps}>{TYC.industryCode.nodeName}</span>*/}
                        {/*        <Cascader*/}
                        {/*            {...SharedOptions}*/}
                        {/*            style={{width:"140px"}}*/}
                        {/*            options={TYC.industryCode.items}/>*/}
                        {/*    </Flex>*/}
                        {/*    <Flex gap={10}>*/}
                        {/*        <span style={LabelCssProps}>{TYC.areaCode.nodeName}</span>*/}
                        {/*        <Cascader*/}
                        {/*            {...SharedOptions}*/}
                        {/*            style={{width:"140px"}}*/}
                        {/*            options={TYC.areaCode.items}*/}
                        {/*        />*/}
                        {/*    </Flex>*/}
                        {/*    <Flex gap={10}>*/}
                        {/*        <BadgeWrapper info={TYC.companyScale.right.toUpperCase()}>*/}
                        {/*            <span style={LabelCssProps}>{TYC.companyScale.nodeName}</span>*/}
                        {/*        </BadgeWrapper>*/}
                        {/*        <Cascader*/}
                        {/*            {...SharedOptions}*/}
                        {/*            style={{width:"140px"}}*/}
                        {/*            options={TYC.companyScale.items.map(item=>{return {label: item.nodeName, value: item.value}})}/>*/}
                        {/*    </Flex>*/}
                        {/*    <Flex gap={10}>*/}
                        {/*        <BadgeWrapper info={TYC.tycScore.right.toUpperCase()}>*/}
                        {/*            <span style={LabelCssProps}>{TYC.tycScore.nodeName}</span>*/}
                        {/*        </BadgeWrapper>*/}
                        {/*        <Cascader*/}
                        {/*            {...SharedOptions}*/}
                        {/*            style={{width:"140px"}}*/}
                        {/*            options={TYC.tycScore.items.map(item=>{return {label: item.nodeName, value: item.value}})}/>*/}
                        {/*    </Flex>*/}
                        {/*    <Flex gap={10}>*/}
                        {/*        <BadgeWrapper info={TYC.scienceTechnologyGrade.right.toUpperCase()}>*/}
                        {/*            <span style={LabelCssProps}>{TYC.scienceTechnologyGrade.nodeName}</span>*/}
                        {/*        </BadgeWrapper>*/}
                        {/*        <Cascader*/}
                        {/*            {...SharedOptions}*/}
                        {/*            style={{width:"140px"}}*/}
                        {/*            options={TYC.scienceTechnologyGrade.items.map(item=>{return {label: item.nodeName, value: item.value}})}/>*/}
                        {/*    </Flex>*/}
                        {/*</Flex>*/}
                        {/*<Flex>*/}
                        {/*    <Flex gap={10}>*/}
                        {/*        <span style={LabelCssProps}>{TYC.paidCapital.nodeName}</span>*/}
                        {/*        <Checkbox.Group*/}
                        {/*            options={TYC.paidCapital.items.map(item=>{return {label: item.nodeName, value: item.value}})}*/}
                        {/*        />*/}
                        {/*    </Flex>*/}
                        {/*</Flex>*/}
                        {/*<Flex vertical>*/}
                        {/*    <Flex gap={10}>*/}
                        {/*        <BadgeWrapper info={"VIP"}>*/}
                        {/*            <span style={{...LabelCssProps}}>{TYC.regStatus.nodeName}</span>*/}
                        {/*        </BadgeWrapper>*/}
                        {/*        <Checkbox.Group*/}
                        {/*            defaultValue={["存续/在业", "迁入", "迁出"]}*/}
                        {/*            options={getRegStatus()}*/}
                        {/*        />*/}
                        {/*    </Flex>*/}
                        {/*</Flex>*/}
                        {/*<Flex vertical>*/}
                        {/*    <Flex gap={10}>*/}
                        {/*        <span style={LabelCssProps}>{TYC.branchType.nodeName}</span>*/}
                        {/*        <Checkbox.Group*/}
                        {/*            options={TYC.branchType.items.map(item=>{return {label: item.nodeName, value: item.value}})}*/}
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
                // drawerRender={(dom)=>{
                //     return <div style={{height:"100%"}}>{dom}</div>
                // }}
            >
                <Flex vertical style={{height: "100%", position: 'relative'}}>
                    <Flex gap={20} style={{zIndex: 10, position: "absolute", backgroundColor: "#ffffff", left: "0"}}>
                        <Tag bordered={false} color="#108ee9"
                             style={{fontSize: "14px", fontWeight: "bold"}}>{currentCompany.name}</Tag>
                        {/*<span>*/}
                        {/*    <Tag bordered={false} color="cyan" style={{fontSize:"14px"}}>经营状态</Tag>*/}
                        {/*    <Radio.Group size={"small"} onChange={e=>{}} defaultValue={"存续/在业"}>*/}
                        {/*        <Radio value={"不限"}>不限</Radio>*/}
                        {/*        <Radio value={"存续/在业"}>存续/在业</Radio>*/}
                        {/*    </Radio.Group>*/}
                        {/*</span>*/}
                        <Flex>
                            <Tag bordered={false} color="cyan" style={{fontSize: "14px"}}>控股比例</Tag>
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
                        <Button color="danger" variant="filled" size={"small"} onClick={() => {
                            setOpen(false)
                        }}>返回</Button>
                    </Flex>
                    <Spin spinning={loading} style={{height: "100%"}} wrapperClassName={"wrapper"}>
                        <div ref={graphRef} style={{height: "100%", width: "100%"}}>
                            {/* 动态生成内容由 D3.js 完成 */}
                        </div>
                    </Spin>
                    <DataTab pid={pid} name={name}/>
                </Flex>
            </Drawer>
        </div>
    );
};

interface Info {
    name?: string | undefined
    pid?: string | undefined
    icpTotal?: number
    copyrightTotal?: number
    branchTotal?: number
}

interface FooterProps {
    total: number
    pageSizeOptions: number[]
    defaultPageSize: number
    currentPage: number
    onPaginationChange: (pageNum: number, pageSize: number) => void
    info: Info
}

const Footer: React.FC<FooterProps> = (props) => {
    const messageApi = useContext(MessageContext);
    const [open, setOpen] = useState(false)
    const [depth, setDepth] = useState(1)
    const [ratioMin, setRatioMin] = useState(0.5)
    const [ratioMax, setRatioMax] = useState(1)
    const [dataType, setDataType] = useState<any[]>(["icp"])

    const handlePaginationChange = (pageNum: number, pageSize: number) => {
        if (props.onPaginationChange) {
            props.onPaginationChange(pageNum, pageSize)
        }
    }

    const onOK = () => {
        setOpen(false)
        ExportInvestRecordByDepth(props.info.pid || "", depth, ratioMin, ratioMax, dataType)
            .then(
                r=> {
                    messageApi?.success(`请至下载列表查看进度`)
                }
            )
            .catch(
                err => errorNotification("错误", err)
            )

    }

    const onCancel = () => {
        setOpen(false)
    }

    const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (checkedValues) => {
        setDataType(checkedValues)
    };


    return <div>
        <Flex justify={"right"} align={'center'} gap={20} style={{padding: '5px', boxSizing: "border-box"}}>
            <Pagination
                showQuickJumper
                showSizeChanger
                total={props.total}
                pageSizeOptions={props.pageSizeOptions}
                defaultPageSize={props.defaultPageSize}
                // defaultCurrent={props.currentPage}
                current={props.currentPage}
                showTotal={(total) => `${total} items`}
                size="small"
                onChange={(page, size) => handlePaginationChange(page, size)}
            />
            <Button size={"small"} type={"primary"} onClick={() => setOpen(true)}>导出控股树</Button>
        </Flex>
        <Modal
            destroyOnClose
            style={{top: "20%"}}
            maskClosable={false}
            mask={false}
            open={open}
            onCancel={onCancel}
            onOk={onOK}
            okButtonProps={{size: 'small'}}
            cancelButtonProps={{size: 'small'}}
            title={"控股树导出"}
        >
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <Label labelWidth={80} label={"企业名称"} value={props.info.name}/>
                <Label labelWidth={80} label={"PID"} value={props.info.pid}/>
                <Label labelWidth={80} label={"导出内容"} value={
                    <Checkbox.Group value={dataType} onChange={onChange}>
                        <Checkbox value="icp">备案信息({props.info.icpTotal})</Checkbox>
                        <Checkbox value="copyright">软件著作({props.info.copyrightTotal})</Checkbox>
                        <Tooltip title={"分公司默认采取单线程、分页大小为1000策略获取,分公司过多将增加耗时"}
                                 placement={"bottom"}>
                            <Checkbox value="branch">分公司({props.info.branchTotal})</Checkbox>
                        </Tooltip>
                    </Checkbox.Group>
                }/>
                <Label labelWidth={80} label={"控股比例"} value={
                    <>
                        <InputNumber value={ratioMin} size={"small"} max={1} min={0}
                                     onChange={(v) => setRatioMin(v === null ? 0.5 : v)}
                        />-<InputNumber value={ratioMax} size={"small"} max={1} min={0}
                                        onChange={(v) => setRatioMax(v === null ? 1 : v)}/>
                    </>
                }/>
                <Label labelWidth={80} label={"导出层级"} value={
                    <Number tooltip={"小于0导出所有层级, 等于0导出当前节点, 大于0导出指定层级"}
                            tooltipPlacement={'bottom'} value={depth}
                            onChange={(value) => {
                                setDepth(value as number)
                                return true
                            }}/>
                }/>

            </div>
        </Modal>
    </div>
}

type PageDataTypeICP = WithIndex<aiqicha.ICP>

type PageDataTypeCopyright = WithIndex<aiqicha.Copyright>

type PageDataTypeBranch = WithIndex<aiqicha.Branch>

interface DataTabProps {
    pid: string
    name: string
}

const DataTab: React.FC<DataTabProps> = (props) => {
    const [icpCurrentPage, setIcpCurrentPage] = useState(1)
    const [copyrightCurrentPage, setCopyrightCurrentPage] = useState(1)
    const [branchCurrentPage, setBranchCurrentPage] = useState(1)
    const [icpTotal, setIcpTotal] = useState(0)
    const [copyrightTotal, setCopyrightTotal] = useState(0)
    const [branchTotal, setBranchTotal] = useState(0)
    const [icps, setICPs] = useState<PageDataTypeICP[]>([])
    const [copyrights, setCopyrights] = useState<PageDataTypeCopyright[]>([])
    const [branches, setbranches] = useState<PageDataTypeBranch[]>([])
    const [info, setInfo] = useState<Info>({})
    const [icpColDef] = useState<ColDef[]>([
        {headerName: '序号', field: "index", width: 80, pinned: 'left', tooltipField: 'index'},
        {headerName: "首页地址", field: "homeSite", tooltipField: 'homeSite'},
        {headerName: "网站名称", field: "siteName", tooltipField: 'siteName', width: 300},
        {headerName: "域名", field: "domain", tooltipField: 'domain', width: 300},
        {headerName: "备案号", field: "icpNo", tooltipField: 'icpNo'}
    ])
    const [copyrightColDef] = useState<ColDef[]>([
        {headerName: '序号', field: "index", width: 80, pinned: 'left', tooltipField: 'index'},
        {headerName: "软件名称", field: "softwareName", tooltipField: 'softwareName', width: 350},
        {headerName: "软件简称", field: "shortName", tooltipField: 'shortName'},
        {headerName: "版本号", field: "batchNum", tooltipField: 'batchNum', width: 100},
        {headerName: "软件著作分类", field: "softwareType", tooltipField: 'softwareType', width: 120},
        {headerName: "行业分类", field: "typeCode", tooltipField: 'typeCode', width: 120},
        {headerName: "登记号", field: "regNo", tooltipField: 'regNo', width: 180},
        {headerName: "登记日期", field: "regDate", tooltipField: 'regDate'},
        {headerName: "首次发表日期", field: "firstDate", tooltipField: 'firstDate'}
    ])
    const [branchColDef] = useState<ColDef[]>([
        {headerName: '序号', field: "index", width: 80, pinned: 'left', tooltipField: 'index'},
        {headerName: "企业名称", field: "entName", tooltipField: 'entName', width: 350},
        {headerName: "注册日期", field: "startDate", tooltipField: 'startDate', width: 120},
        {headerName: "注册资本", field: "regCapital", tooltipField: 'regCapital', width: 100},
        {headerName: "企业Logo", field: "logo", tooltipField: 'logo'},
        {headerName: "负责人", field: "legalPerson", tooltipField: 'legalPerson'},
        {headerName: "状态", field: "openStatus", tooltipField: 'openStatus'}
    ])

    useEffect(() => {
        setInfo({name: props.name, pid: props.pid})
        if (!props.pid)return
        GetICPList(props.pid, 1).then(
            r => {
                setInfo(prevState => ({...prevState, icpTotal: r.Total}))
                setIcpTotal(r.Total)
                setICPs(r.Data.map((value, index) => {
                    return {index: index + 1, ...value} as PageDataTypeICP
                }))
            }
        ).catch(e => errorNotification("错误", e))
        GetBranchList(props.pid, 1).then(
            r => {
                setInfo(prevState => ({...prevState, branchTotal: r.Total}))
                setBranchTotal(r.Total)
                setbranches(r.Data.map((value, index) => {
                    return {index: index + 1, ...value} as PageDataTypeBranch
                }))
            }
        ).catch(e => errorNotification("错误", e))
        GetCopyrightList(props.pid, 1).then(
            r => {
                setCopyrightTotal(r.Total)
                setInfo(prevState => ({...prevState, copyrightTotal: r.Total}))
                setCopyrights(r.Data.map((value, index) => {
                    return {index: index + 1, ...value} as PageDataTypeCopyright
                }))
            }
        ).catch(e => errorNotification("错误", e))

    }, [props.pid, props.name])

    const items = useMemo(() => {
        return [
            {
                key: "icp",
                label: `备案信息(${icpTotal})`,
                closable: false,
                children: <Flex vertical style={{height: '100%', padding: '5px', boxSizing: 'border-box'}}>
                    <AgGridReact
                        {...AGGridCommonOptions}
                        rowData={icps}
                        columnDefs={icpColDef}
                        loading={false}
                    />
                    <Footer info={info} currentPage={icpCurrentPage} total={icpTotal}
                            pageSizeOptions={[100]} defaultPageSize={100}
                            onPaginationChange={
                                (pageNum, pageSize) => {
                                    if (!props.pid) return
                                    GetICPList(props.pid, pageNum).then(
                                        r => {
                                            setInfo(prevState => ({...prevState, icpTotal: r.Total}))
                                            setIcpTotal(r.Total)
                                            setICPs(r.Data.map((value, index) => {
                                                return {index: (pageNum - 1) * pageSize + index + 1, ...value} as PageDataTypeICP
                                            }))
                                            setIcpCurrentPage(pageNum)
                                        }
                                    ).catch(e => errorNotification("错误", e))
                                }
                            }/>
                </Flex>
            },
            {
                key: "copyright",
                label: `软件著作(${copyrightTotal})`,
                closable: false,
                children: <Flex vertical
                                style={{height: '100%', padding: '5px', boxSizing: 'border-box'}}><AgGridReact
                    {...AGGridCommonOptions}
                    rowData={copyrights}
                    columnDefs={copyrightColDef}
                    loading={false}
                />
                    <Footer info={info} currentPage={copyrightCurrentPage} total={copyrightTotal}
                            pageSizeOptions={[10]}
                            defaultPageSize={10} onPaginationChange={
                        (pageNum, pageSize) => {
                            if (!props.pid) return

                            GetCopyrightList(props.pid, pageNum).then(
                                r => {
                                    setInfo(prevState => ({...prevState, copyrightTotal: r.Total}))
                                    setCopyrightTotal(r.Total)
                                    setCopyrights(r.Data.map((value, index) => {
                                        return {index: (pageNum - 1) * pageSize + index + 1, ...value} as PageDataTypeCopyright
                                    }))
                                    setCopyrightCurrentPage(pageNum)
                                }
                            ).catch(e => errorNotification("错误", e))
                        }
                    }/>
                </Flex>
            },
            {
                key: "branch",
                label: `分公司(${branchTotal})`,
                closable: false,
                children: <Flex vertical style={{height: '100%', padding: '5px', boxSizing: 'border-box'}}><AgGridReact
                    {...AGGridCommonOptions}
                    rowData={branches}
                    columnDefs={branchColDef}
                    loading={false}
                />
                    <Footer info={info} currentPage={branchCurrentPage} total={branchTotal}
                            pageSizeOptions={[100]}
                            defaultPageSize={100} onPaginationChange={
                        (pageNum, pageSize) => {
                            if (!props.pid) return
                            GetBranchList(props.pid, pageNum).then(
                                r => {
                                    setInfo(prevState => ({...prevState, branchTotal: r.Total}))
                                    setBranchTotal(r.Total)
                                    setbranches(r.Data.map((value, index) => {
                                        return {index: (pageNum - 1) * pageSize + index + 1, ...value} as PageDataTypeBranch
                                    }))
                                    setBranchCurrentPage(pageNum)
                                }
                            ).catch(e => errorNotification("错误", e))
                        }
                    }/>
                </Flex>
            },
        ]
    }, [icpTotal, branchTotal, copyrightTotal, icps, branches, copyrights])

    return <Tabs
        style={{height: '100%'}}
        tabBarExtraContent={{
            left: <Tag bordered={false} color="#108ee9"
                       style={{fontSize: "14px", fontWeight: "bold"}}>{info.name}</Tag>
        }}
        items={items}
    />
}

const AiQiCha = () => {
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

export default AiQiCha;
