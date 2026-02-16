import { create } from 'zustand';
import toast from 'react-hot-toast';
import axios from '../lib/axios';

export const useUserStore = create((set, get) => ({
  user: null,
  isAuthorized: false,
  isLoading: false,
  authChecked: false,

  isAdmin: () => {
    const { user } = get();
    const role = user?.role?.toUpperCase();
    return role === 'ADMIN' || role === 'EMPLOYEE';
  },

  dashboardAdmin: () => {
    const { user } = get();
    return user?.role?.toUpperCase() === 'ADMIN';
  },

  getUserProfile: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get("/user/getUserProfile");

      const currentUser = get().user;
      if (JSON.stringify(currentUser) !== JSON.stringify(data.user)) {
        set({ user: data.user });
      }

      toast.success("User profile fetched successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching user profile");
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async ({ username, password, email, confirmPassword }) => {
    if (confirmPassword !== password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      set({ isLoading: true });
      const { data } = await axios.post('/auth/signUp', {
        username,
        password,
        email,
      });

      set({
        user: data.user,
        isAuthorized: true,
        isLoading: false,
        authChecked: true,
      });

      toast.success('User created successfully');
    } catch (error) {
      set({ isLoading: false });
      toast.error(error?.response?.data?.message || 'An error occurred');
    }
  },

  signIn: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post('/auth/signIn', {
        email,
        password,
      });
      set({
        user: data.user,
        isAuthorized: true,
        isLoading: false,
        authChecked: true,
      });
      toast.success("Login successful");
    } catch (error) {
      set({ isLoading: false });
      toast.error(error?.response?.data?.message || "An error occurred");
      console.error("SignIn Error:", error?.response?.data?.message);
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await axios.post('/auth/logOut');
      set({
        user: null,
        isAuthorized: false,
        isLoading: false,
        authChecked: true,
      });
      toast.success('Logged out successfully');
    } catch (error) {
      set({ isLoading: false });
      toast.error(error?.response?.data?.message || 'An error occurred');
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axios.get('/auth/getProfile');
      console.log("checkAuth response:", data);

      if (data.user) {
        set({
          isAuthorized: true,
          user: data.user,
          authChecked: true,
          isLoading: false
        });
      } else {
        set({
          isAuthorized: false,
          user: null,
          authChecked: true,
          isLoading: false
        });
      }
    } catch (error) {
      console.error("checkAuth Error:", error?.response?.data?.message);
      set({
        isAuthorized: false,
        user: null,
        authChecked: true,
        isLoading: false
      });
    }
  },
}));