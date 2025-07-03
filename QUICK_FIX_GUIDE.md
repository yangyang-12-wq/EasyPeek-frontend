# 快速修复指南

## 问题诊断

根据你的截图，主要有两个问题：

### 1. AI智能分析显示"触发分析失败"

**可能原因：**
- 后端服务未运行
- AI API配置问题（API密钥、模型等）
- 数据库中没有AI分析数据
- 网络连接问题

### 2. 事件时间线显示"暂无相关事件时间线数据"

**可能原因：**
- 该新闻没有关联到任何事件
- 数据库中缺少事件数据
- 事件ID字段为空

## 快速解决步骤

### 步骤1: 检查后端服务

1. 确保后端服务正在运行：
```bash
cd EasyPeek-backend
go run ./cmd/main.go
```

2. 检查服务是否正常启动，应该看到类似输出：
```
[GIN-debug] Listening and serving HTTP on :8080
```

### 步骤2: 检查AI配置

打开 `EasyPeek-backend/internal/config/config.yaml`，确认AI配置：

```yaml
ai:
  provider: "openrouter"
  api_key: "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"  # 确保这个key有效
  base_url: "https://openrouter.ai/api/v1"
  model: "anthropic/claude-3.5-sonnet"
  auto_analysis:
    enabled: true
    analyze_on_fetch: true
```

### 步骤3: 测试API连接

在浏览器中访问以下URL测试：

1. 测试新闻API：`http://localhost:8080/api/v1/news/latest?limit=5`
2. 测试AI分析API：`http://localhost:8080/api/v1/ai/analysis?type=news&target_id=1`

### 步骤4: 手动触发AI分析

如果AI分析不存在，你可以：

1. 在前端点击"重试"按钮
2. 或者使用以下步骤手动触发：

**方法1: 使用浏览器开发者工具**
```javascript
// 在浏览器控制台中执行
fetch('http://localhost:8080/api/v1/ai/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 需要登录后的token
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    type: 'news',
    target_id: 1, // 替换为实际的新闻ID
    options: {
      enable_summary: true,
      enable_keywords: true,
      enable_sentiment: true
    }
  })
})
```

**方法2: 使用测试脚本**
```bash
cd EasyPeek-backend
go run test_ai_analysis.go
```

### 步骤5: 添加事件数据

如果没有事件时间线，你需要：

1. 创建事件数据
2. 将新闻关联到事件

**在数据库中手动添加事件：**
```sql
-- 添加示例事件
INSERT INTO events (title, description, category, status, hotness_score, created_at, updated_at)
VALUES ('AI技术发展', 'AI技术最新发展动态', 'technology', 'active', 85.5, NOW(), NOW());

-- 将新闻关联到事件
UPDATE news SET belonged_event_id = 1 WHERE id = 1; -- 替换为实际ID
```

## 临时解决方案

如果以上步骤都无法解决问题，可以使用以下临时方案：

### 1. 模拟AI分析数据

在 `newspage.jsx` 中添加模拟数据：

```javascript
// 在 fetchAIAnalysis 函数中添加
const mockAIData = {
  summary: "这是一条关于AI技术发展的重要新闻，展示了人工智能在各个领域的最新应用。",
  keywords: '["人工智能", "技术发展", "创新", "未来趋势"]',
  sentiment: "positive",
  sentiment_score: 0.85,
  created_at: new Date().toISOString()
};

// 如果API调用失败，使用模拟数据
if (!aiAnalysisData && error) {
  setAiAnalysisData(mockAIData);
}
```

### 2. 模拟时间线数据

在 `formatNewsData` 函数中添加：

```javascript
const mockTimeline = [
  {
    date: "2024-01-15",
    time: "10:30",
    title: "AI技术突破性进展",
    content: "研究团队发布了最新的AI模型，在多个基准测试中取得优异成绩。",
    importance: "high",
    sources: ["科技日报"]
  },
  {
    date: "2024-01-16",
    time: "14:20",
    title: "业界积极响应",
    content: "多家科技公司表示将积极采用新技术，推动行业发展。",
    importance: "medium",
    sources: ["财经网"]
  }
];

// 如果没有时间线数据，使用模拟数据
if (!formattedData.timeline) {
  formattedData.timeline = mockTimeline;
}
```

## 调试技巧

### 1. 查看浏览器控制台

打开浏览器开发者工具的Console标签，查看是否有错误信息。

### 2. 查看网络请求

在开发者工具的Network标签中查看API请求的状态：
- 200: 成功
- 404: 未找到（AI分析不存在）
- 500: 服务器错误
- 0: 网络连接问题

### 3. 检查后端日志

在后端运行的终端中查看日志输出，寻找错误信息。

## 常见问题解答

**Q: AI分析一直显示"正在加载"**
A: 检查网络连接和后端服务状态，可能是API响应超时。

**Q: 事件时间线总是显示空**
A: 确认数据库中有事件数据，并且新闻正确关联到事件。

**Q: AI分析返回404错误**
A: 这表示该新闻还没有AI分析数据，需要手动触发分析。

**Q: 后端启动失败**
A: 检查数据库连接配置和AI API配置是否正确。

## 联系支持

如果问题仍然存在，请提供：
1. 浏览器控制台的错误信息
2. 后端服务的日志输出
3. 具体的操作步骤

这将帮助更快地定位和解决问题。 