
//https://juejin.cn/post/7359203560167178250
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {Button} from "antd";

interface TreeProps {
    data: any;
    direction?: 'row' | 'column';
}

interface Options {
    nodeGapX: number
    nodeGapY: number
    nodeWidth: number
    nodeHeight: number
    rootNodeHeight: number
}

class StockTreeVertical {
    private data: any;
    private ref: any;
    private nodeClickEvent: any;
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
    private width:any;
    private height:any;
    private zoomHandler:any
    private opts:Options
    constructor(ref:any,width:any,height:any,data:any,options:Options) {
        this.width = width
        this.height = height

        // 树的源数据
        this.data = data

        // 宿主元素选择器
        this.ref = ref

        // 节点点击事件
        this.nodeClickEvent =
            function (e:any, d:any) {
                alert(d.name)
            }
        this.onLoad =
            function () {
                console.log('--------加载完毕---------')
            }

        this.opts = options

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

        // 清空并重新绘制
        const container = d3.select(this.ref);
        container.selectAll('*').remove();
        const host = container.append("div")
            .attr("id", "svgBox")
            .style("width", this.width)
            .style("height", this.height);
        const domRect = (host.node() as HTMLElement)?.getBoundingClientRect()
        this.svg = host
            .append('svg')
            .attr('viewBox', () => {
                let parentsLength = this.data.parents ? this.data.parents.length : 0
                return [
                    -domRect.width / 2,
                    // 如果有父节点，则根节点居中，否则根节点上浮一段距离
                    parentsLength > 0 ? -domRect.width / 2 : -domRect.width / 3,
                    domRect.width,
                    domRect.height
                ]
            })
            .attr('width', this.width)
            .attr('height', this.height)
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

        // 设置好节点之间距离的tree方法
        this.tree = d3.tree().nodeSize([this.opts.nodeGapX, this.opts.nodeGapY])

        // 投资公司树的根节点
        this.rootOfDown = d3.hierarchy(this.data, (d:any) => d.children)

        // 股东树的根节点
        this.rootOfUp = d3.hierarchy(this.data, (d:any) => d.parents)
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
        this.update(null)

        this.onLoad()
        this.drawChart({
            type: 'fold'
        })
    }

    // 绘制svg图表
    drawChart(options:any) {


    }

    // 更新数据
    update(source:any) {
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

        // 通过calculateBorderLength方法，获取到用于生成的图片的div的宽度和高度
        const { borderWidth, downSectionHeight, upSectionHeight } = this.calculateBorderLength(
            nodesOfDown,
            nodesOfUp
        )
        this.clonedSvgBoxInfo.borderWidth = borderWidth
        this.clonedSvgBoxInfo.downSectionHeight = downSectionHeight
        this.clonedSvgBoxInfo.upSectionHeight = upSectionHeight
        const myTransition = this.svg.transition().duration(500).ease(d3.easeCubicOut);
        const that = this
        /***  绘制子公司树  ***/
        const node1 = this.gNodes.selectAll('g.nodeOfDownItemGroup').data(nodesOfDown, (d:any) => {
            return d.data.id
        })

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
            .text((d: any) => d.target.data.percent) // 设置标签内容
            .style('fill', '#3982f7')
            .merge(linkLabels) // 更新文字标签
            .transition(myTransition)
            .attr('x', (d: any) => d.target.x) // 更新位置
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

        const node1Enter = node1
            .enter()
            .append('g')
            .attr('class', 'nodeOfDownItemGroup')
            .attr('transform', (d:any) => {
                return `translate(${source.x0},${source.y0})`
            })
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .style('opacity', 0)
            .style('cursor', 'pointer')
            .on('click', (e:any, d:any) => {
                if(d.depth !== 0) {
                    this.nodeClickEvent(e, d)
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
            .attr('stroke-width', 1)  // 边框宽度为2
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
                return -15
            })
            .append('xhtml:div')
            .style('font-size', (d:any) => {
                // 设置字体大小
                if (d.depth === 0) {
                    return '17px'
                } else {
                    return '15px'
                }
            })
            .style('color', (d:any) => {
                if (d.depth === 0) {
                    return '#ffffff'
                } else {
                    return 'none'
                }
            })
            .style('line-height', (d:any) => {
                if (d.depth === 0) {
                    return `${this.opts.rootNodeHeight}px`
                } else {
                    return 2
                }
            })
            .style('text-align', (d:any) => {
                if (d.depth === 0) {
                    return 'center'
                }
            })
            .style('font-weight', (d:any) => {
                if (d.depth === 0) {
                    return 'bold'
                }
            })
            .style('display', 'flex')  // 使用 flex 布局
            .style('justify-content', 'center')  // 水平居中
            .style('padding', '0 5px 0 12px')
            .style('overflow', 'hidden')
            .style('white-space', 'nowrap')
            .style('text-overflow', 'ellipsis')
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
            })
            .on('click', (e:any, d:any) => {
                // https://www.cnblogs.com/shihuc/p/6064448.html
                e.stopPropagation()
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else if(d._children){
                    d.children = d._children;
                    d._children = null;
                } else {
                    const newChildrenData = [
                        {
                            id: 'BG000481',
                            name: '京海企业投资有限公司111',
                            percent: '72.72',
                            hasInvestor: false,
                            children: [],
                        },
                        {
                            id: 'BG000482',
                            name: '京海企业投资有限公司222',
                            percent: '1',
                            hasInvestor: false,
                            children: [],
                        },
                    ];
                    d.children = newChildrenData.map((child) => {
                            const a= d3.hierarchy(child)
                            return {
                                ...a,
                                depth: d.depth + 1,
                                parent:d,
                            }
                        }
                    )
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
            .text((d: any) => d.target.data.percent) // 设置标签内容
            .style('fill', '#3982f7')
            .merge(linkLabels2) // 更新文字标签
            .transition(myTransition)
            .attr('x', (d: any) => d.target.x) // 更新位置
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
                this.nodeClickEvent(e, d)
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
                return -15
            })
            .append('xhtml:div')
            .style('font-size', (d:any) => {
                // 设置字体大小
                if (d.depth === 0) {
                    return '17px'
                } else {
                    return '15px'
                }
            })
            .style('color', (d:any) => {
                if (d.depth === 0) {
                    return '#AD4903'
                } else {
                    return that.nodeColorList[2].textColor
                }
            })
            .style('line-height', (d:any) => {
                if (d.depth === 0) {
                    return `${this.opts.rootNodeHeight}px`
                } else {
                    return 2
                }
            })
            .style('text-align', (d:any) => {
                if (d.depth === 0) {
                    return 'center'
                }
            })
            .style('font-weight', (d:any) => {
                if (d.depth === 0) {
                    return 'bold'
                }
            })
            .style('display', 'flex')  // 使用 flex 布局
            .style('justify-content', 'center')  // 水平居中
            .style('padding', '0 5px 0 12px')
            .style('overflow', 'hidden')
            .style('white-space', 'nowrap')
            .style('text-overflow', 'ellipsis')
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
            .on('click', (e:any, d:any) => {
                e.stopPropagation()
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else if(d._children){
                    d.children = d._children;
                    d._children = null;
                } else {
                    const newChildrenData = [
                        {
                            id: 'BG0004812',
                            name: '京海企业投资有限公司333',
                            percent: '72.72',
                            hasHolder: false,
                            children: [],
                        },
                        {
                            id: 'BG0004822',
                            name: '京海企业投资有限公司444',
                            percent: '1',
                            hasHolder: false,
                            children: [],
                        },
                    ];
                    d.children = newChildrenData.map((child) => {
                            const a= d3.hierarchy(child)
                            return {
                                ...a,
                                depth: d.depth + 1,
                                parent:d,
                            }
                        }
                    )
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
        this.zoomHandler.translateTo(this.svg, source.x, source.y)
    }

    // 直角连接线 by wushengyuan
    drawLink(direction:any,{source, target}:{source:any,target:any}) {
        const halfDistance = (target.y - source.y) / 2
        const halfY = source.y + halfDistance
        if (direction === "up"){
            return `M${source.x},${source.y} 
                L${source.x},
                ${halfY} ${target.x},
                ${halfY} ${target.x},
                ${target.y + this.opts.nodeHeight/2}`
        }else if (direction === "down"){
            return `M${source.x},${source.y} 
                    L${source.x},
                    ${halfY} ${target.x},
                    ${halfY} ${target.x},
                    ${target.y - this.opts.nodeHeight/2}`
        }
    }

    // 展开所有的节点
    expandAllNodes() {
        this.drawChart({
            type: 'all'
        })
    }

    // 将所有节点都折叠
    foldAllNodes() {
        this.drawChart({
            type: 'fold'
        })
    }

    // 计算边界长度
    calculateBorderLength(nodesOfDown:any, nodesOfUp:any) {
        // 边界的宽
        let borderWidth = 0
        // 下半部分高度
        let downSectionHeight = 0
        // 上半部分高度
        let upSectionHeight = 0
        /** --------- **/
            // 【向下的树】最深的节点的Y值
        let deepestDownNodeY = nodesOfDown[0].y
        // 按照x坐标的值，进行升序排列，最左边的节点在第一位，最右边的节点在最后一位
        let sortedNodesOfDown = nodesOfDown.sort(function (a:any, b:any) {
            return a.x - b.x
        })
        // 计算出“基础”的高度
        let downTreeHeight_base = 0 + deepestDownNodeY
        // 计算出“基础”的宽度
        let downTreeWidth_base = sortedNodesOfDown.at(-1).x - sortedNodesOfDown.at(0).x

        // 【向下的树】最深的节点的Y值
        let deepestUpNodeY = nodesOfUp[0].y
        // 按照x坐标的值，进行升序排列，最左边的节点在第一位，最右边的节点在最后一位
        let sortedNodesOfUp = nodesOfUp.sort(function (a:any, b:any) {
            return a.x - b.x
        })
        // 计算出“基础”的高度
        let upTreeHeight_base = 0 + deepestUpNodeY
        // 计算出“基础”的宽度
        let upTreeWidth_base = sortedNodesOfUp.at(-1).x - sortedNodesOfUp.at(0).x

        // 边界的宽度肯定不能直接等于两边节点之间的距离，还得加上留白的地方
        borderWidth = Math.max(downTreeWidth_base, upTreeWidth_base) + 3 * this.opts.nodeWidth
        downSectionHeight = downTreeHeight_base + 2 * this.opts.nodeHeight
        upSectionHeight = upTreeHeight_base + 2 * this.opts.nodeHeight

        return {
            borderWidth,
            downSectionHeight,
            upSectionHeight
        }
    }
}



let childrenItems:{
    id: string,
    name: string,
    percent: string,
    hasInvestor:boolean
}[] = [
    {
        id: "BG00001",
        name: "京海控股集团有限公司",
        percent: "100.00",
        hasInvestor:false
    },
    {
        id: "BG00008",
        name: "京海控股集团(JVI)有限公司",
        percent: "100.00",
        hasInvestor:true
    },
    {
        id: "BG00048",
        name: "京海企业投资有限公司",
        percent: "72.72",
        hasInvestor:false
    },
]

let parentsItems:any[] = [
    {
        id: "BG00001",
        name: "京海控股集团有限公司",
        percent: "100",
        hasHolder:false
    },
    {
        id: "JH00001",
        name: "高启强",
        percent: "40.00",
        hasHolder:true
    },
    {
        id: "JH00002",
        name: "高启盛",
        percent: "30.00",
    },
    // {
    //     "xh": "4",
    //     "id": "JH00003",
    //     "parentsIdList": "JHZF00005,JHZF00006",
    //     "name": "京海文旅投资有限公司",
    //     "percent": "20.00",
    //     "nodeColor": "#99ff99",
    //     "childrenId": "BG00001"
    // },
    // {
    //     "xh": "5",
    //     "id": "JH00004",
    //     "parentsIdList": "JH00003",
    //     "name": "京海昌盛文化股份有限公司",
    //     "percent": "10.00",
    //     "nodeColor": "#99ff99",
    //     "childrenId": "BG00001"
    // },
    // {
    //     "xh": "6",
    //     "id": "JH00003",
    //     "parentsIdList": "JHZF00005,JHZF00006",
    //     "name": "京海文旅投资有限公司",
    //     "percent": "80.00",
    //     "nodeColor": "#99ff99",
    //     "childrenId": "JH00004"
    // },
    // {
    //     "xh": "7",
    //     "id": "JHZF00005",
    //     "parentsIdList": "",
    //     "name": "京海财政厅",
    //     "percent": "30.00",
    //     "nodeColor": "#ffde3a",
    //     "childrenId": "JH00003"
    // },
    // {
    //     "xh": "8",
    //     "id": "JHZF00006",
    //     "parentsIdList": "",
    //     "name": "京海国资委",
    //     "percent": "70.00",
    //     "nodeColor": "#ffde3a",
    //     "childrenId": "JH00003"
    // },
    // {
    //     "xh": "9",
    //     "id": "JHZF00005",
    //     "parentsIdList": "",
    //     "name": "京海财政厅",
    //     "percent": "30.00",
    //     "nodeColor": "#ffde3a",
    //     "childrenId": "JH00003"
    // },
    // {
    //     "xh": "10",
    //     "id": "JHZF00006",
    //     "parentsIdList": "",
    //     "name": "京海国资委",
    //     "percent": "70.00",
    //     "nodeColor": "#ffde3a",
    //     "childrenId": "JH00003"
    // }
]


const TianYanCha: React.FC = () => {
    // 根节点
    const [theRootNode,setTheRootNode] = useState(childrenItems[0])

    // 根节点的id
    const [theRootNodeID,setTheRootNodeID] = useState(theRootNode['id']);

    // 根节点的名称
    const [theRootNodeName,setTheRootNodeName] = useState(theRootNode['name']);

    const [treeInstance,setTreeInstance] = useState<StockTreeVertical>();
    const [processedData, setProcessedData] = useState<any>();
    const containerRef = useRef<HTMLDivElement | null>(null); // 用于绑定 SVG 容器
    useEffect(() => {
        // 清空并重新绘制
        const container = d3.select(containerRef.current);
        // container.selectAll('*').remove(); // 清空内容
        //
        // // 图表节点的方向,row或者column
        // let direction = "column"
        //
        // // const app = d3.select(`#app`);
        // const operationButtonGroup = container
        //     .append("div")
        //     .attr("id", "operationButtonGroup")
        //
        // // 添加svg的容器
        // container.append("div").attr("id", "svgBox")
        //     .style("width", "100vw") // 设置宽度
        //     .style("height", "100vh"); // 设置高度;

        processOriginData();
    }, []);
    // 将子级数据的中文键名改为英文键名
    function changeKeyOfChildren(data:any) {
        return data.map((item:any) => {
            return {
                id: item["id"],
                name: item["name"],
                percent: item["percent"],
                hasInvestor: item["hasInvestor"],
                children:[]
            }
        })
    }

    // 将父级数据的中文键名改为英文键名
    function changeKeyOfParents(data:any) {
        return data.map((item:any) => {
            return {
                id: item["id"],
                name: item["name"],
                percent: item["percent"],
                hasHolder: item["hasHolder"],
            }
        })
    }

    // 生成子节点树
    function generateChildrenTree(target:any, originData:any) {
        target.children = originData.filter((item:any)=>item.id!==target.id);
    }

    // 生成父节点树
    function generateParentsTree(target:any, originData:any) {
        target.parents = originData.filter((item:any)=>item.id!==target.id);
    }

    // 处理源数据
    function processOriginData() {
        // 转换键名
        const childrenData = changeKeyOfChildren(childrenItems);
        // 第一个就是根节点
        const rootNodeItem = childrenData[0];
        const t = {
            // 根节点ID
            id: rootNodeItem.id,
            // 根节点名称
            name: rootNodeItem.name,
            // 子节点列表
            children: [],
            // 父节点列表
            parents: [],
        }

        generateChildrenTree(rootNodeItem, childrenData);
        t.children = rootNodeItem.children;

        // getParentsNodesData(processedData.id).then(res => {
        // const parentsData = res.data;
        // const parentsData = res.data;
        if(parentsItems && parentsItems.length > 0){
            console.log("父节点数据：", parentsItems);
            const handlerParentsData = changeKeyOfParents(parentsItems);
            // 第一个就是根节点
            const parentsRootNodeItem = handlerParentsData[0];
            generateParentsTree(parentsRootNodeItem, handlerParentsData);
            t.parents = parentsRootNodeItem.parents;
        }
        console.log('加工完毕的数据:', t);
        setProcessedData(t)

        setTreeInstance(new StockTreeVertical(
            containerRef.current,
            "80vw",
            "80vh",
            t,
            {
                nodeGapX:300,
                nodeGapY:140,
                nodeHeight:60,
                nodeWidth:200,
                rootNodeHeight:45
            }
        ))
        // new StockTreeVerticalV2(containerRef.current,[],"calc(80vw)","calc(80vh)",{
        //     nodeGapX:200,
        //     nodeGapY:200,
        //     nodeWidth:200,
        //     nodeHeight:200,
        //     rootNodeHeight:200,
        // })
    }

    return (
        <div>
            <Button onClick={()=>{
                let data = [
                    {
                        "id": "BG00001",
                        "childrenIdList": "BG00008",
                        "name": "京海控股集团有限公司",
                        "percent": "100.00",
                        "hasInvestor":false
                    },
                    // {
                    //     "id": "BG00008",
                    //     "childrenIdList": "",
                    //     "name": "京海控股集团(JVI)有限公司",
                    //     "percent": "100.00",
                    //     "hasInvestor":true
                    // },
                    // {
                    //     "id": "BG00048",
                    //     "childrenIdList": "",
                    //     "name": "京海企业投资有限公司",
                    //     "percent": "72.72"
                    // },
                ]
                treeInstance?.update(null)
            }}>Update</Button>
            <div ref={containerRef} >
                {/* 动态生成内容由 D3.js 完成 */}
            </div>
        </div>

    );
};

export default TianYanCha;
