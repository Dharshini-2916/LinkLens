import api from '@/lib/axios';

// Get detailed analytics for a specific link
export const getLinkAnalytics = async (linkId) => {
  const response = await api.get(`/analytics/${linkId}`);
  return response.data;
};

// Get aggregate analytics for all links of the authenticated user
export const getOverallAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

// Get public analytics for a link using its shortCode
export const getPublicLinkAnalytics = async (shortCode) => {
  const response = await api.get(`/analytics/public/${shortCode}`);
  return response.data;
};

// Export analytics as CSV
export const exportAnalyticsCSV = async (linkId) => {
  const response = await api.get(`/analytics/${linkId}/export/csv`, {
    responseType: 'blob',
  });
  return response.data;
};

// Export analytics as PDF
export const exportAnalyticsPDF = async (linkId) => {
  const response = await api.get(`/analytics/${linkId}/export/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};