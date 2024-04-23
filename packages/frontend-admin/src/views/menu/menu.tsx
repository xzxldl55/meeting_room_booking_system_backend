import { Outlet } from 'react-router-dom';
import './menu.css';
import { Menu as AntdMenu, MenuProps } from 'antd';
import { router } from '../../index';

const items: MenuProps['items'] = [
	{
		key: '1',
		label: '会议室管理',
	},
	{
		key: '2',
		label: '预定管理',
	},
	{
		key: '3',
		label: '用户管理',
	},
	{
		key: '4',
		label: '统计',
	},
];

const menuClick: MenuProps['onClick'] = ({ key }) => {
	switch (key) {
		case '1':
			router.navigate('/');
			break;
		case '2':
			router.navigate('/');
			break;
		case '3':
			router.navigate('/user_manage');
			break;
		case '4':
			router.navigate('/');
			break;
		default:
			break;
	}
};

export function Menu() {
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
