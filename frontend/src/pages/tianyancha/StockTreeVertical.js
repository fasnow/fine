// 绘制纵向展开的股权树
class StockTreeVertical {
  constructor(options) {
    // 树的源数据
    this.originTreeData = options.originTreeData
    // 宿主元素选择器
    this.el = options.el
    // 节点点击事件
    this.nodeClickEvent =
      options.nodeClickEvent ||
      function (e, d) {
        alert(d.name)
      }
    this.onLoad =
      options.onLoad ||
      function () {
        console.log('--------加载完毕---------')
      }
    // 一些配置项
    this.config = {
      // 节点的横向距离
      dx: 200,
      // 节点的纵向距离
      dy: 120,
      // svg的viewBox的宽度
      width: 0,
      // svg的viewBox的高度
      height: 0,
      // 节点的矩形框宽度
      rectWidth: 170,
      // 节点的矩形框高度
      rectHeight: 80,
      // 根节点的矩形的高度
      rootRectHeight: 45
    }
    // 被克隆的svgbox的信息
    this.clonedSvgBoxInfo = {
      // 宽度
      borderWidth: 0,
      // 下半部分的高度
      downSectionHeight: 0,
      // 上半部分的高度
      upSectionHeight: 0
    }

    this.svg = null
    this.gAll = null
    this.gLinks = null
    this.gNodes = null
    // 给树加坐标点的方法
    this.tree = null
    // 投资公司树的根节点
    this.rootOfDown = null
    // 股东树的根节点
    this.rootOfUp = null
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

    this.drawChart({
      type: 'fold'
    })
  }

  // 绘制svg图表
  drawChart(options) {
    // 宿主元素的d3选择器对象
    let host = d3.select(this.el)
    // 宿主元素的DOM，通过node()获取到其DOM元素对象
    let dom = host.node()
    // 宿主元素的DOMRect
    let domRect = dom.getBoundingClientRect()
    // svg的宽度和高度
    this.config.width = domRect.width
    this.config.height = domRect.height

    let oldSvg = d3.select('svg')
    // 如果宿主元素中包含svg标签了，那么则删除这个标签，再重新生成一个
    if (!oldSvg.empty()) {
      oldSvg.remove()
    }

    const svg = d3
      .create('svg')
      .attr('viewBox', () => {
        let parentsLength = this.originTreeData.parents ? this.originTreeData.parents.length : 0
        return [
          -this.config.width / 2,
          // 如果有父节点，则根节点居中，否则根节点上浮一段距离
          parentsLength > 0 ? -this.config.height / 2 : -this.config.height / 3,
          this.config.width,
          this.config.height
        ]
      })
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .style('user-select', 'none')
      .style('cursor', 'move')

    // 包括连接线和节点的总集合
    const gAll = svg.append('g').attr('id', 'all')
    // .attr('transform', 'scale(0.8)')

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.01, 5])
      .on('zoom', (e) => {
        const myTransition2 = svg.transition().duration(500).ease(d3.easeCubicOut)
        gAll.transition(myTransition2).attr('transform', () => {
          return `translate(${e.transform.x},${e.transform.y}) scale(${e.transform.k})`
        })
      })

    svg.call(zoomBehavior).on('dblclick.zoom', null) // 取消默认的双击放大事件

    zoomBehavior.translateTo(svg, 0, 0)
    // zoomBehavior.scaleTo(svg, 0.8)

    this.gAll = gAll
    // 连接线集合
    this.gLinks = gAll.append('g').attr('id', 'linkGroup')
    // 节点集合
    this.gNodes = gAll.append('g').attr('id', 'nodeGroup')
    // 设置好节点之间距离的tree方法
    this.tree = d3.tree().nodeSize([this.config.dx, this.config.dy])

    this.rootOfDown = d3.hierarchy(this.originTreeData, (d) => d.children)
    this.rootOfUp = d3.hierarchy(this.originTreeData, (d) => d.parents)
    console.log(this.rootOfDown, this.rootOfUp)
    ;[this.rootOfDown.descendants(), this.rootOfUp.descendants()].forEach((nodes) => {
      nodes.forEach((node) => {
        node._children = node.children || null
        if (options.type === 'all') {
          //如果是all的话，则表示全部都展开
          node.children = node._children
        } else if (options.type === 'fold') {
          //如果是fold则表示除了父节点全都折叠
          // 将非根节点的节点都隐藏掉（其实对于这个组件来说加不加都一样）
          if (node.depth) {
            node.children = null
          }
        }
      })
    })

    //箭头(下半部分)
    svg
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

    //箭头(上半部分)
    svg
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

    svg
      .append('defs')
      .append('filter')
      .attr('id', 'rect-shadow')
      .append('feDropShadow')
      .attr('stdDeviation', 8)
      .attr('flood-color', 'rgba(32,52,128,0.15)')
    // .attr('flood-opacity', 0.4)

    this.svg = svg
    this.zoom = zoomBehavior
    this.update()
    // 将svg置入宿主元素中
    host.append(function () {
      return svg.node()
    })

    this.onLoad()
  }

  // 更新数据
  update(source) {
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

    /***  绘制子公司树  ***/
    const node1 = this.gNodes.selectAll('g.nodeOfDownItemGroup').data(nodesOfDown, (d) => {
      return d.data.id + d.data.unique
    })

    const that = this

    const node1Enter = node1
      .enter()
      .append('g')
      .attr('class', 'nodeOfDownItemGroup')
      .attr('transform', (d) => {
        return `translate(${source.x0},${source.y0})`
      })
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .style('opacity', 0)
      .style('cursor', 'pointer')
      .on('click', (e, d) => {
        if(d.depth !== 0) {
          this.nodeClickEvent(e, d)
        }
      })

    // 外层的矩形框
    node1Enter
      .append('rect')
      .attr('width', (d) => {
        if (d.depth === 0) {
          return (d.data.name.length + 4) * 16
        }
        return this.config.rectWidth
      })
      .attr('height', (d) => {
        if (d.depth === 0) {
          return this.config.rootRectHeight
        }
        return this.config.rectHeight
      })
      .attr('x', (d) => {
        if (d.depth === 0) {
          return (-(d.data.name.length + 4) * 16) / 2
        }
        return -this.config.rectWidth / 2
      })
      .attr('y', (d) => {
        if (d.depth === 0) {
          return -this.config.rootRectHeight / 2
        }
        return -this.config.rectHeight / 2
      })
      .attr('stroke-width', 1)
      .attr('stroke', (d) => {
        if (d.depth === 0) {
          return '#EBD1BB'
        }
      })
      .attr('rx', 8)
      .attr('fill', (d) => {
        if (d.depth === 0) {
          return '#FFF9F1'
        } else {
          return that.nodeColorList[1].rectColor
        }
      })
      // todo => 这个阴影效果，还不好，后续优化
      // .attr('filter', 'url(#rect-shadow)')

    // 添加字体自适应的功能
    node1Enter
      .append('foreignObject')
      .attr('width', (d) => {
        if (d.depth === 0) {
          return (d.data.name.length + 4) * 16
        }
        return this.config.rectWidth
      })
      .attr('height', (d) => {
        if (d.depth === 0) {
          return this.config.rootRectHeight
        }
        return this.config.rectHeight
      })
      .attr('x', (d) => {
        if (d.depth === 0) {
          return (-(d.data.name.length + 4) * 16) / 2
        }
        return -this.config.rectWidth / 2
      })
      .attr('y', (d) => {
        if (d.depth === 0) {
          return -this.config.rootRectHeight / 2
        }
        return -this.config.rectHeight / 2
      })
      .append('xhtml:div')
      .style('font-size', (d) => {
        // 设置字体大小
        if (d.depth === 0) {
          return '17px'
        } else {
          return '15px'
        }
      })
      .style('color', (d) => {
        if (d.depth === 0) {
          return '#AD4903'
        } else {
          return that.nodeColorList[1].textColor
        }
      })
      .style('line-height', (d) => {
        if (d.depth === 0) {
          return `${this.config.rootRectHeight}px`
        } else {
          return 2
        }
      })
      .style('text-align', (d) => {
        if (d.depth === 0) {
          return 'center'
        }
      })
      .style('font-weight', (d) => {
        if (d.depth === 0) {
          return 'bold'
        }
      })
      .style('padding', '0 5px 0 12px')
      .style('overflow', 'hidden')
      .style('white-space', 'nowrap')
      .style('text-overflow', 'ellipsis')
      .attr('title', (d) => {
        return d.data.name
      })
      .text((d) => {
        return d.data.name
      })

    // 添加控股比例
    const holdingPercentG = node1Enter
      .append('g')
      .attr('class', 'holdingPercentG')
      .attr('transform', () => {
        return `translate(${0}, 12)`
      })
      .style('display', (d) => {
        // 如果是根节点，不显示
        if (d.depth === 0) {
          return 'none'
        }
      })

    holdingPercentG
      .append('text')
      .attr('fill', (d) => {
        return that.nodeColorList[1].textColor
      })
      .attr('x', -this.config.rectWidth / 2 + 15)
      .style('font-size', 12)
      .text('持股比例')

    holdingPercentG
      .append('text')
      .attr('fill', (d) => {
        return that.nodeColorList[1].textColor
      })
      .attr('text-anchor', 'end')
      .attr('x', this.config.rectWidth / 2 - 12)
      // .attr('y', 2)
      .style('font-size', 13)
      .text((d) => {
        if (d.depth !== 0) {
          return d.data.percent + '%'
        }
      })

    const percentBarWidth = this.config.rectWidth - 20
    holdingPercentG
      .append('rect')
      .attr('fill', 'rgba(0,0,0,0.1)')
      .attr('x', -this.config.rectWidth / 2 + 10)
      .attr('y', 6)
      .attr('width', percentBarWidth)
      .attr('height', 6)
      .attr('rx', 3)
      .text((d) => {
        if (d.depth !== 0) {
          return d.data.percent + '%'
        }
      })

    holdingPercentG
      .append('rect')
      .attr('fill', '#95C3FF')
      .attr('x', -this.config.rectWidth / 2 + 10)
      .attr('y', 6)
      .attr('width', (d) => {
        if (d.data.percent) {
          return percentBarWidth * (parseFloat(d.data.percent) / 100)
        }
      })
      .attr('height', 6)
      .attr('rx', 3)
      .text((d) => {
        if (d.depth !== 0) {
          return d.data.percent + '%'
        }
      })

    // 添加展开按钮
    const expandBtnG = node1Enter
      .append('g')
      .attr('class', 'expandBtn')
      .attr('transform', () => {
        return `translate(${0},${this.config.rectHeight / 2})`
      })
      .style('display', (d) => {
        // 如果是根节点，不显示
        if (d.depth === 0) {
          return 'none'
        }
        // 如果没有子节点，则不显示
        if (!d._children) {
          return 'none'
        }
      })
      .on('click', (e, d) => {
        e.stopPropagation()
        if (d.children) {
          d._children = d.children
          d.children = null
        } else {
          d.children = d._children
        }
        this.update(d)
      })

    // 添加圆形背景
    expandBtnG
      .append('circle')
      .attr('r', 12)
      .attr('stroke', '#9EA9BB')
      .attr('stroke-width', 1)
      .attr('fill', '#EAF3FF')
      .attr('cy', 0)

    // 添加加减号文本
    expandBtnG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#9EA9BB')
      .attr('y', 10)
      .style('font-size', 30)
      .style('font-family', '黑体')
      .text((d) => {
        return d.children ? '-' : '+'
      })

    const link1 = this.gLinks
      .selectAll('path.linkOfDownItem')
      .data(linksOfDown, (d) => d.target.data.id + d.target.data.unique)

    const link1Enter = link1
      .enter()
      .append('path')
      .attr('class', 'linkOfDownItem')
      .attr('d', (d) => {
        let o = {
          source: {
            x: source.x0,
            y: source.y0
          },
          target: {
            x: source.x0,
            y: source.y0
          }
        }
        return this.drawLink(o)
      })
      .attr('fill', 'none')
      .attr('stroke', '#9DA8BA')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#markerOfDown)')

    // 有元素update更新和元素新增enter的时候
    node1
      .merge(node1Enter)
      .transition(myTransition)
      .attr('transform', (d) => {
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

    link1.merge(link1Enter).transition(myTransition).style('opacity', 1).attr('d', this.drawLink)

    link1
      .exit()
      .transition(myTransition)
      .remove()
      .attr('d', () => {
        let o = {
          source: {
            x: source.x,
            y: source.y
          },
          target: {
            x: source.x,
            y: source.y
          }
        }
        return this.drawLink(o)
      })
      .style('opacity', 0)

    /***  绘制股东树  ***/

    nodesOfUp.forEach((node) => {
      node.y = -node.y
    })

    const node2 = this.gNodes.selectAll('g.nodeOfUpItemGroup').data(nodesOfUp, (d) => {
      return d.data.id + d.data.xh
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
      .style('display', (d) => {
        if (d.depth === 0) return 'none'
      })
      .on('click', (e, d) => {
        this.nodeClickEvent(e, d)
      })

    // 外层的矩形框
    node2Enter
      .append('rect')
      .attr('width', (d) => {
        if (d.depth === 0) {
          return (d.data.name.length + 4) * 16
        }
        return this.config.rectWidth
      })
      .attr('height', (d) => {
        if (d.depth === 0) {
          return this.config.rootRectHeight
        }
        return this.config.rectHeight
      })
      .attr('x', (d) => {
        if (d.depth === 0) {
          return (-(d.data.name.length + 4) * 16) / 2
        }
        return -this.config.rectWidth / 2
      })
      .attr('y', (d) => {
        if (d.depth === 0) {
          return -this.config.rootRectHeight / 2
        }
        return -this.config.rectHeight / 2
      })
      .attr('stroke-width', 1)
      .attr('stroke', (d) => {
        if (d.depth === 0) {
          return '#EBD1BB'
        }
      })
      .attr('rx', 8)
      .attr('fill', (d) => {
        if (d.depth === 0) {
          return '#FFF9F1'
        } else {
          return that.nodeColorList[2].rectColor
        }
      })
      // todo => 这个阴影效果，还不好，后续优化
      // .attr('filter', 'url(#rect-shadow)')

    // 添加字体自适应的功能
    node2Enter
      .append('foreignObject')
      .attr('width', (d) => {
        if (d.depth === 0) {
          return (d.data.name.length + 4) * 16
        }
        return this.config.rectWidth
      })
      .attr('height', (d) => {
        if (d.depth === 0) {
          return this.config.rootRectHeight
        }
        return this.config.rectHeight
      })
      .attr('x', (d) => {
        if (d.depth === 0) {
          return (-(d.data.name.length + 4) * 16) / 2
        }
        return -this.config.rectWidth / 2
      })
      .attr('y', (d) => {
        if (d.depth === 0) {
          return -this.config.rootRectHeight / 2
        }
        return -this.config.rectHeight / 2 + 5
      })
      .append('xhtml:div')
      .style('font-size', (d) => {
        // 设置字体大小
        if (d.depth === 0) {
          return '17px'
        } else {
          return '15px'
        }
      })
      .style('color', (d) => {
        if (d.depth === 0) {
          return '#AD4903'
        } else {
          return that.nodeColorList[2].textColor
        }
      })
      .style('line-height', (d) => {
        if (d.depth === 0) {
          return `${this.config.rootRectHeight}px`
        } else {
          return 2
        }
      })
      .style('text-align', (d) => {
        if (d.depth === 0) {
          return 'center'
        }
      })
      .style('font-weight', (d) => {
        if (d.depth === 0) {
          return 'bold'
        }
      })
      .style('padding', '0 5px 0 12px')
      .style('overflow', 'hidden')
      .style('white-space', 'nowrap')
      .style('text-overflow', 'ellipsis')
      .attr('title', (d) => {
        return d.data.name
      })
      .text((d) => {
        return d.data.name
      })

    // 添加控股比例
    const holdingPercentG2 = node2Enter
      .append('g')
      .attr('class', 'holdingPercentG')
      .attr('transform', () => {
        return `translate(${0}, 16)`
      })
      .style('display', (d) => {
        // 如果是根节点，不显示
        if (d.depth === 0) {
          return 'none'
        }
      })

    holdingPercentG2
      .append('text')
      .attr('fill', (d) => {
        if (d.depth !== 0) {
          return that.nodeColorList[2].textColor
        }
      })
      .attr('x', -this.config.rectWidth / 2 + 12)
      .style('font-size', 12)
      .text('持股比例')

    holdingPercentG2
      .append('text')
      .attr('fill', (d) => {
        if (d.depth !== 0) {
          return that.nodeColorList[2].textColor
        }
      })
      .attr('text-anchor', 'end')
      .attr('x', this.config.rectWidth / 2 - 12)
      // .attr('y', 2)
      .style('font-size', 13)
      .text((d) => {
        if (d.depth !== 0) {
          return d.data.percent + '%'
        }
      })

    holdingPercentG2
      .append('rect')
      .attr('fill', 'rgba(0,0,0,0.1)')
      .attr('x', -this.config.rectWidth / 2 + 10)
      .attr('y', 6)
      .attr('width', percentBarWidth)
      .attr('height', 6)
      .attr('rx', 3)
      .text((d) => {
        if (d.depth !== 0) {
          return d.data.percent + '%'
        }
      })

    holdingPercentG2
      .append('rect')
      .attr('fill', () => {
        return that.nodeColorList[2].percentBarColor
      })
      .attr('x', -this.config.rectWidth / 2 + 10)
      .attr('y', 6)
      .attr('width', (d) => {
        if (d.data.percent) {
          return percentBarWidth * (parseFloat(d.data.percent) / 100)
        }
      })
      .attr('height', 6)
      .attr('rx', 3)
      .text((d) => {
        if (d.depth !== 0) {
          return d.data.percent + '%'
        }
      })

    // 添加展开按钮
    const expandBtnG2 = node2Enter
      .append('g')
      .attr('class', 'expandBtn')
      .attr('transform', () => {
        return `translate(${0},-${this.config.rectHeight / 2 + 5})`
      })
      .style('display', (d) => {
        // 如果是根节点，不显示
        if (d.depth === 0) {
          return 'none'
        }
        // 如果没有子节点，则不显示
        if (!d._children) {
          return 'none'
        }
      })
      .on('click', (e, d) => {
        e.stopPropagation()
        if (d.children) {
          d._children = d.children
          d.children = null
        } else {
          d.children = d._children
        }
        this.update(d)
      })

    // 添加圆形背景
    expandBtnG2
      .append('circle')
      .attr('r', 12)
      .attr('stroke', '#9EA9BB')
      .attr('stroke-width', 1)
      .attr('fill', '#EAF3FF')
      .attr('cy', 0)

    // 添加加减号文本
    expandBtnG2
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#9EA9BB')
      .attr('y', 11)
      .style('font-size', 30)
      .style('font-family', '黑体')
      .text((d) => {
        return d.children ? '-' : '+'
      })

    const link2 = this.gLinks.selectAll('path.linkOfUpItem').data(linksOfUp, (d) => {
      return d.target.data.id + d.target.data.xh
    })

    const link2Enter = link2
      .enter()
      .append('path')
      .attr('class', 'linkOfUpItem')
      .attr('d', () => {
        let o = {
          source: {
            x: source.x0,
            y: source.y0
          },
          target: {
            x: source.x0,
            y: source.y0
          }
        }
        return this.drawLink(o)
      })
      .attr('fill', 'none')
      .attr('stroke', '#9DA8BA')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#markerOfUp)')

    // 有元素update更新和元素新增enter的时候
    node2
      .merge(node2Enter)
      .transition(myTransition)
      .attr('transform', (d) => {
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

    link2.merge(link2Enter).transition(myTransition).attr('d', this.drawLink)

    link2
      .exit()
      .transition(myTransition)
      .remove()
      .attr('d', () => {
        let o = {
          source: {
            x: source.x,
            y: source.y
          },
          target: {
            x: source.x,
            y: source.y
          }
        }
        return this.drawLink(o)
      })

    // node数据改变的时候更改一下加减号
    const expandButtonsSelection = d3.selectAll('g.expandBtn')

    expandButtonsSelection
      .select('text')
      .transition()
      .text((d) => {
        return d.children ? '-' : '+'
      })

    this.rootOfDown.eachBefore((d) => {
      d.x0 = d.x
      d.y0 = d.y
    })
    this.rootOfUp.eachBefore((d) => {
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
    this.zoom.translateTo(this.svg, source.x, source.y)
  }

  // 直角连接线 by wushengyuan
  drawLink({ source, target }) {
    const halfDistance = (target.y - source.y) / 2
    const halfY = source.y + halfDistance
    return `M${source.x},${source.y} L${source.x},${halfY} ${target.x},${halfY} ${target.x},${target.y}`
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
  calculateBorderLength(nodesOfDown, nodesOfUp) {
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
    let sortedNodesOfDown = nodesOfDown.sort(function (a, b) {
      return a.x - b.x
    })
    // 计算出“基础”的高度
    let downTreeHeight_base = 0 + deepestDownNodeY
    // 计算出“基础”的宽度
    let downTreeWidth_base = sortedNodesOfDown.at(-1).x - sortedNodesOfDown.at(0).x

    // 【向下的树】最深的节点的Y值
    let deepestUpNodeY = nodesOfUp[0].y
    // 按照x坐标的值，进行升序排列，最左边的节点在第一位，最右边的节点在最后一位
    let sortedNodesOfUp = nodesOfUp.sort(function (a, b) {
      return a.x - b.x
    })
    // 计算出“基础”的高度
    let upTreeHeight_base = 0 + deepestUpNodeY
    // 计算出“基础”的宽度
    let upTreeWidth_base = sortedNodesOfUp.at(-1).x - sortedNodesOfUp.at(0).x

    // 边界的宽度肯定不能直接等于两边节点之间的距离，还得加上留白的地方
    borderWidth = Math.max(downTreeWidth_base, upTreeWidth_base) + 3 * this.config.rectWidth
    downSectionHeight = downTreeHeight_base + 2 * this.config.rectHeight
    upSectionHeight = upTreeHeight_base + 2 * this.config.rectHeight

    return {
      borderWidth,
      downSectionHeight,
      upSectionHeight
    }
  }
}
