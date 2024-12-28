import { configureStore, createSlice } from "@reduxjs/toolkit"
import {app, config, constant, fofa, quake} from "../../wailsjs/go/models";
import Status = constant.Status;
import Event = constant.Event;
import History = constant.History;

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
    role: quake.UserRole[];
}


export interface DownloadLogItem {
    filename: string,
    dir: string,
    exist?: boolean
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

const t = new app.Constant()

const {convertValues, ...rest} = t // 把不能序列化的去除掉

const appSlice = createSlice({
    //切片名称
    name: "app",
    //初始值
    initialState: {
        global: rest as app.Constant,
    } ,
    //方法
    reducers: {
        setGlobal: (state, action) => {
            state.global.config = action.payload.config
            state.global.event = action.payload.event
            state.global.status = action.payload.status
            state.global.history = action.payload.history
        },
        setEvent: (state, action) => {
            state.global.event = action.payload
        },
        setStatus: (state, action) => {
            state.global.status = action.payload
        },
        setHistory: (state, action) => {
            state.global.history = action.payload
        },
        setConfig: (state, action) => {
            state.global.config = action.payload
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
        setFofaUser: (state, action) => {
            state.fofa = action.payload
        },
        setHunterUser: (state, action) => {
            state.hunter = action.payload
        },
        setQuakeUser: (state, action) => {
            state.quake = action.payload
        },
    }
})

export const appActions = appSlice.actions

export const userActions = userSlice.actions

const store = configureStore({
    reducer: {
        app: appSlice.reducer,
        user: userSlice.reducer,//主要用于存储剩余token
    }
})

export type RootState = ReturnType<typeof store.getState>;

export default store