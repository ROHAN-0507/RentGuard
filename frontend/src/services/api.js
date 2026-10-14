import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL || "https://rentguard-production-6587.up.railway.app";
const apiOrigin = configuredApiUrl.replace(/\/+$/, "").replace(/\/api$/i, "");
const apiBaseUrl = `${apiOrigin}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = /\/auth\/(login|register)\/?$/.test(
      error.config?.url || ""
    );

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

export default api;
