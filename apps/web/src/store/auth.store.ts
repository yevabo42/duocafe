import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SessionUser } from '@duocafe/shared';

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  setUser: (user: SessionUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'duocafe-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
