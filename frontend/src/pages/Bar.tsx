import { LineOutlined, ExpandOutlined, CloseOutlined, CompressOutlined, BugOutlined, DownloadOutlined, GithubOutlined, DeleteOutlined, FolderOpenOutlined, SyncOutlined, SendOutlined, } from "@ant-design/icons";
import { Badge, Button, ConfigProvider, Divider, List, Modal, Popover, Space, Spin, Tag, Tooltip, } from "antd";
import React, { useEffect, useRef, useState } from "react";
import "./Bar.css";
import { useDispatch, useSelector } from "react-redux";
import { GITHUB_URL, ISSUE_URL } from "@/type";
import packageJson from '../../package.json';
import favicon from "../assets/images/paimon.svg"
import { genshinLaunch } from "./op";
import { RootState, setHasNewLogItem } from "@/store/store";
import { Proxy as ProxyComp } from "./setting/Setting"
import InfiniteScroll from "react-infinite-scroll-component";
import {
    BrowserOpenURL, EventsOn,
    Quit,
    WindowFullscreen, WindowIsFullscreen, WindowIsMaximised,
    WindowMaximise,
    WindowMinimise,
    WindowUnmaximise
} from "../../wailsjs/runtime";
import {CheckUpdate, GetPlatform, OpenFile, OpenFolder, ShowItemInFolder} from "../../wailsjs/go/runtime/Runtime";
import {errorNotification, infoNotification} from "@/component/Notification";
import {Clear, GetByOffset, MarkAsDeleted} from "../../wailsjs/go/service/DownloadLogService";
import {GetDataBaseDir} from "../../wailsjs/go/config/Config";
import {model} from "../../wailsjs/go/models";
import DownloadLog = model.DownloadLog;
import * as path from "path";
import semver from "semver/preload";
import {Get} from "../../wailsjs/go/event/Event";
const buttonStyle: React.CSSProperties = {
    borderRadius: "0",
    height: "30px",
    width: "30px",
    transition: "0s",
};

const appIcon = (platform: string) => {
    if (platform === "windows") {
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
                    icon={<LineOutlined />}
                    size="small"
                    onClick={WindowMinimise}
                />
                {this.state.fullScreen ? (
                    <Button
                        type="text"
                        style={buttonStyle}
                        icon={<CompressOutlined />}
                        size="small"
                        onClick={() => {
                            WindowUnmaximise();
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
                            WindowMaximise();
                            this.setState({fullScreen: true});
                        }}
                    />
                )}
                <Button
                    type="text"
                    style={buttonStyle}
                    icon={<CloseOutlined />}
                    size="small"
                    className="exit-button"
                    onClick={Quit}
                />
            </div>
        );
    }
}

const DownloadViewContent: React.FC = () => {

    const [data, setData] = useState<DownloadLog[]>([])
    const [total,setTotal] = useState<number>(0)
    useEffect(() => {
        loadMoreData()
        Get().then(
            result=>{
                EventsOn(String(result.hasNewDownloadItem), function(){
                    loadMoreData()
                })
            }
        )
    }, []);
    const openDataFolder = async () => {
        const dir = await GetDataBaseDir()
        OpenFolder(dir).catch(
            err=>errorNotification("错误",err)
        )
    }
    const loadMoreData = () => {
        GetByOffset(data.length, 10).then(
            result=>{
                if(result){
                        setData([...data, ...result.items]);
                        setTotal(result.total)
                }
            }
        ).catch(
            err=>errorNotification("加载下载记录", err)
        )

    }

    const showFileInFolder =  (dir: string, filename: string) => {
        try {
            ShowItemInFolder(dir, filename).catch(
                err=>errorNotification("错误",err)
            )
        }catch (e) {
            errorNotification("错误2",e)
        }

    }

    const openFile =  (dir: string, filename: string) => {
         OpenFile(dir,filename).catch(
             err=>errorNotification("错误",err)
         )
    }

    const deleteFile =  (fileID: number) => {
        setData(data.map(item=>{
            if(item.fileId==fileID){
                item.deleted=true
            }
            return item
        }))
         MarkAsDeleted(fileID).catch(
             err=>errorNotification("错误",err)
         )
    }

    const clearDownloadLog = async () => {
        const error = await Clear()
        Clear().then(
            ()=>{
                setData([])
                setTotal(0)
            }
        ).catch(
            err=>errorNotification("删除导出记录", error)
        )
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
                    hasMore={data.length<total}
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
                            renderItem={(item: DownloadLog) => (
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
                                        <Tooltip placement="bottom" arrow={false} title={item.filename}>
                                            <span
                                                style={{
                                                    textDecoration: item.deleted ? "line-through" : "",
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
                                            {item.deleted ?
                                                <label style={{ paddingLeft: "0px", paddingTop: "0px", height: "22px", fontSize: "12px" }}>已删除</label>
                                                :
                                                <Button style={{ paddingLeft: "0px", paddingTop: "0px", height: "22px", fontSize: "12px" }} type="link"
                                                    onClick={() => openFile(item.dir, item.filename)}
                                                >打开文件</Button>}

                                        </span>
                                        {item.deleted ?
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
                                                        onClick={() => deleteFile(item.fileId)} />
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
    const dispatch = useDispatch()
    useEffect(() => {
        CheckUpdate().then(
            result=>{
                const newVersion = result["version"]
                if (newVersion && semver.gt(newVersion, version.current)) {
                    setReleaseUrl(result["url"])
                    setReleaseDescription(result["description"])
                    setReleaseVersion(newVersion)
                    setOpen(true)
                }
            }
        )
    }, [])

    const checkUpdate = () => {
        if (releaseUrl != "") {
            setOpen(true)
            return
        }
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
                BrowserOpenURL(releaseUrl);
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
    useEffect(() => {
        Get().then(
            result=>{
                EventsOn(String(result.hasNewDownloadItem), function(){
                    setOpen(true)
                })
            }
        )
    }, [])
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
    const [isFullScreen,setIsFullScreen] = useState<boolean>(false)
    useEffect(() => {
        GetPlatform().then(
            result=>{
                setPlatform(result)
            }
        )
    }, [])

    const handleWindowResize=()=>{
        WindowIsMaximised().then(
            result=>{
                if(result){
                    WindowUnmaximise()
                    setIsFullScreen(false)
                    return
                }
                WindowMaximise()
                setIsFullScreen(true)
            }
        )
    }

    return (
        <div id="drag" className="bar" style={{ backgroundColor: 'rgb(255, 255, 255,1)'}} onDoubleClick={handleWindowResize}>
            <div className="left" >{appIcon(platform)}</div>
            <div className="right" onDoubleClick={(e)=>e.stopPropagation()}>
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
                                BrowserOpenURL(GITHUB_URL)
                            }}
                        />
                    </Tooltip>
                    <Tooltip placement={platform === "windows" ? "bottom" : "bottomLeft"} title="提交Bug" >
                        <Button
                            type="text"
                            style={buttonStyle}
                            icon={<BugOutlined />}
                            size="small"
                            onClick={() => {
                                BrowserOpenURL(ISSUE_URL)
                            }}
                        />
                    </Tooltip>
                    {
                        platform === "windows" &&  <div>
                            <Button
                                type="text"
                                style={buttonStyle}
                                icon={<LineOutlined />}
                                size="small"
                                onClick={WindowMinimise}
                            />
                            {isFullScreen ? (
                                <Button
                                    type="text"
                                    style={buttonStyle}
                                    icon={<CompressOutlined />}
                                    size="small"
                                    onClick={() => {
                                        WindowUnmaximise();
                                        setIsFullScreen(false)
                                    }}
                                />
                            ) : (
                                <Button
                                    type="text"
                                    style={buttonStyle}
                                    icon={<ExpandOutlined />}
                                    size="small"
                                    onClick={(e) => {
                                        WindowMaximise();
                                        setIsFullScreen(true)
                                    }}
                                />
                            )}
                            <Button
                                type="text"
                                style={buttonStyle}
                                icon={<CloseOutlined />}
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
