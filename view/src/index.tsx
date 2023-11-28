import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  RouterProvider,
  createBrowserRouter,
  Link,
  Outlet,
} from 'react-router-dom';
import { ErrorPage } from './views/ErrorPage';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { UpdatePassword } from './views/UpdatePassword';

const routes = [
  {
    path: '/',
    element: <div>index</div>,
    errorElement: <ErrorPage />,
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
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
