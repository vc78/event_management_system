import axiosInstance from './axiosInstance.js';

export const createOrder = (payload) => axiosInstance.post('/payments/create-order', payload).then(r => r.data);
export const verifyPayment = (payload) => axiosInstance.post('/payments/verify', payload).then(r => r.data);
