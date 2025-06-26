import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, List, Avatar, Statistic, Row, Col, Button, Spin } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined, 
  BookOutlined, 
  SettingOutlined, 
  FileTextOutlined,
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedKey, setSelectedKey] = useState('1');
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '2',
      icon: <BookOutlined />,
      label: '我的新闻',
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  const newsData = [
    {
      title: '科技前沿：AI技术的最新突破',
      description: '人工智能在各个领域的应用正在快速发展...',
      time: '2小时前',
      views: 1234
    },
    {
      title: '经济观察：全球市场动态分析',
      description: '本周全球股市表现良好，科技股领涨...',
      time: '4小时前',
      views: 856
    },
    {
      title: '体育快讯：世界杯最新赛况',
      description: '昨晚的比赛精彩纷呈，多支强队晋级...',
      time: '6小时前',
      views: 2341
    }
  ];

  const achievements = [
    { text: '连续阅读7天', status: '已完成' },
    { text: '分享10篇文章', status: '进行中 (7/10)' },
    { text: '收藏50篇新闻', status: '进行中 (23/50)' }
  ];

  if (loading) {
    return (
      <div className={`dashboard-loading ${theme}`}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${theme}`}>
      <ThemeToggle />
      
      <Layout className="dashboard-layout">
        <Header className={`dashboard-header ${theme}`}>
          <div className="dashboard-logo">
            <FileTextOutlined className="dashboard-logo-icon" />
            <h3 className="dashboard-title">EasyPeek 新闻</h3>
          </div>
          
          <div className="dashboard-user-info">
            <span className="dashboard-username">
              欢迎，{user?.username || '用户'}
            </span>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="dashboard-logout-btn"
            >
              退出
            </Button>
          </div>
        </Header>

        <Layout>
          <Sider 
            width={280} 
            className={`dashboard-sider ${theme}`}
          >
            <div className="dashboard-user-profile">
              <Avatar 
                size={64} 
                icon={<UserOutlined />} 
                className="dashboard-user-avatar"
              />
              <div>
                <div className={`dashboard-user-name ${theme}`}>
                  {user?.username || '用户'}
                </div>
                <div className={`dashboard-user-date ${theme}`}>
                  加入于 {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
              onClick={({ key }) => setSelectedKey(key)}
              className={`dashboard-menu ${theme}`}
            />
          </Sider>

          <Content className={`dashboard-content ${theme}`}>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={8}>
                <Card className={`dashboard-card ${theme}`}>
                  <Statistic
                    title="今日阅读"
                    value={12}
                    prefix={<EyeOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                    className="dashboard-statistic"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className={`dashboard-card ${theme}`}>
                  <Statistic
                    title="收藏文章"
                    value={23}
                    prefix={<HeartOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                    className="dashboard-statistic"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className={`dashboard-card ${theme}`}>
                  <Statistic
                    title="分享次数"
                    value={7}
                    prefix={<ShareAltOutlined />}
                    valueStyle={{ color: '#faad14' }}
                    className="dashboard-statistic"
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card 
                  title="最新新闻" 
                  className={`dashboard-card ${theme}`}
                >
                  <List
                    itemLayout="vertical"
                    dataSource={newsData}
                    className={`dashboard-news-list ${theme}`}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <span key="views" className={`dashboard-achievement-status ${theme}`}>
                            <EyeOutlined /> {item.views}
                          </span>,
                          <span key="time" className={`dashboard-achievement-status ${theme}`}>
                            {item.time}
                          </span>
                        ]}
                      >
                        <List.Item.Meta
                          title={<a href="#">{item.title}</a>}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Card title="我的成就" className={`dashboard-card ${theme}`}>
                    {achievements.map((achievement, index) => (
                      <div key={index} className="dashboard-achievement-item">
                        <span className={`dashboard-achievement-text ${theme}`}>
                          {achievement.text}
                        </span>
                        <span className={`dashboard-achievement-status ${theme}`}>
                          {achievement.status}
                        </span>
                      </div>
                    ))}
                  </Card>

                  <Card title="快捷操作" className={`dashboard-card ${theme}`}>
                    <div className="dashboard-quick-actions">
                      <Button type="primary" block className="dashboard-action-btn">
                        浏览新闻
                      </Button>
                      <Button block className="dashboard-action-btn">
                        我的收藏
                      </Button>
                      <Button block className="dashboard-action-btn">
                        个人设置
                      </Button>
                    </div>
                  </Card>
                </div>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Dashboard;