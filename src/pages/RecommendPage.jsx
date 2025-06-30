import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';
import NewsCard from '../components/NewsCard';
import { eventConfig } from '../utils/statusConfig';
import './RecommendPage.css';

export default function RecommendPage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('科技');
  const [recommendations, setRecommendations] = useState({
    personal: [],
    trending: [],
    category: []
  });
  const navigate = useNavigate();

  // 可选择的分类列表
  const categories = ['科技', '经济', '环境', '体育', '健康', '教育', '文化', '政治'];

  // 模拟推荐数据
  const mockRecommendations = {
    personal: [
      {
        id: 101,
        title: "基于您的阅读历史：AI技术在医疗领域的突破性进展",
        content: "人工智能在医疗诊断、药物研发等领域取得重大突破，为精准医疗提供新的可能性。",
        summary: "AI技术在医疗领域的应用正在改变传统医疗模式，提高诊断准确性和治疗效果。",
        source: "医学前沿",
        category: "科技",
        published_at: "2024-01-16 09:15",
        created_by: 1,
        is_active: true,
        belonged_event: "AI技术发展",
        reason: "基于您对AI和科技新闻的关注"
      },
      {
        id: 102,
        title: "推荐理由：您关注的新能源话题 - 氢能源技术商业化加速",
        content: "氢能源作为清洁能源的重要组成部分，在政策支持下迎来商业化发展的关键时期。",
        summary: "氢能源技术逐步成熟，多个国家加大投资力度，产业化进程明显加快。",
        source: "能源观察",
        category: "能源",
        published_at: "2024-01-16 08:30",
        created_by: 1,
        is_active: true,
        belonged_event: "新能源汽车发展",
        reason: "匹配您的新能源关注偏好"
      },
      {
        id: 103,
        title: "为您精选：全球经济复苏中的数字化转型趋势",
        content: "后疫情时代，数字化转型成为企业复苏和发展的重要驱动力，各行业加速数字化进程。",
        summary: "数字化转型正在重塑商业模式，成为经济复苏的重要引擎。",
        source: "经济观察报",
        category: "经济",
        published_at: "2024-01-16 07:45",
        created_by: 1,
        is_active: true,
        belonged_event: "全球经济复苏",
        reason: "基于您的经济新闻阅读偏好"
      }
    ],
    trending: [
      {
        id: 201,
        title: "热门话题：ChatGPT-5即将发布，AI能力再次飞跃",
        content: "OpenAI即将发布ChatGPT-5，据悉新版本在推理能力和多模态处理方面有重大提升。",
        summary: "ChatGPT-5的发布将进一步推动AI技术的普及和应用，引发行业新一轮变革。",
        source: "科技前沿",
        category: "科技",
        published_at: "2024-01-16 10:00",
        created_by: 1,
        is_active: true,
        belonged_event: "AI技术发展",
      },
      {
        id: 202,
        title: "全网热议：新型太阳能电池效率突破30%大关",
        content: "科研团队成功开发出效率超过30%的钙钛矿太阳能电池，为清洁能源发展带来新希望。",
        summary: "太阳能电池技术的重大突破，将大幅降低清洁能源成本，加速能源转型。",
        source: "科学日报",
        category: "科技",
        published_at: "2024-01-16 09:30",
        created_by: 1,
        is_active: true,
        belonged_event: "新能源汽车发展"
      },
      {
        id: 203,
        title: "社交媒体热点：2024年冬奥会筹备工作全面启动",
        content: "2024年冬奥会各项筹备工作有序推进，场馆建设和赛事组织工作进入关键阶段。",
        summary: "冬奥会筹备工作的顺利推进，展现了主办国的组织能力和基础设施水平。",
        source: "体育新闻",
        category: "体育",
        published_at: "2024-01-16 08:15",
        created_by: 1,
        is_active: true,
        belonged_event: "奥运会举办"
      }
    ],
    category: {
      '科技': [
        {
          id: 301,
          title: "量子计算机商业化应用取得新进展",
          content: "IBM、Google等公司在量子计算领域持续投入，量子优势在特定领域开始显现。",
          summary: "量子计算技术逐步从实验室走向实际应用，为解决复杂计算问题提供新途径。",
          source: "量子科技",
          category: "科技",
          published_at: "2024-01-16 11:20",
          created_by: 1,
          is_active: true,
          belonged_event: "AI技术发展"
        },
        {
          id: 304,
          title: "5G网络建设进入新阶段",
          content: "全球5G网络覆盖率持续提升，为物联网和智能城市发展奠定基础。",
          summary: "5G技术的普及将推动数字化转型，创造更多应用场景。",
          source: "通信世界",
          category: "科技",
          published_at: "2024-01-16 10:30",
          created_by: 1,
          is_active: true,
          belonged_event: "5G发展"
        }
      ],
      '环境': [
        {
          id: 302,
          title: "全球碳中和目标推进情况报告",
          content: "联合国发布最新报告，评估各国碳中和目标的实施进展和面临的挑战。",
          summary: "碳中和目标的实现需要各国加强合作，采取更加积极的减排措施。",
          source: "环境报告",
          category: "环境",
          published_at: "2024-01-16 10:45",
          created_by: 1,
          is_active: true,
          belonged_event: "气候变化会议"
        },
        {
          id: 305,
          title: "海洋塑料污染治理新技术",
          content: "科学家开发出新型海洋塑料回收技术，有望大幅减少海洋污染。",
          summary: "创新技术为解决海洋塑料污染问题提供了新的解决方案。",
          source: "海洋科学",
          category: "环境",
          published_at: "2024-01-16 09:20",
          created_by: 1,
          is_active: true,
          belonged_event: "环境保护"
        }
      ],
      '经济': [
        {
          id: 303,
          title: "数字货币央行试点项目扩大规模",
          content: "多个国家央行数字货币试点项目取得积极进展，数字支付生态系统不断完善。",
          summary: "央行数字货币的推广将改变传统支付方式，提高金融服务效率。",
          source: "金融时报",
          category: "经济",
          published_at: "2024-01-16 09:00",
          created_by: 1,
          is_active: true,
          belonged_event: "全球经济复苏"
        }
      ],
      '体育': [
        {
          id: 306,
          title: "2024年奥运会筹备工作进展顺利",
          content: "各项筹备工作按计划推进，场馆建设和赛事组织达到预期目标。",
          summary: "奥运会的成功举办将促进体育事业发展和国际交流。",
          source: "体育周刊",
          category: "体育",
          published_at: "2024-01-16 08:45",
          created_by: 1,
          is_active: true,
          belonged_event: "奥运会举办"
        }
      ],
      '健康': [
        {
          id: 307,
          title: "新型疫苗研发取得重要突破",
          content: "科研团队成功开发出针对多种病毒的广谱疫苗，临床试验效果良好。",
          summary: "广谱疫苗的研发为预防传染病提供了新的解决方案。",
          source: "医学新闻",
          category: "健康",
          published_at: "2024-01-16 11:00",
          created_by: 1,
          is_active: true,
          belonged_event: "医疗技术发展"
        }
      ],
      '教育': [
        {
          id: 308,
          title: "在线教育平台推动教育公平",
          content: "数字化教育资源的普及正在缩小城乡教育差距，促进教育公平。",
          summary: "技术进步为实现优质教育资源共享创造了条件。",
          source: "教育观察",
          category: "教育",
          published_at: "2024-01-16 10:15",
          created_by: 1,
          is_active: true,
          belonged_event: "教育改革"
        }
      ],
      '文化': [
        {
          id: 309,
          title: "数字文物保护技术创新应用",
          content: "3D扫描和虚拟现实技术在文物保护和展示中发挥重要作用。",
          summary: "科技手段为文化遗产保护和传承提供了新的可能性。",
          source: "文化遗产",
          category: "文化",
          published_at: "2024-01-16 09:45",
          created_by: 1,
          is_active: true,
          belonged_event: "文化保护"
        }
      ],
      '政治': [
        {
          id: 310,
          title: "国际合作应对全球挑战",
          content: "各国加强在气候变化、公共卫生等领域的国际合作，共同应对全球性挑战。",
          summary: "多边合作机制在解决全球问题中发挥着越来越重要的作用。",
          source: "国际观察",
          category: "政治",
          published_at: "2024-01-16 08:00",
          created_by: 1,
          is_active: true,
          belonged_event: "国际合作"
        }
      ]
    }
  };

  useEffect(() => {
    // 模拟加载推荐数据
    const fetchRecommendations = async () => {
      setLoading(true);
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecommendations(mockRecommendations);
      setLoading(false);
    };

    fetchRecommendations();
  }, []);

  const handleNewsClick = (newsId) => {
    navigate(`/newspage/${newsId}`);
  };

  const tabs = [
    { id: 'personal', label: '个性化推荐', icon: '🎯' },
    { id: 'trending', label: '热门推荐', icon: '🔥' },
    { id: 'category', label: '分类推荐', icon: '📂' }
  ];

  const getCurrentData = () => {
    if (activeTab === 'category') {
      return recommendations.category[selectedCategory] || [];
    }
    return recommendations[activeTab] || [];
  };

  const getTabDescription = () => {
    switch(activeTab) {
      case 'personal':
        return '基于您的阅读历史和兴趣偏好，为您精心挑选的新闻内容';
      case 'trending':
        return '当前最受关注的热门新闻，把握时事脉搏';
      case 'category':
        return '按照不同领域分类的优质新闻，深度了解各行业动态';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="recommend-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在为您生成个性化推荐...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommend-container">
      <Header />
      
      <div className="recommend-content">
        {/* Hero Section */}
        <div className="recommend-hero">
          <h1 className="recommend-title">智能推荐</h1>
          <p className="recommend-subtitle">基于AI算法为您推荐最感兴趣的新闻内容</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Description */}
        <div className="tab-description">
          <p>{getTabDescription()}</p>
        </div>

        {/* Category Selector */}
        {activeTab === 'category' && (
          <div className="category-selector">
            <h3 className="selector-title">选择分类</h3>
            <div className="category-buttons">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-button ${
                    selectedCategory === category ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="recommend-main">
          <div className="content-header">
            <h2 className="content-title">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <div className="content-stats">
              <span className="stats-text">
                为您找到 {getCurrentData().length} 条推荐内容
              </span>
            </div>
          </div>

          {/* News Grid */}
          <div className="news-grid">
            {getCurrentData().map((news) => (
              <div key={news.id} className="news-card-wrapper">
                <NewsCard 
                  news={news} 
                  eventConfig={eventConfig} 
                  onNewsClick={handleNewsClick} 
                />
                {/* 推荐理由 */}
                {news.reason && (
                  <div className="recommendation-reason">
                    <div className="reason-text">
                      <span className="reason-icon">💡</span>
                      {news.reason}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {getCurrentData().length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📰</div>
              <h3>暂无推荐内容</h3>
              <p>我们正在为您寻找更多感兴趣的新闻</p>
            </div>
          )}
        </div>

        {/* Recommendation Settings */}
        <div className="recommendation-settings">
          <div className="settings-card">
            <h3 className="settings-title">推荐设置</h3>
            <div className="settings-options">
              <div className="setting-item">
                <span className="setting-label">个性化推荐</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span className="setting-label">热门新闻推送</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span className="setting-label">分类推荐</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <button className="refresh-btn">
              <span className="refresh-icon">🔄</span>
              刷新推荐
            </button>
          </div>
        </div>
      </div>
      
      <ThemeToggle className="fixed" />
    </div>
  );
}