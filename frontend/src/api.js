// =========================
// FRONTEND: frontend/src/api.js
// =========================
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "", // if empty, dev proxy or same origin
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("amtUser");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed.token || parsed?.user?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

export default api;


