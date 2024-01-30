import React, { useEffect, useRef, useState } from 'react';
import { Col, Row, Slider, Spin, message } from 'antd';
import * as d3Chart from 'd3';

// 过渡时间
const DURATION = 0
// 加减符号半径
const SYMBOLA_S_R = 9
// 公司
const COMPANY = '0'
// 人
const PERSON = '1'

export default function RightPenetration(props) {
  let state = useRef({
    layoutTree: '',
    diamonds: '',
    d3: d3Chart,
    hasChildOpenNodeArr: [],
    originDiamonds: '',
    diagonalUp: '',
    diagonalDown: '',
    rootUp: '',
    rootDown: '',
    svg: '',
    svgH: 500,
    svgW: 1600,
  })

  const isFullRef = useRef()
  const [isFull, setIsFull] = useState(false)
  const [scaleN, setScaleN] = useState(0.5)
  const { treeData } = props
  const [tree, setTree] = useState(props.treeData)
  // const [tree, setTree] = useState({
  //   // 'name': '大公司', 
  //   // 'id': '1',
  //   // 'children': [{
  //   //   'children': [], 
  //   //   'money': 3000,
  //   //   'scale': 30,
  //   //   'name': '大公司黔西南分公司', 
  //   //   'id': '1-1',
  //   //   'type': '0'
  //   // }, {
  //   //   'children': [], 
  //   //   'money': 3000,
  //   //   'scale': 30,
  //   //   'name': '大公司六盘水分公司', 
  //   //   'id': '1-2',
  //   //   'type': '0'
  //   // }, {
  //   //   'children': [], 
  //   //   'money': 3000,
  //   //   'scale': 30,
  //   //   'name': '大公司贵阳分公司', 
  //   //   'id': '1-3',
  //   //   'type': '0'
  //   // }, {
  //   //   'children': [], 
  //   //   'money': 3000,
  //   //   'scale': 30,
  //   //   'name': '大公司安顺分公司', 
  //   //   'id': '1-4',
  //   //   'type': '0'
  //   // }, {
  //   //   'children': [], 
  //   //   'money': 3000,
  //   //   'scale': 30,
  //   //   'name': '大公司毕节分公司', 
  //   //   'id': '1-5',
  //   //   'type': '0'
  //   // }, {
  //   //   'children': [],
  //   //   'money': 3000,
  //   //   'scale': 30,
  //   //   'name': '大公司遵义分公司', 
  //   //   'id': '1-6',
  //   //   'type': '0'
  //   // }, {
  //   //   'children': [], 
  //   //   'money': 3000,
  //   //   'scale': 30,
  //   //   'name': '大公司黔东南分公司', 
  //   //   'id': '1-7',
  //   //   'type': '0'
  //   // }, {
  //   //   'children': [
  //   //     {'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司1', 'id': '1-8-1', 'money': 200, 'scale': 20, 'type': '0'},
  //   //     {'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司2', 'id': '1-8-2',  'money': 200, 'scale': 20, 'type': '0'},
  //   //   ], 
  //   //   'money': 3000,
  //   //   'scale': 30,
  //   //   'name': '大公司铜仁分公司', 
  //   //   'id': '1-8', 
  //   //   'type': '0'
  //   // }, {
  //   //   'children': [
  //   //     {'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司1', 'id': '1-9-1',  'money': 200, 'scale': 20, 'type': '0'},
  //   //     {'controlPerson': false, 'children': [], 'old': false, 'name': '大公司黔南分公司下属公司2', 'id': '1-9-2',  'money': 200, 'scale': 20, 'type': '0'},
  //   //   ], 
  //   //   'name': '大公司黔南分公司',
  //   //   'id': '1-9', 
  //   //   'money': 3000, 
  //   //   'scale': 30,
  //   //   'type': '0'
  //   //   }
  //   // ], 
  //   // 'parents': [
  //   //   {
  //   //     'controlPerson': true, 
  //   //     'money': '3000', 
  //   //     'children': [
  //   //       {'controlPerson': true, 'money': '3000', 'children': [], 'parentMoney': 3000, 'old': true, 'id': '1-01-1', 'name': '发展公司父级公司1', 'scale': 30, 'type': '0', 'oldUrlName': ''},
  //   //       {'controlPerson': true, 'money': '3000', 'children': [], 'parentMoney': 3000, 'old': true, 'id': '2-01-1', 'name': '发展公司父级公司2', 'scale': 70, 'type': '0', 'oldUrlName': ''},
  //   //     ], 
  //   //     'name': '发展公司', 
  //   //     'id': '01-1', 
  //   //     'scale': 90, 
  //   //     'type': '0', 
  //   //     'oldUrlName': ''
  //   //   }
  //   // ]
  // })
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    isFullRef.current = isFull
  }, [isFull])


  // 获取文字长度
  const getStringLength = (str) => {
    let realLength = 0, len = str.length, charCode = -1;
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
  // 连线
  const diagonal = (s, d, showtype) => {
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
    var endMoveNum = 0;
    var moveDistance = 0;
    if (d) {
      if (showtype == 'down') {
        var downMoveNum = d.depth ? state.current.diamonds.h / 2 : state.current.originDiamonds.h / 2 - 10;
        // var downMoveNum =  30;
        let tmpNum = s.y + (d.y - s.y) / 2;
        endMoveNum = downMoveNum;
        moveDistance = tmpNum + endMoveNum;
      } else {
        var upMoveNum = d.depth ? 0 : -state.current.originDiamonds.h / 2 + 10;
        let tmpNum = d.y + (s.y - d.y) / 2;
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

  // 拷贝到_children 隐藏1排以后的树
  const collapse = (source) => {
    if (!state.current.hasChildOpenNodeArr.includes(source.data.id) && source.children) {
      source._children = source.children;
      // source._children.forEach(collapse);
      source.children = null;
    }
  }

  // 获取下游信息
  const getBelow = async (id) => {
    setLoading(true)
  }

  // 获取上游信息
  const getUpper = async (id, regCapi) => {
    setLoading(true)
  }

  // 点击事件
  const click = async (source, showType, nodes) => {
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
      state.current.hasChildOpenNodeArr = state.current.hasChildOpenNodeArr.filter(item => item !== source.data.id)
    } else {
      // 点击加号
      state.current.hasChildOpenNodeArr.push(source.data.id);
      if (!source._children) {
        let res = []
        if (showType === 'up') {
          res = await getUpper(source.data.id, source.data.regCapi)
        } else {
          res = await getBelow(source.data.id)
        }
        if (!res.length) {
          message.warning('上游或下游企业信息为空！')
          return
        }
        res.forEach(item => {
          let newNode = state.current.d3.hierarchy(item)
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
      let gbox = document.getElementById('penetrateChart').childNodes[0].childNodes[0]
      let x = gbox.getAttribute('transform')
      const decompose = x.match(/translate\((\S+),(\S+)\)/);
      const scale = x.match(/scale\((\S+)\)/)

      let dy = showType === 'up' ? state.current.svgH / 2 + nodes[0].y + source.y + 10 : state.current.svgH / 2 + nodes[0].y - source.y - 10
      let dx = state.current.svgW / 2 + nodes[0].x - source.x

      if (Array.isArray(decompose) && Array.isArray(scale) && decompose[2] && scale[1]) {
        // gbox.setAttribute(
        //   'transform',
        //   `translate(${parseFloat(decompose[1])},${parseFloat(+decompose[2]+ (showType === 'up'? 200:-200))}) scale(${parseFloat(scale[1])})`
        // );
        state.current.svg.attr('transform', 'translate(' + dx + ',' + dy + ') scale(' + parseFloat(scale[1]) + ')');
      } else {
        // gbox.setAttribute(
        //   'transform',
        //   `translate(${parseFloat(decompose[1])},${parseFloat(+decompose[2]+(showType === 'up'? 200:-200))})`
        // );
        state.current.svg.attr('transform', 'translate(' + dx + ',' + dy + ')');
      }
    }

    update(source, showType)
  }

  /*
       *[update 函数描述], [click 函数描述]
       *  @param  {[Object]} source 第一次是初始源对象，后面是点击的对象
       *  @param  {[String]} showtype up表示向上 down表示向下
       *  @param  {[Object]} sourceTree 初始源对象
       */
  const update = (source, showtype) => {
    // const { layoutTree , rootUp , rootDown, diamonds, svg, originDiamonds,hasChildNodeArr } = state.current
    if (source.parents === null) {
      source.isOpen = !source.isOpen
    }
    let nodes
    if (showtype === 'up') {
      nodes = state.current.layoutTree(state.current.rootUp).descendants()
    } else {
      nodes = state.current.layoutTree(state.current.rootDown).descendants()
    }
    let links = nodes.slice(1);
    nodes.forEach(d => {
      d.y = d.depth * (d.depth == 1 ? 150 : state.current.diamonds.intervalH);
    });


    let node = state.current.svg.selectAll('g.node' + showtype)
      .data(nodes, d => d.data.id || '');
    let nodeEnter = node.enter().append('g')
      .attr('class', d => showtype === 'up' && !d.depth ? 'hide-node' : 'node' + showtype)
      .attr('transform', d => showtype === 'up' ? 'translate(' + d.x + ',' + -(d.y) + ')' : 'translate(' + d.x + ',' + d.y + ')')
      .attr('opacity', d => showtype === 'up' && !d.depth ? (state.current.rootDown.data.children.length ? 0 : 1) : 1); // 拥有下部分则隐藏初始块  d => showtype === 'up' && !d.depth ? (state.current.rootDown.data.children.length ? 0 : 1) : 1
    
      // 创建矩形
    nodeEnter.append('rect')
      .attr('type', d => d.data.id + '_' + d.depth)
      .attr('width', d => d.depth ? state.current.diamonds.w : getStringLength(d.data.name) * 22)
      .attr('height', d => d.depth ? (d.data.type === COMPANY ? state.current.diamonds.h : state.current.diamonds.h - 10) : state.current.originDiamonds.h)
      .attr('x', d => d.depth ? -state.current.diamonds.w / 2 : -getStringLength(d.data.name) * 22 / 2)
      .attr('y', d => d.depth ? showtype === 'up' ? -state.current.diamonds.h / 2 : 0 : -15)
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
    let circle = nodeEnter.append('g')
      .attr('class', 'circle')
      .on('click', function (d) {
        click(d, showtype, nodes)
      });

    circle.append('circle')
      .attr('type', d => d.data.id + '_' + d.depth || '')
      .attr('r', (d) => d.depth ? (d.data.isHaveChildren ? SYMBOLA_S_R : 0) : 0)
      .attr('cy', d => d.depth ? showtype === 'up' ? -(SYMBOLA_S_R + state.current.diamonds.h / 2) : state.current.diamonds.h + SYMBOLA_S_R : 0)
      .attr('cx', 0)
      .attr('fill', '#F9DDD9')
      .attr('stroke', '#FCEDEB')
      .style('stroke-width', 1)

    circle.append('text')
      .attr('x', 0)
      .attr('dy', d => d.depth ? (showtype === 'up' ? -(SYMBOLA_S_R / 2 + state.current.diamonds.h / 2) : state.current.diamonds.h + SYMBOLA_S_R + 4) : 0)
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
      .attr('y', showtype === 'up' ? state.current.diamonds.h - 20 : -10)
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
            return -state.current.diamonds.h / 2
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
      .attr('dy', d => d.depth ? (d.data.name.length > 12 ? '1.5em' : '2em') : `${state.current.originDiamonds.h / 2 - 10}px`)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.depth ? '#DE4A3C' : '#fff')
      .text(d => d.depth ? (d.data.name.length > 12) ? d.data.name.substr(0, 12) : d.data.name : d.data.name)
      .style('font-size', d => d.depth ? '16px' : '20px')
      .style('font-family', 'PingFangSC-Medium')
      .style('font-weight', '500')
      .style('cursor', 'pointer')
      .on('click', function (d) {
        if (d.data.id && d.depth) {
          if (isFullRef.current) {
            handleFullScreen()
          }
          // 点击操作
        }
      });

    // 名称过长 第二段
    nodeEnter.append('text')
      .attr('x', 0)
      .attr('y', d => {
        // ? (d.depth ? -this.diamonds.h / 2 : 0) : 0
        if (showtype === 'up') {
          if (d.depth) {
            return -state.current.diamonds.h / 2
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
      .attr('y', showtype === 'up' ? -state.current.diamonds.h / 2 : 0)
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
    let nodeUpdate = node
      // .transition()
      // .duration(DURATION)
      .attr('transform', d => showtype === 'up' ? 'translate(' + d.x + ',' + -(d.y) + ')' : 'translate(' + d.x + ',' + (d.y) + ')');

    // 将退出节点转换到父节点的新位置.
    let nodeExit = node.exit()
      // .transition()
      // .duration(DURATION)
      .attr('transform', () => showtype === 'up' ? 'translate(' + source.x + ',' + -(source.y) + ')' : 'translate(' + source.x + ',' + (parseInt(source.y)) + ')')
      .remove();

    nodeExit.select('rect')
      .attr('width', state.current.diamonds.w)
      .attr('height', state.current.diamonds.h)
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    // 修改线条
    let link = state.current.svg.selectAll('path.link' + showtype)
      .data(links, d => d.data.id);

    // 在父级前的位置画线。
    let linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'link' + showtype)
      .attr('marker-start', d => `url(#${showtype}resolved${d.data.type})`)// 根据箭头标记的id号标记箭头
      .attr('stroke', d => d.data.type === COMPANY ? '#DE4A3C' : '#7A9EFF')
      .style('fill-opacity', 1)
      .attr('fill', 'none')
      .attr('stroke-width', '1px')
      // .transition()
      // .duration(DURATION)
      .attr('d', () => {
        let o = { x: source.x0, y: source.y0 };
        return diagonal(o, o, showtype)
      });

    let linkUpdate = linkEnter.merge(link);
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
        let o = {
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



  // 初始化
  const init = () => {
    // let {d3 : $d3, diamonds , originDiamonds , layoutTree, svg ,rootUp,rootDown, svgW:svgW1 , svgH :svgH1} = state.current
    let d3 = state.current.d3
    // 强制横屏 所以取反
    let svgW = state.current.svgW
    let svgH = state.current.svgH
    // console.log('init',svgW, svgH)
    // 方块形状
    state.current.diamonds = {
      w: 240,
      h: 94,
      intervalW: 280,
      intervalH: 180
    }
    // 源头对象
    state.current.originDiamonds = {
      w: 240,
      h: 56,
    }
    state.current.layoutTree = d3.tree().nodeSize([state.current.diamonds.intervalW, state.current.diamonds.intervalH]).separation(() => 1);

    // 主图
    state.current.svg = d3.select('#penetrateChart').append('svg').attr('width', svgW).attr('height', svgH).attr('id', 'treesvg')
      .attr('style', 'position: relative;z-index: 2') 
      // background-image:url(${setWatermark().toDataURL()})
      // .call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', () => {
      //   state.current.svg.attr('transform', d3.event.transform.translate(svgW / 2, svgH / 2));
      // }))
      .append('g').attr('id', 'g').attr('transform', 'translate(' + (svgW / 2) + ',' + (svgH / 2) + ')')

    // 可以被拖动的功能
    var obox = document.getElementById('penetrateChart').childNodes[0];
    var gbox = document.getElementById('penetrateChart').childNodes[0].childNodes[0];
    obox.addEventListener('mousedown', function (evt) {
      // 点击时候停止
      document.onclick = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
      var oEvent = evt // 获取事件对象，这个是兼容写法
      var disX = oEvent.clientX;
      var disY = oEvent.clientY;
      // let arr = gbox.getAttribute('transform')
      //   .replace('translate(', '')
      //   .replace(')', '')
      //   .split(',');
      let x = gbox.getAttribute('transform')
      const decompose = x.match(/translate\((\S+),(\S+)\)/)
      const scale = x.match(/scale\((\S+)\)/)


      // 这里就解释为什么要给document添加onmousemove时间，原因是如果你给obox添加这个事件的时候，当你拖动很快的时候就很快脱离这个onmousemove事件，而不能实时拖动它
      document.onmousemove = function (evt) {
        // 实时改变目标元素obox的位置
        var oEvent = evt
        if (Array.isArray(decompose) && Array.isArray(scale) && decompose[2] && scale[1]) {
          gbox.setAttribute(
            'transform',
            `translate(${oEvent.clientX - disX + parseFloat(decompose[1])},${oEvent.clientY - disY + parseFloat(decompose[2])}) scale(${parseFloat(scale[1])})`
          );
        } else {
          gbox.setAttribute(
            'transform',
            `translate(${oEvent.clientX - disX + parseFloat(decompose[1])},${oEvent.clientY - disY + parseFloat(decompose[2])})`
          );
        }
        // 停止拖动
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      }
    })
    // 拷贝树的数据
    let upTree = null
    let downTree = null
    Object.keys(tree).map(item => {
      if (item === 'parents') {
        upTree = JSON.parse(JSON.stringify(tree))
        upTree.children = tree[item]
        upTree.parents = null
      } else if (item === 'children') {
        downTree = JSON.parse(JSON.stringify(tree))
        downTree.children = tree[item]
        downTree.parents = null
      }
    })
    // hierarchy 返回新的结构 x0,y0初始化起点坐标
    state.current.rootUp = d3.hierarchy(upTree, d => d.children)
    state.current.rootDown = d3.hierarchy(downTree, d => d.children)
    state.current.rootUp.x0 = 0
    state.current.rootUp.y0 = 0
    state.current.rootDown.x0 = 0
    state.current.rootDown.y0 = 0;
    // 上 和 下 结构
    let treeArr = [
      {
        data: state.current.rootUp,
        type: 'up'
      },
      {
        data: state.current.rootDown,
        type: 'down'
      }
    ]
    if (!tree['children'].length && !tree['parents'].length) {
      updataSelf()
    } else {
      treeArr.map(item => {
        if (item.data.children) {
          item.data.children.forEach(collapse);
          update(item.data, item.type, item.data)
        }
      })
    }

  }

  const updataSelf = () => {
    let nodes = state.current.rootUp.descendants()
    let node = state.current.svg.selectAll('g.node')
      .data(nodes, d => d.data.id || '');
    let nodeEnter = node.enter().append('g')
      .attr('class', d => 'node node_' + d.depth) //d => showtype === 'up' && !d.depth ? 'hide-node' :
      // .attr('transform', 'translate(' + (svgW / 2) + ',' + (svgH / 2) + ')')
      .attr('opacity', 1); // 拥有下部分则隐藏初始块  d => showtype === 'up' && !d.depth ? (state.current.rootDown.data.children.length ? 0 : 1) : 1
    // 创建矩形
    nodeEnter.append('rect')
      .attr('type', d => d.data.id + '_' + d.depth)
      .attr('width', d => d.depth ? state.current.diamonds.w : getStringLength(d.data.name) * 22)
      .attr('height', d => d.depth ? (d.data.type === COMPANY ? state.current.diamonds.h : state.current.diamonds.h - 10) : state.current.originDiamonds.h)
      .attr('x', d => d.depth ? -state.current.diamonds.w / 2 : -getStringLength(d.data.name) * 22 / 2)
      .attr('y', d => d.depth ? 0 : -15)
      .attr('stroke', '#DE4A3C')
      .attr('stroke-width', 1)
      .attr('rx', 10)
      .attr('ry', 10)
      .style('fill', d => {
        if (d.data.type === COMPANY || !d.depth) {
          return d.depth ? '#fff' : '#DE4A3C'
        } else if (d.data.type === PERSON) {
          return '#fff'
        }
      });
    // 文字
    nodeEnter.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', `${state.current.originDiamonds.h / 2 - 10}px`)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.depth ? '#DE4A3C' : '#fff')
      .text(d => d.data.name)
      .style('font-size', d => d.depth ? '16px' : '20px')
      .style('font-family', 'PingFangSC-Medium')
      .style('font-weight', '500')
  }

  // 设置图片水印
  const setWatermark = () => {
    // 设置水印
    let user = JSON.parse(sessionStorage.getItem('user')) || { name: '', loginName: '' }
    const waterMarkText = `${user.name} ${user.loginName}`
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 150
    const ctx = canvas.getContext('2d')
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.globalAlpha = 0.09
    ctx.font = '16px sans-serif'
    ctx.translate(70, 90)
    ctx.rotate(-Math.PI / 4)
    ctx.fillText(waterMarkText, 0, 0)

    return canvas
  }

  // 全屏 退出全屏
  const handleFullScreen = () => {
    const element = document.getElementById('comChartOne');
    if (!isFullRef.current) {
      setIsFull(true)
      setScaleN(1)
      if (element.requestFullScreen) { // HTML W3C 提议
        element.requestFullScreen();
      } else if (element.msRequestFullscreen) { // IE11
        element.msRequestFullScreen();
      } else if (element.webkitRequestFullScreen) { // Webkit (works in Safari5.1 and Chrome 15)
        element.webkitRequestFullScreen();
      } else if (element.mozRequestFullScreen) { // Firefox (works in nightly)
        element.mozRequestFullScreen();
      }
      state.current.svgW = document.documentElement.clientWidth
      state.current.svgH = document.documentElement.clientHeight + 300
      element.style.backgroundImage = `url(${setWatermark().toDataURL()})`
    } else {
      // 退出全屏
      setIsFull(false)
      setScaleN(1)
      if (element.requestFullScreen) {
        document.exitFullscreen();
      } else if (element.msRequestFullScreen) {
        document.msExitFullscreen();
      } else if (element.webkitRequestFullScreen) {
        document.webkitCancelFullScreen();
      } else if (element.mozRequestFullScreen) {
        document.mozCancelFullScreen();
      }
      state.current.svgW = 1600
      state.current.svgH = 500

    }
    resetSvg()
  }

  // 倍数改变
  const onScaleChange = (value) => {
    setScaleN(value)
    let gbox = document.getElementById('penetrateChart').childNodes[0].childNodes[0]
    let x = gbox.getAttribute('transform')
    const decompose = x.match(/translate\((\S+),(\S+)\)/);
    if (Array.isArray(decompose) && decompose[2]) {
      gbox.setAttribute('transform', `translate(${parseFloat(decompose[1])},${parseFloat(decompose[2])}) scale(${value})`)
    }
  }

  // 重置画面
  const resetSvg = () => {
    state.current.d3.select('#treesvg').remove()
    init()
  }

  
  // useEffect(() => {
  //   if (treeData.name) {
  //     setTree(treeData)
  //   }
  // }, [treeData])


  useEffect(() => {
    if (tree.name) {
      init()
    }
  }, [tree]) // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div id="comChartOne" style={{ backgroundColor: 'white' }}>
      <Spin spinning={isLoading}>
        <Slider style={{ width: '20rem' }} min={0.2} max={1} step={0.1} defaultValue={0.2} onChange={onScaleChange} value={scaleN} />
        <div id="penetrateChart" style={{ width: '100%', display: 'block', margin: 'auto' }}>
        </div>
      </Spin>
    </div>
  );
}