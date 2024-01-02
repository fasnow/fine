import { RequestDataType, ResponseDataType } from "."

export interface HunterComponentType {
    name: string,//组件名称
    version: string,//组件版本
}

export interface HunterItemType {
    is_risk: string,//风险资产
    url: string,//url
    ip: string,//IP
    port: number,//端口
    web_title: string,//网站标题
    domain: string,//域名
    is_risk_protocol: string,//高危协议
    protocol: string,//协议
    base_protocol: string,//通讯协议
    status_code: number,//网站状态码
    component: HunterComponentType[],
    os: string,//操作系统
    company: string,//备案单位
    number: string,//备案号
    country: string,//国家
    province: string,//省份
    city: string,//市区
    updated_at: string,//探查时间
    is_web: string,//web资产
    as_org: string,//	注册机构
    isp: string, //	运营商信息
    banner: string,
}

export interface HunterQueryDataType extends RequestDataType {
    isWeb: number,
    startTime: string,
    endTime: string,
    statusCode: string,
    portFilter: boolean
}

export interface HunterQueryResult extends ResponseDataType<HunterItemType[]> {
    id: string
    maxPage: number
    accountType: string //账号类型
    consumeQuota: number//消耗积分
    restQuota: number//今日剩余积分
    syntaxPrompt: string
}