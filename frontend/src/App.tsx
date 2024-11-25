import React, { useEffect, useState } from 'react';
import {ConfigProvider, Layout as Lay, Tabs, TabsProps} from 'antd';

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN';
import {GetProxy} from "../wailsjs/go/config/Config";
import {errorNotification} from "@/component/Notification";
import Bar from "@/pages/Bar";
import Fofa from "@/pages/Fofa";
import {Setting} from "@/pages/Setting";
import IP138 from "@/pages/Ip138";
import Icp from "@/pages/domain/Icp";
import Hunter from "@/pages/Hunter";
import Quake from "@/pages/Quake";
import {useDispatch} from "react-redux";
import {configActions} from "@/store/store";
import Zone from "@/pages/Zone";
import Httpx from "@/pages/Httpx";
import {Environment} from "../wailsjs/runtime";
import {MiniProgram} from "@/pages/Wechat";
import Domain2IP from "@/pages/Domain2IP";
import {AES, Cipher} from "@/pages/Cipher";
import {CssConfig} from "@/pages/Config";

const { Header } = Lay;
const mainStyle: React.CSSProperties = {
    backgroundColor: 'rgb(255, 255, 255, 1)',
    height: "calc(100vh - 30px)",
    // height: "100vh",
    margin: '0',
};

const contentStyle: React.CSSProperties = {
    paddingLeft:'10px',
    paddingRight:'10px',
};


const App: React.FC = () => {
    const dispatch = useDispatch()
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
        try {
            GetProxy().then(
                result=>{
                    dispatch(configActions.setProxy(result))
                }
            )
            // doConfig("D:\\Tools\\wechatMiniAppReverse\\wxappUnpacker52破解版\\wx320a5673052ac189\\app-config.json")

        }catch (e) {
            errorNotification("错误",e,3)
        }

       return
    }, []);

    const [value,setValue] = useState<string>("a")

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
                        cardPadding: "0px 3px 0px 10px",
                        cardPaddingSM: "0px 3px 0px 10px",
                        verticalItemPadding: "5px 10px",
                        borderRadiusLG: 0,
                        borderRadius: 0,
                        horizontalItemPadding: "2px 0px 0px 0px",
                        horizontalMargin:"0 0 0 0",
                        inkBarColor:"#ffa940"
                    },
                    Table: {
                        cellPaddingBlockSM: 4,
                    },
                    Splitter: {
                        splitBarSize:5,
                        splitBarDraggableSize:0
                    }
                },
            }}
        >
            <Lay>
                <Header style={CssConfig.title}><Bar /></Header>
                <Lay style={mainStyle} >
                    <Tabs items={items} tabBarStyle={{backgroundColor:'rgba(242, 242, 242,1)',
                        padding: "0 10px"
                    }}/>
                </Lay>
            </Lay>
        </ConfigProvider>
    )
}

export default  App

const item2: TabsProps['items'] = [
    {
        key: '1',
        label: 'Fofa',
        children: <Fofa/>,
    },
    {
        key: '2',
        label: 'Hunter',
        children: <div style={{display:"flow"}}><Hunter/></div>,
    },
    {
        key: '3',
        label: 'Quake',
        children: <Quake/>,
    },
    {
        key: '4',
        label: '0.zone',
        children: <Zone/>,
    },
];

const items: TabsProps['items'] = [
    {
        key: '1',
        label: '设置',
        children: <div style={{padding:"0 10px"}}><Setting/></div>,
    },
    {
        key: '2',
        label: 'HTTPX',
        children: <div style={{padding:"0 10px"}}><Httpx/></div>,
    },
    {
        key: '3',
        label: 'IP138',
        children: <div style={{padding:"0 10px"}}><IP138/></div>,
    },
    {
        key: '4',
        label: 'ICP',
        children: <div style={{padding:"0 10px"}}><Icp/></div>,
    },
    {
        key: '5',
        label: '网络资产测绘',
        children: <div style={{padding:"0 10px"}}><Tabs items={item2}
                                                        // tabPosition={"left"}
                                                        // centered
        /></div>,
    },

    {
        key: '6',
        label: '小程序反编译',
        children: <div ><MiniProgram/></div>,
    },
    {
        key: '7',
        label: '编码转换',
        children: <Cipher/>,
    },
];

