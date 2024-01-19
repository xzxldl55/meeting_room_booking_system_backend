import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter, Link, Outlet } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { Login } from './views/login/Login';

function Index() {
	return (
		<div>
			index<Outlet></Outlet>
		</div>
	);
}
function ErrorPage() {
	return <div>Error Page</div>;
}

function UserManage() {
	return <div>user manage</div>;
}

const routes = [
	{
		path: '/',
		element: <Index></Index>,
		errorElement: <ErrorPage />,
		children: [
			{
				path: 'user_manage',
				element: <UserManage />,
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
