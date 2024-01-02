
export type ItemType = {
    method: string
    url: string
    status_code: number
    title: string,
    length: number
    redirect: string
    re_status_code: number
    re_title: string
    re_length: number

}

export type RequestDataType = {
    redirect: boolean
    timeout: number
    coroutineCount: number
    urls: string[]
    methods: string[]
    data: string
    headers: string
    isCustomHeaders: boolean
}