"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Shield, Key, Edit, UserX } from "lucide-react";
import { Manager, PERMISSION_LABELS } from "@/types/manager";

const formatDate = (dateString?: string) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

interface ColumnsProps {
  onEdit: (manager: Manager) => void;
  onEditPermissions: (manager: Manager) => void;
  onResetPassword: (manager: Manager) => void;
  onDeactivate: (manager: Manager) => void;
}

export const createColumns = ({
  onEdit,
  onEditPermissions,
  onResetPassword,
  onDeactivate,
}: ColumnsProps): ColumnDef<Manager>[] => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const manager = row.original;
        const fullName = `${manager.first_name || ""} ${manager.last_name || ""}`.trim();
        const initials = `${manager.first_name?.charAt(0) || ""}${manager.last_name?.charAt(0) || ""}`.toUpperCase();

        return (
          <div className="font-medium flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>{fullName || "--"}</div>
              <div className="text-xs text-muted-foreground">{manager.email}</div>
            </div>
          </div>
        );
      },
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-sm">{row.getValue("email") || "--"}</div>;
      },
      enableHiding: true,
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        const permissions = row.original.permissions || [];
        const displayCount = 2;
        const remaining = permissions.length - displayCount;

        if (permissions.length === 0) {
          return <span className="text-muted-foreground text-sm">No permissions</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {permissions.slice(0, displayCount).map((perm) => (
              <Badge key={perm} variant="secondary" className="text-xs">
                {PERMISSION_LABELS[perm] || perm}
              </Badge>
            ))}
            {remaining > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remaining} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (value === undefined) return true;
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: "lastLogin",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Login
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-sm">{formatDate(row.getValue("lastLogin"))}</div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-sm">{formatDate(row.getValue("createdAt"))}</div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const manager = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(manager)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditPermissions(manager)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Manage Permissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResetPassword(manager)}>
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeactivate(manager)}
                  className="text-destructive focus:text-destructive"
                  disabled={!manager.isActive}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
