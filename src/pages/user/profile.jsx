import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import ThemeToggle from '../../components/ThemeToggle';

import {
  getMessages,
  getUnreadCount,
  markMessageRead,
  markAllMessagesRead,
  deleteMessage,
  getFollows,
  removeFollow,
  checkFollow,
  getFollowStats,
  handleApiError
} from '../../api/userApi';
import './profile.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('info');
  
  // 消息相关状态
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [messagesTotalPages, setMessagesTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageType, setMessageType] = useState('');
  
  // 关注相关状态
  const [follows, setFollows] = useState([]);
  const [followsLoading, setFollowsLoading] = useState(false);
  const [followsPage, setFollowsPage] = useState(1);
  const [followsTotal, setFollowsTotal] = useState(0);
  const [followsTotalPages, setFollowsTotalPages] = useState(0);
  const [followStats, setFollowStats] = useState({ total_follows: 0 });
  
  // 错误状态
  const [error, setError] = useState('');

  const userInfo = {
    name: "张三",
    email: "zhangsan@example.com",
    phone: "138****8888",
    location: "北京市",
    joinDate: "2023-06-15",
    bio: "关注科技和商业动态，喜欢深度分析",
    avatar: "/placeholder.svg?height=100&width=100",
  };

  // API调用函数
  const fetchMessages = async (page = 1, type = '') => {
    try {
      setMessagesLoading(true);
      setError('');
      const response = await getMessages({ page, page_size: 4, type });
      
      // 处理新的API返回格式 {messages: [...], total: ..., unread_count: ...}
      const messageData = Array.isArray(response.messages) ? response.messages : [];
      
      setMessages(messageData);
      setMessagesTotal(response.total || 0);
      setUnreadCount(response.unread_count || 0);
      setMessagesTotalPages(Math.ceil((response.total || 0) / 4));
      setMessagesPage(page);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('获取消息失败:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.unread_count || 0);
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      setUnreadCount(0);
    }
  };

  const fetchFollows = async (page = 1) => {
    try {
      setFollowsLoading(true);
      setError('');
      const response = await getFollows({ page, page_size: 10 });
      
      // 处理新的API返回格式 {follows: [...], total_count: ..., page: ..., page_size: ..., total_pages: ...}
      const followsData = Array.isArray(response.follows) ? response.follows : [];
      const totalCount = response.total_count || 0;
      

      
      setFollows(followsData);
      setFollowsTotal(totalCount);
      setFollowsTotalPages(response.total_pages || Math.ceil(totalCount / 10));
      setFollowsPage(page);
      
      // 同时更新关注统计信息
      setFollowStats({
        total_follows: totalCount,
        follows: followsData
      });
      

    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('获取关注列表失败:', error);
    } finally {
      setFollowsLoading(false);
    }
  };

  // 不再需要单独的fetchFollowStats函数，因为关注列表API已包含统计信息
  const fetchFollowStats = async () => {
    // 这个函数保留以防其他地方需要单独获取统计信息
    try {
      const response = await getFollowStats();
      setFollowStats({
        total_follows: response.total_count || 0,
        follows: response.follows || []
      });
    } catch (error) {
      console.error('获取关注统计失败:', error);
    }
  };

  // 标记消息已读
  const handleMarkRead = async (messageId) => {
    try {
      await markMessageRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      fetchUnreadCount(); // 更新未读数量
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    }
  };

  // 标记所有消息已读
  const handleMarkAllRead = async () => {
    try {
      await markAllMessagesRead();
      setMessages(prev => 
        prev.map(msg => ({ ...msg, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    }
  };

  // 删除消息
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      fetchUnreadCount(); // 更新未读数量
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    }
  };

  // 取消关注
  const handleUnfollow = async (eventId) => {
    try {

      await removeFollow(eventId);
      
      // 从列表中移除该关注项
      setFollows(prev => {
        const newFollows = prev.filter(follow => follow.event_id !== eventId);

        return newFollows;
      });
      
      // 更新总数
      setFollowsTotal(prev => Math.max(0, prev - 1));
      
      // 更新关注统计
      fetchFollowStats();
      

    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('取消关注失败:', error);
    }
  };

  // 处理消息分页
  const handleMessagesPageChange = (page) => {
    fetchMessages(page, messageType);
  };

  // 处理关注分页
  const handleFollowsPageChange = (page) => {
    fetchFollows(page);
  };

  // 格式化时间
  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      return `${days}天前`;
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    
    if (!token) {
      console.warn('用户未登录，无法获取个人数据');
      setError('请先登录后再查看个人信息');
      return;
    }
    
    // 页面加载时获取未读消息数量，用于显示统计按钮
    fetchUnreadCount();
  }, []);

  // 切换标签页时获取对应数据
  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages(1, messageType);
    } else if (activeTab === 'following') {
      const token = localStorage.getItem('token');
      if (token) {
        fetchFollows(1);
      } else {

        setFollows([]);
        setError('请先登录后查看关注列表');
      }
    }
  }, [activeTab, messageType]);

  const tabs = [
    { id: 'info', label: '个人信息', icon: '👤' },
    { id: 'messages', label: '我的消息', icon: '🔔' },
    { id: 'following', label: '我的关注', icon: '❤️' },
    { id: 'preferences', label: '偏好设置', icon: '⚙️' },
    { id: 'settings', label: '系统设置', icon: '🔧' },
  ];

  return (
    <div className="profile-container">
      <Header />
      <ThemeToggle className="fixed" />
      
      <div className="profile-content">
        <div className="profile-grid">
          {/* 侧边栏 */}
          <div className="profile-sidebar">
            <div className="sidebar-card">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  <img src={userInfo.avatar || "/placeholder.svg"} alt="头像" />
                </div>
                <h3 className="profile-name">{userInfo.name}</h3>
                <p className="profile-bio" title={userInfo.bio}>{userInfo.bio}</p>
              </div>

              <div className="profile-info">
                <div className="info-item">
                  <span className="info-icon">📧</span>
                  {userInfo.email}
                </div>
                <div className="info-item">
                  <span className="info-icon">📱</span>
                  {userInfo.phone}
                </div>
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  {userInfo.location}
                </div>
              </div>

              <div className="profile-join-date">
                <span>加入时间：{userInfo.joinDate}</span>
              </div>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="profile-main">
            <div className="content-card">
              <div className="card-header">
                {/* 未读消息统计区域 */}
                <div className="stats-section">
                  {unreadCount > 0 && (
                    <div className="unread-stats-button">
                      <span className="unread-icon">🔔</span>
                      <span className="unread-text">有 {unreadCount} 条未读消息</span>
                    </div>
                  )}
                </div>
                
                {/* 标签页导航 */}
                <div className="tabs-container">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.id === 'info' ? 'info-tab' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="tab-icon">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-body">
                {/* 个人信息标签页 */}
                {activeTab === 'info' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h2>个人信息</h2>
                      <button className="edit-btn">✏️ 编辑</button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>姓名</label>
                        <input type="text" defaultValue={userInfo.name} />
                      </div>
                      <div className="form-group">
                        <label>邮箱</label>
                        <input type="email" defaultValue={userInfo.email} />
                      </div>
                      <div className="form-group">
                        <label>手机号</label>
                        <input type="text" defaultValue={userInfo.phone} />
                      </div>
                      <div className="form-group">
                        <label>所在地</label>
                        <input type="text" defaultValue={userInfo.location} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>个人简介</label>
                      <textarea defaultValue={userInfo.bio} rows={3} />
                    </div>
                    <button className="save-btn">保存更改</button>
                  </div>
                )}

                {/* 我的消息标签页 */}
                {activeTab === 'messages' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h2>我的消息</h2>
                      <p>查看系统通知和关注事件的更新提醒</p>
                      <div className="message-controls">
                        <select 
                          value={messageType} 
                          onChange={(e) => {
                            const newType = e.target.value;
                            setMessageType(newType);
                            setMessagesPage(1);
                            fetchMessages(1, newType);
                          }}
                          className="message-type-filter"
                        >
                          <option value="">全部消息</option>
                          <option value="system">系统消息</option>
                          <option value="like">点赞消息</option>
                          <option value="comment">评论消息</option>
                          <option value="follow">关注消息</option>
                          <option value="news_update">新闻更新</option>
                          <option value="event_update">事件更新</option>
                        </select>
                        {unreadCount > 0 && (
                          <button 
                            className="mark-all-read-btn"
                            onClick={handleMarkAllRead}
                          >
                            标记全部已读
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {error && (
                      <div className="error-message">
                        {error}
                        <button onClick={() => fetchMessages(1, messageType)}>重试</button>
                      </div>
                    )}
                    
                    {messagesLoading && messages.length === 0 ? (
                      <div className="loading">加载中...</div>
                    ) : (
                      <>
                        <div className="messages-list">
                          {messages.length === 0 ? (
                            <div className="empty-state">
                              <p>暂无消息</p>
                            </div>
                          ) : (
                            messages.map((message) => (
                              <div
                                key={message.id}
                                className={`message-item ${!message.is_read ? 'unread' : ''}`}
                              >
                                <div className="message-content">
                                  <div className="message-header">
                                    <div className="message-title-section">
                                      {message.related_type && message.related_id ? (
                                        <Link 
                                          to={`/newspage/${message.related_id}`} 
                                          className="message-title-link"
                                        >
                                          <h4>{message.title}</h4>
                                        </Link>
                                      ) : (
                                        <h4>{message.title}</h4>
                                      )}
                                      <span className={`message-type-badge ${message.type}`}>
                                        {message.type === 'system' && '系统'}
                                        {message.type === 'like' && '点赞'}
                                        {message.type === 'comment' && '评论'}
                                        {message.type === 'follow' && '关注'}
                                        {message.type === 'news_update' && '新闻'}
                                        {message.type === 'event_update' && '事件'}
                                      </span>
                                    </div>
                                    {!message.is_read && <span className="unread-badge">新</span>}
                                  </div>
                                  <p>{message.content}</p>
                                  <span className="message-time">
                                    {formatTime(message.created_at)}
                                  </span>
                                </div>
                                <div className="message-actions">
                                  {!message.is_read && (
                                    <button 
                                      className="mark-read-btn"
                                      onClick={() => handleMarkRead(message.id)}
                                    >
                                      标记已读
                                    </button>
                                  )}
                                  <button 
                                    className="delete-btn"
                                    onClick={() => handleDeleteMessage(message.id)}
                                  >
                                    删除
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {messagesTotalPages > 1 && (
                          <div className="pagination">
                            <div className="pagination-info">
                              <span>共 {messagesTotal} 条消息，第 {messagesPage} / {messagesTotalPages} 页</span>
                            </div>
                            <div className="pagination-controls">
                              <button 
                                className="pagination-btn prev" 
                                onClick={() => handleMessagesPageChange(messagesPage - 1)}
                                disabled={messagesPage === 1 || messagesLoading}
                              >
                                上一页
                              </button>
                              
                              <div className="pagination-numbers">
                                {Array.from({ length: messagesTotalPages }, (_, i) => i + 1).map(page => {
                                  // 显示逻辑：当前页前后各2页
                                  if (
                                    page === 1 || 
                                    page === messagesTotalPages || 
                                    (page >= messagesPage - 2 && page <= messagesPage + 2)
                                  ) {
                                    return (
                                      <button
                                        key={page}
                                        className={`pagination-btn ${page === messagesPage ? 'active' : ''}`}
                                        onClick={() => handleMessagesPageChange(page)}
                                        disabled={messagesLoading}
                                      >
                                        {page}
                                      </button>
                                    );
                                  } else if (
                                    page === messagesPage - 3 || 
                                    page === messagesPage + 3
                                  ) {
                                    return <span key={page} className="pagination-ellipsis">...</span>;
                                  }
                                  return null;
                                })}
                              </div>
                              
                              <button 
                                className="pagination-btn next" 
                                onClick={() => handleMessagesPageChange(messagesPage + 1)}
                                disabled={messagesPage === messagesTotalPages || messagesLoading}
                              >
                                下一页
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 我的关注标签页 */}
                {activeTab === 'following' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h2>我的关注</h2>
                      <p>管理您关注的新闻事件，接收后续发展提醒</p>
                      <div className="follow-stats">
                        <span>总关注数：{followStats.total_follows}</span>
                        <button 
                          onClick={() => {
                            fetchFollows(1);
                          }}
                          style={{marginLeft: '20px', padding: '5px 10px'}}
                        >
                          刷新关注列表
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="error-message">
                        <p>❌ {error}</p>
                        <button 
                          onClick={() => {
                            setError('');
                            fetchFollows(1);
                          }}
                          className="retry-btn"
                        >
                          🔄 重新加载
                        </button>
                      </div>
                    )}
                    
                    {followsLoading && follows.length === 0 ? (
                      <div className="loading">加载中...</div>
                    ) : (
                      <>
                        <div className="following-list">
                          {follows.length === 0 ? (
                             <div className="empty-state">
                               <div className="empty-icon">📋</div>
                               <h3>暂无关注的事件</h3>
                               <p>您还没有关注任何新闻事件，去首页发现感兴趣的内容吧！</p>
                               <div className="empty-actions">
                                 <Link to="/" className="browse-link">🏠 浏览首页</Link>
                                 <button 
                                   onClick={() => fetchFollows(1)}
                                   className="refresh-btn"
                                 >
                                   🔄 刷新列表
                                 </button>
                               </div>
                             </div>
                           ) : (
                            follows.map((follow, index) => (
                              <div key={follow.id || `follow-${index}`} className="following-item">
                                <div className="following-content">
                                   <div className="following-badges">
                                     <span className="event-id-badge">🏷️ 事件 #{follow.event_id}</span>
                                     <span className="follow-date-badge">
                                       ⏰ {formatTime(follow.created_at)}
                                     </span>
                                   </div>
                                   <h4 className="event-title">
                                     {follow.event_title || `未命名事件 (ID: ${follow.event_id})`}
                                   </h4>
                                   <p className="event-meta">
                                     📅 关注时间：{new Date(follow.created_at).toLocaleString('zh-CN', {
                                       year: 'numeric',
                                       month: '2-digit',
                                       day: '2-digit',
                                       hour: '2-digit',
                                       minute: '2-digit'
                                     })}
                                   </p>
                                 </div>
                                <div className="following-actions">
                                   <Link to={`/event/${follow.event_id}`}>
                                     <button className="view-btn">👁️ 查看详情</button>
                                   </Link>
                                   <button 
                                     className="unfollow-btn"
                                     onClick={() => {
                                       const eventName = follow.event_title || `事件 #${follow.event_id}`;
                                       if (window.confirm(`确定要取消关注「${eventName}」吗？\n\n取消后将不再接收该事件的更新通知。`)) {
                                         handleUnfollow(follow.event_id);
                                       }
                                     }}
                                     title="取消关注此事件"
                                   >
                                     ❌ 取消关注
                                   </button>
                                 </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {followsTotalPages > 1 && (
                          <div className="pagination">
                            <div className="pagination-info">
                              <span>共 {followsTotal} 个关注，第 {followsPage} / {followsTotalPages} 页</span>
                            </div>
                            <div className="pagination-controls">
                              <button 
                                className="pagination-btn prev" 
                                onClick={() => handleFollowsPageChange(followsPage - 1)}
                                disabled={followsPage === 1 || followsLoading}
                              >
                                上一页
                              </button>
                              
                              <div className="pagination-numbers">
                                {Array.from({ length: followsTotalPages }, (_, i) => i + 1).map(page => {
                                  // 显示逻辑：当前页前后各2页
                                  if (
                                    page === 1 || 
                                    page === followsTotalPages || 
                                    (page >= followsPage - 2 && page <= followsPage + 2)
                                  ) {
                                    return (
                                      <button
                                        key={page}
                                        className={`pagination-btn ${page === followsPage ? 'active' : ''}`}
                                        onClick={() => handleFollowsPageChange(page)}
                                        disabled={followsLoading}
                                      >
                                        {page}
                                      </button>
                                    );
                                  } else if (
                                    page === followsPage - 3 || 
                                    page === followsPage + 3
                                  ) {
                                    return <span key={page} className="pagination-ellipsis">...</span>;
                                  }
                                  return null;
                                })}
                              </div>
                              
                              <button 
                                className="pagination-btn next" 
                                onClick={() => handleFollowsPageChange(followsPage + 1)}
                                disabled={followsPage === followsTotalPages || followsLoading}
                              >
                                下一页
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 偏好设置标签页 */}
                {activeTab === 'preferences' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h2>偏好设置</h2>
                      <p>自定义您的个性化推荐体验</p>
                    </div>
                    
                    {/* 兴趣偏好 */}
                    <div className="preference-section">
                      <h3>兴趣偏好</h3>
                      <div className="categories-grid">
                        {["科技", "政治", "经济", "环境", "医疗", "教育", "体育", "娱乐", "军事"].map((category) => (
                          <label key={category} className="checkbox-item">
                            <input
                              type="checkbox"
                              defaultChecked={["科技", "经济", "环境"].includes(category)}
                            />
                            <span>{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 推荐设置 */}
                    <div className="preference-section">
                      <h3>推荐设置</h3>
                      <div className="switch-list">
                        <div className="switch-item">
                          <div>
                            <div className="switch-label">启用个性化推荐</div>
                            <div className="switch-desc">基于您的阅读历史和偏好推荐相关内容</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                          </label>
                        </div>
                        <div className="switch-item">
                          <div>
                            <div className="switch-label">热门事件推荐</div>
                            <div className="switch-desc">推荐当前热门和趋势事件</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button className="save-btn">保存偏好设置</button>
                  </div>
                )}

                {/* 系统设置标签页 */}
                {activeTab === 'settings' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <h2>通知设置</h2>
                      <p>管理您的通知偏好和隐私设置</p>
                    </div>
                    
                    <div className="settings-section">
                      <h3>通知设置</h3>
                      <div className="switch-list">
                        <div className="switch-item">
                          <div>
                            <div className="switch-label">关注事件更新</div>
                            <div className="switch-desc">当您关注的事件有新进展时接收通知</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                          </label>
                        </div>
                        <div className="switch-item">
                          <div>
                            <div className="switch-label">邮件通知</div>
                            <div className="switch-desc">通过邮件接收重要通知</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="settings-section">
                      <h3>隐私设置</h3>
                      <div className="switch-list">
                        <div className="switch-item">
                          <div>
                            <div className="switch-label">公开个人资料</div>
                            <div className="switch-desc">允许其他用户查看您的基本信息</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button className="save-btn">保存设置</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
