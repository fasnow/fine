import React, { createContext, useEffect, useRef, useState } from 'react';
import { Button, ConfigProvider, Flex, Layout as Lay, message, Modal, Spin, Tabs, App as AntdApp } from 'antd';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN';
import { errorNotification } from "@/component/Notification";
import Bar from "@/pages/Bar";
import Fofa from "@/pages/Fofa";
import { Setting } from "@/pages/Setting";
import IP138 from "@/pages/Ip138";
import Icp from "@/pages/Icp";
import Hunter from "@/pages/Hunter";
import Quake from "@/pages/Quake";
import { useDispatch } from "react-redux";
import { appActions } from "@/store/store";
import Httpx from "@/pages/Httpx";
import { Environment, EventsOn } from "../wailsjs/runtime";
import MiniProgram from "@/pages/Wechat";
import { Cipher } from "@/pages/Cipher";
import { CssConfig } from "@/pages/Constants";
import TianYanCha from "@/pages/TianYanCha";
import Test from "@/pages/Test";
import type { Tab } from 'rc-tabs/lib/interface'
import { ModuleRegistry, provideGlobalGridOptions, themeQuartz } from "ag-grid-community";
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
import AiQiCha from "@/pages/AiQiCha";
import { Exit, GetAllConstants } from "../wailsjs/go/application/Application";
import { css, cx } from "antd-style";
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from "react-draggable";
import AppIcon from "@/assets/images/appicon.png"
import Shodan from "@/pages/Shodan";
import dayjs from 'dayjs';
import { MessageInstance } from "antd/es/message/interface";
import styles from './App.module.css';
LicenseManager.setLicenseKey('[v3][Release][0102]_NDEwMjI5OTk5MzAwMA==ab24fd9f2af3b5617494923ea58bebea')
ModuleRegistry.registerModules([AllEnterpriseModule]);
provideGlobalGridOptions({ theme: themeQuartz.withParams({ rowBorder: true, columnBorder: true }) }); // Mark all grids as using legacy themes

export const MessageContext = createContext<MessageInstance | null>(null);

const App: React.FC = () => {
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null!);
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [tabs, setTabs] = useState<Tab[]>([
        {
            key: '设置',
            label: '设置',
            children: <Setting />,
        },
        {
            key: '网络资产测绘',
            label: '网络资产测绘',
            children: <Tabs
                style={{ height: '100%', width: '100%' }}
                items={[
                    { key: 'Fofa', label: 'Fofa', children: <Fofa />, },
                    { key: 'Hunter', label: 'Hunter', children: <Hunter />, },
                    { key: 'Quake', label: 'Quake', children: <Quake />, },
                    { key: 'Shodan', label: 'Shodan', children: <Shodan />, },
                    // {key: '0.zone',label: '0.zone',children: <Zone/>,}
                ]}
                tabBarStyle={{ backgroundColor: '#F2F2F2FF', padding: "0 10px", }}
            />,
        },
        {
            key: 'ICP',
            label: 'ICP',
            children: <Icp />,
        },
        {
            key: '天眼查',
            label: '天眼查',
            children: <TianYanCha />,
        },
        {
            key: '爱企查',
            label: '爱企查',
            children: <AiQiCha />,
        },
        {
            key: 'HTTPX',
            label: 'HTTPX',
            children: <Httpx />,
        },
        {
            key: 'IP138',
            label: 'IP138',
            children: <IP138 />,
        },
        {
            key: '小程序反编译',
            label: '小程序反编译',
            children: <MiniProgram />,
        },
        {
            key: '编码转换',
            label: '编码转换',
            children: <Cipher />,
        },
    ]);
    const [open, setOpen] = useState<boolean>(false)
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        (async () => {
            Environment().then(
                r => {
                    if (r.buildType === 'dev') {
                        setTabs(prevState => [...prevState, { key: 'TEST', label: 'TEST', children: <Test /> }])
                    }
                }
            )
            try {
                const constant = await GetAllConstants()
                EventsOn(constant.event.AppExit, () => {
                    setOpen(true)
                })
                console.log(constant)
                dispatch(appActions.setGlobal(constant))
                setLoading(false)
            } catch (e) {
                errorNotification("错误", "初始化失败: " + e)
            }
            window.onerror = function (message, source, lineno, colno, error) {
                //   message：错误信息（字符串）。可用于HTML onerror=""处理程序中的event。
                //   source：发生错误的脚本URL（字符串）
                //   lineno：发生错误的行号（数字）
                //   colno：发生错误的列号（数字）
                //   error：Error对象
                console.error(message, source, lineno, colno, error)
            }
        })()
    }, []);

    const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) {
            return;
        }
        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };


    return <MessageContext.Provider value={messageApi}>
        {contextHolder}
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
                        verticalItemMargin: "10px 10px 0 0",
                        verticalItemPadding: "0px 0px",
                        horizontalMargin: "0 0 0 0",
                        horizontalItemPadding: "0px 0px",
                        cardHeight: CssConfig.tab.height,
                        cardPadding: "5px 5px 5px 5px",
                        cardPaddingSM: "0px 0px 0px 0px",
                        borderRadius: 0,
                        borderRadiusLG: 0,
                        inkBarColor: "#ffa940",
                    },
                    Table: {
                        cellPaddingBlockSM: 4,
                    },
                    Splitter: {
                        splitBarSize: 5,
                        splitBarDraggableSize: 0
                    },

                },
            }}
        >
            <AntdApp style={{ height: "100%" }}>
                <div className={styles.appContainer}>
                    <ConfigProvider
                        theme={{
                            components: {
                                Modal: {
                                    motionDurationMid: '0',
                                    motionDurationSlow: '0',
                                    motionEaseInOutCirc: '',
                                    motionEaseOutCirc: '',
                                    colorBgMask: ''
                                }
                            }
                        }}
                    >
                        <Modal
                            footer={null}
                            closeIcon={false}
                            open={open}
                            styles={{
                                content: {
                                    backgroundColor: 'rgba(255, 255, 255, 0)', /* 设置背景颜色和透明度 */
                                    padding: 0
                                },
                            }}
                            style={{ cursor: "default" }}
                            width={260}
                            modalRender={(modal) => (
                                <Draggable
                                    disabled={disabled}
                                    bounds={bounds}
                                    nodeRef={draggleRef}
                                    onStart={(event, uiData) => onStart(event, uiData)}
                                >
                                    <div
                                        className={styles.modalContainer}
                                        ref={draggleRef}>{modal}
                                    </div>
                                </Draggable>
                            )}
                        >
                            <Flex align={"center"} justify={"center"} vertical gap={20}
                                onMouseOver={() => {
                                    if (disabled) {
                                        setDisabled(false);
                                    }
                                }
                                }
                                style={{ padding: 10 }}
                            >
                                <img style={{ height: '70px' }} draggable={false} src={AppIcon} alt={""} />
                                <span style={{ fontWeight: 'bold', fontSize: '12px' }}>确定退出吗？</span>
                                <Flex justify={"space-between"} style={{ width: '100%' }} gap={10}>
                                    <Button size={"small"} style={{ width: "100%" }} onClick={() => setOpen(false)}>取消</Button>
                                    <Button size={"small"} style={{ width: "100%" }} type={"primary"}
                                        onClick={() => Exit()}>确认</Button>
                                </Flex>
                            </Flex>
                        </Modal>
                    </ConfigProvider>

                    {
                        loading ? <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                        }}><Spin spinning={true} /></div>
                            :
                            <>
                                <Lay.Header style={CssConfig.title}><Bar /></Lay.Header>
                                <Tabs
                                    style={{ width: "100%", height: '100%', overflow: 'hidden' }}
                                    items={tabs}
                                    tabBarStyle={{
                                        backgroundColor: 'rgba(242, 242, 242,1)',
                                        padding: "0 10px",
                                        borderBottom: "solid 1px #eaecf2"
                                    }}
                                />
                            </>
                    }
                </div>
            </AntdApp>
        </ConfigProvider>
    </MessageContext.Provider>
}

export default App


