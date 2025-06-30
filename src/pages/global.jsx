import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import './global.css';

const GlobalPage = () => {
  const [currentView, setCurrentView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importanceFilter, setImportanceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    category: 'all',
    sortBy: 'latest',
    status: 'all',
    importance: 'all',
    search: ''
  });
  const [isFilterChanged, setIsFilterChanged] = useState(false);
  const [newsPerPage] = useState(3); // 每页显示3条新闻
  const [timelineSortOrder, setTimelineSortOrder] = useState('desc'); // 时间线排序：desc-最新在前，asc-最早在前
  const navigate = useNavigate();

  // 新闻分类数据
  const categories = [
    { id: "all", name: "全部", count: 1234, color: "bg-gray-100" },
    { id: "tech", name: "科技", count: 456, color: "bg-blue-100" },
    { id: "politics", name: "政治", count: 234, color: "bg-red-100" },
    { id: "economy", name: "经济", count: 345, color: "bg-green-100" },
    { id: "environment", name: "环境", count: 123, color: "bg-emerald-100" },
    { id: "health", name: "医疗", count: 89, color: "bg-purple-100" },
    { id: "education", name: "教育", count: 67, color: "bg-yellow-100" },
    { id: "sports", name: "体育", count: 156, color: "bg-orange-100" },
  ];

  // 复用HomePage.jsx中的新闻数据结构
  const globalNewsData = [
    {
      id: 1,
      title: "全球气候变化新进展：联合国气候大会达成重要共识",
      content: "第28届联合国气候变化大会在迪拜闭幕，各国就减排目标和气候资金达成新的协议，为全球应对气候变化提供了新的路径。",
      summary: "第28届联合国气候变化大会在迪拜闭幕，各国就减排目标和气候资金达成新的协议，为全球应对气候变化提供了新的路径。",
      source: "环球时报",
      category: "环境",
      published_at: "2024-01-15 10:30",
      created_by: 1,
      is_active: true,
      belonged_event: "气候变化会议",
    },
    {
      id: 2,
      title: "美国大选最新动态：两党候选人展开激烈辩论",
      content: "美国总统大选进入关键阶段，民主党和共和党候选人在全国电视辩论中就经济、外交、医疗等议题展开激烈交锋。",
      summary: "美国总统大选进入关键阶段，民主党和共和党候选人在全国电视辩论中就经济、外交、医疗等议题展开激烈交锋。",
      source: "CNN",
      category: "政治",
      published_at: "2024-01-14 16:45",
      created_by: 1,
      is_active: true,
      belonged_event: "美国大选",
    },
    {
      id: 3,
      title: "欧洲央行宣布新的货币政策措施",
      content: "欧洲央行在最新会议上宣布调整利率政策，并推出新的量化宽松措施以应对经济下行压力。",
      summary: "欧洲央行在最新会议上宣布调整利率政策，并推出新的量化宽松措施以应对经济下行压力。",
      source: "路透社",
      category: "经济",
      published_at: "2024-01-13 14:20",
      created_by: 1,
      is_active: true,
      belonged_event: "欧洲经济政策",
    },
    {
      id: 4,
      title: "日本福岛核电站处理水排放引发国际关注",
      content: "日本政府开始向海洋排放福岛核电站处理水，引发周边国家和国际社会的广泛关注和争议。",
      summary: "日本政府开始向海洋排放福岛核电站处理水，引发周边国家和国际社会的广泛关注和争议。",
      source: "日本时报",
      category: "环境",
      published_at: "2024-01-12 09:15",
      created_by: 1,
      is_active: true,
      belonged_event: "福岛核电站",
    },
    {
      id: 5,
      title: "印度成功发射月球探测器",
      content: "印度空间研究组织成功发射月球探测器，计划在月球南极着陆，这将使印度成为第四个实现月球软着陆的国家。",
      summary: "印度空间研究组织成功发射月球探测器，计划在月球南极着陆，这将使印度成为第四个实现月球软着陆的国家。",
      source: "印度时报",
      category: "科技",
      published_at: "2024-01-11 11:30",
      created_by: 1,
      is_active: true,
      belonged_event: "太空探索",
    },
    {
      id: 6,
      title: "巴西雨林保护新政策出台",
      content: "巴西政府宣布新的雨林保护政策，加强亚马逊雨林的保护力度，并承诺到2030年实现零毁林目标。",
      summary: "巴西政府宣布新的雨林保护政策，加强亚马逊雨林的保护力度，并承诺到2030年实现零毁林目标。",
      source: "巴西环球报",
      category: "环境",
      published_at: "2024-01-10 15:45",
      created_by: 1,
      is_active: true,
      belonged_event: "雨林保护",
    },
  ];

  // 所属事件配置 - 复用HomePage.jsx的配置方式
  const eventConfig = {
    "气候变化会议": { label: "气候变化会议", bgColor: "rgba(16, 185, 129, 0.9)" },
    "美国大选": { label: "美国大选", bgColor: "rgba(239, 68, 68, 0.9)" },
    "欧洲经济政策": { label: "欧洲经济政策", bgColor: "rgba(59, 130, 246, 0.9)" },
    "福岛核电站": { label: "福岛核电站", bgColor: "rgba(245, 158, 11, 0.9)" },
    "太空探索": { label: "太空探索", bgColor: "rgba(139, 92, 246, 0.9)" },
    "雨林保护": { label: "雨林保护", bgColor: "rgba(34, 197, 94, 0.9)" },
  };

  // 处理新闻点击事件 - 复用HomePage.jsx的逻辑
  const handleNewsClick = (newsId) => {
    navigate(`/newspage/${newsId}`);
  };

  // 处理筛选变化
  const handleFilterChange = () => {
    setIsFilterChanged(true);
  };

  // 应用筛选
  const applyFilters = () => {
    setAppliedFilters({
      category: selectedCategory,
      sortBy: sortBy,
      status: statusFilter,
      importance: importanceFilter,
      search: searchQuery
    });
    setIsFilterChanged(false);
    setCurrentPage(1); // 重置到第一页
  };

  // 重置筛选
  const resetFilters = () => {
    setSelectedCategory('all');
    setSortBy('latest');
    setStatusFilter('all');
    setImportanceFilter('all');
    setSearchQuery('');
    setAppliedFilters({
      category: 'all',
      sortBy: 'latest',
      status: 'all',
      importance: 'all',
      search: ''
    });
    setIsFilterChanged(false);
    setCurrentPage(1);
  };

  // 筛选和排序新闻 - 参考StoryDetailPage.jsx的逻辑
  const filteredAndSortedNews = useMemo(() => {
    let filtered = globalNewsData;

    // 按分类筛选
    if (appliedFilters.category !== 'all') {
      filtered = filtered.filter(news => {
        const categoryMap = {
          'tech': '科技',
          'politics': '政治',
          'economy': '经济',
          'environment': '环境',
          'health': '医疗',
          'education': '教育',
          'sports': '体育'
        };
        return news.category === categoryMap[appliedFilters.category];
      });
    }

    // 按搜索关键词筛选
    if (appliedFilters.search) {
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        news.summary.toLowerCase().includes(appliedFilters.search.toLowerCase())
      );
    }

    // 按状态筛选（这里可以根据实际需求调整）
    if (appliedFilters.status !== 'all') {
      // 暂时跳过状态筛选，因为数据中没有状态字段
    }

    // 按重要程度筛选（这里可以根据实际需求调整）
    if (appliedFilters.importance !== 'all') {
      // 暂时跳过重要程度筛选，因为数据中没有重要程度字段
    }

    // 排序
    filtered.sort((a, b) => {
      const dateA = new Date(a.published_at);
      const dateB = new Date(b.published_at);
      
      switch (appliedFilters.sortBy) {
        case 'latest':
          return dateB - dateA;
        case 'popular':
          // 暂时按时间排序，实际可以根据浏览量等字段排序
          return dateB - dateA;
        case 'trending':
          // 暂时按时间排序，实际可以根据趋势指标排序
          return dateB - dateA;
        case 'timeline':
          // 暂时按时间排序，实际可以根据时间线长度排序
          return dateB - dateA;
        default:
          return dateB - dateA;
      }
    });

    return filtered;
  }, [globalNewsData, appliedFilters]);

  // 分页逻辑 - 参考StoryDetailPage.jsx的实现
  const totalPages = Math.ceil(filteredAndSortedNews.length / newsPerPage);
  const startIndex = (currentPage - 1) * newsPerPage;
  const endIndex = startIndex + newsPerPage;
  const currentNews = filteredAndSortedNews.slice(startIndex, endIndex);

  // 分页处理函数
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 滚动到内容区域顶部
    const contentElement = document.querySelector('.main-content');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 当筛选条件改变时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  // 渲染网格视图 - 复用HomePage.jsx的新闻卡片样式
  const renderGridView = () => (
    <div className="news-grid">
      {currentNews.map((news) => (
        <div key={news.id} className="news-item" onClick={() => handleNewsClick(news.id)}>
          <div className="news-header">
            {/* 新闻分类标签 - 左上角 */}
            <div className="news-category-badge">
              {news.category}
            </div>
            {/* 所属事件标签 - 右上角 */}
            <div 
              className="news-event-badge"
              style={{
                backgroundColor: eventConfig[news.belonged_event]?.bgColor
              }}
            >
              {eventConfig[news.belonged_event]?.label}
            </div>
          </div>
          <h3 className="news-title">{news.title}</h3>
          <p className="news-summary">{news.summary}</p>
          <div className="news-meta">
            <span className="news-time">{news.published_at}</span>
            <span className="news-source">{news.source}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染列表视图 - 复用HomePage.jsx的新闻卡片样式
  const renderListView = () => (
    <div className="news-list">
      {currentNews.map((news) => (
        <div key={news.id} className="list-item" onClick={() => handleNewsClick(news.id)}>
          <div className="list-content">
            <div className="list-badges">
              <span className="news-category-badge">{news.category}</span>
              <div 
                className="news-event-badge"
                style={{
                  backgroundColor: eventConfig[news.belonged_event]?.bgColor
                }}
              >
                {eventConfig[news.belonged_event]?.label}
              </div>
            </div>
            <h3 className="list-title">{news.title}</h3>
            <p className="list-summary">{news.summary}</p>
            <div className="list-meta">
              <div className="news-meta">
                <span className="news-time">{news.published_at}</span>
                <span className="news-source">{news.source}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染时间线视图 - 复用HomePage.jsx的新闻卡片样式
  const renderTimelineView = () => {
    // 对当前页的新闻按发布时间排序
    const sortedTimelineNews = [...currentNews].sort((a, b) => {
      const dateA = new Date(a.published_at);
      const dateB = new Date(b.published_at);
      return timelineSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return (
      <div className="timeline-view">
        {/* 时间线排序控制 */}
        <div className="timeline-sort-control">
          <div className="timeline-sort-header">
            <div className="timeline-sort-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
            </div>
            <label className="timeline-sort-label">时间线排序</label>
          </div>
          <select
            className="timeline-sort-select"
            value={timelineSortOrder}
            onChange={(e) => setTimelineSortOrder(e.target.value)}
          >
            <option value="desc">最新在前</option>
            <option value="asc">最早在前</option>
          </select>
        </div>

        {/* 时间线内容 */}
        <div className="timeline-content-wrapper">
          {sortedTimelineNews.map((news, index) => (
            <div key={news.id} className="timeline-item">
              <div className="timeline-dot">{index + 1}</div>
              <div className="timeline-content" onClick={() => handleNewsClick(news.id)}>
                <div className="timeline-badges">
                  <span className="news-category-badge">{news.category}</span>
                  <div 
                    className="news-event-badge"
                    style={{
                      backgroundColor: eventConfig[news.belonged_event]?.bgColor
                    }}
                  >
                    {eventConfig[news.belonged_event]?.label}
                  </div>
                </div>
                <h4 className="timeline-title">{news.title}</h4>
                <p className="timeline-summary">{news.summary}</p>
                <div className="timeline-meta">
                  <div className="news-meta">
                    <span className="news-time">{news.published_at}</span>
                    <span className="news-source">{news.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="global-container">
      <Header />
      <ThemeToggle className="fixed" />
      
      <div className="global-content">
        {/* 页面标题 */}
        <div className="page-header">
          <h1 className="page-title">全球新闻动态</h1>
          <p className="page-subtitle">追踪全球最新新闻动态，了解世界大事发展过程</p>
        </div>

        {/* 独立搜索框 */}
        <div className="global-search-section">
          <div className="search-container">
            <div className="search-wrapper">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="搜索全球新闻..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                  className="search-input"
                />
              </div>
              <button className="search-btn">
                <svg className="search-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                智能化搜索
              </button>
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* 侧边栏 */}
          <div className="sidebar">
            {/* 搜索和筛选合并板块 */}
            <div className="sidebar-card">
              <h3 className="card-title">分类与筛选</h3>
              
              {/* 新闻分类部分 */}
              <div className="categories-section">
                <label className="section-label">新闻分类</label>
                <div className="categories-list">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        handleFilterChange();
                      }}
                    >
                      <div className="category-info">
                        <div className={`category-dot ${category.color}`}></div>
                        <span className="category-name">{category.name}</span>
                      </div>
                      <span className="category-count">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 筛选选项部分 */}
              <div className="filter-section">
                <label className="section-label">筛选选项</label>
                <div className="filter-options">
                  <div className="filter-item">
                    <label className="filter-label">排序方式</label>
                    <select
                      className="filter-select"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        handleFilterChange();
                      }}
                    >
                      <option value="latest">最新发布</option>
                      <option value="popular">最受欢迎</option>
                      <option value="trending">热度趋势</option>
                      <option value="timeline">时间线长度</option>
                    </select>
                  </div>

                  <div className="filter-item">
                    <label className="filter-label">事件状态</label>
                    <select
                      className="filter-select"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        handleFilterChange();
                      }}
                    >
                      <option value="all">全部状态</option>
                      <option value="ongoing">进行中</option>
                      <option value="completed">已完结</option>
                      <option value="breaking">突发事件</option>
                    </select>
                  </div>

                  <div className="filter-item">
                    <label className="filter-label">重要程度</label>
                    <select
                      className="filter-select"
                      value={importanceFilter}
                      onChange={(e) => {
                        setImportanceFilter(e.target.value);
                        handleFilterChange();
                      }}
                    >
                      <option value="all">全部</option>
                      <option value="high">重要</option>
                      <option value="medium">一般</option>
                      <option value="low">普通</option>
                    </select>
                  </div>
                </div>

                {/* 筛选操作按钮 */}
                <div className="filter-actions">
                  <button
                    className={`apply-filter-btn ${isFilterChanged ? 'active' : ''}`}
                    onClick={applyFilters}
                    disabled={!isFilterChanged}
                  >
                    确定筛选
                  </button>
                  <button
                    className="reset-filter-btn"
                    onClick={resetFilters}
                  >
                    重置筛选
                  </button>
                </div>

                {/* 当前筛选状态显示 */}
                {Object.values(appliedFilters).some(filter => filter !== 'all' && filter !== '') && (
                  <div className="current-filters">
                    <h4 className="current-filters-title">当前筛选：</h4>
                    <div className="filter-tags">
                      {appliedFilters.category !== 'all' && (
                        <span className="filter-tag">
                          分类: {categories.find(c => c.id === appliedFilters.category)?.name}
                        </span>
                      )}
                      {appliedFilters.sortBy !== 'latest' && (
                        <span className="filter-tag">
                          排序: {appliedFilters.sortBy === 'popular' ? '最受欢迎' : 
                                  appliedFilters.sortBy === 'trending' ? '热度趋势' : '时间线长度'}
                        </span>
                      )}
                      {appliedFilters.status !== 'all' && (
                        <span className="filter-tag">
                          状态: {appliedFilters.status === 'ongoing' ? '进行中' : 
                                  appliedFilters.status === 'completed' ? '已完结' : '突发事件'}
                        </span>
                      )}
                      {appliedFilters.importance !== 'all' && (
                        <span className="filter-tag">
                          重要: {appliedFilters.importance === 'high' ? '重要' : 
                                  appliedFilters.importance === 'medium' ? '一般' : '普通'}
                        </span>
                      )}
                      {appliedFilters.search && (
                        <span className="filter-tag">
                          搜索: "{appliedFilters.search}"
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="main-content">
            <div className="content-card">
              {/* 视图切换 */}
              <div className="view-tabs">
                <div className="tabs-list">
                  <button
                    className={`tab-button ${currentView === 'grid' ? 'active' : ''}`}
                    onClick={() => setCurrentView('grid')}
                  >
                    网格视图
                  </button>
                  <button
                    className={`tab-button ${currentView === 'list' ? 'active' : ''}`}
                    onClick={() => setCurrentView('list')}
                  >
                    列表视图
                  </button>
                  <button
                    className={`tab-button ${currentView === 'timeline' ? 'active' : ''}`}
                    onClick={() => setCurrentView('timeline')}
                  >
                    时间线视图
                  </button>
                </div>
              </div>

              {/* 新闻内容 */}
              {currentView === 'grid' && renderGridView()}
              {currentView === 'list' && renderListView()}
              {currentView === 'timeline' && renderTimelineView()}

              {/* 空状态显示 */}
              {filteredAndSortedNews.length === 0 && (
                <div className="no-news-results">
                  <h3>暂无符合条件的新闻</h3>
                  <p>请尝试调整筛选条件</p>
                </div>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    <span>共 {filteredAndSortedNews.length} 条新闻，第 {currentPage} / {totalPages} 页</span>
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
                              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
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
      </div>
    </div>
  );
};

export default GlobalPage;
