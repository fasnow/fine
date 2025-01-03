import {
    CloudDownloadOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { Button, Flex, Pagination, Select } from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { QUERY_FIRST } from "@/component/type";
import { errorNotification } from '@/component/Notification';
import { useSelector } from 'react-redux';
import { copy } from '@/util/util';
import { BrowserOpenURL } from "../../wailsjs/runtime";

import { Export, Query } from "../../wailsjs/go/icp/Bridge";
import { WithIndex } from "@/component/Interface";
import { icp } from "../../wailsjs/go/models";
import { RootState } from "@/store/store";
import TabsV2 from "@/component/TabsV2";
import Candidate, { ItemType } from "@/component/Candidate";
import { FindByPartialKey } from "../../wailsjs/go/history/Bridge";
import { AgGridReact } from "ag-grid-react";
import NotFound from "@/component/Notfound";
import Loading from "@/component/Loading";
import { ColDef, GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";

type PageDataType = WithIndex<icp.Item>

const TabContent: React.FC = () => {
    const [pageSizeOptions] = useState([40, 80, 100])
    const [inputCache, setInputCache] = useState<string>("")
    const [total, setTotal] = useState<number>(0)
    const [currentPageNum, setCurrentPageNum] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const [loading, setLoading] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [disable, setDisable] = useState<boolean>(false)
    const [serviceType, setServiceType] = useState<string>("1")
    const [serviceTypeCache, setServiceTypeCache] = useState<string>(serviceType)
    const pageIDMap = useRef<{ [key: number]: number }>({})
    const [pageData, setPageData] = useState<PageDataType[]>([])
    const allowEnterPress = useSelector((state: RootState) => state.app.global.config?.QueryOnEnter.icp)
    const history = useSelector((state: RootState) => state.app.global.history)
    const [columnDefs] = useState<ColDef[]>([
        { headerName: '序号', field: "index", width: 80, pinned: 'left' },
        { headerName: '名称', field: "unitName", width: 250, pinned: 'left' },
        { headerName: '备案内容', field: "serviceName", width: 200 },
        { headerName: '备案号', field: "serviceLicence", width: 200 },
        { headerName: '备案法人', field: "leaderName", width: 150 },
        { headerName: '单位性质', field: "natureName", width: 100 },
        { headerName: '审核日期', field: "updateRecordTime", width: 200, },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            // allow every column to be aggregated
            enableValue: true,
            // allow every column to be grouped
            enableRowGroup: true,
            // allow every column to be pivoted
            enablePivot: true,
            filter: true,
            suppressHeaderMenuButton: true,
            suppressHeaderFilterButton: true,
        }
    }, [])

    const getContextMenuItems = useCallback(
        (
            params: GetContextMenuItemsParams,
        ): (MenuItemDef)[] => {
            return [
                {
                    name: "浏览器打开URL",
                    disabled: serviceType !== "1",
                    action: () => {
                        BrowserOpenURL("http://" + params.node?.data?.serviceName)
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
                        for (let i = 0; i < pageData.length; i++) {
                            if (pageData[i].index === params.node?.data.index) {
                                copy(pageData[i])
                                break
                            }
                        }
                    },
                },
                {
                    name: "复制该列",
                    action: () => {
                        const colValues = pageData.map((item: PageDataType) => {
                            const colId = params.column?.getColId()
                            for (const key in item) {
                                if (Object.prototype.hasOwnProperty.call(item, key) && key === colId) {
                                    return item[key as keyof PageDataType]
                                }
                            }
                            return ""
                        })
                        copy(colValues)
                    },
                },
            ];
        },
        [pageData, serviceType],
    );

    const preHandleQuery = async (v: string) => {
        if (v === "") {
            return
        }
        setInputCache(v)
        setServiceTypeCache(serviceType)
        handleNewQuery(0, v, currentPageSize)
    }

    const handleNewQuery = (taskID: number, unitName: string, pageSize: number) => {
        pageIDMap.current = {}
        setCurrentPageNum(1)
        setTotal(0)
        setLoading(true)
        //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
        Query(taskID, unitName, 1, pageSize, serviceType).then(
            result => {
                let index = 0
                setTotal(result["total"])
                setPageData(result["items"]?.map((item: PageDataType) => {
                    index++
                    return { ...item, index: index }
                }))
                pageIDMap.current[1] = result["taskID"]
                setLoading(false)
            }
        ).catch(
            err => {
                errorNotification("ICP查询出错", err)
                setPageData([])
                setLoading(false)
            }
        )
    }

    const handlePaginationChange = (newPage: number, newSize: number) => {
        //page发生变换
        if (newPage !== currentPageNum && newSize === currentPageSize) {
            setLoading(true)
            let pageID = pageIDMap.current[newPage]
            Query(pageID ? pageID : 0, inputCache, newPage, newSize, serviceTypeCache).then(
                (result) => {
                    let index = (newPage - 1) * currentPageSize
                    setPageData(result["items"].map((item: icp.Item) => ({ index: ++index, ...item })))
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
            handleNewQuery(0, inputCache, newSize)
        }
    }

    const exportData = () => {
        if (pageIDMap.current[1] === 0) {
            errorNotification("导出结果", QUERY_FIRST)
            setIsExporting(false)
            return
        }
        setIsExporting(true)
        setDisable(true)
        Export(pageIDMap.current[1]).catch(
            err => {
                errorNotification("导出结果", err)
            }
        ).finally(
            () => {
                setDisable(false)
                setIsExporting(false)
            }
        )
    }

    const footer = (<Flex justify={"space-between"} align={'center'} style={{ padding: '5px' }}>
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
    </Flex>)

    return (<Flex vertical style={{ width: "100%", height: "100%" }}>
        <Flex vertical justify={'center'} align={"center"}>
            <Candidate
                size={"small"}
                style={{ width: 600 }}
                placeholder='Search...'
                allowClear
                onPressEnter={(v) => {
                    if (!allowEnterPress) return
                    preHandleQuery(v)
                }}
                onSearch={(v) => preHandleQuery(v)}
                items={[
                    {
                        fetch: async (v) => {
                            try {
                                // @ts-ignore
                                const response = await FindByPartialKey(history.icp, !v ? "" : v.toString());
                                const a: ItemType[] = response?.map(item => {
                                    const t: ItemType = {
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
                addonBefore={<Select
                    onChange={(value) => {
                        setServiceType(value)
                    }}
                    defaultValue="1"
                    options={[
                        { value: '1', label: '网站', },
                        { value: '6', label: 'APP', },
                        { value: '7', label: '小程序', },
                        { value: '8', label: '快应用', },
                    ]}
                    style={{ minWidth: 85 }}
                />}
            />
            ICP备案查询：请输入单位名称或域名或备案号查询，请勿使用子域名或者带http://www等字符的网址查询
        </Flex>
        <div style={{ width: "100%", height: "100%" }}>
            <AgGridReact
                loading={loading}
                embedFullWidthRows
                rowData={pageData}
                columnDefs={columnDefs}
                getContextMenuItems={getContextMenuItems}
                sideBar={false}
                headerHeight={32}
                rowHeight={32}
                defaultColDef={defaultColDef}
                noRowsOverlayComponent={() => <NotFound />}
                loadingOverlayComponent={() => <Loading />}
            />
        </div>
        {footer}
    </Flex>)
}

const Icp: React.FC = () => {
    return <TabsV2 defaultTabContent={<TabContent />} />
}

export default Icp