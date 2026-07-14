import axiosInstance from './axiosInstance.js';

export const getZones = () => axiosInstance.get('/zones').then(r => r.data);
export const getZoneHistory = (zoneId) => axiosInstance.get(`/zones/${zoneId}/history`).then(r => r.data);
export const simulateEvent = (payload) => axiosInstance.post('/zones/simulate', payload).then(r => r.data);
