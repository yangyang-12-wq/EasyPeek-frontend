// 用户API调用工具
// 包含消息管理和关注管理相关接口

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// 获取认证token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// 通用API请求函数
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // 认证失败，清除token并跳转到登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('认证失败，请重新登录');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// ==================== 消息管理接口 ====================

// 获取消息列表
export const getMessages = async (params = {}) => {
  const { page = 1, page_size = 10, type } = params;
  let endpoint = `/messages?page=${page}&page_size=${page_size}`;
  
  if (type) {
    endpoint += `&type=${type}`;
  }
  
  return await apiRequest(endpoint);
};

// 获取未读消息数量
export const getUnreadCount = async () => {
  return await apiRequest('/messages/unread-count');
};

// 标记消息已读
export const markMessageRead = async (messageId) => {
  return await apiRequest(`/messages/${messageId}/read`, {
    method: 'PUT',
  });
};

// 标记全部消息已读
export const markAllMessagesRead = async () => {
  return await apiRequest('/messages/read-all', {
    method: 'PUT',
  });
};

// 删除消息
export const deleteMessage = async (messageId) => {
  return await apiRequest(`/messages/${messageId}`, {
    method: 'DELETE',
  });
};

// ==================== 关注管理接口 ====================

// 添加关注
export const addFollow = async (eventId) => {
  return await apiRequest('/follows', {
    method: 'POST',
    body: JSON.stringify({ event_id: eventId }),
  });
};

// 取消关注
export const removeFollow = async (eventId) => {
  return await apiRequest('/follows', {
    method: 'DELETE',
    body: JSON.stringify({ event_id: eventId }),
  });
};

// 获取关注列表
export const getFollows = async (params = {}) => {
  const { page = 1, page_size = 10 } = params;
  return await apiRequest(`/follows?page=${page}&page_size=${page_size}`);
};

// 检查是否已关注
export const checkFollow = async (eventId) => {
  return await apiRequest(`/follows/check?event_id=${eventId}`);
};

// 获取关注统计
export const getFollowStats = async () => {
  return await apiRequest('/follows/stats');
};

// 获取可关注的事件列表
export const getAvailableEvents = async (params = {}) => {
  const { page = 1, page_size = 10 } = params;
  return await apiRequest(`/follows/events?page=${page}&page_size=${page_size}`);
};

// ==================== 错误处理 ====================

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('认证失败')) {
    return '认证失败，请重新登录';
  }
  
  if (error.message.includes('网络')) {
    return '网络连接失败，请检查网络设置';
  }
  
  return error.message || '操作失败，请稍后重试';
};