import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TreeLayout } from 'd3';
import { Pagination, Table } from 'antd';


interface TreeNode {
  name: string;
  children?: TreeNode[];
}

const data: TreeNode = {
  name: '上海安洵信息技术有限公司11111111111111111111111111',
  children: [
    {
      name: 'c1',
      children: [
        { name: 'c1-1' },
        {
          name: 'c1-2',
          children: [
            { name: 'c1-2-1' },
            { name: 'c1-2-2' },
            { name: 'c1-2-3' },
          ]
        },
        {
          name: 'c1-3',
          children: [
            { name: 'c1-3-1' },
            { name: 'c1-3-2' }
          ]
        }]
    },
    { name: 'c2' },
    { name: 'c3', children: [{ name: 'c3-1' }] },
    { name: 'c4', children: [{ name: 'c4-1' }] },
  ],
};

const defaultTranslate = {
  x: 600,
  y: 50,
  scale: 0.7 // 定义初始缩放比例
}
const defaultRectSize = {
  w: 100,
  h: 50
}
// const Zoomeye: React.FC = () => {
//   const svgRef = useRef<SVGSVGElement | null>(null);
//   const inited = useRef<boolean>(false)
//   const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null);
//   const svgGorup = useRef<d3.Selection<SVGGElement, any, HTMLElement, any>>()
//   const svg = useRef<d3.Selection<SVGSVGElement, TreeNode, null, undefined>>()
//   const zoom = d3.zoom()// 缩放行为
//     .scaleExtent([0.1, 2]) // 设置缩放的范围
//     .on('zoom', (event) => {
//       if (svgGorup.current) {
//         svgGorup.current.attr('transform', event.transform); // 应用缩放变换
//       }
//     });
//   useEffect(() => {
//     if (svgRef.current) {
//       svg.current = d3.select<SVGSVGElement, TreeNode>(svgRef.current);


//       //主图
//       svgGorup.current = svg.current
//         .append('g')

//       // 将缩放行为应用到 SVG 元素
//       svg.current.call(zoom);

//       // 处理鼠标滚轮事件
//       svg.current.on('wheel', (event) => {
//         const scaleChange = event.deltaY > 0 ? 1.1 : 0.9; // 根据滚轮方向确定缩放比例的变化
//         const mousePos = d3.pointer(event, svg.current.node()); // 获取鼠标在 SVG 中的坐标

//         // 计算缩放变换
//         const transform = d3.zoomTransform(svg.current.node());
//         const newTransform = d3.zoomIdentity
//           .translate(mousePos[0], mousePos[1])
//           .scale(scaleChange)
//           .translate(-mousePos[0], -mousePos[1])
//           .scale(transform.k * scaleChange);
//         setZoomTransform(newTransform)
//         // 应用缩放变换
//         svg.current.transition().duration(250)
//           .call(zoom.transform, newTransform);
//       });

//       svg.current.call(zoom.translateTo, -defaultTranslate.x, -defaultTranslate.y);

//       // 设置初始缩放比例
//       svg.current.call(zoom.scaleTo, defaultTranslate.scale);

//       {
//         // 定义箭头
//         svg.current.append('defs').append('marker')
//           .attr('id', 'arrowhead')
//           .attr('refX', 45) // 箭头终点距离路径的距离
//           .attr('refY', 3)
//           .attr('markerWidth', 10)
//           .attr('markerHeight', 10)
//           .attr('orient', 'auto')
//           .append('path')
//           .attr('d', 'M 0,0 V 6 L9,3 Z'); // 箭头的路径


//         const root = d3.hierarchy(data);
//         const treeLayout = d3.tree<TreeNode>()
//           .nodeSize([120, 120]) // 调整这里的数值以改变水平和垂直间距;
//           .separation(() => 1)
//         const treeData = treeLayout(root);
//         // 连线
//         const links = svgGorup.current
//           .selectAll('.link')
//           .data(treeData.links())
//           .enter()
//           .append('g'); // 添加一个 <g> 元素，用于容纳连线和文字  

//         // 添加连接线
//         links.append('path')
//           .attr('class', 'link')
//           .attr('fill', 'none')
//           .attr('stroke', '#ccc')
//           .attr('marker-end', 'url(#arrowhead)') // 引用箭头
//           .attr('d', (d) => {
//             const sourceX = d.source.x;
//             const sourceY = d.source.y;
//             const targetX = d.target.x;
//             const targetY = d.target.y;
//             const midY = (sourceY + targetY) / 2;
//             return `M${sourceX},${sourceY} L${sourceX},${midY} L${targetX},${midY} L${targetX},${targetY}`;
//           })
//           .attr("transform", function (d) { return "translate(" + 0 + "," + 0 + ")"; });

//         // 添加百分比
//         links.append('text')
//           .attr('dy', '0.31em')
//           .attr('text-anchor', "start")
//           .attr('x', (d) => d.target.x + 5)
//           .attr('y', (d) => (d.source.y + d.target.y) / 2 + 20)
//           .text('10');

//         const nodes = svgGorup.current
//           .selectAll('.node')
//           .data(treeData.descendants())
//           .enter().append('g').attr('transform', (d) => `translate(${d.x},${d.y})`)

//         nodes.append('rect')
//           .attr('x', defaultRectSize.w / (-2))
//           .attr('y', defaultRectSize.h / (-2))
//           .attr('width', defaultRectSize.w)
//           .attr('height', defaultRectSize.h)
//           .style('fill', '#ffffff')
//           .style('stroke', '#ced4e0');

//         // 创建圆 加减
//         const circle = nodes.append('g')
//           .attr('class', 'circle')
//           .on('click', function (d) {
//             return
//           })
//         circle.append('circle')
//           .attr('r', 5)
//           .attr('cy', defaultRectSize.h / 2 + 5)
//           .attr('cx', 0)
//           .attr('fill', '#F9DDD9')
//           .attr('stroke', '#FCEDEB')
//           .style('stroke-width', 1)
//         circle.append('text')
//           .attr('y', defaultRectSize.h / 2 + 10)
//           .attr('text-anchor', 'middle')
//           .attr('class', 'fa')
//           .style('fill', '#DE4A3C')
//           .text(function (d) {
//             return "+"
//           })
//           .style('font-size', '16px')
//           .style('cursor', 'pointer');
//         const foreignObject = nodes.append('foreignObject')
//           .attr('x', defaultRectSize.w / (-2)) // 调整 x 位置
//           .attr('y', defaultRectSize.h / (-2)) // 调整 y 位置
//           .attr('width', defaultRectSize.w) // 调整宽度
//           .attr('height', defaultRectSize.h)
//           .style("display", "flex")
//           .style("flex-direction", "column")
//           .style("justify-content", "center")
//           .style("align-items", "center")
//           .append("xhtml:span")
//           .text((d) => d.data.name)
//           .style("word-wrap", "normal")
//           .style("word-break", "break-all")
//           // .style("text-overflow", "ellipsis")
//           // .style("overflow", "hidden")
//           // .style("white-space", "nowrap")
//           .style("display", "-webkit-box")
//           .style("-webkit-line-clamp", 2)
//           .style("-webkit-box-orient", "vertical")
//           // .style("overflow","hidden")
//           // .style('height', defaultRectSize.h+"px")
//           .style("text-align", "center")
//           // .style("display","flex")
//           // .style("display","flex")
//           .style("flex-direction", "row")
//           .style("justify-content", "center")
//           .style("align-items", "center")
//       }
//     }
//   }, []);

//   return (
//     <div style={{ height: "calc(100% - 40px)" }}>
//       <svg ref={svgRef} width={"100%"} height={"100%"} >
//       </svg>
//       <p>Zoom Scale: {zoomTransform ? zoomTransform.k : 'N/A'}</p>
//     </div>
//   );
// };

interface Node {
  parents: Node[]
  children: Node[]
  x0?: number
  y0?: number
}
// 过渡时间
const DURATION = 0
// 加减符号半径
const SYMBOLA_S_R = 9
// 公司
const COMPANY = '0'
// 人
const PERSON = '1'
const Zoomeye: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const inited = useRef<boolean>(false)
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null);
  const svgGorup = useRef<d3.Selection<SVGGElement, any, HTMLElement, any>>()
  const svg = useRef<d3.Selection<SVGSVGElement, TreeNode, null, undefined>>()
  const treeLayout = useRef<d3.TreeLayout<unknown>>()
  // const [tree, setTree] = useState<Node>()
  const [tree, setTree] = useState({
    'name': '大公司', 
    'id': '1',
    'children': [{
      'children': [], 
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
        {'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司1', 'id': '1-8-1', 'money': 200, 'scale': 20, 'type': '0'},
        {'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司2', 'id': '1-8-2',  'money': 200, 'scale': 20, 'type': '0'},
      ], 
      'money': 3000,
      'scale': 30,
      'name': '大公司铜仁分公司', 
      'id': '1-8', 
      'type': '0'
    }, {
      'children': [
        {'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司1', 'id': '1-9-1',  'money': 200, 'scale': 20, 'type': '0'},
        {'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司2', 'id': '1-9-2',  'money': 200, 'scale': 20, 'type': '0'},
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
          {'controlPerson': true, 'money': '3000', 'children': [], 'parentMoney': 3000, 'old': true, 'id': '1-01-1', 'name': '发展公司父级公司1', 'scale': 30, 'type': '0', 'oldUrlName': ''},
          {'controlPerson': true, 'money': '3000', 'children': [], 'parentMoney': 3000, 'old': true, 'id': '2-01-1', 'name': '发展公司父级公司2', 'scale': 70, 'type': '0', 'oldUrlName': ''},
        ], 
        'name': '发展公司', 
        'id': '01-1', 
        'scale': 90, 
        'type': '0', 
        'oldUrlName': ''
      }
    ]
  })
  const [rootUp, setRootUp] = useState<any>()
  const [rootDown, setRootDown] = useState<any>()
  const hasChildOpenNodeArr = useRef([])
  const diamonds = {
    w: 240,
    h: 94,
    intervalW: 280,
    intervalH: 180
  }
  const originDiamonds = {
    w: 240,
    h: 56,
  }
  const svgH = 500
  const svgW = 1600
  const zoom = d3.zoom()// 缩放行为
    .scaleExtent([0.1, 2]) // 设置缩放的范围
    .on('zoom', (event) => {
      if (svgGorup.current) {
        svgGorup.current.attr('transform', event.transform); // 应用缩放变换
      }
    });

  const init = () => {
    if (svgRef.current) {
      {
        svg.current = d3.select<SVGSVGElement, TreeNode>(svgRef.current);

        //主图
        svgGorup.current = svg.current
          .append('g')


        // 将缩放行为应用到 SVG 元素
        svg.current.call(zoom);

        // 处理鼠标滚轮事件
        svg.current.on('wheel', (event) => {
          const scaleChange = event.deltaY > 0 ? 1.1 : 0.9; // 根据滚轮方向确定缩放比例的变化
          const mousePos = d3.pointer(event, svg.current.node()); // 获取鼠标在 SVG 中的坐标

          // 计算缩放变换
          const transform = d3.zoomTransform(svg.current.node());
          const newTransform = d3.zoomIdentity
            .translate(mousePos[0], mousePos[1])
            .scale(scaleChange)
            .translate(-mousePos[0], -mousePos[1])
            .scale(transform.k * scaleChange);
          setZoomTransform(newTransform)
          // 应用缩放变换
          svg.current.transition().duration(250)
            .call(zoom.transform, newTransform);
        });

        svg.current.call(zoom.translateTo, -defaultTranslate.x, -defaultTranslate.y);

        // 设置初始缩放比例
        svg.current.call(zoom.scaleTo, defaultTranslate.scale);
      }

      treeLayout.current = d3.tree().separation(() => 1);
      let upTree = null
      let downTree = null
      Object.keys(tree).map(item => {
        if (item === 'parents') {
          upTree = JSON.parse(JSON.stringify(tree))
          upTree.children = (tree as any)[item]
          upTree.parents = null
        } else if (item === 'children') {
          downTree = JSON.parse(JSON.stringify(tree))
          downTree.children = (tree as any)[item]
          downTree.parents = null
        }
      })
      // hierarchy 返回新的结构 x0,y0初始化起点坐标
      const up = d3.hierarchy(upTree, d => d.children) as any;
      up.x0 = 0
      up.y0 = 0
      setRootUp(up)

      const down = d3.hierarchy(downTree, d => d.children) as any;
      down.x0 = 0
      down.y0 = 0
      setRootDown(down)
      // 上 和 下 结构
      const treeArr = [
        {
          data: up,
          type: 'up'
        },
        {
          data: down,
          type: 'down'
        }
      ]
      treeArr.map(item => {
        item.data?.children?.forEach(collapse);
        update(item.data, item.type)
      })
    }
  }
  const collapse = (source: any) => {
    if (!hasChildOpenNodeArr.current.includes(source.data.id) && source.children) {
      source._children = source.children;
      source.children = null;
    }
  }
  // 获取文字长度
  const getStringLength = (str: string) => {
    let realLength = 0, charCode = -1;
    const len = str.length
    for (let i = 0; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode < 65) {
        realLength += 1;
      } else if (charCode > 90 && charCode <= 128) {
        realLength += 1;
      } else if (charCode >= 65 && charCode <= 90) {
        realLength += 1.3;
      } else {
        realLength += 2;
      }
    }
    return realLength / 2;
  };

  // 点击事件
  const click = async (source: any, showType: any, nodes: any) => {
    // 不是起点才能点
    // if (source.depth) {
    // if(source.children){
    //   // 点击减号
    //   source._children = source.children;
    //   source.children = null;
    // }else {
    //   // 点击加号
    //   source.children = source._children;
    //   source._children = null;

    //   let gbox = document.getElementById('penetrateChart').childNodes[0].childNodes[0]
    //   let x = gbox.getAttribute('transform')
    //   const decompose = x.match(/translate\((\S+),(\S+)\)/);
    //   const scale = x.match(/scale\((\S+)\)/)

    //   if (Array.isArray(decompose) && Array.isArray(scale) && decompose[2] && scale[1]) {
    //     gbox.setAttribute(
    //       'transform',
    //       `translate(${parseFloat(decompose[1])},${parseFloat(+decompose[2]+ (showType === 'up'? 200:-200))}) scale(${parseFloat(scale[1])})`
    //     );
    //   }else{
    //     gbox.setAttribute(
    //       'transform',
    //       `translate(${parseFloat(decompose[1])},${parseFloat(+decompose[2]+(showType === 'up'? 200:-200))})`
    //     );
    //   }
    // }
    // }

    if (source.children) {
      // 点击减号
      source._children = source.children;
      source.children = null;
      hasChildOpenNodeArr.current = hasChildOpenNodeArr.current.filter(item => item !== source.data.id)
    } else {
      // 点击加号
      hasChildOpenNodeArr.current.push(source.data.id);
      if (!source._children) {
        const res: any[] = []
        if (showType === 'up') {
          // res = await getUpper(source.data.id, source.data.regCapi)
        } else {
          // res = await getBelow(source.data.id)
        }
        if (!res.length) {
          // message.warning('上游或下游企业信息为空！')
          return
        }
        res.forEach(item => {
          const newNode: any = d3.hierarchy(item)
          newNode.depth = source.depth + 1;
          newNode.height = source.height - 1;
          newNode.parent = source;
          if (!source.children) {
            source.children = [];
            source.data.children = [];
          }
          source.children.push(newNode);
          source.data.children.push(newNode.data);
        })
      } else {
        source.children = source._children;
        source._children = null;
      }
      // 点击后移动
      const gbox = document.getElementById('penetrateChart').childNodes[0].childNodes[0] as any
      const x = gbox.getAttribute('transform')
      const decompose = x.match(/translate\((\S+),(\S+)\)/);
      const scale = x.match(/scale\((\S+)\)/)

      const dy = showType === 'up' ? svgH / 2 + nodes[0].y + source.y + 10 : svgH / 2 + nodes[0].y - source.y - 10
      const dx = svgW / 2 + nodes[0].x - source.x

      if (Array.isArray(decompose) && Array.isArray(scale) && decompose[2] && scale[1]) {
        // gbox.setAttribute(
        //   'transform',
        //   `translate(${parseFloat(decompose[1])},${parseFloat(+decompose[2]+ (showType === 'up'? 200:-200))}) scale(${parseFloat(scale[1])})`
        // );
        svg.current.attr('transform', 'translate(' + dx + ',' + dy + ') scale(' + parseFloat(scale[1]) + ')');
      } else {
        // gbox.setAttribute(
        //   'transform',
        //   `translate(${parseFloat(decompose[1])},${parseFloat(+decompose[2]+(showType === 'up'? 200:-200))})`
        // );
        svg.current.attr('transform', 'translate(' + dx + ',' + dy + ')');
      }
    }

    update(source, showType)
  }

  // 连线
  const diagonal = (s: any, d: any, showtype: any) => {
    // if(s.x !== undefined && s.y !== undefined && d.x !== undefined && d.y !== undefined){
    //   let path
    //   if (showtype === 'up') {
    //     path = `M ${s.x} ${-s.y + 35}
    //   C${s.x} -${(s.y + d.y) * 0.45},
    //    ${s.x} -${(s.y + d.y) * 0.45},
    //     ${d.x} -${d.y}`;
    //   } else {
    //     path = `M ${s.x} ${s.y}
    //   C${s.x} ${(s.y + d.y) * 0.45},
    //    ${s.x} ${(s.y + d.y) * 0.45},
    //     ${d.x} ${d.y}`;
    //   }
    //   return path;
    // }

    // 折线
    let endMoveNum = 0;
    let moveDistance = 0;
    if (d) {
      if (showtype == 'down') {
        const downMoveNum = d.depth ? diamonds.h / 2 : originDiamonds.h / 2 - 10;
        // var downMoveNum =  30;
        const tmpNum = s.y + (d.y - s.y) / 2;
        endMoveNum = downMoveNum;
        moveDistance = tmpNum + endMoveNum;
      } else {
        const upMoveNum = d.depth ? 0 : -originDiamonds.h / 2 + 10;
        const tmpNum = d.y + (s.y - d.y) / 2;
        endMoveNum = upMoveNum;
        moveDistance = tmpNum + endMoveNum;
      }
    }
    if (showtype === 'up') {
      return (
        'M' +
        s.x +
        ',' +
        -s.y +
        'L' +
        s.x +
        ',' +
        -moveDistance +
        'L' +
        d.x +
        ',' +
        -moveDistance +
        'L' +
        d.x +
        ',' +
        -d.y
      );
    } else {
      return (
        'M' +
        s.x +
        ',' +
        s.y +
        'L' +
        s.x +
        ',' +
        moveDistance +
        'L' +
        d.x +
        ',' +
        moveDistance +
        'L' +
        d.x +
        ',' +
        d.y
      );
    }
  }

  /*
     *[update 函数描述], [click 函数描述]
     *  @param  {[Object]} source 第一次是初始源对象，后面是点击的对象
     *  @param  {[String]} showtype up表示向上 down表示向下
     *  @param  {[Object]} sourceTree 初始源对象
     */
  const update = (source: any, showtype: any) => {
    // const { layoutTree , rootUp , rootDown, diamonds, svg, originDiamonds,hasChildNodeArr } = state.current
    if (source.parents === null) {
      source.isOpen = !source.isOpen
    }
    let nodes: any[]
    if (showtype === 'up') {
      nodes = treeLayout.current(rootUp).descendants()
    } else {
      nodes = treeLayout.current(rootDown).descendants()
    }
    const links = nodes.slice(1);
    nodes.forEach(d => {
      d.y = d.depth * (d.depth == 1 ? 150 : diamonds.intervalH);
    });


    const node = svg.current.selectAll('g.node' + showtype)
      .data(nodes, (d: any) => d.data.id || '');
    const nodeEnter = node.enter().append('g')
      .attr('class', d => showtype === 'up' && !d.depth ? 'hide-node' : 'node' + showtype)
      .attr('transform', d => showtype === 'up' ? 'translate(' + d.x + ',' + -(d.y) + ')' : 'translate(' + d.x + ',' + d.y + ')')
      .attr('opacity', d => showtype === 'up' && !d.depth ? (rootDown.data.children.length ? 0 : 1) : 1); // 拥有下部分则隐藏初始块  d => showtype === 'up' && !d.depth ? (rootDown.data.children.length ? 0 : 1) : 1

    // 创建矩形
    nodeEnter.append('rect')
      .attr('type', d => d.data.id + '_' + d.depth)
      .attr('width', d => d.depth ? diamonds.w : getStringLength(d.data.name) * 22)
      .attr('height', d => d.depth ? (d.data.type === COMPANY ? diamonds.h : diamonds.h - 10) : originDiamonds.h)
      .attr('x', d => d.depth ? -diamonds.w / 2 : -getStringLength(d.data.name) * 22 / 2)
      .attr('y', d => d.depth ? showtype === 'up' ? -diamonds.h / 2 : 0 : -15)
      .attr('stroke', d => d.data.type === COMPANY || !d.depth ? '#DE4A3C' : '#7A9EFF')
      .attr('stroke-width', 1)
      .attr('rx', 10)
      .attr('ry', 10)
      .style('fill', d => {
        if (d.data.type === COMPANY || !d.depth) {
          return d.depth ? '#fff' : '#DE4A3C'
        } else if (d.data.type === PERSON) {
          return '#fff'
        }
      }
      );

    // 创建圆 加减
    const circle = nodeEnter.append('g')
      .attr('class', 'circle')
      .on('click', function (d) {
        click(d, showtype, nodes)
      });

    circle.append('circle')
      .attr('type', d => d.data.id + '_' + d.depth || '')
      .attr('r', (d) => d.depth ? (d.data.isHaveChildren ? SYMBOLA_S_R : 0) : 0)
      .attr('cy', d => d.depth ? showtype === 'up' ? -(SYMBOLA_S_R + diamonds.h / 2) : diamonds.h + SYMBOLA_S_R : 0)
      .attr('cx', 0)
      .attr('fill', '#F9DDD9')
      .attr('stroke', '#FCEDEB')
      .style('stroke-width', 1)

    circle.append('text')
      .attr('x', 0)
      .attr('dy', d => d.depth ? (showtype === 'up' ? -(SYMBOLA_S_R / 2 + diamonds.h / 2) : diamonds.h + SYMBOLA_S_R + 4) : 0)
      .attr('text-anchor', 'middle')
      .attr('class', 'fa')
      .style('fill', '#DE4A3C')
      .text(function (d) {
        if (d.depth) {
          if (d.children) {
            return '-';
          } else if (d._children || d.data.isHaveChildren) {
            return '+';
          } else {
            return '';
          }
        } else {
          return '';
        }
      })
      .style('font-size', '16px')
      .style('cursor', 'pointer');

    node.select('.fa')
      .text(function (d) {
        if (d.children) {
          return '-';
        } else if (d._children || d.data.isHaveChildren) {
          return '+';
        } else {
          return '';
        }
      })

    // 持股比例
    nodeEnter.append('g')
      .attr('transform', () => 'translate(0,0)')
      .append('text')
      .attr('x', 35)
      .attr('y', showtype === 'up' ? diamonds.h - 20 : -10)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.data.type === COMPANY ? '#DE4A3C' : '#7A9EFF')
      .attr('opacity', d => !d.depth ? 0 : 1)
      .text(d => d.data.scale)
      .style('font-size', '14px')
      .style('font-family', 'PingFangSC-Regular')
      .style('font-weight', '400');

    // 公司名称
    // y轴 否表源头的字体距离
    nodeEnter.append('text')
      .attr('x', 0)
      .attr('y', d => {
        // 如果是上半部分
        if (showtype === 'up') {
          // 如果是1层以上
          if (d.depth) {
            return -diamonds.h / 2
          } else {
            // 如果名字长度大于12个
            // if (getStringLength(d.data.name) > 12) {
            //   return -5
            // }
            return 0
          }
        } else {
          if (d.depth) {
            return 0
          } else {
            // if (getStringLength(d.data.name) > 12) {
            //   return -5
            // }
            return 0
          }
        }
      })
      .attr('dy', d => d.depth ? (d.data.name.length > 12 ? '1.5em' : '2em') : `${originDiamonds.h / 2 - 10}px`)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.depth ? '#DE4A3C' : '#fff')
      .text(d => d.depth ? (d.data.name.length > 12) ? d.data.name.substr(0, 12) : d.data.name : d.data.name)
      .style('font-size', d => d.depth ? '16px' : '20px')
      .style('font-family', 'PingFangSC-Medium')
      .style('font-weight', '500')
      .style('cursor', 'pointer')
    // .on('click', function (d) {
    //   if (d.data.id && d.depth) {
    //     if (isFullRef.current) {
    //       handleFullScreen()
    //     }
    //     // 点击操作
    //   }
    // });

    // 名称过长 第二段
    nodeEnter.append('text')
      .attr('x', 0)
      .attr('y', d => {
        // ? (d.depth ? -this.diamonds.h / 2 : 0) : 0
        if (showtype === 'up') {
          if (d.depth) {
            return -diamonds.h / 2
          }
          return 8
        } else {
          if (!d.depth) {
            return 8
          }
          return 0
        }
      })
      .attr('dy', d => d.depth ? '3em' : '.3em')
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.depth ? '#DE4A3C' : '#fff')
      .text(d => {
        // 索引从第22个开始截取有表示超出
        if (d.depth) {
          if (d.data.name.substr(22, 1)) {
            return d.data.name.substr(12, 10) + '...'
          }
          return d.data.name.substr(12, 10)
        } else {
          return null
        }
      })
      .style('font-size', '16px')
      .style('font-family', 'PingFangSC-Medium')
      .style('font-weight', '500');

    // 认缴金额
    nodeEnter.append('text')
      .attr('x', 0)
      .attr('y', showtype === 'up' ? -diamonds.h / 2 : 0)
      .attr('dy', d => d.data.name.substr(12, d.data.name.length).length ? '5.5em' : '4.5em')
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.depth ? '#465166' : '#fff')
      .text(d => d.data.money ? d.data.money.length > 20 ? `认缴金额：${d.data.money.substr(0, 20)}…` : `认缴金额：${d.data.money}万元` : '')
      .style('font-size', '14px')
      .style('font-family', 'PingFangSC-Regular')
      .style('font-weight', '400')
      .style('color', '#3D3D3D');

    /*
    * 绘制箭头
    * @param  {string} markerUnits [设置为strokeWidth箭头会随着线的粗细发生变化]
    * @param {string} viewBox 坐标系的区域
    * @param {number} markerWidth,markerHeight 标识的大小
    * @param {string} orient 绘制方向，可设定为：auto（自动确认方向）和 角度值
    * @param {number} stroke-width 箭头宽度
    * @param {string} d 箭头的路径
    * @param {string} fill 箭头颜色
    * @param {string} id resolved0表示公司 resolved1表示个人
    * 直接用一个marker达不到两种颜色都展示的效果
    */
    nodeEnter.append('marker')
      .attr('id', showtype + 'resolved0')
      .attr('markerUnits', 'strokeWidth')
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('viewBox', '0 -5 10 10')
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', '90')
      .attr('refX', () => showtype === 'up' ? '-50' : '10')
      .attr('stroke-width', 2)
      .attr('fill', '#DE4A3C')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#DE4A3C');

    nodeEnter.append('marker')
      .attr('id', showtype + 'resolved1')
      .attr('markerUnits', 'strokeWidth')
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('viewBox', '0 -5 10 10')
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', '90')
      .attr('refX', () => showtype === 'up' ? '-50' : '10')
      .attr('stroke-width', 2)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#7A9EFF');

    // 将节点转换到它们的新位置。
    const nodeUpdate = node
      // .transition()
      // .duration(DURATION)
      .attr('transform', d => showtype === 'up' ? 'translate(' + d.x + ',' + -(d.y) + ')' : 'translate(' + d.x + ',' + (d.y) + ')');

    // 将退出节点转换到父节点的新位置.
    const nodeExit = node.exit()
      // .transition()
      // .duration(DURATION)
      .attr('transform', () => showtype === 'up' ? 'translate(' + source.x + ',' + -(source.y) + ')' : 'translate(' + source.x + ',' + (parseInt(source.y)) + ')')
      .remove();

    nodeExit.select('rect')
      .attr('width', diamonds.w)
      .attr('height', diamonds.h)
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    // 修改线条
    const link = svg.current.selectAll('path.link' + showtype)
      .data(links, (d: any) => d.data.id);

    // 在父级前的位置画线。
    const linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'link' + showtype)
      .attr('marker-start', d => `url(#${showtype}resolved${d.data.type})`)// 根据箭头标记的id号标记箭头
      .attr('stroke', d => d.data.type === COMPANY ? '#DE4A3C' : '#7A9EFF')
      .style('fill-opacity', 1)
      .attr('fill', 'none')
      .attr('stroke-width', '1px')
      // .transition()
      // .duration(DURATION)
      .attr('d', () => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal(o, o, showtype)
      });

    const linkUpdate = linkEnter.merge(link as any);
    // 过渡更新位置.
    linkUpdate
      // .transition()
      // .duration(DURATION)
      .attr('d', d => diagonal(d, d.parent, showtype));

    // 将退出节点转换到父节点的新位置
    link.exit()
      // .transition()
      // .duration(DURATION)
      .attr('d', () => {
        const o = {
          x: source.x,
          y: source.y
        };
        return diagonal(o, o, showtype)
      }).remove();

    // 隐藏旧位置方面过渡.
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y
    });
  }

  useEffect(() => {
    if (tree.name) {
      init()
    }
  }, []);

  
  function handlePaginationChange(page: number, size: number): void {
    console.log(page,size)
    if(page!=currentPage){
      setCurrentPage(page)
    }
  }

  const [currentPage,setCurrentPage] = useState(1)
  return (
    // <div style={{ height: "calc(100% - 40px)" }}>
    //   <svg ref={svgRef} width={"100%"} height={"100%"} >
    //   </svg>
    //   <p>Zoom Scale: {zoomTransform ? zoomTransform.k : 'N/A'}</p>
    // </div>
    <Table
    // locale={{ emptyText: "暂无数据" }}
    // virtual
    showSorterTooltip={false}
    bordered
    onRow={(record) => {
        return {

        };
    }}
    size="small"
    pagination={false}
    sticky
    rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
    footer={() => <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pagination
            showSizeChanger
            pageSizeOptions={[50,100,150,200,500]}
            defaultPageSize={100}
            total={232}
            defaultCurrent={1}
            current={currentPage}
            showTotal={(total) => `${total} items`}
            size="small"
            onChange={(page, size) => handlePaginationChange(page, size)}
        />
    </div>}
/>
  );
};
export default Zoomeye;
