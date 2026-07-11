import axiosInstance from './axiosInstance.js';

export const createBooking = (payload) => axiosInstance.post('/bookings', payload).then(r => r.data);
export const getBookingsByUser = (userId) => axiosInstance.get(`/bookings/user/${userId}`).then(r => r.data);
export const getBookings = () => axiosInstance.get('/bookings').then(r => r.data);
export const getBookingById = (bookingId) => axiosInstance.get(`/bookings/${bookingId}`).then(r => r.data);
export const cancelBooking = (bookingId) => axiosInstance.put(`/bookings/cancel/${bookingId}`).then(r => r.data);
export const checkInBooking = (bookingId) => axiosInstance.put(`/bookings/${bookingId}/check-in`).then(r => r.data);
