import axiosInstance from './axiosInstance.js';

export const getEvents = () => axiosInstance.get('/events').then(r => r.data);
export const getEventById = (id) => axiosInstance.get(`/events/${id}`).then(r => r.data);
export const createEvent = (payload) => axiosInstance.post('/events', payload).then(r => r.data);
export const updateEvent = (id, payload) => axiosInstance.put(`/events/${id}`, payload).then(r => r.data);
export const deleteEvent = (id) => axiosInstance.delete(`/events/${id}`).then(r => r.data);
