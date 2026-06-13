import api from '@/lib/axios';

// Fetch all links for the authenticated user
export const getLinks = async (params = {}) => {
  const response = await api.get('/links', { params });
  return response.data;
};

// Create a new short link
export const createLink = async (linkData) => {
  const response = await api.post('/links', linkData);
  return response.data;
};

// Delete a specific link
export const deleteLink = async (linkId) => {
  const response = await api.delete(`/links/${linkId}`);
  return response.data;
};

// Get single link details (for analytics page)
export const getLinkDetails = async (linkId) => {
  const response = await api.get(`/links/${linkId}`);
  return response.data;
};

// Update a specific link
export const updateLink = async (linkId, linkData) => {
  const response = await api.put(`/links/${linkId}`, linkData);
  return response.data;
};

// Bulk create short links
export const bulkCreateLinks = async (bulkData) => {
  const response = await api.post('/links/bulk', bulkData);
  return response.data;
};