import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter, Link, Outlet } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { Login } from './views/login/login';
import { UserOutlined } from '@ant-design/icons';
import './index.css';
import { Menu } from './views/menu/menu';
import { UserManage } from './views/user_manage/userManage';
import { ModifyMenu } from './views/modify_menu/modifyMenu';
import { InfoModify } from './views/info_modify/infoModify';
import { PasswordModify } from './views/password_modify/passwordModify';
import { locationTo } from 'tools';
import { MeetingRoomManage } from './views/meeting_room_manage/meetingRoomManage';
import { BookingManage } from './views/booking_manage/bookingManage';
import { Statistics } from './views/statistics/statistics';
import { MENU_PATH } from './const';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

export function Index() {
	return (
		<div id="index-container">
			<ConfigProvider locale={locale}>
				<div className="header">
					<h1>会议室预定系统-后管平台</h1>
					<UserOutlined
						className="icon"
						onClick={() => locationTo('/user')}
					/>
				</div>
				<div className="body">
					<Outlet></Outlet>
				</div>
			</ConfigProvider>
		</div>
	);
}
function ErrorPage() {
	return <div>Error Page</div>;
}

const routes = [
	{
		path: '/',
		element: <Index></Index>,
		errorElement: <ErrorPage />,
		children: [
			{
				path: '/',
				element: <Menu></Menu>,
				errorElement: <ErrorPage />,
				children: [
					{
						path: '/',
						element: <MeetingRoomManage />,
					},
					{
						path: MENU_PATH.MEETING_ROOM_MANAGE,
						element: <MeetingRoomManage />,
					},
					{
						path: MENU_PATH.BOOKING_MANAGE,
						element: <BookingManage />,
					},
					{
						path: MENU_PATH.STATISTICS,
						element: <Statistics />,
					},
					{
						path: MENU_PATH.USER_MANAGE,
						element: <UserManage />,
					},
				],
			},
			{
				path: MENU_PATH.USER,
				element: <ModifyMenu></ModifyMenu>,
				children: [
					{
						path: MENU_PATH.INFO_MODIFY,
						element: <InfoModify />,
					},
					{
						path: MENU_PATH.PASSWORD_MODIFY,
						element: <PasswordModify />,
					},
				],
			},
		],
	},
	{
		path: MENU_PATH.LOGIN,
		element: <Login />,
	},
];
export const router = createBrowserRouter(routes);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<RouterProvider router={router} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
