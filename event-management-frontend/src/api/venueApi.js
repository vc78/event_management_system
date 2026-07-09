import axiosInstance from './axiosInstance.js';

export const getVenues = () => axiosInstance.get('/venues').then(r => r.data).catch(() => []);
export const createVenue = (payload) => axiosInstance.post('/venues', payload).then(r => r.data);
export const updateVenue = (id, payload) => axiosInstance.put(`/venues/${id}`, payload).then(r => r.data);
export const deleteVenue = (id) => axiosInstance.delete(`/venues/${id}`).then(r => r.data);
