"use client";
import { Broker, BrokerStatus, useBrokerStatusUpdate } from "@/hooks/useBroker";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission, normalizeUserType } from "@/lib/permissions";

const formatDate = (dateString: string) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const columns: ColumnDef<Broker>[] = [
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
      const broker = row.original;
      const fullName = `${broker.firstName || ""} ${broker.lastName || ""
        }`.trim();
      return (
        <div className="font-medium flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={broker.profilePhoto} alt={fullName || "Broker"} />
            <AvatarFallback>
              {broker?.firstName?.charAt(0) ||
                broker?.lastName?.charAt(0) ||
                "?"}
            </AvatarFallback>
          </Avatar>
          {fullName || "--"}
        </div>
      );
    },
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
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
  },
  {
    accessorKey: "plan",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Plan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const plan = row.getValue("plan") as { tier: string, phase: string };
      return <div className="text-xs">{plan?.tier || "--"} {plan?.phase || "--"}</div>;
    },
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => {
      return <div className="text-sm">{row.getValue("mobile") || "--"}</div>;
    },
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm">{row.getValue("companyName") || "--"}</div>
      );
    },
  },
  {
    accessorKey: "city",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-sm">{row.getValue("city") || "--"}</div>;
    },
  },
  {
    accessorKey: "yearsOfExperience",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Experience
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("yearsOfExperience");
      return (
        <div className="text-sm">
          {value !== undefined && value !== null ? `${value} years` : "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "reraNumber",
    header: "RERA No.",
    cell: ({ row }) => {
      return (
        <div className="font-mono text-xs">
          {row.getValue("reraNumber") || "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const broker = row.original;
      return <Badge variant={broker.status === "approved" ? "default" : "secondary"}>{broker.status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value === "all" || row.getValue(id) === value;
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
          Joined
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
    accessorKey: "brokerId",
    header: "Broker ID",
    cell: ({ row }) => {
      return (
        <div className="font-mono text-xs">
          {row.getValue("brokerId") || "--"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const broker = row.original;
      return (
        <div className="text-right">
          <Link href={`/brokers/${broker._id}`}>
            <Button variant="outline" size="sm">
              View Details <ArrowRight className="ml-2 w-3 h-3" />
            </Button>
          </Link>
        </div>
      );
    },
  },
];

