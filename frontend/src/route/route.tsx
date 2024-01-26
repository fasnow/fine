import { createHashRouter } from 'react-router-dom';
import KeepAlive from 'react-activation';
import NotFound from "../pages/Notfound";
import React from "react";
import store from "@/store/store";
import { Provider } from "react-redux";
import { AliveScope } from 'react-activation';
import { Freeze } from 'react-freeze';
import { RouterProvider } from 'react-router-dom';
import {Setting} from "@/pages/setting/Setting";
import Domain from "../pages/domain/Domain";
import Icp from "@/pages/domain/Icp";
import IP138 from "@/pages/Ip138";
import Fofa from "@/pages/assets/Fofa";
import App from '@/App';
import Hunter from "@/pages/assets/Hunter";
// import Fofa from "../pages/domain/Fofa";
const Router = createHashRouter([
    {
        path: "/",
        element: <App />,
        children: [
            // {
            //     path: "setting",
            //     element: <Setting />
            // },
            // {
            //     path: "http",
            //     element: <KeepAlive id="http"><BatchHttp /></KeepAlive>
            // },
            // {
            //     path: "icp",
            //     element: <Icp />
            // },
            // {
            //     path: "*",
            //     element: <NotFound />
            // }
        ]
    },
])


// react-activation缓存路由
const ReactActivationRouter = createHashRouter([
    {
        path: "/",
        element: <KeepAlive id="layout"><App /></KeepAlive>,
        children: [
            {
                path: "setting",
                element: <Setting />
            },
            // {
            //     path: "http",
            //     element: <KeepAlive id="http"><BatchHttp /></KeepAlive>
            // },
            // {
            //     path: "tianyancha",
            //     element: <KeepAlive id="icp"><TianYanCha /></KeepAlive>
            // },
            {
                path: "icp",
                element: <KeepAlive id="icp"><Icp /></KeepAlive>
            },
            {
                path: "ip138",
                element: <KeepAlive id="ip138"><IP138 /></KeepAlive>
            },
            // {
            //     path: "encode",
            //     element: <KeepAlive id="encode"><Encode /></KeepAlive>
            // },
            // {
            //     path: "aggregate",
            //     element: <KeepAlive id="aggregate"><Aggregate /></KeepAlive>
            // },
            {
                path: "fofa",
                element: <KeepAlive id="fofa"><Fofa /></KeepAlive>
            },
            {
                path: "hunter",
                element: <KeepAlive id="hunter"><Hunter /></KeepAlive>
            },
            // {
            //     path: "0.zone",
            //     element: <KeepAlive id="zone"><Zone /></KeepAlive>
            // },
            // {
            //     path: "quake",
            //     element: <KeepAlive id="quake"><Quake /></KeepAlive>
            // },
            // {
            //     path: "zoomeye",
            //     element: <KeepAlive id="zoomeye"><Zoomeye /></KeepAlive>
            // },
            // {
            //     path: "test",
            //     element: <KeepAlive id="test"><Test /></KeepAlive>
            // },
            {
                path: "*",
                element: <NotFound />
            }
        ]
    },
])


const RawApp: React.FC = () => {
    return (
        // <React.StrictMode> //调试使用
        <RouterProvider router={Router} />
        // </React.StrictMode>
    )
}

const AppWithReactActivation: React.FC = () => {
    return (
        <Provider store={store} >
            <AliveScope>
                <Freeze freeze={false}>
                    <RouterProvider router={ReactActivationRouter} />
                </Freeze>
            </AliveScope>
        </Provider>
    )
}

export {App,AppWithReactActivation };
