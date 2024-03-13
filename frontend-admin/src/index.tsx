import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter, Link, Outlet } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { Login } from './views/login/login';
import { UserOutlined } from '@ant-design/icons';
import './index.css';
import { Menu } from './views/menu/menu';
import { UserManage } from './views/user_manage/userManage';

export function Index() {
	return (
		<div id="index-container">
			<div className="header">
				<h1>会议室预定系统-后管平台</h1>
				<UserOutlined className="icon" />
			</div>
			<div className="body">
				<Outlet></Outlet>
			</div>
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
						path: 'user_manage',
						element: <UserManage />,
					},
				],
			},
		],
	},
	{
		path: 'login',
		element: <Login />,
	},
];
const router = createBrowserRouter(routes);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<RouterProvider router={router} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();