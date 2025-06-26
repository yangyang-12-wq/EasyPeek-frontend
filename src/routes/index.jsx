import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../user/Login';
import Register from '../user/Register';
import Dashboard from '../user/Dashboard';
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // 修复：正确获取登录状态
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  }
]);

export default router;
