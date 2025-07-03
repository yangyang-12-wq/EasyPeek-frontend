import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import AIAnalysis from '../components/AIAnalysis';
import './EventDetailPage.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventData();
    fetchRelatedNews();
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/v1/events/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.code === 200 && result.data) {
        setEvent(result.data);
        setError(null);
      } else {
        throw new Error(result.message || '获取事件详情失败');
      }
    } catch (error) {
      console.error('获取事件详情失败:', error);
      setError('获取事件详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/events/${id}/news`);
      if (response.ok) {
        const result = await response.json();
        if (result.code === 200 && result.data) {
          setRelatedNews(result.data);
        }
      }
    } catch (error) {
      console.error('获取相关新闻失败:', error);
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取状态样式
  const getStatusClass = (status) => {
    return status === '进行中' ? 'ongoing' : 'completed';
  };

  // 获取影响力级别颜色
  const getImpactColor = (level) => {
    switch (level) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="event-detail-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载事件详情...</p>
        </div>
        <ThemeToggle />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-container">
        <Header />
        <div className="error-container">
          <h2>😔 加载失败</h2>
          <p>{error || '事件未找到'}</p>
          <Link to="/events" className="back-btn">返回事件列表</Link>
        </div>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="event-detail-container">
      <Header />
      
      <div className="event-detail-content">
        {/* 面包屑导航 */}
        <div className="breadcrumb">
          <Link to="/">首页</Link>
          <span className="separator">›</span>
          <Link to="/events">事件</Link>
          <span className="separator">›</span>
          <span className="current">{event.title}</span>
        </div>

        {/* 事件头部信息 */}
        <div className="event-header-card">
          {event.image && (
            <div className="event-image-container">
              <img src={event.image} alt={event.title} className="event-image" />
            </div>
          )}
          
          <div className="event-meta-info">
            <div className="event-badges">
              <span className="event-category">{event.category}</span>
              <span className={`event-status ${getStatusClass(event.status)}`}>
                {event.status}
              </span>
            </div>
            
            <h1 className="event-title">{event.title}</h1>
            
            <p className="event-description">{event.description}</p>
            
            <div className="event-time-info">
              <div className="time-item">
                <span className="time-label">开始时间:</span>
                <span className="time-value">{formatDateTime(event.start_time)}</span>
              </div>
              <div className="time-item">
                <span className="time-label">结束时间:</span>
                <span className="time-value">{formatDateTime(event.end_time)}</span>
              </div>
            </div>
            
            {event.location && (
              <div className="event-location">
                <span className="location-icon">📍</span>
                <span>{event.location}</span>
              </div>
            )}
            
            {/* 统计信息 */}
            <div className="event-stats">
              <div className="stat-item">
                <span className="stat-value">{event.view_count || 0}</span>
                <span className="stat-label">浏览量</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{event.like_count || 0}</span>
                <span className="stat-label">点赞数</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{event.comment_count || 0}</span>
                <span className="stat-label">评论数</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{event.hotness_score?.toFixed(1) || 0}</span>
                <span className="stat-label">热度指数</span>
              </div>
            </div>
            
            {/* 标签 */}
            {event.tags && (
              <div className="event-tags">
                <span className="tags-label">相关标签：</span>
                {JSON.parse(event.tags).map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 事件详情内容 */}
        {event.content && (
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">📋 事件详情</h2>
            </div>
            <div className="card-body">
              <div className="event-content">
                {event.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="content-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI分析 */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">🤖 AI智能分析</h2>
            <p className="card-subtitle">AI对事件的深度分析和趋势预测</p>
          </div>
          <div className="card-body">
            <AIAnalysis 
              type="event" 
              targetId={parseInt(id)} 
              showSteps={true}
            />
          </div>
        </div>

        {/* 相关新闻 */}
        {relatedNews && relatedNews.length > 0 && (
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">📰 相关新闻</h2>
              <p className="card-subtitle">与此事件相关的新闻报道</p>
            </div>
            <div className="card-body">
              <div className="related-news-grid">
                {relatedNews.map((news) => (
                  <Link 
                    key={news.id} 
                    to={`/newspage/${news.id}`}
                    className="related-news-card"
                  >
                    <div className="news-card-header">
                      <span className="news-category">{news.category}</span>
                      <span className="news-time">
                        {new Date(news.published_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <h3 className="news-title">{news.title}</h3>
                    <p className="news-summary">{news.summary}</p>
                    <div className="news-footer">
                      <span className="news-source">{news.source}</span>
                      <span className="read-more">阅读更多 →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 相关链接 */}
        {event.related_links && (
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">🔗 相关链接</h2>
            </div>
            <div className="card-body">
              <div className="related-links">
                {JSON.parse(event.related_links).map((link, index) => (
                  <a 
                    key={index} 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="related-link"
                  >
                    {link}
                    <span className="external-icon">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ThemeToggle />
    </div>
  );
};

export default EventDetailPage; 