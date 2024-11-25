import React, {CSSProperties, useEffect, useState} from 'react';
import type {ButtonProps, FormProps} from 'antd';
import {Button, Divider, Flex, Input, Row, Select, Space, Switch} from 'antd';
import "./Setting.css"
import ScrollBar from '../component/ScrollBar';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, configActions} from '@/store/store';
import {errorNotification} from '@/component/Notification';
import {
    Get,
    Get0zone,
    GetFofa,
    GetHunter,
    GetProxy,
    GetQuake,
    SaveProxy,
    SaveQueryOnEnter,
} from "../../wailsjs/go/config/Config";
import {SetAuth as SetHunterAuth} from "../../wailsjs/go/hunter/Bridge";
import {SetAuth as SetFofaAuth} from "../../wailsjs/go/fofa/Bridge";
import {SetAuth as Set0zoneAuth} from "../../wailsjs/go/zone/Bridge";
import {SetAuth as SetQuakeAuth} from "../../wailsjs/go/quake/Bridge";
import locale from "antd/locale/zh_CN";
import {CssConfig} from "@/pages/Config";
import {config} from "../../wailsjs/go/models";
import QueryOnEnter = config.QueryOnEnter;


export const buttonProps: ButtonProps = {
    type: "default", shape: "round", size: "small"
};

export const authFormProps: FormProps = {
    size: "middle", style: {width: "400px"}, preserve: false
};

export const proxyFormProps: FormProps = {
    size: "middle", style: {width: "300px"}
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
    const proxy = useSelector((state: RootState) => state.config.proxy)
    const [proxyConf,setProxyConf] = useState<config.Proxy>({
        enable:false,
        host:"",
        port:"",
        user:"",
        pass:"",
        type:""
    })
    const [proxyConfTmp,setProxyConfTmp] = useState<config.Proxy>({
        enable:false,
        host:"",
        port:"",
        user:"",
        pass:"",
        type:""
    })

    useEffect(() => {
        GetProxy().then(
            result => {
                dispatch(configActions.setProxy(result))
            }
        )
    }, []);

    useEffect(() => {
        setProxyConf(proxy)
        setProxyConfTmp(proxy)
    }, [proxy]);

    const save=(enable:boolean)=>{
        let t:config.Proxy={
            enable:enable,
            type:proxyConfTmp.type,
            host:proxyConfTmp.host,
            port:proxyConfTmp.port,
            user:proxyConfTmp.user,
            pass:proxyConfTmp.pass,
        }
        setProxyConfTmp(t)
        SaveProxy(t).then(() => {
            setEditable(false)
            dispatch(configActions.setProxy(t))
        }).catch(
            err => errorNotification("错误", err, 3)
        )
    }

    const cancel=()=>{
        setEditable(false)
        setProxyConfTmp(proxyConf)
    }
    return <Flex justify={"left"}>
        <span style={LabelCssProps}>代理</span>
        <span style={{marginRight:"10px"}}>
            <Space.Compact size={"small"} style={{width:"100%"}}>
            <Select
                defaultValue={proxyConf?.type}
                value={proxyConfTmp.type}
                style={{ width: '90px' }}
                options={
                    [{label:"http",value:"http"}, {label:"socks5",value:"socks5"}]
                }
                onChange={(v)=> {
                    if(editable)setProxyConfTmp(preState => {
                        return {...preState, type: v}
                    })
                }}
            />
            <Input value={proxyConfTmp?.host} placeholder={"host"} style={{ width: '140px' }}
                   onChange={e=> {
                       if(editable)setProxyConfTmp(preState => {
                           return {...preState, host: e.target.value}
                       })
                   }}
            />
            <Input value={proxyConfTmp?.port} placeholder={"port"} style={{ width: '80px' }}
                   onChange={e=> {
                       if(editable)setProxyConfTmp(preState => {
                           return {...preState, port: e.target.value}
                       })
                   }}
            />
            <Input value={proxyConfTmp?.user} placeholder={"user"} style={{ width: '100px' }}
                   onChange={e=> {
                       if(editable)setProxyConfTmp(preState => {
                           return {...preState, user: e.target.value}
                       })
                   }}
            />
            <Input.Password value={proxyConfTmp?.pass} placeholder={"pass"} style={{ width: '100px' }}
                            onChange={e=> {
                                if(editable)setProxyConfTmp(preState => {
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
                                onClick={()=>save(proxyConfTmp.enable)}
                            >保存</Button>
                            <Button {...buttonProps}
                                    onClick={cancel}
                            >取消</Button>
                        </Flex>
                }
                <Switch value={proxyConfTmp.enable} size="default" checkedChildren="开启"
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
    const queryOnEnter = useSelector((state: RootState) => state.config.queryOnEnter)


    useEffect(()=>{
        Get().then(
            config=>{
                dispatch(configActions.setQueryOnEnter(config.QueryOnEnter))
            }
        )
    }, [])

    const saveAssets=(enable:boolean)=>{
        const t:QueryOnEnter = {
            ...queryOnEnter,
            assets:enable,
        }
        SaveQueryOnEnter(t).catch(
            err => errorNotification("错误", err, 3)
        ).then(
            ()=>dispatch(configActions.setAssetsQueryOnEnter(enable))
        )
    }

    const saveIcp=(enable:boolean)=>{
        const t:QueryOnEnter = {
            ...queryOnEnter,
            icp:enable,
        }
        SaveQueryOnEnter(t).catch(
            err => errorNotification("错误", err, 3)
        ).then(
            ()=>dispatch(configActions.setIcpQueryOnEnter(enable))
        )
    }

    const saveIP138=(enable:boolean)=>{
        const t:QueryOnEnter = {
            ...queryOnEnter,
            ip138:enable,
        }
        SaveQueryOnEnter(t).catch(
            err => errorNotification("错误", err, 3)
        ).then(
            ()=>dispatch(configActions.setIP138QueryOnEnter(enable))
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
                    value={queryOnEnter.ip138}
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
                    value={queryOnEnter.icp}
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
                    value={queryOnEnter.assets}
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
        const [tmpKey, setTmpKey] = useState("")
        const auth = useSelector((state: RootState) => state.config.auth.fofa)

        useEffect(() => {
            GetFofa().then(
                (result) => {
                    dispatch(configActions.setFofaAuth({key:result.token}))
                }
            )
        }, []);

        useEffect(() => {
            setKey(auth.key)
            setTmpKey(auth.key)
        }, [auth]);


        const save=()=> {
            SetFofaAuth(key).then(
                r=> {
                    dispatch(configActions.setFofaAuth({key:key}))
                    setEditable(false)
                }
            ).catch(
                err => errorNotification("错误", err, 3)
            )
        }

        const cancel=()=>{
            setKey(tmpKey)
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
        const [tmpKey, setTmpKey] = useState("")
        const auth = useSelector((state: RootState) => state.config.auth.hunter)

        useEffect(() => {
            GetHunter().then(
                (result) => {
                    dispatch(configActions.setHunterAuth({key:result.token}))
                }
            )
        }, []);

        useEffect(() => {
            setKey(auth.key)
            setTmpKey(auth.key)
        }, [auth]);


        const save=()=> {
            SetHunterAuth(key).then(
                r=> {
                    dispatch(configActions.setFofaAuth({key:key}))
                    setEditable(false)
                }
            ).catch(
                err => errorNotification("错误", err, 3)
            )
        }

        const cancel=()=>{
            setKey(tmpKey)
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
        const [tmpKey, setTmpKey] = useState("")
        const auth = useSelector((state: RootState) => state.config.auth["0.zone"])

        useEffect(() => {
            Get0zone().then(
                (result) => {
                    dispatch(configActions.setZoneAuth({key:result.token}))
                }
            )
        }, []);

        useEffect(() => {
            setKey(auth.key)
            setTmpKey(auth.key)
        }, [auth]);


        const save=()=> {
            Set0zoneAuth(key).then(
                r=> {
                    dispatch(configActions.setFofaAuth({key:key}))
                    setEditable(false)
                }
            ).catch(
                err => errorNotification("错误", err, 3)
            )
        }

        const cancel=()=>{
            setKey(tmpKey)
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
        const [tmpKey, setTmpKey] = useState("")
        const auth = useSelector((state: RootState) => state.config.auth.quake)

        useEffect(() => {
            GetQuake().then(
                (result) => {
                    dispatch(configActions.setQuakeAuth({key:result.token}))
                }
            )
        }, []);

        useEffect(() => {
            setKey(auth.key)
            setTmpKey(auth.key)
        }, [auth]);


        const save=()=> {
            SetQuakeAuth(key).then(
                r=> {
                    dispatch(configActions.setFofaAuth({key:key}))
                    setEditable(false)
                }
            ).catch(
                err => errorNotification("错误", err, 3)
            )
        }

        const cancel=()=>{
            setKey(tmpKey)
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

    return (
        <ScrollBar height={`calc(100vh - ${CssConfig.tab.height} - ${CssConfig.title.height} - 30px)`}>
            <Space direction='vertical' style={{width: "100%", paddingTop: "20px"}} size={20}>
                <FofaForm/>
                <HunterForm/>
                <ZoneForm/>
                <QuakeForm/>
                <Divider style={{marginTop:"5px",marginBottom:"5px"}}/>
                <Proxy/>
                <Divider style={{marginTop:"5px",marginBottom:"5px"}}/>
                <Other/>
            </Space>
        </ScrollBar>
    )
}