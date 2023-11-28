import { Button, Checkbox, Form, Input } from 'antd';
import './login.css';

interface LoginUser {
  username: string;
  password: string;
}

const onFinished = (val: LoginUser) => {
  console.log(val);
};

const layout1 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const layout2 = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};

export function Login() {
  return (
    <div id="login-container">
      <h1>会议室预定系统</h1>
      <Form {...layout1} onFinish={onFinished} colon={false} autoComplete="off">
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </div>
  );
}
