import axiosInstance from './axiosInstance.js';

export const getReferralByUser = (userId) => axiosInstance.get(`/referrals/user/${userId}`).then(r => r.data);
export const createReferral = (payload) => axiosInstance.post('/referrals', payload).then(r => r.data);
export const registerClick = (code) => axiosInstance.put(`/referrals/click/${code}`).then(r => r.data);
export const registerConversion = (code, ticketPrice) => axiosInstance.put(`/referrals/convert/${code}?ticketPrice=${ticketPrice}`).then(r => r.data);
