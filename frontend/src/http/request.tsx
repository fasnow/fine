import axios from 'axios'
import { server } from '../config'
import { stringify } from 'querystring';
// 创建axios实例
export const req = axios.create({
    baseURL: server.baseURL,// 所有的请求地址前缀部分
    timeout: 80000, // 请求超时时间(毫秒)
    // withCredentials: true,// 异步请求携带cookie
    // headers: {
    // 设置后端需要的传参类型
    // 'Content-Type': 'application/json',
    // 'token': x-auth-token',//一开始就要token
    // 'X-Requested-With': 'XMLHttpRequest',
    // },
})

// request拦截器
req.interceptors.request.use(
    config => {
        // 如果你要去localStor获取token
        // let token = localStorage.getItem("x-auth-token");
        // if (token) {
        //     config.headers = {"x-auth-token": token}
        // }
        if (config.url && config.url.startsWith('/config/')) {
            config.timeout = 500; // 获取配置和保存是从本地的，设置超时时间为0.5秒
        }
        return config;
    },
    error => {
        // 对请求错误做些什么
        Promise.reject(error)
    }
)

// response 拦截器
req.interceptors.response.use(
    response => {
      // 对响应数据做点什么
      if (response.status === 200 && response.config.responseType === 'arraybuffer') {
        if (response.headers['content-type'] !== undefined && response.headers['content-type'].includes('json')) {
          return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            const arrayBuffer = response.data;
            const blob = new Blob([arrayBuffer]);
            fileReader.readAsText(blob);
            fileReader.onload = function (result) {
              if (result.target != null && result.target.result != null) {
                if (typeof result.target.result === 'string') {
                  reject(new Error(result.target.result));
                } else {
                  resolve(response);
                }
              }
            };
            // fileReader.onerror = function () {
            //   reject(new Error('Failed to read file.'));
            // };
          });
        }
        return response;
      } else {
        return response;
      }
    },
    error => {
      return Promise.reject(error);
    }
  );
  
export default req