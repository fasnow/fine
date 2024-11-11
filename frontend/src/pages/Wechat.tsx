import React, {useEffect, useRef, useState} from 'react';
import type {GetProps} from 'antd';
import {Button, ConfigProvider, Flex, Input, List, Popconfirm, Popover, Space, Tag, Tooltip, Tree} from 'antd';
import {FileTextOutlined, FileZipOutlined, FolderOpenOutlined} from "@ant-design/icons";
import {Join} from "../../wailsjs/go/runtime/Path";
import {Allotment} from "allotment";
import TextArea from "antd/es/input/TextArea";
import "@/pages/Wechat.css"
import {Environment, EventsOn} from "../../wailsjs/runtime";
import {OpenDirectoryDialog, OpenFolder} from "../../wailsjs/go/runtime/Runtime";
import {
    GetWechat,
    GetWechatDataPath,
    GetWechatMatchRules,
    SaveWechat,
    SaveWechatMatchRules
} from "../../wailsjs/go/config/Config";
import {wechat} from "../../wailsjs/go/models";
import {errorNotification} from "@/component/Notification";
import {
    ClearApplet,
    ClearDecompiled,
    Decompile,
    GetAllMiniProgram,
    GetMatchedString,
} from "../../wailsjs/go/wechat/Bridge";
import {DecompileIcon} from "@/component/Icon";
import {GetAllEvents} from "../../wailsjs/go/constraint/Event";
import InfoToFront = wechat.InfoToFront;

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

export const MiniProgram: React.FC = () => {
    const [data, setData] = useState<InfoToFront[]>([])
    const [select, setSelect] = useState<{ appid: string, version: string, nickname: string }>()
    const [decompileResult, setDecompileResult] = useState<string>("")
    const [matchedResult, setMatchedResult] = useState<string>("")
    const appIdRef = useRef<string>("")
    const versionRef = useRef<string>("")
    const [appletPath, setAppletPath] = useState<string>("")
    const dataCachePath = useRef<string>("")
    const [platform, setPlatform] = useState<string>("")
    const timer = useRef<any>()
    const [autoDecompile, setAutoDecompile] = useState<boolean>(false)
    const autoRef = useRef<boolean>(false) //直接在定时任务当中无法调用auto更新后的值，只能用ref
    const [isClearing, setIsClearing] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const [rules, setRules] = useState<string>("")
    useEffect(() => {
        Environment().then(
            r => {
                setPlatform(r.platform)
            }
        )
        GetAllEvents().then((result) => {
            //获取反编译输出
            EventsOn(String(result.decompileWxMiniProgram), (data) => {
                _setDecompileResult(data)
            })

            //获取提取内容输出
            EventsOn(String(result.extractWxMiniProgramInfoOutput), (data) => {
                _setDecompileResult(data)
            })

            //提取内容结束就展示
            EventsOn(String(result.extractWxMiniProgramInfoDone), (data) => {
                _setDecompileResult(`[${data.appid} ${data.version}] 信息提取完成\n`)
                if (data.appid != appIdRef.current || data.version != versionRef.current) {
                    return
                }
                GetMatchedString(data.appid, data.version).then(
                    r => {
                        if (!r.taskDown) {
                            setMatchedResult(`[${data.appid} ${data.version}]正在提取关键字内容`)
                        }
                        setMatchedResult(pre => pre + r.matched + "\n")
                    }
                )
            })

            //反编译完成后重绘列表
            EventsOn(String(result.decompileWxMiniProgramDone), (data) => {
                _setDecompileResult(data)
            })
        })
        GetWechat().then(
            result => {
                console.log(result)
                setAppletPath(result.applet)
            }
        )
        GetWechatDataPath().then(
            result => {
                dataCachePath.current = result
            }
        )

        //自动获取新的
        const temp = setTimeout(() => {
            GetAllMiniProgram().then(
                result => {
                    scheduledTask(result)
                }
            )
            timer.current = setInterval(() => {
                    GetAllMiniProgram().then(
                        result => {
                            scheduledTask(result)
                        }
                    )
                }
                , 3000)//3秒更新一次
            clearTimeout(temp);
        }, 0)

    }, []);

    const _setDecompileResult = (value: any) => {
        setDecompileResult(pre => {
            const t = pre.split("\n")
            if (t.length > 100) {
                return t.slice(t.length - 100, t.length).join("\n") + value
            }
            return pre + value
        })
    }

    const scheduledTask = (items: wechat.InfoToFront[]) => {
        setData(items)
        //是否自动反编译没有被反编译的
        if (!autoRef.current) {
            return
        }
        const unpackedItems: wechat.MiniProgram[] = []
        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            const versions: wechat.Version[] = []
            for (let j = 0; j < item.versions.length; j++) {
                let version = item.versions[j]
                if (!version.unpacked) {
                    versions.push(version)
                }
            }
            let temp = {versions: versions.slice()}//必须这样不然会修改到原数组
            temp.versions = versions
            if (temp.versions && temp.versions.length > 0) {
                unpackedItems.push(item)
            }
        }
        if (unpackedItems.length > 0) {
            decompile(unpackedItems, false)
        }
    }

    const decompile = (items: wechat.MiniProgram[], reDecompile: boolean) => {
        Decompile(items, reDecompile).catch(
            e => _setDecompileResult(e)
        )
    }

    const configAppletPath = () => {
        OpenDirectoryDialog().then(
            result => {
                if (result) {
                    SaveWechat({applet: result, rules: []}).then(
                        () => {
                            setAppletPath(result)
                            GetAllMiniProgram().then(
                                result => {
                                    scheduledTask(result)
                                }
                            )
                        }
                    )
                }
            }
        )
    }

    return (
        <div style={{
            position: "relative",
        }}>
            {
                // platform != "windows" && <div
                //     style={{
                //         position: "fixed",
                //         display:"flex",
                //         justifyContent:"center",
                //         alignItems:"center",
                //         margin:"0px",
                //         width: "100%",
                //         height: "100%",
                //         backgroundColor: "rgba(242, 242, 242, 0.5)", /* 半透明背景颜色 */
                //         zIndex: 999, /* 确保覆盖整个页面内容 */
                //         fontSize:"20px",
                //         color:"rgba(72, 72, 72,0.5)"
                //     }}
                // >暂只支持Windows平台</div>
            }
            <Flex vertical gap={10}
                  style={{
                      padding: "0 10px",
                      height: "calc(100vh - 54px)"
                  }}
            >
                <Space.Compact style={{justifyContent: "center"}}>
                    <Input style={{width: "600px",}} size={'small'} prefix={<>微信Applet路径</>} value={appletPath}/>
                    <Button size={"small"} onClick={configAppletPath} disabled={platform != "windows"}>选择</Button>
                    {
                        autoDecompile ?
                            < Button size={"small"} onClick={() => {
                                setAutoDecompile(false)
                                autoRef.current = false
                            }} style={{backgroundColor: "red", color: "white"}}>停用自动反编译</Button>
                            :
                            < Button size={"small"} onClick={() => {
                                setAutoDecompile(true)
                                autoRef.current = true
                            }} style={{backgroundColor: "green", color: "white"}}>启用自动反编译</Button>
                    }
                    <Popconfirm
                        placement="bottom"
                        title={"删除"}
                        description={<>确认删除Applet目录下的所有文件吗?<br/>
                            (会同时删除反编译后的所有文件)</>}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => {
                            setIsClearing(true)
                            ClearApplet().catch(
                                err => errorNotification("错误", err)
                            ).then(() => {
                                // setTreeData([])
                            }).finally(
                                () => {
                                    setIsClearing(false)
                                }
                            )
                        }}
                    >
                        <Button size={"small"}>清空Applet目录</Button>
                    </Popconfirm>
                    <Popconfirm
                        placement="bottom"
                        title={"删除"}
                        description={"确认删除所有反编译后的文件吗?"}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => {
                            setIsClearing(true)
                            ClearDecompiled().catch(
                                err => errorNotification("错误", err)
                            ).then(() => {
                                // setTreeData([])
                            }).finally(
                                () => setIsClearing(false)
                            )
                        }}
                    >
                        <Button size={"small"}>清空反编译后的文件</Button>
                    </Popconfirm>
                    <Popover
                        content={<Flex vertical={true} gap={5}>
                            <Flex gap={5}>
                                <Button size={"small"} type={"primary"} onClick={() => {
                                    setOpen(false)
                                    SaveWechatMatchRules(rules.split("\n"))
                                }}>保存</Button>
                                <Button size={"small"} type={"primary"} onClick={() => {
                                    setOpen(false)
                                }}>取消</Button>
                            </Flex>
                            <TextArea
                                value={rules}
                                placeholder={"每行一条"}
                                style={{width: "300px"}}
                                autoSize={{minRows: 10, maxRows: 10}}
                                onChange={e => setRules(e.target.value)}
                                allowClear
                            />
                        </Flex>}
                        trigger={"click"}
                        destroyTooltipOnHide
                        open={open}
                        onOpenChange={(v) => {
                            if (v) {
                                GetWechatMatchRules().then(
                                    rules => setRules(rules.join("\n"))
                                )
                            } else {
                                setRules("")
                            }
                            setOpen(v)
                        }}
                    >
                        <Button size={"small"}>信息提取规则</Button>
                    </Popover>
                </Space.Compact>
                <Flex align={"center"} justify={"center"}><>建议先执行清空Applet目录以避免无法回溯是哪个小程序</>
                </Flex>
                <div style={{height: "100%"}}>
                    <Allotment>
                        <Allotment.Pane preferredSize={"40%"} className={"left"}>
                            <ConfigProvider theme={{
                                components: {
                                    List: {
                                        titleMarginBottom: 5,
                                        metaMarginBottom: 0
                                    }
                                }
                            }}>
                                <List
                                    style={{overflowY: "auto", maxHeight: "100%", width: "100%"}}
                                    itemLayout="vertical"
                                    dataSource={data}
                                    renderItem={(item) => (
                                        <List.Item key={item.appid}
                                        >
                                            <Flex vertical gap={5}>
                                                <Flex gap={5}>
                                                    <Tag color={"cyan"} bordered={false}>
                                                         <span style={{fontWeight: "bold"}}>
                                                        {item.appid}
                                                    </span>
                                                    </Tag>
                                                    <Tag color={"orange"} bordered={false}>
                                                         <span style={{fontWeight: "bold"}}>
                                                        {item.update_date}
                                                    </span>
                                                    </Tag>
                                                    {
                                                        item?.username && <>
                                                            <Tag bordered={false} color="cyan">{item.username}</Tag>
                                                        </>
                                                    }

                                                </Flex>
                                                <Flex vertical gap={5}>
                                                    {
                                                        item?.nickname && <> <Flex><Tag
                                                            title={item.nickname}
                                                            bordered={false}
                                                            color="red"
                                                            style={{
                                                                whiteSpace: "nowrap",
                                                                textOverflow: "ellipsis",
                                                                overflow: "hidden"
                                                            }}>{item.nickname}</Tag></Flex></>
                                                    }
                                                    {
                                                        item.versions.map((i) => {
                                                            return <Flex gap={5} key={`${item.appid}-${i.number}`}>
                                                                <Tag bordered={false} color="cyan"><span
                                                                    title={i.unpacked ? "已反编译" : "未反编译"}><FileZipOutlined
                                                                    style={{color: i.unpacked ? "green" : "black"}}/>{i.number}</span></Tag>
                                                                <Space.Compact size={"small"}>
                                                                    <Tooltip title={"反编译"}>
                                                                        <Button icon={<DecompileIcon
                                                                            style={{fontSize: "12px"}}/>}
                                                                                onClick={() => {
                                                                                    decompile([new wechat.MiniProgram({
                                                                                        appid: item.appid,
                                                                                        versions: item.versions
                                                                                    })], true)

                                                                                }}/>
                                                                    </Tooltip>
                                                                    <Tooltip title={"打开数据文件夹"}>
                                                                        <Button
                                                                            icon={<FolderOpenOutlined/>}
                                                                            onClick={
                                                                                async () => {
                                                                                    OpenFolder(await Join([dataCachePath.current, item.appid, i.number]))
                                                                                }
                                                                            }/>
                                                                    </Tooltip>
                                                                    <Tooltip title={"敏感信息"}>
                                                                        <Button
                                                                            icon={<FileTextOutlined/>}
                                                                            onClick={
                                                                                async () => {
                                                                                    setSelect({
                                                                                        appid: item.appid,
                                                                                        version: i.number,
                                                                                        nickname: item.nickname
                                                                                    })
                                                                                    GetMatchedString(item.appid, i.number).then(
                                                                                        r => {
                                                                                            setMatchedResult(r.matched)
                                                                                        }
                                                                                    )
                                                                                }
                                                                            }/>
                                                                    </Tooltip>
                                                                </Space.Compact>
                                                            </Flex>
                                                        })
                                                    }
                                                    <span style={{color: "gray", fontSize: "12px"}}>
                                                        {item.description}
                                                    </span>
                                                </Flex>
                                            </Flex>
                                        </List.Item>
                                    )}
                                />
                            </ConfigProvider>
                        </Allotment.Pane>
                        <Allotment vertical className={"wechat-right"}>
                            <Allotment.Pane className={"right-top"} preferredSize={500} minSize={150}>
                                <Flex vertical gap={5} style={{height: "100%"}}>
                                    <Flex>
                                        {
                                            select?.appid && <Flex>
                                                <Tag bordered={false}
                                                     color={"orange"}>{select?.appid} {select?.version}</Tag>
                                            </Flex>
                                        }
                                        {
                                            select?.nickname && <Flex>
                                                <Tag bordered={false} color={"orange"}>{select.nickname}</Tag>
                                            </Flex>
                                        }
                                    </Flex>

                                    <TextArea
                                        value={matchedResult}
                                        onChange={(e) => setMatchedResult(e.target.value)}
                                        style={{height: "100%"}}
                                        wrap="off"
                                        allowClear
                                    />
                                </Flex>
                            </Allotment.Pane>
                            <Allotment.Pane className={"right-bottom"} minSize={150}>
                                <TextArea
                                    value={decompileResult}
                                    onChange={(e) => setDecompileResult(e.target.value)}
                                    style={{
                                        height: "100%"
                                    }}
                                    allowClear
                                />
                            </Allotment.Pane>
                        </Allotment>
                    </Allotment>
                </div>
            </Flex>
        </div>
    );
};