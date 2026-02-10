"use client";

import { useEffect, useState } from "react";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateManager } from "@/hooks/useManager";
import { VALID_PERMISSIONS, PERMISSION_LABELS, PERMISSION_GROUPS, Permission } from "@/types/manager";
import { Loader2, Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  permissions: z.array(z.enum(VALID_PERMISSIONS as unknown as [string, ...string[]])).default([]),
});

type FormValues = z.infer<typeof formSchema> & {
  permissions: Permission[];
};

interface CreateManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateManagerDialog({ open, onOpenChange }: CreateManagerDialogProps) {
  const createManager = useCreateManager();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setShowPassword(false);
    }
  }, [open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await createManager.mutateAsync(values);
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
    return Array.from(new Set([...currentPermissions, ...groupPermissions]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Manager</DialogTitle>
          <DialogDescription>
            Add a new manager with specific permissions to help manage the platform.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a strong password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <div className="space-y-4 rounded-lg border p-4">
                    {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPermissions]) => {
                      const allSelected = groupPermissions.every((p) =>
                        field.value.includes(p)
                      );
                      const someSelected = groupPermissions.some((p) =>
                        field.value.includes(p)
                      );

                      return (
                        <div key={groupName} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`group-${groupName}`}
                              checked={allSelected}
                              data-state={someSelected && !allSelected ? "indeterminate" : undefined}
                              onCheckedChange={() => {
                                field.onChange(
                                  toggleGroupPermissions(groupPermissions, field.value)
                                );
                              }}
                            />
                            <label
                              htmlFor={`group-${groupName}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {groupName}
                            </label>
                          </div>
                          <div className="ml-6 grid grid-cols-2 gap-2">
                            {groupPermissions.map((permission) => (
                              <div
                                key={permission}
                                className="flex items-center space-x-2"
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
                                  className="text-sm text-muted-foreground leading-none cursor-pointer"
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createManager.isPending}>
                {createManager.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Manager
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
