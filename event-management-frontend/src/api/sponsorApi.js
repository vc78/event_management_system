import axiosInstance from './axiosInstance.js';

export const getBooths = () => axiosInstance.get('/sponsors/booths').then(r => r.data);
export const createBooth = (payload) => axiosInstance.post('/sponsors/booths', payload).then(r => r.data);
export const bookBooth = (boothId, userId) => axiosInstance.put(`/sponsors/booths/book/${boothId}?userId=${userId}`).then(r => r.data);
export const incrementTraffic = (boothId) => axiosInstance.put(`/sponsors/booths/traffic/${boothId}`).then(r => r.data);
export const incrementLeads = (boothId) => axiosInstance.put(`/sponsors/booths/leads/${boothId}`).then(r => r.data);
