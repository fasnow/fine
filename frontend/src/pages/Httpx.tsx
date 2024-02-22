import React, {useEffect, useRef, useState} from 'react';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import TextArea from "antd/es/input/TextArea";
import {Button, Input, InputNumber, Select, Space} from "antd";
import "@/pages/Httpx.css"
import {GetHttpx, SaveHttpx} from "../../wailsjs/go/config/Config";
import {OpenFileDialog} from "../../wailsjs/go/runtime/Runtime";
import {errorNotification} from "@/component/Notification";
import {Run, Stop} from "../../wailsjs/go/httpx/Bridge";
import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";
import {SyncOutlined} from "@ant-design/icons";
import {Terminal} from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit'
import {Get} from "../../wailsjs/go/event/Event";
import {range} from "d3";
import Compact from "antd/es/space/Compact";
import {current} from "@reduxjs/toolkit";

const Httpx = () => {
    const [path,setPath] = useState<string>("")
    const [flags,setFlags] = useState<string>("")
    const [inputFlag,setInputFlag] = useState<string>("")
    const [output,setOutput] = useState<string>("")
    const [running,setRunning] = useState<boolean>(false)
    const [targets,setTargets] = useState<string>("")
    const terminalRef = useRef<Terminal>(new Terminal());
    const fitAddon = useRef<FitAddon>(new  FitAddon());
    const urls = useRef<string[]>([])
    const [total,setTotal] = useState<number>(0)
    const [start,setStart] = useState<number>(1)
    const [length,setLength] = useState<number>(15)

    useEffect(() => {
        //设置终端格式
        if (terminalRef.current) {
            const elem = document.getElementById('output')
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
                setInputFlag(result.inputFlag)
            }
        )
        //获取事件类的单例并设置httpx输出监听器用于输出到前端
        Get().then(
            result=>{
                EventsOn(String(result.httpxOuput),(value)=>{
                    //将终端中的链接转为超链接实现可以点击打开浏览器
                    const urlRegex = /https?:\/\/\S+/g;
                    let match;
                    let resultString = value;
                    while ((match = urlRegex.exec(value)) !== null) {
                        const matchedUri = match[0];
                        const replacement = `\x1b]8;;${matchedUri}\x07${matchedUri}\x1b]8;;\x07`;
                        resultString = resultString.replace(matchedUri, replacement);
                        urls.current.push(matchedUri)
                        setTotal(urls.current.length)
                    }
                    terminalRef.current && terminalRef.current.writeln(resultString)
                })
                EventsOn(String(result.httpxOuputDone),()=>{
                    setRunning(false)
                    terminalRef.current && terminalRef.current.write("$$$ Finished")
                    console.log(urls.current)
                })
            }
        )
    }, []);

    const saveHttpx=()=>{
        SaveHttpx({path:path,flags:flags,inputFlag:inputFlag})
    }

    const setHttpxPath=()=>{
        OpenFileDialog().then(
            result=>{
                if(result){
                    setPath(result)
                    SaveHttpx({path:result  ,flags:flags,inputFlag:inputFlag})
                }
            }
        ).catch(
            err=>{
                errorNotification("错误",err)
            }
        )
    }

    const exec=()=>{
        urls.current=[]
        setTotal(0)
        setStart(1)
        setLength(length)
        Run(path,flags,inputFlag,targets).then(r => setRunning(true)).catch(err=> {
            errorNotification("错误", err)
            setRunning(false)
        })
    }

    const stop=()=>{
        Stop().then(r => setRunning(false)).catch(err=> {
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
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div style={{display:"flex",justifyContent:"center",gap:"10px"}}>
                <span>Httpx路径</span>
                <Input value={path} size={"small"} style={{width:"400px"}}
                       onChange={e=>setPath(e.target.value)}
                       onBlur={saveHttpx}
                />
                <Button size={"small"} onClick={setHttpxPath}>选择</Button>
                <span>程序参数</span>
                <Input value={flags} size={"small"} style={{width:"200px"}}
                       onChange={e=>setFlags(e.target.value)}
                       onBlur={saveHttpx}
                />
                <span>输入参数</span>
                <Input value={inputFlag} size={"small"} style={{width:"80px"}}
                       onChange={e=>setInputFlag(e.target.value)}
                       onBlur={saveHttpx}
                />
                {!running && <Button size={"small"} onClick={exec}>执行</Button>}
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
            <div style={{height:"calc(100vh - 140px)"}}>
                <Allotment onChange={()=>fitAddon.current.fit()} >
                    <Allotment.Pane preferredSize={"300"}  className={"httpx-left"}>
                        <TextArea  value={targets} size={"small"} placeholder={"每行一个"} autoSize style={{maxHeight:"calc(100vh - 120px)"}}
                                   onChange={e=>setTargets(e.target.value)}
                        />
                    </Allotment.Pane>
                    <Allotment.Pane  className={"httpx-right"}>
                        {/*<TextArea value={output} autoSize style={{maxHeight:"calc(100vh - 120px)"}}*/}
                        {/*          onChange={e=>setOutput(e.target.value)}*/}
                        {/*/>*/}
                            <div id="output" style={{height:"calc(100vh - 130px)"}}/>
                    </Allotment.Pane>
                </Allotment>
            </div>
        </div>

    );
};

export default Httpx;
