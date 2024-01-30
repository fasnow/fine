import React, { ReactNode, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Badge, Button, ConfigProvider, Empty, Input, InputNumber, List as AdList, Modal, Pagination, Popover, Space, Spin, Table, Tabs, Tag, Tooltip, MenuProps, TabsProps, Form, message } from 'antd';
import { SearchOutlined, QuestionOutlined, LoadingOutlined, CloudDownloadOutlined, FileOutlined, CopyOutlined, CheckOutlined, FullscreenOutlined, CloudOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { errorNotification } from '@/component/Notification';
import { QUERY_FIRST, IcpItemType, MsgOfWechatType, MenuItemsKey, MsgOfMiniProgramType, MsgOfApkType, ZoneEmailItemType, ZoneMemberItemType, copy } from '@/type';
import { ColumnsType } from 'antd/es/table';
import ContextMenu from '../../component/ContextMenu';
import AdVirtualList from 'rc-virtual-list';
import Rdg, { RadioOption } from '../../component/Rdg';
import ScrollBar from '../../component/ScrollBar';
import Copy from '../../component/Copy';
import TextArea from 'antd/es/input/TextArea';
import { Light } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import NotFound from '../Notfound';
import { ResizeCallbackData } from 'react-resizable';
import ResizableTitle from '../../component/ResizableTitle';
import { useDispatch, useSelector } from 'react-redux';
import {RootState, setFofaAuth, setZoneAuth} from '@/store/store';
import { ExportDataPanelProps as ExportDataPanelProps } from './Props';
import { buttonProps, authFormProps, Setting } from '../setting/Setting';
import { localeCompare } from '@/utils/utils';
import {
    ExportDomain, ExportEmail,
    ExportMember,
    ExportSite,
    QueryApk,
    QueryCode,
    QueryDomain, QueryDwm,
    QueryEmail,
    QueryMember,
    QuerySite,
    SetAuth
} from "../../../wailsjs/go/zone/Bridge";
import {BrowserOpenURL, EventsOn} from "../../../wailsjs/runtime";
import {fofa, zone} from "../../../wailsjs/go/models";
import {current} from "@reduxjs/toolkit";
import {Get0zoneAuth} from "../../../wailsjs/go/config/Config";
import {Get} from "../../../wailsjs/go/event/Event";
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

interface TabType {
    label: ReactNode,
    children: ReactNode,
    key: string,
    closable?: boolean,
    forceRender?: boolean
}

const codeLineCss: React.CSSProperties = {
    display: "inline-block",
    fontSize: "14px",
    fontFamily: "PingFangSC-Regular, PingFang SC",
    fontWeight: 400,
    color: "#d65b3c",
    padding: "0px 12px",
    background: " #1d212b",
    width: "40px",
    marginRight: "8px",
    height: "22px",
    textAlign: "center",
}

const CodeDisplay: React.FC<{ code: string, length?: number }> = (props) => {
    const [length, setLength] = useState<number>(props.length || props.code.length)
    const [open, setOpen] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { code } = props;
    const [matches, setMatches] = useState<number>(0);
    const [currentMatch, setCurrentMatch] = useState<number>(0);

    const handleSearch = () => {
        const regex = new RegExp(searchTerm, 'gi');
        const matchCount = (code.match(regex) || []).length;
        setMatches(matchCount);
        setCurrentMatch(0);
    };

    const handleJumpToMatch = () => {
        const regex = new RegExp(searchTerm, 'gi');
        const matchesArray = Array.from(code.matchAll(regex));

        if (matchesArray.length > 0) {
            setCurrentMatch((currentMatch + 1) % matchesArray.length);
            const matchPosition = matchesArray[currentMatch].index;
            window.scrollTo(0, matchPosition||0);
        }
    };
    return <>
        <Button
            type='link' size='small' icon={<FullscreenOutlined />}
            onClick={() => {
                setOpen(true)
            }}
        />
        <Modal
            {...ExportDataPanelProps}
            title={
                <>
                    <span>代码详情</span>
                    <Copy
                        title={'复制代码'}
                        placement={"bottom"}
                        text={code}
                        type='link'
                        size='small'
                    />
                </>
            }
            open={open}
            footer={false}
            destroyOnClose
            onCancel={() => setOpen(false)}
            style={{ top: "20px" }}
            width={"70%"}
        // bodyStyle={{ maxHeight: "400px", overflow: "auto", backgroundColor: "#f0f0f0" }}
        >
            <SyntaxHighlighter
                language="javascript" style={vscDarkPlus}
                showLineNumbers
                customStyle={{ maxHeight: "400px", overflow: "auto", padding: "0px", margin: "0px" }}
            >
                {code}
            </SyntaxHighlighter>
        </Modal>
    </>
}


const AuthSetting: React.FC = () => {
    const [form] = Form.useForm()
    const [editable, setEditable] = useState(false)
    const zoneAuth = useSelector((state: RootState) => state.config.auth?.['0.zone'])
    const dispatch = useDispatch()
    const [open, setOpen] = useState<boolean>(false)
    const save = (values: any) => {
        setOpen(false)
        setEditable(false)
        form.setFieldsValue(values);
        dispatch(setZoneAuth(values))
        SetAuth(values.key).catch(err=>errorNotification("错误",err))
    }
    return <div style={{
        width: "auto",
        height: "23px",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f1f3f4"
    }}>
        <><Tooltip title="设置">
            <Button type='link' onClick={() => setOpen(true)}><UserOutlined /></Button>
        </Tooltip>
            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={() => {setOpen(false)}}
                footer={null}
                closeIcon={null}
                width={420}
                destroyOnClose
                afterOpenChange={(open)=>{
                    open && Get0zoneAuth().then(
                        result=>{
                            form.setFieldsValue({
                                key: result.key,
                            });
                        }
                    ).catch(
                        err=>errorNotification("错误",err)
                    )
                }}

            >
                <Form
                    {...authFormProps}
                    form={form}
                    disabled={!editable}
                    onFinish={(values) => save(values)}
                >
                    <Form.Item name="key">
                        <Input.Password placeholder="token" />
                    </Form.Item>
                </Form>
                <div style={{ display: 'flex', justifyContent: "flex-end" }}>
                    {
                        !editable ?
                            <Button {...buttonProps} onClick={() => setEditable(true)} >修改</Button>
                            :
                            <>
                                <Button {...buttonProps} htmlType="submit"
                                    onClick={() => form.submit()}
                                >保存</Button>
                                <Button {...buttonProps} htmlType="submit"
                                    onClick={() => { setEditable(false); setOpen(false) }}
                                >取消</Button>
                            </>
                    }
                </div>
            </Modal>
        </>
    </div>
}

const Zone: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string>();
    const [items, setItems] = useState<TabType[]>([]);
    const newTabIndex = useRef(0);

    useEffect(() => {
        setItems([{
            label: `${++newTabIndex.current}`,
            key: `${newTabIndex.current}`,
            children: <TabContent />,
        }])

    }, [])
    const onChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey);
    };

    const add = () => {
        const newActiveKey = `${++newTabIndex.current}`;
        const newPanes = [...items];
        newPanes.push({ label: newActiveKey, children: <TabContent />, key: newActiveKey });
        setItems(newPanes);
        setActiveKey(newActiveKey);
    };

    const remove = (targetKey: TargetKey) => {
        let newActiveKey = activeKey;
        let lastIndex = -1;
        items.forEach((item, i) => {
            if (item.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const newPanes = items.filter((item) => item.key !== targetKey);
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key;
            } else {
                newActiveKey = newPanes[0].key;
            }
        }
        setItems(newPanes);
        setActiveKey(newActiveKey);
    };

    const onEdit = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            add();
        } else {
            remove(targetKey);
        }
    };


    return (
        <ConfigProvider theme={
            {
                components: {
                    Tabs: {
                        cardHeight: 24
                    }
                }
            }
        }>
            <Tabs
                size="small"
                type="editable-card"
                onChange={onChange}
                activeKey={activeKey}
                onEdit={onEdit}
                items={items}
                tabBarExtraContent={{
                    left: <AuthSetting />
                }}
            />
        </ConfigProvider>

    );
};


const ExportDataPanel: React.FC<{ isExporting: boolean, maxPage: number, total: number, size: number, onOk: (page: number) => void }> = (props) => {
    const [page, setPage] = useState<number>(0)
    const [open, setOpen] = useState<boolean>(false)
    const [status, setStatus] = useState<"" | "error" | "warning">("")
    const maxPage = props.maxPage
    return <>
        <Button
            size="small"
            onClick={() => setOpen(true)}
            icon={props.isExporting ? <LoadingOutlined /> : <CloudDownloadOutlined />}
        >
            {props.isExporting ? "正在导出" : "导出结果"}
        </Button>
        <Modal
            {...ExportDataPanelProps}
            title="导出结果"
            open={open}
            onOk={async () => {
                if ((maxPage == 0) || (maxPage > 0 && (maxPage < page || page <= 0))) {
                    setStatus("error")
                    return
                } else {
                    setStatus("")
                }
                setOpen(false)
                props.onOk(page)
            }}
            onCancel={() => { setOpen(false); setStatus("") }}
        >
            <InputNumber
                status={status}
                onChange={(value) => {
                    (value !=null) && setPage(value)
                }}
                addonBefore={`导出页数(可用页数:${maxPage})`}
                min={maxPage > 0 ? 1 : 0}
                max={maxPage}
                keyboard={true}
                size='small'
            />
        </Modal></>
}

// type TabKey = "site" | "domain" | "apk" | "member" | "email" | "code" | "darknet" | "aim"
type TabKey = "site" | "domain" | "member" | "email"
const TabContent: React.FC = () => {
    const [input, setInput] = useState<string>("")
    const ref = {
        "site": React.createRef<any>(),
        "domain": React.createRef<any>(),
        // "apk": React.createRef<any>(),
        "member": React.createRef<any>(),
        "email": React.createRef<any>(),
        // "code": React.createRef<any>(),
        // "darknet": React.createRef<any>(),
        // "aim": React.createRef<any>(),
    }
    const items: TabType[] = [
        { label: <>信息系统</>, key: "site", children: <SiteTabContent ref={ref.site} />, closable: false, forceRender: true },
        { label: <>域名</>, key: "domain", children: <DomainTabContent ref={ref.domain} />, closable: false, forceRender: true },
        // { label: <>移动端应用</>, key: "apk", children: <ApkTabContent ref={ref.apk} />, closable: false, forceRender: true },
        { label: <>人员</>, key: "member", children: <MemberTabContent ref={ref.member} />, closable: false, forceRender: true },
        { label: <>邮箱</>, key: "email", children: <EmailTabContent ref={ref.email} />, closable: false, forceRender: true },
        // { label: <>代码/文档</>, key: "code", children: <CodeTabContent ref={ref.code} />, closable: false, forceRender: true },
        // { label: <>DWM情报</>, key: "darknet", children: <DarknetTabContent ref={ref.darknet} />, closable: false, forceRender: true },
        // { label: <>AIM情报  </>, key: "aim", children: <AimTabContent ref={ref.aim} />, closable: false, forceRender: true },
    ]
    const [activeKey, setActiveKey] = useState<TabKey>("site")

    async function query() {
        // console.log(ref[activeKey] == ref.site)
        const tmpInput = input.trim()
        if (tmpInput == "") return

        // ref[activeKey].current.query(tmpInput);
        if (input.includes("&&") || input.includes("||") || input.includes("(") || input.includes(")") || input.includes("=") || input.includes("==") || input.includes("===")
            || input.includes("=^") || input.includes("=$") || input.includes("=!") || input.includes("==!") || input.includes("=!^") || input.includes("=!$")) {
            ref[activeKey].current.query(tmpInput,40);
            return
        }
        ref.site.current.query(tmpInput,40);
        ref.domain.current.query(tmpInput,40);
        // ref.apk.current.query(tmpInput,1,40);
        ref.member.current.query(tmpInput,40);
        ref.email.current.query(tmpInput,40);
        // ref.code.current.query(tmpInput,1,40);
        // ref.darknet.current.query(tmpInput,1,40);
        // ref.aim.current.query(tmpInput);
    }
    return (
        <>
            <div style={{ display: "flex", justifyContent: 'center', alignItems: "center", marginBottom: "5px" }}>
                <Input
                    style={{ width: "600px" }}
                    size="small"
                    allowClear
                    value={input}
                    onPressEnter={query}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Search...'
                />
                <Button type='text' size="small" icon={<SearchOutlined />} onClick={query} />
                <Help />
            </div>
            <Tabs
                animated={{ inkBar: false, tabPane: false }}
                centered
                type="card"
                size="small"
                activeKey={activeKey}
                items={items}
                onChange={(key) => {
                    setActiveKey(key as TabKey)
                    console.log(ref)
                    console.log(ref[activeKey])
                }}

            />
        </>
    )
}

const siteMenuItems: MenuProps['items'] = [
    {
        label: '浏览器打开URL',
        key: MenuItemsKey.OpenUrl,
        icon: <GlobalOutlined />
    },
    {
        label: '复制单元格',
        key: MenuItemsKey.CopyCell,
        icon: <CloudOutlined />
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

const SiteTabContent = forwardRef((props, ref) => {
    const [messageApi, contextHolder] = message.useMessage();
    const selectedRow = useRef<{ item: zone.SiteItem|undefined, rowIndex: number|undefined, colKey: string|undefined }>({item:undefined,rowIndex:undefined,colKey:undefined})
    interface PageDataType extends zone.SiteItem{
        index:number
    }
    const [columns, setColumns] = useState<ColumnsType<zone.SiteItem>>([
        {
            title: '序号', dataIndex: "index", ellipsis: true, width: 50, fixed: "left", onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "index", }; }
                }
            }
        },
        {
            title: 'URL', dataIndex: "url", ellipsis: true, width: 200, fixed: "left", sorter: ((a, b) => localeCompare(a.url, b.url)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "url", }; },
                    onClick: () => copyCell(record.url)
                }
            }
        },
        {
            title: 'IP', dataIndex: "ip", ellipsis: true, width: 120, sorter: ((a, b) => localeCompare(a.ip, b.ip)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "ip", }; },
                    onClick: () => copyCell(record.ip)
                }
            }
        },
        {
            title: '端口', dataIndex: "port", ellipsis: true, width: 80, sorter: ((a, b) => localeCompare(a.port, b.port)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "port", }; },
                    onClick: () => copyCell(record.port)
                }
            }
        },
        {
            title: '网站标题', dataIndex: "title", ellipsis: true, width: 400, sorter: ((a, b) => localeCompare(a.title, b.title)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "title", }; },
                    onClick: () => copyCell(record.title)
                }
            }
        },
        // {
        //     title: '响应码', dataIndex: "status_code", ellipsis: true, width: 60, sorter: ((a, b) => localeCompare(a.status_code, b.status_code)), onCell: (record, index) => {
        //         return {
        //             onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "status_code", }; },
        //             onClick: () => copyCell(record.status_code)
        //         }
        //     }
        // },
        {
            title: 'CMS', dataIndex: "cms", ellipsis: true, width: 80, sorter: ((a, b) => localeCompare(a.cms, b.cms)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "cms", }; },
                    onClick: () => copyCell(record.cms)
                }
            }
        },
        // { title: '大陆', dataIndex: "continent", ellipsis: true, width: 60, },暂不需要
        // { title: '国家', dataIndex: "country", ellipsis: true, width: 60, },
        // { title: '省份', dataIndex: "province", ellipsis: true, width: 60, },
        {
            title: '城市', dataIndex: "city", ellipsis: true, width:80, sorter: ((a, b) => localeCompare(a.city, b.city)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "city", }; }
                }
            }
        },
        {
            title: 'Operator', dataIndex: "operator", ellipsis: true, width:100, sorter: ((a, b) => localeCompare(a.operator, b.operator)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "operator", }; }
                }
            }
        },
        // { title: 'Banner', dataIndex: "banner", ellipsis: true, width: 60, },
        // { title: 'HTML_Banner', dataIndex: "html_banner", ellipsis: true, width: 60, },
        {
            title: '企业名称', dataIndex: "group", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.group, b.group)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "group", }; }
                }
            }
        },
        {
            title: '备案', dataIndex: "beian", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.beian, b.beian)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "beian", }; }
                }
            }
        },
        {
            title: 'CDN', dataIndex: "is_cdn", ellipsis: true, width: 80, sorter: ((a, b) => localeCompare(a.is_cdn, b.is_cdn)), render: (text) => text == 0 ? "否" : "是", onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "is_cdn", }; }
                }
            }
        },
        {
            title: '证书', dataIndex: "ssl_certificate", ellipsis: true, width: 80, sorter: ((a, b) => localeCompare(a.ssl_certificate, b.ssl_certificate)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "ssl_certificate", }; }
                }
            }
        },
        {
            title: '服务', dataIndex: "service", ellipsis: true, width: 80, sorter: ((a, b) => localeCompare(a.service, b.service)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "service", }; }
                }
            }
        },
    ]);

    const pageSizeOptions = [40]
    const [input, setInput] = useState<string>("")
    const [inputCache, setInputCache] = useState<string>("")
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap=useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentSize] = useState<number>(pageSizeOptions[0])
    const [maxPage, setMaxPage] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const dispatch = useDispatch()

    useImperativeHandle(ref, () => ({
        query: (input: string,pageSize:number)=>handleFirstQuery(input,pageSize),
    }));

    const copyCell = (value: string | number | boolean) => {
        if (!value) {
            return
        }
        copy(value)
        messageApi.success("复制成功", 0.5)
    }

    useEffect(() => {
        Get().then(
            result=>{
                EventsOn(String(result.hasNew0ZoneSiteDownloadItem), function(){
                    setIsExporting(false)
                })
            }
        )
    }, [])

    const handleFirstQuery = async (input: string, pageSize:number) => {
        const tmpInput = input.trim()
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)
        //查询条件不为空则需要置空前一个数据
        setCurrentPage(1)
        setCurrentSize(pageSize)
        pageIDMap.current = []
        setLoading(true)
        setTotal(0)
        setMaxPage(0)

        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        QuerySite(0,tmpInput,1,pageSize)
            .then(
                (result)=>{
                    let index = 0
                    setPageData(
                        result.result?.items.map((item) => {
                            return { ...item, index: ++index }
                        } )
                    )
                    setTotal(result.result.total)
                    setLoading(false)
                    setMaxPage(result.maxPage)
                    pageIDMap.current[1] = result.id
                }

            )
            .catch(
                err=>{
                        errorNotification("0.zone查询出错", err)
                        setPageData([])
                }
            ).finally(()=>{
            setLoading(false)
        })
    }

    const handlePaginationChange = async (newPage: number, newSize: number) => {
        setLoading(true)
        //page发生变换
        if (newPage != currentPage && newSize==currentPageSize) {
            const pageID = pageIDMap.current[newPage]||0
            QuerySite(pageID,inputCache,newPage,currentPageSize)
                .then(
                    result=>{
                        let index = (newPage - 1) * currentPageSize
                        setPageData(
                            result.result.items?.map((item) => {
                                return { ...item, index: ++index }
                        }))
                        setCurrentPage(newPage)
                    }
                )
                .catch(
                    err=>{
                        errorNotification("0.zone查询出错", err)
                    }
                ).finally(
                ()=>{
                    setLoading(false)
                }
            )
        }

        //size发生变换
        if (newSize != currentPageSize) {
            handleFirstQuery(inputCache,newSize)
        }
    }

    const exportData = async (page: number) => {
        if (!pageIDMap.current[1]) {
            errorNotification("导出结果", QUERY_FIRST)
            return
        }
        setIsExporting(true)
        ExportSite(pageIDMap.current[1],page)
            .catch(
                err=> errorNotification("导出结果", err)
            )
    }

    const handleMenuItemClick = (key: MenuItemsKey) => {
        if(!selectedRow.current.item)return
        switch (key) {
            case MenuItemsKey.OpenUrl:
                if (selectedRow.current.item.url) {
                    BrowserOpenURL(selectedRow.current.item.url)
                }
                break
            case MenuItemsKey.CopyCell:
                {
                    const item = selectedRow.current.item as zone.SiteItem
                    for (const key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.current.colKey) {
                            copy(item[key as keyof zone.SiteItem])
                        }
                    }
                }
                break
            case MenuItemsKey.CopyRow:
                copy(selectedRow.current.item)
                break
            case MenuItemsKey.CopyCol:
                {
                    const values = pageData.map(item => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.current?.colKey) {
                                return item[key as keyof zone.SiteItem]
                            }
                        }
                        return ""
                    })
                    copy(values)
                    break
                }
        }
        selectedRow.current={item:undefined,colKey:undefined,rowIndex:undefined}
    };

    const handleHeaderResize =
        (index: number) => (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
            const newColumns = [...columns];
            newColumns[index] = {
                ...newColumns[index],
                width: size.width,
            };
            setColumns(newColumns)
        };

    const getMergeColumns = (): ColumnsType<zone.SiteItem> => {
        return columns.map((col, index) => ({
            ...col,
            onHeaderCell: (column: ColumnsType<zone.SiteItem>[number]) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }));
    }

    return (<div >
        {contextHolder}
        <ContextMenu
            // open={openMenu}
            // event={event}
            items={siteMenuItems}
            onItemClick={(key) => {
                handleMenuItemClick(key as MenuItemsKey)
            }}
        // toInvisible={() => { setOpenMenu(false) }}
        >
            <Table
                // locale={{ emptyText: "暂无数据" }}
                showSorterTooltip={false}
                scroll={{
                    y: 'calc(100vh - 224px)',
                    scrollToFirstRowOnChange: true
                }}
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
                    <ExportDataPanel isExporting={isExporting} maxPage={maxPage} total={total} size={currentPageSize} onOk={(page) => exportData(page)} />
                </div>}
                onRow={(record) => {
                    return {
                        onContextMenu: (event) => {
                            selectedRow.current && (selectedRow.current.item = record )
                        }
                    };
                }}

                sticky
                rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
            />
        </ContextMenu>
    </div>)
})

const doaminMenuItems: MenuProps['items'] = [
    {
        label: '浏览器打开域名',
        key: MenuItemsKey.OpenDomain,
        icon: <GlobalOutlined />
    },
    // {
    //     label: '查询C段',
    //     key: MenuItemsKey.IpCidr,
    //     icon: <CloudOutlined />
    // },
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

const DomainTabContent = forwardRef((props, ref) => {
    const selectedRow = useRef<{ item: zone.DomainItem|undefined, rowIndex: number|undefined, colKey: string|undefined }>({item:undefined,rowIndex:undefined,colKey:undefined})
    interface PageDataType extends zone.DomainItem{
        index:number
    }
    const [columns, setColumns] = useState<ColumnsType<zone.DomainItem>>([
        {
            title: '序号', dataIndex: "index", ellipsis: true, width: 50, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "index", }; }
                }
            }
        },
        {
            title: '域名', dataIndex: "url", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.url, b.url)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "url", }; },
                    onClick: () => copyCell(record.url)
                }
            }
        },
        {
            title: 'IP', dataIndex: "ip", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.ip, b.ip)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "ip", }; },
                    onClick: () => copyCell(record.ip)
                }
            }
        },
        {
            title: '所属企业', dataIndex: "company", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.company, b.company)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "company", }; },
                    onClick: () => copyCell(record.company)
                }
            }
        },
        {
            title: '备案', dataIndex: "icp", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.icp, b.icp)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "icp", }; },
                    onClick: () => copyCell(record.icp)
                }
            }
        },
    ])
    const pageSizeOptions = [40]
    const [input, setInput] = useState<string>("")
    const [inputCache, setInputCache] = useState<string>("")
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap=useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentSize] = useState<number>(pageSizeOptions[0])
    const [maxPage, setMaxPage] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [messageApi, contextHolder] = message.useMessage();
    const copyCell = (value: string | number | boolean) => {
        if (!value) {
            return
        }
        copy(value)
        messageApi.success("复制成功", 0.5)
    }
    useImperativeHandle(ref, () => ({
        query: (input: string,pageSize:number)=>handleFirstQuery(input,pageSize),
    }));

    useEffect(() => {
        Get().then(
            result=>{
                EventsOn(String(result.hasNew0ZoneDomainDownloadItem), function(){
                    setIsExporting(false)
                })
            }
        )
    }, [])

    const handleFirstQuery = async (input: string,pageSize:number) => {
        const tmpInput = input.trim()
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)
        //查询条件不为空则需要置空前一个数据
        pageIDMap.current=[]
        setLoading(true)
        setTotal(0)
        setCurrentPage(1)
        setCurrentSize(pageSize)
        setMaxPage(0)

        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        QueryDomain(0,tmpInput,1,pageSize)
            .then(
                result=>{
                    let index = 0
                    setPageData(result.result.items?.map((item) => {
                        return { ...item, index: ++index }
                    }))
                    setTotal(result.result.total)
                    setMaxPage(result.maxPage)
                    pageIDMap.current[1] = result.id
                }
            )
            .catch(
                err=>{
                    errorNotification("0.zone查询出错", err)
                    setPageData([])
                }
            ).finally(()=>{
            setLoading(false)
        })
    }

    const handlePaginationChange = async (newPage: number, newSize: number) => {
        setLoading(true)

        //page发生变换
        if (newPage != currentPage && newSize==currentPageSize) {
            QueryDomain(0,inputCache,1,newPage)
                .then(
                    result=>{
                        let index = (newPage - 1) * currentPageSize
                        setPageData(result.result.items?.map((item) => {
                            return { ...item, index: ++index }
                        }))
                        setCurrentPage(newPage)
                    }
                )
                .catch(
                    err=>{
                        errorNotification("0.zone查询出错", err)
                        setPageData([])
                    }
                )
                .finally(()=>{
                    setLoading(false)
                })
        }

        //size发生变换
        if (newSize != currentPageSize) {
            handleFirstQuery(inputCache,newSize)
        }
    }

    const exportData = async (page: number) => {
        if (!pageIDMap.current[1]) {
            errorNotification("导出结果", QUERY_FIRST)
            return
        }
        setIsExporting(true)
        ExportDomain(pageIDMap.current[1],page)
            .catch(
                err=> errorNotification("导出结果", err)
            )
    }

    const handleMenuItemClick = (key: MenuItemsKey) => {
        if(!selectedRow.current.item)return
        switch (key) {
            case MenuItemsKey.OpenDomain:
                {
                    const url = selectedRow.current.item.url
                    if (url) {
                        BrowserOpenURL(url.startsWith("http") ? url : "http://" + url)
                    }
                    break
                }
            case MenuItemsKey.CopyCell:
                {
                    const item = selectedRow.current.item as zone.DomainItem
                    for (const key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.current.colKey) {
                            copy(item[key as keyof zone.DomainItem])
                        }
                    }
                }
                break
            case MenuItemsKey.CopyRow:
                copy(selectedRow.current)
                break
            case MenuItemsKey.CopyCol:
                {
                    const values = pageData.map(item => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.current.colKey) {
                                return item[key as keyof zone.DomainItem]
                            }
                        }
                        return ""
                    })
                    copy(values)
                    break
                }
        }
        selectedRow.current = {item:undefined,rowIndex:undefined,colKey:undefined}
    };

    const handleHeaderResize =
        (index: number) => (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
            const newColumns = [...columns];
            newColumns[index] = {
                ...newColumns[index],
                width: size.width,
            };
            setColumns(newColumns)
        };

    const getMergeColumns = (): ColumnsType<zone.DomainItem> => {
        return columns.map((col, index) => ({
            ...col,
            onHeaderCell: (column: ColumnsType<zone.DomainItem>[number]) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }));
    }
    return (<div >
        {contextHolder}
        <ContextMenu
            // open={openMenu}
            // event={event}
            items={doaminMenuItems}
            onItemClick={key => handleMenuItemClick(key as MenuItemsKey)}
        // toInvisible={() => { setOpenMenu(false) }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Table
                // locale={{ emptyText: "暂无数据" }}
                showSorterTooltip={false}
                scroll={{
                    y: 'calc(100vh - 224px)',
                    scrollToFirstRowOnChange: true
                }}
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
                    <ExportDataPanel isExporting={isExporting} maxPage={maxPage} total={total} size={currentPageSize} onOk={(page) => exportData(page)} />
                </div>}
                // onRow={(record) => {
                //     return {
                //         onContextMenu: (event) => { selectedRow.current.item = record },
                //     };
                // }}
                sticky
                rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
            />
            </div>
        </ContextMenu>
    </div>)
})

const ApkTabContent = forwardRef((props, ref) => {
    interface PageDataType extends zone.ApkItem{
        index:number
    }
    const [columns, setColumns] = useState<ColumnsType<zone.ApkItem>>([
        { title: '序号', dataIndex: "index", ellipsis: true, width: 50, },
        {
            title: '应用名称', dataIndex: "title", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.title, b.title)), onCell: (record, index) => {
                return {
                    onClick: () => copyCell(record.title)
                }
            }
        },
        { title: '所属企业', dataIndex: "company", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.company, b.company)), onCell: (record, index) => {
            return {
                onClick: () => copyCell(record.company)
            }
        } },
        { title: '应用类型', dataIndex: "type", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.type, b.type)), onCell: (record, index) => {
            return {
                onClick: () => copyCell(record.type)
            }
        } },
        { title: '数据来源', dataIndex: "source", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.source, b.source)), onCell: (record, index) => {
            return {
                onClick: () => copyCell(record.source)
            }
        } },
        { title: '更新时间', dataIndex: "timestamp", ellipsis: true, sorter: ((a, b) => localeCompare(a.timestamp, b.timestamp)), onCell: (record, index) => {
            return {
                onClick: () => copyCell(record.timestamp)
            }
        } },
    ])
    const pageSizeOptions = [40]
    const [input, setInput] = useState<string>("")
    const [inputCache, setInputCache] = useState<string>("")
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap=useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentSize] = useState<number>(pageSizeOptions[0])
    const [maxPage, setMaxPage] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [messageApi, contextHolder] = message.useMessage();
    const copyCell = (value: string | number | boolean) => {
        if (!value) {
            return
        }
        copy(value)
        messageApi.success("复制成功", 0.5)
    }
    useImperativeHandle(ref, () => ({
        query: (input: string,pageSize:number)=>handleFirstQuery(input,pageSize),
    }));

    const handleFirstQuery = async (input: string,pageSize:number) => {
        const tmpInput = input.trim()
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)
        //查询条件不为空则需要置空前一个数据
        pageIDMap.current=[]
        setLoading(true)
        setTotal(0)
        setCurrentPage(1)
        setCurrentSize(pageSize)
        setMaxPage(0)

        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        QueryApk(0,inputCache,1,pageSize)
            .then(
                (result)=>{
                    let index = 0
                    setPageData(
                        result.result.items?.map((item) => {
                            return { ...item, index: ++index }
                        })
                    )
                    setTotal(result.result.total)
                    setMaxPage(result.maxPage)
                    pageIDMap.current[1]=result.id
                }
            )
            .catch(
                (err)=>{
                    errorNotification("0.zone查询出错", err)
                    setPageData([])
                }
            )
            .finally(()=>{
                setLoading(false)
            })
    }

    const getPageData = () => {
        return pageData[currentPage] ? pageData[currentPage] : []
    }

    const handlePaginationChange = async (newPage: number, newSize: number) => {
        setLoading(true)

        //page发生变换
        if (newPage != currentPage&& newSize==currentPageSize) {
            QueryApk(pageIDMap.current[newPage]||0,inputCache,newPage,currentPageSize)
                .then((result)=>{
                    let index = (newPage - 1) * currentPageSize
                    setPageData(
                        result.result.items?.map((item) => {
                            return { ...item, index: ++index }
                        })
                    )
                    setCurrentPage(newPage)
                    setLoading(false)
                })
                .catch((err)=>{  errorNotification("0.zone查询出错", err)})
                .finally(()=>{ setLoading(false)})
        }

        //size发生变换
        if (newSize != currentPageSize) {
            handleFirstQuery(inputCache,newSize)
        }
    }

    const exportData = async (page: number) => {
        // if (id == "") {
        //     errorNotification("导出结果", QUERY_FIRST)
        //     return
        // }
        // setIsExporting(true)
        // const error = await $zoneSiteQueryExport(id, page)
        // if (error) {
        //     errorNotification("导出结果", error)
        //     setIsExporting(false)
        //     return
        // }
        // const pollingTimer = setInterval(async () => {
        //     const result = await $zoneQueryExportStatus(id)
        //     console.log(result)
        //     if (result.error) {
        //         errorNotification("导出结果", result.message)
        //         clearInterval(pollingTimer)
        //         setIsExporting(false)
        //         return
        //     }
        //     if (result.filename) {
        //         dispatch(setHasNewLogItem(true))
        //         clearInterval(pollingTimer)
        //         setIsExporting(false)
        //         return
        //     }
        // }, 1000);
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

    const getMergeColumns = (): ColumnsType<zone.ApkItem> => {
        return columns.map((col, index) => ({
            ...col,
            onHeaderCell: (column: ColumnsType<zone.ApkItem>[number]) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }));
    }

    return (<div >
        {contextHolder}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Table
            // locale={{ emptyText: "暂无数据" }}
            showSorterTooltip={false}
            scroll={{
                y: 'calc(100vh - 224px)',
                scrollToFirstRowOnChange: true
            }}
            bordered
            columns={getMergeColumns()}
            components={{
                header: {
                    cell: ResizableTitle,
                },
            }}
            dataSource={pageData}
            expandable={{
                expandedRowRender: (record) => {
                    console.log(record.msg)
                    if ("mini_program" in record.msg) {
                        // msg 属性的实际类型是 MsgOfWechatType
                        const msgOfWechat: MsgOfWechatType = record.msg;
                        return (<div style={{ display: 'flex' }}>
                            <Space style={{ minWidth: "300px", maxWidth: "300px" }} direction="vertical">
                                <span>
                                    <Tag bordered={false} color="processing">
                                        Wechat ID
                                    </Tag><span style={{ fontSize: "14px" }}>{msgOfWechat.wechat_id}</span>
                                </span>
                                <span style={{ display: 'flex', alignItems: "flex-start" }}>
                                    <Tag bordered={false} color="processing">
                                        Wechat Code
                                    </Tag><img style={{ height: "32px" }} src={msgOfWechat.code} />
                                </span>
                            </Space>
                            <span>
                                <Tag bordered={false} color="processing">
                                    描述说明
                                </Tag><span style={{ fontSize: "13px" }}>{msgOfWechat.introduction}</span>
                            </span>
                        </div>)
                    } else if ("app_id" in record.msg) {
                        // msg 属性的实际类型是 MsgOfMiniProgramType
                        const msgOfMiniProgram: MsgOfMiniProgramType = record.msg;
                        console.log(11, msgOfMiniProgram)
                        return (<>
                            <Space >
                                <Space style={{ minWidth: "300px", maxWidth: "300px" }} direction="vertical">
                                    <span>
                                        <Tag bordered={false} color="processing">
                                            APP ID
                                        </Tag><span style={{ fontSize: "14px" }}>{msgOfMiniProgram.app_id}</span>
                                    </span>
                                    <span>
                                        <Tag bordered={false} color="processing">
                                            微信二维码
                                        </Tag><img style={{ fontSize: "14px" }} src={msgOfMiniProgram.code} />
                                    </span>
                                </Space>
                            </Space>
                            <span>
                                <Tag bordered={false} color="processing">
                                    描述说明
                                </Tag><span style={{ fontSize: "13px" }}>{msgOfMiniProgram.introduction}</span>
                            </span>
                        </>)
                    } else if ("app_url" in record.msg) {
                        // msg 属性的实际类型是 MsgOfApkType
                        const msgOfApk: MsgOfApkType = record.msg;
                        // 现在你可以使用 msgOfApk 来访问 MsgOfApkType 的属性
                        return (<>
                            <Space direction="vertical">
                                <span>
                                    <Tag bordered={false} color="processing">
                                        应用链接
                                    </Tag><span style={{ fontSize: "14px" }}>{msgOfApk.app_url}</span>
                                </span>
                                <span>
                                    <Tag bordered={false} color="processing">
                                        描述说明
                                    </Tag><span style={{ fontSize: "13px" }}>{msgOfApk.introduction}</span>
                                </span>
                            </Space>
                        </>)
                    }
                    return ""

                }
                ,
                // rowExpandable: (record) => true,
                //expandedRowKeys: getPageData()?.length == 0 ? [] : getPageData()?.map((item: any, index: any) => item.index)
            }}


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
                <ExportDataPanel isExporting={isExporting} maxPage={maxPage} total={total} size={currentPageSize} onOk={(page) => exportData(page)} />
            </div>}
            sticky
            rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
        />
        </div>
    </div>)
})


const emailMenuItems: MenuProps['items'] = [
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

const EmailTabContent = forwardRef((props, ref) => {
    interface PageDataType extends zone.EmailItem {
        index:number
    }
    const selectedRow = useRef<{ item: zone.EmailItem|undefined, rowIndex: number|undefined, colKey: string|undefined }>({item:undefined,rowIndex:undefined,colKey:undefined})
    const [columns, setColumns] = useState<ColumnsType<zone.EmailItem>>([
        {
            title: '序号', dataIndex: "index", ellipsis: true, width: 50, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "index", }; }
                }
            }
        },
        {
            title: '邮箱', dataIndex: "email", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.email, b.email)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "email", }; },
                    onClick: () => copyCell(record.email)
                }
            }
        },
        {
            title: '所属企业', dataIndex: "group", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.group, b.group)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "group", }; },
                    onClick: () => copyCell(record.group)
                }
            }
        },
        {
            title: '来源', dataIndex: "source", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.source, b.source)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "source", }; },
                    onClick: () => copyCell(record.source?.join(" "))
                }
            }
        },
        {
            title: '更新时间', dataIndex: "timestamp", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.timestamp, b.timestamp)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "timestamp", }; },
                    onClick: () => copyCell(record.timestamp)
                }
            }
        },
    ])
    const pageSizeOptions = [40]
    const [input, setInput] = useState<string>("")
    const [inputCache, setInputCache] = useState<string>("")
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap=useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentSize] = useState<number>(pageSizeOptions[0])
    const [maxPage, setMaxPage] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [messageApi, contextHolder] = message.useMessage();
    const copyCell = (value: string | number | boolean) => {
        if (!value) {
            return
        }
        copy(value)
        messageApi.success("复制成功", 0.5)
    }
    useImperativeHandle(ref, () => ({
        query: (input: string,pageSize:number)=>handleQuery(input,pageSize),
    }));


    useEffect(() => {
        Get().then(
            result=>{
                EventsOn(String(result.hasNew0ZoneEmailDownloadItem), function(){
                    setIsExporting(false)
                })
            }
        )
    }, [])

    const handleQuery = async (input: string,pageSize:number) => {
        const tmpInput = input.trim()
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)
        //查询条件不为空则需要置空前一个数据
        pageIDMap.current = []
        setLoading(true)
        setTotal(0)
        setCurrentPage(1)
        setCurrentSize(pageSize)
        setMaxPage(0)

        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        QueryEmail(0,tmpInput,1,pageSize)
            .then((result)=>{
                let index = 0
                setPageData(
                    result.result.items?.map((item) => {
                        return { ...item, index: ++index }
                    })
                )
                setTotal(result.result.total)
                setLoading(false)
                setMaxPage(result.maxPage)
                pageIDMap.current[1]=result.id
            })
            .catch(
                err=>{
                    errorNotification("0.zone查询出错", err)
                    setPageData([])
                }
            )
            .finally(
                ()=>{
                    setLoading(false)
                }
            )
    }


    const handlePaginationChange = async (newPage: number, newSize: number) => {
        setLoading(true)

        //page发生变换
        if (newPage != currentPage&& newSize==currentPageSize) {
            QueryEmail(pageIDMap.current[newPage]||0,inputCache,newPage,currentPageSize)
                .then(result=>{
                    let index = (newPage - 1) * currentPageSize
                    setPageData(
                        result.result.items?.map((item) => {
                            return { ...item, index: index }
                        })
                    )
                    setCurrentPage(newPage)
                    setLoading(false)
                })
                .catch(err=>{
                    errorNotification("0.zone查询出错", err)
                })
                .finally(
                    ()=>{
                        setLoading(false)
                    }
                )
        }

        //size发生变换
        if (newSize != currentPageSize) {
            handleQuery(inputCache,newSize)
        }
    }

    const exportData = async (page: number) => {
        if (!pageIDMap.current[1]) {
            errorNotification("导出结果", QUERY_FIRST)
            return
        }
        setIsExporting(true)
        ExportEmail(pageIDMap.current[1],page)
            .catch(
                err=> errorNotification("导出结果", err)
            )
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

    const getMergeColumns = (): ColumnsType<zone.EmailItem> => {
        return columns.map((col, index) => ({
            ...col,
            onHeaderCell: (column: ColumnsType<zone.EmailItem>[number]) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }));
    }

    const handleMenuItemClick = (key: MenuItemsKey) => {
        switch (key) {
            case MenuItemsKey.CopyCell:
                {
                    const item = selectedRow.current.item as ZoneEmailItemType
                    for (const key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.current.colKey) {
                            copy(item[key as keyof ZoneEmailItemType])
                        }
                    }
                }
                break
            case MenuItemsKey.CopyRow:
                copy(selectedRow.current.item)
                break
            case MenuItemsKey.CopyCol:
                {
                    const values = pageData.map(item => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.current.colKey) {
                                return item[key as keyof zone.EmailItem]
                            }
                        }
                        return ""
                    })
                    copy(values)
                    break
                }
        }
        selectedRow.current = {item:undefined,rowIndex:undefined,colKey:undefined}
    };
    return (<div >
        {contextHolder}
        <ContextMenu
            // open={openMenu}
            // event={event}
            items={emailMenuItems}
            onItemClick={key => handleMenuItemClick(key as MenuItemsKey)}
        // toInvisible={() => { setOpenMenu(false) }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Table
                // locale={{ emptyText: "暂无数据" }}
                showSorterTooltip={false}
                scroll={{
                    y: 'calc(100vh - 224px)',
                    scrollToFirstRowOnChange: true
                }}
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
                    <ExportDataPanel isExporting={isExporting} maxPage={maxPage} total={total} size={currentPageSize} onOk={(page) => exportData(page)} />
                </div>}
                // onRow={(record) => {
                //     return {
                //         onContextMenu: (event) => { selectedRow.current.item = record },
                //     };
                // }}
                sticky
                rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
            />
            </div>
        </ContextMenu>
    </div>)
})

const memberMenuItems: MenuProps['items'] = [
    {
        label: '复制单元格',
        key: MenuItemsKey.CopyCell,
        icon: <CloudOutlined />
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

const MemberTabContent = forwardRef((props, ref) => {
    interface PageDataType extends zone.MemberItem{
        index:number
    }
    const [columns, setColumns] = useState<ColumnsType<zone.MemberItem>>([
        {
            title: '序号', dataIndex: "index", ellipsis: true, width: 50, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "index", }; }
                }
            }
        },
        {
            title: '姓名', dataIndex: "name", ellipsis: true, width: 100, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "name", }; },
                    onClick: () => copyCell(record.name)
                }
            }
        },
        {
            title: '职位', dataIndex: "position", ellipsis: true, width: 200, render: (text, record: ZoneMemberItemType, index) => record.position?.join(" "), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "position", }; },
                    onClick: () => copyCell(record.position?.join(" "))
                }
            }
        },
        {
            title: '简介', dataIndex: "introduction", ellipsis: true, width: 200, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "introduction", }; },
                    onClick: () => copyCell(record.introduction)
                }
            }
        },
        {
            title: '来源', dataIndex: "source", ellipsis: true, width: 100, onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "source", }; },
                    onClick: () => copyCell(record.source)
                }
            }
        },
        {
            title: '所属企业', dataIndex: "company", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.company, b.company)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "company", }; },
                    onClick: () => copyCell(record.company)
                }
            }
        },
        {
            title: '更新时间', dataIndex: "timestamp", ellipsis: true, width: 200, sorter: ((a, b) => localeCompare(a.timestamp, b.timestamp)), onCell: (record, index) => {
                return {
                    onContextMenu: () => { selectedRow.current = { item: record, rowIndex: index, colKey: "timestamp", }; },
                    onClick: () => copyCell(record.timestamp)
                }
            }
        },
    ]);
    const pageSizeOptions = [40]

    const [input, setInput] = useState<string>("")
    const [inputCache, setInputCache] = useState<string>("")
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap=useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentSize] = useState<number>(pageSizeOptions[0])
    const [maxPage, setMaxPage] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const selectedRow = useRef<{ item: zone.MemberItem|undefined, rowIndex: number|undefined, colKey: string|undefined }>({item:undefined,rowIndex:undefined,colKey:undefined})
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [messageApi, contextHolder] = message.useMessage();
    const copyCell = (value: string | number | boolean) => {
        if (!value) {
            return
        }
        copy(value)
        messageApi.success("复制成功", 0.5)
    }
    useImperativeHandle(ref, () => ({
        query: (input: string,pageSize:number)=>handlFirstQuery(input,pageSize),
    }));


    useEffect(() => {
        Get().then(
            result=>{
                EventsOn(String(result.hasNew0ZoneMemberDownloadItem), function(){
                    setIsExporting(false)
                })
            }
        )
    }, [])

    const handlFirstQuery = async (input: string,pageSize:number) => {
        const tmpInput = input.trim()
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)
        //查询条件不为空则需要置空前一个数据
        pageIDMap.current = []
        setLoading(true)
        setTotal(0)
        setCurrentPage(1)
        setCurrentSize(pageSize)
        setMaxPage(0)

        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        QueryMember(0,tmpInput,1,pageSize)
            .then(result=>{
                let index = 0
                setPageData(
                    result.result.items?.map((item) => {
                        return { ...item, index: ++index }
                    })
                )
                setTotal(result.result.total)
                setMaxPage(result.maxPage)
                pageIDMap.current[1]=result.id
            })
            .catch(
                err=>{
                    errorNotification("0.zone查询出错", err)
                   setPageData([])
                }
            )
            .finally(()=>{
                setLoading(false)
            })

    }

    const handlePaginationChange = async (newPage: number, newSize: number) => {
        setLoading(true)

        //page发生变换
        if (newPage != currentPage&& newSize==currentPageSize) {
            QueryMember(pageIDMap.current[newPage]||0,inputCache,newPage,currentPage)
                .then(result=>{
                    let index = (newPage - 1) * currentPageSize
                    setPageData(
                        result.result.items?.map((item) => {
                        return { ...item, index: ++index }
                    }))
                    setCurrentPage(newPage)
                    pageIDMap.current[newPage]= result.id
                    setTotal(result.result.total)
                    setMaxPage(result.maxPage)
                })
                .catch(err=>{
                    errorNotification("0.zone查询出错", err)
                })
                .finally(()=>{
                    setLoading(false)
                })
        }

        //size发生变换
        if (newSize != currentPageSize) {
            handlFirstQuery(inputCache,newSize)
        }
    }

    const exportData = async (page: number) => {
        if (!pageIDMap.current[1]) {
            errorNotification("导出结果", QUERY_FIRST)
            return
        }
        setIsExporting(true)
        ExportMember(pageIDMap.current[1],page)
            .catch(err=>errorNotification("导出结果", err))
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

    const getMergeColumns = (): ColumnsType<ZoneMemberItemType> => {
        return columns.map((col, index) => ({
            ...col,
            onHeaderCell: (column: ColumnsType<ZoneMemberItemType>[number]) => ({
                width: column.width,
                onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
            }),
        }));
    }

    const handleMenuItemClick = (key: MenuItemsKey) => {
        switch (key) {
            case MenuItemsKey.CopyCell:
                {
                    const item = selectedRow.current.item as zone.MemberItem
                    for (const key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.current.colKey) {
                            copy(item[key as keyof zone.MemberItem])
                        }
                    }
                }
                break
            case MenuItemsKey.CopyRow:
                copy(selectedRow.current.item)
                break
            case MenuItemsKey.CopyCol:
                {
                    const values = pageData.map(item => {
                        for (const key in item) {
                            if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.current.colKey) {
                                return item[key as keyof zone.MemberItem]
                            }
                        }
                        return ""
                    })
                    copy(values)
                    break
                }
        }
        selectedRow.current = {item:undefined,rowIndex:undefined,colKey:undefined}
    }
    return (<div >
        {contextHolder}
        <ContextMenu
            items={memberMenuItems}
            onItemClick={key => handleMenuItemClick(key as MenuItemsKey)}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Table
                // locale={{ emptyText: "暂无数据" }}
                showSorterTooltip={false}
                scroll={{
                    y: 'calc(100vh - 224px)',
                }}
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
                    <ExportDataPanel isExporting={isExporting} maxPage={maxPage} total={total} size={currentPageSize} onOk={(page) => exportData(page)} />
                </div>}
                // onRow={(record) => {
                //     return {
                //         onContextMenu: (event) => { selectedRow.current.item = record },
                //     };
                // }}
                sticky
                rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
            />
            </div>
        </ContextMenu>
    </div>)
})

const CodeTabContent = forwardRef((props, ref) => {
    interface PageDataType extends zone.CodeItem{
        index:number
    }
    const pageSizeOptions: number[] = [10]
    const [inputCache, setInputCache] = useState<string>("")
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap=useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentSize] = useState<number>(pageSizeOptions[0])
    const [maxPage, setMaxPage] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [isExporting, setIsExporting] = useState<boolean>(false)

    useImperativeHandle(ref, () => ({
        query: (input: string,pageSize:number)=>handleFirstQuery(input,pageSize),
    }));

    const handleFirstQuery = (input: string,pageSize:number) => {
        const tmpInput = input.trim()
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)
        //查询条件不为空则需要置空前一个数据
        pageIDMap.current=[]
        setLoading(true)
        setTotal(0)
        setCurrentPage(1)
        setCurrentSize(pageSize)
        setMaxPage(0)

        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        QueryCode(0,tmpInput,1,pageSize)
            .then(result=>{
                let index = 0
                setPageData(
                    result.result.items?.map((item) => {
                        const instance = new zone.CodeItem(item)
                        const {convertValues} = instance
                        return { ...item, index: ++index ,convertValues,}
                    })
                )
                setTotal(result.result.total)
                setMaxPage(result.maxPage)
                pageIDMap.current[1]=result.id
            })
            .catch(err=>{
                errorNotification("0.zone查询出错", err)
                setPageData([])
            })
            .finally(()=>setLoading(false))
    }

    const handlePaginationChange = async (newPage: number, newSize: number) => {
        //page发生变换
        if (newPage != currentPage&& newSize==currentPageSize) {
            setLoading(true)
            QueryCode(pageIDMap.current[newPage]||0,inputCache,newPage,currentPageSize)
                .then(result=>{
                    let index = (newPage - 1) * currentPageSize
                    setPageData(
                        result.result.items?.map((item) => {
                        const instance = new zone.CodeItem(item)
                            const {convertValues}=instance
                            return { ...item, index: index ,convertValues}
                        })
                    )
                    setCurrentPage(newPage)
                    pageIDMap.current[newPage] = result.id
                })
                .catch(err=>{
                    errorNotification("0.zone查询出错", err)
                })
                .finally(()=>{
                    setLoading(false)
                })
        }

        //size发生变换
        if (newSize != currentPageSize) {
            handleFirstQuery(inputCache,newSize)
        }
    }

    const exportData = async (page: number) => {
        if (!pageIDMap.current[1]) {
            errorNotification("导出结果", QUERY_FIRST)
            return
        }
        // setIsExporting(true)
        // ExportMember(pageIDMap.current[1],page)
        //     .catch(err=>errorNotification("导出结果", err))
    }

    const LineNumber = ({ index, style }: { index: number, style?: React.CSSProperties }) => (
        <span style={{ position: 'sticky', top: 0, background: '#f0f0f0', flex: 'none', width: "40px", zIndex: 2, ...style, }}>
            {index}
        </span>
    );

    const getOp = (phone: string[], email: string[], telegram: string[], domain: string[], ip: string[], netdisk: string[]): RadioOption[] => {
        const op: RadioOption[] = []
        if (phone?.length > 0) {
            op.push({
                label: "涉及手机号码", value: "phone_list", badgeCount: phone.length,
                content: phone.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (email?.length > 0) {
            op.push({
                label: "涉及邮箱", value: "email_list", badgeCount: email.length,
                content: email.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (telegram?.length > 0) {
            op.push({
                label: "涉及TG", value: "telegram_list", badgeCount: telegram.length,
                content: telegram.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (domain?.length > 0) {
            op.push({
                label: "涉及域名", value: "domain_list", badgeCount: domain.length,
                content: domain.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (ip?.length > 0) {
            op.push({
                label: "涉及IP", value: "ip_list", badgeCount: ip.length,
                content: ip.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (netdisk?.length > 0) {
            op.push({
                label: "涉及网盘", value: "wangpan_list", badgeCount: netdisk.length,
                content: netdisk.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        return op
    }

    const MyItem: React.ForwardRefRenderFunction<HTMLDivElement, { line: string, index: number } & { style?: React.CSSProperties }
    > = (props, ref) => {
        const { style, index, line } = props;

        return (
            <span
                ref={ref}
                style={{
                    // lineHeight: '30px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    // position: 'relative',
                    alignItems: 'center',
                    borderInline: 0,
                    backgroundColor: "rgba(250, 250, 250,8)",
                    whiteSpace: 'nowrap',
                    ...style,
                }}
            >
                <LineNumber index={index} style={{ left: 0, }} />
                {line}
            </span>
        );
    };
    const ForwardMyItem = React.forwardRef(MyItem);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Spin
                spinning={loading}>
                <div style={{
                    maxHeight: 'calc(100vh - 195px)',
                    //height:tableHeight,//Todo 
                    overflow: "auto"
                }}>
                    {
                        pageData.length == 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
                            <AdList
                                split={false}
                                dataSource={pageData}
                                renderItem={(item, index) => {
                                    const tmp = item.code_detail.split("\n");
                                    const codeSlice: { index: number, line: string }[] = tmp.map((line: string, index: number) => { return { index: index, line: line } }
                                    )
                                    const ops = getOp(
                                        item.detail_parsing?.phone_list||[],
                                        item.detail_parsing?.email_list||[],
                                        item.detail_parsing?.telegram_list||[],
                                        item.detail_parsing?.domain_list||[],
                                        item.detail_parsing?.ip_list||[],
                                        item.detail_parsing?.wangpan_list||[]
                                    );
                                    return <AdList.Item style={{ padding: "5px 0px 5px 0px" }}>
                                        <Space direction='vertical'
                                            style={{ width: "100%", border: "1px solid #f0f0f0", borderRadius: "4px", padding: "5px", }}
                                        >
                                            <Space direction='vertical' style={{ width: "100%" }} >
                                                <Space wrap style={{ width: "100%" }}>
                                                    <span style={{
                                                        display: 'flex',
                                                        justifyContent: "center",
                                                        alignItems: "center"
                                                    }}>
                                                        <Tag bordered={false} color="cyan">序号:{(currentPage - 1) * currentPageSize + index + 1}</Tag>
                                                        <Tooltip title={item.name} placement="bottom" destroyTooltipOnHide overlayStyle={{ maxWidth: '1000px' }}>
                                                            <span
                                                                style={{
                                                                    display: "block",
                                                                    whiteSpace: "nowrap",/* 防止文本换行 */
                                                                    overflow: "hidden", /* 隐藏超出容器宽度的内容 */
                                                                    textOverflow: "ellipsis", /* 显示省略号 */
                                                                    color: "#1890ff",
                                                                    maxWidth: "400px"

                                                                }}
                                                            >
                                                                {item.name}
                                                            </span>
                                                        </Tooltip>
                                                        <Copy
                                                            title="复制链接" placement="bottom"
                                                            style={{ paddingLeft: 0, paddingRight: 0 }} size='small'
                                                            type="link"
                                                            text={item.url}
                                                        />
                                                    </span>
                                                    <Tag bordered={false} color="red">
                                                        风险指数: {item.score}
                                                    </Tag>
                                                    <Tag bordered={false}>类型: {item.type}</Tag>
                                                    {
                                                        item.created_time && item.created_time != "" && <Tag bordered={false}>创建时间: {item.created_time}</Tag>
                                                    }
                                                    {
                                                        item.owner.login != "" && <Tag bordered={false}>作者: {item.owner.login}</Tag>
                                                    }
                                                    {
                                                        item.file_extension != "" && <Tag bordered={false}>FileExt: {item.file_extension}</Tag>
                                                    }
                                                    {
                                                        item.source != "" && <Tag bordered={false}>来源: {item.source}</Tag>
                                                    }
                                                    <Tag bordered={false}>收录时间: {item.timestamp}</Tag>
                                                    {
                                                        item.related_company && item.related_company?.length > 0 && <Tag bordered={false} color="red">关联企业: {item.related_company.join("、")}</Tag>
                                                    }
                                                    {
                                                        ops?.length > 0 && (
                                                            <>
                                                                {
                                                                    ops.map((option, index) => (
                                                                        <div
                                                                            key={index}
                                                                        >
                                                                            <Popover
                                                                                title={<>
                                                                                    {option.label}
                                                                                    <Copy size='small' type='link' title={'复制'} placement={'right'}
                                                                                        text={option.content.map(item => item.value).join("\n")}>
                                                                                    </Copy>
                                                                                </>}
                                                                                destroyTooltipOnHide//优化渲染性能，不然切回来的时候会卡
                                                                                content={
                                                                                    <div style={{ maxHeight: "200px", maxWidth: "200px", overflow: "auto" }}>
                                                                                        <AdList
                                                                                            dataSource={option.content}
                                                                                            split={false}
                                                                                            renderItem={(item: { key: number, value: string }) => (
                                                                                                <AdList.Item key={item.key} style={{ padding: 0, whiteSpace: "nowrap" }}>
                                                                                                    {item.value}
                                                                                                </AdList.Item>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                }
                                                                            >
                                                                                <Badge count={option.badgeCount} size="small" offset={[-10, 0]}>
                                                                                    <Tag bordered={false}>
                                                                                        {option.label}
                                                                                    </Tag>
                                                                                </Badge>
                                                                            </Popover>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </>
                                                        )
                                                    }
                                                </Space>
                                                {
                                                    item.tags?.length > 0 && (
                                                        <span>
                                                            <Tag bordered={false} color="cyan">标签</Tag>
                                                            {item.tags.map((i) => (
                                                                <Tag bordered={false}>{i}</Tag>
                                                            ))}
                                                        </span>
                                                    )
                                                }
                                            </Space>
                                            <Space direction="vertical" style={{
                                                width: "100%",
                                            }}>
                                                <span>
                                                    <Tag bordered={false} color="cyan">代码详情</Tag>
                                                    <Tag bordered={false}>代码长度: {item.code_detail.length}</Tag>
                                                    <Copy
                                                        title="复制代码" placement="bottom"
                                                        style={{ paddingLeft: 0, paddingRight: 0 }}
                                                        size='small'
                                                        type="link"
                                                        text={item.code_detail}
                                                    />
                                                    <CodeDisplay code={item.code_detail} />
                                                </span>
                                                <AdVirtualList
                                                    data={codeSlice}
                                                    height={100}
                                                    itemHeight={22}//不加会导致全部渲染
                                                    itemKey={(item) => item.index}
                                                // scrollWidth={1000}
                                                >
                                                    {
                                                        (item, index, props) =>
                                                            <ForwardMyItem line={item.line} index={index + 1} {...props}
                                                            />
                                                    }
                                                </AdVirtualList>
                                            </Space>
                                        </Space>
                                    </AdList.Item>

                                }}
                            />

                    }
                </div>

                <footer style={{ padding: "8px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                    <Pagination
                        // showSizeChanger
                        total={total}
                        pageSizeOptions={pageSizeOptions}
                        defaultPageSize={pageSizeOptions[0]}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total) => `${total} items`}
                        size="small"
                        onChange={(page, size) => handlePaginationChange(page, size)}
                    />
                    <ExportDataPanel isExporting={isExporting} maxPage={maxPage} total={total} size={currentPageSize} onOk={(page: number) => exportData(page)} />
                </footer>
            </Spin>
        </div>
    )
})

const DarknetTabContent = forwardRef((props, ref) => {
    interface PageDataType extends zone.DarknetItem{
        index:number
    }
    const pageSizeOptions: number[] = [40]
    const [inputCache, setInputCache] = useState<string>("")
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const pageIDMap=useRef<{ [key: number]: number }>({})
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentSize] = useState<number>(pageSizeOptions[0])
    const [maxPage, setMaxPage] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [isExporting, setIsExporting] = useState<boolean>(false)

    useImperativeHandle(ref, () => ({
        query: (input: string,pageSize:number)=>handleQuery(input,pageSize),
    }));

    const handleQuery =  (input: string,pageSize:number) => {
        const tmpInput = input.trim()
        if (tmpInput === "") {
            return
        }
        setInputCache(tmpInput)
        //查询条件不为空则需要置空前一个数据
        pageIDMap.current = {}
        setLoading(true)
        setTotal(0)
        setCurrentPage(1)
        setCurrentSize(pageSize)
        setMaxPage(0)

        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        QueryDwm(0,tmpInput,1,pageSize)
            .then(result=>{
                let index = 0
                setPageData(
                    result.result.items?.map((item) => {
                        const instance = new zone.DarknetItem(item)
                        const {convertValues} = instance
                        return { ...item, index: index,convertValues }
                    })
                )
                setTotal(result.result.total)
                setLoading(false)
                setMaxPage(result.maxPage)
                pageIDMap.current[1]=result.id
            })
            .catch(err=>{
                errorNotification("0.zone查询出错", err)
                setPageData([])
            })
            .finally(()=>{
                setLoading(false)
            })
    }

    const handlePaginationChange = async (newPage: number, newSize: number) => {
        setLoading(true)

        //page发生变换
        if (newPage != currentPage&& newSize==currentPageSize) {
            QueryDwm(pageIDMap.current[newPage] || 0, inputCache, newPage, currentPageSize)
                .then(
                    result => {
                        let index = (newPage - 1) * currentPageSize
                        setPageData(
                            result.result.items?.map((item) => {
                                const instance = new zone.DarknetItem(item)
                                const {convertValues} = instance
                                return { ...item, index: ++index,convertValues }
                            })
                        )
                        setCurrentPage(newPage)
                        pageIDMap.current[newPage] = result.id
                    }
                )
                .catch(
                    err => {
                        errorNotification("0.zone查询出错", err)
                    }
                )
                .finally(
                    () => {
                        setLoading(false)
                    }
                )
        }
        //size发生变换
        if (newSize != currentPageSize) {
            setCurrentPage(1)
            setCurrentSize(newSize)
            handleQuery(inputCache,newSize)
        }
    }

    const exportData = async (page: number) => {
        if (!pageIDMap.current[1]) {
            errorNotification("导出结果", QUERY_FIRST)
            return
        }
        // setIsExporting(true)
        // const error = await $zoneDarknetQueryExport(id, page)
        // if (error) {
        //     errorNotification("导出结果", error)
        //     return
        // }
        // const pollingTimer = setInterval(async () => {
        //     const result = await $zoneQueryExportStatus(id)
        //     console.log(result)
        //     if (result.error) {
        //         errorNotification("导出结果", result.message)
        //         clearInterval(pollingTimer)
        //         setIsExporting(false)
        //         return
        //     }
        //     if (result.filename) {
        //         dispatch(setHasNewLogItem(true))
        //         clearInterval(pollingTimer)
        //         setIsExporting(false)
        //         return
        //     }
        // }, 1000);
    }

    const LineNumber = ({ index, style }: { index: number, style?: React.CSSProperties }) => (
        <span style={{ position: 'sticky', top: 0, background: '#f0f0f0', flex: 'none', width: "40px", zIndex: 2, ...style, }}>
            {index}
        </span>
    );

    const getOp = (phone: string[], email: string[], telegram: string[], domain: string[], ip: string[], netdisk: string[]): RadioOption[] => {
        const op: RadioOption[] = []
        if (phone?.length > 0) {
            op.push({
                label: "涉及手机号码", value: "phone_list", badgeCount: phone.length,
                content: phone.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (email?.length > 0) {
            op.push({
                label: "涉及邮箱", value: "email_list", badgeCount: email.length,
                content: email.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (telegram?.length > 0) {
            op.push({
                label: "涉及TG", value: "telegram_list", badgeCount: telegram.length,
                content: telegram.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (domain?.length > 0) {
            op.push({
                label: "涉及域名", value: "domain_list", badgeCount: domain.length,
                content: domain.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (ip?.length > 0) {
            op.push({
                label: "涉及IP", value: "ip_list", badgeCount: ip.length,
                content: ip.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        if (netdisk?.length > 0) {
            op.push({
                label: "涉及网盘", value: "wangpan_list", badgeCount: netdisk.length,
                content: netdisk.map((item, index) => {
                    return { key: index, value: item }
                })
            })
        }
        return op
    }

    const MyItem: React.ForwardRefRenderFunction<HTMLDivElement, { line: string, index: number } & { style?: React.CSSProperties }> = (props, ref) => {
        const { style, index, line } = props;
        return (
            <span
                ref={ref}
                style={{
                    // lineHeight: '30px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    // position: 'relative',
                    alignItems: 'center',
                    borderInline: 0,
                    backgroundColor: "rgba(250, 250, 250,8)",
                    whiteSpace: 'nowrap',
                    ...style,
                }}
            >
                <LineNumber index={index} style={{ left: 0, }} />
                {line}
            </span>
        );
    };

    const ForwardMyItem = React.forwardRef(MyItem);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Spin
                spinning={loading}>
                <div style={{
                    maxHeight: 'calc(100vh - 195px)',
                    //height:tableHeight,//Todo 
                    overflow: "auto"
                }}>
                    {
                        pageData.length == 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
                            <AdList
                                split={false}
                                dataSource={pageData}
                                renderItem={(item, index) => {
                                    const ops = getOp(
                                        item.detail_parsing.phone_list,
                                        item.detail_parsing.email_list,
                                        item.detail_parsing.telegram_list,
                                        item.detail_parsing.domain_list,
                                        item.detail_parsing.ip_list,
                                        item.detail_parsing.wangpan_list
                                    );
                                    const location: string[] = []
                                    for (const key in item.regions) {
                                        if (Object.prototype.hasOwnProperty.call(item.regions, key)) {
                                            const region = item.regions[key];
                                            const tmp: string[] = []
                                            if (region.country && region.country != "") {
                                                tmp.push(region.country)
                                            }
                                            if (region.province && region.province != "") {
                                                tmp.push(region.province)
                                            }
                                            if (region.city && region.city != "") {
                                                tmp.push(region.city)
                                            }
                                            if (tmp.length > 0) {
                                                location.push(tmp.join(""))
                                            }
                                        }
                                    }
                                    return <AdList.Item style={{ padding: "5px 0px 5px 0px" }}>
                                        <Space direction='vertical'
                                            style={{ width: "100%", border: "1px solid #f0f0f0", borderRadius: "4px", padding: "5px", }}
                                        >
                                            <Space direction='vertical' style={{ width: "100%" }} >
                                                <Space wrap style={{ width: "100%" }}>
                                                    <Tag bordered={false} color="cyan">序号:{(currentPage - 1) * currentPageSize + index + 1}</Tag>
                                                    <Tooltip title={item.title} placement="bottom" destroyTooltipOnHide overlayStyle={{ maxWidth: '1000px' }}>
                                                        <span
                                                            style={{
                                                                display: "block",
                                                                whiteSpace: "nowrap",/* 防止文本换行 */
                                                                overflow: "hidden", /* 隐藏超出容器宽度的内容 */
                                                                textOverflow: "ellipsis", /* 显示省略号 */
                                                                color: "#1890ff",
                                                                maxWidth: "400px"

                                                            }}
                                                        >
                                                            {item.title}
                                                        </span>
                                                    </Tooltip>
                                                    <Copy
                                                        title="复制链接" placement="bottom"
                                                        style={{ paddingLeft: 0, paddingRight: 0 }} size='small'
                                                        type="link"
                                                        text={item.url}
                                                    />

                                                    {item.msg?.title_cn && <Tag bordered={false} color='red'>{item.msg.title_cn}</Tag>}
                                                    <Tag bordered={false} color="red">
                                                        热度: {item.hot}
                                                    </Tag>
                                                    {item.industry && item.industry.length > 0 && <Tag bordered={false}>行业: {item.industry.join(" ")}</Tag>}
                                                    {location.length > 0 && <Tag bordered={false}>地区: {location.join(" ")}</Tag>}
                                                    {item.language && item.language.length > 0 && <Tag bordered={false}>语言: {item.language.join(" ")}</Tag>}
                                                    {item.msg.author && item.msg.author != "" && <Tag bordered={false}>作者: {item.msg.author}</Tag>}
                                                    <Tag bordered={false}>类型: {item.event.join(" ")}</Tag>
                                                    {item.msg?.price && <Tag bordered={false}>售价: {item.msg.price}</Tag>}
                                                    {item.msg.num_sales != undefined && <Tag bordered={false}>已售: {item.msg.num_sales}</Tag>}
                                                </Space>
                                                {
                                                    (item.tags?.length > 0 || ops?.length > 0) && (
                                                        <span>
                                                            <Tag bordered={false} color="cyan">标签</Tag>
                                                            {item.tags.map((i) => (
                                                                <Tag bordered={false}>{i}</Tag>
                                                            ))}
                                                            {ops?.length > 0 && (
                                                                <>
                                                                    {ops.map((option, index) => (
                                                                        <Popover
                                                                            title={<>
                                                                                {option.label}
                                                                                <Copy size='small' type='link' title={'复制'} placement={'right'}
                                                                                    text={option.content.map(item => item.value).join("\n")}>
                                                                                </Copy>
                                                                            </>}
                                                                            destroyTooltipOnHide //优化渲染性能，不然切回来的时候会卡
                                                                            content={<div style={{ maxHeight: "200px", maxWidth: "200px", overflow: "auto" }}>
                                                                                <AdList
                                                                                    dataSource={option.content}
                                                                                    split={false}
                                                                                    renderItem={(item: { key: number; value: string; }) => (
                                                                                        <AdList.Item key={item.key} style={{ padding: 0, whiteSpace: "nowrap" }}>
                                                                                            {item.value}
                                                                                        </AdList.Item>
                                                                                    )} />
                                                                            </div>}
                                                                        >
                                                                            <Badge count={option.badgeCount} size="small" offset={[-10, 0]}>
                                                                                <Tag bordered={false}>
                                                                                    {option.label}
                                                                                </Tag>
                                                                            </Badge>
                                                                        </Popover>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </span>
                                                    )
                                                }
                                                <span>
                                                    <Tag bordered={false} color="cyan">来源: </Tag>
                                                    <Tag bordered={false}>{item.source}</Tag>
                                                    <Tag bordered={false} color='orange'>发布时间: {item.msg.release_time}
                                                    </Tag>
                                                    <Tag bordered={false} color='orange'>收录时间: {item.update_time}</Tag>
                                                </span>
                                                {
                                                    item.msg?.description &&
                                                    <span><Tag bordered={false} color="cyan">简评: </Tag><span>{item.msg.description}</span></span>
                                                }

                                            </Space>
                                        </Space>
                                    </AdList.Item>

                                }}
                            />

                    }
                </div>

                <footer style={{ padding: "8px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa", borderRadius: "0 0 8px 8px" }}>
                    <Pagination
                        // showSizeChanger
                        total={total}
                        pageSizeOptions={pageSizeOptions}
                        defaultPageSize={pageSizeOptions[0]}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total) => `${total} items`}
                        size="small"
                        onChange={(page, size) => handlePaginationChange(page, size)}
                    />
                    <Button type='text' size='small'>没有购买DWN服务获取到的是样例数据，且暂不支持详细信息</Button>
                    {/* <ExportDataPanel isExporting={isExporting} maxPage={maxPage} total={total} size={currentSize} onOk={(page: number) => exportData(page)} /> */}
                </footer>
            </Spin>
        </div>
    )
})

const AimTabContent = forwardRef((props, ref) => {
    return <NotFound />
})

interface ExampleHelpDataType {
    index: number;
    field: string;
    description: ReactNode;
}

const exampleHelpColumns1: ColumnsType<ExampleHelpDataType> = [
    { title: '序号', dataIndex: "index", width: 50 },
    { title: '连接符', dataIndex: "field", width: 100 },
    { title: '说明（不能包含空格，点击可搜索）', dataIndex: "description" },
];

const exampleHelpDataTabs: TabsProps['items'] = [
    {
        key: "1", label: "操作符列表", children: <Table scroll={{ y: 450 }} size='small' pagination={false} columns={exampleHelpColumns1}
            dataSource={[
                {
                    index: 1, field: "&&", description: "且，满足A并且满足B，如：company==保险&&email===163.com"
                },
                {
                    index: 2, field: "||", description: "或，满足A或者满足B，如：company==电力建设有限公司||company==能源有限公司"
                },
                {
                    index: 3, field: "()", description: "条件分组，条件可以使用括号括起来确定优先级，如：(company==学院||company==学校)&&(name==李)"
                },
                {
                    index: 4, field: "=", description: "完全相等，如：company=北京零零信安科技有限公司"
                },
                {
                    index: 5, field: "==", description: "包含，包含某单词或词语，如：company==microsofttitle==健康码"
                },
                {
                    index: 6, field: "===", description: "逐字符匹配，内容不是完整的单词或词语，可以尝试该匹配符，如：email===edu.com.cn"
                },
                {
                    index: 7, field: "=^", description: "开始为，如：email=^noreply"
                },
                {
                    index: 8, field: "=$", description: "结尾为，如：email=$sina.com.cn"
                },
                {
                    index: 9, field: "=!", description: "不等于，如：company==通信集团&&email=!edu.com.cn"
                },
                {
                    index: 10, field: "==!", description: "不包含，如：company==信息||title==!湖南"
                },
                {
                    index: 11, field: "=!^", description: "开始不为，如：title==科技&&title=!^灰科技"
                },
                {
                    index: 12, field: "=!$", description: "结尾不为，如：title==科技&&title=!$科技处"
                },
            ]}
        />

    },
    {
        key: "2", label: "信息系统", children: <Table scroll={{ y: 450 }} size='small' pagination={false} columns={exampleHelpColumns1}
            dataSource={[
                {
                    index: 1, field: "title", description: `从信息系统中搜索「网页标题」情报 "如：xxx标题" 的数据，如：title==情报`
                },
                {
                    index: 2, field: "company", description: `从信息系统中搜索「所属公司」包含 "如：xxx网络科技" 的数据，如：group==网络科技`
                },
                {
                    index: 3, field: "html_banner", description: `从信息系统中搜索「HTML原文」包含 "如：零零信安" 的数据，如：html_banner==零零信安`
                },
                {
                    index: 4, field: "ip", description: `从信息系统中搜索「IP或IP段」等于 "如：10.0.0.1、10.0.0.1/24、10.0.0.1-10.0.0.34" 的数据，如：ip=39.98.171.0-39.98.171.254`
                },
                {
                    index: 5, field: "url", description: `从信息系统中搜索「URL」包含 "如：00sec.com" 的数据，如：url==00sec.com`
                },
                {
                    index: 6, field: "banner", description: `从信息系统中搜索「端口返回信息」包含 "如：零零信安" 的数据，如：banner==零零信安`
                },
                {
                    index: 7, field: "tags", description: `从信息系统中搜索「标签」包含 "如：登录" 的数据，如：tags==登录`
                },
                {
                    index: 8, field: "port", description: `从信息系统中搜索「端口」等于 "如：80" 的数据，如：port=443`
                },
                {
                    index: 9, field: "component", description: `从信息系统中搜索「组件」包含 "如：nginx" 的数据，如：component==nginx`
                },
                {
                    index: 10, field: "service", description: `从信息系统中搜索「服务」包含 "如：http" 的数据，如：service==http`
                },
                {
                    index: 11, field: "os", description: `从信息系统中搜索「操作系统」包含 "如：Linux" 的数据，如：os==windows`
                },
                {
                    index: 12, field: "extra_info", description: `从信息系统中搜索「设备分类」包含 "如：负载均衡" 的数据，如：extra_info==负载均衡`
                },
                {
                    index: 13, field: "app_name", description: `从信息系统中搜索「APP名称」包含 "如：零零信安" 的数据，如：app_name==零零信安`
                },
                {
                    index: 14, field: "status_code", description: `从信息系统中搜索「状态码」等于 "如：200" 的数据，如：status_code=200`
                },
                {
                    index: 15, field: "operator", description: `从信息系统中搜索「运营商」包含 "如：电信" 的数据，如：operator==电信`
                },
                {
                    index: 16, field: "device_type", description: `从信息系统中搜索「设备」包含 "如：load balancer" 的数据，如：device_type==balancer`
                },
                {
                    index: 17, field: "versions", description: `从信息系统中搜索「版本」包含 "如：1.0" 的数据，如：1.0`
                },
                {
                    index: 18, field: "cms", description: `从信息系统中搜索「CMS」包含 "如：WordPress" 的数据，如：cms==WordPress`
                },
                {
                    index: 19, field: "cdn", description: `从信息系统中搜索「CDN」等于 "如：0" 的数据，如：cdn=1`
                },
                {
                    index: 20, field: "put_record", description: `从信息系统中搜索「备案号」包含 "如：备xxx" 的数据，如：put_record==2022`
                },
                {
                    index: 21, field: "lang", description: `从信息系统中搜索「开发语言」包含 "如：java" 的数据，如：lang==java`
                },
                {
                    index: 22, field: "explore_timestamp", description: `从信息系统中搜索「录入时间」包含 "week代表查看最近7天" 的数据，如：explore_timestamp==week`
                }, {
                    index: 23, field: "timestamp", description: `从信息系统中搜索「更新时间」 "week=7天内更新,month=1个月内更新 ,six_month=6个月内更新,min_six_month=6个月前更新 " 的数据，如：`
                },
                {
                    index: 24, field: "country", description: `从信息系统中搜索「国家」包含 "如：美国" 的数据，如：country==美国`
                },
                {
                    index: 25, field: "province", description: `从信息系统中搜索「省」包含 "如：四川" 的数据，如：province==四川`
                },
                {
                    index: 26, field: "city", description: `从信息系统中搜索「市」包含 "如：北京" 的数据，如：city==北京`
                },
                {
                    index: 27, field: "ssl_info.detail", description: `从信息系统中搜索「SSL证书详情」 "如：零零信安" 的数据，如：`
                },
                {
                    index: 28, field: "asset_type", description: `从信息系统中搜索「资产类型」包含 "如：其他设备:asset_type=ip,网站系统asset_type=operating" 的数据，如：`
                },
                {
                    index: 29, field: "ssl_info.issuer_cn", description: `从信息系统中搜索「SSL书颁发者公共名」包含 "如：Amazon" 的数据，如：ssl_info.issuer_cn==Amazon`
                },
                {
                    index: 30, field: "ssl_info.issuer_org", description: `从信息系统中搜索「SSL证书颁发者机构名」包含 "如：Amazon" 的数据，如：ssl_info.issuer_org==Amazon`
                },
                {
                    index: 31, field: "ssl_info.subject_cn", description: `从信息系统中搜索「SSL证书公用名」包含 "如：management" 的数据，如：ssl_info.subject_cn==management`
                },
                {
                    index: 32, field: "ssl_info.subject_org", description: `从信息系统中搜索「SSL证书机构名」包含 "如：DataDomain" 的数据，如：ssl_info.subject_org==DataDomain`
                },


            ]}
        />
    },
    {
        key: "3", label: "移动端应用", children: <Table scroll={{ y: 450 }} size='small' pagination={false} columns={exampleHelpColumns1}
            dataSource={[
                {
                    index: 1, field: "title", description: `从移动端应用中搜索「应用名称」包含 "如：万能" 的数据，如：title==万能`
                },
                {
                    index: 2, field: "description", description: `从移动端应用中搜索「应用描述」包含 "如：去水印" 的数据，如：description==去水印`
                },
                {
                    index: 3, field: "group", description: `从移动端应用中搜索「集团公司」包含 "如：xxx网络科技" 的数据，如：group==网络科技`
                },
                {
                    index: 4, field: "company", description: `从移动端应用中搜索「所属公司」包含 "如：xxx网络科技" 的数据，如：company==网络科技`
                },
                {
                    index: 5, field: "type", description: `从移动端应用中搜索「应用类型」等于 "如：微信小程序、微信公众号" 的数据，如：type=微信小程序`
                },
                {
                    index: 6, field: "source", description: `从移动端应用中搜索「来源」等于 "如：wx.qq.com" 的数据，如：source=wx.qq.com`
                },

            ]}
        />
    },
    {
        key: "4", label: "域名", children: <Table scroll={{ y: 450 }} size='small' pagination={false} columns={exampleHelpColumns1}
            dataSource={[
                {
                    index: 1, field: "company", description: `从域名中搜索「所属公司」包含 "如：xxx网络科技" 的数据，如：company==网络科技`
                },
                {
                    index: 2, field: "domain", description: `从域名中搜索「根域名」逐字匹配 "如：00sec.com" 的数据，如：domain===00sec.com`
                },
                {
                    index: 3, field: "url", description: `从域名中搜索「子域名」逐字匹配 "如：00sec.com" 的数据，如：url===00sec.com`
                },
                {
                    index: 4, field: "icp", description: `从域名中搜索「备案号」逐字匹配 "如：备2022" 的数据，如：icp===备2022`
                },
                {
                    index: 5, field: "toplv_domain", description: `从域名中搜索「域名后缀」包含 "如 com、cn、net、org等" 的数据，如：toplv_domain==org`
                },
                {
                    index: 6, field: "title", description: `从域名中搜索「网页标题」包含 "如：数据" 的数据，如：title==数据`
                },
                {
                    index: 7, field: "level", description: `从域名中搜索「域名级别」等于 "如：子域名" 的数据，如：level=子域名`
                },

            ]}
        />
    },
    {
        key: "5", label: "邮箱", children: <Table scroll={{ y: 450 }} size='small' pagination={false} columns={exampleHelpColumns1}
            dataSource={[
                {
                    index: 1, field: "email_domain", description: `从邮箱中搜索「邮箱域名」逐字匹配 "如：126.com" 的数据，如：email_domain===126.com`
                },
                {
                    index: 2, field: "email_type", description: `从邮箱中搜索「邮箱类型」等于 "如：企业邮箱" 的数据，如：企业邮箱`
                },
                {
                    index: 3, field: "email", description: `从邮箱中搜索「邮箱地址」逐字匹配 "如：@126.com" 的数据，如：email===@126.com`
                },
                {
                    index: 4, field: "group", description: `从邮箱中搜索「集团公司」包含 "如：xxx网络科技" 的数据，如：group==网络科技`
                },
                {
                    index: 5, field: "company", description: `从邮箱中搜索「所属公司」包含 "如：xxx网络科技" 的数据，如：company==网络科技`
                },
                {
                    index: 6, field: "leakage_num", description: `从邮箱中搜索「泄露次数」等于 "如：4" 的数据，如：leakage_num=4`
                },
                {
                    index: 7, field: "source", description: `从邮箱中搜索「来源」等于 "如：0.zone" 的数据，如：source=0.zone`
                },
                {
                    index: 8, field: "msg.tags", description: `从邮箱中搜索「标签」包含 "如：科技有限公司" 的数据，如：msg.tags==科技有限公司`
                },
            ]}
        />
    },
    {
        key: "6", label: "代码/文档", children: <Table scroll={{ y: 450 }} size='small' pagination={false} columns={exampleHelpColumns1}
            dataSource={[
                { index: 1, field: "related_company", description: `从代码/文档中搜索「关联公司」包含"如：xxx网络科技"的数据，如：related_company==网络科技` },
                { index: 2, field: "suffix", description: `从代码/文档中搜索「文件后缀」等于"如：js、java、html"的数据，如：suffix=html` },
                { index: 3, field: "code_detail", description: `从代码/文档中搜索「代码/文档原文」包含"如：password"的数据，如：code_detail==password` },
                { index: 4, field: "repository.description", description: `从代码/文档中搜索「仓库描述」包含"如:爬虫"的数据，如：repository.description==爬虫` },
                { index: 5, field: "source", description: `从代码/文档中搜索「来源」等于"如：csdn.net"的数据，如：source=csdn.net` },
                { index: 6, field: "tags", description: `从代码/文档中搜索「标签」包含"如：密码"的数据，如：tags==密码` },
                { index: 7, field: "url", description: `从代码/文档中搜索「代码URL」包含"如：metinfo"的数据，如：url==metinfo` },
                { index: 8, field: "type", description: `从代码/文档中搜索「类型」等于"如：代码、文档"的数据，如：type=文档` },
                { index: 9, field: "keyword", description: `从代码/文档中搜索「关键词」包含"如：文档中的域名、手机号、密码等"的数据，如：keyword==手机号` },
                { index: 10, field: "detail_parsing.domain_list", description: `从代码/文档中搜索「涉及域名」包含"如：gmail.com"的数据，如：detail_parsing.domain_list==gmail.com` },
                { index: 11, field: "detail_parsing.ip_list", description: `从代码/文档中搜索「涉及IP」包含"如：39.98"的数据，如：detail_parsing.ip_list==39.98` },
                { index: 12, field: "detail_parsing.email_list", description: `从代码/文档中搜索「涉及邮箱」包含"如：163.com"的数据，如：detail_parsing.email_list==163.com` },
                { index: 13, field: "detail_parsing.telegram_list", description: `从代码/文档中搜索「涉及telegram账号」包含"如：data"的数据，如：detail_parsing.telegram_list==data` },
            ]}
        />
    },
    {
        key: "7", label: "人员", children: <Table scroll={{ y: 450 }} size='small' pagination={false} columns={exampleHelpColumns1}
            dataSource={[
                { index: 1, field: "company", description: `从人员中搜索「所属公司」包含"如：xxx网络科技"的数据，如：company==网络科技` },
                { index: 2, field: "name", description: `从人员中搜索「姓名」逐字匹配"如：小冰"的数据，如：name===小冰` },
                { index: 3, field: "position", description: `从人员中搜索「职位」包含"如：法人"的数据，如：position==法人` },
                { index: 4, field: "msg.introduction", description: `从人员中搜索「公司简介」"如：xxx电子工程"的数据，如：msg.introduction==电子工程` },
                { index: 5, field: "source", description: `从人员中搜索「来源」"如：tianyancha.com"的数据，如：source=tianyancha.com` },

            ]}
        />
    },
    {
        key: "8", label: "企业DWM情报", children: <Table scroll={{ y: 450 }} size='small' pagination={false} columns={exampleHelpColumns1}
            dataSource={[
                { index: 1, field: "event", description: `从企业DWM情报中搜索「事件」包含"如：隐私"的数据，如：event==隐私` },
                { index: 2, field: "industry", description: `从企业DWM情报中搜索「行业」包含"如：金融"的数据，如：industry==金融` },
                { index: 3, field: "language", description: `从企业DWM情报中搜索「语言」包含"如：俄语"的数据，如：language==俄语` },
                { index: 4, field: "org", description: `从企业DWM情报中搜索「组织」包含"如：建设"的数据，如：org==建设` },
                { index: 5, field: "regions.country", description: `从企业DWM情报中搜索「国家」包含"如：美国"的数据，如：regions.country==美国` },
                { index: 6, field: "regions.province", description: `从企业DWM情报中搜索「省」包含"如：四川"的数据，如：regions.province==四川` },
                { index: 7, field: "regions.city", description: `从企业DWM情报中搜索「市」包含"成都"的数据，如：regions.city==成都` },
                { index: 8, field: "tags", description: `从企业DWM情报中搜索「标签」包含"如：黑客"的数据，如：tags==黑客` },
                { index: 9, field: "title", description: `从企业DWM情报中搜索「网页标题」包含"如：hacker"的数据，如：title==hacker` },
                { index: 10, field: "page_type", description: `从企业DWM情报中搜索「页面属性」包含"如：详情"的数据，如：page_type==详情` },
                { index: 11, field: "body", description: `从企业DWM情报中搜索「网页内容」包含"如：hacker"的数据，如：body==hacker` },
                { index: 12, field: "description", description: `从企业DWM情报中搜索「描述」包含"如：hacker"的数据，如：description==hacker` },
                { index: 13, field: "source", description: `从企业DWM情报中搜索「子域名」逐字匹配"如：hacker"的数据，如：source===hacker` },
                { index: 14, field: "root_domain", description: `从企业DWM情报中搜索「根域」逐字匹配"如：hacker"的数据，如：root_domain===hacker` },
                { index: 15, field: "msg.author", description: `从企业DWM情报中搜索「作者」逐字匹配"如：Anon"的数据，如：msg.author===Anon` },
                { index: 16, field: "detail_parsing.telegram_list", description: `从企业DWM情报中搜索「涉及telegram账号」包含"如：123"的数据，如：detail_parsing.telegram_list==123` },
                { index: 17, field: "detail_parsing.email_list", description: `从企业DWM情报中搜索「涉及邮箱」包含"如：gmail"的数据，如：detail_parsing.email_list==gmail` },
                { index: 18, field: "hot", description: `从企业DWM情报中搜索「数据价值」等于"如：1"的数据，如：hot=1` },
                { index: 19, field: "toplv_domain", description: `从企业DWM情报中搜索「顶级域名」等于"如：net"的数据，如：toplv_domain=net` },
            ]}
        />
    },
    {
        key: "9", label: "企业AIM情报", children: <Table scroll={{ y: 450 }} size='small' pagination={false} columns={exampleHelpColumns1}
            dataSource={[
                { index: 1, field: "chat_name", description: `从企业AIM情报中搜索「群名」包含"如：交易"的数据，如：chat_name==交易` },
                { index: 2, field: "message_time", description: `从企业AIM情报中搜索「时间」包含"如：2023-06-12"的数据，如：message_time==2023-06-12` },
                { index: 3, field: "sender_first_name", description: `从企业AIM情报中搜索「用户名称」包含"如：达摩"的数据，如：sender_first_name==达摩` },
                { index: 4, field: "content_text", description: `从企业AIM情报中搜索「内容」包含"如：今年"的数据，如：content_text==今年` },
                { index: 5, field: "event", description: `从企业AIM情报中搜索「事件」包含"如：隐私"的数据，如：event==隐私` },
                { index: 6, field: "industry", description: `从企业AIM情报中搜索「行业」包含"如：保险"的数据，如：industry==保险` },
                { index: 7, field: "org", description: `从企业AIM情报中搜索「涉及组织」包含"如：农业"的数据，如：org==农业` },
                { index: 8, field: "sender_phone", description: `从企业AIM情报中搜索「手机」逐字匹配"如：1231"的数据，如：sender_phone===1231` },
                { index: 9, field: "regions", description: `从企业AIM情报中搜索「涉及地区」包含"如：中国"的数据，如：regions==中国` },
                { index: 10, field: "sender_id", description: `从企业AIM情报中搜索「用户ID」逐字匹配"如：4012"的数据，如：sender_id===4012` },
                { index: 11, field: "sender_username", description: `从企业AIM情报中搜索「用户名称」逐字匹配"如：So"的数据，如：sender_username===So` },
                { index: 12, field: "file_extension", description: `从企业AIM情报中搜索「附件后缀名」等于"如：xlsx"的数据，如：file_extension=xlsx` },
                { index: 13, field: "hot", description: `从企业AIM情报中搜索「数据价值」等于"如：1"的数据，如：hot=1` },
            ]}
        />
    },

]

const Help: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false)
    return <>
        <Tooltip title='帮助信息' placement='bottom'>
            <Button type='text' size="small" icon={<QuestionOutlined />} onClick={() => setOpen(true)} />
        </Tooltip>
        <Modal
            style={{ top: "10%" }}
            width={850}
            mask={false}
            maskClosable={true}
            title="帮助信息"
            open={open}
            footer={null}
            onCancel={() => setOpen(false)}
            destroyOnClose={true}
            bodyStyle={{ height: window.innerHeight - 200, overflowY: "scroll" }}
        >

            <Space direction="vertical">
                <Tabs items={exampleHelpDataTabs} size='small' />
            </Space>

        </Modal></>
}


export default Zone;