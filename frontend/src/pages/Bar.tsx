import {
    BugOutlined,
    CloseOutlined,
    CompressOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ExclamationCircleOutlined,
    ExpandOutlined,
    FolderOpenOutlined,
    GithubOutlined,
    LineOutlined,
    LoadingOutlined,
    SendOutlined,
    SyncOutlined
} from "@ant-design/icons";
import {Badge, Button, ConfigProvider, Divider, Flex, List, Modal, Popover, Space, Spin, Tag, Tooltip,} from "antd";
import React, {useEffect, useRef, useState} from "react";
import "./Bar.css";
import {useDispatch, useSelector} from "react-redux";
import {GITHUB_URL, ISSUE_URL} from "@/component/type";
import wailsJson from '../../../wails.json';
import favicon from "../assets/images/appicon.png"
import {genshinLaunch} from "./op";
import {appActions, RootState} from "@/store/store";
import {Proxy as ProxyComp} from "./Setting"
import InfiniteScroll from "react-infinite-scroll-component";
import {
    BrowserOpenURL,
    EventsOn,
    Quit,
    WindowMaximise,
    WindowMinimise,
    WindowToggleMaximise,
    WindowUnmaximise
} from "../../wailsjs/runtime";
import {errorNotification, infoNotification} from "@/component/Notification";
import semver from "semver/preload";
import {Title} from "@/component/Title";
import {GetPlatform, OpenFile, OpenFolder, ShowItemInFolder} from "../../wailsjs/go/osoperation/Runtime";
import {CheckUpdate, SaveProxy} from "../../wailsjs/go/application/Application";
import {config, exportlog} from "../../wailsjs/go/models";
import {GetByOffset, MarkAllAsDeleted, MarkAsDeleted} from "../../wailsjs/go/exportlog/Bridge";
import Item = exportlog.Item;

const buttonStyle: React.CSSProperties = {
    borderRadius: "0",
    height: "30px",
    width: "30px",
    transition: "0s",
    opacity: 1
};

const appIcon = (platform: string) => {
    if (platform === "windows") {
        return <span
            style={{fontSize: "24px", display: 'flex', alignItems: "center", marginLeft: "5px"}}>
            <img
                style={{height: "24px"}}
                src={favicon}
                draggable="false"
                id="appIcon"
            />
        </span>
    }
};

class TitleBarOverlay extends React.Component {
    state = {
        fullScreen: false,
    };

    componentDidMount() {
        // const imageElement = document.getElementById('appIcon');
        // if (imageElement) {
        //     imageElement.addEventListener('click', () => {
        //         genshinLaunch()
        //     });
        // }

    }

    render(): React.ReactNode {
        return (
            <div>
                <Button
                    type="text"
                    style={buttonStyle}
                    icon={<LineOutlined/>}
                    size="small"
                    onClick={WindowMinimise}
                />
                {this.state.fullScreen ? (
                    <Button
                        type="text"
                        style={buttonStyle}
                        icon={<CompressOutlined/>}
                        size="small"
                        onClick={() => {
                            WindowUnmaximise();
                            this.setState({fullScreen: false});
                        }}
                    />
                ) : (
                    <Button
                        type="text"
                        style={buttonStyle}
                        icon={<ExpandOutlined/>}
                        size="small"
                        onClick={() => {
                            WindowMaximise();
                            this.setState({fullScreen: true});
                        }}
                    />
                )}
                <Button
                    type="text"
                    style={buttonStyle}
                    icon={<CloseOutlined/>}
                    size="small"
                    className="exit-button"
                    onClick={Quit}
                />
            </div>
        );
    }
}

const DownloadViewContent: React.FC = () => {
    const [data, setData] = useState<Item[]>([])
    const [total, setTotal] = useState<number>(0)
    const event = useSelector((state: RootState) => state.app.global.event)
    const cfg = useSelector((state: RootState) => state.app.global.config)
    const status = useSelector((state: RootState) => state.app.global.status)

    useEffect(() => {
        loadMoreData()
        EventsOn(String(event.NewDownloadItem), function () {
            loadMoreData()
        })
    }, []);
    const openDataFolder = async () => {
        OpenFolder(cfg.ExportDataDir).catch(
            err => errorNotification("错误", err)
        )
    }
    const loadMoreData = () => {
        GetByOffset(data.length, 10).then(
            result => {
                if (result) {
                    setData([...data, ...result.items]);
                    setTotal(result.total)
                }
            }
        ).catch(
            err => errorNotification("加载下载记录", err)
        )

    }

    const showFileInFolder = (dir: string, filename: string) => {
        ShowItemInFolder(dir, filename).catch(
            err => errorNotification("错误", err)
        )
    }

    const openFile = (dir: string, filename: string) => {
        OpenFile(dir, filename).catch(
            err => errorNotification("错误", err)
        )
    }

    const deleteFile = (exportID: number) => {
        setData(data.map(item => {
            if (item.exportID === exportID) {
                item.status = status.Deleted
            }
            return item
        }))
        MarkAsDeleted(exportID).catch(
            err => errorNotification("错误", err)
        )
    }

    const clearDownloadLog = async () => {
        MarkAllAsDeleted().then(
            () => {
                setData([])
                setTotal(0)
            }
        ).catch(
            err => errorNotification("删除导出记录", err)
        )
    }
    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span>下载</span>
                <span>
                    <Title text="打开下载列表">
                        <Button type="text" size="large" icon={<FolderOpenOutlined/>} onClick={openDataFolder}/>
                    </Title>
                    <Title text="文件仍存在">
                        <Button type="text" size="large" icon={<DeleteOutlined/>} onClick={clearDownloadLog}>
                            清空记录
                        </Button>
                    </Title>
                </span>
            </div>
            <Divider/>
            <div style={{width: "280px"}}>
                <InfiniteScroll
                    dataLength={data.length}
                    next={loadMoreData}
                    hasMore={data.length < total}
                    loader={<span style={{display: 'flex', justifyContent: "center", alignItems: 'center'}}><Spin
                        spinning={true} size="small"/></span>}
                    scrollableTarget="scrollableDiv"
                    height={400}
                >
                    <ConfigProvider theme={{
                        components: {
                            List: {
                                itemPaddingSM: "0px 0px"
                            },
                        }
                    }}>
                        <List
                            dataSource={data}
                            split={false}
                            size="small"
                            renderItem={(item: Item) => (
                                <List.Item
                                    key={item.filename}
                                >
                                    <span
                                        className="downloadItem"
                                        style={{
                                            width: "calc(100% - 10px)",
                                            padding: "2px 4px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Title text={item.filename}>
                                            <span
                                                style={{
                                                    textDecoration: item.status === status.Deleted ? "line-through" : "",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: 'ellipsis',
                                                    width: "100%",
                                                }}
                                            >
                                                {item.filename}
                                            </span>
                                        </Title>
                                        <span>
                                            {item.status === status.Deleted &&
                                                <label style={{
                                                    paddingLeft: "0px",
                                                    paddingTop: "0px",
                                                    height: "22px",
                                                    fontSize: "12px"
                                                }}>已删除</label>}
                                            {item.status === status.Error &&
                                                <Flex><label style={{
                                                    paddingLeft: "0px",
                                                    paddingTop: "0px",
                                                    height: "22px",
                                                    fontSize: "12px",
                                                }}>导出失败<Title text={item.error}><ExclamationCircleOutlined/></Title></label></Flex>}
                                            {item.status === status.Running &&
                                                <label style={{
                                                    paddingLeft: "0px",
                                                    paddingTop: "0px",
                                                    height: "22px",
                                                    fontSize: "12px",
                                                    color: "#1677ff"
                                                }}>正在导出<LoadingOutlined/></label>}
                                            {item.status === status.Stopped && <Button style={{
                                                paddingLeft: "0px",
                                                paddingTop: "0px",
                                                height: "22px",
                                                fontSize: "12px"
                                            }} type="link"
                                                                                       onClick={() => openFile(item.dir, item.filename)}
                                            >打开文件</Button>}

                                        </span>
                                        {item.status === status.Stopped && <span
                                            className="file"
                                            style={{
                                                justifyItems: "center",
                                                alignItems: "center"
                                            }}
                                        >
                                                <Title text="打开文件夹">
                                                    <Button size="large" type="text" icon={<FolderOpenOutlined/>}
                                                            onClick={() => showFileInFolder(item.dir, item.filename)}/>
                                                </Title>
                                                <Title text="删除文件">
                                                    <Button title={"删除文件"} size="large" type="text"
                                                            icon={<DeleteOutlined/>}
                                                            onClick={() => deleteFile(item.exportID)}/>
                                                </Title>
                                            </span>}

                                    </span>
                                </List.Item>
                            )}/>
                    </ConfigProvider>
                </InfiniteScroll>
            </div>
        </>
    );
};

// 获取当前日期字符串
const getTodayDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const Update: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const version = useRef(wailsJson.info.productVersion)
    const [releaseUrl, setReleaseUrl] = useState<string>("")
    const [releaseVersion, setReleaseVersion] = useState<string>("")
    const [releaseDescription, setReleaseDescription] = useState<string>("")
    const today = useRef<string>()
    const showToday = useRef<boolean>(false)
    useEffect(() => {
        CheckUpdate().then(
            result => {
                const newVersion = result["version"]
                console.log(newVersion)
                if (newVersion && semver.gt(newVersion, version.current)) {
                    setReleaseUrl(result["url"])
                    setReleaseDescription(result["description"])
                    setReleaseVersion(newVersion)
                    setOpen(true)
                }
            }
        )
        const intervalId = setInterval(() => {
            const newDate = new Date().getDate().toString()
            if (!showToday.current && today.current === newDate) {
                return
            }
            if (today.current !== newDate) {
                today.current = newDate
                showToday.current = true
            }
            CheckUpdate().then(
                result => {
                    const newVersion = result["version"]
                    console.log(newVersion)
                    if (newVersion && semver.gt(newVersion, version.current)) {
                        setReleaseUrl(result["url"])
                        setReleaseDescription(result["description"])
                        setReleaseVersion(newVersion)
                        setOpen(true)
                    }
                }
            )
        }, 1000 * 60 * 60); // 每隔 1 小时检查一次
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const checkUpdate = () => {
        setLoading(true)
        CheckUpdate()
            .then(result => {
                const newVersion = result["version"]
                if (newVersion && semver.gt(newVersion, version.current)) {
                    setLoading(false)
                    setOpen(true)
                    setReleaseUrl(result["url"])
                    setReleaseDescription(result["description"])
                    setReleaseVersion(newVersion)
                } else {
                    setLoading(false)
                    setOpen(false)
                    infoNotification("检查更新", "暂无更新")
                }
            })
            .catch(error => {
                errorNotification("检查更新", error)
                setLoading(false)
            })
    }
    return <>
        <Tooltip placement="bottom" title="检查更新">
            <Button
                icon={<Badge dot={releaseUrl !== ""} offset={[0, 0]}>
                    <SyncOutlined spin={loading}/>
                </Badge>}
                type="text"
                style={buttonStyle}
                onClick={checkUpdate}/>
        </Tooltip>
        <Modal
            maskClosable={false}
            title="检查更新"
            footer={<>
                <Flex justify={"right"} gap={10}>
                    <Button size={"small"} type={"default"}
                            onClick={
                                () => {
                                    setOpen(false)
                                    showToday.current = false
                                }
                            }
                    >今日不再提示</Button>
                    <Button size={"small"} type={"default"}
                            onClick={
                                () => setOpen(false)
                            }
                    >取消</Button>
                    <Button size={"small"} type={"primary"}
                            onClick={() => {
                                setOpen(false)
                                BrowserOpenURL(releaseUrl);
                            }}
                    >下载更新</Button>
                </Flex>
            </>}
            cancelButtonProps={{size: "small"}}
            okButtonProps={{size: "small"}}
            open={open}
            onOk={() => {
                setOpen(false)
                BrowserOpenURL(releaseUrl);
            }}
            onCancel={() => setOpen(false)}
            okText={"下载更新"}
        >
            <Flex vertical gap={10}>
                <Flex>
                    <span>
                        最新版本:
                    </span>
                    <Tag style={{fontSize: "14px"}} bordered={false} color="green">{releaseVersion}</Tag>
                </Flex>
                <Flex vertical>
                    <span>更新内容:</span>
                    {
                        releaseDescription && releaseDescription.replace(/\n(?!\n?$)/g, '\n')
                            .split("\n").map((item, i) => {
                                return <span key={i} style={{whiteSpace: "pre", marginLeft: "10px"}}>{item}</span>
                            })
                    }
                </Flex>
                <Flex vertical>
                    <span>
                        下载地址:
                    </span>
                    <span style={{whiteSpace: "pre", marginLeft: "10px"}}>
                        {
                            releaseUrl &&
                            <Tag
                                style={{fontSize: "14px"}}
                                bordered={false}
                                color="green">
                                {releaseUrl.replace(/\n(?!\n?$)/g, "")}
                            </Tag>
                        }
                    </span>
                </Flex>
            </Flex>
        </Modal></>
}

export const Proxy: React.FC = () => {
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config)
    const proxy = useSelector((state: RootState) => state.app.global.config.Proxy)
    const [url, setUrl] = useState<string>("")
    const [open, setOpen] = useState<boolean>(false)

    useEffect(() => {
        setUrl(`${proxy?.Type}://${proxy?.Host}:${proxy?.Port}`)
    }, [proxy])

    const updateProxy = (p: config.Proxy) => {
        SaveProxy(p).then(() => {
            const tt = {...cfg, Proxy: p} as config.Config;
            dispatch(appActions.setConfig(tt))
        }).catch(
            err => {
                errorNotification("错误", err, 3)
            }
        )
    }

    return <>
        <Popover
            content={<ProxyComp proxy={proxy} update={updateProxy}/>}
            trigger={"click"}
            open={open}
            onOpenChange={(value) => setOpen(value)}
        >
            <Tooltip
                // placement={platform === "win32" ? "bottom" : "bottomLeft"}
                title={proxy?.Enable ? "当前代理" : "代理已禁用"}
            >
                <Button
                    type="text"
                    style={{
                        borderRadius: "0",
                        height: "30px",
                        width: !proxy?.Enable ? "30px" : "auto",
                        transition: "0s",
                    }}
                    icon={
                        <Flex gap={1}>
                            {
                                proxy?.Enable ?
                                    <>
                                        <span style={{display: "flex", marginBottom: "5px"}}>
                                            <SendOutlined rotate={315} style={{color: proxy?.Enable ? "red" : ""}}/>
                                        </span>
                                        {/* <Tag bordered={false} style={{ lineHeight: "20px", fontSize: "14px", marginRight: "0px" }}>
                                            {url}
                                        </Tag> */}

                                    </>
                                    :
                                    <span style={{display: "flex", marginBottom: "5px"}}>
                                        <SendOutlined rotate={315} style={{color: proxy?.Enable ? "red" : ""}}/>
                                    </span>
                            }
                        </Flex>
                    }
                    size="small"
                >

                    {
                        proxy?.Enable &&
                        <Tag bordered={false} style={{lineHeight: "20px", fontSize: "14px", marginRight: "0px"}}>
                            {url}
                        </Tag>
                    }
                </Button>
            </Tooltip>
        </Popover>
        {/* </Tooltip> */}

    </>
}

const DownloadHistory: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    const event = useSelector((state: RootState) => state.app.global.event)

    useEffect(() => {
        EventsOn(event.NewDownloadItem, function () {
            setOpen(true)
        })
    }, [])
    return <>
        <Proxy/>
        <ConfigProvider
            theme={{
                components: {
                    Popover: {
                        titleMinWidth: 250,
                    },
                    Divider: {
                        marginLG: 5,
                    },
                },
            }}
        >
            <Tooltip
                // placement={platform === "win32" ? "bottom" : "bottomLeft"}
                title="导出记录"
            >
                <Popover
                    content={<DownloadViewContent/>}
                    trigger={"click"}
                    destroyTooltipOnHide
                    open={open}
                    onOpenChange={(value) => setOpen(value)}
                >
                    <Button
                        type="text"
                        style={buttonStyle}
                        icon={<DownloadOutlined/>}
                        size="small"
                    />
                </Popover>
            </Tooltip>
        </ConfigProvider>
    </>
}

const Bar: React.FC = () => {
    const [platform, setPlatform] = useState<string>("")
    const version = useRef(wailsJson.info.productVersion)

    //必须搭配使用,EventsOn里面获取不到isFullScreen更新后的值
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
    const f = useRef<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const event = useSelector((state: RootState) => state.app.global.event)
    useEffect(() => {
        GetPlatform().then(
            result => {
                setPlatform(result)
            }
        )
        EventsOn(event.WindowSizeChange, (r) => {
            if (r === 0 && f.current) {
                setIsFullScreen(false)
                f.current = false
            } else if (r === 1 && !f.current) {
                setIsFullScreen(true)
                f.current = true
            }
        })
    }, [])

    return (
        <div
            id="drag"
            className="bar"
            // draggable
            onDoubleClick={() => {
                WindowToggleMaximise();
                f.current = !f.current
                setIsFullScreen(pre => !pre)
            }}
        >
            <div className="left">{appIcon(platform)}</div>
            <div className="right" onDoubleClick={(e) => e.stopPropagation()}>
                <Space size={1}>
                    <span onClick={genshinLaunch}
                          style={{color: "#4676c3", margin: "0px 10px 0px 10px"}}> v{version.current}</span>
                    <DownloadHistory/>
                    <Update/>
                    <Tooltip placement="bottom" title="Github">
                        <Button
                            type="text"
                            style={buttonStyle}
                            icon={<GithubOutlined/>}
                            size="small"
                            onClick={() => {
                                BrowserOpenURL(GITHUB_URL)
                            }}
                        />
                    </Tooltip>
                    <Tooltip placement={platform === "windows" ? "bottom" : "bottomLeft"} title="提交Bug">
                        <Button
                            type="text"
                            style={buttonStyle}
                            icon={<BugOutlined/>}
                            size="small"
                            onClick={() => {
                                BrowserOpenURL(ISSUE_URL)
                            }}
                        />
                    </Tooltip>
                    {
                        platform === "windows" && <div>
                            <Button
                                type="text"
                                style={buttonStyle}
                                icon={<LineOutlined/>}
                                size="small"
                                onClick={WindowMinimise}
                            />
                            {isFullScreen ? (
                                <Button
                                    type="text"
                                    style={buttonStyle}
                                    icon={<CompressOutlined/>}
                                    size="small"
                                    onClick={() => {
                                        WindowToggleMaximise();
                                        setIsFullScreen(false)
                                        f.current = false
                                    }}
                                />
                            ) : (
                                <Button
                                    type="text"
                                    style={buttonStyle}
                                    icon={<ExpandOutlined/>}
                                    size="small"
                                    onClick={(e) => {
                                        WindowToggleMaximise();
                                        setIsFullScreen(true)
                                        f.current = true
                                    }}
                                />
                            )}
                            <Button
                                type="text"
                                style={buttonStyle}
                                icon={<CloseOutlined/>}
                                size="small"
                                className="exit-button"
                                onClick={Quit}
                            />
                        </div>
                    }
                </Space>
            </div>
        </div>
    )
}

export default Bar;
