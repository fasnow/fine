import React, {ReactNode, useEffect, useRef, useState} from 'react';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import TextArea from "antd/es/input/TextArea";
import { Button, Dropdown, Input, InputNumber, MenuProps, Space, Table, Tabs, Tooltip } from "antd";
import "@/pages/Httpx.css"
import {GetHttpx, SaveHttpx} from "../../wailsjs/go/config/Config";
import {OpenFileDialog} from "../../wailsjs/go/runtime/Runtime";
import {errorNotification} from "@/component/Notification";

import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";
import {SyncOutlined} from "@ant-design/icons";
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit'
import {Run, Stop} from "../../wailsjs/go/httpx/Bridge";
import {useDispatch, useSelector} from "react-redux";
import {RootState, setHttpx} from "@/store/store";
import {ResizeCallbackData} from "react-resizable";
import {ColumnsType} from "antd/es/table";
import ResizableTitle from "@/component/ResizableTitle";
import {Chrome} from "@/component/Icon";
import {copy, strSplit} from "@/util/util";
import {MenuItem} from "@/component/MenuItem";
import {fofa, hunter} from "../../wailsjs/go/models";
import {GetAllEvents} from "../../wailsjs/go/constraint/Event";

const items: MenuProps['items'] = [
    MenuItem.CopyCell,
    MenuItem.CopyRow,
    MenuItem.CopyCol,
    MenuItem.CopyAll,
];
const onCell=(index:any, record:any, colKey:any) => {
    return {
        onContextMenu: () => {
            index  &&  (selectedRow = {record: record, rowIndex: index, colKey: colKey,})
        },
        onClick: () => copy(record[colKey])
    }
}
let selectedRow:any
const defaultColumns:ColumnsType = [
    {
        title: '序号', dataIndex: "index", ellipsis: true, width: 50, onCell: (record, index) => onCell(index, record, "index")
    },
    {
        title: '链接', dataIndex: "url", ellipsis: {showTitle: false}, width: 300, sorter: ((a: any, b: any) => a.url.localeCompare(b.url)),
        render: (text:any) => (
            <span style={{gap:"10"}}>
                    <Chrome onClick={() => { BrowserOpenURL(text); }} /> {text}
                </span>

        ),
        onCell: (record, index) => onCell(index, record, "url")
    },
    {
        title: '其他信息', dataIndex: "detail", ellipsis: true, sorter: ((a: any, b: any) => a.detail.localeCompare(b.detail)),
        onCell: (record, index) => onCell(index, record, "detail")
    },
]
const TabContent=()=>{

    const [path,setPath] = useState<string>("")
    const [flags,setFlags] = useState<string>("")
    const [running,setRunning] = useState<boolean>(false)
    const [targets,setTargets] = useState<string>("")
    const fitAddon = useRef<FitAddon>(new  FitAddon());
    // const [total,setTotal] = useState<number>(0)
    const [offset,setOffset] = useState<number>(1)
    const [limit,setLimit] = useState<number>(15)
    const taskID = useRef<number>(0)
    useRef<HTMLDivElement>(null);
    const httpxConfig = useSelector((state: RootState) => state.config.httpx)
    const dispatch = useDispatch()
    const [height, setHeight] = useState(window.innerHeight - 200)
    const [dataList,setDataList] = useState<{"index":number,"url":string,"detail":string}[]>([])
    const [columns, setColumns] = useState(defaultColumns)
    const tblRef: Parameters<typeof Table>[0]['ref'] = React.useRef(null);
    const [open, setOpen] = useState(false)

    useEffect(() => {
        window.addEventListener("resize",()=>{
            setHeight(window.innerHeight - 200)
        })

        //设置httpx配置
        GetHttpx().then(
            result=>{
                setPath(result.path)
                setFlags(result.flags)
                dispatch(setHttpx({path:result.path,flags:result.flags}))
            }
        )

        //获取事件类的单例并设置httpx输出监听器用于输出到前端
        GetAllEvents().then(
            result=>{
                EventsOn(String(result.httpxOutput),(value)=>{
                    if (!value.taskID || value.taskID !== taskID.current){
                        return
                    }
                    let data = value.data
                    data = data.replaceAll(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
                    if(!data.startsWith("http")){
                        return;
                    }
                    console.log(data)
                    let t = strSplit(data, ' ', 2)
                    setDataList((prevState)=>{return [...prevState, {index:++prevState.length,url:t[0],detail:t[1]}]})
                })
                EventsOn(String(result.httpxOutputDone),(value)=>{
                    if (!value.taskID || value.taskID !== taskID.current){
                        return
                    }
                    taskID.current=0
                    setRunning(false)
                })
            }
        )
    }, []);

    useEffect(()=>{
        setPath(httpxConfig.path)
        setFlags(httpxConfig.flags)
    },[httpxConfig])

    const saveHttpx=()=>{
        SaveHttpx({path:path,flags:flags})
        dispatch(setHttpx({path:path,flags:flags}))
    }

    const setHttpxPath=()=>{
        OpenFileDialog().then(
            result=>{
                if(result){
                    setPath(result)
                    SaveHttpx({path:result,flags:flags})
                    dispatch(setHttpx({path:result,flags:flags}))
                }
            }
        ).catch(
            err=>{
                errorNotification("错误",err)
            }
        )
    }

    const run=()=>{
        setDataList([])
        setOffset(1)
        setLimit(limit)
        Run(path,flags,targets).then(r => {
            taskID.current=r
            setRunning(true)
        }).catch(err=> {
            errorNotification("错误", err)
            setRunning(false)
        })
    }

    const stop=()=>{
        Stop(taskID.current).then(r => {
            taskID.current=0
            setRunning(false)
        }).catch(err=> {
            errorNotification("错误", err)
        })
    }

    const BrowserOpenMultiUrl=()=>{
        const total = dataList?.length
        if(!total)return
        for (const data of dataList.slice(offset-1, offset-1+limit)) {
            BrowserOpenURL(data.url)
        }
        const nextOffset = offset+limit
        setLimit(nextOffset > total ? 0 : limit)
        setOffset(nextOffset > total ? total : nextOffset)
    }

    const handleHeaderResize =
        (index: number) => (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
            const newColumns = [...columns];
            newColumns[index] = {
                ...newColumns[index],
                width: size.width,
            };
            setColumns(newColumns)
        };

    const getMergeColumns = () => {

        if (!columns) {
            return defaultColumns
        }

        return columns?.map((col:any, index:any) => ({
            ...col,
            onHeaderCell: (column:any) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }));
    }

    const handleSortChange = (pagination:any, filters:any, sorter:any) => {
        const { order, field } = sorter;
        if(order === 'ascend' || order === 'descend'){
            const sortedData = [...dataList].sort((a:any, b:any) => {
                return order === 'ascend' ? a[field].localeCompare(b.url) : b[field].localeCompare(a.url);
            });
            setDataList(sortedData);
        }
        const sortedData = [...dataList].sort((a:any, b:any) => {
            return a.index - b.index;
        });
        setDataList(sortedData);
    };

    const handleMenuItemClick : MenuProps['onClick'] = (e) => {
        switch (e.key) {
            case MenuItem.CopyAll.key:
                let t = "";
                for (const item of dataList) {
                    t += `${item.index}\t${item.url}\t${item.detail}\n`
                }
                copy(t)
                break
            case MenuItem.OpenUrl.key:
                selectedRow.record?.url && BrowserOpenURL(selectedRow.record.url)
                break
            case MenuItem.CopyCell.key:
                copy(selectedRow?.record[selectedRow["colKey"]])
                break
            case MenuItem.CopyRow.key:
                copy(`${selectedRow.record.index}\t${selectedRow.record.url}\t${selectedRow.record.detail}`)
                break
            case MenuItem.CopyCol.key:
            {
                const colValues = dataList.map((item:any)=>{
                    return item[selectedRow["colKey"]]
                })
                copy(colValues)
                break
            }
        }
        selectedRow = undefined
    };

    return (
        <div style={{display:"flex",flexDirection:"column",gap:"10px",height:"calc(100vh - 80px)"}}>
            <div style={{display:"flex",justifyContent:"center",gap:"10px"}}>
                <span style={{display:"flex",gap:"5px"}}>
                    <span>Httpx路径</span>
                    <Space.Compact>
                        <Input value={path} size={"small"} style={{width:"400px"}}
                               onChange={e=>setPath(e.target.value)}
                               onBlur={saveHttpx}
                        />
                        <Button size={"small"} onClick={setHttpxPath}>选择</Button>
                    </Space.Compact>
                </span>
                <span style={{display:"flex",gap:"5px"}}>
                    <span>程序参数</span>
                    <Tooltip title={"请勿添加-l或-u"} placement={"bottom"}>
                        <Input value={flags} size={"small"} style={{width:"200px"}}
                               onChange={e=>setFlags(e.target.value)}
                               onBlur={saveHttpx}
                        />
                    </Tooltip>
                </span>
                {!running && <Button size={"small"} onClick={run}>执行</Button>}
                {running && <Button size={"small"} onClick={stop} icon={<SyncOutlined spin={running}/>}>终止</Button>}
            </div>
            <Space style={{display:"flex",justifyContent:"center"}} size={20}>
                <Space.Compact size={"small"}>
                    <InputNumber style={{width:"150px"}} prefix={<div>总数:</div>} value={dataList.length}/>
                    <InputNumber style={{width:"150px"}} prefix={<div>起始:</div>} min={1} value={offset} onChange={(value)=>value&&setOffset(value)} />
                    <InputNumber style={{width:"150px"}} prefix={<div>长度:</div>} value={limit} onChange={(value)=>value&&setLimit(value)}/>
                    <Button onClick={BrowserOpenMultiUrl}>默认浏览器打开下一组</Button>
                </Space.Compact>
            </Space>
            <div style={{height:"calc(100%)"}}>
                <Allotment onChange={()=>fitAddon.current.fit()} >
                    <Allotment.Pane preferredSize={"350"}  className={"httpx-left"}>
                        <TextArea
                            size={"small"}
                            value={targets}
                            allowClear
                            onChange={e=>setTargets(e.target.value)}
                            placeholder={"每行一个"}
                            autoSize={{ minRows: 10, maxRows: 10 }}
                        />
                    </Allotment.Pane>
                    <Allotment.Pane  className={"httpx-right"}>
                        <Dropdown
                            menu={{ items, onClick: handleMenuItemClick}}
                            trigger={['contextMenu']}
                            open={open}
                            onOpenChange={(v)=> {
                                setOpen(v ? dataList.length > 0 : false)
                            }}
                        ><div>
                            <Table
                                ref={tblRef}
                                virtual
                                showSorterTooltip={false}
                                columns={getMergeColumns()}
                                components={{
                                    header: {
                                        cell: ResizableTitle,
                                    },
                                }}
                                bordered
                                sticky={{ offsetHeader: 0 }}
                                scroll={{x:1,y:height}}
                                size={"small"}
                                dataSource={dataList}
                                pagination={false}
                                rowKey={"dataIndex"}
                                onChange={handleSortChange}
                            />
                        </div>
                        </Dropdown>
                    </Allotment.Pane>
                </Allotment>
            </div>
        </div>
    );
}

type TabType = {
    label: string,
    key: string,
    children: ReactNode,
    closable?: boolean
}

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const Httpx =()=>{
    const [activeKey,setActiveKey]=useState<string>("1")
    const [items,setItems]=useState<TabType[]>([])
    const newTabIndex=useRef<number>(0)

    useEffect(() => {
        const newActiveKey = `${++newTabIndex.current}`;
        setItems([
            {
                label: newActiveKey,
                key: newActiveKey,
                children: <TabContent />,
            }
        ],)
    }, []);


    const onTabChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey)
    };

    const addTab = (input: string) => {
        const newActiveKey = `${++newTabIndex.current}`;
        setItems([...items, {
            label: newActiveKey,
            key: newActiveKey,
            children: <TabContent />,
        }]);
        setActiveKey(newActiveKey);
    };

    const removeTab = (targetKey: TargetKey) => {
        const targetIndex = items.findIndex((pane) => pane.key === targetKey);
        const newPanes = items.filter((pane) => pane.key !== targetKey);
        if (newPanes.length && targetKey === activeKey) {
            const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex];
            setActiveKey(key);
        }
        setItems(newPanes);
    };

    const onEditTab = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            addTab("");
        } else {
            removeTab(targetKey);
        }
    };

    return (
        <Tabs
            size="small"
            type="editable-card"
            onChange={onTabChange}
            activeKey={activeKey}
            onEdit={onEditTab}
            items={items}
        />
    );
}


export default Httpx;
