import axios from 'axios';
import {ElMessage} from "element-plus";

//重连次数
axios.defaults.retry = 3;
//重连间隔
axios.defaults.retryDelay = 1000;
const service = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    // easy-mock服务挂了，暂时不使用了
    baseURL: 'http://192.168.40.151:8081',
    timeout: 3000,
});

service.interceptors.request.use(
    config => {
        return config;
    },
    //重连机制
    function axiosRetryInterceptor(error) {
        var config = error.config;
        if (!config || !config.retry) return Promise.reject(error);

        config.__retryCount = config.__retryCount || 0;
        if (config.__retryCount >= config.retry) {
            ElMessage("网络连接失败:"+error);
            return Promise.reject(error);
        }
        config.__retryCount += 1;
        var backoff = new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, config.retryDelay || 1);
        });
        return backoff.then(function () {
            return axios(config);
        });
    }
);

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response.data;
        } else {
            return Promise.reject()
        }
    },
    error => {
        ElMessage.error(error);
        return Promise.reject();
    }
);

export default service;
