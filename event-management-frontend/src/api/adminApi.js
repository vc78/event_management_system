import axiosInstance from './axiosInstance.js';

export const getDashboardStats = () => axiosInstance.get('/admin/dashboard').then(r => r.data);
