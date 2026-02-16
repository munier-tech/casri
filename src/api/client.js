import axios from 'axios';

const baseURL =
  (typeof import !== 'undefined' && import.meta?.env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_API_URL) ||
  '';

export const api = axios.create({
  baseURL,
  // withCredentials: true, // enable if using cookies/sessions
});
