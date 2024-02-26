
import React, {useEffect, useRef, useState} from 'react';
import {Button, Dropdown, Input, MenuProps, message, Popconfirm, Space, Spin, Tree} from 'antd';
import type { GetProps, TreeDataNode } from 'antd';
import {FolderOpenOutlined} from "@ant-design/icons";
import {GetAbsSubDirByDir, Join, RemoveAll} from "../../../wailsjs/go/runtime/Path";
import {Allotment} from "allotment";
import TextArea from "antd/es/input/TextArea";
import {FitAddon} from "xterm-addon-fit";
import {Decompile, GetAppletSubDir} from "../../../wailsjs/go/wechat/Bridge";
import {EventsOn} from "../../../wailsjs/runtime";
import {GetAllEvents} from "../../../wailsjs/go/event/Event";
import {GetPlatform, OpenDirectoryDialog, OpenFolder} from "../../../wailsjs/go/runtime/Runtime";
import {GetAll, GetDataBaseDir, GetWechat, SaveWechat} from "../../../wailsjs/go/config/Config";
import {wechat} from "../../../wailsjs/go/models";
type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;


export const Wx: React.FC = () => {
    const [treeData,setTreeData] = useState<TreeDataNode[]>([])
    const [height,setHeight] = useState<number>(0)
    const fitAddon = useRef<FitAddon>(new  FitAddon());
    const [decompileResult,setDecompileResult] = useState<string>("")
    const [wxId,setWxId]=useState<string>("")
    const [version,setVersion]=useState<string>("")
    const [appletPath,setAppletPath]=useState<string>("")
    const dataCachePath = useRef<string>("")
    const [platform,setPlatform] = useState<string>("")

    useEffect(() => {
        GetPlatform().then(
            r=>setVersion(r)
        )
        const handleResite = ()=>{
            setHeight(window.innerHeight-100)
        }
        // 添加事件监听器
        window.addEventListener('resize',handleResite );
        handleResite()
        GetAppletSubDir().then(
            result=>{
                getAppletSubDir(result)
            }
        )
        GetWechat().then(
            result=>{
                console.log(result)
                setAppletPath(result.appletPath)
                dataCachePath.current = result.dataCachePath
            }
        )
    }, []);


    // GetAllEvents().then(
    //     result=>{
    //         EventsOn(String(result.decompileWxMiniProgram),(err)=>{
    //             setDecompileResult(decompileResult+err)
    //         })
    //     }
    // )

    const getAppletSubDir=(result:wechat.WxapkgInfo)=>{
        console.log(result)
        const subDirs = result.subDirs
        if(!subDirs || subDirs.length==0){
            setTreeData([])
            return
        }
        const data = []
        for (const dir of subDirs) {
            data.push({
                title: <Space size={10} style={{display:"inline-flex",justifyContent:"space-between"}}>
                    <span>{dir.path}</span>
                    <span>{dir.updateDate}</span>
                </Space>,
                key: dir.path,
                children: [
                    ...dir.subDirs?.map(d=>{
                        return {
                            title: <Space size={10} style={{display:"inline-flex",justifyContent:"space-between"}}>
                                <Space size={10}><FolderOpenOutlined />
                                    <span>{d.path}</span>
                                    <span>{d.updateDate}</span>
                                </Space>
                                <a onClick={(e) =>decompile(dir.path,d.path)}>
                                    反编译
                                </a>
                            </Space>,
                            key: dir.path+":"+d.path,
                        }
                    })
                ],
            })
        }
        setTreeData(data)
    }

    const decompile=(id:string,version:string)=>{
        setDecompileResult(pre=>pre+`开始反编译${id}/${version}...\n`)
        Decompile(id, version).catch(err=>setDecompileResult(pre=>pre+`${id}/${version}反编译完成\n`))
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
                            GetAppletSubDir().then(
                                result=>{
                                    getAppletSubDir(result)
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
                            console.log(111111111)
                            RemoveAll(appletPath,true).finally(()=>{
                                    GetAppletSubDir().then(
                                        result=>{
                                            getAppletSubDir(result)
                                        }
                                    )
                                }
                            )
                        }}
                    >
                        <Button size={"small"} >清空Applet目录</Button>
                    </Popconfirm>

                </Space.Compact>
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
