import {
    CloudDownloadOutlined,
    CopyOutlined,
    GlobalOutlined,
    LoadingOutlined,
    SearchOutlined,
    SyncOutlined
} from '@ant-design/icons';
import {Button, Input, MenuProps, message, Modal, Pagination, Space, Spin, Table, Tabs} from 'antd';
import React, {ReactNode, useEffect, useRef, useState} from 'react';
import type {ColumnsType} from 'antd/es/table';
import {copy, MenuItemsKey, QUERY_FIRST} from "@/type";
import {errorNotification} from '@/component/Notification';
import {useDispatch} from 'react-redux';
import {ResizeCallbackData} from 'react-resizable';
import ResizableTitle from '../../component/ResizableTitle';
import ContextMenu from '../../component/ContextMenu';
import {sleep} from '@/utils/utils';
import * as CryptoJS from 'crypto-js';
import {BrowserOpenURL, EventsOn} from "../../../wailsjs/runtime";

import {icp} from "../../../wailsjs/go/models";
import {CheckImage, Export, GetImage, IsSignExpired, Query} from "../../../wailsjs/go/icp/Bridge";
import {Get} from "../../../wailsjs/go/event/Event";

type dataCacheType = {
    [key: number]: icp.Item[];
}

let selectedRow: { item: icp.Item | undefined, rowIndex: number | undefined, colKey: string } = {
    item: undefined,
    rowIndex: 0,
    colKey: ''
}


const menuItems: MenuProps['items'] = [
    {
        label: '浏览器打开域名',
        key: MenuItemsKey.OpenDomain,
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

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const defaultPanes = new Array(2).fill(null).map((_, index) => {
    const id = String(index + 1);
    return { label: `Tab ${id}`, children: `Content of Tab Pane ${index + 1}`, key: id };
});

type TabType = {
    label: string,
    key: string,
    children: ReactNode,
    closable?: boolean
}
interface Position {
    x: number;
    y: number;
}

interface FormData {
    bigImage: string;
    clickedPositions: Position[];
}
const IcpContent: React.FC = () => {
    const defaultColumns: ColumnsType<icp.Item> = [
        {
            title: '序号', dataIndex: "index", ellipsis: true, width: 50, fixed: "left", onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "index", }; }
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
            title: '域名', dataIndex: "domain", ellipsis: true, width: 200, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "domain", }; },
                    onClick: () => copyCell(record.domain)
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
            title: '主备案号', dataIndex: "mainLicense", ellipsis: true, width: 200, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "mainLicense", }; },
                    onClick: () => copyCell(record.mainLicence)
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
        {
            title: '域名ID', dataIndex: "domainId", ellipsis: true, width: 100, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "domainId", }; },
                    onClick: () => copyCell(record.domainId)
                }
            }
        },
        {
            title: '限制访问', dataIndex: "limitAccess", ellipsis: true, width: 80, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "limitAccess", }; },
                    onClick: () => copyCell(record.limitAccess)
                }
            }
        },
        {
            title: 'mainId', dataIndex: "mainId", ellipsis: true, width: 80, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "mainId", }; },
                    onClick: () => copyCell(record.mainId)
                }
            }
        },
        {
            title: 'serviceId', dataIndex: "serviceId", ellipsis: true, width: 80, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "serviceId", }; },
                    onClick: () => copyCell(record.serviceId)
                }
            }
        },
    ];

    const [columns, setColumns] = useState<ColumnsType<icp.Item>>(defaultColumns)
    const pageSizeOptions = [40, 80, 100]
    const [id, setId] = useState<number>(0)
    const [input, setInput] = useState<string>("")
    const [inputCache, setInputCache] = useState<string>("")
    const [dataCache, setDataCache] = useState<dataCacheType>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentSize] = useState<number>(pageSizeOptions[0])
    const [loading, setLoading] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const dispatch = useDispatch()
    const [messageApi, contextHolder] = message.useMessage();
    const queryParams = useRef({ page: 0, pageSize: 0 })
    const unitNameChanged = useRef<boolean>(false)
    const status = useRef<"new" | "pageSizeChange" | "export" | "pageChange">()
    const [disable,setDisable] = useState<boolean>(false)

    useEffect(() => {
         Get().then(
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

    const [captcha, setCaptcha] = useState({
        bigImage: "",
        smallImage: "",
        secretKey: "",
        clickCount: 0,
        maxClicks: 0,
        loading: false,
        visible: false,
        positions: [] as Position[],
        refetching: false
    })

    function encryptPoints(points: Position[], A: string): string {
        const key = CryptoJS.enc.Utf8.parse(A || "XwKsGlMcdPMEhR1B");
        const srcs = CryptoJS.enc.Utf8.parse(JSON.stringify(points));
        const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.toString();
    }


    const handleClickImage = (event: React.MouseEvent<HTMLImageElement>) => {
        const clickCount = captcha.clickCount + 1
        if (clickCount > captcha.maxClicks) { return }
        const position: Position = {
            x: event.clientX - getImageOffsetLeft(),
            y: event.clientY - getImageOffsetTop(),
        };

        const positions = [...captcha.positions, position]
        setCaptcha((prevCaptcha) => ({
            ...prevCaptcha,
            positions: positions,
            clickCount: clickCount
        }))
        markImageClickPosition(position, clickCount);
        if (clickCount == captcha.maxClicks) {
            const pointJson = encryptPoints(positions, captcha.secretKey)
            CheckImage( encryptPoints(positions, captcha.secretKey)).then(
                result=>{
                    if (result.sign == "") {
                        setCaptcha(pre => ({
                            ...pre,
                            smallImage: result.smallImage,
                        }))
                        sleep(500)
                        fetchImage()
                    } else {
                        clearImageMarkers()
                        setCaptcha({ bigImage: "", smallImage: "", secretKey: "", visible: false, maxClicks: 0, clickCount: 0, positions: [], loading: false, refetching: false })
                        if (status.current == "new" || status.current == "pageSizeChange") {
                            handleQuery(inputCache, 1, queryParams.current.pageSize)
                        } else if (status.current == "pageChange") {
                            handleQuery(inputCache, queryParams.current.page, queryParams.current.pageSize)
                        }
                        else if (status.current == "export") {
                            exportData()
                        }
                    }
                }
            ).catch(
                err=> {
                    errorNotification("ICP无法获取签名", err)
                    setCaptcha(pre => ({
                        ...pre,
                        loading: false
                    }))
                }
            )
        }

    };

    const markImageClickPosition = (position: Position, clickCount: number) => {
        const marker = document.createElement('div');
        marker.className = 'marker';
        marker.style.position = 'absolute';
        marker.style.left = `${position.x - 10}px`;
        marker.style.top = `${position.y - 10}px`;
        marker.style.backgroundColor = "#1abd6c";
        marker.style.color = "#fff";
        marker.style.width = "20px";
        marker.style.height = "20px";
        marker.style.textAlign = "center";
        marker.style.lineHeight = "20px";
        marker.style.borderRadius = "50%";
        marker.style.userSelect = 'none';
        marker.textContent = `${clickCount}`;
        document.getElementById('captchaImageContainer')?.appendChild(marker);
    };

    const getImageOffsetLeft = () => {
        const imageElement = document.getElementById('captchaImage');
        return imageElement ? imageElement.getBoundingClientRect().left : 0;
    };

    const getImageOffsetTop = () => {
        const imageElement = document.getElementById('captchaImage');
        return imageElement ? imageElement.getBoundingClientRect().top : 0;
    };

    const clearImageMarkers = () => {
        const markers = document.querySelectorAll('.marker');
        markers?.forEach(marker => marker.remove());
    };


    const preHandleQuery = async (page: number, pageSize: number) => {
        const tmpInput = input.trim()
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)//缓存查询条件
        queryParams.current.page = page
        queryParams.current.pageSize = pageSize
        const expired = await isSignExpired()
        status.current = "new"
        if (expired) {
            fetchImage()
            return
        }
        handleQuery(tmpInput, 1, queryParams.current.pageSize)
    }

    const fetchImage = () => {
        clearImageMarkers()
        setCaptcha(pre => ({ ...pre, loading: true, refetching: true, visible: true, positions: [], clickCount: 0 }))
        GetImage().then(
            result=>{
                setCaptcha(pre => ({
                    ...pre,
                    bigImage: result.bigImage,
                    smallImage: result.smallImage,
                    secretKey: result.secretKey,
                    maxClicks: result.wordCount,
                    loading: false,
                    refetching: false
                }))
            }
        ).catch(
            err=>{
                errorNotification("ICP无法获取验证码", err)
                setCaptcha(pre => ({
                    ...pre,
                    loading: false
                }))
            }
        )
    }

    async function handleQuery(unitName: string, page: number, pageSize: number,) {
        setLoading(true)
        if (status.current == "new") {
            setId(0)
            setDataCache({})
            setTotal(0)
        }

        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        Query(unitName,page,pageSize).then(
            result=>{
                setCurrentPage(page)
                setCurrentSize(pageSize)
                let index=0
                let pre:dataCacheType = {}
                if (status.current == "pageChange") {
                    index = (page - 1) * pageSize
                    pre = dataCache
                }
                setDataCache({
                    ...pre,
                    [page]: result.items?.map((item) => {
                        index++
                        return { ...item, index: index }
                    })
                })
                setTotal(result.total)
                setId(result.task_id)
                setLoading(false)
            }
        ).catch(
            err=>{
                errorNotification("ICP查询出错", err)
                setLoading(false)
            }
        )
    }

    const getPageData = () => {
        return dataCache[currentPage] ? dataCache[currentPage] : []
    }

    const isSignExpired = async () => {
        try {
            return await IsSignExpired()
        } catch (error) {
            errorNotification("ICP获取签名失败", error)
        }

    }

    async function handlePaginationChange(newPage: number, newSize: number) {
        //page发生变换
        if (newPage != currentPage && newSize == currentPageSize) {
            //从缓存取数据
            if (dataCache[newPage]) {
                setCurrentPage(newPage)
                setLoading(false)
                return
            }
            status.current = "pageChange"
            const expired = await isSignExpired()
            if (expired) {
                queryParams.current.page = newPage
                fetchImage()
                return
            }
            handleQuery(inputCache, newPage, queryParams.current.pageSize)
        }

        //size发生变换
        if (newSize != currentPageSize) {
            queryParams.current.page = 1
            queryParams.current.pageSize = newSize
            status.current = "pageSizeChange"
            const expired = await isSignExpired()
            if (expired) {
                fetchImage()
                return
            }
            handleQuery(inputCache, 1, newSize)
        }
    }

    async function exportData() {
        if (id == 0) {
            errorNotification("导出结果", QUERY_FIRST)
            setIsExporting(false)
            return
        }
        setIsExporting(true)
        setDisable(true)
        Export(id).catch(
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

    const getMergeColumns = (): ColumnsType<icp.Item> => {
        return columns.map((col, index) => ({
            ...col,
            onHeaderCell: (column: ColumnsType<icp.Item>[number]) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }));
    }

    const handleMenuItemClick = (key: string) => {
        switch (key) {
            case MenuItemsKey.OpenDomain:
                if (selectedRow.item?.domain) {
                    BrowserOpenURL("http://" + selectedRow.item?.domain)
                }
                break
            case MenuItemsKey.CopyCell:
                {
                    const item = selectedRow.item
                    for (const key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.colKey) {
                            const value = item[key as keyof icp.Item]
                            copy(String(value))
                        }
                    }
                }
                break
            case MenuItemsKey.CopyRow:
                copy(selectedRow)
                break
            case MenuItemsKey.CopyCol:
                {
                    const colValues = dataCache[currentPage].map(item => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.colKey) {
                                return String(item[key as keyof icp.Item]);
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
            <Input
                style={{ width: "600px" }}
                size="small"
                allowClear
                suffix={<Space.Compact block>
                    <Button type='text' size="small" icon={<SearchOutlined />} onClick={() => preHandleQuery(currentPage, currentPageSize)} />
                    {/* <Tooltip title='帮助信息'>
                        <Button type='text' size="small" icon={<QuestionOutlined />} />
                    </Tooltip> */}
                </Space.Compact>}
                value={input}
                onPressEnter={() => preHandleQuery(currentPage, currentPageSize)}
                onChange={(e) => setInput(e.target.value)}
            />
            <span style={{ textAlign: 'center' }}>ICP备案查询：请输入单位名称或域名或备案号查询，请勿使用子域名或者带http://www等字符的网址查询</span>
        </div>
        <ContextMenu
            items={menuItems}
            onItemClick={
            (key: string) => {
                handleMenuItemClick(key)
            }
        }
            hidden={getPageData().length === 0}
        >
            <Table
                locale={{ emptyText: "暂无数据" }}
                showSorterTooltip={false}
                scroll={{ y: 'calc(100vh - 195px)', scrollToFirstRowOnChange: true }}
                bordered
                columns={getMergeColumns()}
                components={{
                    header: {
                        cell: ResizableTitle,
                    },
                }}
                dataSource={getPageData()}
                loading={loading}
                size="small"
                pagination={false}
                footer={() => <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Pagination
                        showSizeChanger
                        total={total}
                        pageSizeOptions={pageSizeOptions}
                        defaultPageSize={pageSizeOptions[0]}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total) => `${total} items`}
                        size="small"
                        onChange={(page, size) => handlePaginationChange(page, size)}
                    />
                    <Button
                        disabled={disable}
                        size="small"
                        onClick={async () => {
                            const expired = await isSignExpired()
                            if (expired) {
                                status.current = "export"
                                fetchImage()
                                return
                            }
                            exportData()
                        }}
                        icon={isExporting ? <LoadingOutlined /> : <CloudDownloadOutlined />}
                    >
                        {isExporting ? "正在导出" : "导出结果"}
                    </Button>
                </div>}
                // onRow={(record) => {
                //     return {
                //         onContextMenu: (event) => { selectedRow.current = record },
                //     };
                // }}
                sticky
                rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
            />
        </ContextMenu>
        <Modal
            title={<span style={{ color: "#008cff" }}>请完成安全校验</span>}
            open={captcha.visible}
            onCancel={() => {
                clearImageMarkers()
                setCaptcha({ bigImage: "", smallImage: "", secretKey: "", visible: false, maxClicks: 0, clickCount: 0, positions: [], loading: false, refetching: false })
            }
            }
            footer={null}
            destroyOnClose
        // bodyStyle={{ width: "500px", height: "259px" }}
        >
            <Spin spinning={captcha.loading}>
                <Space direction='vertical'>
                    <div style={{ position: 'relative' }} id="captchaImageContainer">
                        {
                            captcha.bigImage &&
                            <img
                                onClick={handleClickImage}
                                id="captchaImage"
                                src={`data:image/png;base64,${captcha.bigImage}`}
                            />
                        }

                        {
                            captcha.bigImage && <Button
                                style={{
                                    position: "absolute",
                                    top: '2px',
                                    right: '2px',
                                    backgroundColor: "#ffffff"
                                }}
                                size='small'
                                icon={<SyncOutlined spin={captcha.refetching} />}
                                type='link'
                                onClick={() => {
                                    fetchImage();
                                    setCaptcha((pre) => ({ ...pre, clickCount: 0 }))
                                }
                                }
                            />
                        }
                    </div>

                    {
                        captcha.smallImage &&
                        <img
                            src={`data:image/png;base64,${captcha.smallImage}`}
                        />
                    }

                </Space>
            </Spin>
        </Modal>
    </div>)
}

const Icp: React.FC = () => {
    const [items, setItems] = useState<TabType[]>([]);
    const [activeKey, setActiveKey] = useState<string>(items[0]?.label);
    const newTabIndex = useRef(1);

    useEffect(() => {
        const newActiveKey = `${newTabIndex.current++}`;
        setItems([
            {
                label: newActiveKey,
                key: newActiveKey,
                children: <IcpContent />,
            }
        ],)
    }, [])

    const onChange = (key: string) => {
        setActiveKey(key);
    };

    const add = () => {
        const newActiveKey = `${newTabIndex.current++}`;
        setItems([...items, {
            label: newActiveKey,
            key: newActiveKey,
            children: <IcpContent />,
        }]);
        setActiveKey(newActiveKey);
    };

    const remove = (targetKey: TargetKey) => {
        const targetIndex = items.findIndex((pane) => pane.key === targetKey);
        const newPanes = items.filter((pane) => pane.key !== targetKey);
        if (newPanes.length && targetKey === activeKey) {
            const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex];
            setActiveKey(key);
        }
        setItems(newPanes);
    };

    const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
        if (action === 'add') {
            add();
        } else {
            remove(targetKey);
        }
    };

    return (
        <div>
            <Tabs
                size="small"
                onChange={onChange}
                activeKey={activeKey}
                type="editable-card"
                // tabBarExtraContent={}
                onEdit={onEdit}
                items={items}
            />
        </div>
    );
}

export default Icp