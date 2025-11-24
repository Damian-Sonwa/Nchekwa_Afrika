import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const createAnonymousSession = async (deviceId = null) => {
  try {
    const response = await api.post('/auth/anonymous', { deviceId });
    return response.data;
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  }
};

export const setPIN = async (anonymousId, pin) => {
  try {
    const response = await api.post('/auth/set-pin', { anonymousId, pin });
    return response.data;
  } catch (error) {
    console.error('Set PIN error:', error);
    throw error;
  }
};

export const verifyPIN = async (anonymousId, pin) => {
  try {
    const response = await api.post('/auth/verify-pin', { anonymousId, pin });
    return response.data;
  } catch (error) {
    console.error('Verify PIN error:', error);
    throw error;
  }
};

// SOS
export const sendSOSAlert = async (anonymousId, location) => {
  try {
    const response = await api.post('/sos', { anonymousId, location });
    return response.data;
  } catch (error) {
    console.error('SOS error:', error);
    throw error;
  }
};

// Chat
export const startChatSession = async (anonymousId) => {
  try {
    const response = await api.post('/chat/start', { anonymousId });
    return response.data;
  } catch (error) {
    console.error('Start chat error:', error);
    throw error;
  }
};

export const sendMessage = async (sessionId, senderId, senderType, content) => {
  try {
    const response = await api.post('/chat/send', {
      sessionId,
      senderId,
      senderType,
      content,
    });
    return response.data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

export const getMessages = async (sessionId, limit = 50, offset = 0) => {
  try {
    const response = await api.get(`/chat/${sessionId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
};

// Resources
export const getResources = async (filters = {}) => {
  try {
    const response = await api.get('/resources', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Get resources error:', error);
    throw error;
  }
};

// Safety Plans
export const getSafetyPlans = async (anonymousId) => {
  try {
    const response = await api.get(`/safety-plans/${anonymousId}`);
    return response.data;
  } catch (error) {
    console.error('Get safety plans error:', error);
    throw error;
  }
};

export const saveSafetyPlan = async (planData) => {
  try {
    const response = await api.post('/safety-plans', planData);
    return response.data;
  } catch (error) {
    console.error('Save safety plan error:', error);
    throw error;
  }
};

// Evidence
export const getEvidence = async (anonymousId) => {
  try {
    const response = await api.get(`/evidence/${anonymousId}`);
    return response.data;
  } catch (error) {
    console.error('Get evidence error:', error);
    throw error;
  }
};

export const uploadEvidence = async (formData) => {
  try {
    const response = await api.post('/evidence/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload evidence error:', error);
    throw error;
  }
};

export const deleteEvidence = async (evidenceId) => {
  try {
    const response = await api.delete(`/evidence/${evidenceId}`);
    return response.data;
  } catch (error) {
    console.error('Delete evidence error:', error);
    throw error;
  }
};

// User
export const wipeAllData = async (anonymousId) => {
  try {
    const response = await api.post('/user/wipe', { anonymousId });
    return response.data;
  } catch (error) {
    console.error('Wipe data error:', error);
    throw error;
  }
};

export const updateSettings = async (anonymousId, settings) => {
  try {
    const response = await api.patch('/user/settings', { anonymousId, settings });
    return response.data;
  } catch (error) {
    console.error('Update settings error:', error);
    throw error;
  }
};

export default api;


