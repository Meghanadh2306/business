import axios from "axios";

// Assume standard backend running on localhost:5000, tweak if needed
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default API;
