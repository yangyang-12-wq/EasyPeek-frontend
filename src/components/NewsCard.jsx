import React from 'react';
import './NewsCard.css';

const NewsCard = ({ news, eventConfig, onNewsClick }) => {
  // 格式化时间显示
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  return (
    <div className="news-item" onClick={() => onNewsClick(news.id)}>
      <div className="news-header">
        {/* 新闻分类标签 - 左上角 */}
        <div className="news-category-badge">
          {news.category}
        </div>
        {/* 新闻图片 - 如果有的话 */}
        {news.image_url && (
          <div className="news-image-container">
            <img 
              src={news.image_url} 
              alt={news.title}
              className="news-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      <h3 className="news-title">{news.title}</h3>
      <p className="news-summary">{news.summary}</p>
      <div className="news-meta">
        <span className="news-time">{formatTime(news.published_at)}</span>
        <span className="news-source">{news.source}</span>
        {news.author && <span className="news-author">作者: {news.author}</span>}
      </div>
      {/* 统计信息 */}
      <div className="news-stats">
        <span className="stat-item">
          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {news.view_count || 0}
        </span>
        <span className="stat-item">
          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {news.like_count || 0}
        </span>
        <span className="stat-item">
          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {news.comment_count || 0}
        </span>
      </div>
    </div>
  );
};

export default NewsCard;