import axiosInstance from './axiosInstance.js';

export const getCategories = () => axiosInstance.get('/categories').then(r => r.data).catch(() => []);
export const createCategory = (payload) => axiosInstance.post('/categories', payload).then(r => r.data);
export const updateCategory = (id, payload) => axiosInstance.put(`/categories/${id}`, payload).then(r => r.data);
export const deleteCategory = (id) => axiosInstance.delete(`/categories/${id}`).then(r => r.data);
