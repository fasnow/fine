import React, {useEffect, useRef, useState} from 'react';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import TextArea from "antd/es/input/TextArea";
import {Button, Input} from "antd";
import "@/pages/Httpx.css"
import {GetHttpx, SaveHttpx} from "../../wailsjs/go/config/Config";
import {Simulate} from "react-dom/test-utils";
import reset = Simulate.reset;
import {OpenFileDialog} from "../../wailsjs/go/runtime/Runtime";
import {errorNotification} from "@/component/Notification";
import * as child_process from "child_process";
import {Run, Stop} from "../../wailsjs/go/httpx/Bridge";
import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";
import {SyncOutlined} from "@ant-design/icons";
import {ILinkHandler, Terminal} from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit'
import * as xterm from "xterm";

const Httpx = () => {
    const [path,setPath] = useState<string>("")
    const [flags,setFlags] = useState<string>("")
    const [inputFlag,setInputFlag] = useState<string>("")
    const [output,setOutput] = useState<string>("")
    const [running,setRunning] = useState<boolean>(false)
    const [targets,setTargets] = useState<string>("")
    const terminalRef = useRef<Terminal>(new Terminal());
    const fitAddon = useRef<FitAddon>(new  FitAddon());
    useEffect(() => {
        if (terminalRef.current) {
            const elem = document.getElementById('output')
            if(elem){
                terminalRef.current.open(elem);
                terminalRef.current.loadAddon(fitAddon.current)
                terminalRef.current.options.linkHandler={
                    activate: (event, text, range)=> BrowserOpenURL(text)
                }
                fitAddon.current.fit()
                window.addEventListener("resize", ()=>{
                    fitAddon.current.fit()
                })
            }
        }
        GetHttpx().then(
            result=>{
                setPath(result.path)
                setFlags(result.flags)
                setInputFlag(result.inputFlag)
            }
        )
        EventsOn("httpx",(value)=>{
            const urlRegex = /https?:\/\/\S+/g;
            let match;
            let resultString = value;
            while ((match = urlRegex.exec(value)) !== null) {
                const matchedUri = match[0];
                const replacement = `\x1b]8;;${matchedUri}\x07${matchedUri}\x1b]8;;\x07`;
                resultString = resultString.replace(matchedUri, replacement);
            }
            terminalRef.current && terminalRef.current.writeln(resultString)
        })
        EventsOn("httpxDone",()=>{
            setRunning(false)
            terminalRef.current && terminalRef.current.write("$$$ Finished")
        })
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

            <div style={{height:"calc(100vh - 120px)"}}>
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
                        <div id="output" style={{height:"calc(100vh - 120px)"}}/>
                    </Allotment.Pane>
                </Allotment>
            </div>
        </div>

    );
};

export default Httpx;
