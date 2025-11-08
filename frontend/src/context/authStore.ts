import { create } from 'zustand';
import axiosClient from '../api/axiosClient.ts';
import type { AuthState } from '../types/index.ts';
import { socketService } from '../services/socket.ts';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),

  login: async (username: string, password: string) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        username,
        password,
      });

      const { accessToken, user } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      set({ user, accessToken });

      // Connect to Socket.io
      socketService.connect(accessToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  signup: async (username: string, password: string, fullName: string) => {
    try {
      await axiosClient.post('/auth/signup', {
        username,
        password,
        fullName,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    socketService.disconnect();
    set({ user: null, accessToken: null });
  },
}));
