import { UserOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import './default_layout.css';
import { getUserInfo } from '../../utils';
import { useEffect } from 'react';

export function DefaultLayout() {
	const navigate = useNavigate();

	const toUserInfoUpdate = () => {
		navigate('/user_info_update');
	};

	const userInfo = getUserInfo();

	useEffect(() => {
		if (!userInfo) {
			navigate('/login');
		}
	}, []);

	return (
		<div id="index-container">
			<div className="header">
				<h1>会议室预定系统</h1>
				<div className='header-avatar' onClick={toUserInfoUpdate}>
					{userInfo?.headPic ? (
						<img
							src={userInfo?.headPic.startsWith('http') ? userInfo?.headPic : 'http://localhost:9999/' + userInfo?.headPic}
							alt="avatar"
							width="40"
							height="40"
						/>
					) : (
						<UserOutlined className="icon" />
					)}
				</div>
			</div>
			<div className="body">
				<Outlet></Outlet>
			</div>
		</div>
	);
}
