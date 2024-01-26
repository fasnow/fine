import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import {render} from "react-dom";
import {App, AppWithReactActivation} from "@/route/route";


const root = document.getElementById('root')
if(root==null){
    console.log(111)
}else {
    render(<AppWithReactActivation/>, root);//react 17 但是显示无bug
}
// const container = document.getElementById('root')
// const root = createRoot(container!)
//
// root.render(
//     <AppWithReactActivation/>
// )
