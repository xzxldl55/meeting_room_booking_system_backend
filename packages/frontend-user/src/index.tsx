import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import { ErrorPage } from './views/error/ErrorPage';
import { Login } from './views/login/Login';
import { Register } from './views/register/Register';
import { UpdatePassword } from './views/update_password/UpdatePassword';
import { UserInfoUpdate } from './views/user_info/UserInfoUpdate';
import { DefaultLayout } from './views/default_layout/DefaultLayout';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <DefaultLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'user_info_update',
        element: <UserInfoUpdate />,
      },
    ],
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'register',
    element: <Register />,
  },
  {
    path: 'update_password',
    element: <UpdatePassword />,
  },
];

const router = createBrowserRouter(routes);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <RouterProvider router={router} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
