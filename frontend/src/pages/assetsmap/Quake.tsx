import React, { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { Button, Col, ConfigProvider, DatePicker, Divider, Form, Input, InputNumber, MenuProps, Modal, Pagination, Row, Select, Space, Switch, Table, Tabs, TabsProps, Tooltip, message } from 'antd';
import { SearchOutlined, QuestionOutlined, UserOutlined, CloudDownloadOutlined, LoadingOutlined, ExclamationCircleOutlined, SyncOutlined, CrownOutlined, CrownTwoTone, CloudOutlined, CopyOutlined, GlobalOutlined } from '@ant-design/icons';
import { errorNotification } from '../../component/Notification';
import { $getQuakeUser, $quakeFieldQuery, $quakeRealtimeServiceExport, $quakeRealtimeServiceExportStatus, $quakeRealtimeServiceQuery, $saveQuakeConf } from '../../http/api';
import { QUERY_FIRST, MenuItemsKey, RangePresets, copy } from '../../type';
import { ColumnGroupType, ColumnType, ColumnsType } from 'antd/es/table';
import ColumnsFilter, { DataSourceItemType } from '../../component/ColumnFilter';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import ContextMenu from '../../component/ContextMenu';
import { RootState, setHasNewLogItem, setQuakeAuth, setQuakeUser } from '../../store/store';
import { ConnectedProps, connect, useDispatch, useSelector } from 'react-redux';
import quakeFreePoint from '../../public/assets/image/quake-point-free.png'
import quakeBuyPoint from '../../public/assets/image/quake-point-buy.png'
import { LocationType, RSDItem, UserType } from '../../type/quake';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import PointBuy from "../../public/assets/image/point-buy.svg"
import PointFree from "../../public/assets/image/point-free.svg"
import { ResizeCallbackData } from 'react-resizable';
import ResizableTitle from '../../component/ResizableTitle';
import { _openDefaultBrowser } from '../../electron/electronApi';
import { ExportDataPanelProps } from './Props';
import { buttonProps, authFormProps } from '../setting/Setting';
import { localeCompare } from '../../utils/utils';
const { Option } = Select;
const { RangePicker } = DatePicker;
type UserProps = ConnectedProps<typeof connector>;
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const optionCssStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
}

const vipIcon = <CrownTwoTone twoToneColor="red" />

const realtimeServiceFields = (
  <>
    <Option label="ip" value="ip"><span style={optionCssStyle}>ip</span></Option>
    <Option label="port" value="port"><span style={optionCssStyle}>port</span></Option>
    <Option label="hostname" value="hostname"><span style={optionCssStyle}>hostname</span></Option>
    <Option label="transport" value="transport"><span style={optionCssStyle}>transport</span></Option>
    <Option label="asn" value="asn"><span style={optionCssStyle}>asn</span></Option>
    <Option label="org" value="org"><span style={optionCssStyle}>org</span></Option>
    <Option label="service.name" value="service.name"><span style={optionCssStyle}>service.name</span></Option>
    <Option label="location.country_cn" value="location.country_cn"><span style={optionCssStyle}>location.country_cn</span></Option>
    <Option label="location.province_cn" value="location.province_cn"><span style={optionCssStyle}>location.province_cn</span></Option>
    <Option label="location.city_cn" value="location.city_cn"><span style={optionCssStyle}>location.city_cn</span></Option>
    <Option label="service.http.host" value="service.http.host"><span style={optionCssStyle}>service.http.host</span></Option>
    <Option label="service.http.title" value="service.http.title"><span style={optionCssStyle}>service.http.title</span></Option>
    <Option label="service.http.server" value="service.http.server"><span style={optionCssStyle}>service.http.server</span></Option>

    <Option label="time" value="time"><span style={optionCssStyle}>time{vipIcon}</span></Option>
    <Option label="service.response" value="service.response"><span style={optionCssStyle}>service.response{vipIcon}</span></Option>
    <Option label="service.cert" value="service.cert"><span style={optionCssStyle}>service.cert{vipIcon}</span></Option>
    <Option label="components.product_catalog" value="components.product_catalog"><span style={optionCssStyle}>components.product_catalog{vipIcon}</span></Option>
    <Option label="components.product_type" value="components.product_type"><span style={optionCssStyle}>components.product_type{vipIcon}</span></Option>
    <Option label="components.product_level" value="components.product_level"><span style={optionCssStyle}>components.product_level{vipIcon}</span></Option>
    <Option label="components.product_vendor" value="components.product_vendor"><span style={optionCssStyle}>components.product_vendor{vipIcon}</span></Option>
    <Option label="location.country_en" value="location.country_en"><span style={optionCssStyle}>location.country_en{vipIcon}</span></Option>
    <Option label="location.province_en" value="location.province_en"><span style={optionCssStyle}>location.province_en{vipIcon}</span></Option>
    <Option label="location.city_en" value="location.city_en"><span style={optionCssStyle}>location.city_en{vipIcon}</span></Option>
    <Option label="location.district_en" value="location.district_en"><span style={optionCssStyle}>location.district_en{vipIcon}</span></Option>
    <Option label="location.district_cn" value="location.district_cn"><span style={optionCssStyle}>location.district_cn{vipIcon}</span></Option>
    <Option label="location.isp" value="location.isp"><span style={optionCssStyle}>location.isp{vipIcon}</span></Option>
    <Option label="service.http.body" value="service.http.body"><span style={optionCssStyle}>service.http.body{vipIcon}</span></Option>
    <Option label="components.product_name_cn" value="components.product_name_cn"><span style={optionCssStyle}>components.product_name_cn{vipIcon}</span></Option>
    <Option label="components.version" value="components.version"><span style={optionCssStyle}>components.version{vipIcon}</span></Option>
    <Option label="service.http.infomation.mail" value="service.http.infomation.mail"><span style={optionCssStyle}>service.http.infomation.mail{vipIcon}</span></Option>
    <Option label="service.http.favicon.hash" value="service.http.favicon.hash"><span style={optionCssStyle}>service.http.favicon.hash{vipIcon}</span></Option>
    <Option label="service.http.favicon.data" value="service.http.favicon.data"><span style={optionCssStyle}>service.http.favicon.data{vipIcon}</span></Option>
    <Option label="domain" value="domain"><span style={optionCssStyle}>domain{vipIcon}</span></Option>
    <Option label="service.http.status_code" value="service.http.status_code"><span style={optionCssStyle}>service.http.status_code{vipIcon}</span></Option>
  </>
)

type dataCacheType = {
  [key: number]: RSDItem[];
}
const pageSizeOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100,200,300,400,500]

const defaultCheckedColsValue: string[] = [
  "index",
  "ip",
  "port",
  "domain",
  "protocol",
  "web_title",
  "status_code",
  "time",
]

const columnFilterDataSource: DataSourceItemType[] = [
  { label: '序号', value: "index" },
  { label: 'IP', value: "ip" },
  { label: '域名', value: "domain" },
  { label: '端口', value: "port" },
  { label: '协议', value: "protocol" },
  { label: '网站标题', value: "web_title" },
  { label: '响应码', value: "status_code" },
  { label: '产品应用', value: "component", },
  { label: '网站服务器', value: "os", },
  { label: '网站路径', value: "path", },
  { label: '地理位置', value: "location", },
  { label: '更新时间', value: "time", },
  { label: 'ASN', value: "asn", },
  { label: '运营商', value: "isp", },
]
type TabContentProps = {
  user?: UserType
  updateUserInfo?: () => void
  onContextMenu?: {
    addTab: (input: string) => void,
    input: string,
  }
  checkedColsValue?: string[],
  fields: string[]//当前权限的可用字段，暂未使用
}
type TabContentState = {
  checkedColsValue: string[],
  input: string,
  inputCache: string,
  checkedFields: string[],
  queryFields: { value: string, label: string }[],
  ignoreCache: boolean//忽略缓存，true为开启，false为关闭，默认关闭
  latest: boolean//忽略缓存，true为开启，false为关闭，默认关闭
  dateRange: string[],
  exclude: string[],
  include: string[],
  ipList: string[],
}
const mapStateToProps = (state: RootState) => {
  return {
    user: state.user.quake,
  };
};
const mapDispatchToProps = {
  setQuakeUser,
};

const connector = connect(mapStateToProps, mapDispatchToProps)
let selectedRow: { item: RSDItem, rowIndex: number, colKey: string } = {
  item: undefined,
  rowIndex: 0,
  colKey: ''
}
// let selectedRow: RSDItem = {
//   components: [],
//   org: '',
//   ip: '',
//   os_version: '',
//   is_ipv6: false,
//   transport: '',
//   hostname: '',
//   port: 0,
//   service: {
//     response: '',
//     response_hash: '',
//     name: '',
//     http: {
//       server: '',
//       status_code: '',
//       title: '',
//       host: '',
//       path: ''
//     },
//     cert: ''
//   },
//   domain: '',
//   os_name: '',
//   location: {
//     owner: '',
//     province_cn: '',
//     province_en: '',
//     isp: '',
//     country_en: '',
//     district_cn: '',
//     gps: [],
//     street_cn: '',
//     city_en: '',
//     district_en: '',
//     country_cn: '',
//     street_en: '',
//     city_cn: '',
//     country_code: '',
//     asname: '',
//     scene_cn: '',
//     scene_en: '',
//     radius: 0
//   },
//   time: '',
//   asn: 0
// }
const menuItems: MenuProps['items'] = [
  {
    label: '浏览器打开域名',
    key: MenuItemsKey.OpenUrl,
    icon: <GlobalOutlined />
  },
  {
    label: '查询C段',
    key: MenuItemsKey.IpCidr,
    icon: <CloudOutlined />
  },
  {
    label: '查询IP',
    key: MenuItemsKey.Ip,
    icon: <CloudOutlined />
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

const Setting: React.FC = () => {
  const [form] = Form.useForm()
  const [editable, setEditable] = useState(false)
  const quakeAuth = useSelector((state: RootState) => state.config.auth?.quake)
  const dispatch = useDispatch()
  const [open, setOpen] = useState<boolean>(false)
  useEffect(() => {
    if (quakeAuth) {
      form.setFieldsValue({
        key: quakeAuth.key,
      });
    }
  }, [quakeAuth]);
  function save(values: any) {
    setOpen(false)
    setEditable(false)
    form.setFieldsValue(values);
    dispatch(setQuakeAuth(values))
    $saveQuakeConf(values).then(
      resp => {
        console.log(resp.data)
      }
    ).catch()
  }
  return (<><Tooltip title="设置">
    <Button type='link' onClick={() => setOpen((true))}><UserOutlined /></Button>
  </Tooltip>
    <Modal open={open}
      onCancel={() => setOpen(false)}
      onOk={() => {
        setOpen(false)
      }}
      footer={null}
      closeIcon={null}
      width={420}
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
  </>)
}

class TabContent extends React.Component<TabContentProps, TabContentState>{
  constructor(props: TabContentProps) {
    super(props);
    this.state = {
      checkedColsValue: props.checkedColsValue || defaultCheckedColsValue,
      input: props.onContextMenu.input || "",
      inputCache: '',
      checkedFields: props.checkedColsValue || defaultCheckedColsValue,
      queryFields: this.props.fields.map((item) => {
        return { value: item, label: item }
      }),
      ignoreCache: false,
      dateRange: [],
      exclude: [],
      include: [],
      ipList: [],
      latest: true,
    }
  }


  // async componentDidMount() {
  //   // const template = "<Option label=\"$1\" value=\"$1\"><span style={{display:\"flex\"}}>$1{vipIcon}</span></Option>";
  //   // const values = [
  //   //   'ip', 'port', 'hostname', 'transport', 'asn', 'org', 'service.name', 'location.country_cn',
  //   //   'location.province_cn', 'location.city_cn', 'service.http.host', 'time', 'service.http.title',
  //   //   'service.response', 'service.cert', 'components.product_catalog', 'components.product_type',
  //   //   'components.product_level', 'components.product_vendor', 'location.country_en', 'location.province_en',
  //   //   'location.city_en', 'location.district_en', 'location.district_cn', 'location.isp', 'service.http.body',
  //   //   'components.product_name_cn', 'components.version', 'service.http.infomation.mail',
  //   //   'service.http.favicon.hash', 'service.http.favicon.data', 'domain', 'service.http.status_code'
  //   // ];
  //   // values.forEach((value, index) => {
  //   //   const output = template.replace(/\$1/g, value);
  //   //   console.log(output);
  //   // });
  //   // console.log(this.state.queryFields)
  //   window.addEventListener("resize", this.handleResize);
  //   this.handleResize()
  //   let tmpCols: (ColumnGroupType<RSDItem> | ColumnType<RSDItem>)[]
  //   let tmp: (ColumnGroupType<RSDItem> | ColumnType<RSDItem>)[]
  //   if (this.props.checkedColsValue) {
  //     tmpCols = defaultColumns.filter(col => this.props.checkedColsValue.includes((col as any)["dataIndex"]))
  //     tmp = tmpCols.map(col => ({ ...col }));
  //   } else {
  //     tmpCols = defaultColumns.filter(col => defaultCheckedColsValue.includes((col as any)["dataIndex"]))
  //     tmp = tmpCols.map(col => ({ ...col }));

  //   }
  //   if (tmp.length > 0) {
  //     tmp[tmp.length - 1]["width"] = 100
  //   }
  //   await this.setState({ columns: tmp })//需要使用await，不然在query中的columns还没更新
  //   if (this.props.onContextMenu.input) {
  //     this.query()
  //   }
  // }


  getCheckedFields = () => {
    return this.state.checkedFields;
  };

  getInput = () => {
    return this.state.inputCache
  }



  private ExportDataPanel = (props: { id: string; total: number; currentPageSize: number, }) => {
    const dispatch = useDispatch()
    const user = useSelector((state: RootState) => state.user.quake)
    const [page, setPage] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(props.currentPageSize)
    const [cost, setCost] = useState<number>(0)
    const [status, setStatus] = useState<"" | "error" | "warning">("")
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [exportable, setExportable] = useState<boolean>(false)
    const [maxPage, setMaxPage] = useState<number>(0)
    useEffect(() => {
      const maxPage = Math.ceil(props.total / pageSize)
      setMaxPage(maxPage)
      if (page >= maxPage) {
        setPage(maxPage)
        setCost(props.total)
      } else {
        setCost(page * pageSize)
      }
    }, [pageSize, props.total])
    const exportData = async (page: number) => {
      const { id } = props
      setIsExporting(true)
      if (id == "") {
        errorNotification("导出结果", QUERY_FIRST)
        setIsExporting(false)
        return
      }

      const error = await $quakeRealtimeServiceExport(id, page, pageSize)
      if (error) {
        errorNotification("导出结果", error)
        setIsExporting(false)
        return
      }
      const pollingTimer = setInterval(async () => {
        const result = await $quakeRealtimeServiceExportStatus(id)
        console.log(result)
        if (result.error) {
          errorNotification("导出结果", result.message)
          setIsExporting(false)
          clearInterval(pollingTimer)
          return
        }
        if (result.filename) {
          this.props.updateUserInfo()
          setIsExporting(false)
          dispatch(setHasNewLogItem(true))
          clearInterval(pollingTimer)
          return
        }
      }, 1000);
    }
    return <>
      <Button
        size="small"
        onClick={() => setExportable(true)}
        icon={isExporting ? <LoadingOutlined /> : <CloudDownloadOutlined />}
      >
        {isExporting ? "正在导出" : "导出结果"}
      </Button>
      <Modal
        {...ExportDataPanelProps}
        title="导出结果"
        open={exportable}
        onOk={async () => {
          if ((maxPage == 0) || (maxPage > 0 && (maxPage < page || page <= 0))) {
            setStatus("error")
            return
          } else {
            setStatus("")
          }
          setExportable(false)
          exportData(page)
        }}
        onCancel={() => { setExportable(false); setStatus("") }}
      >

        <span style={{ display: 'grid', gap: "3px" }}>
          <Row>
            <span style={{ display: 'flex', flexDirection: "row", gap: "5px", backgroundColor: '#f3f3f3', width: "100%" }}>
              <span>月度积分: <span style={{ color: "#f5222d" }}>{user.month_remaining_credit}</span></span>
              <span>永久积分: <span style={{ color: "#f5222d" }}>{user.persistent_credit}</span></span>
            </span>
          </Row>
          <Row>
            <Col span={10}>
              <span>导出分页大小</span>
            </Col>
            <Col span={14}>
              <Select
                size='small'
                style={{ width: '80px' }}
                defaultValue={pageSize}
                options={pageSizeOptions.map(size => ({ label: size.toString(), value: size }))}
                onChange={(size) => {
                  setPageSize(size)
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              <span style={{ display: 'flex', whiteSpace: 'nowrap' }}>导出页数(max:{maxPage})</span>
            </Col>
            <Col span={14}>
              <InputNumber
                size='small'
                status={status}
                value={page}
                onChange={(value: number) => {
                  if (value >= maxPage) {
                    setPage(maxPage);
                    setCost(props.total)
                  } else {
                    setCost(pageSize * value)
                    setPage(value)
                  }
                }}
                keyboard={true}
              />=
              <Input
                style={{ width: '100px' }}
                size='small'
                value={cost}
                suffix={"积分"}
              />
            </Col>
          </Row>
        </span>
        {/* <Space>
          <InputNumber
            status={status}
            onChange={(value: number) => {
              setPage(value);
              if (value == this.state.maxPage) {
                setCost(this.state.total)
              } else {
                setCost(this.state.currentSize * value)
              }

            }}
            addonBefore={`导出页数(可用页数:${this.state.maxPage})`}
            min={this.state.maxPage > 0 ? 1 : 0}
            max={this.state.maxPage}
            keyboard={true}
            size='small'
          />=
          <Input
            size='small'
            value={cost}
            suffix={"积分"}
          />
        </Space> */}
      </Modal></>
  }

  Content = () => {
    const defaultColumns: ColumnsType<RSDItem> = [
      {
        title: '序号', dataIndex: "index", width: 52, ellipsis: true, fixed: "left", onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "index", } }
          }
        }
      },
      {
        title: 'IP', dataIndex: "ip", ellipsis: true, width: 120, fixed: "left", sorter: ((a, b) => localeCompare(a.ip, b.ip)), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "ip", } },
            onClick: () => copyCell(record.ip)
          }
        }
      },
      {
        title: '域名', dataIndex: "domain", ellipsis: true, width: 100, sorter: ((a, b) => localeCompare(a.domain, b.domain)), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "domain", } },
            onClick: () => copyCell(record.domain)
          }
        }
      },
      {
        title: '端口', dataIndex: "port", ellipsis: true, width: 53, sorter: ((a, b) => localeCompare(a.port, b.port)), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "port", } },
            onClick: () => copyCell(record.port)
          }
        }
      },
      {
        title: '协议', dataIndex: "protocol", ellipsis: true, width: 60, sorter: ((a, b) => localeCompare(a?.service?.name, b?.service?.name)), render: (value, record: RSDItem) => (record?.service?.name), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "protocol", } },
            onClick: () => copyCell(record?.service?.name)
          }
        }
      },
      {
        title: '网站标题', dataIndex: "web_title", ellipsis: true, width: 400, sorter: ((a, b) => localeCompare(a?.service?.http?.title, b?.service?.http?.title)), render: (value, record: RSDItem) => (record?.service?.http?.title), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "web_title", } },
            onClick: () => copyCell(record?.service?.http?.title)
          }
        }
      },
      {
        title: '响应码', dataIndex: "status_code", ellipsis: true, width: 60, sorter: ((a, b) => localeCompare(a?.service?.http?.status_code, b?.service?.http?.status_code)), render: (value, record: RSDItem) => (record?.service?.http?.status_code), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "status_code", } },
            onClick: () => copyCell(record?.service?.http?.status_code)
          }
        }
      },
      {
        title: '产品应用', dataIndex: "component", ellipsis: true, width: 100, onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "component", } },
            onClick: () => copyCell(record.ip)
          }
        }
      },
      {
        title: '网站服务器', dataIndex: "os_name", ellipsis: true, width: 100, sorter: ((a, b) => localeCompare(a.os_name, b.os_name)), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "os_name", } },
            onClick: () => copyCell(record.os_name)
          }
        }
      },
      {
        title: '网站路径', dataIndex: "path", ellipsis: true, width: 60, sorter: ((a, b) => localeCompare(a?.service?.http?.path, b?.service?.http?.path)), render: (value, record: RSDItem) => (record?.service?.http?.path), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "path", } },
            onClick: () => copyCell(record?.service?.http?.path)
          }
        }
      },
      {
        title: '地理位置', dataIndex: "location", ellipsis: true, width: 100, render: (value: LocationType) => {
          const location: string[] = []
          if (value.country_cn) {
            location.push(value.country_cn)
          }
          if (value.province_cn) {
            location.push(value.province_cn)
          }
          if (value.city_cn) {
            location.push(value.city_cn)
          }
          if (value.street_cn) {
            location.push(value.street_cn)
          }
          return <>{location.join(" ")}</>
        }, onCell: (record, index) => {
          const location: string[] = []
          if (record.location.country_cn) {
            location.push(record.location.country_cn)
          }
          if (record.location.province_cn) {
            location.push(record.location.province_cn)
          }
          if (record.location.city_cn) {
            location.push(record.location.city_cn)
          }
          if (record.location.street_cn) {
            location.push(record.location.street_cn)
          }
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "location", } },
            onClick: () => copyCell(location.join(" "))
          }
        }
      },
      {
        title: '更新时间', dataIndex: "time", ellipsis: true, width: 100, sorter: ((a, b) => localeCompare(a.time, b.time)), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "time", } },
            onClick: () => copyCell(record.time)
          }
        }
      },
      {
        title: 'ASN', dataIndex: "asn", ellipsis: true, width: 100, sorter: ((a, b) => localeCompare(a.asn, b.asn)), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "asn", } },
            onClick: () => copyCell(record.asn)
          }
        }
      },
      {
        title: '运营商', dataIndex: "isp", ellipsis: true, width: 100, sorter: ((a, b) => localeCompare(a?.location?.isp, b?.location?.isp)), render: (value, record: RSDItem) => (record?.location?.isp), onCell: (record, index) => {
          return {
            onContextMenu: () => { selectedRow = { item: record, rowIndex: index, colKey: "isp", } },
            onClick: () => copyCell(record?.location?.isp)
          }
        }
      },
    ];
    const [columns, setColumns] = useState<ColumnsType<RSDItem>>()
    const [messageApi, contextHolder] = message.useMessage();
    const [tableHeight, setTableHeight] = useState<number>(200)
    const [loading, setLoading] = useState<boolean>(false)
    const [dataCache, setDataCache] = useState<dataCacheType>({})
    const [id, setId] = useState<string>("")
    const [total, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [currentPageSize, setCurrentPageSize] = useState<number>(pageSizeOptions[0])
    const { input, checkedColsValue } = this.state

    useEffect(() => {
      const init = async () => {
        window.addEventListener("resize", handleResize);
        handleResize()
        let tmpCols: (ColumnGroupType<RSDItem> | ColumnType<RSDItem>)[]
        let tmp: (ColumnGroupType<RSDItem> | ColumnType<RSDItem>)[]
        if (this.props.checkedColsValue) {
          tmpCols = defaultColumns.filter(col => this.props.checkedColsValue.includes((col as any)["dataIndex"]))
          tmp = tmpCols.map(col => ({ ...col }));
        } else {
          tmpCols = defaultColumns.filter(col => defaultCheckedColsValue.includes((col as any)["dataIndex"]))
          tmp = tmpCols.map(col => ({ ...col }));

        }
        if (tmp.length > 0) {
          tmp[tmp.length - 1]["width"] = 100
        }
        setColumns(tmp)
        if (this.props.onContextMenu.input) {
          handleQuery(1, currentPageSize)
        }
      }
      init()

    }, [])
    const copyCell = (value: string | number | boolean) => {
      if (!value) {
        return
      }
      copy(value)
      messageApi.success("复制成功", 0.5)
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

    const getMergeColumns = (): ColumnsType<RSDItem> => {

      if (!columns) {
        return defaultColumns
      }

      return columns?.map((col, index) => ({
        ...col,
        onHeaderCell: (column: ColumnsType<RSDItem>[number]) => ({
          width: column.width,
          onResize: handleHeaderResize(index) as React.ReactEventHandler<any>,
        }),
      }));
    }

    const handleMenuItemClick = (key: MenuItemsKey) => {
      switch (key) {
        case MenuItemsKey.CopyCell:
          {
            const item = selectedRow.item as RSDItem
            for (const key in item) {
              if (Object.prototype.hasOwnProperty.call(item, key) && key === selectedRow.colKey) {
                const value = item[key as keyof RSDItem];
                copy(value)
              }
            }
          }
          break
        case MenuItemsKey.IpCidr:
          this.props?.onContextMenu.addTab("ip=" + selectedRow.item.ip + "/24")
          break
        case MenuItemsKey.Ip:
          this.props?.onContextMenu.addTab("ip=" + selectedRow.item.ip)
          break
        case MenuItemsKey.OpenUrl:
          {
            const domain = selectedRow.item.domain
            const schema = selectedRow.item.service?.name
            const port = selectedRow.item.port
            if (domain && schema) {
              if (schema.startsWith("http/ssl")) {
                _openDefaultBrowser("https://" + selectedRow.item.domain + `${typeof port == "number" ? ":" + port.toString() : ""}`)
              } else if (schema.startsWith("http")) {
                _openDefaultBrowser("http://" + selectedRow.item.domain + `${typeof port == "number" ? ":" + port.toString() : ""}`)
              }
            }
            break
          }
        case MenuItemsKey.CopyRow:
          copy(selectedRow)
          break
        case MenuItemsKey.CopyCol:
          {
            const colValues = dataCache[currentPage].map(item => {
              for (const key in item) {
                const ok = Object.prototype.hasOwnProperty.call(item, key)
                if (ok && key === selectedRow.colKey) {
                  return item[key as keyof RSDItem];
                }
                switch (selectedRow.colKey) {
                  case "protocol":
                    return item.service?.name ? item.service?.name : ""
                  case "web_title":
                    return item.service?.http?.title ? item.service?.http?.title : ""
                  case "status_code":
                    return item.service?.http?.status_code ? item.service?.http?.status_code : ""
                  case "path":
                    return item.service?.http?.path ? item.service?.http?.path : ""
                  case "isp":
                    return item?.location?.isp ? item?.location?.isp : ""
                  case "location":
                    {
                      const location: string[] = []
                      if (item.location.country_cn) {
                        location.push(item.location.country_cn)
                      }
                      if (item.location.province_cn) {
                        location.push(item.location.province_cn)
                      }
                      if (item.location.city_cn) {
                        location.push(item.location.city_cn)
                      }
                      if (item.location.street_cn) {
                        location.push(item.location.street_cn)
                      }
                      return location.join(" ")
                    }
                }
              }
              return ""
            })
            copy(colValues)
            break
          }
      }
      selectedRow = undefined
    };


    const handleResize = () => {
      setTableHeight(window.innerHeight - 30 - 46 - 17 - 24 - 17 - 40 - 5 - 24 - 5 - 17);
    }

    const handleQuery = async (page: number, pageSize: number) => {
      const { input, dateRange: dataRange, ignoreCache, ipList, include, exclude, latest } = this.state
      const tmpInput = input.trim()
      if (tmpInput === "") {
        return
      }
      setId("")
      setLoading(true)
      setTotal(0)
      setCurrentPage(1)
      this.setState({
        inputCache: tmpInput,
      })

      //不能使用inputCache，setInputCache(tmpInput)为异步更新，此时inputCache还没有更新
      const result = await $quakeRealtimeServiceQuery({
        query: tmpInput, page: page, size: pageSize,
        startTime: dataRange[0] ? this.state.dateRange[0] : "",
        endTime: dataRange[1] ? this.state.dateRange[1] : "",
        rule: '',
        ipList: ipList,
        ignoreCache: ignoreCache,
        include: include,
        exclude: exclude,
        latest: latest
      })
      if (result.error) {
        errorNotification("Quake查询出错", result.error)
        setLoading(false)
        setDataCache({})
        return
      }
      this.props.updateUserInfo()
      let index = 0
      setDataCache({
        1: result.items?.map((item) => {
          index++
          return { ...item, index: index }
        })
      })
      setTotal(result.total)
      setLoading(false)
      setId(result.id)
    }

    const getPageData = () => {
      return dataCache[currentPage] ? dataCache[currentPage] : []
    }

    const handlePaginationChange = async (newPage: number, newSize: number) => {
      const { inputCache, dateRange: dataRange, ignoreCache, ipList, include, exclude } = this.state
      //page发生变换
      if (newPage != currentPage && newSize == currentPageSize) {
        //从缓存取数据
        if (dataCache[newPage]) {
          setCurrentPage(newPage)
          setLoading(false)
          return
        }

        const tmp: string[] = []
        columns.forEach((item) => {
          const field = (item as any)["dataIndex"]
          if (field != "index") {
            tmp.push(field)
          }
        })
        const result = await $quakeRealtimeServiceQuery({
          query: inputCache, page: newPage, size: currentPageSize,
          startTime: dataRange[0] ? dataRange[0] : "",
          endTime: dataRange[1] ? dataRange[1] : "",
          rule: '',
          ipList: ipList,
          ignoreCache: ignoreCache,
          include: include,
          exclude: exclude
        })
        if (result.error) {
          errorNotification("Quake查询出错", result.error)
          setLoading(false)
          return
        }
        this.props.updateUserInfo()
        let index = (newPage - 1) * currentPageSize
        setDataCache({
          ...dataCache,
          [newPage]: result.items?.map((item) => {
            index++
            return { ...item, index: index }
          })
        })
        setCurrentPage(newPage)
        setLoading(false)
      }

      //size发生变换
      if (newSize != currentPageSize) {
        setCurrentPage(1)
        setCurrentPageSize(newSize)
        handleQuery(1, newSize)
      }
    }

    const onFieldsChange = (fields: CheckboxValueType[]) => {
      console.log(fields)
      const tmpCols = defaultColumns.filter(col => fields.includes((col as any)["dataIndex"]))
      const tmp = tmpCols.map(col => ({ ...col }));
      if (tmp.length > 0) {
        // delete tmp[tmp.length - 1]["width"]
        tmp[tmp.length - 1]["width"] = 100
      }
      setColumns(tmp)
      this.setState({
        checkedFields: tmp.map(item => (item as any).dataIndex)
      })
    }
    return <div>
      {contextHolder}
      <div style={{ display: "flex", justifyContent: 'center', alignItems: "center", marginBottom: "5px" }}>
        <Input
          style={{ width: "600px" }}
          size="small"
          allowClear
          value={input}
          onPressEnter={() => handleQuery(currentPage, currentPageSize)}
          onChange={(e) => this.setState({ input: e.target.value })}
          placeholder='Search...'
        />
        <Button type='text' size="small" icon={<SearchOutlined />} onClick={() => handleQuery(currentPage, currentPageSize)} />
        <Help />
      </div>
      <div>

      </div>
      <Space direction="vertical" style={{ width: "100%", alignItems: "center" }}>
        <Space
          // style={{ display: "flex", justifyContent: 'center', alignItems: "center", marginBottom: "5px" }}
          split={<Divider type="vertical" style={{ margin: "0px", alignItems: "center" }} />}
          wrap
        >
          <RangePicker
            presets={[
              ...RangePresets,
            ]}

            style={{ width: "330px" }} size="small" format="YYYY-MM-DD HH:mm:ss" onChange={async (_dates, dateStrings) => {
              console.log(_dates, dateStrings)
              this.setState({ dateRange: dateStrings })
            }}
            allowEmpty={[true, true]}
            showTime
            showNow
          />



          {/* </Space>
      <Space
        style={{ display: "flex", justifyContent: 'center', alignItems: "center", marginBottom: "5px" }}
        split={<Divider type="vertical" style={{ margin: "0px" }} />}
      > */}
          <Select
            maxTagTextLength={10}
            disabled onChange={(value) => {
              this.setState({ include: value })
            }}
            allowClear
            maxTagCount={1}
            mode="multiple"
            optionLabelProp="value"
            placeholder='包含字段,尚不成熟,暂禁用'
            size='small'
            style={{
              width: "260px",
              whiteSpace: "nowrap"
            }}>
            {realtimeServiceFields}
          </Select>
          <Select
            maxTagTextLength={10}
            disabled onChange={(value) => {
              this.setState({ exclude: value })
            }}
            allowClear
            maxTagCount={1}
            mode="multiple"
            optionLabelProp="value"
            placeholder='排除字段,尚不成熟,暂禁用'
            size='small'
            style={{ width: "260px" }}>
            {realtimeServiceFields}
          </Select>

        </Space>
        <Space style={{ alignItems: "center" }}>
          <Input style={{ width: "250px" }} size="small" placeholder='IP列表，以逗号分隔' onChange={(e) => {
            const value = e.target.value
            this.setState({ ipList: value.trim() == "" ? [] : value.split(",") }
            )
          }} />

          <div style={{
            display: "flex",
            alignItems: "center",
          }}>
            <label style={{ fontSize: "14px", marginRight: "5px" }}>忽略缓存</label><Switch size="small" checkedChildren="开启" unCheckedChildren="关闭" onChange={(value) => this.setState({ ignoreCache: value })} />
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
          }}>
            <label style={{ fontSize: "14px", marginRight: "5px" }}>最新数据</label><Switch size="small" checkedChildren="开启" defaultChecked={this.state.latest} unCheckedChildren="关闭" onChange={(value) => this.setState({ ignoreCache: value })} />
          </div>
          <div>
            <label style={{ fontSize: "14px" }}>列设置</label>
            <ColumnsFilter
              dataSource={columnFilterDataSource}
              checkedSource={checkedColsValue}
              onChange={(checkedList: CheckboxValueType[]) => onFieldsChange(checkedList)} />
          </div>
        </Space>
      </Space>

      <ContextMenu
        // open={open}
        // event={event}
        items={menuItems}
        onItemClick={(key: MenuItemsKey) => {
          handleMenuItemClick(key)
        }}
      // toInvisible={() => { this.setState({ open: false }) }}
      >
        <Table
          // locale={{ emptyText: "暂无数据" }}
          showSorterTooltip={false}
          scroll={{ y: tableHeight, scrollToFirstRowOnChange: true }}
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
            <this.ExportDataPanel id={id} total={total} currentPageSize={currentPageSize} />
          </div>}
          // onRow={(record) => {
          //   return {
          //     onContextMenu: (event) => { selectedRow = record },
          //   };
          // }}
          sticky
          rowKey={"index"} //如果不为每个列数据添加一个key属性，则应该设置此项，这里设置为对应columns里序号的dataIndex值，参考【https://ant.design/components/table-cn#design-token #注意】
        />
      </ContextMenu>

    </div >
  }

  render() {
    return <this.Content />
  }
}

const ConnectedTabContent = connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(TabContent);

type TabType = {
  label: string,
  key: string,
  children: ReactNode,
  closable?: boolean
}

class Quake extends React.Component<UserProps> {
  state = {
    activeKey: "",
    tabCount: 0,
    tabRefs: [] as TabContent[],
    items: [] as TabType[],
    queryFields: [] as string[],
  };

  componentDidMount(): void {
    const initialTabKey = `${++this.state.tabCount}`;
    // this.getFields()
    this.setState({
      activeKey: initialTabKey,
      items: [{
        label: initialTabKey,
        key: initialTabKey,
        children: <ConnectedTabContent
          ref={(r: TabContent) => {
            if (r) {
              this.setState({ tabRefs: [r] });
            }
          }}
          updateUserInfo={this.getUserInfo}
          onContextMenu={{
            addTab: (input) => this.addTab(input),
            input: "",
          }}
          fields={this.state.queryFields}
        />,
      }],
    });
    this.getUserInfo()
  }


  private getUserInfo = async () => {
    try {
      const resp = await $getQuakeUser()
      if (resp.error) {
        errorNotification("Quake用户信息", resp.error)
      } else {
        this.props.setQuakeUser(resp.user)
      }
    } catch (error) {
      errorNotification("Quake用户信息", error)
    }
  }

  onTabChange = (newActiveKey: string) => {
    this.setState({ activeKey: newActiveKey });
  };

  addTab = (input: string) => {
    const newActiveKey = `${++this.state.tabCount}`;
    const checkedFields = this.state.tabRefs[parseInt(this.state.activeKey) - 1]?.getCheckedFields()
    const newPanes = [
      ...this.state.items,
      {
        label: newActiveKey,
        key: newActiveKey,
        children: <ConnectedTabContent
          ref={(r: TabContent) => {
            if (r) {
              this.setState({ tabRefs: [r] });
            }
          }}
          checkedColsValue={checkedFields}
          fields={this.state.queryFields}
          updateUserInfo={this.getUserInfo}
          onContextMenu={{
            addTab: (input) => this.addTab(input),
            input: input
          }}
        />,

      },
    ];
    this.setState({ items: newPanes, activeKey: newActiveKey });
  };

  removeTab = (targetKey: TargetKey) => {
    let newActiveKey = this.state.activeKey;
    const lastIndex = -1;
    const newPanes = this.state.items.filter((item) => item.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    this.setState({ items: newPanes, activeKey: newActiveKey });
  };

  onEditTab = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: 'add' | 'remove',
  ) => {
    if (action === 'add') {
      this.addTab("");
    } else {
      this.removeTab(targetKey);
    }
  };

  UserPanel = () => {
    const user = useSelector((state: RootState) => state.user.quake)
    const [spin, setSpin] = useState<boolean>(false)
    return <div style={{
      width: "auto",
      height: "23px",
      display: "flex",
      alignItems: "center",
      backgroundColor: "#f1f3f4"
    }}>
      <Setting />
      <Divider type="vertical" />
      <Space>
        <Tooltip title="永久积分">
          <div style={{
            height: "24px",
            display: "flex",
            alignItems: "center",
            color: "#f5222d"
          }}>
            <img src={PointBuy} />
            {user.persistent_credit}
          </div>
        </Tooltip>
        <Tooltip title="月度积分" >
          <div style={{
            height: "24px",
            display: "flex",
            alignItems: "center",
            color: "#f5222d"
          }}>
            <img src={PointFree} />
            {user.month_remaining_credit}
          </div>
        </Tooltip>
        <Tooltip title="刷新余额">
          <Button size="small" shape="circle" type="text" icon={<SyncOutlined spin={spin}
            onClick={async () => {
              setSpin(true)
              await this.getUserInfo()
              setSpin(false)
            }}
          />}></Button>
        </Tooltip>
      </Space>


    </div>
  }

  render(): React.ReactNode {
    return (
      <Tabs
        size="small"
        tabBarExtraContent={{
          left: <this.UserPanel />
        }}
        type="editable-card"
        onChange={this.onTabChange}
        activeKey={this.state.activeKey}
        onEdit={this.onEditTab}
        items={this.state.items}
      />
    );
  }
}

interface ExampleHelpDataType {
  index: number;
  field: string;
  fieldDescription: string
  mode?: string
  description: ReactNode;
  example: ReactNode;
}

const exampleHelpColumns1: ColumnsType<ExampleHelpDataType> = [
  { title: '序号', dataIndex: "index", width: 50 },
  { title: '检索语法', dataIndex: "field", width: 100 },
  { title: '字段名称', dataIndex: "fieldDescription", width: 100 },
  { title: '支持的数据模式', dataIndex: "mode", width: 150 },
  { title: '解释说明', dataIndex: "description", width: 250 },
  { title: '范例', dataIndex: "example" },
];

const exampleHelpColumns2: ColumnsType<ExampleHelpDataType> = [
  { title: '序号', dataIndex: "index", width: 50 },
  { title: '检索语法', dataIndex: "field", width: 100 },
  { title: '字段名称', dataIndex: "fieldDescription", width: 100 },
  { title: '解释说明', dataIndex: "description", width: 250 },
  { title: '范例', dataIndex: "example" },
];


const exampleHelpDataTabs: TabsProps['items'] = [
  {
    key: "1", label: "基本信息部分", children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
      dataSource={[
        {
          index: 1, field: "ip", fieldDescription: "IP地址及网段", mode: "主机数据 服务数据",
          description: "支持检索单个IP、CIDR地址段、支持IPv6地址",
          example: `ip:"1.1.1.1" ip: "1.1.1.1/16" ip:"2804:29b8:500d:4184:40a8:2e48:9a5d:e2bd" ip:"2804:29b8:500d:4184:40a8:2e48:9a5d:e2bd/24"`
        },
        {
          index: 2, field: "is_ipv6", fieldDescription: "搜索ipv4的资产", mode: "主机数据 服务数据",
          description: "只接受 true 和 false",
          example: `is_ipv6:"true"：查询IPv6数据 is_ipv6:"false"：查询IPv4数据`,
        },
        {
          index: 3, field: "is_latest", fieldDescription: "搜索最新的资产", mode: "服务数据",
          description: "只接受 true 和 false",
          example: `is_latest :"true"：查询最新的资产数据`,
        },
        {
          index: 4, field: "port", fieldDescription: "端口", mode: "主机数据 服务数据",
          description: "搜索开放的端口",
          example: `port:"80"：查询开放80端口的主机`,
        },
        {
          index: 5, field: "ports", fieldDescription: "多端口", mode: "主机数据 服务数据",
          description: "搜索某个主机同时开放过的端口",
          example: `ports:"80,8080,8000"：查询同时开放过80、8080、8000端口的主机`,
        },

        {
          index: 6, field: `port:>或< port:>=或<=`, fieldDescription: "端口范围", mode: "主机数据 服务数据",
          description: "搜索满足某个端口范围的主机",
          example: `port:[* TO 80]：查询开放端口小于等于80的主机 port:[80 TO 1024]：查询开放的端口介入80和1024之间的主机 port:[80 TO *]：查询开放端口包含且大于80端口的主机`,
        }, {
          index: 7, field: "transport", fieldDescription: "传输层协议", mode: "主机数据 服务数据",
          description: "只接受tcp、udp",
          example: `transport:"tcp"：查询tcp数据 transport:"udp"：查询udp数据`,
        },
      ]}
    />
  },
  {
    key: "2", label: "ASN网络自治域相关部分", children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
      dataSource={[
        {
          index: 1, field: "asn", fieldDescription: "自治域号码", mode: "主机数据 服务数据",
          description: "自治域号码",
          example: `asn:"12345"`
        },
        {
          index: 2, field: "org", fieldDescription: "自治域归属组织名称", mode: "主机数据 服务数据",
          description: "自治域归属组织名称",
          example: `org:"No.31,Jin-rong Street"`,
        },
      ]}
    />
  },
  {
    key: "3", label: "主机名与操作系统部分", children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
      dataSource={[
        {
          index: 1, field: "hostname", fieldDescription: "主机名", mode: "服务数据",
          description: "即rDNS数据",
          example: `hostname:"50-87-74-222.unifiedlayer.com"`
        },
        {
          index: 2, field: "domain", fieldDescription: "网站域名", mode: "服务数据",
          description: "网站域名信息",
          example: `domain:"360.cn" domain:*.360.cn`,
        },
        {
          index: 3, field: "os", fieldDescription: "操作系统部分", mode: "服务数据",
          description: "操作系统名称+版本	",
          example: `os:"Windows"`,
        },
      ]}
    />
  },
  {
    key: "4", label: "服务数据部分", children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
      dataSource={[
        {
          index: 1, field: "service", fieldDescription: "服务名称", mode: "主机数据 服务数据",
          description: "即应用协议名称",
          example: `service:"http"`
        },
        {
          index: 2, field: "services", fieldDescription: "多个服务名称", mode: "主机数据",
          description: `搜索某个主机同时支持的协议 仅在主机数据模式下可用`,
          example: `services:"rtsp,https,telnet"：支持rtsp、https、telnet的主机`,
        },
        {
          index: 3, field: "app", fieldDescription: "服务产品", mode: "主机数据 服务数据",
          description: `经过Quake指纹识别后的产品名称（未来会被精细化识别产品替代）`,
          example: `app:"Apache"Apache服务器产品`,
        },
        {
          index: 4, field: "app_version", fieldDescription: "产品版本", mode: "主机数据 服务数据",
          description: `经过Quake指纹识别后的产品版本`,
          example: `app_version:"1.2.1"`,
        },
        {
          index: 5, field: "response", fieldDescription: "服务原始响应", mode: "服务数据",
          description: `这里是包含端口信息最丰富的地方`,
          example: <>
            response:"奇虎科技"：端口原生返回数据中包含"奇虎科技"的主机<br />
            response:"220 ProFTPD 1.3.5a Server"：端口原生返回数据中包含"220 ProFTPD 1.3.5a Server"字符串的主机`
          </>
        },
        {
          index: 6, field: "cert", fieldDescription: "SSL\\TLS证书信息", mode: "主机数据 服务数据",
          description: `这里存放了格式解析后的证书信息字符串`,
          example: `cert:"奇虎科技"：包含"奇虎科技"的证书 cert:"360.cn"：包含"360.cn"域名的证书`,
        },
      ]}
    />
  },
  {
    key: "5", label: "精细化应用识别部分", children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
      dataSource={[
        {
          index: 1, field: "catalog", fieldDescription: "应用类别", mode: "服务数据",
          description: "该字段是应用类型的集合，是一个更高层面应用的聚合",
          example: `catalog:"IoT物联网"  catalog:"IoT物联网" OR catalog:"网络安全设备"`
        },
        {
          index: 2, field: "type", fieldDescription: "应用类型", mode: "服务数据",
          description: "该字段是对应用进行的分类结果，指一类用途相同的资产",
          example: `type:"防火墙" type:"VPN"`,
        },
        {
          index: 3, field: "level", fieldDescription: "应用层级", mode: "服务数据",
          description: "对于所有应用进行分级，一共5个级别：硬件设备层、操作系统层、服务协议层、中间支持层、应用业务层",
          example: `level:"硬件设备层" level:"应用业务层"`,
        },
        {
          index: 4, field: "vendor", fieldDescription: "应用生产厂商", mode: "服务数据",
          description: "该字段指某个应用设备的生产厂商",
          example: `vendor:"Sangfor深信服科技股份有限公司" vendor:"Sangfor" OR vendor:"微软" vendor:"DrayTek台湾居易科技"`,
        },
      ]}
    />
  },
  {
    key: "6", label: "IP归属与定位部分", children: <Table size='small' pagination={false} columns={exampleHelpColumns1}
      dataSource={[
        {
          index: 1, field: "country", fieldDescription: "国家（英文）与国家代码", mode: "主机数据 服务数据",
          description: "搜索 country:C hina country:CN 都可以",
          example: `country:"China" country:"CN"`
        },
        {
          index: 2, field: "country_cn", fieldDescription: "国家（中文）", mode: "主机数据 服务数据",
          description: "用于搜索中文国家名称",
          example: `country_cn:"中国"`,
        },
        {
          index: 3, field: "province", fieldDescription: "省份（英文）", mode: "主机数据 服务数据",
          description: "用于搜索英文省份名称",
          example: `province:"Sichuan"`,
        },
        {
          index: 4, field: "province_cn", fieldDescription: "省份（中文）", mode: "主机数据 服务数据",
          description: "用于搜索中文省份名称",
          example: `province_cn:"四川"`,
        },
        {
          index: 5, field: "city", fieldDescription: "城市（英文）", mode: "主机数据 服务数据",
          description: "用于搜索英文城市名称",
          example: `city:"Chengdu"`,
        },
        {
          index: 6, field: "city_cn", fieldDescription: "城市（中文", mode: "主机数据 服务数据",
          description: "用于搜索中文城市名称",
          example: `city_cn:"成都"`,
        },
        {
          index: 7, field: "district", fieldDescription: "区县（中文）", mode: "服务数据",
          description: "用于搜索中文城市下面的区县名称",
          example: `district:"朝阳区"`,
        },
        {
          index: 8, field: "owner", fieldDescription: "IP归属单位", mode: "主机数据 服务数据",
          description: "这里的归属并不精确，后期Quake会推出单位归属专用关键词",
          example: `owner: "tencent.com" owner: "清华大学"`,
        }, {
          index: 9, field: "isp", fieldDescription: "运营商", mode: "主机数据 服务数据",
          description: "根据IP划分归属的运营商",
          example: `isp: "联通" isp: "amazon.com"`,
        },
      ]}
    />
  },
  {
    key: "7", label: "图像数据与应用场景部分", children: <Table size='small' pagination={false} columns={exampleHelpColumns2}
      dataSource={[
        {
          index: 1, field: "img_tag", fieldDescription: "图片标签", description: "用于搜索图片的标签",
          example: `img_tag: "windows"`
        },
        {
          index: 2, field: "img_ocr", fieldDescription: "图片OCR", description: "用于搜索图片中的信息",
          example: `img_ocr:"admin"`,
        },
        {
          index: 3, field: "img_ocr", fieldDescription: "系统标签", description: "用于搜索IP资产的应用场景，如：CDN、卫星互联网、IDC机房等",
          example: `sys_tag:"卫星互联网"`,
        },
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
      width={1100}
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


export default connector(Quake);
