import {CloudDownloadOutlined, LoadingOutlined} from '@ant-design/icons';
import {Button, Checkbox, Flex, Input, Modal, Pagination, Popconfirm, Space, Splitter, Tag, Tooltip} from 'antd';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {errorNotification} from '@/component/Notification';
import {useSelector} from 'react-redux';
import {formatTimeSpent} from '@/util/util';
import {EventsOn} from "../../wailsjs/runtime";

import {
    TaskCreate,
    TaskDelete,
    TaskExportData,
    TaskGetByID,
    TaskGetData,
    TaskGetList,
    TaskPause,
    TaskResume,
    TaskRun,
    TaskUpdateName
} from "../../wailsjs/go/icp/Bridge";
import {WithIndex} from "@/component/Interface";
import {event, icp, models} from "../../wailsjs/go/models";
import {RootState} from "@/store/store";
import Candidate, {ItemType} from "@/component/Candidate";
import {FindByPartialKey} from "../../wailsjs/go/history/Bridge";
import {AgGridReact} from "ag-grid-react";
import {
    CellValueChangedEvent,
    ColDef,
    GetRowIdParams,
    ICellRendererParams,
    ITooltipParams,
    ValueGetterParams
} from "ag-grid-community";
import TextArea from "antd/es/input/TextArea";
import {AGGridCommonOptions} from "@/pages/Props";
import EventDetail = event.EventDetail;

type PageDataType = WithIndex<icp.Task>

const SerivceOptions = [
    {value: '1', label: '网站',},
    {value: '6', label: 'APP',},
    {value: '7', label: '小程序',},
    {value: '8', label: '快应用',},
]

interface IcpTaskProps {
    onSelectedTask?: (taskID: number) => void
}

const IcpTask = React.forwardRef<IcpTaskProps, any>((props, ref) => {
    const status = useSelector((state: RootState) => state.app.global.status)
    const event = useSelector((state: RootState) => state.app.global.event)
    const history = useSelector((state: RootState) => state.app.global.history)
    const [pageSizeOptions] = useState([40, 80, 100])
    const [total, setTotal] = useState<number>(0)
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const [currentPageNum, setCurrentPageNum] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const [inputCache, setInputCache] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const taskID = useRef(0)
    const [open, setOpen] = useState(false)
    const [taskName, setTaskName] = useState<string>("")
    const [targets, setTargets] = useState<string>("")
    const [serviceTypes, setServiceTypes] = useState<string[]>(["1"])
    const gridRef = useRef<AgGridReact>(null)
    const [columnDefs] = useState<ColDef[]>([
        {headerName: '序号', field: "index", width: 80, pinned: 'left', tooltipField: 'index'},
        // field必须是data的一个字段不然无法更新
        {
            headerName: '操作',
            field: "status",
            pinned: 'right',
            width: 320,
            cellRenderer: (params: ICellRendererParams) => {
                return <Space.Compact>
                    <Button
                        size={"small"}
                        type="primary"
                        disabled={params.data.status === status.Running || params.data.status === status.Pausing}
                        onClick={() => {
                            TaskRun(params.data.taskID)
                        }
                        }>开始</Button>
                    <Button
                        size={"small"}
                        type="primary"
                        disabled={!(params.data.status === status.Running)}
                        onClick={() => TaskPause(params.data.taskID)
                        }>{params.data.status === status.Running ? "暂停" : params.data.status === status.Pausing ? "暂停中" : "暂停"}</Button>
                    <Button
                        size={"small"}
                        type="primary"
                        disabled={!(params.data.status === status.Paused || params.data.status === status.Error)}
                        onClick={() => TaskResume(params.data.taskID)}
                    >继续</Button>
                    <Button
                        size={"small"}
                        type="primary"
                        onClick={() => {
                            taskID.current = params.data.taskID
                            setOpen(true)
                            TaskGetByID(taskID.current)
                                .then(r => {
                                    setTaskName(r.name)
                                    setServiceTypes(r.serviceTypes.split("\n"))
                                    setTargets(r.targets)
                                })
                                .catch()
                        }
                        }>查看</Button>
                    <Button
                        size={"small"}
                        type="primary"
                        onClick={() => {
                            if (props.onSelectedTask) {
                                props.onSelectedTask(params.data.taskID)
                            }
                        }
                        }>结果</Button>
                    <Popconfirm
                        placement={"left"}
                        title="删除任务"
                        description="确定删除吗?"
                        onConfirm={() => {
                            TaskDelete(params.data.taskID)
                                .then(() => refresh())
                                .catch(e => errorNotification("错误", e))
                        }}

                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            size={"small"}
                            type="primary"
                        >删除</Button>
                    </Popconfirm>
                </Space.Compact>
            }
        },
        {headerName: '名称', field: "name", pinned: 'left', width: 150, editable: true, tooltipField: 'name'},
        {
            headerName: '查询内容', field: "serviceTypes", width: 240,
            cellRenderer: (params: ICellRendererParams) => {
                const serviceTypes = params.data.serviceTypes?.split("\n")
                const a: any[] = [];
                serviceTypes.forEach((serviceType: string, index: number) => {
                    if (serviceType === "1") {
                        a.push(<Tag key={index} color="#2db7f5">网站</Tag>)
                    } else if (serviceType === "6") {
                        a.push(<Tag key={index} color="#87d068">APP</Tag>)
                    } else if (serviceType === "7") {
                        a.push(<Tag key={index} color="#108ee9">小程序</Tag>)
                    } else if (serviceType === "8") {
                        a.push(<Tag key={index} color="#d48806">快应用</Tag>)
                    }
                })
                return <Flex gap={1} align={"center"} style={{height: '100%'}}>{a.map(i => i)}</Flex>
            }
        },

        {
            headerName: '进度', field: "current", width: 100,
            tooltipValueGetter: (params: ITooltipParams) => `${params.data.current}/${params.data.total}`,
            valueGetter: (params: ValueGetterParams) => `${params.data.current}/${params.data.total}`
        },
        {
            headerName: '用时', field: "timeSpent", width: 100,
            tooltipValueGetter: (params: ITooltipParams) => formatTimeSpent(params.data.timeSpent),
            valueGetter: (params: ValueGetterParams) => formatTimeSpent(params.data.timeSpent)
        },
        {
            headerName: '状态', field: "status", width: 100,
            cellRenderer: (params: ICellRendererParams) => {
                switch (params.data.status) {
                    case status.Waiting:
                        return <Tag color="#A0AEC0">等待中</Tag>
                    case status.Running:
                        return <Tag color="#48BB78">进行中</Tag>
                    case status.Error:
                        return <Tooltip title={params.data.message}><Tag color="#F56565">错误</Tag></Tooltip>
                    case status.Pausing:
                        return <Tag color="#ED8936">暂停中</Tag>
                    case status.Paused:
                        return <Tag color="#ED8936">已暂停</Tag>
                    case status.Stopped:
                        return <Tag color="#718096">已结束</Tag>
                    default:
                        return <></>
                }
            }
        },
        {
            headerName: '添加时间', field: "createdAt", width: 180,
            tooltipValueGetter: (params: ITooltipParams) => params.data?.createdAt?.substring(0, 19),
            valueGetter: (params: ValueGetterParams) => params.data?.createdAt?.substring(0, 19)
        },
    ]);

    useEffect(() => {
        getTaskList("", currentPageNum, currentPageSize)
        EventsOn(event.ICPBatchQueryStatusUpdate, (data: EventDetail) => {
            updateCell(data.Data)
        })
    }, []);

    const getRowId = useCallback((params: GetRowIdParams) => {
        return String(params.data.taskID);
    }, []);

    const updateCell = useCallback((data: icp.Task) => {
        const rowNode = gridRef.current?.api?.getRowNode(String(data.taskID))!;
        rowNode?.updateData({...rowNode.data, ...data});
    }, []);

    const handleNewQuery = (taskName: string, pageSize: number) => {
        setCurrentPageNum(1)
        setTotal(0)
        getTaskList(taskName, 1, pageSize)
    }

    const handlePaginationChange = (newPage: number, newSize: number) => {
        //page发生变换
        if (newPage !== currentPageNum && newSize === currentPageSize) {
            setCurrentPageNum(newPage)
            setLoading(true)
            TaskGetList(taskName, newPage, currentPageSize)
                .then(r => {
                    const offset = (newPage - 1) * currentPageSize
                    setTotal(r.Total)
                    setPageData(r.Items?.map((item, i) => {
                        const index = offset + i + 1
                        return {...item, index: index} as PageDataType
                    }))
                })
                .catch(e => {
                    errorNotification("错误", e)
                })
        }

        //size发生变换
        if (newSize !== currentPageSize) {
            setCurrentPageSize(newSize)
            handleNewQuery(inputCache, newSize)
        }
    }

    const cancelSubmitNewTask = () => {
        setOpen(false)
        if (taskID.current !== 0) {
            taskID.current = 0
            setTargets("")
            setTaskName("")
            setServiceTypes([])
            return
        }
    }

    const submitNewTask = () => {
        setOpen(false)
        if (taskID.current !== 0) {
            taskID.current = 0
            return
        }
        TaskCreate(taskName, targets.split("\n"), serviceTypes)
            .then(() => {
                getTaskList("", currentPageNum, currentPageSize)
            })
            .catch(e => {
                errorNotification("错误", e)
            })
        setTaskName("")
        setTargets("")
        setServiceTypes(["1"])
    }

    const getTaskList = (taskName: string, pageNum: number, pageSize: number) => {
        setLoading(true)
        TaskGetList(taskName, pageNum, pageSize)
            .then(r => {
                const offset = (pageNum - 1) * pageSize
                setTotal(r.Total)
                const data = r.Items?.map((item, i) => {
                    const index = offset + i + 1
                    return {...item, index: index} as PageDataType
                }) || []
                setPageData(data)
            })
            .catch(e => {
                errorNotification("错误", e)
            })
        setLoading(false)
    }

    const refresh = () => {
        setCurrentPageNum(1)
        getTaskList("", 1, currentPageSize)
    }

    const onCellValueChanged = (event: CellValueChangedEvent) => {
        TaskUpdateName(event.data.taskID, event.newValue || "")
            .catch(
                e => errorNotification("错误", e)
            )
    }

    const footer = (<Flex justify={"right"} align={'center'} style={{padding: '5px'}}>
        <Pagination
            showQuickJumper
            showSizeChanger
            total={total}
            pageSizeOptions={pageSizeOptions}
            defaultPageSize={pageSizeOptions[0]}
            defaultCurrent={1}
            current={currentPageNum}
            showTotal={(total) => `${total} items`}
            size="small"
            onChange={(page, size) => handlePaginationChange(page, size)}
        />
    </Flex>)

    return (<Flex vertical style={{width: "100%", height: "100%", paddingBottom: '5px', boxSizing: 'border-box'}}>
        <Modal
            open={open}
            destroyOnClose
            closable={false}
            okButtonProps={{size: 'small'}}
            cancelButtonProps={{size: 'small'}}
            maskClosable={false}
            styles={{
                body: {width: '100%'}
            }}
            onOk={submitNewTask}
            onCancel={cancelSubmitNewTask}
        >
            <Flex vertical gap={10}>
                <Flex gap={5} align={"center"}>
                    <span style={{display: "inline-block", width: "80px"}}>任务名称</span>
                    <Input value={taskName} onChange={e => setTaskName(e.target.value)} size={"small"}/>
                </Flex>
                <Flex gap={5}>
                    <span style={{display: "inline-block", width: "80px"}}>查询目标</span>
                    <TextArea
                        value={targets}
                        onChange={e => setTargets(e.target.value)}
                        size={"small"}
                        autoSize={{maxRows: 5, minRows: 5}}
                        style={{width: "100%"}}
                        placeholder={"每行一个单位名称或域名或备案号查询，请勿使用子域名或者带http://www等字符的网址查询"}
                    />
                </Flex>
                <Flex align={"center"}>
                    <span style={{display: "inline-block", width: "80px"}}>查询内容</span>
                    <Checkbox.Group
                        style={{display: "inline-block"}}
                        options={SerivceOptions}
                        defaultValue={serviceTypes}
                        onChange={(checkedValue) => {
                            setServiceTypes(checkedValue)
                        }}
                    />
                </Flex>
            </Flex>
        </Modal>
        <Flex vertical style={{width: "100%", height: "100%"}}>
            <Flex gap={10} style={{padding: '5px 0px 5px 5px'}} justify={"center"}>
                <Candidate
                    placeholder={"名称"}
                    size={"small"}
                    style={{width: '400px'}}
                    allowClear
                    onSearch={(value) => {
                        setInputCache(value)
                        handleNewQuery(value, currentPageSize)
                    }}
                    items={[
                        {
                            fetch: async (v) => {
                                try {
                                    const response = await FindByPartialKey(history.ICP, !v ? "" : v.toString());
                                    const a: ItemType<string>[] = response?.map(item => {
                                        const t: ItemType<string> = {
                                            value: item,
                                            label: item,
                                            data: item
                                        }
                                        return t;
                                    });
                                    return a;
                                } catch (e) {
                                    errorNotification("错误", String(e));
                                    return []; // 如果出现错误，返回空数组，避免组件出现异常
                                }
                            }
                        }
                    ]}
                />
                <Button size={"small"} variant="solid" color="primary" onClick={() => setOpen(true)}>新建任务</Button>
                <Button size={"small"} variant="solid" color="primary" onClick={() => refresh()}>刷新</Button>
            </Flex>
            <div style={{width: "100%", height: "100%"}}>
                <AgGridReact
                    {...AGGridCommonOptions}
                    ref={gridRef}
                    loading={loading}
                    rowData={pageData}
                    columnDefs={columnDefs}
                    sideBar={false}
                    onCellValueChanged={onCellValueChanged}
                    getRowId={getRowId}
                />
            </div>
            {footer}
        </Flex>
    </Flex>)
})

interface IcpTaskResultProps {
    taskID?: number
}

type PageDataType2 = WithIndex<models.ItemWithID>

const IcpTaskResult: React.FC<IcpTaskResultProps> = (props) => {
    const history = useSelector((state: RootState) => state.app.global.history)
    const event = useSelector((state: RootState) => state.app.global.event)
    const stat = useSelector((state: RootState) => state.app.global.status)
    const [pageSizeOptions] = useState([40, 80, 100])
    const [total, setTotal] = useState<number>(0)
    const [pageData, setPageData] = useState<PageDataType2[]>([])
    const [currentPageNum, setCurrentPageNum] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const [inputCache, setInputCache] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const gridRef = useRef<AgGridReact>(null)
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [disable, setDisable] = useState<boolean>(false)
    const exportID = useRef(0)
    const [columnDefs] = useState<ColDef[]>([
        {headerName: '序号', field: "index", width: 80, pinned: 'left', tooltipField: 'index'},
        {headerName: '名称', field: "unitName", width: 250, pinned: 'left', tooltipField: 'unitName'},
        {headerName: '备案内容', field: "serviceName", width: 200, tooltipField: 'serviceName'},
        {headerName: '备案类型', field: "serviceType", width: 100, tooltipField: 'serviceType'},
        {headerName: '备案号', field: "serviceLicence", width: 200, tooltipField: 'serviceLicence'},
        {headerName: '备案法人', field: "leaderName", width: 150, tooltipField: 'leaderName'},
        {headerName: '单位性质', field: "natureName", width: 100, tooltipField: 'natureName'},
        {headerName: '审核日期', field: "updateRecordTime", width: 200, tooltipField: 'updateRecordTime'},
    ]);

    useEffect(() => {
        if (props.taskID) {
            handleNewQuery("", currentPageSize)
        }
    }, [props.taskID]);

    useEffect(() => {
        EventsOn(event.ICPExport, (eventDetail: event.EventDetail) => {
            if (eventDetail.ID !== exportID.current) {
                return
            }
            setIsExporting(false)
            setDisable(false)
            if (eventDetail.Status === stat.Error) {
                errorNotification("错误", eventDetail.Error)
            }
        })
    }, []);

    const handleNewQuery = (unitName: string, pageSize: number) => {
        setCurrentPageNum(1)
        setTotal(0)
        setLoading(true)
        TaskGetData(unitName, 1, pageSize, props.taskID || 0)
            .then(r => {
                let index = 0
                setTotal(r.Total)
                setPageData(r.Items.map(item => ({index: ++index, ...item} as PageDataType2)))
            })
            .catch(e => errorNotification("错误", e))
        setLoading(false)
    }

    const handlePaginationChange = (newPage: number, newSize: number) => {
        //page发生变换
        if (newPage !== currentPageNum && newSize === currentPageSize) {
            setCurrentPageNum(newPage)
            setLoading(true)
            TaskGetData(inputCache, newPage, currentPageSize, props.taskID || 0)
                .then(r => {
                    let index = (newPage - 1) * currentPageSize
                    setTotal(r.Total)
                    setPageData(r.Items.map(item => ({index: ++index, ...item} as PageDataType2)))
                })
                .catch(e => errorNotification("错误", e))
            setLoading(false)
        }

        //size发生变换
        if (newSize !== currentPageSize) {
            setCurrentPageSize(newSize)
            handleNewQuery(inputCache, newSize)
        }
    }

    const exportData = async () => {
        if (total === 0) {
            errorNotification("错误", '无数据可导出')
            return
        }
        setIsExporting(true)
        setDisable(true)
        try {
            exportID.current = await TaskExportData(inputCache, props.taskID || 0)
        } catch (e) {
            errorNotification("导出结果", e)
            setDisable(false)
            setIsExporting(false)
        }
    }

    const footer = (<Flex gap={5} justify={"right"} align={'center'} style={{padding: '5px'}}>
        <Pagination
            showQuickJumper
            showSizeChanger
            total={total}
            pageSizeOptions={pageSizeOptions}
            defaultPageSize={pageSizeOptions[0]}
            defaultCurrent={1}
            current={currentPageNum}
            showTotal={(total) => `${total} items`}
            size="small"
            onChange={(page, size) => handlePaginationChange(page, size)}
        />
        <Button
            disabled={disable}
            size="small"
            onClick={async () => {
                await exportData()
            }}
            icon={isExporting ? <LoadingOutlined/> : <CloudDownloadOutlined/>}
        >
            {isExporting ? "正在导出" : "导出结果"}
        </Button>
    </Flex>)

    return <Flex vertical style={{height: "100%", paddingTop: '10px', boxSizing: 'border-box', gap: '5px'}}>
        {props.taskID !== 0 && <Flex justify={"center"}><Candidate
            placeholder={"名称"}
            style={{width: '400px'}}
            size={"small"}
            allowClear
            onSearch={value => {
                setInputCache(value)
                handleNewQuery(value, currentPageSize)
            }}
            items={[
                {
                    fetch: async (v) => {
                        try {
                            const response = await FindByPartialKey(history.ICP, !v ? "" : v.toString());
                            const a: ItemType<string>[] = response?.map(item => {
                                const t: ItemType<string> = {
                                    value: item,
                                    label: item,
                                    data: item
                                }
                                return t;
                            });
                            return a;
                        } catch (e) {
                            errorNotification("错误", String(e));
                            return []; // 如果出现错误，返回空数组，避免组件出现异常
                        }
                    }
                }
            ]}
        /></Flex>}
        <div style={{width: "100%", height: "100%"}}>
            <AgGridReact
                {...AGGridCommonOptions}
                ref={gridRef}
                loading={loading}
                rowData={pageData}
                columnDefs={columnDefs}
                sideBar={false}
            />
        </div>
        {footer}
    </Flex>
}
const IcpBulk: React.FC = () => {
    const [taskID, setTaskID] = useState<number>(0)
    return (<Flex vertical style={{height: "100%"}}>
        <Splitter layout="vertical" lazy={true}>
            <Splitter.Panel collapsible defaultSize={"30%"}>
                <IcpTask onSelectedTask={setTaskID}/>
            </Splitter.Panel>
            <Splitter.Panel collapsible>
                <IcpTaskResult taskID={taskID}/>
            </Splitter.Panel>
        </Splitter>
    </Flex>)
}


export default IcpBulk