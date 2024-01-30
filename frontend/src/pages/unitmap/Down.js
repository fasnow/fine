import React,{ useEffect,useRef, useState} from 'react';
import { Col, Row, Slider, Spin, message } from 'antd';
import * as d3Chart from 'd3';
import fullScreen from '../../../../../../assets/fullScreen.png'
import styles from './index.less';
import { EncryptBase64 } from '../../../../../Common/Encrypt';
import { FetchEquityBelowInfo } from '../../../../../../services/companysearch'
import { formatMoney } from '../../../../../../utils/splitMoney'

// 过渡时间
const DURATION = 400
// 加减符号半径
const SYMBOLA_S_R = 9
// // 公司
// const COMPANY = '0'
// // 人
// const PERSON = '1'

export default function RightStructureDown(props){
  let state  = useRef({
      diamonds: '',
      originDiamonds: '',
      d3: d3Chart,
      hasChildOpenNodeArr: [],
      root: '',
      svg: '',
      svgH: 500,
      svgW: 1600,
      lastClickD:null,
  })

  const isFullRef = useRef()
  const [isFull,setIsFull] = useState(false) 
  const [scaleN,setScaleN] = useState(1)
  const [tree,setTree] = useState({
    // 'name': '马云',
    // 'tap': '节点',
    // 'id': '1',
    // 'children': [
    //   {
    //     'name': '中国平安人寿保险股份有限公司自有资金马云的公司厉害得很',
    //     'scale': '2.27',
    //     'id': '1-1',
    //     'money': '3000',
    //     'children': [
    //       {
    //         'name': '中国证券金融股份有限公司',
    //         'scale': '2.27',
    //         'id': '1-1-1',
    //         'money': '3000',
    //         'children': [
    //           {
    //             'name': '中国证券金融股份有限公司',
    //             'scale': '2.27',
    //             'id': '1-1-1-1',
    //             'money': '3000',
    //           }
    //         ]
    //       },
    //       {
    //         'name': '中央汇金资产管理有限责任公司',
    //         'scale': '2.27',
    //         'id': '1-1-2',
    //         'money': '3000',
    //       }
    //     ]
    //   }
    // ]
    })
  const [isLoading,setLoading] = useState(false)

  useEffect(() => {
    isFullRef.current = isFull
  }, [isFull])
  
  // 获取文字长度
  const getStringLength = (str) => {
    let realLength = 0, len = str.length, charCode = -1;
    for (let i = 0; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode < 65){
        realLength += 1;
      }else if(charCode > 90 && charCode <= 128){
        realLength += 1;
      }else if(charCode >= 65 && charCode <= 90){
        realLength += 1.2;
      }else{
        realLength += 2;
      }
    }
    return realLength / 2;
  };

  const diagonal = (d) =>{
    return `M ${d.source.y} ${d.source.x}
        H ${(d.source.y + (d.target.y-d.source.y)/2)}
        V ${d.target.x}
        H ${d.target.y}`;
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
  const getBelow = async (id) =>{
      setLoading(true)
      const dataSource = [];
      try{
        const response = await FetchEquityBelowInfo({
          instId: id,
          currentPage: 0,
          pageSize: 200,
        })
        const { records = [] } = response
        records.forEach(element =>{
        dataSource.push({
            isHaveChildren:null,
            money:element.amount ? formatMoney((element.amount / 10000).toFixed(2)) :'--',
            scale:element.hold_rati || '--%',
            name:element.chn_full_nm || '--',
            id:element.inst_cust_id || '--',
            type:'0'
          })
        })
        setLoading(false)
        return dataSource
      }catch(error){
        return dataSource
      }
  }

  const click = async (d) =>{
      // if (d.children) {
      //   d._children = d.children;
      //   d.children = null;
      // } else {
      //   d.children = d._children;
      //   d._children = null;
      // }
      // if (state.current.lastClickD){
      //   state.current.lastClickD._isSelected = false;
      // }
      // d._isSelected = true;
      // state.current.lastClickD = d;
      if(d.children){
        // 点击减号
        d._children = d.children;
        d.children = null;
        state.current.hasChildOpenNodeArr = state.current.hasChildOpenNodeArr.filter(item => item !== d.data.id)
      }else {
        // 点击加号
        state.current.hasChildOpenNodeArr.push(d.data.id);
        if(!d._children){
          let res = []
          res = await getBelow(d.data.id)
          if(!res.length){
            message.warning('上游或下游企业信息为空！')
            return
          }
          res.forEach(item =>{
            let newNode = state.current.d3.hierarchy(item)
            newNode.depth = d.depth + 1; 
            newNode.height = d.height - 1;
            newNode.parent = d; 
            if(!d.children){
              d.children = [];
              d.data.children = [];
            }
            d.children.push(newNode);
            d.data.children.push(newNode.data);
          })
        }else{
          d.children = d._children;
          d._children = null;
        }
      }  
      update(d)
  }

  /*
       *[update 函数描述], [click 函数描述]
       *  @param  {[Object]} source 第一次是初始源对象，后面是点击的对象
       *  @param  {[String]} showtype up表示向上 down表示向下
       *  @param  {[Object]} sourceTree 初始源对象
       */
  const update = (source) => {        

        let nodes = state.current.root.descendants()
        
        let index = -1, count = 0;
        state.current.root.eachBefore(function(n) {
          count+=20;
          n.style = 'node_' + n.depth;
          n.x = ++index * state.current.diamonds.h + count;
          n.y = n.depth * 37; // 设置下一层水平位置向后移37px
        });

        let node = state.current.svg.selectAll('g.node')
          .data(nodes, d => d.data.id || '');

        let nodeEnter = node.enter().append('g')
          .attr('class', d => 'node node_' + d.depth)
          .attr('transform', 'translate(' + source.y0 + ',' + source.x0 + ')')
          .attr('opacity', 0);
        // 创建矩形
        nodeEnter.append('rect')
          .attr('type', d => d.data.id)
          .attr('width', d => d.depth ? state.current.diamonds.w : (getStringLength(d.data.name) * 20 + 20) )
          .attr('height', d => d.depth ? state.current.diamonds.h : state.current.originDiamonds.h)
          .attr('y', -state.current.diamonds.h / 2)
          .attr('stroke', '#DE4A3C')
          .attr('stroke-width', 1)
          .attr('rx', 6)
          .attr('ry', 6)
          .style('fill',d => {
            return d.data.tap ? '#DE4A3C' : '#fff'
          }
          );
          
          nodeEnter.append('rect')
          .attr('y', -state.current.diamonds.h / 2)
          .attr('height', d => d.depth ? state.current.diamonds.h : state.current.originDiamonds.h)
          .attr('width', 6)
          .attr('rx', 6)
          .attr('ry', 6)
          .style('fill', '#DE4A3C')

          // 文字
          nodeEnter.append('text')
			.attr('dy', d=> d.depth ? -7 : -5)
			.attr('dx', d=> d.depth ? 36 : 10)
			.style('font-size', d=> d.depth ? '16px' : '20px')
      .style('font-weight', '500')
      .attr('fill', d =>  d.depth ? '#333333' : '#fff')
			.text(function(d) {
        // 名字长度超过进行截取
        if(d.depth){
          if(d.data.name.length>22){
            return	d.data.name.substring(0, 22) + '...'; 
          }
        }
				return d.data.name; 
			})
      .style('cursor', 'pointer')
      .on('click', function (d) {
        if(d.data.id && d.depth){
          if(isFullRef.current){
            handleFullScreen()
          }
          // 操作点击打开新页面
        }
      });

        // 持股比例
		    nodeEnter.append('text')
        .attr('dy', 17)
        .attr('dx', 36)
        .style('font-size', '14px')
        .style('fill', '#666666')
        .text(function(d) {
          if(!d.data.tap){
            return ('持股比例' +'：')
          } 
        });
      
        nodeEnter.append('text')
        .attr('dy', 17)
        .attr('dx', 98)
        .style('font-size', '14px')
        .style('fill', '#DE4A3C')
        .text(function(d) {
          if(!d.data.tap){
            return (d.data.scale)
          } 
        });
      
        // 认缴金额
        nodeEnter.append('text')
        .attr('dy', 17)
        .attr('dx', 170)
        .style('font-size', '14px')
        .style('fill', '#666666')
        .text(function(d) {
          if(!d.data.tap){
            return ('认缴金额' + '：')
          } 
        });
      
        nodeEnter.append('text')
        .attr('dy', 17)
        .attr('dx', 240)
        .style('font-size', '14px')
        .style('fill', '#DE4A3C')
        .text(function(d) {
          if(!d.data.tap){
            if(d.data.money.length > 20){
              return  d.data.money.substr(0, 20) + '...'
            }else{
              return (d.data.money + '万元')
            }
          } 
        });

        // 创建圆 加减
        let circle = nodeEnter.append('g')
        .attr('class', 'circle')
        .on('click', click);
  
        circle.append('circle')
                .style('fill', '#F9DDD9')
                .style('stroke', '#FCEDEB')
                .style('stroke-width', 1)
                .attr('r', function (d) {
                  if(d.depth){
                    if (d.children || d.data.isHaveChildren) {
                      return 9;
                    } else {
                      return 0;
                    }  
                  }else {
                    return 0
                  }
                })
                .attr('cy', d => d.depth ? 0 : (-SYMBOLA_S_R -3))
                .attr('cx', 20)
                .style('cursor', 'pointer')
              
        circle.append('text')
          .attr('dy', d => d.depth ? 4.5 : -7)
          .attr('dx', 20)
          .attr('text-anchor', 'middle')
          .attr('class', 'fa')
          .style('fill', '#DE4A3C')
          .text(function(d) {
            if(d.depth){
              if (d.children) {
                return '-';
              } else if (d._children || d.data.isHaveChildren) {
                return '+';
              } else {
                return '';
              }
            }else {
              return ''
            }
          })
          .style('font-size', '16px')
          .style('cursor', 'pointer');
        
        node.select('.fa')
        .text(function (d) {
          if(d.depth){
            if (d.children) {
              return '-';
            } else if (d._children || d.data.isHaveChildren) {
              return '+';
            } else {
              return '';
            }
          }else {
            return ''
          }
        })

    /*
        * 绘制箭头
        * @param  {string} markerUnits [设置为strokeWidth箭头会随着线的粗细发生变化]
        * @param {string} viewBox 坐标系的区域
        * @param {number} markerWidth,markerHeight 标识的大小
        * @param {string} orient 绘制方向，可设定为：auto（自动确认方向）和 角度值
        * @param {number} stroke-width 箭头宽度
        * @pmarker-endaram {string} d 箭头的路径
        * @param {string} fill 箭头颜色
        */
        // nodeEnter.append('marker')
        //   .attr('id', 'resolvedIn')
        //   .attr('markerUnits', 'strokeWidth')
        //   .attr('markerUnits', 'userSpaceOnUse')
        //   .attr('viewBox', '0 -5 10 10')
        //   .attr('markerWidth', 12)
        //   .attr('markerHeight', 12)
        //   .attr('orient', '0')
        //   .attr('refX', '10')
        //   // .attr('refY', '10')
        //   .attr('stroke-width', 2)
        //   .attr('fill', '#DE4A3C')
        //   .append('path')
        //   .attr('d', 'M0,-5L10,0L0,5')
        //   .attr('fill', '#DE4A3C');

        // 将节点转换到它们的新位置。
        nodeEnter
          // .transition()
          // .duration(DURATION)
          .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; })
          .style('opacity', 1);

        node
        // .transition()
        // .duration(DURATION)
        .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; })
        .style('opacity', 1)
        .select('rect');

        // 将退出节点转换到父节点的新位置.
        let nodeExit = node.exit()
          // .transition()
          // .duration(DURATION)
          .attr('transform', () => 'translate(' + source.y + ',' + (parseInt(source.x)) + ')')
          .style('opacity', 0)
          .remove();

        // 修改线条
        let link = state.current.svg.selectAll('path.link')
          .data(state.current.root.links(), d => d.target.id);

        // 在父级前的位置画线。
        let linkEnter = link.enter().insert('path', 'g')
          .attr('class', d => 'link link_' + d.target.depth)
          // .attr('marker-end', `url(#resolvedIn)`)// 根据箭头标记的id号标记箭头
          .attr('stroke', '#DE4A3C')
          .style('fill-opacity', 1)
          .attr('fill', 'none')
          .attr('stroke-width', '1px')
          .attr('d', () => {
            let o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o})
          })
          // .transition()
          // .duration(DURATION)
          .attr('d', diagonal);

        // 过渡更新位置.
        link
          // .transition()
          // .duration(DURATION)
          .attr('d', diagonal);

        // 将退出节点转换到父节点的新位置
        link.exit()
          // .transition()
          // .duration(DURATION)
          .attr('d', () => {
            let o = {
              x: source.x,
              y: source.y
            };
            return diagonal({source: o, target: o})
          }).remove();

        // 隐藏旧位置方面过渡.
        state.current.root.each(d => {
          d.x0 = d.x;
          d.y0 = d.y
        });
  }    
  


  const init = () =>{
    // console.log('init',tree)
    let d3 = state.current.d3
    // 强制横屏 所以取反
    let svgW = state.current.svgW
    let svgH = state.current.svgH
    let margin = {top: 20, right: 20, bottom: 30, left: 10}
    // 方块形状
    state.current.diamonds = {
      w: 410,
      h: 72,
    }
    // 源头对象
    state.current.originDiamonds = {
      w: 224,
      h: 52
    }

    
    // 主图
    state.current.svg = d3.select('#structureChartDown').append('svg').attr('width', svgW).attr('height', svgH).attr('id', 'treesvgDown')
      .attr('style', 'position: relative;z-index: 2') // background-image:url(${setWatermark().toDataURL()})
      // .call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', () => {
      //   state.current.svg.attr('transform', d3.event.transform.translate(svgW / 2, svgH / 2));
      // }))
      .append('g').attr('id', 'gDown').attr('transform', `translate(${svgW / 3},${margin.top})`)

      // 可以被拖动的功能
      var obox = document.getElementById('structureChartDown').childNodes[0];
      var gbox = document.getElementById('structureChartDown').childNodes[0].childNodes[0];
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
            }else{
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
        let downTree = null
        Object.keys(tree).map(item => {
          if (item === 'children') {
            downTree = JSON.parse(JSON.stringify(tree))
            downTree.children = tree[item]
          }
        })
          // hierarchy 返回新的结构 x0,y0初始化起点坐标
          state.current.root = d3.hierarchy(downTree)
          state.current.root.x0 = 0
          state.current.root.y0 = 0
          if(!state.current.root.children){
            // console.log(tree['children'].length,state.current.root.children)
            update(state.current.root)
          }else {
            state.current.root.children.forEach(collapse);
            update(state.current.root)
          }
  }

  // 设置图片水印
  const setWatermark = () =>{
    // 设置水印
    let user = JSON.parse(sessionStorage.getItem('user')) || { name :'' , loginName :''}
    const waterMarkText = `${user.name} ${user.loginName}`
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 150
    const ctx = canvas.getContext('2d')
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.globalAlpha = 0.09
    ctx.font = '16px sans-serif'
    ctx.translate(70,90)
    ctx.rotate(-Math.PI / 4)
    ctx.fillText(waterMarkText, 0, 0)

    return canvas
  }


  // 全屏 退出全屏
  const handleFullScreen = () =>{
    const element = document.getElementById('comChartDown');
    if(!isFullRef.current){
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
      setIsFull(true)
      setScaleN(1)
    }else {
      // 退出全屏
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
      setIsFull(false)
      setScaleN(1)
    }
    resetSvg()
  }



  // 重置画面
  const resetSvg =() =>{
    state.current.d3.select('#treesvgDown').remove()
    init()
  }

  // 倍数改变
  const onScaleChange = (value) => {
    setScaleN(value)
    let gbox = document.getElementById('structureChartDown').childNodes[0].childNodes[0]
    let x = gbox.getAttribute('transform')
    const decompose = x.match(/translate\((\S+),(\S+)\)/);
    if (Array.isArray(decompose) && decompose[2]) {
      gbox.setAttribute('transform',`translate(${parseFloat(decompose[1])},${parseFloat(decompose[2])}) scale(${value})`)
    }
  }

  const { treeData } = props
  useEffect(()=>{
    if(treeData.name){
      // console.log(treeData,'treeData')
      let temp = {...treeData}
      setTree(temp)
    }
  },[treeData])


  useEffect(()=>{
    if(tree.name){
      init()
    }
  },[tree]) // eslint-disable-line react-hooks/exhaustive-deps


    return (
      <div  id="comChartDown" style={{backgroundColor:'white'}}>
        <Spin spinning={isLoading}>
          <Row style={{height:'35px'}}>
            <Col className="left">
              <Slider style={{ width: '20rem' }} min={0.3} max={2} step={0.1} defaultValue={1} onChange={onScaleChange} value={scaleN} />
            </Col>
            <Col className="right">
              <div onClick={handleFullScreen} style={{fontSize: '16px',color: '#DE4A3C', lineHeight:'22px',cursor:'pointer'}}>
                <img alt="" style={{width: '22px'}} src={fullScreen}/>
                {isFull ? '退出全屏':'全屏'}
              </div>
            </Col>
          </Row>
          <div id="structureChartDown" style={{width: '100%', display: 'block', margin:'auto'}}>
          </div>
        </Spin>
      </div>
    );
  }