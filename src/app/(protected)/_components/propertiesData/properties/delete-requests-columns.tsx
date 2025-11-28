"use client";

import { PropertyDeleteRequest } from "@/types/properties";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Check, X } from "lucide-react";
import { useManageDeleteRequest } from "@/hooks/useProperty";
import { toast } from "sonner";

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        >
          Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const deleteRequestsColumns: ColumnDef<PropertyDeleteRequest>[] = [
  {
    accessorKey: "brokerName",
    header: "Broker Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.brokerName}</span>
        <span className="text-xs text-muted-foreground">
          ID: {row.original.brokerId}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "propertyId",
    header: "Property ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("propertyId")}</div>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div
        className="max-w-[300px] truncate text-sm"
        title={row.getValue("reason")}
      >
        {row.getValue("reason")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
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
          Requested On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const request = row.original;
      return <ActionCell request={request} />;
    },
  },
];

function ActionCell({ request }: { request: PropertyDeleteRequest }) {
  const { mutate: manageRequest, isPending } = useManageDeleteRequest();

  if (request.status !== "pending") {
    return (
      <div className="text-xs text-muted-foreground italic">No actions</div>
    );
  }

  const handleAction = (status: "approved" | "rejected") => {
    manageRequest(
      { requestId: request._id, status },
      {
        onSuccess: () => {
          toast.success(`Request ${status} successfully`);
        },
        onError: (error) => {
          toast.error(`Failed to ${status} request`);
          console.error(error);
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
        onClick={() => handleAction("approved")}
        disabled={isPending}
        title="Approve"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        onClick={() => handleAction("rejected")}
        disabled={isPending}
        title="Reject"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
