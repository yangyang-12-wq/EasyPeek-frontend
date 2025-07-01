import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import { adminLogin, handleApiError } from '../../api/adminApi';
import './AdminLogin.css';

const AdminLogin = () => {
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const response = await adminLogin(values);

            if (response.success) {
                message.success('登录成功！');
                navigate('/admin');
            } else {
                throw new Error(response.message || '登录失败');
            }
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = handleApiError(error);
            // 不显示"Authentication failed"消息，因为这是登录页面
            if (!errorMessage.includes('Authentication failed')) {
                message.error(errorMessage);
            } else {
                message.error('用户名或密码错误');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackToSite = () => {
        navigate('/');
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-background"></div>

            <div className="admin-login-content">
                <div className="login-header">
                    <div className="back-button">
                        <Button
                            type="text"
                            onClick={handleBackToSite}
                            className="back-btn"
                        >
                            ← 返回主站
                        </Button>
                    </div>
                    <div className="theme-toggle-wrapper">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="login-form-wrapper">
                    <Card className="login-card">
                        <div className="login-title-section">
                            <div className="admin-icon">
                                <CrownOutlined />
                            </div>
                            <h1 className="login-title">管理员登录</h1>
                            <p className="login-subtitle">EasyPeek 管理控制台</p>
                        </div>

                        <Form
                            name="admin-login"
                            onFinish={handleLogin}
                            autoComplete="off"
                            layout="vertical"
                            size="large"
                        >
                            <Form.Item
                                name="username"
                                rules={[
                                    { required: true, message: '请输入管理员用户名' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="管理员用户名"
                                    autoComplete="username"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: '请输入密码' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="密码"
                                    autoComplete="current-password"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    className="login-button"
                                >
                                    登录管理后台
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="login-footer">
                            <div className="demo-info">
                                <p>请使用您的管理员账号登录</p>
                                <p>如需帮助，请联系系统管理员</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin; 