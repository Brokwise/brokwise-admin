"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        setShouldRender(true);
      }
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !shouldRender) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedPage;
