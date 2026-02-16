import axios from "axios";

const isDev = import.meta.env.MODE === "development";
const envUrl = import.meta.env.VITE_REACT_APP_API_URL;
// In production, always use same-origin '/api' to avoid accidental localhost overrides
const resolvedBaseURL = isDev ? (envUrl || "http://localhost:3000/api") : "/api";

const axiosInstance = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true,
});

export default axiosInstance;