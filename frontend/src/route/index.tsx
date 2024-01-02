import { createHashRouter } from 'react-router-dom';
import Icp from '../pages/domain/Icp';
import {Setting} from '../pages/setting/Setting';
import Layout from '../pages/Layout';
import NotFound from '../pages/Notfound';
import KeepAlive from 'react-activation';
import Fofa from '../pages/assetsmap/Fofa';
import Quake from '../pages/assetsmap/Quake';
import Hunter from '../pages/assetsmap/Hunter';
import Zone from '../pages/assetsmap/Zone';
import BatchHttp from '../pages/batchhttp/BatchHttp';
import Aggregate from '../pages/assetsmap/Aggregate';
import Zoomeye from '../pages/assetsmap/Zoomeye';
import Test from '../pages/Test';
import Encode from '../pages/encode/Encode';
import Domain from '../pages/domain/Domain';
import TianYanCha from '../pages/unitmap/TianYanCha';

const Router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "setting",
        element: <Setting />
      },
      {
        path: "http",
        element: <KeepAlive id="http"><BatchHttp /></KeepAlive>
      },
      {
        path: "icp",
        element: <Icp />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  },
])


// react-activation缓存路由
const ReactActivationRouter = createHashRouter([
  {
    path: "/",
    element: <KeepAlive id="Layout"><Layout /></KeepAlive>,
    children: [
      {
        path: "setting",
        element: <KeepAlive id="setting"><Setting /></KeepAlive>
      },
      {
        path: "http",
        element: <KeepAlive id="http"><BatchHttp /></KeepAlive>
      },
      {
        path: "tianyancha",
        element: <KeepAlive id="icp"><TianYanCha /></KeepAlive>
      },
      {
        path: "domain",
        element: <KeepAlive id="icp"><Domain /></KeepAlive>
      },
      {
        path: "encode",
        element: <KeepAlive id="encode"><Encode /></KeepAlive>
      },
      {
        path: "aggregate",
        element: <KeepAlive id="aggregate"><Aggregate /></KeepAlive>
      },
      {
        path: "fofa",
        element: <KeepAlive id="fofa"><Fofa /></KeepAlive>
      },
      {
        path: "hunter",
        element: <KeepAlive id="hunter"><Hunter /></KeepAlive>
      },
      {
        path: "0.zone",
        element: <KeepAlive id="zone"><Zone /></KeepAlive>
      },
      {
        path: "quake",
        element: <KeepAlive id="quake"><Quake /></KeepAlive>
      },
      {
        path: "zoomeye",
        element: <KeepAlive id="zoomeye"><Zoomeye /></KeepAlive>
      },
      {
        path: "test",
        element: <KeepAlive id="test"><Test /></KeepAlive>
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  },
])

export { Router, ReactActivationRouter };
