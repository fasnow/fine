import React, { useEffect, useState } from 'react';
import {ConfigProvider, Layout as Lay, Tabs, TabsProps} from 'antd';

import { Outlet } from 'react-router-dom';
import Sider from 'antd/es/layout/Sider';

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN';
import {GetAll, GetConfigFromFile, GetProxy, Init} from "../wailsjs/go/config/Config";
import {errorNotification} from "@/component/Notification";
import Bar from "@/pages/Bar";
import Menu from "@/pages/Menu";
import Fofa from "@/pages/assets/Fofa";
import {Setting} from "@/pages/setting/Setting";
import IP138 from "@/pages/Ip138";
import Icp from "@/pages/domain/Icp";
import Hunter from "@/pages/assets/Hunter";
import Quake from "@/pages/assets/Quake";
import {useDispatch} from "react-redux";
import {setFofaAuth, setProxy} from "@/store/store";
import Zone from "@/pages/assets/Zone";
import Httpx from "@/pages/Httpx";



const { Header } = Lay;
const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#000',
    height: '30px',
    lineHeight: '30px',
    margin: '0',
    padding: '0',
    backgroundColor:"rgb(255,255,255)"
};
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
        const currentDate = new Date();
        // 判断是否是清明节，这里简化为4月4日至4月6日为清明节
        const isQingmingJie = currentDate.getMonth() === 3 && currentDate.getDate() >= 4 && currentDate.getDate() <= 6;
        const bodyElement = document.body;
        if (isQingmingJie) {
            bodyElement.style.filter = 'grayscale(100%)';
        }

    }, [])
    useEffect(() => {
        try {
            Init()
            GetProxy().then(
                result=>{
                    dispatch(setProxy(result))
                }
            )
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
                        cardHeight: 24,
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
                    }
                },
            }}
        >
            <Lay>
                <Header style={headerStyle}><Bar /></Header>
                <Lay style={mainStyle} >
                    <Tabs items={items} tabBarStyle={{backgroundColor:'rgba(242, 242, 242,1)',
                        padding: "0 10px"
                    }}/>
                    {/*<Sider width="145" style={{left: 0, top: 0, bottom: 0, backgroundColor: 'rgb(70, 118, 195,1)',overflowY:"auto" }}>*/}
                    {/*    /!*<ScrollBar height={"calc(100vh - 30px)"}  >*!/*/}
                    {/*    /!*    <Menu />*!/*/}
                    {/*    /!*</ScrollBar>*!/*/}
                    {/*    <Menu />*/}
                    {/*</Sider>*/}
                    {/*<Lay style={contentStyle}>*/}
                    {/*    /!*<ScrollBar height="calc(100vh - 30px)" style={{*!/*/}
                    {/*    /!*    paddingLeft: "10px",*!/*/}
                    {/*    /!*    paddingRight: "10px",*!/*/}
                    {/*    /!*    paddingBottom: "1px",*!/*/}
                    {/*    /!*    backgroundColor: "rgb(255,255,255,1)",*!/*/}
                    {/*    /!*    border: "2px",*!/*/}
                    {/*    /!*    borderRadius: "2px"*!/*/}
                    {/*    /!*}}>*!/*/}
                    {/*    /!*    <Outlet />*!/*/}
                    {/*    /!*</ScrollBar>*!/*/}
                    {/*    <Outlet />*/}
                    {/*</Lay>*/}
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
        children: <Hunter/>,
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
        destroyInactiveTabPane:true
    },
    {
        key: '2',
        label: 'HTTPX',
        children: <div style={{padding:"10px 10px 0px 10px"}}><Httpx/></div>,
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
];

