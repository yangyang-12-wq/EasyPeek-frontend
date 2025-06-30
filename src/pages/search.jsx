import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import './search.css';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('人工智能');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsPerPage] = useState(6); // 每页显示6条新闻
  const navigate = useNavigate();

  // 模拟搜索结果数据
  const searchResults = [
    {
      id: 1,
      title: "科技巨头AI竞赛白热化",
      summary: "多家科技公司发布最新AI产品，市场竞争进入新阶段",
      category: "科技",
      timeline: "5个关键节点",
      followers: 1234,
      lastUpdate: "2小时前",
      relevance: 95,
    },
    {
      id: 2,
      title: "人工智能在医疗领域的突破",
      summary: "AI技术在疾病诊断和药物研发方面取得重大进展",
      category: "医疗",
      timeline: "3个关键节点",
      followers: 856,
      lastUpdate: "1天前",
      relevance: 88,
    },
    {
      id: 3,
      title: "自动驾驶技术最新发展",
      summary: "多家车企和科技公司在自动驾驶领域展开激烈竞争",
      category: "汽车",
      timeline: "7个关键节点",
      followers: 1567,
      lastUpdate: "3小时前",
      relevance: 82,
    },
    {
      id: 4,
      title: "AI芯片技术突破",
      summary: "新一代AI芯片性能大幅提升，功耗显著降低",
      category: "科技",
      timeline: "4个关键节点",
      followers: 2341,
      lastUpdate: "5小时前",
      relevance: 78,
    },
    {
      id: 5,
      title: "人工智能教育应用",
      summary: "AI技术在教育领域的创新应用，个性化学习成为可能",
      category: "教育",
      timeline: "6个关键节点",
      followers: 987,
      lastUpdate: "1天前",
      relevance: 75,
    },
    {
      id: 6,
      title: "AI在金融科技中的应用",
      summary: "人工智能技术推动金融行业数字化转型",
      category: "经济",
      timeline: "8个关键节点",
      followers: 1456,
      lastUpdate: "4小时前",
      relevance: 72,
    },
    {
      id: 7,
      title: "人工智能伦理讨论",
      summary: "社会各界对AI技术发展中的伦理问题展开深入讨论",
      category: "社会",
      timeline: "2个关键节点",
      followers: 654,
      lastUpdate: "2天前",
      relevance: 68,
    },
    {
      id: 8,
      title: "AI在环保领域的应用",
      summary: "人工智能技术助力环境保护和可持续发展",
      category: "环境",
      timeline: "5个关键节点",
      followers: 789,
      lastUpdate: "6小时前",
      relevance: 65,
    },
  ];

  const hotKeywords = [
    "人工智能",
    "气候变化",
    "新能源",
    "区块链",
    "元宇宙",
    "量子计算",
    "生物技术",
    "太空探索",
    "5G技术",
    "电动汽车",
  ];

  const categories = [
    { name: "科技", count: 1234 },
    { name: "政治", count: 856 },
    { name: "经济", count: 1567 },
    { name: "环境", count: 743 },
    { name: "医疗", count: 892 },
    { name: "教育", count: 456 },
  ];

  // 筛选和排序搜索结果
  const filteredAndSortedResults = useMemo(() => {
    let filtered = searchResults;

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
      filtered = filtered.filter(result => result.category === categoryMap[selectedCategory]);
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevance - a.relevance;
        case 'time':
          // 这里可以根据实际时间字段排序
          return 0;
        case 'popularity':
          return b.followers - a.followers;
        default:
          return b.relevance - a.relevance;
      }
    });

    return filtered;
  }, [searchResults, searchQuery, selectedCategory, sortBy]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredAndSortedResults.length / newsPerPage);
  const startIndex = (currentPage - 1) * newsPerPage;
  const endIndex = startIndex + newsPerPage;
  const currentResults = filteredAndSortedResults.slice(startIndex, endIndex);

  // 分页处理函数
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
  };

  // 处理关键词点击
  const handleKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    setCurrentPage(1);
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

  return (
    <div className="searchpage-container">
      <Header />
      
      <div className="searchpage-content">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-header">
            <h1 className="search-title">智能搜索</h1>
            <p className="search-subtitle">搜索感兴趣的新闻事件，追踪完整发展过程</p>
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
                  placeholder="输入关键词搜索新闻事件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button className="search-btn" onClick={handleSearch}>
                搜索
              </button>
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
              <h3 className="card-title">热门关键词</h3>
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
                <div className="tip-item">• 使用引号搜索精确短语</div>
                <div className="tip-item">• 使用 + 号包含必需词汇</div>
                <div className="tip-item">• 使用 - 号排除特定词汇</div>
                <div className="tip-item">• 使用 OR 搜索多个选项</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            <div className="content-header">
              <h2 className="content-title">搜索结果</h2>
              <div className="results-count">找到 {filteredAndSortedResults.length} 个相关结果</div>
            </div>

            {/* Search Results */}
            <div className="search-results">
              {currentResults.map((result) => (
                <div key={result.id} className="result-card" onClick={() => handleNewsClick(result.id)}>
                  <div className="result-header">
                    <div className="result-meta">
                      <span className="result-category">{result.category}</span>
                      <div className="result-relevance">相关度: {result.relevance}%</div>
                    </div>
                    <div className="result-time">{result.lastUpdate}</div>
                  </div>

                  <h3 className="result-title">{result.title}</h3>
                  <p className="result-summary">{result.summary}</p>

                  <div className="result-footer">
                    <div className="result-stats">
                      <div className="stat-item">
                        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {result.timeline}
                      </div>
                      <div className="stat-item">
                        <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {result.followers} 关注
                      </div>
                    </div>

                    <button className="view-detail-btn">
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 空状态显示 */}
            {filteredAndSortedResults.length === 0 && (
              <div className="no-results">
                <h3>未找到匹配的结果</h3>
                <p>尝试调整搜索关键词或筛选条件</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  <span>共 {filteredAndSortedResults.length} 个结果，第 {currentPage} / {totalPages} 页</span>
                </div>
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn prev" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </button>
                  
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      // 显示逻辑：当前页前后各2页
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 3 || 
                        page === currentPage + 3
                      ) {
                        return <span key={page} className="pagination-ellipsis">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button 
                    className="pagination-btn next" 
                    onClick={() => handlePageChange(currentPage + 1)}
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
