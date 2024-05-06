import React, {ReactNode, useEffect, useRef, useState} from 'react';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import TextArea from "antd/es/input/TextArea";
import {Button, Popover, Tabs} from "antd";
import "@/pages/Domain2IP.css"
import {GetDNS, SaveDNS} from "../../wailsjs/go/config/Config";
import {errorNotification} from "@/component/Notification";

import {EventsOn} from "../../wailsjs/runtime";
import {SyncOutlined} from "@ant-design/icons";
import {Terminal} from 'xterm';
import 'xterm/css/xterm.css';
import {GetAllEvents} from "../../wailsjs/go/event/Event";
import {GetDetail, Stop} from "../../wailsjs/go/domain2ip/Bridge";

const TabContent=()=>{
    const [output,setOutput] = useState<string>("")
    const [targets,setTargets] = useState<string>("")
    const taskID = useRef<number>(0)
    const [running,setRunning] = useState<boolean>(false)
    useEffect(() => {
        GetAllEvents().then(
            result=>{
                EventsOn(String(result.domain2IPOutput),(result)=>{
                    console.log(2,result.taskID)
                    if(result.taskID==taskID.current){
                        if(result.error){
                            setOutput(pre=>pre+result.error+"\n")
                        }else if(result.message){
                            setOutput(pre=>pre+result.message+"\n")
                        }else if(result.data){//输出整理C段的信息
                            const temp:string[] = []
                            for (const dataKey in result.data) {
                                temp.push(`C段: ${dataKey} 数量: ${result.data[dataKey]}`)
                            }
                            setOutput(pre=>pre+`${temp.join("\n")}\n`)
                        }else {//输出过程信息
                            const ips:string[] = []
                            result.ips?.map((v:any)=>{
                                const temp:string[] = []
                                temp.push(v.addr)
                                v.provider && temp.push(v.provider)
                                v.country && temp.push(v.country)
                                v.area && temp.push(v.area)
                                ips.push(temp.join("/"))
                            })
                            setOutput(pre=>pre+`${result.domain}    IsCDN: ${result.isCDN}    CNAME: ${result.cnames || ""}    IP: ${ips.join(", ")}\n`)
                        }
                    }
                })
                EventsOn(String(result.domain2IPDown),(result)=>{
                    console.log(3,result.taskID)
                    if(result.taskID && result.taskID == taskID.current ){
                        setRunning(false)
                    }
                })
            }
        )
    }, []);

    const run=()=>{
        GetDetail(targets.split("\n")).then(
            r=> {
                taskID.current = r
                console.log(1,r)
                setRunning(true)
            }
        )
    }

    const stop=()=>{
        Stop(taskID.current).catch(
            e=>errorNotification("错误",e)
        ).then(
            ()=> {
                taskID.current = 0
                setRunning(false)
            }
        )
    }

    return (
        <div style={{
            display:"flex",
            flexDirection:"column",
            height:"calc(100vh - 82px)",
            padding:"5px 0 5px 0",
        }}>
            <Allotment >
                <Allotment.Pane preferredSize={"250"}  className={"domain2ip-left"}>
                    {!running && <Button size={"small"} style={{width:"100%"}} onClick={run}>查询</Button>}
                    {running && <Button size={"small"} style={{width:"100%"}} onClick={stop} icon={<SyncOutlined spin={running}/>}>终止</Button>}
                    <TextArea
                        value={targets}
                        size={"small"}
                        placeholder={"每行一个\n识别结果仅供参考\n如果有更好的识别方法请欢迎提出\n尽量不使用第三方网站识别cdn"}
                        style={{height:"100%"}}
                        onChange={e=>setTargets(e.target.value)}
                    />
                </Allotment.Pane>
                <Allotment.Pane  className={"domain2ip-right"}>
                    <TextArea
                        wrap={"off"}
                        value={output}
                        size={"small"}
                        style={{height:"100%"}}
                        onChange={e=>setOutput(e.target.value)}
                    />
                </Allotment.Pane>
            </Allotment>
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

const Domain2IP =()=>{
    const [activeKey,setActiveKey]=useState<string>("1")
    const [items,setItems]=useState<TabType[]>([])
    const newTabIndex=useRef<number>(0)
    const [dns,setDNS] = useState<string>("")
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
        <div style={{
            display:"flex",
            flexDirection:"column",
            justifyContent:"center",
            width:"100%",
            rowGap:"5px",
            padding:"5px"
        }}>

            <Tabs
                size="small"
                type="editable-card"
                tabBarExtraContent={{
                    left:
                        <Popover
                            content={
                            <div style={{
                                display:"flex",
                                justifyContent:"center",
                                width:"100%"
                            }}>
                                <TextArea
                                    size={"small"}
                                    value={dns}
                                    rows={10}
                                    onChange={e=>setDNS(e.target.value)}
                                    onBlur={()=>{
                                        SaveDNS({value:dns.split("\n")})
                                            .catch(e=>errorNotification("错误","保存失败:"+e))
                                }}/>
                            </div>}
                            onOpenChange={(open)=>{
                                if(open){
                                    GetDNS().then(r=>{
                                        setDNS(r.value.join(","))
                                    })
                                }
                            }}
                            title="每行一个"
                            trigger="click"
                            placement={"bottomRight"}
                        >
                            <Button size={"small"} type={"text"}>DNS设置</Button>
                        </Popover>


                }}
                onChange={onTabChange}
                activeKey={activeKey}
                onEdit={onEditTab}
                items={items}
            />
        </div>
    );
}


export default Domain2IP;
