import { ResponseDataType } from "."

export type RequestDataType = {
    query: string
    rule: string
    ipList: string[]
    page: number
    size: number
    ignoreCache: boolean
    startTime: string
    endTime: string
    include: string[]
    exclude: string[]
    latest?: boolean      //仅用于实时服务数据查询
}

export type QueryType  = "service"|"host"|"aggregationService"|"aggregationHost"|"deepService"|"deepHost"

export type ComponentType = {
    product_level: string
    product_type: string[]
    product_vendor: string
    product_name_cn: string
    components: string
    id: string
    version: string
    product_catalog: string[]
}

export type HttpType = {
    server: string
    status_code: string | number     //200 or 暂无权限
    title: string
    host: string
    path: string
}
export type ServiceType = {
    response: string
    //TLSJarm  struct { //该字段为string或者struct
    //	JarmHash string   
    //	JarmAns  []string 
    //} 
    response_hash: string
    name: string
    http: HttpType
    cert: string
}

export type  LocationType = {
    owner: string
    province_cn: string
    province_en: string
    isp: string     //运营商
    country_en: string
    district_cn: string
    gps: number[]
    street_cn: string
    city_en: string
    district_en: string
    country_cn: string
    street_en: string
    city_cn: string
    country_code: string
    asname: string
    scene_cn: string
    scene_en: string
    radius: number
}
export type RSDItem = {
    components: ComponentType[]
    org: string  //自治域
    ip: string
    os_version: string
    is_ipv6: boolean
    transport: string
    hostname: string
    port: number
    service: ServiceType
    domain: string
    os_name: string
    location: LocationType
    time: string
    asn: number        //自治域编号
}


export interface RSDQueryResult extends ResponseDataType<RSDItem[]> {
    id: string
    maxPage: number
}


export type UserType = {
    id: string
    user: {
        id: string
        username: string
        fullname: string
        email: string
        group: string[]
    }
    baned: boolean
    ban_status: string
    month_remaining_credit: number
    constant_credit: number
    credit: number
    persistent_credit: number
    free_query_api_count: number
    avatar_id: string
    token: string
    mobile_phone: string
    source: string
    time: string
    disable: {
        disable_time: string
        start_time: string
    }
    privacy_log: {
        quake_log_status: boolean
        quake_log_time: string
        anonymous_model: boolean
        status: boolean
        time: string
    }
    enterprise_information: {
        name: string
        email: string
        status: string
    }
    invitation_code_info: {
        code: string
        invite_acquire_credit: number
        invite_number: number
    }
    is_cashed_invitation_code: boolean
    role_validity: {
        "注册用户": string
    }
    personal_information_status: boolean
    role: {
        fullname: string
        priority: number
        credit: number
    }[]
}