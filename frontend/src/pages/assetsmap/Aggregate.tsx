import { CloudDownloadOutlined, ExclamationCircleOutlined, ExclamationCircleTwoTone, LoadingOutlined, QuestionOutlined, SearchOutlined, SketchOutlined } from "@ant-design/icons"
import { Button, Col, Input, InputNumber, Pagination, Row, Select, Space, Spin, Tooltip } from "antd"
import { ColumnsType } from "antd/es/table"
import { ItemType } from "../../type/batchhttp"
import Table from "antd/lib/table"
import { CSSProperties, useRef, useState } from "react"
import { _exportLocalDataToExcel } from "../../electron/electronApi"
import PointBuy from "../../public/assets/image/point-buy.svg"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../store/store"
import { sleep } from "../../utils/utils"
import { allQueryStep1 } from "../../http/api"
import { server } from "../../config"
type CheckType = { total: number, size: number, page: number, maxPage: number, error: string, loading: boolean }

const defaultColumns: ColumnsType<ItemType> = [
    { title: '序号', dataIndex: "index", width: 60, ellipsis: true, fixed: true, },
    { title: '目标', dataIndex: "url", width: 300, ellipsis: true, },
    { title: '响应码', dataIndex: "status_code", ellipsis: true, width: 60, },
    { title: '标题', dataIndex: "title", width: 200, ellipsis: true, },
    { title: '长度', dataIndex: "length", width: 80, ellipsis: true, },
    { title: '重定向', dataIndex: "redirect", width: 300, ellipsis: true, },
    { title: '响应码', dataIndex: "re_status_code", width: 60, ellipsis: true, },
    { title: '标题', dataIndex: "re_title", width: 200, ellipsis: true, },
    { title: '长度', dataIndex: "re_length", width: 80, },
]

const InfoCssStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    color: "#f5222d"
}

const FofaPageSizeOptions = [
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 30, label: 30 },
    { value: 40, label: 40 },
    { value: 50, label: 50 },
    { value: 60, label: 60 },
    { value: 70, label: 70 },
    { value: 80, label: 80 },
    { value: 90, label: 90 },
    { value: 100, label: 100 },
    { value: 200, label: 200 },
    { value: 500, label: 500 },
]
const HunterPageSizeOptions = [
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 30, label: 30 },
    { value: 40, label: 40 },
    { value: 50, label: 50 },
    { value: 60, label: 60 },
    { value: 70, label: 70 },
    { value: 80, label: 80 },
    { value: 90, label: 90 },
    { value: 100, label: 100 },
]
const QuakePageSizeOptions = [
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 30, label: 30 },
    { value: 40, label: 40 },
    { value: 50, label: 50 },
    { value: 60, label: 60 },
    { value: 70, label: 70 },
    { value: 80, label: 80 },
    { value: 90, label: 90 },
    { value: 100, label: 100 },
]

const ZonePageSizeOptions = [
    { value: 40, label: 40 }
]


const Aggregate: React.FC = () => {
    const [tableHeight, setTableHeight] = useState<number>(400)
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [input, setInput] = useState<string>("")
    const [inputCache, setInputCache] = useState<string>("")

    const pageSizeOptions = [40, 60, 80, 100]
    const [fofa, setFofa] = useState<CheckType>({ loading: false, total: 100, page: 0, size: FofaPageSizeOptions[0].value, maxPage: 0, error: "" })
    const [hunter, setHunter] = useState<CheckType>({ loading: false, total: 0, page: 0, size: HunterPageSizeOptions[0].value, maxPage: 0, error: "" })
    const [quake, setQuake] = useState<CheckType>({ loading: false, total: 0, page: 0, size: QuakePageSizeOptions[0].value, maxPage: 0, error: "" })
    const [zone, setZone] = useState<CheckType>({ loading: false, total: 0, page: 0, size: ZonePageSizeOptions[0].value, maxPage: 0, error: "" })
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setPage] = useState<number>(1)
    const [currentSize, setSize] = useState<number>(pageSizeOptions[0])
    const [data, setData] = useState<(ItemType & { index: number })[]>([])
    const dispatch = useDispatch()
    const user = useSelector((state: RootState) => state.user)

    const getPageData = () => {
        return data.filter((item) => (item.index >= (currentPage - 1) * currentSize) && item.index <= (currentPage) * currentSize)
    }
    const handleResize = () => {
        setTableHeight(window.innerHeight - 30 - 40 - 42 - 24);
    }
    const currentPageOrSizeChange = (page: number, size: number): void => {
        if (page != currentPage) {
            setPage(page)
        }

        if (size != currentSize) {
            setPage(1)
            setSize(size)
        }

    }
    const exportData = async () => {
        setIsExporting(true)
        await _exportLocalDataToExcel("", "batchhttp.xlsx")
        setIsExporting(false)
    }

    const handleFofaPageSizeChange = (value: number, option: { value: number; label: number } | { value: number; label: number }[]): void => {
        const maxPage = Math.ceil(fofa.total / value)
        console.log(maxPage, value, fofa.total)
        setFofa((preData) => { return { ...fofa, size: value, maxPage: maxPage } })
    }
    const handleHunterPageSizeChange = (value: number, option: { value: number; label: number } | { value: number; label: number }[]): void => {
        const maxPage = Math.ceil(hunter.total / value)
        setHunter((preData) => { return { ...preData, size: value, maxPage: maxPage } })
    }
    const handleQuakePageSizeChange = (value: number, option: { value: number; label: number } | { value: number; label: number }[]): void => {
        const maxPage = Math.ceil(quake.total / value)
        setQuake((preData) => { return { ...preData, size: value, maxPage: maxPage } })
    }
    const handleZonePageSizeChange = (value: number, option: { value: number; label: number } | { value: number; label: number }[]): void => {
        const maxPage = Math.ceil(zone.total / value)
        setZone((preData) => { return { ...preData, size: value, maxPage: maxPage } })
    }

    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [isStopping, setIsStopping] = useState<boolean>(false)
    const step1SocketAvailable = useRef<boolean>(false)
    const step1SocketRef = useRef<WebSocket>()
    const step2SocketAvailable = useRef<boolean>(false)
    const step2SocketRef = useRef<WebSocket>()
    const queryStep1 = async () => {
        const tmpInput = input.trim()
        if (tmpInput == "") return
        setInputCache(tmpInput)
        setFofa({ total: 0, page: 0, size: fofa.size, maxPage: 0, error: "", loading: true, })
        setHunter({ total: 0, page: 0, size: fofa.size, maxPage: 0, error: "", loading: true, })
        setQuake({ total: 0, page: 0, size: fofa.size, maxPage: 0, error: "", loading: true, })
        setZone({ total: 0, page: 0, size: fofa.size, maxPage: 0, error: "", loading: true, })
        if (step2SocketRef.current) {
            step2SocketAvailable.current = false
            step2SocketRef.current.close()
        }

        if (step1SocketRef.current) {
            step1SocketAvailable.current = false
            step2SocketRef.current.close()
            step1Send(tmpInput)
        } else {
            step1Send(tmpInput)
        }



        await sleep(3000)

        setFofa(() => { return { ...fofa, loading: false } })
        setHunter(() => { return { ...hunter, loading: false } })
        setQuake(() => { return { ...quake, loading: false } })
        setZone(() => { return { ...zone, loading: false } })
    }

    const queryStep2 = () => {
        if ((fofa.page || fofa.page == 0) && (hunter.page || hunter.page == 0) && (zone.page || zone.page == 0) && (quake.page || quake.page == 0)) {
            return
        }
        const data = {
            fofa: { page: fofa.page, size: fofa.size },
            hunter: { page: hunter.page, size: hunter.size },
            "0.zone": { page: zone.page, size: zone.size },
            quake: { page: quake.page, size: quake.size },
        }

    }


    const step1WsReceiver = async (event: MessageEvent<any>) => {
        if (!step1SocketAvailable.current) {
          return
        }
        const data = JSON.parse(event.data)
        console.log(data)
        const code = data["code"]
        // if(code!=200){
        //   const error = data["error"]
        //   switch(code){
        //     case Code_FofaAuth_Error:
        //     case Code_FofaQuery_Error:
        //       fofaForm.loading = false
        //       fofaForm.error = error
        //       fofaForm.total = 0
        //       fofaForm.maxPage = 0
        //       fofaForm.pageSize = 0
        //       break
        //     case Code_HunterQuery_Error:
        //     case Code_HunterAuth_Error:
        //       hunterForm.loading = false
        //       hunterForm.error = error
        //       hunterForm.total = 0
        //       hunterForm.maxPage = 0
        //       hunterForm.pageSize = 0
        //       hunterTokens.value = 0
        //       break
        //     case Code_ZoneQuery_Error:
        //     case Code_ZoneAuth_Error:
        //       zoneForm.loading = false
        //       zoneForm.error = error
        //       zoneForm.total = 0
        //       zoneForm.maxPage = 0
        //       zoneForm.pageSize = 0
        //       break
        //     case Code_QuakeAuth_Error:
        //     case Code_QuakeQuery_Error:
        //       quakeForm.loading = false
        //       quakeForm.error = error
        //       quakeForm.total = 0
        //       quakeForm.maxPage = 0
        //       quakeForm.pageSize = 0
        //       quakeTokens.value = 0
        //       break
        //   }
        //   return
        // }
        // const name = data["data"]["name"]
        // switch (name) {
        //   case NAME_FOFA:
        //     fofaForm.loading = false
        //     fofaForm.error = ""
        //     fofaForm.total = data["data"]["total"]
        //     fofaForm.maxPage = data["data"]["maxPage"]
        //     fofaForm.pageSize = data["data"]["size"]
        //     break
        //   case NAME_HUNTER:
        //     hunterForm.loading = false
        //     hunterForm.error = ""
        //     hunterForm.total = data["data"]["total"]
        //     hunterForm.maxPage = data["data"]["maxPage"]
        //     hunterForm.pageSize = data["data"]["size"]
        //     hunterTokens.value = data["data"]["token"]
        //     break
        //   case NAME_ZONE:
        //     zoneForm.loading = false
        //     zoneForm.error = ""
        //     zoneForm.total = data["data"]["total"]
        //     zoneForm.maxPage = data["data"]["maxPage"]
        //     zoneForm.pageSize = data["data"]["size"]
        //     break
        //   case NAME_QUAKE:
        //     quakeForm.loading = false
        //     quakeForm.error = ""
        //     quakeForm.total = data["data"]["total"]
        //     quakeForm.maxPage = data["data"]["maxPage"]
        //     quakeForm.pageSize = data["data"]["size"]
        //     quakeTokens.value = data["data"]["token"]
        //     break
        // }
        // if (data["data"]["hasMore"]==false){
        //   uuid=data["data"]["uuid"]
        // }
      }

    //   const step2WsReceiver = async (event: MessageEvent<any>) => {
    //     if (!setp2SocketAvailable) {
    //       return
    //     }
    //     const data = JSON.parse(event.data)
    //     const code = data["code"] 
    //     if(code!=200){
    //       errorAlert(data["error"], 3)
    //       return
    //     }
    //     const msg = data["data"]["message"]
    //     if (msg != "") {
    //       log.value = msg
    //     }
    //     const tempData = data["data"]["data"]
    //     if (tempData != undefined && tempData != null) {
    //       total.value = total.value + tempData.length
    //       for (let i = 0; i < tempData.length; i++) {
    //         tableData.value.push(tempData[i])
    //       }
    //       handlePageNumChange(pageNum.value)
    //       updateTableHeight()
    //     }
    //   }

    //   const step2Send = (msg: any) => {
    //     step2Socket = new WebSocket(server.baseWS + allQueryStep2)
    //     step2Socket.addEventListener('message', step2WsReceiver)
    //     step2Socket.onopen = () => {
    //       setp2SocketAvailable = true;
    //       if (step2Socket != undefined) {
    //         step2Socket.send(msg)
    //       }
    //     };
    //     step2Socket.onclose = () => {
    //       //这个close当服务端主动关闭了连接也会触发
    //       setp2SocketAvailable = false;
    //       if(isStopping.value){
    //         log.value="已中止"
    //         isStopping.value = false
    //       }
    //       isProcessing.value = false
    //       step2Socket = undefined
    //     };
    //   }

      const step1Send = (msg: any) => {
        step1SocketRef.current = new WebSocket(server.baseWS + allQueryStep1)
        step1SocketRef.current.addEventListener('message', step1WsReceiver)
        // step1Socket.addEventListener('close', step1WsClosedOrError)
        // step1Socket.addEventListener('error', step1WsClosedOrError)
        step1SocketRef.current.onopen = () => {
            step1SocketAvailable.current = true;
          if (step1SocketRef.current) {
            step1SocketRef.current.send(msg)
          }
        };
        step1SocketRef.current.onclose = () => {
            step1SocketAvailable.current = false;
          step1SocketRef.current = undefined
        };
      }

    //   const callStep1 = async () => {
    //     colModel.value = "step2"
    //     updataHeaderHeight("step2")
    //     queryStatment.value = input.value.trim();
    //     if (queryStatment.value == "") return
    //     fofaForm.loading = false
    //     zoneForm.loading = false
    //     quakeForm.loading = false
    //     hunterForm.loading = false

    //     if (step2Socket != undefined) {
    //       setp2SocketAvailable = false
    //       step2Socket.close()
    //     }

    //     if (step1Socket != undefined) {
    //       setp1SocketAvailable = false
    //       step1Socket.close()
    //       step1Send(queryStatment.value)
    //     } else {
    //       step1Send(queryStatment.value)
    //     }
    //     // console.log(step1Socket)
    //     // if (!setp1SocketAvailable) {
    //     //   errorAlert("程序出错", 3)
    //     //   return
    //     // }
    //     setp1SocketAvailable = true;
    //     isStopping.value = false
    //     isProcessing.value = false
    //     log.value = ""
    //     hunterTokens.value = undefined
    //     quakeTokens.value = undefined
    //     pageNum.value = 1
    //     total.value = 0
    //     pageData.value = []
    //     tableData.value = []
    //     fofaForm.loading = true
    //     fofaForm.error = ""
    //     fofaForm.maxPage = 0
    //     fofaForm.total = 0
    //     fofaForm.exportMaxPage = undefined
    //     fofaForm.pageSize = 0
    //     hunterForm.loading = true
    //     hunterForm.error = ""
    //     hunterForm.maxPage = 0
    //     hunterForm.total = 0
    //     hunterForm.exportMaxPage = undefined
    //     hunterForm.pageSize = 0
    //     quakeForm.loading = true
    //     quakeForm.error = ""
    //     quakeForm.maxPage = 0
    //     quakeForm.total = 0
    //     quakeForm.exportMaxPage = undefined
    //     quakeForm.pageSize = 0
    //     zoneForm.loading = true
    //     zoneForm.error = ""
    //     zoneForm.maxPage = 0
    //     zoneForm.total = 0
    //     zoneForm.exportMaxPage = undefined
    //     zoneForm.pageSize = 0
    //   };

    //   const callStep2 = async () => {
    //     pageNum.value = 1
    //     total.value = 0
    //     pageData.value = []
    //     tableData.value = []
    //     isStopping.value = false
    //     isProcessing.value = true
    //     let data = {
    //       "uuid": uuid,
    //       "fofaMaxPage": 0,
    //       "hunterMaxPage": 0,
    //       "0.zoneMaxPage": 0,
    //       "quakeMaxPage": 0,
    //     }
    //     if (fofaForm.exportMaxPage != undefined) {
    //       let page = parseInt(fofaForm.exportMaxPage)
    //       data.fofaMaxPage = !isNaN(page) ? page : 0
    //     }
    //     if (quakeForm.exportMaxPage != undefined) {
    //       let page = parseInt(quakeForm.exportMaxPage)
    //       data.quakeMaxPage = !isNaN(page) ? page : 0
    //     }
    //     if (hunterForm.exportMaxPage != undefined) {
    //       let page = parseInt(hunterForm.exportMaxPage)
    //       data.hunterMaxPage = !isNaN(page) ? page : 0
    //     }
    //     if (zoneForm.exportMaxPage != undefined) {
    //       let page = parseInt(zoneForm.exportMaxPage)
    //       data["0.zoneMaxPage"] = !isNaN(page) ? page : 0
    //     }
    //     const payload = JSON.stringify(data)
    //     if (step2Socket != undefined) {
    //       setp2SocketAvailable = false;
    //       step2Socket.close()
    //       step2Send(payload)
    //     } else {
    //       step2Send(payload)
    //     }
    //   }
    return <div>
        <div style={{ display: "flex", justifyContent: "center" }}>

            <Input
                style={{ width: "600px" }}
                size="small"
                allowClear
                onPressEnter={queryStep1}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Search...'
            />
            <Button type='text' size="small" icon={<SearchOutlined />}
                onClick={queryStep1}
            />
            <Tooltip title='帮助信息' >
                <Button type='text' size="small" icon={<QuestionOutlined />} />
            </Tooltip>
        </div>
        <Spin
            spinning={false}
            indicator={<div style={{ width: "auto", backgroundColor: "rgba(255,255,255,0.5)", fontSize: "16px", height: "auto" }}>请先搜索</div>}
        >
            <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                <div style={{ marginTop: 5, marginBottom: 5, display: "grid", gap: 5, flex: 0.8 }} >
                    <Row>
                        <Col span={12}>
                            <Spin
                                spinning={fofa.loading}
                            >
                                <div style={{ gap: "5px", display: "flex" }}>

                                    <Space.Compact >
                                        <Tooltip title={`最大页数${fofa.maxPage}`} placement="bottom">

                                            <InputNumber
                                                min={0}
                                                max={fofa.maxPage}
                                                size="small"
                                                style={{ width: "240px" }}
                                                addonBefore={"Fofa"}
                                                addonAfter={
                                                    <div style={{ display: "flex", width: "auto" }}>
                                                        <span style={{ display: "flex", width: "55px" }}>页每页</span>
                                                        <Select
                                                            size="small"
                                                            defaultValue={fofa.size}
                                                            style={{ width: 60 }}
                                                            onChange={handleFofaPageSizeChange}
                                                            options={FofaPageSizeOptions}
                                                        />
                                                    </div>
                                                }
                                            />


                                        </Tooltip>
                                    </Space.Compact>

                                    <span style={InfoCssStyle}><img src={PointBuy} />{user.fofa.fofa_point}</span>
                                    <Tooltip title={fofa.error} placement="bottom">
                                        {
                                            fofa.error && fofa.error != "" && <ExclamationCircleTwoTone twoToneColor={"#ff4d4f"} />
                                        }
                                    </Tooltip>
                                </div>
                            </Spin>
                        </Col>
                        <Col span={12}>
                            <Spin
                                spinning={hunter.loading}
                            >
                                <div style={{ gap: "5px", display: "flex" }}>
                                    <Space.Compact>
                                        <Tooltip title={`最大页数${hunter.maxPage}`} placement="bottom">
                                            <InputNumber
                                                min={0}
                                                max={hunter.maxPage}
                                                size="small"
                                                style={{ width: "240px" }}
                                                addonBefore={"Hunter"}
                                                addonAfter={
                                                    <div style={{ display: "flex", width: "auto" }}>
                                                        <span style={{ display: "flex", width: "55px" }}>页每页</span>
                                                        <Select
                                                            size="small"
                                                            defaultValue={hunter.size}
                                                            style={{ width: 60 }}
                                                            onChange={handleHunterPageSizeChange}
                                                            options={HunterPageSizeOptions}
                                                        />
                                                    </div>
                                                }
                                            />

                                        </Tooltip>

                                    </Space.Compact>
                                    <span style={InfoCssStyle}><img src={PointBuy} />{user.hunter.restQuota}</span>
                                    <Tooltip title={hunter.error} placement="bottom">
                                        {
                                            hunter.error && hunter.error != "" && <ExclamationCircleTwoTone twoToneColor={"#ff4d4f"} />
                                        }
                                    </Tooltip>
                                </div>
                            </Spin>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Spin
                                spinning={quake.loading}
                            >
                                <div style={{ gap: "5px", display: "flex" }}>
                                    <Space.Compact>
                                        <Tooltip title={`最大页数${quake.maxPage}`} placement="bottom">
                                            <InputNumber
                                                min={0}
                                                max={quake.maxPage}
                                                size="small"
                                                style={{ width: "240px" }}
                                                addonBefore={"Quake"}
                                                addonAfter={
                                                    <div style={{ display: "flex", width: "auto" }}>
                                                        <span style={{ display: "flex", width: "55px" }}>页每页</span>
                                                        <Select
                                                            size="small"
                                                            defaultValue={quake.size}
                                                            style={{ width: 60 }}
                                                            onChange={handleQuakePageSizeChange}
                                                            options={QuakePageSizeOptions} />
                                                    </div>
                                                }
                                            />
                                        </Tooltip>
                                    </Space.Compact>
                                    <span style={InfoCssStyle}><img src={PointBuy} />{user.quake.credit + user.quake.constant_credit}</span>
                                    <Tooltip title={quake.error} placement="bottom">
                                        {
                                            quake.error && quake.error != "" && <ExclamationCircleTwoTone twoToneColor={"#ff4d4f"} />
                                        }
                                    </Tooltip>
                                </div>
                            </Spin>
                        </Col>
                        <Col span={12}>
                            <Spin
                                spinning={zone.loading}
                            >
                                <div style={{ gap: "5px", display: "flex" }}>
                                    <Space.Compact>
                                        <Tooltip title={`最大页数${zone.maxPage}`} placement="bottom">
                                            <InputNumber
                                                min={0}
                                                max={zone.maxPage}
                                                size="small"
                                                style={{ width: "240px" }}
                                                addonBefore={"0.zone"}
                                                addonAfter={
                                                    <div style={{ display: "flex", width: "auto" }}>
                                                        <span style={{ display: "flex", width: "55px" }}>页每页</span>
                                                        <Select
                                                            size="small"
                                                            defaultValue={zone.size}
                                                            style={{ width: 60 }}
                                                            onChange={handleZonePageSizeChange}
                                                            options={ZonePageSizeOptions}
                                                        />
                                                    </div>
                                                }
                                            />
                                        </Tooltip>
                                    </Space.Compact>
                                    <Tooltip title={zone.error} placement="bottom">
                                        {
                                            zone.error && zone.error != "" && <ExclamationCircleTwoTone twoToneColor={"#ff4d4f"} />
                                        }
                                    </Tooltip>
                                </div>
                            </Spin>
                        </Col>
                    </Row>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Button size="small"
                        onClick={
                            () => {
                                console.log(fofa, hunter, zone, quake)
                            }
                        }
                        disabled={fofa.loading || hunter.loading || quake.loading || zone.loading}

                    >Go</Button>
                </div>
            </div>
        </Spin>
        <Table
            size="small"
            columns={defaultColumns}
            dataSource={getPageData()}
            scroll={{ y: tableHeight,scrollToFirstRowOnChange:true }}
            pagination={false}
            rowKey={"index"}
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
    </div>
}

export default Aggregate

