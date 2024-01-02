import { LineOutlined, ExpandOutlined, CloseOutlined, CompressOutlined, BugOutlined, DownloadOutlined, GithubOutlined, DeleteOutlined, FolderOpenOutlined, SyncOutlined, SendOutlined, } from "@ant-design/icons";
import { Badge, Button, ConfigProvider, Divider, List, Modal, Popover, Space, Spin, Tag, Tooltip, } from "antd";
import React, { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import "./Bar.css";
import { _closeApp, _getFilepath, _getPlatform, _showFileInFolder, _maximizeApp, _minimizeApp, _openFolder, _getDownloadLog, _unmaximizeApp, _clearDownloadLog, _removeFile, _openFile, _openDefaultBrowser, } from "../electron/electronApi";
import { useDispatch, useSelector } from "react-redux";
import { DownloadLogItem, GITHUB_URL, ISSUE_URL } from "../type";
import { DownloadLog, } from "../utils/utils";
import { errorNotification, infoNotification } from "../component/Notification";
import { $checkUpdate, $clearDownloadLog, $getDownloadLog, $removeDownloadLogItem } from "../http/api";
import packageJson from '../../package.json';
import favicon from "../public/assets/image/paimon.svg"
import { genshinLaunch } from "./op";
import * as semver from 'semver';
import { RootState, setDownloadLog, setHasNewLogItem, setServerStarted } from "../store/store";
import { Proxy as ProxyComp } from "./setting/Setting"
const buttonStyle: React.CSSProperties = {
    borderRadius: "0",
    height: "30px",
    width: "30px",
    transition: "0s",
};

const appIcon = (platform: string) => {
    if (platform === "win32") {
        return <span
            style={{ fontSize: "24px", display: 'flex', alignItems: "center", marginLeft: "5px" }}>
            <img
                style={{ height: "24px" }}
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
    handleResize = () => {
        if (
            window.outerWidth === screen.availWidth &&
            window.outerHeight === screen.availHeight
        ) {
            this.setState({ fullScreen: true });
        } else {
            this.setState({ fullScreen: false });
        }
    };
    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
        // const imageElement = document.getElementById('appIcon');
        // if (imageElement) {
        //     imageElement.addEventListener('click', () => {
        //         genshinLaunch()
        //     });
        // }

    }

    render(): React.ReactNode {
        const { fullScreen } = this.state;
        return (
            <div>
                <Button
                    type="text"
                    style={buttonStyle}
                    icon={<LineOutlined />}
                    size="small"
                    onClick={_minimizeApp}
                />
                {fullScreen ? (
                    <Button
                        type="text"
                        style={buttonStyle}
                        icon={<CompressOutlined />}
                        size="small"
                        onClick={() => {
                            _unmaximizeApp();
                            this.setState({ fullScreen: false });
                        }}
                    />
                ) : (
                    <Button
                        type="text"
                        style={buttonStyle}
                        icon={<ExpandOutlined />}
                        size="small"
                        onClick={() => {
                            _maximizeApp();
                            this.setState({ fullScreen: true });
                        }}
                    />
                )}
                <Button
                    type="text"
                    style={buttonStyle}
                    icon={<CloseOutlined />}
                    size="small"
                    className="exit-button"
                    onClick={_closeApp}
                />
            </div>
        );
    }
}

//每次先将记录先全部加载进来，加载的时候再判断是否存在
const DownloadViewContent: React.FC = () => {
    let log: DownloadLog
    const [items, setItems] = useState<DownloadLogItem[]>([])
    const [data, setData] = useState<DownloadLogItem[]>([])
    const [loading, setLoading] = useState(false);
    const index = useRef(0)

    useEffect(() => {
        init()
    }, []);
    const openDataFolder = async () => {
        await _openFolder()
    }

    const init = async () => {
        loadMoreData()
    }
    const loadMoreData = async () => {
        const result = await $getDownloadLog(data.length, 10)
        setData([...data, ...result.items]);
    }

    const showFileInFolder = async (dir: string, filename: string) => {
        const error = await _showFileInFolder(dir, filename)
        if (error) {
            const tmpLogItem: DownloadLogItem[] = []
            for (let i = 0; i < data.length; i++) {
                const tmp: DownloadLogItem = {
                    exist: data[i].exist,
                    filename: data[i].filename,
                    dir: data[i].dir
                }
                if (data[i].dir == dir && data[i].filename == filename) {
                    tmp.exist = false
                }
                tmpLogItem.push(tmp)
            }
            setData(tmpLogItem)
        }
    }

    const openFile = async (dir: string, filename: string) => {
        const error = await _openFile(dir, filename)
        if (error) {
            if (error.message == "文件不存在") {
                const tmpLogItem: DownloadLogItem[] = []
                for (let i = 0; i < data.length; i++) {
                    const tmp: DownloadLogItem = {
                        exist: data[i].exist,
                        filename: data[i].filename,
                        dir: data[i].dir
                    }
                    if (data[i].dir == dir && data[i].filename == filename) {
                        tmp.exist = false
                    }
                    tmpLogItem.push(tmp)
                }
                setData(tmpLogItem)
                return
            }
            errorNotification("打开文件", error)
        }
    }

    const deleteFile = async (dir: string, filename: string) => {
        const error = await $removeDownloadLogItem(filename, dir)
        if (error) {
            errorNotification("删除文件", error)
            return
        }
        const tmpLogItem: DownloadLogItem[] = []
        for (let i = 0; i < data.length; i++) {
            const tmp: DownloadLogItem = {
                exist: data[i].exist,
                filename: data[i].filename,
                dir: data[i].dir
            }
            if (data[i].dir == dir && data[i].filename == filename) {
                tmp.exist = false
            }
            tmpLogItem.push(tmp)
        }
        setData(tmpLogItem)
    }

    const clearDownloadLog = async () => {
        const error = await $clearDownloadLog()
        if (error) {
            errorNotification("删除导出记录", error)
            return
        }
        setData([])
        setItems([])
    }
    return (
        <><ConfigProvider
            theme={{
                components: {
                    Tooltip: {
                        borderRadius: 0,
                        colorBgSpotlight: "rgba(255, 255, 255)",
                        colorTextLightSolid: "rgba(0, 0, 0)",
                        fontSize: 12,
                        boxShadowSecondary: "0 0 0px 1px rgba(0, 0, 0,0.5)",
                        // paddingXS: 4,
                        controlHeight: 14,
                        paddingSM: 2,
                    },
                },
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span>下载</span>
                <span>
                    <Tooltip placement="bottom" arrow={false} title="打开下载列表">
                        <Button type="text" size="large" icon={<FolderOpenOutlined />} onClick={openDataFolder} />
                    </Tooltip>
                    <Tooltip placement="bottomRight" arrow={false} title="文件仍存在">
                        <Button type="text" size="large" icon={<DeleteOutlined />} onClick={clearDownloadLog}>
                            清空记录
                        </Button>
                    </Tooltip>
                </span>
            </div>
            <Divider />
        </ConfigProvider>
            <div style={{ width: "280px" }}>
                <InfiniteScroll
                    dataLength={data.length}
                    next={loadMoreData}
                    hasMore={data.length < items.length}
                    loader={<span style={{ display: 'flex', justifyContent: "center", alignItems: 'center' }}><Spin spinning={true} size="small" /></span>}
                    scrollableTarget="scrollableDiv"
                    height={400}
                >
                    <ConfigProvider theme={{
                        components: {
                            List: {
                                itemPaddingSM: "0px 0px"
                            },
                            Tooltip: {
                                borderRadius: 0,
                                colorBgSpotlight: "rgba(255, 255, 255)",
                                colorTextLightSolid: "rgba(0, 0, 0)",
                                fontSize: 12,
                                boxShadowSecondary: "0 0 0px 1px rgba(0, 0, 0,0.5)",
                                // paddingXS: 4,
                                controlHeight: 14,
                                paddingSM: 2,
                            },
                        }
                    }}>
                        <List
                            dataSource={data}
                            split={false}
                            size="small"
                            renderItem={(item: DownloadLogItem) => (
                                <List.Item
                                    key={item.dir + item.filename}
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
                                        <Tooltip placement="bottom" arrow={false} title={item.filename}>
                                            <span
                                                style={{
                                                    textDecoration: !item.exist ? "line-through" : "",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: 'ellipsis',
                                                    width: "100%",
                                                }}
                                            >
                                                {item.filename}
                                            </span>
                                        </Tooltip>

                                        <span>
                                            {!item.exist ?
                                                <label style={{ paddingLeft: "0px", paddingTop: "0px", height: "22px", fontSize: "12px" }}>已删除</label>
                                                :
                                                <Button style={{ paddingLeft: "0px", paddingTop: "0px", height: "22px", fontSize: "12px" }} type="link"
                                                    onClick={() => openFile(item.dir, item.filename)}
                                                >打开文件</Button>}

                                        </span>
                                        {!item.exist ?
                                            ""
                                            : <span
                                                className="file"
                                                style={{
                                                    justifyItems: "center",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <Tooltip placement="bottom" arrow={false} title="打开文件夹">
                                                    <Button size="large" type="text" icon={<FolderOpenOutlined />}
                                                        onClick={() => showFileInFolder(item.dir, item.filename)} />
                                                </Tooltip>
                                                <Tooltip placement="bottom" arrow={false} title="删除文件">
                                                    <Button size="large" type="text" icon={<DeleteOutlined />}
                                                        onClick={() => deleteFile(item.dir, item.filename)} />
                                                </Tooltip>
                                            </span>}

                                    </span>
                                </List.Item>
                            )} />
                    </ConfigProvider>
                </InfiniteScroll>
            </div></>
    );
};

const Update: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const version = useRef(packageJson.version)
    const [releaseUrl, setReleaseUrl] = useState<string>("")
    const [releaseVersion, setReleaseVersion] = useState<string>("")
    const [releaseDescription, setReleaseDescription] = useState<string>("")
    const serverIsAvailable = useSelector((state: RootState) => state.server.available)
    const dispatch = useDispatch()
    useEffect(() => {
        if (serverIsAvailable) {
            dispatch(setServerStarted(false))
            $checkUpdate()
                .then(resp => {
                    const result = resp.data
                    if (result["code"] != 200) {
                        return
                    }
                    const newVersion = result["data"]["version"]
                    if (newVersion && semver.gt(newVersion, version.current)) {
                        setReleaseUrl(result["data"]["url"])
                        setReleaseDescription(result["data"]["description"])
                        setReleaseVersion(newVersion)
                        setOpen(true)
                    }
                })
                .catch(() => {
                    setOpen(false)
                })
        }

    }, [serverIsAvailable])

    const checkUpdate = () => {
        if (releaseUrl != "") {
            setOpen(true)
            return
        }
        setLoading(true)
        $checkUpdate()
            .then(resp => {
                const result = resp.data
                if (result["code"] != 200) {
                    errorNotification("检查更新", result["message"])
                    setLoading(false)
                    return
                }
                const newVersion = result["data"]["version"]
                if (newVersion && semver.gt(newVersion, version.current)) {
                    setLoading(false)
                    setOpen(true)
                    setReleaseUrl(result["data"]["url"])
                    setReleaseDescription(result["data"]["description"])
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
                icon={<Badge dot={releaseUrl != ""} offset={[0, 0]}>
                    <SyncOutlined spin={loading} />
                </Badge>}
                type="text"
                style={buttonStyle}
                onClick={checkUpdate} />
        </Tooltip>
        <Modal
            // maskStyle={{ marginTop: "30px" }}
            title="检查更新"
            cancelButtonProps={{ size: "small" }}
            okButtonProps={{ size: "small" }}
            open={open}
            onOk={() => {
                setOpen(false)
                _openDefaultBrowser(releaseUrl);
            }}
            onCancel={() => setOpen(false)}
            okText={"下载更新"}
        >
            <div
                style={{
                    backgroundColor: "rgba(250, 250, 250,0.5)",
                    borderLeft: "2px solid #5cdbd3",
                }}
            >
                <span>
                    最新版本:&nbsp;{releaseVersion}
                </span><br />
                <span style={{ display: 'flex', flexDirection: "column" }}>
                    <span>更新内容:</span>
                    {(releaseDescription && <span style={{ whiteSpace: "pre", margin: "2px" }}>&nbsp;&nbsp;&nbsp;&nbsp;{releaseDescription}</span>)}
                </span>
                <span style={{ display: 'flex', flexDirection: "column" }}>
                    <span>下载地址:</span>
                    {(releaseUrl && <span style={{ whiteSpace: "pre", margin: "2px" }}>&nbsp;&nbsp;&nbsp;&nbsp;{releaseUrl}</span>)}
                </span>
            </div>
        </Modal></>
}

const Proxy: React.FC = () => {
    const proxy = useSelector((state: RootState) => state.config.proxy)
    const [url, setUrl] = useState<string>("")
    const [open, setOpen] = useState<boolean>(false)
    useEffect(() => {
        setUrl(`${proxy.type}://${proxy.host}:${proxy.port}`)
    }, [proxy])

    return <>
        <Popover
            content={<ProxyComp />}
            trigger={"click"}
            open={open}
            onOpenChange={(value) => setOpen(value)}
        >
            <Tooltip
                // placement={platform == "win32" ? "bottom" : "bottomLeft"}
                title={proxy.enable ? "当前代理" : "代理已禁用"}
            >
                <Button
                    type="text"
                    style={{
                        borderRadius: "0",
                        height: "30px",
                        width: !proxy.enable ? "30px" : "auto",
                        transition: "0s",
                    }}
                    icon={
                        <Space direction="horizontal" size={1}>
                            {
                                proxy.enable ?
                                    <>
                                        <span style={{ display: "flex", marginBottom: "5px" }}>
                                            <SendOutlined rotate={315} style={{ color: proxy.enable ? "red" : "" }} />
                                        </span>
                                        {/* <Tag bordered={false} style={{ lineHeight: "20px", fontSize: "14px", marginRight: "0px" }}>
                                            {url}
                                        </Tag> */}

                                    </>
                                    :
                                    <span style={{ display: "flex", marginBottom: "5px" }}>
                                        <SendOutlined rotate={315} style={{ color: proxy.enable ? "red" : "" }} />
                                    </span>
                            }
                        </Space>
                    }
                    size="small"
                >

                    {
                        proxy.enable &&
                        <Tag bordered={false} style={{ lineHeight: "20px", fontSize: "14px", marginRight: "0px" }}>
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
    const hasNewLogItem = useSelector((state: RootState) => state.downloadLog.hasNewItem)
    const dispatch = useDispatch()
    useEffect(() => {
        if (hasNewLogItem) {
            setOpen(true)
            dispatch(setHasNewLogItem(false))
        }
    }, [hasNewLogItem])
    return <>
        <Proxy />
        <ConfigProvider
            theme={{
                components: {
                    Popover: {
                        minWidth: 250,
                    },
                    Divider: {
                        marginLG: 5,
                    },
                },
            }}
        >
            <Tooltip
                // placement={platform == "win32" ? "bottom" : "bottomLeft"}
                title="导出记录"
            >
                <Popover
                    content={<DownloadViewContent />}
                    trigger={"click"}
                    destroyTooltipOnHide
                    open={open}
                    onOpenChange={(value) => setOpen(value)}
                >
                    <Button
                        type="text"
                        style={buttonStyle}
                        icon={<DownloadOutlined />}
                        size="small"
                    />
                </Popover>
            </Tooltip>
        </ConfigProvider>
    </>
}

const Bar: React.FC = () => {
    const [platform, setPlatform] = useState<string>("")
    const version = useRef(packageJson.version)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            setPlatform("win32")
            return
        }
        _getPlatform().then(
            (platform) => {
                setPlatform(platform)
            }
        ).catch()
        // genshinLaunch()
    }, [])

    return (
        <div id="drag" className="bar">
            <div className="left">{appIcon(platform)}</div>
            <div className="right">
                <Space size={1}>
                    <span onClick={genshinLaunch} style={{ color: "#4676c3", margin: "0px 10px 0px 10px" }}> v{version.current}</span>
                    <DownloadHistory />
                    <Update />
                    <Tooltip placement="bottom" title="Github">
                        <Button
                            type="text"
                            style={buttonStyle}
                            icon={<GithubOutlined />}
                            size="small"
                            onClick={() => {
                                _openDefaultBrowser(GITHUB_URL)
                            }}
                        />
                    </Tooltip>
                    <Tooltip placement={platform == "win32" ? "bottom" : "bottomLeft"} title="提交Bug" >
                        <Button
                            type="text"
                            style={buttonStyle}
                            icon={<BugOutlined />}
                            size="small"
                            onClick={() => {
                                _openDefaultBrowser(ISSUE_URL)
                            }}
                        />
                    </Tooltip>
                    {platform == "win32" ? <TitleBarOverlay /> : <></>}
                </Space>
            </div>
        </div>
    )
}

export default Bar;
