"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { normalizeUserType } from "@/lib/permissions";
import { useManagers, useMyPermissions, usePermissions } from "@/hooks/useManager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PERMISSION_LABELS } from "@/types/manager";
import type { PermissionWithGrant } from "@/types/manager";

const PermissionsPage = () => {
  const rawUserType = useAuthStore((state) => state.userType);
  const userType = normalizeUserType(rawUserType);
  const isAdmin = userType === "admin";

  const [search, setSearch] = useState("");

  const { managers, isLoadingManagers, errorManagers } = useManagers(true, isAdmin);
  const { permissions: availablePermissions, isLoadingPermissions } =
    usePermissions(isAdmin);
  const {
    data: myPermissions,
    isLoading: isLoadingMyPermissions,
    error: errorMyPermissions,
  } = useMyPermissions();

  const permissionLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    (availablePermissions || []).forEach((permission) => {
      map.set(permission.value, permission.label);
    });
    return map;
  }, [availablePermissions]);

  const filteredManagers = useMemo(() => {
    const managersList = managers || [];
    const normalized = search.toLowerCase().trim();
    if (!normalized) return managersList;
    return managersList.filter((manager) => {
      const fullName = `${manager.first_name} ${manager.last_name}`.toLowerCase();
      return (
        fullName.includes(normalized) ||
        manager.email.toLowerCase().includes(normalized)
      );
    });
  }, [managers, search]);

  const myPermissionsByResource = useMemo(() => {
    const grouped: Record<string, PermissionWithGrant[]> = {};
    if (!myPermissions) return grouped;

    myPermissions.allPermissions.forEach((permission) => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });

    return grouped;
  }, [myPermissions]);

  if (isAdmin) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Permissions</h1>
          <p className="text-sm text-muted-foreground">
            View all permissions and each manager&apos;s assigned access.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPermissions ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-28" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(availablePermissions || []).map((permission) => (
                  <Badge key={permission.value} variant="secondary">
                    {permission.label}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-3">
            <CardTitle className="text-base">Managers Permissions</CardTitle>
            <Input
              placeholder="Search manager by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {isLoadingManagers ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : errorManagers ? (
              <p className="text-sm text-red-500">
                Failed to load manager permissions.
              </p>
            ) : filteredManagers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No managers found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manager</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManagers.map((manager) => (
                    <TableRow key={manager._id}>
                      <TableCell className="font-medium">
                        {manager.first_name} {manager.last_name}
                      </TableCell>
                      <TableCell>{manager.email}</TableCell>
                      <TableCell>
                        <Badge variant={manager.isActive ? "default" : "secondary"}>
                          {manager.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {manager.permissions.length === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            No permissions
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {manager.permissions.map((permission) => (
                              <Badge key={permission} variant="outline">
                                {permissionLabelMap.get(permission) ||
                                  PERMISSION_LABELS[permission] ||
                                  permission}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Permissions</h1>
        <p className="text-sm text-muted-foreground">
          See what actions you can currently perform.
        </p>
      </div>

      {isLoadingMyPermissions ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : errorMyPermissions || !myPermissions ? (
        <p className="text-sm text-red-500">Failed to load your permissions.</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge>{myPermissions.userType}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Granted Permissions:
                </span>
                <Badge variant="secondary">
                  {myPermissions.grantedPermissions.length}
                </Badge>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {myPermissions.grantedPermissions.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    No permissions assigned.
                  </span>
                ) : (
                  myPermissions.grantedPermissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permissionLabelMap.get(permission) ||
                        PERMISSION_LABELS[permission] ||
                        permission}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(myPermissionsByResource).map(([resource, perms]) => (
              <Card key={resource}>
                <CardHeader>
                  <CardTitle className="text-base capitalize">
                    {resource} Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {perms.map((permission) => (
                    <div
                      key={permission.value}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span className="text-sm">{permission.label}</span>
                      <Badge variant={permission.granted ? "default" : "secondary"}>
                        {permission.granted ? "Granted" : "No Access"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PermissionsPage;
