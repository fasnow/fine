import { RouterProvider } from 'react-router-dom';
import { AliveScope } from 'react-activation';
import { Freeze } from 'react-freeze';
import { ReactActivationRouter, Router } from './route';
import { Provider } from "react-redux";
import store from './store/store';
// 无路由缓存
const App: React.FC = () => {
  return (
    // <React.StrictMode> //调试使用
    <RouterProvider router={Router} />
    // </React.StrictMode>
  )
}

// 使用react-activation进行路由缓存,但是不使用Freeze会造成频闪（多次渲染），使用的话react会降级到v17
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

// const AppWithReactActivation: React.FC = () => {
//   return (
//     <AliveScope><Freeze freeze={false}><RouterProvider router={ReactActivationRouter} /></Freeze></AliveScope>)
// }

export { App, AppWithReactActivation }