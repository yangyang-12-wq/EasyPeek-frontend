import React, { useState, useEffect } from 'react';
import './AIAnalysis.css';

const AIAnalysis = ({ type, targetId, showSteps = true }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState({});

  useEffect(() => {
    if (targetId) {
      fetchAnalysis();
    }
  }, [targetId, type]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/ai/analysis?type=${type}&target_id=${targetId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data) {
          setAnalysis(data.data);
        } else {
          setError('暂无分析数据');
        }
      } else if (response.status === 404) {
        setError('not_found');
      } else {
        setError('获取分析结果失败');
      }
    } catch (err) {
      setError('网络连接失败');
      console.error('Failed to fetch analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = type === 'news' ? '/api/v1/ai/analyze' : '/api/v1/ai/analyze-event';
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type,
          target_id: targetId,
          options: {
            enable_summary: true,
            enable_keywords: true,
            enable_sentiment: true,
            enable_trends: type === 'event',
            enable_impact: type === 'event',
            show_analysis_steps: showSteps
          }
        })
      });

      if (response.ok) {
        // 分析请求成功，等待几秒后重新获取结果
        setTimeout(() => {
          fetchAnalysis();
        }, 3000);
      } else {
        throw new Error('分析请求失败');
      }
    } catch (err) {
      setError('触发分析失败');
      console.error('Failed to trigger analysis:', err);
      setLoading(false);
    }
  };

  const toggleStep = (stepIndex) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '#4CAF50';
      case 'negative':
        return '#f44336';
      default:
        return '#FF9800';
    }
  };

  const getSentimentText = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '正面';
      case 'negative':
        return '负面';
      default:
        return '中性';
    }
  };

  const getImpactLevelColor = (level) => {
    switch (level) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#FF9800';
      default:
        return '#4CAF50';
    }
  };

  const getImpactLevelText = (level) => {
    switch (level) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      default:
        return '低';
    }
  };

  if (loading) {
    return (
      <div className="ai-analysis-loading">
        <div className="loading-spinner"></div>
        <p>AI正在分析中，请稍候...</p>
      </div>
    );
  }

  if (error) {
    if (error === 'not_found') {
      return (
        <div className="ai-analysis-empty">
          <div className="empty-icon">🤖</div>
          <h3>AI分析待启动</h3>
          <p>该内容尚未进行AI智能分析，点击下方按钮开始分析</p>
          <button 
            className="trigger-btn" 
            onClick={triggerAnalysis}
            disabled={loading}
          >
            {loading ? '🔄 正在分析...' : '🚀 开始AI分析'}
          </button>
        </div>
      );
    }
    
    return (
      <div className="ai-analysis-error">
        <div className="error-icon">⚠️</div>
        <h3>获取分析结果失败</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button 
            className="retry-btn" 
            onClick={fetchAnalysis}
            disabled={loading}
          >
            {loading ? '重试中...' : '重新获取'}
          </button>
          <button 
            className="trigger-btn" 
            onClick={triggerAnalysis}
            disabled={loading}
          >
            {loading ? '分析中...' : '重新分析'}
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="ai-analysis-empty">
        <div className="empty-icon">🤖</div>
        <h3>AI分析功能</h3>
        <p>使用先进的AI技术对内容进行深度分析</p>
        <button 
          className="trigger-btn" 
          onClick={triggerAnalysis}
          disabled={loading}
        >
          {loading ? '🔄 正在分析...' : '🚀 开始分析'}
        </button>
      </div>
    );
  }

  // 检查分析状态
  if (analysis && analysis.status === 'failed') {
    return (
      <div className="ai-analysis-failed">
        <div className="failed-icon">❌</div>
        <h3>AI分析失败</h3>
        <p>分析过程中出现错误，可能是由于网络问题或AI服务暂时不可用</p>
        <button 
          className="retry-btn" 
          onClick={triggerAnalysis}
          disabled={loading}
        >
          {loading ? '🔄 重新分析中...' : '🔄 重新分析'}
        </button>
      </div>
    );
  }

  if (analysis && analysis.status === 'processing') {
    return (
      <div className="ai-analysis-processing">
        <div className="processing-icon">⏳</div>
        <h3>AI正在分析中</h3>
        <p>请稍候，AI正在对内容进行深度分析...</p>
        <div className="loading-spinner"></div>
        <button 
          className="refresh-btn" 
          onClick={fetchAnalysis}
          disabled={loading}
        >
          {loading ? '刷新中...' : '刷新状态'}
        </button>
      </div>
    );
  }

  return (
    <div className="ai-analysis">
      {/* 状态指示器 */}
      {analysis.status && (
        <div className={`status-indicator ${analysis.status}`}>
          {analysis.status === 'demo_mode' && '🎭 演示模式'}
          {analysis.status === 'completed' && '✅ 分析完成'}
          {analysis.status === 'service_unavailable' && '⚠️ 服务不可用'}
        </div>
      )}

      {/* 基础分析结果 */}
      <div className="analysis-section">
        <h3>AI分析摘要</h3>
        <p className="summary">{analysis.summary || '暂无摘要'}</p>
        
        {/* 重新分析按钮 */}
        {(analysis.show_retry_button || analysis.show_analyze_button) && (
          <div className="analysis-actions">
            <button 
              className="retry-analysis-btn" 
              onClick={triggerAnalysis}
              disabled={loading}
            >
              {loading ? '🔄 分析中...' : '🔄 重新分析'}
            </button>
          </div>
        )}
      </div>

      {/* 关键词 */}
      {analysis.keywords && (
        <div className="analysis-section">
          <h3>关键词</h3>
          <div className="keywords">
            {(() => {
              let keywords = [];
              try {
                // 尝试解析JSON字符串格式的关键词
                if (typeof analysis.keywords === 'string') {
                  keywords = JSON.parse(analysis.keywords);
                } else if (Array.isArray(analysis.keywords)) {
                  keywords = analysis.keywords;
                }
              } catch {
                // 如果解析失败，将字符串按逗号分割
                keywords = analysis.keywords.split(',').map(k => k.trim());
              }
              
              return keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ));
            })()}
          </div>
        </div>
      )}

      {/* 情感分析 */}
      {analysis.sentiment && (
        <div className="analysis-section">
          <h3>情感分析</h3>
          <div className="sentiment-analysis">
            <span 
              className="sentiment-badge"
              style={{ backgroundColor: getSentimentColor(analysis.sentiment) }}
            >
              {getSentimentText(analysis.sentiment)}
            </span>
            <span className="sentiment-score">
              置信度: {(analysis.sentiment_score * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* 事件分析（仅事件类型） */}
      {type === 'event' && analysis.event_analysis && (
        <div className="analysis-section">
          <h3>事件深度分析</h3>
          <p className="event-analysis">{analysis.event_analysis}</p>
        </div>
      )}

      {/* 影响力评估 */}
      {analysis.impact_level && (
        <div className="analysis-section">
          <h3>影响力评估</h3>
          <div className="impact-assessment">
            <div className="impact-level">
              <span>影响级别: </span>
              <span 
                className="impact-badge"
                style={{ backgroundColor: getImpactLevelColor(analysis.impact_level) }}
              >
                {getImpactLevelText(analysis.impact_level)}
              </span>
            </div>
            <div className="impact-score">
              影响力评分: <strong>{analysis.impact_score.toFixed(1)}</strong>/10
            </div>
            {analysis.impact_scope && (
              <p className="impact-scope">{analysis.impact_scope}</p>
            )}
          </div>
        </div>
      )}

      {/* 趋势预测 */}
      {analysis.trend_predictions && analysis.trend_predictions.length > 0 && (
        <div className="analysis-section">
          <h3>未来趋势预测</h3>
          <div className="trend-predictions">
            {analysis.trend_predictions.map((prediction, index) => (
              <div key={index} className="prediction-item">
                <h4>{prediction.timeframe}</h4>
                <p className="prediction-trend">{prediction.trend}</p>
                <div className="prediction-meta">
                  <span className="probability">
                    可能性: {(prediction.probability * 100).toFixed(0)}%
                  </span>
                  {prediction.factors && prediction.factors.length > 0 && (
                    <div className="factors">
                      影响因素: {prediction.factors.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分析步骤（推理过程） */}
      {showSteps && analysis.analysis_steps && analysis.analysis_steps.length > 0 && (
        <div className="analysis-section">
          <h3>AI推理过程</h3>
          <div className="analysis-steps">
            {analysis.analysis_steps.map((step, index) => (
              <div 
                key={index} 
                className={`step-item ${expandedSteps[index] ? 'expanded' : ''}`}
              >
                <div 
                  className="step-header"
                  onClick={() => toggleStep(index)}
                >
                  <span className="step-number">{step.step}</span>
                  <span className="step-title">{step.title}</span>
                  <span className="step-confidence">
                    置信度: {(step.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="step-toggle">
                    {expandedSteps[index] ? '−' : '+'}
                  </span>
                </div>
                {expandedSteps[index] && (
                  <div className="step-content">
                    <p className="step-description">{step.description}</p>
                    <p className="step-result">{step.result}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 相关话题 */}
      {analysis.related_topics && analysis.related_topics.length > 0 && (
        <div className="analysis-section">
          <h3>相关话题</h3>
          <div className="related-topics">
            {analysis.related_topics.map((topic, index) => (
              <span key={index} className="topic-tag">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 分析元信息 */}
      <div className="analysis-meta">
        <p>
          AI模型: {analysis.model_name} ({analysis.model_version})
        </p>
        <p>
          整体置信度: {(analysis.confidence * 100).toFixed(1)}%
        </p>
        <p>
          处理时间: {analysis.processing_time}秒
        </p>
        <p>
          分析时间: {new Date(analysis.created_at).toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  );
};

export default AIAnalysis; 