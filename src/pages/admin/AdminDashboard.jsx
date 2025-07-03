import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AdminHeader from '../../components/admin/AdminHeader';
import { getSystemStats } from '../../api/adminApi';
import { message } from 'antd';
import './Admin.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_active_users: 0,
        total_deleted_users: 0,
        total_admins: 0,
        total_events: 0,
        active_events: 0,
        total_rss_sources: 0,
        active_rss_sources: 0,
        total_news: 0,
        active_news: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await getSystemStats();
            if (response.data.code === 200 && response.data.data) {
                setStats(response.data.data);
            } else {
                message.error(response.data.message || '获取系统统计失败');
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    message.error('认证已过期，请重新登录');
                    navigate('/admin/login');
                } else {
                    message.error(error.response.data.message || '获取系统统计数据失败');
                }
            } else {
                message.error('获取系统统计数据失败，请检查网络连接');
            }
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: '用户管理',
            description: '管理系统用户和权限',
            icon: '👥',
            link: '/admin/users',
            color: 'blue'
        },
        {
            title: '事件管理',
            description: '管理热点事件和内容',
            icon: '📅',
            link: '/admin/events',
            color: 'green'
        },
        {
            title: '新闻管理',
            description: '管理新闻内容和分类',
            icon: '📰',
            link: '/admin/news',
            color: 'purple'
        },
        {
            title: 'RSS管理',
            description: '管理RSS源和抓取任务',
            icon: '📡',
            link: '/admin/rss-sources',
            color: 'orange'
        }
    ];

    return (
        <div className="admin-container">
            <AdminHeader />

            <div className="admin-content">
                <div className="page-header">
                    <h1 className="page-title">管理员控制台</h1>
                    <p className="page-subtitle">系统总览和快速操作</p>
                </div>

                {/* 统计卡片 */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon users">👥</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.total_active_users || 0)}
                            </div>
                            <div className="stat-label">活跃用户</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon events">📅</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.active_events || 0)}
                            </div>
                            <div className="stat-label">活跃事件</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon news">📰</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.active_news || 0)}
                            </div>
                            <div className="stat-label">活跃新闻</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon rss">📡</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.active_rss_sources || 0)}
                            </div>
                            <div className="stat-label">RSS源</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon admins">👑</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.total_admins || 0)}
                            </div>
                            <div className="stat-label">管理员</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon total">📊</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {loading ? '-' : (stats.total_events || 0)}
                            </div>
                            <div className="stat-label">总事件数</div>
                        </div>
                    </div>
                </div>

                {/* 快速操作 */}
                <div className="quick-actions-section">
                    <h2 className="section-title">快速操作</h2>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.link}
                                className={`quick-action-card ${action.color}`}
                            >
                                <div className="action-icon">{action.icon}</div>
                                <div className="action-info">
                                    <h3 className="action-title">{action.title}</h3>
                                    <p className="action-description">{action.description}</p>
                                </div>
                                <div className="action-arrow">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 最近活动 */}
                <div className="recent-activity-section">
                    <h2 className="section-title">最近活动</h2>
                    <div className="activity-card">
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-dot new"></div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <span className="activity-title">新用户注册</span>
                                        <span className="activity-time">2分钟前</span>
                                    </div>
                                    <div className="activity-description">用户 john_doe 完成注册</div>
                                </div>
                            </div>

                            <div className="activity-item">
                                <div className="activity-dot update"></div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <span className="activity-title">新闻发布</span>
                                        <span className="activity-time">5分钟前</span>
                                    </div>
                                    <div className="activity-description">发布了新闻"AI技术发展趋势"</div>
                                </div>
                            </div>

                            <div className="activity-item">
                                <div className="activity-dot fetch"></div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <span className="activity-title">RSS抓取</span>
                                        <span className="activity-time">10分钟前</span>
                                    </div>
                                    <div className="activity-description">完成RSS源抓取，新增15条新闻</div>
                                </div>
                            </div>

                            <div className="activity-item">
                                <div className="activity-dot warning"></div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <span className="activity-title">系统警告</span>
                                        <span className="activity-time">1小时前</span>
                                    </div>
                                    <div className="activity-description">RSS源"科技日报"连接失败</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 