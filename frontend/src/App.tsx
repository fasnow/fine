import React, { useEffect, useState } from 'react';
import {ConfigProvider, Layout as Lay, Spin, Tabs, TabsProps} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN';
import {errorNotification} from "@/component/Notification";
import Bar from "@/pages/Bar";
import Fofa from "@/pages/FofaV2";
import {Setting} from "@/pages/Setting";
import IP138 from "@/pages/Ip138";
import Icp from "@/pages/Icp";
import Hunter from "@/pages/HunterV2";
import Quake from "@/pages/QuakeV2";
import {useDispatch} from "react-redux";
import {appActions} from "@/store/store";
import Zone from "@/pages/Zone";
import Httpx from "@/pages/Httpx";
import {Environment} from "../wailsjs/runtime";
import {MiniProgram} from "@/pages/Wechat";
import {Cipher} from "@/pages/Cipher";
import {CssConfig} from "@/pages/Constants";
import TianYanCha from "@/pages/TianYanCha";
import { createStyles } from 'antd-style';
import {Test} from "@/pages/Test";
import {GetAllConstants} from "../wailsjs/go/app/App";
import {sleep} from "@/util/util";

const { Header } = Lay;

const useGlobalStyles = createStyles(() => ({
    customDrawerMask: {
        top: '30px',  // 修改 Drawer 遮罩层的 top 属性
    },
}));

const App: React.FC = () => {
    const dispatch = useDispatch()
    const [loading,setLoading] = useState(true)
    useEffect(() => {
        window.onerror = function(message, source, lineno, colno, error) {
            //   message：错误信息（字符串）。可用于HTML onerror=""处理程序中的event。
            //   source：发生错误的脚本URL（字符串）
            //   lineno：发生错误的行号（数字）
            //   colno：发生错误的列号（数字）
            //   error：Error对象
            console.error(source,lineno,colno,error)
        }
        const currentDate = new Date();
        const isQingmingJie = currentDate.getMonth() === 3 && currentDate.getDate() >= 4 && currentDate.getDate() <= 6;
        const bodyElement = document.body;
        if (isQingmingJie) {
            bodyElement.style.filter = 'grayscale(100%)';
        }
        Environment().then(
            r=>console.log(r)
        )
    }, [])

    useEffect(() => {
        (async () => {
            try {
                const constant = await GetAllConstants()
                console.log(constant)
                dispatch(appActions.setGlobal(constant))
                setLoading(false)
            } catch (e) {
                errorNotification("错误", "初始化失败: " + e)
            }
        })()
    }, []);

    return (
        <ConfigProvider
            locale={locale}
            theme={{
                components: {
                    Dropdown: {
                        motionDurationMid: "0s",
                        motionEaseInOutCirc: "cubic-bezier(0.78, 0.14, 0.15, 0.86)"
                    },
                    Modal: {
                        paddingLG: 5,
                        paddingMD: 10,
                        paddingContentHorizontalLG: 10
                    },
                    Collapse: {
                        marginSM: 0,
                        paddingSM: 0
                    },
                    Tabs: {
                        cardHeight: CssConfig.tab.height,
                        cardPadding: "0px 0px 0px 0px",
                        cardPaddingSM: "0px 0px 0px 0px",
                        verticalItemPadding: "0px 0px",
                        borderRadiusLG: 0,
                        borderRadius: 0,
                        horizontalItemPadding: "0px 0px 0px 0px",
                        horizontalMargin:"0 0 0 0",
                        inkBarColor:"#ffa940"
                    },
                    Table: {
                        cellPaddingBlockSM: 4,
                    },
                    Splitter: {
                        splitBarSize:5,
                        splitBarDraggableSize:0
                    },

                },
            }}
        >
            <Lay style={{backgroundColor: '#ffffff', margin: '0', padding:'0'}}>
                <Header style={CssConfig.title}><Bar /></Header>
                <div style={{position:"relative",width:"100%", height: `calc(100vh - ${CssConfig.title.height})`, maxHeight: `calc(100vh - ${CssConfig.title.height})`}}>
                    {
                        loading ? <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height:'100%',
                            }}><Spin spinning={true} /></div>
                            :
                            <Lay style={{backgroundColor: '#ffffff'}}>
                                <Tabs items={items} tabBarStyle={{backgroundColor:'rgba(242, 242, 242,1)',padding: "0 10px", borderBottom:"solid 1px #eaecf2"}}/>
                            </Lay>
                    }
                </div>
            </Lay>
        </ConfigProvider>
    )
}

export default  App

const items: TabsProps['items'] = [
    {
        key: '设置',
        label: '设置',
        children: <div style={{padding:"0 10px"}}><Setting/></div>,
    },
    {
        key: '网络资产测绘',
        label: '网络资产测绘',
        children: <Tabs
            items={[
                {key: 'Fofa',label: 'Fofa',children: <Fofa/>,},
                {key: 'Hunter',label: 'Hunter',children: <Hunter/>,},
                {key: 'Quake',label: 'Quake',children: <Quake/>,},
                // {key: '0.zone',label: '0.zone',children: <Zone/>,}
            ]}
            tabBarStyle={{backgroundColor: '#F2F2F2FF', padding : "0 10px",}}
        />,
    },
    {
        key: 'ICP',
        label: 'ICP',
        children: <Icp/>,
    },
    {
        key: '天眼查',
        label: '天眼查',
        children: <TianYanCha/>,
    },
    {
        key: 'HTTPX',
        label: 'HTTPX',
        children: <Httpx/>,
    },
    {
        key: 'IP138',
        label: 'IP138',
        children: <IP138/>,
    },
    {
        key: '小程序反编译',
        label: '小程序反编译',
        children: <MiniProgram/>,
    },
    {
        key: '编码转换',
        label: '编码转换',
        children: <Cipher/>,
    },
    // {
    //     key: 'TEST',
    //     label: 'TEST',
    //     children: <Test/>,
    // },
];

