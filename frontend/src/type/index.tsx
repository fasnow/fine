import { CloudOutlined, CopyOutlined, GlobalOutlined } from "@ant-design/icons";
import { MenuProps, TimeRangePickerProps } from "antd";
import Item from "antd/es/list/Item";
import { ItemType } from "antd/es/menu/hooks/useItems";
import copyToClipboard from "copy-to-clipboard";
import dayjs from "dayjs";

export const RangePresets: TimeRangePickerProps['presets'] = [
  { label: '最近7天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '最近15天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '最近一月', value: [dayjs().add(-1, 'month'), dayjs()] },
  { label: '最近三月', value: [dayjs().add(-3, 'month'), dayjs()] },
  { label: '最近六月', value: [dayjs().add(-6, 'month'), dayjs()] },
  { label: '最近一年', value: [dayjs().add(-1, 'year'), dayjs()] },
  { label: '最近两年', value: [dayjs().add(-2, 'year'), dayjs()] },
  { label: '最近三年', value: [dayjs().add(-3, 'year'), dayjs()] },
];

export interface DownloadLogItem {
  filename: string,
  dir: string,
  exist?: boolean
}

export interface ExportDataReturnType extends DownloadLogItem {
  error: any
}

export interface RequestDataType {
  "query": string,
  "page": number,
  "size": number,
}

export type ServerResponseType = {
  "message": string,
  "code": number,
  "data": any,
}

export interface ResponseDataType<T> {
  error: any,
  total: number,
  items: T,
  page: number,
  size: number,
}

export interface ExportDataReqBody {
  "uuid": string;
  "page": number;
}

export type IcpItemType = {
  unitName: string,           //名称
  domain: string,             //域名
  serviceLicence: string,     //备案号
  mainLicense: string,        //主备案号
  leaderName: string,         //备案法人
  natureName: string,         //单位性质
  updateRecordTime: string,   //审核日期
  domainId: number,           //域名ID
  limitAccess: string,        //限制访问
  mainId: number,
  serviceId: number,
}

export interface IcpQueryResult extends ResponseDataType<IcpItemType[]> {
  id: string
  maxPage: number
}

export interface FofaItemType {
  ip: string, //ip,ip地址,权限：无
  port: string,  //port,端口,权限：无
  protocol: string,  //protocol,协议名,权限：无
  country: string,  //country,国家代码,权限：无
  country_name: string,  //country_name,国家名,权限：无
  region: string,  //region,区域,权限：无
  city: string,  //city,城市,权限：无
  longitude: string,  //longitude,地理位置 经度,权限：无
  latitude: string,  //latitude,地理位置 纬度,权限：无
  as_number: string,  //as_number,asn编号,权限：无
  as_organization: string,  //as_organization,asn组织,权限：无
  host: string,  //host,主机名,权限：无
  domain: string,  //domain,域名,权限：无
  os: string,  //os,, 操作系统,权限：无
  server: string,  //server,网站server,权限：无
  icp: string,  //icp,icp备案号,权限：无
  title: string,  //title,网站标题,权限：无
  jarm: string,  //jarm,jarm 指纹,权限：无
  header: string,  //header,网站header,权限：无
  banner: string,  //banner,协议 banner,权限：无
  cert: string,  //cert,证书,权限：无
  base_protocol: string,  //base_protocol,基础协议，比如tcp/udp,权限：无
  link: string,  //link,资产的URL链接,权限：无
  product: string,  //product,产品名,权限：专业版本及以上
  product_category: string,//product_category,产品分类, ,权限：专业版本及以上
  version: string,  //version,版本号,权限：专业版本及以上
  lastupdatetime: string,  //lastupdatetime,FOFA最后更新时间, ,权限：专业版本及以上
  cname: string,  //cname,域名cname,权限：专业版本及以上
  icon_hash: string,  //icon_hash, 返回的icon_hash值,权限：商业版本及以上
  certs_valid: string,  //certs_valid,证书是否有效,权限：商业版本及以上
  cname_domain: string,  //cname_domain,cname的域名,权限：商业版本及以上
  body: string,  //body,网站正文内容,权限：商业版本及以上
  icon: string,  //icon,icon 图标,权限：企业会员
  fid: string,  //fid, fid,权限：企业会员
  structinfo: string,  //structinfo,结构化信息(部分协议支持、比如elastic、mongodb),权限：企业会员
}

export interface FofaQueryDataType extends RequestDataType {
  fields: string,
  full: boolean
}

export interface FofaQueryResult extends ResponseDataType<FofaItemType[]> {
  id: string
  maxPage: number
}

export interface FofaExportDataReqBody extends ExportDataReqBody {
  fields: string;
}



export interface QuakeQueryReqBody extends RequestDataType {
  "rule": string,
  "ipList": string[],
  "ignoreCache": boolean,
  "startTime": string,
  "endTime": string,
  "include": string[],
  "exclude": string[],
  "latest": boolean,
}

export interface ZoneSiteItemType {
  ip: string,
  port: string,
  url: string,
  title: string,
  status_code: string,
  cms: string,
  city: string,
  continent: string,
  country: string,
  operator: string,
  province: string,
  banner: string,
  html_banner: string,
  group: string,
  beian: string,
  is_cdn: number,
  ssl_certificate: string,
  service: string,
}

export interface ZoneSiteQueryResult extends ResponseDataType<ZoneSiteItemType[]> {
  id: string
  maxPage: number
}

export interface ZoneDomainItemType {
  ip: string
  icp: string
  company: string  //公司名称 有可能是[]string,取第一个转为string
  url: string //子域名
}

export interface ZoneDomainQueryResult extends ResponseDataType<ZoneDomainItemType[]> {
  id: string
  maxPage: number
}
//"微信小程序" "微信公众号(含小程序)"
export type MsgOfWechatType = {
  iconUrl: string    //logo
  code: string   //公众号二维码
  introduction: string,//描述/说明
  mini_program: {
    appid: string,
    certified_text: string, //账号主体
    desc: string,           //描述
    headimg_url: string,  //favicon
    nickname: string,
  }[]
  wechat_id: string //微信公众号id
}

// 微信小程序
export type MsgOfMiniProgramType = {
  iconUrl: string //logo
  code: string //公众号二维码
  introduction: string //描述/说明
  app_id: string //微信公众号id
}

// 安卓apk
export type MsgOfApkType = {
  app_url: string
  iconUrl: string
  introduction: string
}

export type ZoneApkItemType = {
  title: string
  company: string
  type: "微信小程序" | "微信公众号" | "微信公众号(含小程序)" | "安卓apk"
  source: string
  timestamp: string
  msg: MsgOfWechatType | MsgOfMiniProgramType | MsgOfApkType //对应上述三种可能的结构体
}

export interface ZoneApkQueryResult extends ResponseDataType<ZoneApkItemType[]> {
  id: string
  maxPage: number
}

export interface ZoneEmailItemType {
  email: string
  email_type: string
  group: string//所属集团
  source: string[]//来源 
  timestamp: string//更新时间
}

export interface ZoneEmailQueryResult extends ResponseDataType<ZoneEmailItemType[]> {
  id: string
  maxPage: number
}

export interface ZoneMemberItemType {
  name: string
  position: string[]
  introduction: string
  source: string    //来源
  timestamp: string   //入库时间
  company: string   //所属集团
}

export interface ZoneMemberQueryResult extends ResponseDataType<ZoneMemberItemType[]> {
  id: string
  maxPage: number
}

export interface ZoneCodeItemType {
  _id: string//文件名
  name: string//文件名
  path: string
  url: string//文件链接
  sha: string
  keyword: string[]
  tags: string[]
  file_extension: string
  source: string//来源
  code_detail: string//代码详情
  score: number//风险指数
  type: string//文件种类
  created_time: string
  timestamp: string
  owner: {
    id: string
    login: string
    url: string
    avatar_url: string
  }
  repository: {
    id: number
    name: string//项目名
    description: string//readme文件
    node_id: string//节点ID base64
    fork: boolean;
    private: boolean
    url: string//api查看链接 https://api.github.com/repos/username/repository
  }
  detail_parsing: {
    phone_list: string[]
    telegram_list: string[]
    email_list: string[]
    domain_list: string[]
    ip_list: string[]
    wangpan_list: string[]
  }
  timestamp_update: string
  related_company: string[]
}

export type ZoneCodeDetailParsingType = "phone_list" | "telegram_list" | "email_list" | "domain_list" | "ip_list" | "wangpan_list"

export interface ZoneCodeQueryResult extends ResponseDataType<ZoneCodeItemType[]> {
  id: string
  maxPage: number
}

export interface ZoneDarknetItemType {
  _id: string
  body_md5: string
  msg: {
    num_sales?: number,
    quantity?: string
    daily_time?: string
    author?: string
    price?: string
    daily?: string
    title_cn?: string
    description?: string
    keyword?: string[]
    release_time?: string
    example?: string
  }
  status_code?: number
  regions?: {
    country?: string
    province?: string
    city?: string
  }[]
  org?: string[]
  page_type?: string[]
  root_domain?: string
  detail_parsing: {
    email_list?: string[]
    wangpan_list?: string[]
    phone_list?: string[]
    domain_list?: string[]
    ip_list?: string[]
    keyword?: string[]
    telegram_list?: string[]
  }
  to_new?: string
  description?: string
  industry?: string[]
  language?: string[]
  source?: string
  title?: string
  hot?: string
  url?: string
  tags?: string[]
  path?: string
  update_time?: string
  toplv_domain?: string
  user_id?: string[]
  event?: string[]
  timestamp?: string
}

export interface ZoneDarknetQueryResult extends ResponseDataType<ZoneDarknetItemType[]> {
  id: string
  maxPage: number
}

export interface ZoneTGItemType {
  ip: string
  icp: string
  company: string  //公司名称 有可能是[]string,取第一个转为string
  url: string //子域名
}

export interface ZoneTGQueryResult extends ResponseDataType<ZoneTGItemType[]> {
  id: string
  maxPage: number
}

export type ExportStatusType = {
  error: Error
  filename: string
  message: string
}

export type ProxyType = {
  type: string
  host: string,
  port: string,
  user: string,
  pass: string,
  enable: boolean
}

export type FofaAuthType = {
  email: string
  key: string
}

export type HunterAuthType = {
  key: string
}

export type ZoneAuthType = {
  key: string
}

export type QuakeAuthType = {
  key: string
}

export type AuthType = {
  "fofa": FofaAuthType
  "hunter": HunterAuthType
  "0.zone": ZoneAuthType
  "quake": QuakeAuthType
}

export type NotificationFuncType = () => void;

export type ContextType = {
  Notification: NotificationFuncType;
  Auth: AuthType
};


export type HunterUserType = {
  accountType: string,
  consumeQuota: number
  restQuota: number
}
export type FofaUserType = {
  email: string,
  username: string,
  category: string,
  fcoin: number,
  fofa_point: number,
  remain_free_point: number,
  remain_api_query: number,
  remain_api_data: number,
  isvip: boolean,
  vip_level: number,
  is_verified: boolean,
  avatar: string,
  message: string,
  fofacli_ver: string,
  fofa_server: boolean,
}


export const QUERY_FIRST = "查询后再导出"
export const ISSUE_URL = "https://github.com/fasnow/fine/issues"
export const GITHUB_URL = "https://github.com/fasnow/fine/"

export enum MenuItemsKey {
  OpenUrl = "openUrl",
  OpenDomain = "openDomain",
  OpenRedirect = "openRedirect",
  CopyCell = "copyCell",
  CopyCol = "copyCol",
  CopyRow = "copyRow",
  IpCidr = "ipCidr",
  Ip = "ip",
  ExportData = "exportData"
}

export const copy = (value: any) => {
  if (!value) {
    copyToClipboard(value)
    return
  }
  const valueType = typeof value
  if (valueType == "string") {
    copyToClipboard(value)
  } else if (valueType == "number" || valueType == "boolean") {
    copyToClipboard(value.toString())
  } else if (value instanceof Array) {
    const values = value.map((item) => {
      if (!item) {
        return ""
      }
      const itemType = typeof item
      if (itemType == "string") {
        return item
      } else if (itemType == "number" || itemType == "boolean") {
        return item.toString()
      } else {
        return JSON.stringify(item)
      }
    })
    copyToClipboard(values.join("\n"))
  }
  else {
    copyToClipboard(JSON.stringify(value))
  }
}