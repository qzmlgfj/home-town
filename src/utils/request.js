import axios from 'axios';
import {ElMessage} from "element-plus";

const service = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    // easy-mock服务挂了，暂时不使用了
    baseURL: 'http://192.168.40.151:8081',
    timeout: 5000,
});

service.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        ElMessage.error("请求失败："+error);
        return Promise.reject();
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
