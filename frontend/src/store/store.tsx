import { configureStore, createSlice } from "@reduxjs/toolkit"
import {application, fofa, hunter, quake, shodan} from "../../wailsjs/go/models";

const initialFofaUserState: fofa.User ={} as fofa.User

const initialHunterUserState: hunter.User = {} as hunter.User

const initialQuakeUserState: quake.User = {} as quake.User

const initialShodanUserState: shodan.User = {} as shodan.User

const t = new application.Constant()

const {convertValues, ...rest} = t // 把不能序列化的去除掉

const appSlice = createSlice({
    //切片名称
    name: "app",
    //初始值
    initialState: {
        global: rest as application.Constant,
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
        quake:initialQuakeUserState,
        shodan:initialShodanUserState,
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
        setShodanUser: (state, action) => {
            state.shodan = action.payload
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