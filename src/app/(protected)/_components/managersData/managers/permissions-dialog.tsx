"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateManagerPermissions } from "@/hooks/useManager";
import { Manager, VALID_PERMISSIONS, PERMISSION_LABELS, PERMISSION_GROUPS, Permission } from "@/types/manager";
import { Loader2, Shield } from "lucide-react";

const formSchema = z.object({
  permissions: z.array(z.enum(VALID_PERMISSIONS)),
});

type FormValues = z.infer<typeof formSchema>;

interface PermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: Manager | null;
}

export function PermissionsDialog({
  open,
  onOpenChange,
  manager,
}: PermissionsDialogProps) {
  const updatePermissions = useUpdateManagerPermissions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      permissions: [],
    },
  });

  useEffect(() => {
    if (manager && open) {
      form.reset({
        permissions: manager.permissions || [],
      });
    }
  }, [manager, open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!manager) return;

    try {
      await updatePermissions.mutateAsync({
        managerId: manager._id,
        permissions: values.permissions,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const togglePermission = (permission: Permission, currentPermissions: Permission[]) => {
    if (currentPermissions.includes(permission)) {
      return currentPermissions.filter((p) => p !== permission);
    }
    return [...currentPermissions, permission];
  };

  const toggleGroupPermissions = (
    groupPermissions: Permission[],
    currentPermissions: Permission[]
  ) => {
    const allSelected = groupPermissions.every((p) => currentPermissions.includes(p));
    if (allSelected) {
      return currentPermissions.filter((p) => !groupPermissions.includes(p));
    }
    return [...new Set([...currentPermissions, ...groupPermissions])];
  };

  const selectAllPermissions = (currentPermissions: Permission[]) => {
    const allPermissions = Object.values(PERMISSION_GROUPS).flat();
    const allSelected = allPermissions.every((p) => currentPermissions.includes(p));
    if (allSelected) {
      return [];
    }
    return [...allPermissions];
  };

  if (!manager) return null;

  const currentPermissions = form.watch("permissions");
  const allPermissions = Object.values(PERMISSION_GROUPS).flat();
  const allSelected = allPermissions.every((p) => currentPermissions.includes(p));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions
          </DialogTitle>
          <DialogDescription>
            Configure access permissions for {manager.first_name} {manager.last_name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-4">
                    <FormLabel className="text-base">Permissions</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        field.onChange(selectAllPermissions(field.value));
                      }}
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="space-y-4 rounded-lg border p-4">
                    {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPermissions]) => {
                      const allGroupSelected = groupPermissions.every((p) =>
                        field.value.includes(p)
                      );
                      const someGroupSelected = groupPermissions.some((p) =>
                        field.value.includes(p)
                      );

                      return (
                        <div key={groupName} className="space-y-3">
                          <div className="flex items-center space-x-2 border-b pb-2">
                            <Checkbox
                              id={`group-${groupName}`}
                              checked={allGroupSelected}
                              data-state={someGroupSelected && !allGroupSelected ? "indeterminate" : undefined}
                              onCheckedChange={() => {
                                field.onChange(
                                  toggleGroupPermissions(groupPermissions, field.value)
                                );
                              }}
                            />
                            <label
                              htmlFor={`group-${groupName}`}
                              className="text-sm font-semibold leading-none cursor-pointer"
                            >
                              {groupName}
                            </label>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({groupPermissions.filter((p) => field.value.includes(p)).length}/
                              {groupPermissions.length})
                            </span>
                          </div>
                          <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {groupPermissions.map((permission) => (
                              <div
                                key={permission}
                                className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50"
                              >
                                <Checkbox
                                  id={permission}
                                  checked={field.value.includes(permission)}
                                  onCheckedChange={() => {
                                    field.onChange(
                                      togglePermission(permission, field.value)
                                    );
                                  }}
                                />
                                <label
                                  htmlFor={permission}
                                  className="text-sm leading-none cursor-pointer flex-1"
                                >
                                  {PERMISSION_LABELS[permission]}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Selected Permissions: {currentPermissions.length}</p>
              <p className="text-muted-foreground">
                {currentPermissions.length === 0
                  ? "No permissions selected. Manager won't be able to perform any actions."
                  : currentPermissions.length === allPermissions.length
                    ? "Full access to all features."
                    : `Access to ${currentPermissions.length} feature(s).`}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePermissions.isPending}>
                {updatePermissions.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Permissions
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
