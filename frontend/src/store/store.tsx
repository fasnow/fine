import { configureStore, createSlice } from "@reduxjs/toolkit"
import { AuthType, FofaAuthType, HunterAuthType, ProxyType, QuakeAuthType, ZoneAuthType, DownloadLogItem, FofaUserType, HunterUserType } from "../type"
import { UserType as QuakeUserType } from "../type/quake"

const initialAuthState: AuthType = {
    fofa: {
        email: "",
        key: ""
    },
    hunter: {
        key: ""
    },
    "0.zone": {
        key: ""
    },
    quake: {
        key: ""
    }
}

const initialProxyState: ProxyType = {
    type: "",
    host: "",
    port: "",
    user: "",
    pass: "",
    enable: false
}

const initialFofaUserState: FofaUserType = {
    email: "",
    username: "",
    category: "",
    fcoin: 0,
    fofa_point: 0,
    remain_free_point: 0,
    remain_api_query: 0,
    remain_api_data: 0,
    isvip: false,
    vip_level: 0,
    is_verified: false,
    avatar: "",
    message: "",
    fofacli_ver: "",
    fofa_server: false
}

const initialHunterUserState: HunterUserType = {
    accountType: "",
    consumeQuota: 0,
    restQuota: 0
}
const initialQuakeUserState: QuakeUserType = {
    id: "",
    user: {
        id: "",
        username: "",
        fullname: "",
        email: undefined,
        group: []
    },
    baned: false,
    ban_status: "",
    month_remaining_credit: 0,
    constant_credit: 0,
    credit: 0,
    persistent_credit: 0,
    free_query_api_count: 0,
    avatar_id: "",
    token: "",
    mobile_phone: "",
    source: "",
    time: "",
    disable: {
        disable_time: "",
        start_time: ""
    },
    privacy_log: {
        quake_log_status: false,
        quake_log_time: "",
        anonymous_model: false,
        status: false,
        time: ""
    },
    enterprise_information: {
        name: "",
        email: "",
        status: ""
    },
    invitation_code_info: {
        code: "",
        invite_acquire_credit: 0,
        invite_number: 0
    },
    is_cashed_invitation_code: false,
    role_validity: {
        注册用户: ""
    },
    personal_information_status: false,
    role: []
}


const configSlice = createSlice({
    //切片名称
    name: "config",
    //初始值
    initialState: {
        auth: initialAuthState,
        proxy: initialProxyState
    },
    //方法
    reducers: {
        setAuth: (state, action: {
            payload: {
                fofa: FofaAuthType,
                hunter: HunterAuthType,
                "0.zone": ZoneAuthType,
                quake: QuakeAuthType
            }
            , type: string
        }) => {
            state.auth.fofa = action.payload.fofa
            state.auth.hunter = action.payload.hunter
            state.auth["0.zone"] = action.payload["0.zone"]
            state.auth.quake = action.payload.quake
        },
        setFofaAuth: (state, action: { payload: FofaAuthType, type: string }) => {
            state.auth.fofa = action.payload
        },
        setHunterAuth: (state, action: { payload: HunterAuthType, type: string }) => {
            state.auth.hunter = action.payload
        },
        setZoneAuth: (state, action: { payload: FofaAuthType, type: string }) => {
            state.auth["0.zone"] = action.payload
        },
        setQuakeAuth: (state, action: { payload: QuakeAuthType, type: string }) => {
            state.auth.quake = action.payload
        },
        setProxy: (state, action: { payload: ProxyType, type: string }) => {
            state.proxy = action.payload
        },
    }
})

const userSlice = createSlice({
    //切片名称
    name: "user",
    //初始值
    initialState: {
        fofa: initialFofaUserState,
        hunter: initialHunterUserState,
        quake:initialQuakeUserState
    },
    //方法
    reducers: {
        setFofaUser: (state, action: {
            payload: FofaUserType, 
            type: string
        }) => {
            state.fofa = action.payload
        },
        setHunterUser: (state, action: {
            payload: HunterUserType, 
            type: string
        }) => {
            state.hunter = action.payload
        },
        setQuakeUser: (state, action: {
            payload: QuakeUserType, 
            type: string
        }) => {
            state.quake = action.payload
        },
    }
})

const initialDownloadLogState: DownloadLogItem[] = []

const downloadLogSlice = createSlice({
    //切片名称
    name: "downloadLog",
    //初始值
    initialState: {
        log: initialDownloadLogState,
        hasNewItem:false
    },
    //方法
    reducers: {
        setDownloadLog: (state, action: {payload:DownloadLogItem[],type:string}) => {
            state.log = action.payload
        },
        addDownloadLog: (state, action: {payload:DownloadLogItem,type:string}) => {
            state.log.push(action.payload)
        },
        setHasNewLogItem: (state, action: {payload:boolean,type:string}) => {
            state.hasNewItem=action.payload
        },
    }
})

const serverStatusSlice = createSlice({
    //切片名称
    name: "serverStatus",
    //初始值
    initialState: {
        available: false,
    },
    //方法
    reducers: {
        setServerStarted: (state, action: {payload:boolean,type:string}) => {
            state.available = action.payload
        },
    }
})

export const { setAuth, setFofaAuth, setHunterAuth, setZoneAuth, setQuakeAuth, setProxy } = configSlice.actions
export const { setDownloadLog, addDownloadLog,setHasNewLogItem } = downloadLogSlice.actions
export const { setFofaUser,setHunterUser,setQuakeUser } = userSlice.actions
export const { setServerStarted } = serverStatusSlice.actions
const store = configureStore({
    reducer: {
        config: configSlice.reducer,
        downloadLog: downloadLogSlice.reducer,
        user:userSlice.reducer,
        server:serverStatusSlice.reducer
    }
})

export type RootState = ReturnType<typeof store.getState>;

export default store


