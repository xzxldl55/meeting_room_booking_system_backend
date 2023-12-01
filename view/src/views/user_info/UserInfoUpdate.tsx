import { Button, Form, Input, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useCallback } from 'react';
import './user_info_update.css';
import { useNavigate } from 'react-router-dom';

export interface UserInfo {
  headPic: string;
  nickName: string;
  email: string;
  captcha: string;
}

const layout1 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export function UserInfoUpdate() {
  const [form] = useForm();
  const navigate = useNavigate();

  const onFinish = useCallback(async (values: UserInfo) => {}, []);

  const sendCaptcha = useCallback(async function () {}, []);

  return (
    <div id="updateInfo-container">
      <Form
        form={form}
        {...layout1}
        onFinish={onFinish}
        colon={false}
        autoComplete="off"
        labelAlign='left'
      >
        <Form.Item
          label="头像"
          name="headPic"
          rules={[{ required: true, message: '请输入头像!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="昵称"
          name="nickName"
          rules={[{ required: true, message: '请输入昵称!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '请输入合法邮箱地址!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="验证码"
          name="captcha"
          rules={[{ required: true, message: '请输入验证码!' }]}
        >
          <div className="captcha-wrapper">
            <Input />
            <Button type="primary" onClick={sendCaptcha}>
              发送验证码
            </Button>
          </div>
        </Form.Item>

        <Form.Item {...layout1} label=" ">
          <Button className="btn" type="primary" htmlType="submit">
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
