import { Button, Form, Input, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useCallback } from 'react';
import './user_info_update.css';
import { useNavigate } from 'react-router-dom';
import { useCountDown } from '../hooks/useCountDown';
import {
  UserInfo,
  updateUserCaptcha,
  updateUserInfo,
} from '../../api/interface';

const layout1 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export function UserInfoUpdate() {
  const [form] = useForm();
  const navigate = useNavigate();
  const { startCountDown, disabledCaptchaBtn, captchaBtnCountDown } =
    useCountDown(10);

  const onFinish = useCallback(async (values: UserInfo) => {
    await form.validateFields();
    const res = await updateUserInfo(values);

    const { code, message: msg, data } = res.data;
    console.log(res);
    if (code === 200 || code === 201) {
      message.success(msg || '修改成功');
    }
  }, []);

  const sendCaptcha = useCallback(async function () {
    const res = await updateUserCaptcha();

    if (res.status !== 200 && res.status !== 201) {
      return;
    }

    message.success('发送成功');
    startCountDown();
  }, []);

  return (
    <div id="updateInfo-container">
      <Form
        form={form}
        {...layout1}
        onFinish={onFinish}
        colon={false}
        autoComplete="off"
        labelAlign="left"
      >
        <Form.Item
          label="头像"
          name="headPic"
          rules={[{ required: false, message: '请输入头像!' }]}
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
          label="验证码"
          name="captcha"
          rules={[{ required: true, message: '请输入验证码!' }]}
        >
          <div className="captcha-wrapper">
            <Input />
            <Button
              type="primary"
              disabled={disabledCaptchaBtn}
              onClick={sendCaptcha}
            >
              {disabledCaptchaBtn ? `${captchaBtnCountDown}s` : `发送验证码`}
            </Button>
          </div>
        </Form.Item>

        <Form.Item {...layout1} label=" ">
          <Button className="btn" type="primary" htmlType="submit">
            修改信息
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
