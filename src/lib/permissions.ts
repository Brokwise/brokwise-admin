import type { Permission } from "@/types/manager";

export type UserType = "admin" | "manager";

type RouteRule = {
  basePath: string;
  adminOnly?: boolean;
  requiredAny?: Permission[];
};

const MANAGER_ROUTE_RULES: RouteRule[] = [
  { basePath: "/permissions" },
  { basePath: "/brokers", requiredAny: ["broker:read"] },
  { basePath: "/companies", requiredAny: ["company:read"] },
  { basePath: "/properties", requiredAny: ["property:read"] },
  { basePath: "/enquiries", requiredAny: ["enquiry:read"] },
  {
    basePath: "/messages",
    requiredAny: ["message:read", "message:interact"],
  },
  { basePath: "/managers", adminOnly: true },
  { basePath: "/developers", adminOnly: true },
  { basePath: "/projects", adminOnly: true },
  { basePath: "/packs", adminOnly: true },
  { basePath: "/jda-forms", adminOnly: true },
  { basePath: "/calendar", adminOnly: true },
  { basePath: "/notifications", adminOnly: true },
];

export const normalizeUserType = (userType?: UserType | null): UserType =>
  userType || "admin";

export const hasPermission = (
  userType: UserType,
  permissions: Permission[],
  permission: Permission
) => {
  if (userType === "admin") return true;
  return permissions.includes(permission);
};

export const hasAnyPermission = (
  userType: UserType,
  permissions: Permission[],
  requiredPermissions: Permission[]
) => {
  if (userType === "admin") return true;
  return requiredPermissions.some((permission) =>
    permissions.includes(permission)
  );
};

const matchesPath = (pathname: string, basePath: string) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`);

export const canAccessPath = (
  pathname: string,
  rawUserType?: UserType | null,
  permissions: Permission[] = []
) => {
  const userType = normalizeUserType(rawUserType);
  if (userType === "admin") return true;
  if (pathname === "/") return true;

  const matchedRule = MANAGER_ROUTE_RULES.find((rule) =>
    matchesPath(pathname, rule.basePath)
  );

  if (!matchedRule) return false;
  if (matchedRule.adminOnly) return false;
  if (!matchedRule.requiredAny || matchedRule.requiredAny.length === 0) {
    return true;
  }

  return hasAnyPermission(userType, permissions, matchedRule.requiredAny);
};

export const getFallbackPathForUser = () => "/";
