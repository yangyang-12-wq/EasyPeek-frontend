import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import './search.css';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsPerPage] = useState(6); // 每页显示6条新闻
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hotKeywords, setHotKeywords] = useState([]);
  const [isSmartSearch, setIsSmartSearch] = useState(true); // 默认启用智能搜索

  const categories = [
    { name: "科技", count: 0 },
    { name: "政治", count: 0 },
    { name: "经济", count: 0 },
    { name: "环境", count: 0 },
    { name: "医疗", count: 0 },
    { name: "教育", count: 0 },
  ];

  // 获取热门关键词
  useEffect(() => {
    const fetchHotKeywords = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/news/hot-keywords?limit=15');
        const result = await response.json();
        
        if (result.code === 200 && result.data && result.data.length > 0) {
          setHotKeywords(result.data);
        } else {
          // 如果没有AI关键词，使用默认关键词
          setHotKeywords([
            "人工智能", "气候变化", "新能源", "区块链", "元宇宙",
            "量子计算", "生物技术", "太空探索", "5G技术", "电动汽车"
          ]);
        }
      } catch (err) {
        console.error('获取热门关键词失败:', err);
        // 使用默认关键词
        setHotKeywords([
          "人工智能", "气候变化", "新能源", "区块链", "元宇宙",
          "量子计算", "生物技术", "太空探索", "5G技术", "电动汽车"
        ]);
      }
    };

    fetchHotKeywords();
  }, []);

  // 执行搜索
  const performSearch = async (query, page = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      // 根据是否启用智能搜索选择不同的API端点
      const searchEndpoint = isSmartSearch ? 'smart-search' : 'search';
      const response = await fetch(
        `http://localhost:8080/api/v1/news/${searchEndpoint}?query=${encodeURIComponent(query)}&page=${page}&size=${newsPerPage}`
      );
      const result = await response.json();
      
      if (result.code === 200 && result.data) {
        // 转换数据格式以适配搜索页面
        const transformedData = result.data.map(news => ({
          id: news.id,
          title: news.title,
          summary: news.summary,
          category: news.category || '未分类',
          relevance: Math.floor(Math.random() * 30) + 70, // 模拟相关性分数
          published_at: news.published_at,
          source: news.source,
          author: news.author,
          image_url: news.image_url,
          view_count: news.view_count || 0,
          like_count: news.like_count || 0,
          comment_count: news.comment_count || 0,
        }));
        
        setSearchResults(transformedData);
        
        // 处理分页信息
        if (result.pagination) {
          setTotal(result.pagination.total);
        } else {
          setTotal(transformedData.length);
        }
      } else {
        setSearchResults([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('搜索失败:', err);
      setSearchResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 筛选和排序搜索结果
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...searchResults];

    // 按分类筛选
    if (selectedCategory !== 'all') {
      const categoryMap = {
        'tech': '科技',
        'politics': '政治',
        'economy': '经济',
        'environment': '环境',
        'health': '医疗',
        'education': '教育'
      };
      const targetCategory = categoryMap[selectedCategory];
      filtered = filtered.filter(result => 
        result.category === targetCategory || 
        result.category.includes(targetCategory)
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevance - a.relevance;
        case 'time':
          // 根据发布时间排序
          if (a.published_at && b.published_at) {
            return new Date(b.published_at) - new Date(a.published_at);
          }
          return 0;
        case 'popularity':
          return (b.view_count || 0) - (a.view_count || 0);
        default:
          return b.relevance - a.relevance;
      }
    });

    return filtered;
  }, [searchResults, selectedCategory, sortBy]);

  // 分页逻辑
  const totalPages = Math.ceil(total / newsPerPage);
  const currentResults = filteredAndSortedResults;

  // 分页处理函数
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (searchQuery.trim()) {
      performSearch(searchQuery, page);
    }
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 当筛选条件改变时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, timeFilter]);

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1);
    performSearch(searchQuery, 1);
  };

  // 处理关键词点击
  const handleKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    setCurrentPage(1);
    performSearch(keyword, 1);
  };

  // 处理分类点击
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // 处理新闻点击
  const handleNewsClick = (newsId) => {
    navigate(`/newspage/${newsId}`);
  };

  // 切换搜索模式
  const handleSearchModeToggle = () => {
    setIsSmartSearch(!isSmartSearch);
    if (searchQuery.trim()) {
      // 重新搜索以应用新的搜索模式
      performSearch(searchQuery, 1);
    }
  };

  return (
    <div className="searchpage-container">
      <Header />
      
      <div className="searchpage-content">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-header">
            <h1 className="search-title">智能搜索</h1>
            <p className="search-subtitle">
              {isSmartSearch 
                ? "基于AI分析的关键词和内容进行智能匹配搜索" 
                : "在新闻标题和内容中进行传统搜索"}
            </p>
          </div>

          {/* Search Bar */}
          <div className="search-bar-container">
            <div className="search-bar-wrapper">
              <div className="search-input-container">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={isSmartSearch ? "输入关键词进行智能搜索..." : "输入关键词搜索新闻事件..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button className="search-btn" onClick={handleSearch}>
                {isSmartSearch ? "🤖 智能搜索" : "🔍 搜索"}
              </button>
            </div>
            
            {/* 搜索模式切换 */}
            <div className="search-mode-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={isSmartSearch}
                  onChange={handleSearchModeToggle}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {isSmartSearch ? "🤖 AI智能搜索" : "🔍 传统搜索"}
                </span>
              </label>
            </div>
          </div>

          {/* Search Filters */}
          <div className="search-filters">
            <div className="filter-wrapper">
              <div className="filter-label">
                <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>筛选：</span>
              </div>

              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">全部分类</option>
                <option value="tech">科技</option>
                <option value="politics">政治</option>
                <option value="economy">经济</option>
                <option value="environment">环境</option>
                <option value="health">医疗</option>
                <option value="education">教育</option>
              </select>

              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">相关度</option>
                <option value="time">时间</option>
                <option value="popularity">热度</option>
              </select>

              <select
                className="filter-select"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all-time">全部时间</option>
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
              </select>
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* Sidebar */}
          <div className="sidebar">
            {/* Hot Keywords */}
            <div className="sidebar-card">
              <h3 className="card-title">
                {isSmartSearch ? "🤖 AI热门关键词" : "🔥 热门关键词"}
              </h3>
              <div className="keywords-container">
                {hotKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    className={`keyword-tag ${searchQuery === keyword ? 'active' : ''}`}
                    onClick={() => handleKeywordClick(keyword)}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="sidebar-card">
              <h3 className="card-title">分类浏览</h3>
              <div className="categories-list">
                {categories.map((category) => (
                  <div key={category.name} className="category-item">
                    <button
                      className="category-name"
                      onClick={() => handleCategoryClick(category.name.toLowerCase())}
                    >
                      {category.name}
                    </button>
                    <span className="category-count">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Tips */}
            <div className="sidebar-card">
              <h3 className="card-title">搜索技巧</h3>
              <div className="search-tips">
                {isSmartSearch ? (
                  <>
                    <div className="tip-item">• AI会分析关键词含义进行智能匹配</div>
                    <div className="tip-item">• 支持主题相关性搜索</div>
                    <div className="tip-item">• 自动匹配AI分析的关键词</div>
                    <div className="tip-item">• 包含事件关联新闻搜索</div>
                  </>
                ) : (
                  <>
                    <div className="tip-item">• 使用引号搜索精确短语</div>
                    <div className="tip-item">• 使用 + 号包含必需词汇</div>
                    <div className="tip-item">• 使用 - 号排除特定词汇</div>
                    <div className="tip-item">• 使用 OR 搜索多个选项</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            <div className="content-header">
              <h2 className="content-title">搜索结果</h2>
              <div className="results-count">
                找到 {total} 个相关结果
                {isSmartSearch && <span className="smart-badge">🤖 智能匹配</span>}
              </div>
            </div>

            {/* Search Results */}
            <div className="search-results">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>正在{isSmartSearch ? '智能' : ''}搜索结果...</p>
                </div>
              ) : (
                currentResults.map((result) => (
                  <div key={result.id} className="result-card" onClick={() => handleNewsClick(result.id)}>
                    <div className="result-header">
                      <div className="result-meta">
                        <span className="result-category">{result.category}</span>
                        <div className="result-relevance">相关度: {result.relevance}%</div>
                      </div>
                      <div className="result-time">
                        {result.published_at ? new Date(result.published_at).toLocaleDateString('zh-CN') : '未知时间'}
                      </div>
                    </div>

                    <h3 className="result-title">{result.title}</h3>
                    <p className="result-summary">{result.summary}</p>

                    <div className="result-footer">
                      <div className="result-stats">
                        <div className="stat-item">
                          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {result.view_count} 阅读
                        </div>
                        <div className="stat-item">
                          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {result.like_count} 点赞
                        </div>
                        <div className="stat-item">
                          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {result.comment_count} 评论
                        </div>
                      </div>

                      <button className="view-detail-btn">
                        查看详情
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 空状态显示 */}
            {!loading && currentResults.length === 0 && searchQuery && (
              <div className="no-results">
                <h3>未找到匹配的结果</h3>
                <p>尝试调整搜索关键词或切换搜索模式</p>
              </div>
            )}

            {/* 初始状态显示 */}
            {!loading && currentResults.length === 0 && !searchQuery && (
              <div className="no-results">
                <h3>开始您的{isSmartSearch ? '智能' : ''}搜索</h3>
                <p>输入关键词或点击热门标签开始搜索</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  <span>共 {total} 个结果，第 {currentPage} / {totalPages} 页</span>
                </div>
                <div className="pagination-controls">
                  <button
                    className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </button>
                  
                  {/* 页码按钮 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ThemeToggle className="fixed" />
    </div>
  );
};

export default SearchPage;
