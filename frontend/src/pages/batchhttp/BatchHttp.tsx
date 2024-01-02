import { Button, Checkbox, Collapse, Input, InputNumber, Modal, Pagination, Select, Space, Switch, Table, Tag, Tooltip } from "antd"
import { CheckboxValueType } from "antd/es/checkbox/Group"
import TextArea from "antd/es/input/TextArea"
import { Children, useState } from "react"
import { getCurrentTimestamp, getTextWidthUsingCanvas } from "../../utils/utils"
import { ColumnsType } from "antd/es/table"
import { ItemType, RequestDataType } from "../../type/batchhttp"
import { BatchHttpData } from "../../testdata/testdata"
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import React, { useEffect, useRef } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import { theme } from 'antd';
import type { MenuProps, TableProps } from 'antd';
import { CloudDownloadOutlined, CopyOutlined, GlobalOutlined, LoadingOutlined, SettingOutlined } from "@ant-design/icons"
import { _exportDataToExcel, _exportLocalDataToExcel, _openDefaultBrowser } from "../../electron/electronApi"
import { server } from "../../config"
import { batchHttp } from "../../http/api"
import { errorNotification } from "../../component/Notification"
import { ResizeCallbackData } from "react-resizable"
import ResizableTitle from "../../component/ResizableTitle"
import ContextMenu from "../../component/ContextMenu"
import { ExportDataReturnType, MenuItemsKey, copy } from "../../type"
import { useDispatch } from "react-redux"
import { setHasNewLogItem } from "../../store/store"

const columns1 = [
    {
        title: '序号', dataIndex: "index", width: 60, ellipsis: true,
    },
    { title: '方法', dataIndex: "method", width: 100, ellipsis: true, },
    { title: '目标', dataIndex: "url", width: 100, ellipsis: true, },
    { title: '响应码', dataIndex: "status_code", width: 80, ellipsis: true, },
    { title: '标题', dataIndex: "title", width: 200, ellipsis: true, },
    { title: '长度', dataIndex: "length", width: 80, ellipsis: true, },
    { title: '重定向', dataIndex: "redirect", width: 200, ellipsis: true, },
    { title: '响应码', dataIndex: "re_status_code", width: 80, ellipsis: true, },
    { title: '标题', dataIndex: "re_title", width: 80, ellipsis: true, },
    { title: '长度', dataIndex: "re_length", width: 200, ellipsis: true, },

];

const defaultColumns: ColumnsType<ItemType> = [
    {
        title: '序号', dataIndex: "index", width: 60, ellipsis: true, fixed: true, onCell: (record, index) => {
            return {
                onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "index", }; }
            }
        }
    },
    {
        title: '目标', dataIndex: "url", width: 250, ellipsis: true, onCell: (record, index) => {
            return {
                onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "url", }; }
            }
        }
    },
    {
        title: '响应码', dataIndex: "status_code", width: 60, ellipsis: true, onCell: (record, index) => {
            return {
                onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "status_code", }; }
            }
        }
    },
    {
        title: '标题', dataIndex: "title", width: 200, ellipsis: true, onCell: (record, index) => {
            return {
                onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "title", }; }
            }
        }
    },
    {
        title: '长度', dataIndex: "length", width: 80, ellipsis: true, onCell: (record, index) => {
            return {
                onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "length", }; }
            }
        }
    },
    {
        title: '重定向', dataIndex: "redirect", width: 250, ellipsis: true, onCell: (record, index) => {
            return {
                onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "redirect", }; }
            }
        }
    },
    {
        title: '响应码', dataIndex: "re_status_code", width: 60, ellipsis: true, onCell: (record, index) => {
            return {
                onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "re_status_code", }; }
            }
        }
    },
    {
        title: '标题', dataIndex: "re_title", width: 200, ellipsis: true, onCell: (record, index) => {
            return {
                onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "re_title", }; }
            }
        }
    },
    {
        title: '长度', dataIndex: "re_length", width: 80, ellipsis: true, onCell: (record, index) => {
            return {
                onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "introduction", }; }
            }
        }
    },
]

const menuItems: MenuProps['items'] = [
    {
        label: '浏览器打开URL',
        key: MenuItemsKey.OpenUrl,
        icon: <GlobalOutlined />
    },
    {
        label: '浏览器打开重定向',
        key: MenuItemsKey.OpenRedirect,
        icon: <GlobalOutlined />
    },
    {
        label: '复制单元格',
        key: MenuItemsKey.CopyCell,
        icon: <CopyOutlined />
    },
    {
        label: '复制行',
        key: MenuItemsKey.CopyRow,
        icon: <CopyOutlined />
    },
    {
        label: '复制列',
        key: MenuItemsKey.CopyCol,
        icon: <CopyOutlined />
    },

];
let selectedRow: { item: ItemType, rowIndex: number, colKey: string } = {
    item: undefined,
    rowIndex: 0,
    colKey: ''
}
const BatchHttp: React.FC = () => {
    const [columns, setColumns] = useState<ColumnsType<ItemType>>(defaultColumns)
    const [timeout, setTimeout] = useState<number>(3)
    const [redirect, enableRedirect] = useState<boolean>(true)
    const [isCustomHeaders, enableHeaders] = useState<boolean>(false)
    const [headers, setHeaders] = useState<string>("")
    const [coroutine, setCoroutine] = useState<number>(10)
    const [postData, setPostData] = useState<string>("")
    const [methods, setMethod] = useState<string[]>(["get"])
    const [urls, setUrls] = useState<string[]>([])
    const [open, setOpen] = useState<boolean>(false)
    const [input, setInput] = useState<string>("")
    const [tableHeight, setTableHeight] = useState<number>(400)

    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [isStopping, setIsStopping] = useState<boolean>(false)
    const socketAvailable = useRef<boolean>(false)
    const socketRef = useRef<WebSocket>()

    const pageSizeOptions = [40, 60, 80, 100]
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setPage] = useState<number>(1)
    const [currentSize, setSize] = useState<number>(pageSizeOptions[0])
    const [data, setData] = useState<(ItemType & { index: number })[]>([])
    const [pageData, setPageData] = useState<(ItemType & { index: number })[]>([])
    const dispatch = useDispatch()

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize()
    }, [])

    useEffect(() => {
        const tmp = data.slice((currentPage - 1) * currentSize, currentPage * currentSize)
        setPageData(tmp)
    }, [data])

    const handleResize = () => {
        setTableHeight(window.innerHeight - 30 - 40 - 42 - 26);
    }
    const currentPageOrSizeChange = (page: number, size: number): void => {
        if (page != currentPage) {
            setPage(page)
            const tmp = data.slice((page - 1) * currentSize, page * currentSize)
            setPageData(tmp)
        }

        if (size != currentSize) {
            setPage(1)
            setSize(size)
            const tmp = data.slice((currentPage - 1) * size, currentPage * size)
            setPageData(tmp)
        }
    }
    const getPageData = () => {
        return pageData
    }
    const exportData = async () => {
        if (!data || data.length == 0) return
        setIsExporting(true)
        const result = await _exportLocalDataToExcel(data, `BatchHttp_${getCurrentTimestamp()}.xlsx`)
        setIsExporting(false)
        if (result.error) {
            errorNotification("BatchHttp导出数据", result.error)
            return
        }
        dispatch(setHasNewLogItem(true))
    }
    const handleRun = async () => {
        if (isStopping) return
        if (isRunning) {
            if (socketRef != undefined) {
                socketRef.current.close()
                setIsStopping(true)
            }
            return
        }
        if (methods.length == 0) {
            errorNotification("BatchHttp", "至少指定一种请求方法")
            return
        }
        if (urls.length == 0) { return }
        await setData([])
        setTotal(0)
        setPage(1)

        const tmpPostData: RequestDataType = {
            urls: urls, headers: headers, timeout: timeout, coroutineCount: coroutine, methods: methods, data: postData,
            redirect: redirect,
            isCustomHeaders: isCustomHeaders
        }

        const msg = JSON.stringify(tmpPostData)
        setIsRunning(true)
        if (socketRef.current != undefined) {
            socketRef.current.close()
            wsSend(msg)
        } else { wsSend(msg) }
    }

    const wsSend = async (msg: string) => {
        socketRef.current = new WebSocket(server.baseWS + batchHttp)
        socketRef.current.addEventListener('message', wsReceiver)
        socketRef.current.onopen = () => {
            socketAvailable.current = true
            if (socketRef != undefined) {
                socketRef.current.send(msg)
            }
        };
        socketRef.current.onclose = () => {
            socketAvailable.current = false
            socketRef.current = undefined
            setIsRunning(false)
            setIsStopping(false)
        };
    }


    const wsReceiver = async (event: MessageEvent<any>) => {
        if (!socketAvailable) { return }
        const respData = JSON.parse(event.data)
        if (respData["code"] != 200) {
            errorNotification("BatchHttp", respData["message"])
            return
        }
        if (!respData["data"]["hasMore"]) socketRef.current?.close()
        const items = respData["data"]["items"]
        if (Array.isArray(items)) {
            setData((prevData) => [
                ...prevData,
                ...items.map((item, idx) => ({
                    index: prevData.length + idx + 1,
                    ...item,
                })),
            ]);

            setTotal((prevTotal) => prevTotal + items.length);
        }
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

    const getMergeColumns = (): ColumnsType<ItemType> => {
        return columns.map((col, index) => ({
            ...col,
            onHeaderCell: (column: ColumnsType<ItemType>[number]) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }))
    }


    const handleMenuItemClick = (key: MenuItemsKey) => {
        switch (key) {
            case MenuItemsKey.OpenUrl:
                if (selectedRow.item.url) {
                    _openDefaultBrowser(selectedRow.item.url)
                }
                break
            case MenuItemsKey.OpenRedirect:
                if (selectedRow.item.redirect) {
                    _openDefaultBrowser(selectedRow.item.redirect)
                }
                break
            case MenuItemsKey.CopyCell:
                {
                    const item = selectedRow.item as ItemType
                    for (const key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.colKey) {
                            copy(item[key as keyof ItemType])
                        }
                    }
                }
                break
            case MenuItemsKey.CopyRow:
                copy(selectedRow.item)
                break
            case MenuItemsKey.CopyCol:
                {
                    const colValues = pageData.map(item => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.colKey) {
                                const value = item[key as keyof ItemType]
                                if (typeof value == 'string') {
                                    return value;
                                }
                                if (typeof value == 'number') {
                                    return value.toString();
                                }
                                return JSON.stringify(value);
                            }
                        }
                        return ""
                    })
                    copy(colValues.join("\n"))
                    break
                }
        }
        selectedRow = undefined
    };
    return (
        <div
        //  style={{ display: "flex", width: "100%" }}
        >
            <Space.Compact style={{ width: "100%", display: "flex" }}>
                <Button
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={() => setOpen(true)}
                    style={{ color: "#ff4d4f", width: "30%" }}
                >点击设置目标<Tag bordered={false} style={{ height: "100%", marginLeft: "5px" }}>目标个数:{urls.length}</Tag>
                </Button>
                <Button style={{ width: "70%" }} size="small" onClick={() => handleRun()}>
                    {isRunning ? (isStopping ? <span><LoadingOutlined />正在终止</span> : <span><LoadingOutlined />终止</span>) : "确定"}
                </Button>
            </Space.Compact>
            <Modal open={open} destroyOnClose closeIcon={false}
                maskClosable={false}
                cancelButtonProps={{ size: "small" }}
                okButtonProps={{ size: "small" }}
                onCancel={() => {
                    setOpen(false)
                    setInput(urls.join("\n"))
                }}
                onOk={() => {
                    const tmp = input.split("\n").filter((item) => item.trim() !== "")
                    setUrls(tmp);
                    setOpen(false)
                    console.log(tmp)
                }}
            // width={"600px"}
            >
                <Space style={{ float: "right", width: "100%" }}>
                    <Space direction="vertical">
                        <span >超时(s):<InputNumber size="small" style={{ width: 60 }} value={timeout} onChange={value => setTimeout(value)}></InputNumber></span>
                        <span>协程:<InputNumber size="small" style={{ width: 60 }} value={coroutine} onChange={value => setCoroutine(value)}></InputNumber></span>

                        <span style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <span style={{ width: "65px" }}>重定向:</span>
                            <Switch checked={redirect} checkedChildren="启用" unCheckedChildren="禁用" size="small" onChange={(value) => { enableRedirect(value); console.log(value) }} />
                        </span>
                        <Space>
                            请求方法:
                            <Checkbox.Group
                                options={[
                                    { label: "GET", value: "GET" },
                                    { label: "POST", value: "POST" }
                                ]}
                                defaultValue={['GET']}
                                onChange={(value: string[]) => setMethod(value)}
                            />
                        </Space>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <Checkbox defaultChecked={isCustomHeaders} onChange={e => enableHeaders(e.target.checked)}>Headers(不启用则使用默认值):</Checkbox>
                            <TextArea size="small" style={{ width: "260px" }} autoSize={{ maxRows: 2, minRows: 2 }} placeholder="" disabled={!isCustomHeaders} value={headers} onChange={e => setHeaders(e.target.value)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span>请求体:</span>
                            <TextArea size="small" style={{ width: "260px" }} autoSize={{ maxRows: 2, minRows: 2 }} value={postData} onChange={e => setPostData(e.target.value)} />
                        </div>
                    </Space>
                    <TextArea
                        placeholder={"每行一个目标\nexample.com\nhttp://example.com:8080\nhttp://example.com:8080/path"}
                        value={input}
                        autoSize={{ minRows: 12, maxRows: 12 }}
                        style={{ width: "230px" }}
                        size="small"
                        onChange={e => setInput(e.target.value)}
                    >
                    </TextArea>
                </Space>
            </Modal>
            <div
            // style={{ marginLeft: "5px", display: "flex", width: "auto", borderLeft: "1px solid #bfbfbf" }}
            >
                {/* <VirtualTable size="small" columns={columns1} dataSource={BatchHttpData} scroll={{ y: tableHeight }} /> */}
                <ContextMenu
                    items={menuItems}
                    onItemClick={(key: MenuItemsKey) => {
                        handleMenuItemClick(key)
                    }}
                    hidden={!pageData || pageData.length === 0}
                >
                    <Table
                        size="small"
                        bordered
                        columns={getMergeColumns()}
                        components={{
                            header: {
                                cell: ResizableTitle,
                            },
                        }}
                        dataSource={getPageData()}
                        scroll={{ y: tableHeight, scrollToFirstRowOnChange: true }}
                        pagination={false}
                        rowKey={"index"}
                        // onRow={(record) => {
                        //     return {
                        //         onContextMenu: (event) => { selectedRow.item = record },
                        //     };
                        // }}
                        footer={
                            () => <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Pagination
                                    showSizeChanger
                                    total={total}
                                    pageSizeOptions={pageSizeOptions}
                                    defaultPageSize={pageSizeOptions[0]}
                                    defaultCurrent={1}
                                    current={currentPage}
                                    showTotal={(total) => `${total} items`}
                                    size="small"
                                    onChange={(page, size) => currentPageOrSizeChange(page, size)}
                                />
                                <Button
                                    size="small"
                                    onClick={exportData}
                                    icon={isExporting ? <LoadingOutlined /> : <CloudDownloadOutlined />}
                                >
                                    {isExporting ? "正在导出" : "导出结果"}
                                </Button>
                            </div>
                        }

                    />
                </ContextMenu>
            </div>
        </div>
    )
}


const VirtualTable = <RecordType extends object>(props: TableProps<RecordType>) => {
    const { columns, scroll } = props;
    const [tableWidth, setTableWidth] = useState(0);
    const { token } = theme.useToken();

    const widthColumnCount = columns!.filter(({ width }) => !width).length;
    const mergedColumns = columns!.map((column) => {
        if (column.width) {
            return column;
        }

        return {
            ...column,
            width: Math.floor(tableWidth / widthColumnCount),
        };
    });

    const gridRef = useRef<any>();
    const [connectObject] = useState<any>(() => {
        const obj = {};
        Object.defineProperty(obj, 'scrollLeft', {
            get: () => {
                if (gridRef.current) {
                    return gridRef.current?.state?.scrollLeft;
                }
                return null;
            },
            set: (scrollLeft: number) => {
                if (gridRef.current) {
                    gridRef.current.scrollTo({ scrollLeft });
                }
            },
        });

        return obj;
    });

    const resetVirtualGrid = () => {
        gridRef.current?.resetAfterIndices({
            columnIndex: 0,
            shouldForceUpdate: true,
        });
    };

    useEffect(() => resetVirtualGrid, [tableWidth]);

    const renderVirtualList = (rawData: readonly object[], { scrollbarSize, ref, onScroll }: any) => {
        ref.current = connectObject;
        const totalHeight = rawData.length * 54;

        return (
            <Grid
                ref={gridRef}
                className="virtual-grid"
                columnCount={mergedColumns.length}
                columnWidth={(index: number) => {
                    const { width } = mergedColumns[index];
                    return totalHeight > (scroll?.y as number) && index === mergedColumns.length - 1
                        ? (width as number) - scrollbarSize - 1
                        : (width as number);
                }}
                height={scroll!.y as number}
                rowCount={rawData.length}
                rowHeight={() => 54}
                width={tableWidth}
                onScroll={({ scrollLeft }: { scrollLeft: number }) => {
                    onScroll({ scrollLeft });
                }}
            >
                {({
                    columnIndex,
                    rowIndex,
                    style,
                }: {
                    columnIndex: number;
                    rowIndex: number;
                    style: React.CSSProperties;
                }) => (
                    <div
                        className={classNames('virtual-table-cell', {
                            'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
                        })}
                        style={{
                            ...style,
                            boxSizing: 'border-box',
                            padding: token.padding,
                            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
                            background: token.colorBgContainer,
                        }}
                    >
                        {(rawData[rowIndex] as any)[(mergedColumns as any)[columnIndex].dataIndex]}
                    </div>
                )}
            </Grid>
        );
    };

    return (
        <ResizeObserver
            onResize={({ width }) => {
                setTableWidth(width);
            }}
        >
            <Table
                {...props}
                className="virtual-table"
                columns={mergedColumns}
                pagination={false}
                components={{
                    body: renderVirtualList,
                }}
            />
        </ResizeObserver>
    );
};

export default BatchHttp

