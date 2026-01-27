import axios from "axios";

const isHosted=true;
// Create an Axios instance
const api = axios.create({
  baseURL: !isHosted ? "http://localhost:5000/api":"https://gym-management-system-backend-d1g6.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – letting app handle it");
    }
    return Promise.reject(error);
  },
);

export default api;
