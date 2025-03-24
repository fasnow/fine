import React, {CSSProperties, ReactNode, useEffect, useState} from 'react';
import type {ButtonProps, InputNumberProps} from 'antd';
import {Button, Divider, Flex, Input, InputNumber, Select, Space, Switch} from 'antd';
import "./Setting.css"
import { useDispatch, useSelector } from 'react-redux';
import { RootState, appActions } from '@/store/store';
import { errorNotification } from '@/component/Notification';
import { SetAuth as SetHunterAuth } from "../../wailsjs/go/hunter/Bridge";
import { SetAuth as SetFofaAuth } from "../../wailsjs/go/fofa/Bridge";
import { SetAuth as SetQuakeAuth } from "../../wailsjs/go/quake/Bridge";
import { SetAuth as SetTianYanChaAuth } from "../../wailsjs/go/tianyancha/Bridge";
import { SetAuth as SetAiQiChaAuth } from "../../wailsjs/go/aiqicha/Bridge";
import { config } from "../../wailsjs/go/models";
import {
    SaveICPConfig,
    SaveProxy,
    SaveQueryOnEnter,
    SaveTimeout,
} from "../../wailsjs/go/application/Application";
import {OpenDirectoryDialog} from "../../wailsjs/go/osoperation/Runtime";
import {SetProxy, SetProxyTimeout} from "../../wailsjs/go/icp/Bridge";
import Number from "@/component/Number";
import Password from "@/component/Password";


export const buttonProps: ButtonProps = {
    type: "default", shape: "round", size: "small"
};

const LabelCssProps: CSSProperties = {
    display: "inline-block", textAlign: "left", paddingRight: "5px", height: "24px"
}

const LabelCssProp2: CSSProperties = {...LabelCssProps, width: "48px"}

const LabelCssProps3: CSSProperties = {...LabelCssProps,  width: "100px"}

export interface ProxyPros {
    labelWidth?: number
    title?: string
    proxy: config.Proxy
    update: (proxy: config.Proxy)=>void
}

export const Proxy:React.FC<ProxyPros> = (props) => {
    const [editable, setEditable] = useState(false)
    const [proxyConf, setProxyConf] = useState<config.Proxy>(props.proxy)

    useEffect(()=>{
        setProxyConf(props.proxy)
    }, [props.proxy])

    const cancel = () => {
        setProxyConf(props.proxy)
        setEditable(false)
    }

    const save = (enable:boolean) =>{
        setEditable(false)
        const t = {...proxyConf, Enable: enable} as config.Proxy
        props.update(t)
    }

    return <Flex justify={"left"}>
        <span style={{width: props.labelWidth || "fit-content", marginRight: "5px", display: "inline-block"}}>{props.title || "代理"}</span>
        <span style={{ marginRight: "10px" }}>
            <Space.Compact size={"small"} style={{ width: "100%" }}>
                <Select
                    defaultValue={proxyConf.Type}
                    value={proxyConf.Type}
                    style={{ width: '90px' }}
                    options={
                        [{ label: "http", value: "http" }, { label: "socks5", value: "socks5" }]
                    }
                    onChange={(v) => {
                        if (editable) setProxyConf(preState => {
                            return { ...preState, Type: v }
                        })
                    }}
                />
                <Input value={proxyConf.Host} placeholder={"host"} style={{ width: '140px' }}
                    onChange={e => {
                        if (editable) setProxyConf(preState => {
                            return { ...preState, Host: e.target.value }
                        })
                    }}
                />
                <Input value={proxyConf.Port} placeholder={"port"} style={{ width: '80px' }}
                    onChange={e => {
                        if (editable) setProxyConf(preState => {
                            return { ...preState, Port: e.target.value }
                        })
                    }}
                />
                <Input value={proxyConf.User} placeholder={"user"} style={{ width: '100px' }}
                    onChange={e => {
                        if (editable) setProxyConf(preState => {
                            return { ...preState, User: e.target.value }
                        })
                    }}
                />
                <Input.Password value={proxyConf.Pass} placeholder={"pass"} style={{ width: '100px' }}
                    onChange={e => {
                        if (editable) setProxyConf(preState => {
                            return { ...preState, Pass: e.target.value }
                        })
                    }}
                />
            </Space.Compact>
        </span>
        <Flex gap={10} align={"center"}>
            {
                !editable ?
                    <Button {...buttonProps} disabled={false}
                        onClick={() => setEditable(true)}>修改</Button>
                    :
                    <Flex gap={10}>
                        <Button {...buttonProps}
                            onClick={() => save(proxyConf.Enable)}
                        >保存</Button>
                        <Button {...buttonProps}
                            onClick={cancel}
                        >取消</Button>
                    </Flex>
            }
            <Switch value={proxyConf.Enable}
                    size="default"
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                    style={{width:'max-content'}}
                    onChange={v => {
                        if (!editable) save(v)
                    }}
            />
        </Flex>
    </Flex>
}

export const Other = () => {
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config || new config.Config())

    const saveAssets = (enable: boolean) => {
        const t = { ...cfg.QueryOnEnter }
        t.Assets = enable
        SaveQueryOnEnter(t).then(
            () => {
                const tt = { ...cfg, QueryOnEnter: t } as config.Config;
                dispatch(appActions.setConfig(tt))
            }
        ).catch(
            err => {
                errorNotification("错误", err, 3)
            }
        )
    }

    const saveIcp = (enable: boolean) => {
        const t = { ...cfg.QueryOnEnter }
        t.ICP = enable
        SaveQueryOnEnter(t).then(
            () => {
                const tt = { ...cfg } as config.Config;
                tt.QueryOnEnter = t;
                dispatch(appActions.setConfig(tt))
            }
        ).catch(
            err => errorNotification("错误", err, 3)
        )
    }

    const saveIP138 = (enable: boolean) => {
        const t = { ...cfg.QueryOnEnter }
        t.IP138 = enable
        SaveQueryOnEnter(t).then(
            () => {
                const tt = { ...cfg } as config.Config;
                tt.QueryOnEnter = t;
                dispatch(appActions.setConfig(tt))
            }
        ).catch(
            err => errorNotification("错误", err, 3)
        )
    }

    return <Flex gap={40}>
        <span>
            <span style={{
                display: "inline-block",
                textAlign: "left",
                paddingRight: "5px",
                height: "24px"
            }}
            >
                IP138 Enter键执行搜索
            </span>
            <span>
                <Switch
                    size={"small"}
                    value={cfg.QueryOnEnter.IP138}
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                    onChange={v => saveIP138(v)}
                />
            </span>
        </span>
        <span>
            <span style={{
                display: "inline-block",
                textAlign: "left",
                paddingRight: "5px",
                height: "24px"
            }}
            >
                ICP Enter键执行搜索
            </span>
            <span>
                <Switch
                    size={"small"}
                    value={cfg.QueryOnEnter.ICP}
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                    onChange={v => saveIcp(v)}
                />
            </span>
        </span>
        <span>
            <span style={{
                display: "inline-block",
                textAlign: "left",
                paddingRight: "5px",
                height: "24px"
            }}
            >
                网络资产测绘Enter键执行搜索
            </span>
            <span>
                <Switch
                    size={"small"}
                    value={cfg.QueryOnEnter.Assets}
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                    onChange={v => saveAssets(v)}
                />
            </span>
        </span>
    </Flex>
}

interface FileSelectorProps {
    label?: string
    labelWidth?: string | number
    value?: string
    width?: string | number
    onSelect?: (path:string)=>void
}

const FileSelector:React.FC<FileSelectorProps>=(props)=>{
    const onClick = () => {
        OpenDirectoryDialog().then(
            result => {
                if (result && props.onSelect) {
                    props.onSelect(result)
                }
            }
        )
    }
    return <Flex>
        <Flex style={{marginRight: '10px'}}>
            <span style={{display: "inline-block", textAlign: "left", paddingRight: "5px", height: "24px", width: props.labelWidth || 'fit-content'}}>{props.label}</span>
            <Input value={props.value} size={"small"} style={{width: props.width || '400px'}}/>
        </Flex>
        <Button size={"small"} shape={"round"} onClick={onClick}>选择</Button>
    </Flex>
}

export const Setting: React.FC = () => {
    const dispatch = useDispatch()
    const cfg = useSelector((state:RootState) => state.app.global.config)
    const proxy = useSelector((state:RootState) => state.app.global.config.Proxy)

    const updateProxy = (p:config.Proxy) =>{
            SaveProxy(p).then(() => {
                const tt = { ...cfg, Proxy: p } as config.Config;
                dispatch(appActions.setConfig(tt))
            }).catch(
                err => {
                    errorNotification("错误", err, 3)
                }
            )
    }

    const ICPForm: React.FC = () => {
        const updateProxy = (p:config.Proxy) =>{
            SetProxy(p).then(() => {
                const tt = { ...cfg, ICP: {...cfg.ICP,Proxy: p} } as config.Config;
                dispatch(appActions.setConfig(tt))
            }).catch(
                err => {
                    errorNotification("错误", err, 3)
                }
            )
        }
        const update=async (icp: config.ICP) => {
            try {
                await SaveICPConfig(icp)
                const tt = { ...cfg, ICP: icp } as config.Config;
                dispatch(appActions.setConfig(tt))
                return true
            } catch (e) {
                errorNotification("错误", e)
                return false
            }
        }
        return <Flex justify={"left"} vertical gap={10}>
            <Proxy labelWidth={40} proxy={cfg.ICP.Proxy} update={updateProxy}/>
            <Number labelWidth={200} label={"单查询时认证错误重试次数"} value={cfg.ICP.AuthErrorRetryNum1} onChange={value=>update({...cfg.ICP,AuthErrorRetryNum1: value as number} as config.ICP)}/>
            <Number labelWidth={200} label={"单查询时403错误误重试次数"} value={cfg.ICP.ForbiddenErrorRetryNum1} onChange={value=>update({...cfg.ICP,ForbiddenErrorRetryNum1: value as number} as config.ICP)}/>
            <Number labelWidth={200} label={"批量查询时认证错误重试次数"} value={cfg.ICP.AuthErrorRetryNum2} onChange={value=>update({...cfg.ICP,AuthErrorRetryNum2: value as number} as config.ICP)}/>
            <Number labelWidth={200} label={"批量查询403错误误重试次数"} value={cfg.ICP.ForbiddenErrorRetryNum2} onChange={value=>update({...cfg.ICP,ForbiddenErrorRetryNum2: value as number} as config.ICP)}/>
            <Number labelWidth={200} label={"批量查询协程数"} value={cfg.ICP.Concurrency} onChange={value=>update({...cfg.ICP,Concurrency: value as number} as config.ICP)}/>
            <Number labelWidth={200} label={"批量查询代理超时（ns）"} width={200} value={cfg.ICP.Timeout} onChange={async value => {
                try {
                    await SetProxyTimeout(value)
                    const tt = { ...cfg, ICP: {...cfg.ICP, Timeout: value} } as config.Config;
                    dispatch(appActions.setConfig(tt))
                    return true
                } catch (e) {
                    errorNotification("错误", e)
                    return false
                }
            }}/>
        </Flex>
    }

    return (
        <Flex vertical gap={10} style={{height:'100%',overflow: 'auto', padding: '10px', boxSizing: 'border-box'}}>
            <Divider style={{ marginTop: "0px", marginBottom: "0px", fontSize: '14px'}} orientation="left">全局设置</Divider>
            <Number labelWidth={80} width={200} label={"超时（ns）"} value={cfg.Timeout}
                    onChange={async (value) => {
                        try {
                            await SaveTimeout(value)
                            return true
                        } catch (e) {
                            errorNotification("错误", e)
                            return false
                        }
                    }}/>
            {/*<FileSelector label={"数据库文件"} labelWidth={100} value={cfg.DatabaseFile}/>*/}
            {/*<FileSelector label={"微信结果文件夹"} labelWidth={100} value={cfg.WechatDataDir}/>*/}
            {/*<FileSelector label={"导出数据文件"} labelWidth={100} value={cfg.ExportDataDir}/>*/}
            {/*<FileSelector label={"日志文件夹"} labelWidth={100} value={cfg.LogDataDir}/>*/}
            <Proxy labelWidth={80} proxy={proxy} update={updateProxy}/>
            <Password label={'FOFA'} labelWidth={80} width={400} value={cfg.Fofa.Token}
                onSubmit={async (value) => {
                    try {
                        await SetFofaAuth(value)
                        const t = {...cfg, Fofa: {...cfg.Fofa, Token: value}} as config.Config;
                        dispatch(appActions.setConfig(t))
                        return true
                    } catch (e) {
                        errorNotification("错误", e, 3)
                        return false
                    }
                }}
            />
            <Password label={'Hunter'} labelWidth={80} width={400} value={cfg.Hunter.Token}
                onSubmit={async (value) => {
                    try {
                        await SetHunterAuth(value)
                        const t = {...cfg, Hunter: {...cfg.Hunter, Token: value}} as config.Config;
                        dispatch(appActions.setConfig(t))
                        return true
                    } catch (e) {
                        errorNotification("错误", e, 3)
                        return false
                    }
                }}
            />
            <Password label={'Quake'} labelWidth={80} width={400} value={cfg.Quake.Token}
                  onSubmit={async (value) => {
                      try {
                          await SetQuakeAuth(value)
                          const t = {...cfg, Quake: {...cfg.Quake, Token: value}} as config.Config;
                          dispatch(appActions.setConfig(t))
                          return true
                      } catch (e) {
                          errorNotification("错误", e, 3)
                          return false
                      }
                  }}
            />
            <Password label={'天眼查'} placeholder={"auth_token"} labelWidth={80} width={400} value={cfg.TianYanCha.Token}
                  onSubmit={async (value) => {
                      try {
                          await SetTianYanChaAuth(value)
                          const t = {...cfg, TianYanCha: {...cfg.TianYanCha, Token: value}} as config.Config;
                          dispatch(appActions.setConfig(t))
                          return true
                      } catch (e) {
                          errorNotification("错误", e, 3)
                          return false
                      }
                  }}
            />
            <Password label={'爱企查'} placeholder={"cookie"} labelWidth={80} width={400} value={cfg.AiQiCha.Cookie}
                  onSubmit={async (value) => {
                      try {
                          await SetAiQiChaAuth(value)
                          const t = {...cfg, AiQiCha: {...cfg.AiQiCha, Cookie: value}} as config.Config;
                          dispatch(appActions.setConfig(t))
                          return true
                      } catch (e) {
                          errorNotification("错误", e, 3)
                          return false
                      }
                  }}
            />
            <Other />
            <Divider style={{ marginTop: "0px", marginBottom: "0px" }} orientation="left">ICP</Divider>
            <ICPForm/>
        </Flex>
    )
}