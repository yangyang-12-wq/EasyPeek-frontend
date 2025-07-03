import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/user/Login';
import Register from '../pages/user/Register';
import ProtectedRoute from '../components/ProtectedRoute';

import HomePage from '../pages/HomePage';
import NewsPage from '../pages/newspage';
import StoryPage from '../pages/StoryPage';
import StoryDetailPage from '../pages/StoryDetailPage';
import EventDetailPage from '../pages/EventDetailPage';
import GlobalPage from '../pages/global';
import RecommendPage from '../pages/RecommendPage';
import ProfilePage from '../pages/user/profile';
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
    path: '/event/:id',
    element: <EventDetailPage />
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
      <ProtectedRoute isAdmin={true}>
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute isAdmin={true}>
        <UserManagement />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/events',
    element: (
      <ProtectedRoute isAdmin={true}>
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/news',
    element: (
      <ProtectedRoute isAdmin={true}>
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/rss-sources',
    element: (
      <ProtectedRoute isAdmin={true}>
        <RSSManagement />
      </ProtectedRoute>
    )
  }
]);

export default router;

