import { configureStore, createSlice } from "@reduxjs/toolkit"
import {config, fofa, quake} from "../../wailsjs/go/models";
import UserRole = quake.UserRole;

export type HunterUserType = {
    restToken: number
}

export type QuakeUserType = {
    id: string;
    // Go type: struct { ID string "json:\"id\""; Username string "json:\"username\""; Fullname string "json:\"fullname\""; Email interface {} "json:\"email\""; Group []string "json:\"group\"" }
    user: any;
    baned: boolean;
    ban_status: string;
    month_remaining_credit: number;
    constant_credit: number;
    credit: number;
    persistent_credit: number;
    free_query_api_count: number;
    avatar_id: string;
    token: string;
    mobile_phone: string;
    source: string;
    time: string;
    // Go type: struct { DisableTime interface {} "json:\"disable_time\""; StartTime interface {} "json:\"start_time\"" }
    disable: any;
    // Go type: struct { QuakeLogStatus bool "json:\"quake_log_status\""; QuakeLogTime interface {} "json:\"quake_log_time\""; AnonymousModel bool "json:\"anonymous_model\""; Status bool "json:\"status\""; Time interface {} "json:\"time\"" }
    privacy_log: any;
    // Go type: struct { Name interface {} "json:\"name\""; Email interface {} "json:\"email\""; Status string "json:\"status\"" }
    enterprise_information: any;
    // Go type: struct { Code string "json:\"code\""; InviteAcquireCredit int "json:\"invite_acquire_credit\""; InviteNumber int "json:\"invite_number\"" }
    invitation_code_info: any;
    is_cashed_invitation_code: boolean;
    // Go type: struct { NamingFailed interface {} "json:\"注册用户\"" }
    role_validity: any;
    personal_information_status: boolean;
    role: UserRole[];
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

export interface DownloadLogItem {
    filename: string,
    dir: string,
    exist?: boolean
}

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

const initialProxyState: config.Proxy = {
    type: "",
    host: "",
    port: "",
    user: "",
    pass: "",
    enable: false
}

const initialFofaUserState: fofa.User = {
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
    restToken: 0
}

const initialQuakeUserState: QuakeUserType = {
    id: "",
    // Go type: struct { ID string "json:\"id\""; Username string "json:\"username\""; Fullname string "json:\"fullname\""; Email interface {} "json:\"email\""; Group []string "json:\"group\"" }
    user: {},
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
    // Go type: struct { DisableTime interface {} "json:\"disable_time\""; StartTime interface {} "json:\"start_time\"" }
    disable: {},
    // Go type: struct { QuakeLogStatus bool "json:\"quake_log_status\""; QuakeLogTime interface {} "json:\"quake_log_time\""; AnonymousModel bool "json:\"anonymous_model\""; Status bool "json:\"status\""; Time interface {} "json:\"time\"" }
    privacy_log: {},
    // Go type: struct { Name interface {} "json:\"name\""; Email interface {} "json:\"email\""; Status string "json:\"status\"" }
    enterprise_information: {},
    // Go type: struct { Code string "json:\"code\""; InviteAcquireCredit int "json:\"invite_acquire_credit\""; InviteNumber int "json:\"invite_number\"" }
    invitation_code_info: {},
    is_cashed_invitation_code: false,
    // Go type: struct { NamingFailed interface {} "json:\"注册用户\"" }
    role_validity: {},
    personal_information_status: false,
    role: [],
}

const initialDownloadLogState: DownloadLogItem[] = []

const initialHttpxState: config.Httpx = {
    path:"",
    flags:""
}

const configSlice = createSlice({
    //切片名称
    name: "config",
    //初始值
    initialState: {
        auth: initialAuthState,
        proxy: initialProxyState,
        httpx: initialHttpxState,
    } ,
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
        setProxy: (state, action: { payload: config.Proxy, type: string }) => {
            state.proxy = action.payload
        },
        setHttpx: (state, action: { payload: config.Httpx, type: string }) => {
            state.httpx = action.payload
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
            payload: fofa.User,
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
            payload: quake.User,
            type: string
        }) => {
            state.quake = action.payload
        },
    }
})

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

export const { setAuth, setFofaAuth, setHunterAuth, setZoneAuth, setQuakeAuth, setProxy,setHttpx } = configSlice.actions

export const { setDownloadLog, addDownloadLog,setHasNewLogItem } = downloadLogSlice.actions

export const { setFofaUser,setHunterUser,
    setQuakeUser
} = userSlice.actions

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


