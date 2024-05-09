import React, {ReactNode, useEffect, useRef, useState} from 'react';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import TextArea from "antd/es/input/TextArea";
import {Button, Checkbox, Divider, Input, InputNumber, message, Select, Space, Tabs, Tooltip} from "antd";
import "@/pages/Httpx.css"
import {GetHttpx, SaveHttpx} from "../../wailsjs/go/config/Config";
import {OpenFileDialog} from "../../wailsjs/go/runtime/Runtime";
import {errorNotification} from "@/component/Notification";

import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";
import {SyncOutlined} from "@ant-design/icons";
import {Terminal} from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit'
import {GetAllEvents} from "../../wailsjs/go/event/Event";
import {Run, Stop} from "../../wailsjs/go/httpx/Bridge";
import {useDispatch, useSelector} from "react-redux";
import {RootState, setHttpx} from "@/store/store";
const TabContent=()=>{
    const [path,setPath] = useState<string>("")
    const [flags,setFlags] = useState<string>("")
    const [running,setRunning] = useState<boolean>(false)
    const [targets,setTargets] = useState<string>("")
    const terminalRef = useRef<Terminal>(new Terminal({
        scrollback: 99999, // 增加滚动缓冲区大小
    }));
    const fitAddon = useRef<FitAddon>(new  FitAddon());
    const urls = useRef<string[]>([])
    const [total,setTotal] = useState<number>(0)
    const [start,setStart] = useState<number>(1)
    const [length,setLength] = useState<number>(15)
    const [messageApi, contextHolder] = message.useMessage();
    const taskID = useRef<number>(0)
    const outputRef = useRef<HTMLDivElement>(null)
    const httpxConfig = useSelector((state: RootState) => state.config.httpx)
    const dispatch = useDispatch()

    useEffect(() => {
        //设置终端格式
        if (terminalRef.current) {
            //全选、复制
            terminalRef.current.onKey(e => {
                if (e.domEvent.ctrlKey && e.domEvent.key === 'c' && terminalRef.current.hasSelection()) {
                    navigator.clipboard.writeText(terminalRef.current.getSelection())
                    messageApi.success("复制成功", 0.5)
                    e.domEvent.preventDefault()
                }else if(e.domEvent.ctrlKey && e.domEvent.key === 'a' ){
                    terminalRef.current.selectAll()
                    navigator.clipboard.writeText(terminalRef.current.getSelection())
                    messageApi.success("复制成功", 0.5)
                    e.domEvent.preventDefault()
                }
            })

            const elem = outputRef.current
            if(elem){
                terminalRef.current.open(elem);
                terminalRef.current.loadAddon(fitAddon.current)
                terminalRef.current.options.linkHandler={
                    activate: (event, text, range)=> {
                        BrowserOpenURL(text)
                    }
                }
                fitAddon.current.fit()
                window.addEventListener("resize", ()=>{
                    fitAddon.current.fit()
                })
            }

        }

        //设置httpx配置
        GetHttpx().then(
            result=>{
                setPath(result.path)
                setFlags(result.flags)
                dispatch(setHttpx({path:result.path,flags:result.flags}))
            }
        )

        //获取事件类的单例并设置httpx输出监听器用于输出到前端
        GetAllEvents().then(
            result=>{
                EventsOn(String(result.httpxOutput),(value)=>{
                    if (!value.taskID || value.taskID != taskID.current){
                        return
                    }
                    const data = value.data
                    console.log(data)

                    //将终端中的链接转为超链接实现可以点击打开浏览器
                    const urlRegex = /https?:\/\/\S+/g;
                    let match;
                    let resultString = data;
                    while ((match = urlRegex.exec(data)) !== null) {
                        const matchedUri = match[0];
                        const replacement = `\x1b]8;;${matchedUri}\x07${matchedUri}\x1b]8;;\x07`;
                        resultString = resultString.replace(matchedUri, replacement);
                        urls.current.push(matchedUri)
                        setTotal(urls.current.length)
                    }
                    terminalRef.current && terminalRef.current.writeln(resultString)
                })
                EventsOn(String(result.httpxOutputDone),(value)=>{
                    if (!value.taskID || value.taskID != taskID.current){
                        return
                    }
                    taskID.current=0
                    setRunning(false)
                    terminalRef.current && terminalRef.current.write("$$$ Finished")
                    terminalRef.current && terminalRef.current.write("")
                    console.log(urls.current)
                })
            }
        )
    }, []);

    useEffect(()=>{
        setPath(httpxConfig.path)
        setFlags(httpxConfig.flags)
    },[httpxConfig])

    const saveHttpx=()=>{
        SaveHttpx({path:path,flags:flags})
        dispatch(setHttpx({path:path,flags:flags}))
    }

    const setHttpxPath=()=>{
        OpenFileDialog().then(
            result=>{
                if(result){
                    setPath(result)
                    SaveHttpx({path:result,flags:flags})
                    dispatch(setHttpx({path:result,flags:flags}))
                }
            }
        ).catch(
            err=>{
                errorNotification("错误",err)
            }
        )
    }

    const run=()=>{
        urls.current=[]
        setTotal(0)
        setStart(1)
        setLength(length)
        Run(path,flags,targets).then(r => {
            taskID.current=r
            setRunning(true)
        }).catch(err=> {
            errorNotification("错误", err)
            setRunning(false)
        })
    }

    const stop=()=>{
        Stop(taskID.current).then(r => {
            taskID.current=0
            setRunning(false)
        }).catch(err=> {
            errorNotification("错误", err)
        })
    }

    const BrowserOpenMultiUrl=()=>{
        if(!urls.current || urls.current.length==0)return
        for (const url of urls.current.slice(start-1, start-1+length)) {
            BrowserOpenURL(url)
        }
        const nextStart = start+length
        setLength(nextStart>urls.current.length?0:length)
        setStart(nextStart>urls.current.length?urls.current.length:nextStart)
    }

    return (
        <div style={{display:"flex",flexDirection:"column",gap:"10px",height:"calc(100vh - 80px)"}}>
            {contextHolder}
            <div style={{display:"flex",justifyContent:"center",gap:"10px"}}>
                <span style={{display:"flex",gap:"5px"}}>
                    <span>Httpx路径</span>
                    <Space.Compact>
                        <Input value={path} size={"small"} style={{width:"400px"}}
                               onChange={e=>setPath(e.target.value)}
                               onBlur={saveHttpx}
                        />
                        <Button size={"small"} onClick={setHttpxPath}>选择</Button>
                    </Space.Compact>
                </span>
                <span style={{display:"flex",gap:"5px"}}>
                    <span>程序参数</span>
                    <Tooltip title={"请勿添加-l或-u"} placement={"bottom"}>
                        <Input value={flags} size={"small"} style={{width:"200px"}}
                               onChange={e=>setFlags(e.target.value)}
                               onBlur={saveHttpx}
                        />
                    </Tooltip>
                </span>
                {!running && <Button size={"small"} onClick={run}>执行</Button>}
                {running && <Button size={"small"} onClick={stop} icon={<SyncOutlined spin={running}/>}>终止</Button>}
            </div>
            <Space style={{display:"flex",justifyContent:"center"}} size={20}>
                <Space.Compact size={"small"}>
                    <InputNumber style={{width:"150px"}} prefix={<div>总数:</div>} value={total}/>
                    <InputNumber style={{width:"150px"}} prefix={<div>起始:</div>} min={1} value={start} onChange={(value)=>value&&setStart(value)} />
                    <InputNumber style={{width:"150px"}} prefix={<div>长度:</div>} value={length} onChange={(value)=>value&&setLength(value)}/>
                    <Button onClick={BrowserOpenMultiUrl}>默认浏览器打开下一组</Button>
                </Space.Compact>
                <Button size={"small"} onClick={()=>terminalRef.current.reset()}>清空终端</Button>
            </Space>
            {/*<div style={{justifyContent:"center",display:"flex"}}>*/}
            {/*    */}
            {/*</div>*/}
            <div style={{height:"calc(100%)"}}>
                <Allotment onChange={()=>fitAddon.current.fit()} >
                    <Allotment.Pane preferredSize={"350"}  className={"httpx-left"}>
                        <TextArea  value={targets} size={"small"} placeholder={"每行一个"} autoSize style={{maxHeight:"100%"}}
                                   onChange={e=>setTargets(e.target.value)}
                        />
                    </Allotment.Pane>
                    <Allotment.Pane  className={"httpx-right"}>
                        {/*<TextArea value={output} autoSize style={{maxHeight:"calc(100vh - 120px)"}}*/}
                        {/*          onChange={e=>setOutput(e.target.value)}*/}
                        {/*/>*/}
                        <div ref={outputRef} style={{height:"100%"}}/>
                    </Allotment.Pane>
                </Allotment>
            </div>
        </div>
    );
}

type TabType = {
    label: string,
    key: string,
    children: ReactNode,
    closable?: boolean
}

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const Httpx =()=>{
    const [activeKey,setActiveKey]=useState<string>("1")
    const [items,setItems]=useState<TabType[]>([])
    const newTabIndex=useRef<number>(0)

    useEffect(() => {
        const newActiveKey = `${++newTabIndex.current}`;
        setItems([
            {
                label: newActiveKey,
                key: newActiveKey,
                children: <TabContent />,
            }
        ],)
    }, []);


    const onTabChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey)
    };

    const addTab = (input: string) => {
        const newActiveKey = `${++newTabIndex.current}`;
        setItems([...items, {
            label: newActiveKey,
            key: newActiveKey,
            children: <TabContent />,
        }]);
        setActiveKey(newActiveKey);
    };

    const removeTab = (targetKey: TargetKey) => {
        const targetIndex = items.findIndex((pane) => pane.key === targetKey);
        const newPanes = items.filter((pane) => pane.key !== targetKey);
        if (newPanes.length && targetKey === activeKey) {
            const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex];
            setActiveKey(key);
        }
        setItems(newPanes);
    };

    const onEditTab = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            addTab("");
        } else {
            removeTab(targetKey);
        }
    };

    return (
        <Tabs
            size="small"
            type="editable-card"
            onChange={onTabChange}
            activeKey={activeKey}
            onEdit={onEditTab}
            items={items}
        />
    );
}


export default Httpx;
