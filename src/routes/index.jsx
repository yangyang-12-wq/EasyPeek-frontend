import { createBrowserRouter, Navigate } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.clear('isLoggedIn')
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

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
    path: '/dashboard',
  }
])