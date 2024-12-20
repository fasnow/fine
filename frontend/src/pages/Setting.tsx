import React, {CSSProperties, useEffect, useState} from 'react';
import type {ButtonProps, FormProps} from 'antd';
import {Button, Divider, Flex, Input, Select, Space, Switch} from 'antd';
import "./Setting.css"
import ScrollBar from '../component/ScrollBar';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, configActions} from '@/store/store';
import {errorNotification} from '@/component/Notification';
import {
    SaveProxy,
    SaveQueryOnEnter,
} from "../../wailsjs/go/config/Config";
import {SetAuth as SetHunterAuth} from "../../wailsjs/go/hunter/Bridge";
import {SetAuth as SetFofaAuth} from "../../wailsjs/go/fofa/Bridge";
import {SetAuth as Set0zoneAuth} from "../../wailsjs/go/zone/Bridge";
import {SetAuth as SetQuakeAuth} from "../../wailsjs/go/quake/Bridge";
import {SetAuth as SetTianYanChaAuth} from "../../wailsjs/go/tianyancha/Bridge";
import {CssConfig} from "@/pages/Constants";
import {config} from "../../wailsjs/go/models";


export const buttonProps: ButtonProps = {
    type: "default", shape: "round", size: "small"
};

const LabelCssProps:CSSProperties={
    display:"inline-block",textAlign:"left",paddingRight:"5px",width:"48px",height:"24px"
}

const InputCssProps:CSSProperties={
    width:"400px", marginRight:"10px"
}

export const Proxy=()=>{
    const dispatch = useDispatch()
    const [editable, setEditable] = useState(false)
    const cfg = useSelector((state: RootState) => state.config.config)
    const [proxyConf,setProxyConf] = useState<config.Proxy>({
        enable:false,
        host:"",
        port:"",
        user:"",
        pass:"",
        type:""
    })

    useEffect(() => {
        setProxyConf(cfg.Proxy)
    }, [cfg.Proxy]);

    const save=(enable:boolean)=>{
        const t = {...proxyConf, enable: enable}
        SaveProxy(t).then(() => {
            const tt = { ...cfg, Proxy: t } as config.Config;
            dispatch(configActions.setConfig(tt))
            setEditable(false)
        }).catch(
            err => {
                errorNotification("错误", err, 3)
                setProxyConf(cfg.Proxy)
            }
        )
    }

    const cancel=()=>{
        setProxyConf(cfg.Proxy)
        setEditable(false)
    }
    return <Flex justify={"left"}>
        <span style={LabelCssProps}>代理</span>
        <span style={{marginRight:"10px"}}>
            <Space.Compact size={"small"} style={{width:"100%"}}>
            <Select
                defaultValue={proxyConf.type}
                value={proxyConf.type}
                style={{ width: '90px' }}
                options={
                    [{label:"http",value:"http"}, {label:"socks5",value:"socks5"}]
                }
                onChange={(v)=> {
                    if(editable) setProxyConf(preState => {
                        return {...preState, type: v}
                    })
                }}
            />
            <Input value={proxyConf.host} placeholder={"host"} style={{ width: '140px' }}
                   onChange={e=> {
                       if(editable)setProxyConf(preState => {
                           return {...preState, host: e.target.value}
                       })
                   }}
            />
            <Input value={proxyConf.port} placeholder={"port"} style={{ width: '80px' }}
                   onChange={e=> {
                       if(editable)setProxyConf(preState => {
                           return {...preState, port: e.target.value}
                       })
                   }}
            />
            <Input value={proxyConf.user} placeholder={"user"} style={{ width: '100px' }}
                   onChange={e=> {
                       if(editable)setProxyConf(preState => {
                           return {...preState, user: e.target.value}
                       })
                   }}
            />
            <Input.Password value={proxyConf.pass} placeholder={"pass"} style={{ width: '100px' }}
                            onChange={e=> {
                                if(editable)setProxyConf(preState => {
                                    return {...preState, pass: e.target.value}
                                })
                            }}
            />
            </Space.Compact>
        </span>
            <Flex gap={10}>
                {
                    !editable ?
                        <Button {...buttonProps} disabled={false}
                                onClick={() => setEditable(true)}>修改</Button>
                        :
                        <Flex gap={10}>
                            <Button {...buttonProps}
                                onClick={()=>save(proxyConf.enable)}
                            >保存</Button>
                            <Button {...buttonProps}
                                    onClick={cancel}
                            >取消</Button>
                        </Flex>
                }
                <Switch value={proxyConf.enable} size="default" checkedChildren="开启"
                        unCheckedChildren="关闭"
                        onChange={v=> {
                            if(!editable)save(v)
                        }}
                />
            </Flex>
        </Flex>
}

export const Other=()=>{
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.config.config)

    const saveAssets=(enable:boolean)=>{
        const t = {...cfg.QueryOnEnter}
        t.assets = enable
        SaveQueryOnEnter(t).then(
            ()=> {
                const tt = { ...cfg, QueryOnEnter: t } as config.Config;
                dispatch(configActions.setConfig(tt))
            }
        ).catch(
            err => {
                errorNotification("错误", err, 3)
            }
        )
    }

    const saveIcp=(enable:boolean)=>{
        const t = {...cfg.QueryOnEnter}
        t.icp = enable
        SaveQueryOnEnter(t).then(
            ()=> {
                const tt = { ...cfg } as config.Config;
                tt.QueryOnEnter = t;
                dispatch(configActions.setConfig(tt))
            }
        ).catch(
            err => errorNotification("错误", err, 3)
        )
    }

    const saveIP138=(enable:boolean)=>{
        const t = {...cfg.QueryOnEnter}
        t.ip138 = enable
        SaveQueryOnEnter(t).then(
            ()=> {
                const tt = { ...cfg } as config.Config;
                tt.QueryOnEnter = t;
                dispatch(configActions.setConfig(tt))
            }
        ).catch(
            err => errorNotification("错误", err, 3)
        )
    }

    return <Flex gap={40}>
        <span>
            <span style={{
                display:"inline-block",
                textAlign:"left",
                paddingRight:"5px",
                height:"24px"
            }}
            >
                IP138 Enter键执行搜索
            </span>
            <span>
                <Switch
                    value={cfg.QueryOnEnter.ip138}
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                    onChange={v=> saveIP138(v)}
                />
            </span>
        </span>
        <span>
            <span style={{
                display:"inline-block",
                textAlign:"left",
                paddingRight:"5px",
                height:"24px"
            }}
            >
                ICP Enter键执行搜索
            </span>
            <span>
                <Switch
                    value={cfg.QueryOnEnter.icp}
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                    onChange={v=> saveIcp(v)}
                    />
            </span>
        </span>
        <span>
            <span style={{
                display:"inline-block",
                textAlign:"left",
                paddingRight:"5px",
                height:"24px"
            }}
            >
                网络资产测绘Enter键执行搜索
        </span>
            <span>
                <Switch
                    value={cfg.QueryOnEnter.assets}
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                    onChange={v=> saveAssets(v)}
                />
            </span>
        </span>
    </Flex>
}

export const Setting: React.FC = () => {
    const dispatch = useDispatch()

    const FofaForm: React.FC = () => {
        const [editable, setEditable] = useState(false)
        const [key, setKey] = useState("")
        const cfg = useSelector((state: RootState) => state.config.config)

        useEffect(() => {
            setKey(cfg.Fofa.token)
        }, [cfg]);


        const save=()=> {
            SetFofaAuth(key).then(
                r=> {
                    const t = { ...cfg, Fofa: {...cfg.Fofa, token: key} } as config.Config;
                    dispatch(configActions.setConfig(t))
                    setEditable(false)
                }
            ).catch(
                err => {
                    errorNotification("错误", err, 3)
                    setKey(cfg.Fofa.token)
                }
            )
        }

        const cancel=()=>{
            setKey(cfg.Fofa.token)
            setEditable(false)
        }


        return <Flex justify={"left"}>
            <span style={LabelCssProps}>FOFA</span>
            <span style={InputCssProps}>
                <Input.Password  value={key} onChange={(e)=>{if(editable)setKey(e.target.value)}} size={"small"}/>
            </span>
            <Flex gap={10}>
                {
                    !editable ?
                        <Button {...buttonProps} onClick={() => setEditable(true)}>修改</Button>
                        :
                        <Flex gap={10}>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={save}
                            >保存</Button>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={cancel}
                            >取消</Button>
                        </Flex>
                }
            </Flex>
        </Flex>
    }

    const HunterForm: React.FC = () => {
        const [editable, setEditable] = useState(false)
        const [key, setKey] = useState("")
        const cfg = useSelector((state: RootState) => state.config.config)

        useEffect(() => {
            setKey(cfg.Hunter.token)
        }, [cfg]);

        const save=()=> {
            SetHunterAuth(key).then(
                r=> {
                    const t = { ...cfg, Hunter: {...cfg.Hunter, token: key} } as config.Config;
                    dispatch(configActions.setConfig(t))
                    setEditable(false)
                }
            ).catch(
                err => {
                    errorNotification("错误", err, 3)
                    setKey(cfg.Hunter.token)
                }
            )
        }

        const cancel=()=>{
            setKey(cfg.Hunter.token)
            setEditable(false)
        }

        return <Flex justify={"left"}>
            <span style={LabelCssProps}>Hunter</span>
            <span style={InputCssProps}>
                <Input.Password value={key} onChange={(e)=>{if(editable)setKey(e.target.value)}} size={"small"}/>
            </span>
            <Flex gap={10}>
                {
                    !editable ?
                        <Button {...buttonProps} onClick={() => setEditable(true)}>修改</Button>
                        :
                        <Flex gap={10}>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={save}
                            >保存</Button>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={cancel}
                            >取消</Button>
                        </Flex>
                }
            </Flex>
        </Flex>
    }

    const ZoneForm: React.FC = () => {
        const [editable, setEditable] = useState(false)
        const [key, setKey] = useState("")
        const cfg = useSelector((state: RootState) => state.config.config)


        useEffect(() => {
            setKey(cfg.Zone.token)
        }, [cfg]);


        const save=()=> {
            Set0zoneAuth(key).then(
                r=> {
                    const t = { ...cfg, Zone: {...cfg.Zone, token: key} } as config.Config;
                    dispatch(configActions.setConfig(t))
                    setEditable(false)
                }
            ).catch(
                err => {
                    errorNotification("错误", err, 3)
                    setKey(cfg.Zone.token)
                }
            )
        }

        const cancel=()=>{
            setKey(cfg.Zone.token)
            setEditable(false)
        }


        return <Flex justify={"left"}>
            <span style={LabelCssProps}>零零信安</span>
            <span style={InputCssProps}>
                <Input.Password value={key} onChange={(e)=>{if(editable)setKey(e.target.value)}} size={"small"}/>
            </span>
            <Flex gap={10}>
                {
                    !editable ?
                        <Button {...buttonProps} onClick={() => setEditable(true)}>修改</Button>
                        :
                        <>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={save}
                            >保存</Button>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={cancel}
                            >取消</Button>
                        </>
                }
            </Flex>
        </Flex>
    }

    const QuakeForm: React.FC = () => {
        const [editable, setEditable] = useState(false)
        const [key, setKey] = useState("")
        const cfg = useSelector((state: RootState) => state.config.config)

        useEffect(() => {
            setKey(cfg.Quake.token)
        }, [cfg]);


        const save=()=> {
            SetQuakeAuth(key).then(
                r=> {
                    const t = { ...cfg, Quake: {...cfg.Quake, token: key} } as config.Config;
                    dispatch(configActions.setConfig(t))
                    setEditable(false)
                }
            ).catch(
                err => {
                    errorNotification("错误", err, 3)
                    setKey(cfg.Fofa.token)
                }
            )
        }

        const cancel=()=>{
            setKey(cfg.Fofa.token)
            setEditable(false)
        }


        return <Flex justify={"left"}>
            <span style={LabelCssProps}>Quake</span>
            <span style={InputCssProps}>
                <Input.Password value={key} onChange={(e)=>{if(editable)setKey(e.target.value)}} size={"small"}/>
            </span>
            <Flex gap={10}>
                {
                    !editable ?
                        <Button {...buttonProps} onClick={() => setEditable(true)}>修改</Button>
                        :
                        <Flex gap={10}>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={save}
                            >保存</Button>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={cancel}
                            >取消</Button>
                        </Flex>
                }
            </Flex>
        </Flex>
    }

    const TianYanChaForm: React.FC = () => {
        const [editable, setEditable] = useState(false)
        const [key, setKey] = useState("")
        const cfg = useSelector((state: RootState) => state.config.config)

        useEffect(() => {
            setKey(cfg.TianYanCha.token)
        }, [cfg.TianYanCha]);


        const save=()=> {
            SetTianYanChaAuth(key).then(
                r=> {
                    const t = { ...cfg, TianYanCha: {...cfg.TianYanCha, token: key} } as config.Config;
                    dispatch(configActions.setConfig(t))
                    setEditable(false)
                }
            ).catch(
                err => {
                    errorNotification("错误", err, 3)
                    setKey(cfg.TianYanCha.token)
                }
            )
        }

        const cancel=()=>{
            setKey(cfg.TianYanCha.token)
            setEditable(false)
        }

        return <Flex justify={"left"}>
            <span style={LabelCssProps}>天眼查</span>
            <span style={InputCssProps}>
                <Input.Password value={key} onChange={(e)=>{if(editable)setKey(e.target.value)}} size={"small"}/>
            </span>
            <Flex gap={10}>
                {
                    !editable ?
                        <Button {...buttonProps} onClick={() => setEditable(true)}>修改</Button>
                        :
                        <Flex gap={10}>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={save}
                            >保存</Button>
                            <Button {...buttonProps} htmlType="submit"
                                    onClick={cancel}
                            >取消</Button>
                        </Flex>
                }
            </Flex>
        </Flex>
    }

    return (
        // <ScrollBar height={`calc(100vh - ${CssConfig.tab.height} - ${CssConfig.title.height} - 30px)`}>
        //     <Space direction='vertical' style={{width: "100%", paddingTop: "20px"}} size={20}>
        //         <FofaForm/>
        //         <HunterForm/>
        //         <ZoneForm/>
        //         <QuakeForm/>
        //         <TianYanChaForm/>
        //         <Divider style={{marginTop:"5px",marginBottom:"5px"}}/>
        //         <Proxy/>
        //         <Divider style={{marginTop:"5px",marginBottom:"5px"}}/>
        //         <Other/>
        //     </Space>
        // </ScrollBar>
        <Space direction='vertical'
               style={{
                   width: "100%",
                   paddingTop: "20px",
                   maxHeight: `calc(100vh - ${CssConfig.tab.height} - ${CssConfig.title.height} - 20px)`,
                   overflow: "auto"
        }} size={20}>
            <FofaForm/>
            <HunterForm/>
            <ZoneForm/>
            <QuakeForm/>
            <TianYanChaForm/>
            <Divider style={{marginTop:"5px",marginBottom:"5px"}}/>
            <Proxy/>
            <Divider style={{marginTop:"5px",marginBottom:"5px"}}/>
            <Other/>
        </Space>
    )
}