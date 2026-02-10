export const VALID_PERMISSIONS = [
  "broker:read",
  "broker:update",
  "broker:status",
  "company:read",
  "company:status",
  "property:read",
  "property:status",
  "enquiry:read",
  "enquiry:status",
  "message:read",
  "message:interact",
] as const;

export type Permission = (typeof VALID_PERMISSIONS)[number];

export interface Manager {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  permissions: Permission[];
  isActive: boolean;
  createdBy: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateManagerDTO {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  permissions: Permission[];
}

export interface UpdateManagerDTO {
  managerId: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateManagerPermissionsDTO {
  managerId: string;
  permissions: Permission[];
}

export interface ResetManagerPasswordDTO {
  managerId: string;
  newPassword: string;
}

export interface PermissionDefinition {
  value: Permission;
  label: string;
  resource: string;
  action: string;
}

export interface PermissionWithGrant extends PermissionDefinition {
  granted: boolean;
}

export interface MyPermissionsResponse {
  userType: "admin" | "manager";
  isAllAccess: boolean;
  grantedPermissions: Permission[];
  allPermissions: PermissionWithGrant[];
}

// Permission labels for UI display
export const PERMISSION_LABELS: Record<Permission, string> = {
  "broker:read": "View Brokers",
  "broker:update": "Update Brokers",
  "broker:status": "Change Broker Status",
  "company:read": "View Companies",
  "company:status": "Change Company Status",
  "property:read": "View Properties",
  "property:status": "Change Property Status",
  "enquiry:read": "View Enquiries",
  "enquiry:status": "Change Enquiry Status",
  "message:read": "View Messages",
  "message:interact": "Interact With Messages",
};

// Group permissions by category for better UX
export const PERMISSION_GROUPS = {
  Brokers: ["broker:read", "broker:update", "broker:status"] as Permission[],
  Companies: ["company:read", "company:status"] as Permission[],
  Properties: ["property:read", "property:status"] as Permission[],
  Enquiries: ["enquiry:read", "enquiry:status"] as Permission[],
  Messages: ["message:read", "message:interact"] as Permission[],
};
