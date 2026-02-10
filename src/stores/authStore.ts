import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Permission } from "@/types/manager";

type UserType = "admin" | "manager";

interface AuthUser {
  _id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
}

interface AuthState {
  admin: AuthUser | null;
  token: string | null;
  userType: UserType | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setPermissions: (permissions: Permission[]) => void;
  login: (
    admin: AuthUser,
    token: string,
    userType: UserType,
    permissions?: Permission[]
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      userType: null,
      permissions: [],
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setPermissions: (permissions) => set({ permissions }),
      login: (admin, token, userType, permissions = []) =>
        set({
          admin,
          token,
          userType,
          permissions,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          admin: null,
          token: null,
          userType: null,
          permissions: [],
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
