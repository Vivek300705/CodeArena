import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isSessionExpired: false,
      login: (user, token) => set({ user, token, isAuthenticated: true, isSessionExpired: false }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
      setSessionExpired: (status) => set({ isSessionExpired: status }),
    }),
    {
      name: 'codearena-auth-storage',
    }
  )
);
