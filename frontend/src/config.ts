enum Name {
    FOFA = "Fofa",
    ZONE = "0.zone",
    QUAKE = "Quake",
    HUNTER = "Hunter",
}

export const NAME_FOFA = "Fofa"
export const NAME_ZONE = "0.zone"
export const NAME_QUAKE = "Quake"
export const NAME_HUNTER = "Hunter"

export const TITLE_TYPE_SITE = "site"
export const TITLE_TYPE_APK = "apk"
export const TITLE_TYPE_DOMAIN = "domain"
export const TITLE_TYPE_EMAIL = "email"
export const TITLE_TYPE_DARKNET = "darknet"
export const TITLE_TYPE_MEMBER = "member"
export const TITLE_TYPE_CODE = "code"
export const TITLE_TYPE_AIM = "telegram"


export const ERROR_NO_DARKNET_PRIV = "该 API Key 没有 darknet 类型数据访问权限"
export const ERROR_NO_CODE_PRIV = "该 API Key 没有 code 类型数据访问权限"
export const ERROR_NO_SITE_PRIV = "该 API Key 没有 site 类型数据访问权限"
export const ERROR_NO_APK_PRIV = "该 API Key 没有 apk 类型数据访问权限"
export const ERROR_NO_MEMBER_PRIV = "该 API Key 没有 member 类型数据访问权限"
export const ERROR_NO_EMAIL_PRIV = "该 API Key 没有 email 类型数据访问权限"
export const ERROR_NO_DOMAIN_PRIV = "非企业会员不支持使用 type: domain 查询，请先购买"

export const Realtime_Service_Data = 1
export const Realtime_Host_Data = 2
export const Deep_Service_Data = 3
export const Deep_Host_Data = 4
export const Aggregation_Service_Data = 5
export const Aggregation_Host_Data = 6

export const Code_WsOk = 200
export const Code_FofaAuth_Error = 1101
export const Code_HunterAuth_Error = 1102
export const Code_ZoneAuth_Error = 1103
export const Code_QuakeAuth_Error = 1104
export const Code_FofaQuery_Error = 1201
export const Code_HunterQuery_Error = 1202
export const Code_ZoneQuery_Error = 1203
export const Code_QuakeQuery_Error = 1204
export const Code_TianYanQuery_Error = 1205
export const Code_IcpQuery_Error = 1206
export const Code_WsRead_Error = 1301
export const Code_WsWrite_Error = 1302
export const Code_NotJsonFormat_Error = 1401
export const Code_NotSpecifiedJsonFormat_Error = 1402
export const Code_Other_Error = 1999

export const MSG_STOP_OR_WAIT_FOR_END = "请先中止或者等待执行完毕再导出"
export const MSG_QUERY_FIRST_OR_NO_DATA_TO_EXPORT = "查询后再导出或无数据可导出"

export const server = {
    defaultPort: 9321,
    baseURL: `http://192.168.31.85:9323/api`,
    baseWS: `ws://localhost:9323/api`,
}
