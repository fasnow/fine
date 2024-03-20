
import React, {useEffect, useRef, useState} from 'react';
import {Button, Dropdown, Input, MenuProps, message, Popconfirm, Space, Spin, Tooltip, Tree} from 'antd';
import type { GetProps, TreeDataNode } from 'antd';
import {FolderOpenOutlined,FileZipFilled} from "@ant-design/icons";
import {GetAbsSubDirByDir, Join, RemoveAll} from "../../../wailsjs/go/runtime/Path";
import {Allotment} from "allotment";
import TextArea from "antd/es/input/TextArea";
import {FitAddon} from "xterm-addon-fit";

import {EventsOn} from "../../../wailsjs/runtime";
import {GetAllEvents} from "../../../wailsjs/go/event/Event";
import {GetPlatform, OpenDirectoryDialog, OpenFolder} from "../../../wailsjs/go/runtime/Runtime";
import {GetAll, GetDataBaseDir, GetWechat, SaveWechat} from "../../../wailsjs/go/config/Config";
import {wechat} from "../../../wailsjs/go/models";
import {errorNotification} from "@/component/Notification";
import Icon from "antd/es/icon";
import {ClearApplet, Decompile, GetAllMiniProgram, Test1, Test2} from "../../../wailsjs/go/wechat/Bridge";
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

    useEffect(() => {
        GetPlatform().then(
            r=>setPlatform(r)
        )
        const handleResize = ()=>{
            setHeight(window.innerHeight-124)
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
                setAppletPath(result.appletPath)
                dataCachePath.current = result.dataCachePath
            }
        )
    }, []);

    useEffect(()=>{
        if(appletPath?.length>0){
            //先清除前一个再重新设置
            if(timer.current){
                clearInterval(timer.current);
            }
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
            return
        }
        if(timer.current){
            clearInterval(timer.current);
        }
    },[appletPath])

    const scheduledTask=(items:any)=>{
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
            let temp = JSON.parse(JSON.stringify(item))//必须要这样不然verisons字段会变空，不知道是wails原因还是js原因，花了一天解决...
            temp.versions = versions
            if(temp.versions && temp.versions.length>0){
                unpackedItems.push(item)
            }
        }
        // //反编译没有被反编译的
        if(unpackedItems.length>0){
            decompile(unpackedItems)
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
                    SaveWechat({appletPath:result,dataCachePath:dataCachePath.current}).then(
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
                    position:"relative",
                    padding:"0 10px",
                    display:"flex",
                    justifyContent:"center",
                    flexDirection:"column",
                    gap:"10px"
                }}>

                <Space.Compact style={{justifyContent:"center"}}>
                    <Input style={{width:"600px",}} size={'small'} prefix={<>微信Applet路径</>} value={appletPath} />
                    <Button size={"small"} onClick={configAppletPath}>选择</Button>
                    <Popconfirm
                        placement="bottom"
                        title={"删除"}
                        description={"确认删除Applet目录下的所有文件吗?"}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={()=>{
                            ClearApplet().catch(
                                err=>errorNotification("错误",err)
                            ).finally(
                                ()=>{
                                    GetAllMiniProgram().then(
                                        result=>{
                                            scheduledTask(result)
                                        }
                                    )
                                }
                            )
                        }}
                    >
                        <Button size={"small"} >清空Applet目录</Button>
                    </Popconfirm>
                </Space.Compact>
                <Button size={"small"} type={"text"}>建议先执行清空Applet目录以避免无法回溯是哪个小程序</Button>
                <div style={{height:"calc(100vh - 100px)"}}>
                    <Allotment onChange={()=>fitAddon.current.fit()} >
                        <Allotment.Pane preferredSize={"350"}  className={"httpx-left"}>
                            <div >
                                <Tree
                                    expandAction={false}
                                    height={height}
                                    defaultExpandAll
                                    onSelect={onSelect}
                                    onExpand={onExpand}
                                    treeData={treeData}
                                />
                            </div>
                        </Allotment.Pane>
                        <Allotment.Pane  className={"httpx-right"}>
                            {/*<TextArea value={output} autoSize style={{maxHeight:"calc(100vh - 120px)"}}*/}
                            {/*          onChange={e=>setOutput(e.target.value)}*/}
                            {/*/>*/}
                            <div style={{
                                margin:"10px",
                                display:"flex",
                                justifyContent:"center",
                                flexDirection:"column",
                                gap:10

                            }}>
                                <Button size={"small"} onClick={
                                    async () => {
                                        OpenFolder(await Join([dataCachePath.current, wxId, version]))
                                    }
                                }>打开反编译后的文件夹</Button>
                                <TextArea
                                    value={decompileResult}
                                    onChange={(e)=>setDecompileResult(e.target.value)}
                                    rows={20}
                                />
                            </div>
                        </Allotment.Pane>
                    </Allotment>
                </div>
            </div>
        </div>
    );
};
