import { Outlet, useLocation } from 'react-router-dom';
import './menu.css';
import { Menu as AntdMenu, MenuProps } from 'antd';
import { router } from '../../index';
import { MENU_PATH } from '../../const';

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
	let path = '';
	switch (key) {
		case '1':
			path = MENU_PATH.MEETING_ROOM_MANAGE;
			break;
		case '2':
			path = MENU_PATH.BOOKING_MANAGE;
			break;
		case '3':
			path = MENU_PATH.USER_MANAGE
			break;
		case '4':
			path = MENU_PATH.STATISTICS;
			break;
		default:
			break;
	}
	router.navigate('/' + path);
};

export function Menu() {
	const location = useLocation();

	const getSelectKey = () => {
		switch (location.pathname) {
			case MENU_PATH.MEETING_ROOM_MANAGE:
				return ['1'];
			case MENU_PATH.BOOKING_MANAGE:
				return ['2'];
			case MENU_PATH.USER_MANAGE:
				return ['3'];
			case MENU_PATH.STATISTICS:
				return ['4'];
			default:
				return ['1'];
		}
	}

	return (
		<div id="menu-container">
			<div className="menu-area">
				<AntdMenu
					defaultSelectedKeys={getSelectKey()}
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
