import { message } from 'antd';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:9999',
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    message.error(error.response.data.message || '请求失败');

    return error.response;
  },
);

export interface LoginUser {
  username: string;
  password: string;
}

export async function login(data: LoginUser) {
  return await axiosInstance.post('/user/login', data);
}

export interface RegisterUser {
  username: string;
  nickName: string;
  password: string;
  confirmPassword: string;
  email: string;
  captcha: string;
}

export async function registerCaptcha(address: string) {
  return await axiosInstance.get('/user/captcha/register', {
    params: { address },
  });
}

export async function register(data: RegisterUser) {
  return await axiosInstance.post('/user/register', data);
}

export interface UpdatePasswordParam {
  email: string;
  captcha: string;
  password: string;
  confirmPassword: string;
}

export async function updatePasswordCaptcha(address: string) {
  return await axiosInstance.get('/user/captcha/update_password', {
    params: { address },
  });
}

export async function updatePassword(data: UpdatePasswordParam) {
  return await axiosInstance.post('/user/update_password', data);
}
