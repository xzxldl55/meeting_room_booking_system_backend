import { UserOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import './default_layout.css';

export function DefaultLayout() {
  const navigate = useNavigate();

  const toUserInfoUpdate = () => {
    navigate('/user_info_update')
  }

  return (
    <div id="index-container">
      <div className="header">
        <h1>会议室预定系统</h1>
        <UserOutlined className="icon" onClick={toUserInfoUpdate} />
      </div>
      <div className="body">
        <Outlet></Outlet>
      </div>
    </div>
  );
}
