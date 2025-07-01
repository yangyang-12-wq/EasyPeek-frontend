import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../user/Login';
import Register from '../user/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

import HomePage from '../pages/HomePage';
import NewsPage from '../pages/newspage';
import StoryPage from '../pages/StoryPage';
import StoryDetailPage from '../pages/StoryDetailPage';
import GlobalPage from '../pages/global';
import RecommendPage from '../pages/RecommendPage';
import ProfilePage from '../user/profile';
import SearchPage from '../pages/search';

// Admin pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import RSSManagement from '../pages/admin/RSSManagement';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/HomePage" replace />
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
    path: '/HomePage',
    element: <HomePage />
  },
  {
    path: '/newspage/:id',
    element: <NewsPage />
  },
  {
    path: '/stories',
    element: <StoryPage />
  },
  {
    path: '/story/:id',
    element: <StoryDetailPage />
  },
  {
    path: '/global',
    element: <GlobalPage />
  },
  {
    path: '/recommend',
    element: <RecommendPage />
  },
  {
    path: '/search',
    element: <SearchPage />
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    )
  },
  // Admin routes
  {
    path: '/admin/login',
    element: <AdminLogin />
  },
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>
    )
  },
  {
    path: '/admin/users',
    element: (
      <AdminProtectedRoute>
        <UserManagement />
      </AdminProtectedRoute>
    )
  },
  {
    path: '/admin/events',
    element: (
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>
    )
  },
  {
    path: '/admin/news',
    element: (
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>
    )
  },
  {
    path: '/admin/rss-sources',
    element: (
      <AdminProtectedRoute>
        <RSSManagement />
      </AdminProtectedRoute>
    )
  }
]);

export default router;

