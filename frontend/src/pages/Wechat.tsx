import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    ConfigProvider,
    Flex,
    Input,
    List,
    Popconfirm,
    Popover,
    Space,
    Splitter,
    Tag,
    Tooltip
} from 'antd';
import { FileTextOutlined, FileZipOutlined, FolderOpenOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import "@/pages/Wechat.css"
import { EventsOn } from "../../wailsjs/runtime";
import {config, event, wechat} from "../../wailsjs/go/models";
import { errorNotification } from "@/component/Notification";
import {
    ClearApplet,
    ClearDecompiled,
    Decompile, DecompileBulk,
    GetAllMiniProgram,
    GetMatchedString,
} from "../../wailsjs/go/wechat/Bridge";
import { DecompileIcon } from "@/component/Icon";
import InfoToFront = wechat.InfoToFront;
import { useDispatch, useSelector } from "react-redux";
import { appActions, RootState } from "@/store/store";
import {Join} from "../../wailsjs/go/osoperation/Path";
import {OpenDirectoryDialog, OpenFolder} from "../../wailsjs/go/osoperation/Runtime";
import {GetWechatRules, SaveWechat, SaveWechatRules} from "../../wailsjs/go/application/Application";

export const MiniProgram: React.FC = () => {
    const [data, setData] = useState<InfoToFront[]>([])
    const [select, setSelect] = useState<{ appid: string, version: string, nickname: string }>()
    const [decompileResult, setDecompileResult] = useState<string>("")
    const [matchedResult, setMatchedResult] = useState<string>("")
    const appIdRef = useRef<string>("")
    const versionRef = useRef<string>("")
    const [appletPath, setAppletPath] = useState<string>("")
    const dataCachePath = useRef<string>("")
    const timer = useRef<any>()
    const [autoDecompile, setAutoDecompile] = useState<boolean>(false)
    const autoRef = useRef<boolean>(false) //直接在定时任务当中无法调用auto更新后的值，只能用ref
    const [isClearing, setIsClearing] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const [rules, setRules] = useState<string>("")
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config || new config.Config())
    const event = useSelector((state: RootState) => state.app.global.event)
    const status = useSelector((state: RootState) => state.app.global.status)

    useEffect(() => {
        EventsOn(event.DecompileWxMiniProgram, (eventDetail:event.EventDetail) => {
            if (eventDetail.Status === status.Running){
                _setDecompileResult(eventDetail.Message)
            } else if (eventDetail.Status === status.Stopped){
                _setDecompileResult(eventDetail.Message)
                if (eventDetail.Data.appid !== appIdRef.current || eventDetail.Data.version !== versionRef.current) {
                    return
                }
                GetMatchedString(eventDetail.Data.appid, eventDetail.Data.version)
                    .then(r => {
                            setMatchedResult(r?.join("\n"))
                        })
            } else if (eventDetail.Status === status.Error){
                errorNotification("错误", eventDetail.Error)
            }
        })

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

    useEffect(() => {
        setAppletPath(cfg.Wechat.Applet)
        setRules(cfg.Wechat.Rules.join("\n"))
        dataCachePath.current = cfg.WechatDataDir
    }, [cfg.Wechat, cfg.WechatDataDir])

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
        const unpackedItems: wechat.InfoToFront[] = []
        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            const versions: wechat.VersionStatus[] = []
            for (let j = 0; j < item.Versions.length; j++) {
                let version = item.Versions[j]
                if (version.DecompileStatus !== status.Stopped && version.DecompileStatus !== status.Running) {
                    versions.push(version)
                }
            }
            let temp = { versions: versions.slice() }//必须这样不然会修改到原数组
            temp.versions = versions
            if (temp.versions && temp.versions.length > 0) {
                unpackedItems.push(item)
            }
        }
        if (unpackedItems.length > 0) {
            decompileBulk(unpackedItems)
        }
    }

    const decompileBulk = (items: wechat.InfoToFront[]) => {
        DecompileBulk(items).catch(
            e => _setDecompileResult(e)
        )
    }
    const decompile = (items: wechat.InfoToFront) => {
        Decompile(items).catch(
            e => _setDecompileResult(e)
        )
    }

    const saveRules = (rules: string[]) => {
        SaveWechatRules(rules).then(
            () => {
                setOpen(false)
            }
        ).catch(
            e => {
                errorNotification("错误", e)
            }
        )
    }

    const configAppletPath = () => {
        OpenDirectoryDialog().then(
            result => {
                if (result) {
                    const t = { ...cfg.Wechat, Applet: result }
                    SaveWechat(t).then(
                        () => {
                            const tt = { ...cfg, Wechat: { ...t } } as config.Config
                            dispatch(appActions.setConfig(tt))
                            GetAllMiniProgram().then(
                                result => {
                                    scheduledTask(result)
                                }
                            )
                        }
                    ).catch(
                        e => {
                            errorNotification("错误", e)
                            setAppletPath(cfg.Wechat.Applet)
                        }
                    )
                }
            }
        )
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: "column",
                // padding: "0 10px",
                height: '100%'
            }}
        >

            <Flex vertical gap={10} align={"center"} justify={"center"}>
                <Space.Compact style={{ justifyContent: "center" }}>
                    <Input style={{ width: "600px", }} size={'small'} prefix={<>微信Applet路径</>} value={appletPath} />
                    <Button size={"small"} onClick={configAppletPath} >选择</Button>
                    {
                        autoDecompile ?
                            < Button size={"small"} onClick={() => {
                                setAutoDecompile(false)
                                autoRef.current = false
                            }} style={{ backgroundColor: "red", color: "white" }}>停用自动反编译</Button>
                            :
                            < Button size={"small"} type={'primary'} onClick={() => {
                                setAutoDecompile(true)
                                autoRef.current = true
                            }} >启用自动反编译</Button>
                    }
                    <Popconfirm
                        placement="bottom"
                        title={"删除"}
                        description={<>确认删除Applet目录下的所有文件吗?<br />
                            (会同时删除反编译后的所有文件)</>}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => {
                            setIsClearing(true)
                            ClearApplet().then(() => {
                                // setTreeData([])
                            }).catch(
                                err => errorNotification("错误", err)
                            ).finally(
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
                                    saveRules(rules.split("\n"))
                                }}>保存</Button>
                                <Button size={"small"} type={"primary"} onClick={() => {
                                    setOpen(false)
                                }}>取消</Button>
                                <Tag bordered={false} color="cyan">
                                    正则测试地址: https://regex101.com/
                                </Tag>
                            </Flex>
                            <TextArea
                                value={rules}
                                wrap={"off"}
                                placeholder={"每行一条"}
                                style={{ width: "600px" }}
                                autoSize={{ minRows: 10, maxRows: 10 }}
                                onChange={e => setRules(e.target.value)}
                                allowClear
                            />
                        </Flex>}
                        trigger={"click"}
                        destroyTooltipOnHide
                        open={open}
                        onOpenChange={(v) => {
                            if (v) {
                                GetWechatRules()
                                    .then(
                                        r=>setRules(r.join("\n"))
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
                建议先执行清空Applet目录以避免无法回溯是哪个小程序
            </Flex>
            <Splitter style={{
                flex: 1,overflow:"auto",padding: '5px'
            }}>
                <Splitter.Panel defaultSize={"35%"}>
                    <ConfigProvider theme={{
                        components: {
                            List: {
                                titleMarginBottom: 5,
                                metaMarginBottom: 0
                            }
                        }
                    }}>
                        <List
                            style={{height: '100%',overflow:"auto"}}
                            // style={{overflowY: "auto", height: "calc(100vh -400px)", width: "100%"}}
                            itemLayout="vertical"
                            dataSource={data}
                            renderItem={(item) => {
                                return <List.Item key={item.AppID}
                                >
                                    <Flex vertical gap={5}>
                                        <Flex gap={5}>
                                            <Tag color={"cyan"} bordered={false}>
                                                <span style={{ fontWeight: "bold" }}>
                                                    {item.AppID}
                                                </span>
                                            </Tag>
                                            <Tag color={"orange"} bordered={false}>
                                                <span style={{ fontWeight: "bold" }}>
                                                    {item.UpdateDate}
                                                </span>
                                            </Tag>

                                        </Flex>
                                        <Flex vertical gap={5}>
                                            <Flex>
                                                {
                                                    item.Info.Nickname && <> <Flex><Tag
                                                        title={item.Info.Nickname}
                                                        bordered={false}
                                                        color="red"
                                                        style={{
                                                            whiteSpace: "nowrap",
                                                            textOverflow: "ellipsis",
                                                            overflow: "hidden"
                                                        }}>{item.Info.Nickname}</Tag></Flex></>
                                                }
                                                {
                                                    item.Info.Username && <>
                                                        <Tag bordered={false} color="cyan">{item.Info.Username}</Tag>
                                                    </>
                                                }
                                            </Flex>
                                            {
                                                item.Versions?.map((i) => {
                                                    return <Flex gap={5} key={`${item.AppID}-${i.Number}`}>
                                                        <Tag bordered={false} color="cyan"><span
                                                            title={i.DecompileStatus === status.Stopped ? "已反编译" : "未反编译"}><FileZipOutlined
                                                            style={{ color: i.DecompileStatus === status.Stopped ? "green" : "black" }} />{i.Number}</span></Tag>
                                                        <Space.Compact size={"small"}>
                                                            <Tooltip title={"反编译"}>
                                                                <Button
                                                                    disabled={i.DecompileStatus === status.Running}
                                                                    icon={<DecompileIcon spin={i.DecompileStatus === status.Running}
                                                                    style={{ fontSize: "12px" }} />}
                                                                    onClick={() => {
                                                                        decompile(new wechat.InfoToFront({
                                                                            AppID: item.AppID,
                                                                            Versions: item.Versions
                                                                        }))

                                                                    }}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip title={"打开数据文件夹"}>
                                                                <Button
                                                                    disabled={i.DecompileStatus !== status.Stopped}
                                                                    icon={<FolderOpenOutlined />}
                                                                    onClick={
                                                                        async () => {
                                                                            OpenFolder(await Join([dataCachePath.current, item.AppID, i.Number]))
                                                                        }
                                                                    } />
                                                            </Tooltip>
                                                            <Tooltip title={"敏感信息"}>
                                                                <Button
                                                                    disabled={i.MatchStatus !==status.Stopped }
                                                                    icon={<FileTextOutlined />}
                                                                    onClick={
                                                                        async () => {
                                                                            setSelect({
                                                                                appid: item.AppID,
                                                                                version: i.Number,
                                                                                nickname: item.Info.Nickname
                                                                            })
                                                                            GetMatchedString(item.AppID, i.Number).then(
                                                                                r => {
                                                                                    setMatchedResult(r?.join("\n"))
                                                                                }
                                                                            )
                                                                        }
                                                                    } />
                                                            </Tooltip>
                                                        </Space.Compact>
                                                    </Flex>
                                                })
                                            }
                                            <span style={{ color: "gray", fontSize: "12px" }}>
                                                {item.Info.Description}
                                            </span>
                                        </Flex>
                                    </Flex>
                                </List.Item>
                            }}
                        />
                    </ConfigProvider>
                </Splitter.Panel>
                <Splitter.Panel>
                    <Splitter layout="vertical">
                        <Splitter.Panel min={'15%'} defaultSize={"70%"}>
                            <Flex vertical gap={5} style={{ height: "100%" }}>
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
                                    style={{ height: "100%" }}
                                    wrap="off"
                                    allowClear
                                />
                            </Flex>
                        </Splitter.Panel>
                        <Splitter.Panel min={'15%'}>
                            <TextArea
                                value={decompileResult}
                                onChange={(e) => setDecompileResult(e.target.value)}
                                style={{
                                    height: "100%"
                                }}
                                allowClear
                            />
                        </Splitter.Panel>
                    </Splitter>
                </Splitter.Panel>
            </Splitter>
        </div>
    );
};