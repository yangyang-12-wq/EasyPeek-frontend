import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAdminAuth } from '../api/adminApi';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const [loading, setLoading] = useState(isAdmin); // 只有 admin 需要 loading
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (isAdmin) {
            const { isAuthenticated: authenticated } = checkAdminAuth();
            setIsAuthenticated(authenticated);
            setLoading(false);
        } else {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            setIsAuthenticated(isLoggedIn);
        }
    }, [isAdmin]); // 依赖 isAdmin

    if (isAdmin && loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        if (isAdmin) {
            return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;