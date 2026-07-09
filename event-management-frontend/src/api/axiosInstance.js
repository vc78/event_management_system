import axios from 'axios';
const axiosInstance = axios.create({ baseURL:'http://localhost:8080/api', headers:{'Content-Type':'application/json'}});
axiosInstance.interceptors.request.use((config)=>{ const t=localStorage.getItem('ems_token'); if(t) config.headers.Authorization=`Bearer ${t}`; return config; });
export default axiosInstance;
