// 8. AUTH STORE (lib/store/authStore.ts)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('authToken', token);
        set({ token, user });
      },
      clearAuth: () => {
        localStorage.removeItem('authToken');
        set({ token: null, user: null });
      },
    }),
    { name: 'auth-store' }
  )
);
