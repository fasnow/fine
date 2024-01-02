import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ConfigProvider, Layout as Lay, notification } from 'antd';
import Menu from './Menu';
import Bar from './Bar';
import { Outlet } from 'react-router-dom';
import ScrollBar from '../component/ScrollBar';
import Sider from 'antd/es/layout/Sider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setAuth, setProxy, setServerStarted } from '../store/store';
// import zhCN from 'antd/locale/zh_CN';
import { $getAllConf } from '../http/api';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN';
import req from '../http/request';
import { _closeApp, _getExe, _getServerPort, _isPackaged, _startServer } from '../electron/electronApi';
import { server } from '../config';
import { genshinLaunch } from './op';
import { errorNotification } from '../component/Notification';

const { Header } = Lay;
const barStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#000',
    backgroundColor: 'rgb(255 255 255 / 100%)',
    height: '30px',
    lineHeight: '30px',
    margin: '0',
    padding: '0',
};
const mainStyle: React.CSSProperties = {
    backgroundColor: 'rgb(255, 255, 255, 1)',
    height: "calc(100vh - 30px)",
    margin: '0',
    padding: '0',
};

const Layout: React.FC = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        const currentDate = new Date();
        // 判断是否是清明节，这里简化为4月4日至4月6日为清明节
        const isQingmingJie = currentDate.getMonth() === 3 && currentDate.getDate() >= 4 && currentDate.getDate() <= 6;
        const bodyElement = document.body;
        if (isQingmingJie) {
            bodyElement.style.filter = 'grayscale(100%)';
        }

        if (process.env.NODE_ENV === 'development') {
            console.log()
            $getAllConf().then(
                resp => {
                    if (resp.data["code"] === 200) {
                        const proxy = resp.data["data"]["proxy"]
                        const auth = resp.data["data"]["auth"]
                        dispatch(setAuth(auth))
                        dispatch(setProxy(proxy))
                    }
                }
            ).catch(err => {
                console.log(err)
            })
            dispatch(setServerStarted(true))
            console.log(true)
            return
        }

        _getServerPort()
            .then(async (port) => {
                server.baseWS = `ws://127.0.0.1:${port}/api`
                req.defaults.baseURL = `http://127.0.0.1:${port}/api`
                _startServer(port)
                    .then(
                        () => {
                            dispatch(setServerStarted(true))
                            $getAllConf().then(
                                resp => {
                                    if (resp.data["code"] == 200) {
                                        const proxy = resp.data["data"]["proxy"]
                                        const auth = resp.data["data"]["auth"]
                                        console.log("auth", auth)
                                        dispatch(setAuth(auth))
                                        dispatch(setProxy(proxy))
                                    }
                                }
                            ).catch(err => {
                                console.log(err)
                            })
                        }
                    )
                    .catch(
                        (e) => {
                            console.log(e)
                            errorNotification("启动失败", e, 5000)
                        }
                    )
            })
            .catch(
                (e) => {
                    // _closeApp()
                    // return
                    errorNotification("主进程", e, 5000)
                    return
                }
            )
    }, [])

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
                    },
                    Table: {
                        cellPaddingBlockSM: 4,
                    }
                },
            }}
        >
            <Lay>
                <Header style={barStyle}><Bar /></Header>
                <Lay style={mainStyle}>
                    <Sider width="145" style={{ backgroundColor: 'rgb(70, 118, 195,1)', }}>
                        <ScrollBar height={"calc(100vh - 30px)"}  >
                            <Menu />
                        </ScrollBar>
                    </Sider>
                    <Lay >
                        <ScrollBar height="calc(100vh - 30px)" style={{
                            paddingLeft: "10px",
                            paddingRight: "10px",
                            paddingBottom: "1px",
                            backgroundColor: "rgb(255,255,255,1)",
                            border: "2px",
                            borderRadius: "2px"
                        }}>
                            <Outlet />
                        </ScrollBar>
                    </Lay>
                </Lay>
            </Lay>
        </ConfigProvider>


    )
}

export default Layout;
