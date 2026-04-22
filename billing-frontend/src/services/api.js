import axios from "axios";

const API = axios.create({
  baseURL: "https://billing-backend-5lkf.onrender.com/api",
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default API;