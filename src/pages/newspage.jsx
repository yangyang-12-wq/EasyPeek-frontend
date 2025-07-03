import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import ThemeToggle from "../components/ThemeToggle";
import AIAnalysis from "../components/AIAnalysis";
import "./newspage.css";

export default function NewsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  

  // AI总结和原文切换状态
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  // 筛选相关状态
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' 或 'hot'
  const [allCategories, setAllCategories] = useState([]);

  // 评论相关状态
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const COMMENTS_PAGE_SIZE = 5;
  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  // 格式化新闻数据，处理字段映射
  const formatNewsData = (rawData) => {
    if (!rawData) return null;
    
    return {
      ...rawData,
      // 处理字段映射
      readCount: rawData.view_count || 0,
      likeCount: rawData.like_count || 0,
      commentCount: rawData.comment_count || 0,
      followCount: rawData.follow_count || 0,
      tags: Array.isArray(rawData.tags) ? rawData.tags : (rawData.tags ? rawData.tags.split(',').map(tag => tag.trim()) : []),
      aiPrediction: rawData.ai_prediction || "暂无AI预测分析",
      // 格式化时间
      published_at: rawData.published_at ? new Date(rawData.published_at).toLocaleString('zh-CN') : '',
    };
  };

  // 格式化相关新闻数据
  const formatRelatedNews = (newsList) => {
    return newsList.map(news => ({
      ...news,
      published_at: news.published_at ? new Date(news.published_at).toLocaleString('zh-CN') : ''
    }));
  };

  // 获取当前用户ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/api/v1/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.code === 200 && res.data) setCurrentUserId(res.data.id);
        });
    }
  }, []);

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/news?limit=100`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.code === 200 && result.data) {
        // 提取所有分类并去重
        const categories = [...new Set(result.data.map(news => news.category).filter(Boolean))];
        setAllCategories(categories);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
      setAllCategories(['科技', '政治', '经济', '环境', '医疗', '教育']); // 默认分类
    }
  };

  // 获取筛选后的新闻
  const fetchFilteredNews = async (newsId) => {
    try {
      setRelatedLoading(true);
      
      let endpoint = '';
      let queryParams = new URLSearchParams();
      
      // 根据分类和排序方式选择API端点
      if (selectedCategory !== 'all') {
        // 使用按分类筛选的API
        endpoint = `/category/${selectedCategory}`;
        queryParams.append('sort', sortBy);
        queryParams.append('limit', '20');
      } else {
        // 使用原有的热门或最新API
        if (sortBy === 'hot') {
          endpoint = '/hot';
        } else {
          endpoint = '/latest';
        }
        queryParams.append('limit', '20');
      }
      
      const response = await fetch(`http://localhost:8080/api/v1/news${endpoint}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.code === 200 && result.data) {
        // 过滤掉当前新闻
        const filtered = result.data.filter(news => news.id !== parseInt(newsId));
        
        const formattedRelated = formatRelatedNews(filtered.slice(0, 6));
        setRelatedNews(formattedRelated);
      }
    } catch (error) {
      console.error('获取筛选新闻失败:', error);
      setRelatedNews([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  // 获取AI分析数据
  const fetchAIAnalysis = async (newsId) => {
    try {
      setAiAnalysisLoading(true);
      const response = await fetch(`http://localhost:8080/api/v1/ai/analysis?type=news&target_id=${newsId}`);
      if (!response.ok) {
        if (response.status === 404) {
          // AI分析不存在，提供友好提示
          console.log('AI分析不存在，提示触发分析');
          const noAnalysisData = {
            summary: "⚠️ 该新闻尚未进行AI智能分析。您可以点击下方按钮手动触发AI分析。",
            keywords: '["待分析"]',
            sentiment: "未分析",
            sentiment_score: 0,
            status: "not_analyzed",
            show_analyze_button: true,
            created_at: new Date().toISOString()
          };
          setAiAnalysisData(noAnalysisData);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.code === 200 && result.data) {
        // 检查分析状态
        if (result.data.status === 'failed') {
          const failedData = {
            summary: "❌ AI分析处理失败。这可能是由于网络连接问题或AI服务暂时不可用。您可以尝试重新分析。",
            keywords: '["分析失败", "请重试"]',
            sentiment: "系统错误",
            sentiment_score: 0,
            status: "failed",
            show_retry_button: true,
            created_at: result.data.created_at || new Date().toISOString()
          };
          setAiAnalysisData(failedData);
        } else if (result.data.status === 'processing') {
          const processingData = {
            summary: "🔄 AI正在分析中，请稍候...",
            keywords: '["正在分析"]',
            sentiment: "处理中",
            sentiment_score: 0,
            status: "processing",
            show_refresh_button: true,
            created_at: result.data.created_at || new Date().toISOString()
          };
          setAiAnalysisData(processingData);
        } else {
          // 分析成功
          setAiAnalysisData(result.data);
        }
      } else {
        // 如果没有数据，使用模拟数据展示功能
        const mockAIData = {
          summary: "🤖 AI智能摘要演示：本文涵盖重要议题，内容详实，观点平衡。通过深度学习算法分析，为读者提供了精准的信息提取和核心要点总结。",
          keywords: '["AI演示", "智能分析", "核心要点", "深度学习"]',
          sentiment: "中性偏正面",
          sentiment_score: 0.65,
          status: "demo_mode",
          model_name: "演示模式",
          created_at: new Date().toISOString()
        };
        setAiAnalysisData(mockAIData);
      }
    } catch (error) {
      console.error('获取AI分析失败:', error);
      // 网络错误时提供演示数据和重试选项
      const errorData = {
        summary: "🔌 网络连接失败。以下是AI智能分析功能的演示效果：本文通过深度学习算法分析，提取关键信息，为读者呈现精炼摘要。",
        keywords: '["网络错误", "演示数据", "智能分析", "核心内容"]',
        sentiment: "演示模式",
        sentiment_score: 0.5,
        status: "network_error",
        show_retry_button: true,
        model_name: "演示系统",
        created_at: new Date().toISOString()
      };
      setAiAnalysisData(errorData);
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // 触发AI分析
  const triggerAIAnalysis = async (newsId) => {
    try {
      setAiAnalysisLoading(true);
      const processingData = {
        summary: "🔄 正在启动AI分析引擎，请稍候...",
        keywords: '["正在分析"]',
        sentiment: "处理中",
        sentiment_score: 0,
        status: "processing",
        created_at: new Date().toISOString()
      };
      setAiAnalysisData(processingData);

      const response = await fetch(`http://localhost:8080/api/v1/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'news',
          target_id: parseInt(newsId),
          options: {
            enable_summary: true,
            enable_keywords: true,
            enable_sentiment: true,
            enable_trends: false,
            enable_impact: true,
            show_analysis_steps: true
          }
        })
      });

      if (response.ok) {
        // 分析请求成功，等待3秒后重新获取结果
        setTimeout(() => {
          fetchAIAnalysis(newsId);
        }, 3000);
      } else {
        throw new Error('AI分析请求失败');
      }
    } catch (error) {
      console.error('触发AI分析失败:', error);
      const errorData = {
        summary: "❌ 无法启动AI分析。可能是服务暂时不可用或网络连接问题。请稍后重试或联系技术支持。",
        keywords: '["服务不可用", "请重试"]',
        sentiment: "系统错误",
        sentiment_score: 0,
        status: "service_error",
        show_retry_button: true,
        created_at: new Date().toISOString()
      };
      setAiAnalysisData(errorData);
      setAiAnalysisLoading(false);
    }
  };

  // 获取事件时间线数据
  const fetchEventTimeline = async (eventId) => {
    if (!eventId) return null;
    
    try {
      const response = await fetch(`http://localhost:8080/api/v1/events/${eventId}/news`);
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      if (result.code === 200 && result.data) {
        // 将新闻列表转换为时间线格式
        const timeline = result.data.map((news, index) => ({
          date: news.published_at ? new Date(news.published_at).toLocaleDateString('zh-CN') : '',
          time: news.published_at ? new Date(news.published_at).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}) : '',
          title: news.title,
          content: news.summary || news.content?.substring(0, 100) + '...',
          importance: index === 0 ? 'high' : (index < 3 ? 'medium' : 'low'),
          sources: [news.source || '未知来源']
        }));
        return timeline;
      }
      return null;
    } catch (error) {
      console.error('获取事件时间线失败:', error);
      return null;
    }
  };

  // 所属事件配置
  const eventConfig = {
    "AI技术发展": { label: "AI技术发展", bgColor: "rgba(59, 130, 246, 0.9)" },
    "气候变化会议": { label: "气候变化会议", bgColor: "rgba(16, 185, 129, 0.9)" },
    "新能源汽车发展": { label: "新能源汽车发展", bgColor: "rgba(245, 158, 11, 0.9)" },
  };

  useEffect(() => {
    // 从后端API获取新闻详情
    const fetchNewsData = async () => {
      try {
        setLoading(true);

        // 调用后端API获取新闻详情
        const response = await fetch(`http://localhost:8080/api/v1/news/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
         if (result.code === 200 && result.data) {
           const formattedData = formatNewsData(result.data);
           
           // 如果新闻属于某个事件，获取事件时间线
           if (formattedData.belonged_event_id) {
             const timeline = await fetchEventTimeline(formattedData.belonged_event_id);
             if (timeline) {
               formattedData.timeline = timeline;
             }
           }
           
           // 如果没有时间线数据，使用模拟数据
           if (!formattedData.timeline) {
             const mockTimeline = [
               {
                 date: new Date().toLocaleDateString('zh-CN'),
                 time: "10:30",
                 title: "新闻事件首次报道",
                 content: "该事件首次被媒体关注并进行深度报道，引起了社会各界的广泛关注。",
                 importance: "high",
                 sources: ["新华社", "人民日报"]
               },
               {
                 date: new Date(Date.now() - 24*60*60*1000).toLocaleDateString('zh-CN'),
                 time: "14:20",
                 title: "事件进一步发展",
                 content: "随着时间推移，事件出现了新的进展，相关部门开始介入调查。",
                 importance: "medium",
                 sources: ["央视新闻"]
               },
               {
                 date: new Date(Date.now() - 48*60*60*1000).toLocaleDateString('zh-CN'),
                 time: "16:45",
                 title: "背景信息披露",
                 content: "相关背景信息逐渐披露，事件的来龙去脉更加清晰。",
                 importance: "low",
                 sources: ["财新网", "澎湃新闻"]
               }
             ];
             formattedData.timeline = mockTimeline;
           }
           
           setNewsData(formattedData);
           setError(null);

           // 获取相关新闻 - 传入当前新闻的标签
           fetchRelatedNews(id, formattedData.tags);
           // 获取AI分析数据
           fetchAIAnalysis(id);

         } else {
           throw new Error(result.message || '获取新闻详情失败');
         }
      } catch (error) {
        console.error('获取新闻详情失败:', error);
        setError("获取新闻详情失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
    fetchCategories(); // 获取分类列表
  }, [id]);

  // 当筛选条件改变时重新获取相关新闻
  useEffect(() => {
    if (id) {
      fetchFilteredNews(id);
    }
  }, [selectedCategory, sortBy, id]);

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

  // 解析标签字符串
  const parseTags = (tagsString) => {
    if (!tagsString) return [];
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  // 格式化评论数据
  const formatComments = (commentsList) => {
    return commentsList.map(comment => ({
      ...comment,
      created_at: comment.created_at ? new Date(comment.created_at).toLocaleString('zh-CN') : ''
    }));
  };

  // 获取新闻评论，支持分页和追加
  const fetchComments = async (newsId, page = 1, append = false) => {
    setCommentsLoading(true);
    try {
      const url = `http://localhost:8080/api/v1/comments/news/${newsId}?page=${page}&size=${COMMENTS_PAGE_SIZE}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        const formattedComments = formatComments(result.data);
        setCommentsTotal(result.total || 0);
        if (append) {
          setComments(prev => [...prev, ...formattedComments]);
        } else {
          setComments(formattedComments);
        }
      } else {
        setComments([]);
        setCommentsTotal(0);
      }
    } catch (e) {
      setComments([]);
      setCommentsTotal(0);
    } finally {
      setCommentsLoading(false);
    }
  };

  // 发表评论
  const handleSubmitComment = async () => {
    if (!commentInput.trim()) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/v1/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ news_id: Number(id), content: commentInput.trim() })
      });
      const result = await res.json();
      if (result.code === 200) {
        setCommentInput('');
        setComments([]);
        setCommentsPage(1);
        fetchComments(id, 1, false);
      } else {
        alert(result.message || '评论失败');
      }
    } catch (e) {
      alert('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/v1/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.code === 200) {
        setComments([]);
        setCommentsPage(1);
        fetchComments(id, 1, false);
      } else {
        alert(result.message || '删除失败');
      }
    } catch (e) {
      alert('删除失败');
    }
  };

  // 加载更多评论
  const handleLoadMoreComments = () => {
    const nextPage = commentsPage + 1;
    setCommentsPage(nextPage);
    fetchComments(id, nextPage, true);
  };

  // 首次加载和切换新闻时，重置评论
  useEffect(() => {
    setComments([]);
    setCommentsPage(1);
    fetchComments(id, 1, false);
  }, [id]);

  // 加载状态
  if (loading) {
    return (
      <div className="newspage-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载新闻详情...</p>
        </div>
        <ThemeToggle className="fixed" />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="newspage-container">
        <Header />
        <div className="error-container">
          <h2>😔 加载失败</h2>
          <p>{error}</p>
          <button className="back-btn" onClick={() => window.history.back()}>
            返回上一页
          </button>
        </div>
        <ThemeToggle className="fixed" />
      </div>
    );
  }

  return (
    <div className="newspage-container">
      <Header />

      <div className="newspage-content">
        <div className="news-detail-grid">
          {/* 主要内容区域 */}
          <div className="main-content">
            {/* 新闻头部信息 */}
            <div className="content-card">
              <div className="news-header-section">
                <div className="news-tags">
                  <div className="news-category-badge">
                    {newsData.category}
                  </div>

                  {newsData.belonged_event && (
                    <div 
                      className="news-event-badge"
                      style={{
                        backgroundColor: eventConfig[newsData.belonged_event]?.bgColor || "rgba(107, 114, 128, 0.9)"
                      }}
                    >
                      {eventConfig[newsData.belonged_event]?.label || newsData.belonged_event}
                    </div>
                  )}
                </div>
                
                <h1 className="news-title">{newsData.title}</h1>
                <p className="news-summary">{newsData.summary}</p>
                
                <div className="news-meta">
                  <span className="news-time">{formatTime(newsData.published_at)}</span>
                  <span className="news-source">{newsData.source}</span>
                  {newsData.author && <span className="news-author">作者: {newsData.author}</span>}
                </div>

                {/* 统计信息 */}
                <div className="news-stats">
                  <div className="stat-item">
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="stat-value">{newsData.view_count || 0}</span>
                    <span className="stat-label">阅读量</span>
                  </div>
                  <div className="stat-item">
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="stat-value">{newsData.like_count || 0}</span>
                    <span className="stat-label">点赞数</span>
                  </div>
                  <div className="stat-item">
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="stat-value">{newsData.comment_count || 0}</span>
                    <span className="stat-label">评论数</span>
                  </div>
                  <div className="stat-item">
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="stat-value">{newsData.share_count || 0}</span>
                    <span className="stat-label">分享数</span>
                  </div>
                </div>

                {/* 热度分数 */}
                {newsData.hotness_score && (
                  <div className="hotness-score">
                    <span className="hotness-label">热度指数:</span>
                    <span className="hotness-value">{newsData.hotness_score.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 新闻内容 */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">📰 新闻内容</h2>
                
                {/* AI总结/原文切换开关 */}
                <div className="content-toggle-section">
                  <div className="toggle-wrapper">
                    <span className={`toggle-label ${!showAISummary ? 'active' : ''}`}>
                      原文
                    </span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={showAISummary}
                        onChange={(e) => setShowAISummary(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`toggle-label ${showAISummary ? 'active' : ''}`}>
                      <span className="ai-icon">🤖</span>
                      AI总结
                    </span>
                  </div>
                  
                  {showAISummary && !aiAnalysisData && !aiAnalysisLoading && (
                    <div className="ai-notice">
                      <span className="ai-notice-text">暂无AI分析数据</span>
                    </div>
                  )}
                  
                  {showAISummary && aiAnalysisLoading && (
                    <div className="ai-notice">
                      <span className="ai-notice-text">正在加载AI分析...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-body">
                {/* 条件渲染：AI总结或原文 */}
                {showAISummary ? (
                  /* AI总结内容 */
                  <div className="ai-summary-content">
                    {aiAnalysisData ? (
                      <div className="ai-analysis-display">
                        {/* AI摘要 */}
                        {aiAnalysisData.summary && (
                          <div className="ai-section">
                            <h3 className="ai-section-title">
                              <span className="ai-icon">📝</span>
                              智能摘要
                            </h3>
                            <div className="ai-summary-text">
                              {aiAnalysisData.summary}
                            </div>
                          </div>
                        )}
                        
                        {/* 关键词 */}
                        {aiAnalysisData.keywords && (
                          <div className="ai-section">
                            <h3 className="ai-section-title">
                              <span className="ai-icon">🏷️</span>
                              关键词
                            </h3>
                            <div className="ai-keywords">
                              {(() => {
                                try {
                                  const keywords = JSON.parse(aiAnalysisData.keywords);
                                  return keywords.map((keyword, index) => (
                                    <span key={index} className="ai-keyword-tag">
                                      {keyword}
                                    </span>
                                  ));
                                } catch {
                                  return <span className="ai-keyword-tag">{aiAnalysisData.keywords}</span>;
                                }
                              })()}
                            </div>
                          </div>
                        )}
                        
                        {/* 情感分析 */}
                        {aiAnalysisData.sentiment && (
                          <div className="ai-section">
                            <h3 className="ai-section-title">
                              <span className="ai-icon">😊</span>
                              情感倾向
                            </h3>
                            <div className="sentiment-analysis">
                              <span className={`sentiment-tag sentiment-${aiAnalysisData.sentiment}`}>
                                {aiAnalysisData.sentiment === 'positive' ? '正面' :
                                 aiAnalysisData.sentiment === 'negative' ? '负面' : '中性'}
                              </span>
                              {aiAnalysisData.sentiment_score && (
                                <span className="sentiment-score">
                                  置信度: {(aiAnalysisData.sentiment_score * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* 分析时间 */}
                        {aiAnalysisData.created_at && (
                          <div className="ai-meta">
                            <span className="ai-meta-text">
                              分析时间: {new Date(aiAnalysisData.created_at).toLocaleString('zh-CN')}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-ai-content">
                        <div className="no-ai-icon">🤖</div>
                        <h3>触发分析失败</h3>
                        <p>该新闻还没有进行AI分析，或者分析数据获取失败。</p>
                        <button 
                          className="retry-btn" 
                          onClick={() => fetchAIAnalysis(id)}
                          disabled={aiAnalysisLoading}
                        >
                          {aiAnalysisLoading ? '正在加载...' : '重试'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 原文内容 */
                  <div className="original-content">
                    {/* 新闻图片 */}
                    {newsData.image_url && (
                      <div className="news-image-container">
                        <img 
                          src={newsData.image_url} 
                          alt={newsData.title}
                          className="news-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="news-content">
                      {newsData.content && newsData.content.split('\n').map((paragraph, index) => {
                        // 检查段落是否包含图片链接
                        const imageUrlRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?/gi;
                        const imageUrls = paragraph.match(imageUrlRegex);
                        
                        if (imageUrls && imageUrls.length > 0) {
                          // 如果段落包含图片链接，渲染图片
                          return (
                            <div key={index} className="paragraph-with-images">
                              {imageUrls.map((imageUrl, imgIndex) => (
                                <div key={imgIndex} className="embedded-image-container">
                                  <img 
                                    src={imageUrl.trim()} 
                                    alt={`新闻图片 ${imgIndex + 1}`}
                                    className="embedded-news-image"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                      e.target.style.display = 'block';
                                    }}
                                  />
                                </div>
                              ))}
                              {/* 显示去除图片链接后的文本 */}
                              {paragraph.replace(imageUrlRegex, '').trim() && (
                                <p className="news-paragraph">
                                  {paragraph.replace(imageUrlRegex, '').trim()}
                                </p>
                              )}
                            </div>
                          );
                        } else {
                          // 普通文本段落
                          return (
                            <p key={index} className="news-paragraph">
                              {paragraph}
                            </p>
                          );
                        }
                      })}
                    </div>
                    
                    {/* 标签区域 */}

                    {newsData.tags && Array.isArray(newsData.tags) && newsData.tags.length > 0 && (
                      <div className="news-tags-section">
                        <span className="tags-label">相关标签：</span>
                        <div className="tags-container">
                          {newsData.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI分析 */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">🤖 AI智能分析</h2>
                <p className="card-subtitle">AI对新闻内容的深度解读</p>
              </div>
              <div className="card-body">
                <AIAnalysis 
                  type="news" 
                  targetId={parseInt(id)} 
                  showSteps={true}
                />
              </div>
            </div>

            {/* 事件时间线 */}
            {newsData.timeline && newsData.timeline.length > 0 ? (
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">📅 事件时间线</h2>
                  <p className="card-subtitle">完整追踪事件发展过程</p>
                </div>
                <div className="card-body">
                  <div className="timeline-container">
                    {newsData.timeline.map((event, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-connector">
                          <div className="timeline-dot">
                            {index + 1}
                          </div>
                          {index !== newsData.timeline.length - 1 && (
                            <div className="timeline-line"></div>
                          )}
                        </div>
                        
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-date">{event.date} {event.time}</span>
                            <span className={`timeline-importance ${event.importance}`}>
                              {event.importance === "high" ? "重要" : "一般"}
                            </span>
                          </div>
                          
                          <h4 className="timeline-title">{event.title}</h4>
                          <p className="timeline-description">{event.content}</p>
                          
                          {event.sources && event.sources.length > 0 && (
                            <div className="timeline-sources">
                              <span className="sources-label">消息来源：</span>
                              <div className="sources-tags">
                                {event.sources.map((source, idx) => (
                                  <span key={idx} className="source-tag">{source}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">📅 事件时间线</h2>
                  <p className="card-subtitle">完整追踪事件发展过程</p>
                </div>
                <div className="card-body">
                  <div className="timeline-empty">
                    <p>暂无相关事件时间线数据</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="sidebar">
            {/* 关注按钮 */}
            <div className="sidebar-card">
              <div className="follow-section">
                <button className="follow-btn">
                  👥 关注此新闻 ({newsData.share_count || 0})
                </button>
                <p className="follow-desc">关注后将收到相关新闻提醒</p>
              </div>
            </div>

            {/* 相关新闻 */}
            <div className="sidebar-card">
              <h3 className="card-title">相关新闻</h3>
              
              {/* 筛选控件 */}
              <div className="news-filters">
                {/* 排序方式 */}
                <div className="filter-group">
                  <label className="filter-label">排序方式</label>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${sortBy === 'latest' ? 'active' : ''}`}
                      onClick={() => setSortBy('latest')}
                    >
                      最新发布
                    </button>
                    <button 
                      className={`filter-btn ${sortBy === 'hot' ? 'active' : ''}`}
                      onClick={() => setSortBy('hot')}
                    >
                      热度最高
                    </button>
                  </div>
                </div>

                {/* 分类筛选 */}
                <div className="filter-group">
                  <label className="filter-label">新闻分类</label>
                  <select 
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">全部分类</option>
                    {allCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="related-news-list">
                {relatedLoading ? (
                  <div className="loading-container">
                    <p>正在加载相关新闻...</p>
                  </div>
                ) : relatedNews.length > 0 ? (
                  relatedNews.map((news) => (
                    <div key={news.id} className="related-news-item" onClick={() => window.location.href = `/newspage/${news.id}`}>
                      <div className="related-news-header">
                        <div className="related-news-category">{news.category}</div>
                        <span className="related-news-time">{news.published_at}</span>
                      </div>
                      <h4 className="related-news-title">{news.title}</h4>
                      <p className="related-news-summary">{news.summary}</p>
                      <div className="related-news-source">{news.source}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-related-news">
                    <p>暂无相关新闻</p>
                  </div>
                )}
              </div>
            </div>

            {/* 热门评论 */}
            <div className="sidebar-card">
              <h3 className="card-title">💬 热门评论 ({commentsTotal})</h3>
              {/* 评论输入框 */}
              <div className="comment-input-row">
                <input
                  className="comment-input"
                  placeholder="哎呦，不错哦，发条评论吧"
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  maxLength={1000}
                  disabled={submitting}
                />
                <button
                  className="comment-submit-btn"
                  onClick={handleSubmitComment}
                  disabled={submitting || !commentInput.trim()}
                >
                  发布
                </button>
              </div>
              <div className="comments-list">
                {commentsLoading ? (
                  <div className="loading-container"><p>正在加载评论...</p></div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-avatar">用</div>
                      <div className="comment-content">
                        <div className="comment-author">用户 {comment.user_id}</div>
                        <div className="comment-text">{comment.content}</div>
                        <div className="comment-time">{comment.created_at}</div>
                      </div>
                      {/* 删除按钮，仅显示在自己评论右侧 */}
                      {currentUserId === comment.user_id && (
                        <div className="comment-actions">
                          <span
                            className="comment-action-dot"
                            onClick={() => {
                              setDeleteTargetId(comment.id);
                              setShowDeleteConfirm(true);
                            }}
                          >···</span>
                          {showDeleteConfirm && deleteTargetId === comment.id && (
                            <div className="comment-delete-confirm">
                              <span
                                className="comment-delete-btn"
                                onClick={() => {
                                  setShowDeleteConfirm(false);
                                  handleDeleteComment(comment.id);
                                }}
                              >删除</span>
                              <span
                                className="comment-cancel-btn"
                                onClick={() => setShowDeleteConfirm(false)}
                              >取消</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-comments"><p>暂无评论</p></div>
                )}
              </div>
              {comments.length < commentsTotal && (
                <button className="view-all-comments-btn" onClick={handleLoadMoreComments}>
                  查看更多评论
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 浮动按钮组 */}
      <ThemeToggle className="fixed" />
    </div>
  );
}