import { Button, Form, Input, message } from 'antd';
import './login.css';
import { login, LoginUser } from '../../api/interface';
import { Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const layout1 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const layout2 = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};

export function Login() {
  const navigate = useNavigate();

  const onFinished = useCallback(async (val: LoginUser) => {
    const { data } = await login(val);
    if (data.code === 201) {
      message.success('登录成功');

      localStorage.setItem('accessToken', data.data.accessToken || '');
      localStorage.setItem('refreshToken', data.data.refreshToken || '');
      localStorage.setItem('userInfo', JSON.stringify(data.data.userInfo) || '');

      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  }, []);

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:9999/user/github/login'
  }

  return (
    <div id="login-container">
      <h1>会议室预定系统</h1>
      <Form
        {...layout1}
        onFinish={onFinished}
        colon={false}
        autoComplete="off"
        labelAlign="left"
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item {...layout2}>
          <div className="links">
            <Link to='/register'>创建账号</Link>
            <Link to='/update_password'>忘记密码</Link>
          </div>
        </Form.Item>
        <Form.Item {...layout2}>
          <Button className="btn" type="primary" htmlType="submit">
            登录
          </Button>
        </Form.Item>
        <Form.Item {...layout2}>
          <Button className="btn" type="primary" onClick={handleGithubLogin}>
            Github登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
