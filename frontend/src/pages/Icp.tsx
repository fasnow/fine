import {
    CloudDownloadOutlined,
    LoadingOutlined,
    SearchOutlined} from '@ant-design/icons';
import {Button, Input, message, Pagination, Select, Space, Table} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import type {ColumnsType} from 'antd/es/table';
import {QUERY_FIRST} from "@/component/type";
import {errorNotification} from '@/component/Notification';
import {useSelector} from 'react-redux';
import {ResizeCallbackData} from 'react-resizable';
import ResizableTitle from '../component/ResizableTitle';
import ContextMenu from '../component/ContextMenu';
import {copy} from '@/util/util';
import {BrowserOpenURL, EventsOn} from "../../wailsjs/runtime";

import {Export,Query} from "../../wailsjs/go/icp/Bridge";
import {MenuItems, WithIndex} from "@/component/Interface";
import {MenuItemType} from "antd/es/menu/interface";
import {icp, zone} from "../../wailsjs/go/models";
import {RootState} from "@/store/store";
import {GetAllEvents} from "../../wailsjs/go/event/Event";
import TabsV2 from "@/component/TabsV2";

let selectedRow: { item: PageDataType | undefined, rowIndex: number | undefined, colKey: string } = {
    item: undefined,
    rowIndex: 0,
    colKey: ''
}

const menuItems: MenuItemType[] = [
    MenuItems.OpenDomain,
    MenuItems.CopyCell,
    MenuItems.CopyRow,
    MenuItems.CopyCol,
];

type  PageDataType = WithIndex<icp.Item>

const TabContent: React.FC = () => {
    const defaultColumns: ColumnsType<PageDataType> = [
        {
            title: '序号', dataIndex: "index", ellipsis: true, width: 50, fixed: "left", onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "index", }; },
                    onClick: () => copyCell(record.index)
                }
            }
        },
        {
            title: '名称', dataIndex: "unitName", ellipsis: true, width: 250, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "unitName", }; },
                    onClick: () => copyCell(record.unitName)
                }
            }
        },
        {
            title: '备案内容', dataIndex: "serviceName", ellipsis: true, width: 200, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "serviceName", }; },
                    onClick: () => copyCell(record.serviceName)
                }
            }
        },
        {
            title: '备案号', dataIndex: "serviceLicence", ellipsis: true, width: 200, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "serviceLicence", }; },
                    onClick: () => copyCell(record.serviceLicence)
                }
            }
        },
        {
            title: '单位性质', dataIndex: "natureName", ellipsis: true, width: 100, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "natureName", }; },
                    onClick: () => copyCell(record.natureName)
                }
            }
        },
        {
            title: '审核日期', dataIndex: "updateRecordTime", ellipsis: true, width: 200, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "updateRecordTime", }; },
                    onClick: () => copyCell(record.updateRecordTime)
                }
            }
        },
        {
            title: '备案法人', dataIndex: "leaderName", ellipsis: true, width: 200, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "leaderName", }; },
                    onClick: () => copyCell(record.leaderName)
                }
            }
        },
    ];
    const [columns, setColumns] = useState<ColumnsType<PageDataType>>(defaultColumns)
    const pageSizeOptions = [40, 80, 100]
    const [input, setInput] = useState<string>("")
    const [inputCache, setInputCache] = useState<string>("")
    const [total, setTotal] = useState<number>(0)
    const [currentPageNum, setCurrentPageNum] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const [loading, setLoading] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [messageApi, contextHolder] = message.useMessage();
    const [disable,setDisable] = useState<boolean>(false)
    const [serviceType, setServiceType] = useState<string>("1")
    const [serviceTypeCache, setServiceTypeCache] = useState<string>(serviceType)
    const pageIDMap = useRef<{ [key: number]: number }>({})
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const allowEnterPress = useSelector((state: RootState) => state.config.config.QueryOnEnter.icp)
    const [tableScrollHeight, setTableScrollHeight] = useState<number>(window.innerHeight - 195)

    useEffect(() => {
        window.addEventListener("resize", () => {
            setTableScrollHeight(window.innerHeight - 195)
        })
        GetAllEvents().then(
            result=>{
                EventsOn(String(result.hasNewIcpDownloadItem),()=>{
                    setDisable(false)
                    setIsExporting(false)
                })
            }
        )
    }, [])

    const copyCell = (value: string | number | boolean) => {
        if (!value) {
            return
        }
        copy(value)
        messageApi.success("复制成功", 0.5)
    }

    const preHandleQuery = async () => {
        const tmpInput = input.trim()
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)
        setServiceTypeCache(serviceType)
        handleNewQuery(0,tmpInput, currentPageSize)
    }

    async function handleNewQuery(taskID:number,unitName: string, pageSize: number) {
        pageIDMap.current = {}
        setCurrentPageNum(1)
        setTotal(0)
        setLoading(true)
        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        Query(taskID,unitName,1,pageSize,serviceType).then(
            result=>{
                let index=0
                setTotal(result["total"])
                setPageData(result["items"]?.map((item:PageDataType) => {
                    index++
                    return { ...item, index: index }
                }))
                pageIDMap.current[1] = result["taskID"]
                setLoading(false)
            }
        ).catch(
            err=>{
                errorNotification("ICP查询出错", err)
                setPageData([])
                setLoading(false)
            }
        )
    }

    async function handlePaginationChange(newPage: number, newSize: number) {
        //page发生变换
        if (newPage !== currentPageNum && newSize === currentPageSize) {
            setLoading(true)
            let pageID = pageIDMap.current[newPage]
            Query(pageID ? pageID : 0,inputCache,newPage,newSize,serviceTypeCache).then(
                (result)=>{
                    let index = (newPage - 1) * currentPageSize
                    setPageData(result["items"].map((item:icp.Item) => ({index: ++index, ...item})))
                    setCurrentPageNum(newPage)
                    setLoading(false)
                    pageIDMap.current[newPage] = result["taskID"]
                }
            ).catch(
                err => {
                    errorNotification("ICP查询出错", err)
                    setLoading(false)
                }
            )
        }

        //size发生变换
        if (newSize !== currentPageSize) {
            setCurrentPageSize(newSize)
            handleNewQuery(0,inputCache, newSize)
        }
    }

    async function exportData() {
        if (pageIDMap.current[1] === 0) {
            errorNotification("导出结果", QUERY_FIRST)
            setIsExporting(false)
            return
        }
        setIsExporting(true)
        setDisable(true)
        Export(pageIDMap.current[1]).catch(
            err=> {
                errorNotification("导出结果", err)
            }
        ).finally(
            ()=>{
                setDisable(false)
                setIsExporting(false)
            }
        )
    }

    const handleHeaderResize =
        (index: number) => (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
            const newColumns = [...columns];
            newColumns[index] = {
                ...newColumns[index],
                width: size.width,
            }
            setColumns(newColumns);
        };

    const getMergeColumns = (): ColumnsType<PageDataType> => {
        return columns.map((col, index) => ({
            ...col,
            onHeaderCell: (column: ColumnsType<PageDataType>[number]) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }));
    }

    const handleMenuItemClick = (key: string) => {
        switch (key) {
            case MenuItems.OpenDomain.key:
                if (selectedRow.item?.serviceName) {
                    BrowserOpenURL("http://" + selectedRow.item?.serviceName)
                }
                break
            case MenuItems.CopyCell.key:
                {
                    const item = selectedRow.item
                    for (const key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.colKey) {
                            const value = item[key as keyof PageDataType]
                            copy(String(value))
                        }
                    }
                }
                break
            case MenuItems.CopyRow.key:
                copy(selectedRow)
                break
            case MenuItems.CopyCol.key:
                {
                    const colValues = pageData.map(item => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.colKey) {
                                return String(item[key as keyof PageDataType]);
                            }
                        }
                        return ""
                    })
                    copy(colValues.join("\n"))
                    break
                }
        }
        selectedRow = {
            item:undefined,
            rowIndex:undefined,
            colKey:""
        }
    };
    return (<div >
        {contextHolder}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Space.Compact size={"small"}>
                <Select
                    onChange={(value)=>{
                        setServiceType(value)
                    }}
                    defaultValue="1"
                    options={[
                        {value: '1',label: '网站',},
                        {value: '6',label: 'APP',},
                        {value: '7',label: '小程序',},
                        {value: '8',label: '快应用',},
                    ]}
                    style={{width:100}}
                />
                <Input
                    style={{ width: "600px" }}
                    allowClear
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPressEnter={()=> {
                        if(!allowEnterPress)return
                        preHandleQuery()
                    }}
                />
                <Space.Compact >
                    <Button  size="small" icon={<SearchOutlined />} onClick={() => preHandleQuery()} />
                </Space.Compact>
            </Space.Compact>
            <span style={{ textAlign: 'center' }}>ICP备案查询：请输入单位名称或域名或备案号查询，请勿使用子域名或者带http://www等字符的网址查询</span>
        </div>
        <ContextMenu
            items={menuItems}
            onItemClick={
            (key: string) => {
                handleMenuItemClick(key)
            }
        }
            hidden={pageData.length === 0}
        >
            <Table
                // locale={{ emptyText: "暂无数据" }}
                showSorterTooltip={false}
                virtual
                scroll={{ y: tableScrollHeight,x: '100%', scrollToFirstRowOnChange: true }}
                bordered
                columns={getMergeColumns()}
                components={{
                    header: {
                        cell: ResizableTitle,
                    },
                }}
                dataSource={pageData}
                loading={loading}
                size="small"
                pagination={false}
                footer={() => <div style={{ height:'100%', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                            exportData()
                        }}
                        icon={isExporting ? <LoadingOutlined /> : <CloudDownloadOutlined />}
                    >
                        {isExporting ? "正在导出" : "导出结果"}
                    </Button>
                </div>}
                sticky
                rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
            />
        </ContextMenu>
    </div>)
}

const Icp: React.FC = () => {
    return <TabsV2 defaultTabContent={<TabContent/>}/>
}

export default Icp