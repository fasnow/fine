
//https://juejin.cn/post/7359203560167178250
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {errorNotification} from "@/component/Notification";
import {Button} from "antd";

interface TreeProps {
    data: any;
    direction?: 'row' | 'column';
}

type Options = {
    nodeGapX:number; // 节点横距
    nodeGapY:number; // 节点纵距
    nodeWidth:number; // 节点宽度
    nodeHeight:number; // 节点高度
    rootNodeHeight:number; // 根节点高度

}

export class StockTreeVerticalV2 {
    private rootData:any
    private opts:Options
    private svg:any
    private zoomHandler:any
    private width:string // svg宽度
    private height:string // svg高度
    private tree:any
    private gAll:any // 包含所有节点和连线
    private gNodes:any // 节点合集
    private gLinks:any // 连线合集
    constructor(ref:any,rootData:any,width:string,height:string,o:Options) {
        this.width = width
        this.height = height
        this.rootData = rootData
        this.opts = o
        this.zoomHandler = d3
            .zoom<SVGSVGElement, any>()
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
        d3.select(ref).selectAll("*").remove();
        this.svg = d3.select(ref)
            .append("svg")
            .style("width",this.width) // 控制台可能报错但是支持动态宽高
            .style("height",this.height)
            .call(this.zoomHandler)
            .append("g")
            .attr("transform", "translate(" + 512 + "," + 50 + ")")
            .text("123")

        //this.svg.call(this.zoomHandler).on('dblclick.zoom', null) // 取消默认的双击放大事件
        this.zoomHandler.translateTo(this.svg, 0, 0)
        this.tree = d3.tree().nodeSize([this.opts.nodeWidth, this.opts.nodeHeight])
        this.gAll = this.svg.append('g').attr('id', 'all')
        // 连接线集合
        this.gLinks = this.gAll.append('g').attr('id', 'linkGroup')
        // 节点集合
        this.gNodes = this.gAll.append('g').attr('id', 'nodeGroup')
        //箭头(下半部分)
        {
            this.svg
                .append('marker')
                .attr('id', 'markerOfDown')
                .attr('markerUnits', 'userSpaceOnUse')
                .attr('viewBox', '0 -5 10 10') //坐标系的区域
                .attr('refX', 38) //箭头坐标
                .attr('refY', 0)
                .attr('markerWidth', 13) //标识的大小
                .attr('markerHeight', 13)
                .attr('orient', '90') //绘制方向，可设定为：auto（自动确认方向）和 角度值
                .attr('stroke-width', 2) //箭头宽度
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5') //箭头的路径
                .attr('fill', '#9DA8BA') //箭头颜色
        }

        //箭头(上半部分)
        {
            this.svg
                .append('marker')
                .attr('id', 'markerOfUp')
                .attr('markerUnits', 'userSpaceOnUse')
                .attr('viewBox', '0 -5 10 10') //坐标系的区域
                .attr('refX', -32) //箭头坐标
                .attr('refY', 0)
                .attr('markerWidth', 13) //标识的大小
                .attr('markerHeight', 13)
                .attr('orient', '90') //绘制方向，可设定为：auto（自动确认方向）和 角度值
                .attr('stroke-width', 2) //箭头宽度
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5') //箭头的路径
                .attr('fill', '#9DA8BA') //箭头颜色
        }


    }

    update(source:any){
        const nodes = d3.hierarchy(this.rootData, (d:any) => d.children).descendants().reverse()
        const links = this.tree.links(nodes);
    }

}



