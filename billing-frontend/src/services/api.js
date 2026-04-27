import axios from "axios";

const API = axios.create({
  baseURL: "https://billing-backend-5lkf.onrender.com/api",
});

// 🔐 REQUEST INTERCEPTOR (attach token & username)
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // ✅ sessionStorage
    const username = sessionStorage.getItem("username"); // ✅ send username for branch/role logic

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (username) {
      config.headers["X-Username"] = username;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 RESPONSE INTERCEPTOR (handle errors)
let isLoggingOut = false;

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    // 🔥 AUTO LOGOUT on 401
    if (error.response?.status === 401) {
      if (!isLoggingOut) {
        isLoggingOut = true;

        sessionStorage.removeItem("token");

        // redirect to login
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default API;