import { Outlet } from 'react-router-dom';
import { Menu as AntdMenu, MenuProps } from 'antd';
import './modifyMenu.css';
import { router } from '../..';

const items: MenuProps['items'] = [
	{
		key: '1',
		label: '信息修改',
	},
	{
		key: '2',
		label: '密码修改',
	},
];

const menuClick: MenuProps['onClick'] = ({ key }) => {
	switch (key) {
		case '1':
			router.navigate('/user/info_modify');
			break;
		case '2':
			router.navigate('/user/password_modify');
			break;
		default:
			break;
	}
};

export function ModifyMenu() {
	return (
		<div id="menu-container">
			<div className="menu-area">
				<AntdMenu
					defaultSelectedKeys={['1']}
					items={items}
					onClick={menuClick}
				/>
			</div>
			<div className="content-area">
				<Outlet></Outlet>
			</div>
		</div>
	);
}
