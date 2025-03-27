import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import TextArea from "antd/es/input/TextArea";
import {Button, Flex, InputNumber, Space, Splitter, Tooltip} from "antd";
import "@/pages/Httpx.css"
import {errorNotification} from "@/component/Notification";
import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";
import {SyncOutlined} from "@ant-design/icons";
import {Run, SetConfig, Stop} from "../../wailsjs/go/httpx/Bridge";
import {useDispatch, useSelector} from "react-redux";
import {appActions, RootState} from "@/store/store";
import {Chrome} from "@/component/Icon";
import {copy, copyCol, copyRow, strSplit} from "@/util/util";
import TabsV2 from "@/component/TabsV2";
import {AgGridReact} from "ag-grid-react";
import {
    ColDef,
    GetContextMenuItemsParams,
    GetRowIdParams,
    ICellRendererParams,
    MenuItemDef,
    SideBarDef
} from "ag-grid-community";
import {config, event} from "../../wailsjs/go/models";
import LabelInput from "@/component/LabelInput";
import FileSelector from "@/component/FileSelector";
import {AGGridCommonOptions} from "@/pages/Props";
import EventDetail = event.EventDetail;

interface PageDataType {
    "index": number,
    "url": string,
    "detail": string
}

const TabContent = () => {
    const gridRef = useRef<AgGridReact>(null);
    // const [path, setPath] = useState<string>("")
    // const [flags, setFlags] = useState<string>("")
    const [running, setRunning] = useState<boolean>(false)
    const [targets, setTargets] = useState<string>("")
    const [offset, setOffset] = useState<number>(1)
    const [limit, setLimit] = useState<number>(15)
    const taskID = useRef<number>(0)
    const dispatch = useDispatch()
    const cfg = useSelector((state: RootState) => state.app.global.config)
    const status = useSelector((state: RootState) => state.app.global.status)
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const [total, setTotal] = useState(0)
    const totalRef = useRef(0)
    const event = useSelector((state: RootState) => state.app.global.event)
    const [columnDefs] = useState<ColDef[]>([
        {headerName: '序号', field: "index", width: 80, pinned: 'left', tooltipField: 'index'},
        {
            headerName: '链接', field: "url", width: 300, tooltipField: 'url',
            cellRenderer: (params: ICellRendererParams) => {
                if (!params.value) return <></>
                return <span style={{gap: "10"}}>
                    <Chrome onClick={() => {
                        BrowserOpenURL(params.value);
                    }}/> {params.value}
                </span>
            }
        },
        {headerName: '其他信息', field: "detail", width: 600},
    ]);

    const defaultSideBarDef = useMemo<SideBarDef>(() => {
        return {
            toolPanels: [
                {
                    id: "columns",
                    labelDefault: "分组",
                    labelKey: "columns",
                    iconKey: "columns",
                    toolPanel: "agColumnsToolPanel",
                    toolPanelParams: {
                        suppressRowGroups: false,
                        suppressValues: false,
                        suppressPivots: true,
                        suppressPivotMode: true,
                        suppressColumnFilter: false,
                        suppressColumnSelectAll: true,
                        suppressColumnExpandAll: true,
                    },
                },
            ],
        }
    }, [])
    const getContextMenuItems = useCallback((params: GetContextMenuItemsParams,): (MenuItemDef)[] => {
        if (total === 0 || !params.node) return []
        return [
            {
                name: "浏览器打开URL",
                disabled: !params.node?.data.url,
                action: () => {
                    BrowserOpenURL(params.node?.data.url)
                },
            },
            {
                name: "复制单元格",
                disabled: !params.value,
                action: () => {
                    copy(params.value)
                },
            },
            {
                name: "复制该行",
                disabled: !params.node?.data,
                action: () => {
                    copyRow<PageDataType>(params.node?.data, gridRef.current?.api, columnDefs)
                },
            },
            {
                name: "复制该列",
                action: () => {
                    copyCol<PageDataType>(params.column, gridRef.current?.api)
                },
            },
        ];
    }, [total]);

    useEffect(() => {
        //获取事件类的单例并设置httpx输出监听器用于输出到前端
        EventsOn(event.Httpx, (eventDetail: EventDetail) => {
            if (eventDetail.ID !== taskID.current) {
                return;
            }
            if (eventDetail.Status === status.Running) {
                const data = eventDetail.Data.replaceAll(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
                if (!data.startsWith("http")) {
                    return;
                }
                let t = strSplit(data, ' ', 2)
                totalRef.current = totalRef.current + 1
                gridRef.current?.api?.applyTransactionAsync({
                    add: [{index: totalRef.current, url: t[0], detail: t[1]}]
                })
                setTotal(totalRef.current)
            } else if (eventDetail.Status === status.Stopped) {
                taskID.current = 0
                setRunning(false)
            } else if (eventDetail.Status === status.Error) {
                taskID.current = 0
                setRunning(false)
                errorNotification("错误", eventDetail.Error)
            }
        })
    }, []);

    const saveHttpxFlag = (flag: string | number | undefined) => {
        saveHttpx(cfg.Httpx.Path, flag)
    }

    const saveHttpxPath = (path: string) => {
        if (!path) return
        saveHttpx(path, cfg.Httpx.Flags)
    }

    const saveHttpx = (path: string, flag: string | number | undefined) => {
        SetConfig(path, flag as string).then(
            () => {
                const t = {...cfg, Httpx: {...cfg.Httpx, Flags: flag, Path: path}} as config.Config;
                dispatch(appActions.setConfig(t))
            }
        ).catch(e => {
            errorNotification("错误", e)
        })
    }

    const run = () => {
        setPageData([])
        setOffset(1)
        setLimit(15)
        setTotal(0)
        totalRef.current = 0
        Run(cfg.Httpx.Path, cfg.Httpx.Flags, targets).then(r => {
            taskID.current = r
            setRunning(true)
        }).catch(err => {
            errorNotification("错误", err)
            setRunning(false)
        })
    }

    const stop = () => {
        Stop(taskID.current).then(r => {
            taskID.current = 0
            setRunning(false)
        }).catch(err => {
            errorNotification("错误", err)
        })
    }

    const BrowserOpenMultiUrl = () => {
        const sortedData: PageDataType[] = [];
        gridRef.current?.api.forEachNodeAfterFilterAndSort((node) => {
            sortedData.push(node.data);
        });
        const total = sortedData?.length
        if (!total) return
        for (const data of sortedData.slice(offset - 1, offset - 1 + limit)) {
            BrowserOpenURL(data.url)
        }
        const nextOffset = offset + limit
        setLimit(nextOffset > total ? 0 : limit)
        setOffset(nextOffset > total ? total : nextOffset)
    }

    return (
        <Flex vertical gap={5} style={{height: '100%'}}>
            <Flex gap={5} vertical>
                <Flex gap={10} justify={"center"}>
                    <FileSelector label="Httpx路径" value={cfg.Httpx.Path} inputWidth={400} onSelect={saveHttpxPath}/>
                    <Tooltip title={"请勿添加-l或-u"} placement={"bottom"}>
                        <div><LabelInput label="程序参数" value={cfg.Httpx.Flags} onBlur={saveHttpxFlag}/></div>
                    </Tooltip>
                    {!running && <Button size={"small"} onClick={run}>执行</Button>}
                    {running &&
                        <Button size={"small"} onClick={stop} icon={<SyncOutlined spin={running}/>}>终止</Button>}
                </Flex>
                <Flex gap={20} justify={"center"}>
                    <Space.Compact size={"small"}>
                        <InputNumber style={{width: "150px"}} prefix={<div>总数:</div>} value={total}/>
                        <InputNumber style={{width: "150px"}} prefix={<div>起始:</div>} min={1} value={offset}
                                     onChange={(value) => value && setOffset(value)}/>
                        <InputNumber style={{width: "150px"}} prefix={<div>长度:</div>} value={limit}
                                     onChange={(value) => value && setLimit(value)}/>
                        <Button onClick={BrowserOpenMultiUrl}>默认浏览器打开下一组</Button>
                    </Space.Compact>
                </Flex>
            </Flex>
            <Flex style={{height: '100%', padding: '5px', boxSizing: 'border-box'}}>
                <Splitter style={{overflow: "hidden"}}>
                    <Splitter.Panel defaultSize="30%" min="20%" max="70%">
                        <TextArea
                            style={{height: '100%'}}
                            size={"small"}
                            value={targets}
                            allowClear
                            onChange={e => setTargets(e.target.value)}
                            placeholder={"每行一个"}
                        />
                    </Splitter.Panel>
                    <Splitter.Panel>
                        <div style={{width: "100%", height: "100%"}}>
                            <AgGridReact
                                {...AGGridCommonOptions}
                                ref={gridRef}
                                rowData={pageData}
                                columnDefs={columnDefs}
                                getRowId={(params: GetRowIdParams) => String(params.data.index)}
                                getContextMenuItems={getContextMenuItems}
                                sideBar={defaultSideBarDef}
                            />
                        </div>
                    </Splitter.Panel>
                </Splitter>
            </Flex>
        </Flex>
    );
}


const Httpx = () => {
    return <TabsV2 defaultTabContent={<TabContent/>}/>
}

export default Httpx;
