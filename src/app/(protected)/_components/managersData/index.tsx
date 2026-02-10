"use client";

import { useState, useMemo } from "react";
import { DataTable } from "./managers/data-table";
import { createColumns } from "./managers/columns";
import { CreateManagerDialog } from "./managers/create-manager-dialog";
import { EditManagerDialog } from "./managers/edit-manager-dialog";
import { PermissionsDialog } from "./managers/permissions-dialog";
import { ResetPasswordDialog } from "./managers/reset-password-dialog";
import { DeactivateDialog } from "./managers/deactivate-dialog";
import { useManagers } from "@/hooks/useManager";
import { Manager } from "@/types/manager";

export const ManagersData = () => {
  const { managers, isLoadingManagers, errorManagers } = useManagers(true);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  // Selected manager for dialogs
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  // Create columns with action handlers
  const columns = useMemo(
    () =>
      createColumns({
        onEdit: (manager) => {
          setSelectedManager(manager);
          setEditDialogOpen(true);
        },
        onEditPermissions: (manager) => {
          setSelectedManager(manager);
          setPermissionsDialogOpen(true);
        },
        onResetPassword: (manager) => {
          setSelectedManager(manager);
          setResetPasswordDialogOpen(true);
        },
        onDeactivate: (manager) => {
          setSelectedManager(manager);
          setDeactivateDialogOpen(true);
        },
      }),
    []
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <DataTable
        columns={columns}
        data={managers || []}
        isLoading={isLoadingManagers}
        error={errorManagers}
        onCreateNew={() => setCreateDialogOpen(true)}
      />

      {/* Create Manager Dialog */}
      <CreateManagerDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit Manager Dialog */}
      <EditManagerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        manager={selectedManager}
      />

      {/* Permissions Dialog */}
      <PermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        manager={selectedManager}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        manager={selectedManager}
      />

      {/* Deactivate Dialog */}
      <DeactivateDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        manager={selectedManager}
      />
    </div>
  );
};
