
import React, {useEffect, useRef, useState} from 'react';
import {Button, Input, Popconfirm, Space, Spin, Tooltip, Tree} from 'antd';
import type { GetProps, TreeDataNode } from 'antd';
import {FolderOpenOutlined,FileZipFilled} from "@ant-design/icons";
import {Join} from "../../../wailsjs/go/runtime/Path";
import {Allotment} from "allotment";
import TextArea from "antd/es/input/TextArea";
import {FitAddon} from "xterm-addon-fit";
import "@/pages/wechat/Wechat.css"
import {EventsOn} from "../../../wailsjs/runtime";
import {GetAllEvents} from "../../../wailsjs/go/event/Event";
import {GetPlatform, OpenDirectoryDialog, OpenFolder} from "../../../wailsjs/go/runtime/Runtime";
import {GetWechat, GetWechatDataPath, SaveWechat} from "../../../wailsjs/go/config/Config";
import {wechat} from "../../../wailsjs/go/models";
import {errorNotification} from "@/component/Notification";
import {
    ClearApplet,
    ClearDecompiled,
    Decompile,
    GetAllMiniProgram,
} from "../../../wailsjs/go/wechat/Bridge";
type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

export const MiniProgram: React.FC = () => {
    const [treeData,setTreeData] = useState<TreeDataNode[]>([])
    const [height,setHeight] = useState<number>(0)
    const fitAddon = useRef<FitAddon>(new  FitAddon());
    const [decompileResult,setDecompileResult] = useState<string>("")
    const [wxId,setWxId]=useState<string>("")
    const [version,setVersion]=useState<string>("")
    const [appletPath,setAppletPath]=useState<string>("")
    const dataCachePath = useRef<string>("")
    const [platform,setPlatform] = useState<string>("")
    const timer = useRef<any>()
    const [auto,setAuto] = useState<boolean>(false)
    const autoRef = useRef<boolean>(false) //直接在定时任务当中无法调用auto更新后的值，只能用ref
    const [isClearing,setIsClearing] = useState<boolean>(false)
    useEffect(() => {
        GetPlatform().then(
            r=>setPlatform(r)
        )
        const handleResize = ()=>{
            setHeight(window.innerHeight-144)
        }
        window.addEventListener('resize',handleResize );
        handleResize()
        GetAllEvents().then((result)=>{
            //获取反编译输出
            EventsOn(String(result.decompileWxMiniProgram),(data)=>{
                setDecompileResult((pre)=>pre+data)
            })

            //反编译完成后重绘列表
            EventsOn(String(result.decompileWxMiniProgramDone),(data)=>{
                setDecompileResult((pre)=>pre+data)
                GetAllMiniProgram().then(
                    result=>{
                        resetTreeData(result)
                    }
                )
            })
        })
        GetWechat().then(
            result=>{
                setAppletPath(result.applet)
            }
        )
        GetWechatDataPath().then(
            result=>{
                dataCachePath.current = result
            }
        )

        //自动获取新的
        const temp = setTimeout(()=>{
            GetAllMiniProgram().then(
                result=>{
                    scheduledTask(result)
                }
            )
            timer.current = setInterval(()=>{
                    GetAllMiniProgram().then(
                        result=>{
                            scheduledTask(result)
                        }
                    )
                }
                ,3000)//3秒更新一次
            clearTimeout(temp);
        },0)
    }, []);

    const scheduledTask=(items:any)=>{
        //是否自动反编译没有被反编译的
        if(autoRef.current){
            const unpackedItems: wechat.MiniProgram[] = []
            for (let i=0;i< items.length;i++) {
                let item = items[i]
                const versions:wechat.Version[] = []
                for (let j=0;j< item.versions.length;j++) {
                    let version = item.versions[j]
                    if(!version.unpacked){
                        versions.push(version)
                    }
                }
                let temp = {versions:versions.slice()}//必须这样不然会修改到原数组
                temp.versions = versions
                if(temp.versions && temp.versions.length>0){
                    unpackedItems.push(item)
                }
            }
            if(unpackedItems.length>0){
                decompile(unpackedItems)
            }
        }

        resetTreeData(items)
    }

    const resetTreeData=(items:wechat.MiniProgram[])=>{
        const data = []
        for (const item of items) {
            data.push({
                title: <Space size={10} style={{display:"inline-flex",justifyContent:"space-between"}}>
                    <span>{item.app_id}</span>
                    <span>{item.update_date}</span>
                </Space>,
                key: item.app_id,
                children: [
                    ...item.versions.map(d=>{
                        return {
                            title: <Space size={10} style={{display:"inline-flex",justifyContent:"space-between"}}>
                                <Space size={10}><FolderOpenOutlined />
                                    <span>{d.number}</span>
                                    <span>{d.update_date}</span>
                                </Space>
                                <a onClick={(e) => {
                                    const items:wechat.MiniProgram[] = []
                                    // @ts-ignore
                                    const versions:wechat.Version[]=[{number:d.number}]
                                    // @ts-ignore
                                    items.push({
                                        app_id: item.app_id, update_date: "", versions:versions
                                    })
                                    decompile(items)
                                }}>
                                    反编译
                                </a>
                                <Tooltip title={d.unpacked?"已反编译":"未反编译"} color={"cyan"} placement={"bottom"}>
                                    <FileZipFilled style={{color:d.unpacked?"green":""}}/>
                                </Tooltip>
                            </Space>,
                            key: item.app_id+":"+d.number,
                        }
                    })
                ],
            })
        }
        setTreeData(data)
    }

    const decompile=(items:wechat.MiniProgram[])=>{
        console.log(items)
        Decompile(items)
    }

    const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
        console.log('Trigger Select', keys, info);
        const path = info.node.key.toString().split(":",2)
        setWxId(path[0])
        setVersion(path[1])
    };

    const configAppletPath=()=>{
        OpenDirectoryDialog().then(
            result=>{
                if(result){
                    SaveWechat({applet:result}).then(
                        ()=> {
                            setAppletPath(result)
                            GetAllMiniProgram().then(
                                result=>{
                                    scheduledTask(result)
                                }
                            )
                        }
                    )
                }
            }
        )
    }

    const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
        console.log('Trigger Expand', keys, info);
    };

    return (
        <div style={{
            position: "relative",
        }}>
            {
                platform != "windows" && <div
                    style={{
                        position: "fixed",
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                        margin:"0px",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(242, 242, 242, 0.5)", /* 半透明背景颜色 */
                        zIndex: 999, /* 确保覆盖整个页面内容 */
                        fontSize:"20px",
                        color:"rgba(72, 72, 72,0.5)"
                    }}
                >暂只支持Windows平台</div>
            }
            <div
                style={{
                    padding:"0 10px",
                    display:"flex",
                    justifyContent:"center",
                    flexDirection:"column",
                    gap:"10px",
                    height:"calc(100vh - 24px)"
                }}
            >
                <Space.Compact style={{justifyContent:"center"}}>
                    <Input style={{width:"600px",}} size={'small'} prefix={<>微信Applet路径</>} value={appletPath} />
                    <Button size={"small"} onClick={configAppletPath}>选择</Button>
                    {
                        auto?
                            < Button size={"small"} onClick={()=> {
                                setAuto(false)
                                autoRef.current=false
                            }} style={{backgroundColor:"red",color:"white"}}>停用自动反编译</Button>
                            :
                            < Button size={"small"} onClick={()=> {
                                setAuto(true)
                                autoRef.current=true
                            }} style={{backgroundColor:"green",color:"white"}}>启用自动反编译</Button>
                    }
                    <Popconfirm
                        placement="bottom"
                        title={"删除"}
                        description={<>确认删除Applet目录下的所有文件吗?<br/>
                            (会同时删除反编译后的所有文件)</>}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={()=>{
                            setIsClearing(true)
                            ClearApplet().catch(
                                err=>errorNotification("错误",err)
                            ).then(()=>setTreeData([])).finally(
                                ()=>{
                                    setIsClearing(false)
                                }
                            )
                        }}
                    >
                        <Button size={"small"} >清空Applet目录</Button>
                    </Popconfirm>
                    <Popconfirm
                        placement="bottom"
                        title={"删除"}
                        description={"确认删除所有反编译后的文件吗?"}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={()=>{
                            setIsClearing(true)
                            ClearDecompiled().catch(
                                err=>errorNotification("错误",err)
                            ).then(()=>setTreeData([])).finally(
                                ()=>setIsClearing(false)
                            )
                        }}
                    >
                        <Button size={"small"} >清空反编译后的文件</Button>
                    </Popconfirm>
                </Space.Compact>
                <Button size={"small"} type={"text"}>建议先执行清空Applet目录以避免无法回溯是哪个小程序</Button>
                <div style={{height:"100%"}}>
                    <Allotment onChange={()=>fitAddon.current.fit()} >
                        <Allotment.Pane preferredSize={"350"}  className={"wechat-left"} >
                            <div >
                                <Spin spinning={isClearing}>
                                    <Tree
                                        expandAction={false}
                                        height={height}
                                        defaultExpandAll
                                        onSelect={onSelect}
                                        onExpand={onExpand}
                                        treeData={treeData}
                                    />
                                </Spin>
                            </div>
                        </Allotment.Pane>
                        <Allotment.Pane  className={"wechat-right"}>
                            <div style={{
                                position:"static",
                                margin:"10px",
                                display:"flex",
                                // justifyContent:"center",
                                flexDirection:"column",
                                // alignItems:"center",
                                gap:10,
                                gridAutoFlow:'column',
                                height:"calc(100%)"
                            }}>
                                <Button size={"small"} onClick={
                                    async () => {
                                        OpenFolder(await Join([dataCachePath.current, wxId, version]))
                                    }
                                }>打开反编译后的文件夹</Button>
                                <TextArea
                                    value={decompileResult}
                                    onChange={(e)=>setDecompileResult(e.target.value)}
                                    style={{maxHeight:"calc(100% - 80px)",flex: 1}}
                                />
                            </div>
                        </Allotment.Pane>
                    </Allotment>
                </div>
            </div>
        </div>
    );
};