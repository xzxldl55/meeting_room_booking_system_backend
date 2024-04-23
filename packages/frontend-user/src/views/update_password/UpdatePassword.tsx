import { Button, Form, Input, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import './update_password.css';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword, updatePasswordCaptcha, UpdatePasswordParam } from '../../api/interface';
import { useCountDown } from '../hooks/useCountDown';

const layout1 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const layout2 = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};

export function UpdatePassword() {
  const [form] = useForm();
  const navigate = useNavigate();
  const { startCountDown, captchaBtnCountDown, disabledCaptchaBtn } =
    useCountDown(10);

  const onFinish = useCallback(async (values: UpdatePasswordParam) => {
    if (values.password !== values.confirmPassword) {
      return message.error('两次密码不一致');
    }

    const res = await updatePassword(values);
    const { code, message: msg, data } = res.data;
    console.log(code, msg, data);
    if (code === 200 || code === 201) {
      message.success(data || '注册成功');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  }, []);

  const sendCaptcha = useCallback(async function () {
    const address = form.getFieldValue('email');
    form
      .validateFields(['email'])
      .then(async () => {
        const {
          data: { data },
        } = await updatePasswordCaptcha(address);
        message.success(data);
        startCountDown();
      })
      .catch(() => {});
  }, []);

  return (
    <div id="updatePassword-container">
      <h1>会议室预订系统</h1>
      <Form
        form={form}
        {...layout1}
        onFinish={onFinish}
        colon={false}
        autoComplete="off"
        labelAlign="left"
      >
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
            <Button
              type="primary"
              onClick={sendCaptcha}
              disabled={disabledCaptchaBtn}
            >
              {disabledCaptchaBtn ? `${captchaBtnCountDown}s` : `发送验证码`}
            </Button>
          </div>
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="确认密码"
          name="confirmPassword"
          rules={[{ required: true, message: '请输入确认密码!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item {...layout1} label=" ">
          <Button className="btn" type="primary" htmlType="submit">
            修改
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
