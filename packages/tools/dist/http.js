/**
 * 支持 Oauth2 认证的 Axios 配置
 * - 自动添加 accessToken
 * - 自动在认证过期后，重新刷新 token 并重放接口
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import { message } from 'antd';
import { locationTo } from './utils';
/**
 *
 * @param config 可覆盖 Axios 实例默认配置
 * @returns AxiosInstance
 */
function createAxiosInstance(config = {}) {
    // 用作刷新 token 后重新发起请求
    let refreshing = false;
    const queue = [];
    const axiosInstance = axios.create(Object.assign({ baseURL: 'http://localhost:9999/', timeout: 3000 }, config));
    const refreshToken = () => __awaiter(this, void 0, void 0, function* () {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            locationTo('/login');
            throw new Error();
        }
        const res = yield axiosInstance.get('/user/refresh', {
            params: {
                refreshToken: localStorage.getItem('refreshToken'),
            },
            hideErrorMessage: true,
        });
        localStorage.setItem('refreshToken', res.data.data.refreshToken || '');
        localStorage.setItem('accessToken', res.data.data.accessToken || '');
        return res;
    });
    axiosInstance.interceptors.request.use((config) => {
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
        return config;
    });
    axiosInstance.interceptors.response.use((response) => {
        return response;
    }, (error) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!error.response) {
            return Promise.reject(error);
        }
        let { data, config } = error.response;
        if (refreshing && !config.url.includes('/user/refresh')) {
            //  如果正在刷新 token，此时将请求塞入等待队列，等待 token 刷新后重放接口。如果是 refresh 接口失败了，这里放过去，防止续 token 流程中断
            //    这里返回一个新的 Promise，即等待原接口被重放后，才会将新 promise 置为 full field 状态，返回数据触发回调
            return new Promise((resolve) => {
                queue.push({ config, resolve });
            });
        }
        // 非刷新 token 接口，且 code 401
        if (data.code === 401 && !config.url.includes('/user/refresh')) {
            refreshing = true;
            // 刷新 token
            const res = yield refreshToken();
            refreshing = false;
            if (res.status === 200) {
                // 刷新 token 后，重放接口
                queue.forEach(({ config, resolve }) => {
                    resolve(axiosInstance(config));
                });
                queue.splice(0, queue.length); // 重放完毕后将请求队列清空
                return axiosInstance(config);
            }
            else {
                message.error(((_a = res.data) === null || _a === void 0 ? void 0 : _a.message) || '登陆过期，请重新登录！');
                setTimeout(() => locationTo('/login'), 1000);
                return res;
            }
        }
        else {
            // 有的接口自行处理错误，这里错误 msg 变为可选
            !((_b = error.response.config) === null || _b === void 0 ? void 0 : _b.hideErrorMessage) && message.error(data.message || '请求失败');
            return error.response;
        }
    }));
    return axiosInstance;
}
export default createAxiosInstance;
export { createAxiosInstance };
