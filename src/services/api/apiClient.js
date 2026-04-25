import axios from "axios";
import { getToken, removeToken } from "../storage/tokenStorage";

const apiClient = axios.create({
  baseURL: "http://localhost:5002/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      removeToken();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;