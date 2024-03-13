import { message } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import { locationTo } from '../utils';

interface PendingTask {
	config: AxiosRequestConfig;
	resolve: Function;
}

// 用作刷新 token 后重新发起请求
let refreshing = false;
const queue: PendingTask[] = [];

const axiosInstance = axios.create({
	baseURL: 'http://localhost:9999',
	timeout: 10000,
});

const refreshToken = async () => {
	const refreshToken = localStorage.getItem('refreshToken');

	if (!refreshToken) {
		locationTo('/login');
		throw new Error();
	}

	const res = await axiosInstance.get('/user/refresh', {
		params: {
			refreshToken: localStorage.getItem('refreshToken'),
		},
	});
	localStorage.setItem('refreshToken', res.data.data.refreshToken || '');
	localStorage.setItem('accessToken', res.data.data.accessToken || '');

	return res;
};

axiosInstance.interceptors.request.use((config) => {
	config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
	return config;
});
axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		if (!error.response) {
			return Promise.reject(error);
		}
		let { data, config } = error.response;

		if (refreshing) {
			//  如果正在刷新 token，此时将请求塞入等待队列，等待 token 刷新后重放接口
			//    这里返回一个新的 Promise，即等待原接口被重放后，才会将新 promise 置为 full field 状态，返回数据触发回调
			return new Promise((resolve) => {
				queue.push({ config, resolve });
			});
		}

		// 非刷新 token 接口，且 code 401
		if (data.code === 401 && !config.url.includes('/user/refresh')) {
			refreshing = true;

			// 刷新 token
			const res = await refreshToken();

			refreshing = false;

			if (res.status === 200) {
				// 刷新 token 后，重放接口
				queue.forEach(({ config, resolve }) => {
					resolve(axiosInstance(config));
				});
				queue.splice(0, queue.length); // 重放完毕后将请求队列清空
				return axiosInstance(config);
			} else {
				message.error(res.data);

				setTimeout(() => {
					window.location.href = '/login';
				}, 1000);
			}
		} else {
			console.log(data);
			message.error(error.response.data.message || '请求失败');
			return error.response;
		}
	}
);

export default axiosInstance;
export { axiosInstance };
