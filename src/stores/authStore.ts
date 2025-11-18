import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Admin {
  _id: string;
  name: string;
  email: string;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (admin: Admin, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      login: (admin, token) =>
        set({
          admin,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
