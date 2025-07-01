import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAdminAuth } from '../../api/adminApi';
import { Spin } from 'antd';

const AdminProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = () => {
            const { isAuthenticated: authenticated } = checkAdminAuth();
            setIsAuthenticated(authenticated);
            setLoading(false);
        };

        checkAuth();
    }, []);

    if (loading) {
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
        // 保存当前路径，登录后可以重定向回来
        return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default AdminProtectedRoute; 