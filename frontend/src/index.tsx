import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import {App as ANTDApp} from "antd";
import {createHashRouter, RouterProvider} from "react-router-dom";
import KeepAlive, {AliveScope} from "react-activation";
import {Provider} from "react-redux";
import store from "@/store/store";
import {Freeze} from "react-freeze";
import App from "@/App";

const ReactActivationRouter = createHashRouter([
    {
        path: "/",
        element: <KeepAlive id="layout"><App /></KeepAlive>,
    },
])

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
// const root = document.getElementById('root')
// if(root==null){
//     console.log(111)
// }else {
//     render(<AppWithReactActivation/>, root);//react 17 但是显示无bug
// }

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
    <Provider store={store} >
        <App/>
    </Provider>
)


