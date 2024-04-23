import { Button, Checkbox, Form, Input, message } from 'antd';
import './login.css';
import { useCallback } from 'react';
import { login } from '../../interface/interface';
import { useNavigate } from 'react-router-dom';

interface LoginUser {
	username: string;
	password: string;
}

const layout1 = {
	labelCol: { span: 4 },
	wrapperCol: { span: 20 },
};

export function Login() {
	const navigate = useNavigate();
	const onFinish = useCallback(async (values: LoginUser) => {
		const res = await login(values.username, values.password);
		const { data, message: msg } = res.data;
		if (res.status === 201 || res.status === 200) {
			message.success('登录成功！');
			localStorage.setItem('accessToken', data.accessToken);
			localStorage.setItem('refreshToken', data.refreshToken);
			localStorage.setItem('userInfo', JSON.stringify(data.userInfo));

			setTimeout(() => navigate('/'), 500);
		} else {
			message.error(msg || '系统繁忙，稍后再试。');
		}
	}, []);

	return (
		<div id="login-container">
			<h1>会议室预订系统</h1>
			<Form
				{...layout1}
				onFinish={onFinish}
				colon={false}
				autoComplete="off"
				labelAlign="left"
			>
				<Form.Item
					label="用户名"
					name="username"
					rules={[{ required: true, message: '请输入用户名!' }]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					label="密码"
					name="password"
					rules={[{ required: true, message: '请输入密码!' }]}
				>
					<Input.Password />
				</Form.Item>

				<Form.Item label=" ">
					<Button
						className="btn"
						type="primary"
						htmlType="submit"
					>
						登录
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
}
