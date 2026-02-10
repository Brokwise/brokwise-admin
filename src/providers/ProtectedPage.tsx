"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  canAccessPath,
  getFallbackPathForUser,
  normalizeUserType,
} from "@/lib/permissions";
import { useMyPermissions } from "@/hooks/useManager";

const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const authUserId = useAuthStore((state) => state.admin?._id ?? null);
  const userType = useAuthStore((state) => state.userType);
  const permissions = useAuthStore((state) => state.permissions);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const shouldRefreshPermissions =
    isAuthenticated && hasHydrated && userType === "manager" && !!authUserId;
  const {
    data: myPermissionsData,
    isFetched: isMyPermissionsFetched,
  } = useMyPermissions(shouldRefreshPermissions, authUserId);

  useEffect(() => {
    if (myPermissionsData?.grantedPermissions) {
      setPermissions(myPermissionsData.grantedPermissions);
    }
  }, [myPermissionsData, setPermissions]);

  useEffect(() => {
    if (!hasHydrated) return;
    setIsCheckingAccess(true);

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!userType) {
      logout();
      router.replace("/login");
      return;
    }

    if (userType === "manager" && !authUserId) {
      logout();
      router.replace("/login");
      return;
    }

    if (shouldRefreshPermissions && !isMyPermissionsFetched) {
      return;
    }

    const effectivePermissions =
      userType === "manager"
        ? myPermissionsData?.grantedPermissions || permissions
        : permissions;

    const normalizedUserType = normalizeUserType(userType);
    const allowed = canAccessPath(
      pathname,
      normalizedUserType,
      effectivePermissions
    );

    if (!allowed) {
      router.replace(getFallbackPathForUser());
      return;
    }

    setIsCheckingAccess(false);
  }, [
    authUserId,
    hasHydrated,
    isAuthenticated,
    isMyPermissionsFetched,
    logout,
    myPermissionsData,
    pathname,
    permissions,
    router,
    shouldRefreshPermissions,
    userType,
  ]);

  if (!hasHydrated || !isAuthenticated || isCheckingAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <div className="h-screen flex justify-center items-center">
            <Loader2 className="animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedPage;
