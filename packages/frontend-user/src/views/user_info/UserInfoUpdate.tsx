import { Button, Form, Input, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useCallback, useEffect } from 'react';
import './user_info_update.css';
import { useNavigate } from 'react-router-dom';
import { useCountDown } from '../hooks/useCountDown';
import {
  UserInfo,
  getUserInfo,
  updateUserCaptcha,
  updateUserInfo,
} from '../../api/interface';
import { HeadPicUpload } from './HeadPicUpload';

const layout1 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export function UserInfoUpdate() {
  const [form] = useForm();
  const navigate = useNavigate();
  const { startCountDown, disabledCaptchaBtn, captchaBtnCountDown } =
    useCountDown(10);

  useEffect(() => {
    async function query() {
      const {
        data: { data, code },
      } = await getUserInfo();
      console.log(data);

      if (code !== 200) {
        return message.error('请求用户数据失败！');
      }

      form.setFieldValue('nickName', data.nickName);
      form.setFieldValue('headPic', data.headPic);
      form.setFieldValue('email', data.email);
    }
    query();
  }, []);

  const onFinish = useCallback(async (values: UserInfo) => {
    await form.validateFields();
    const res = await updateUserInfo(values);

    const { code, message: msg, data } = res.data;
    console.log(res);
    if (code === 200 || code === 201) {
      message.success(msg || '修改成功');
      form.setFieldValue('captcha', '');
      navigate('/');
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
          {/* Form.Item 渲染时会自动传递 value 和 onChange 两个参数给子组件 */}
          <HeadPicUpload />
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
          rules={[{ required: true, message: '' }]}
        >
          <Input disabled={true} />
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
