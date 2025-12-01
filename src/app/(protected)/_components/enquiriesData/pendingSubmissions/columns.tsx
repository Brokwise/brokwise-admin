"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PendingSubmission } from "@/types/enquiry";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { SubmissionDetailsDialog } from "./submission-details-dialog";

const getStatusBadge = (status: string) => {
  const variants: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    pending: { variant: "outline", label: "Pending" },
    approved: { variant: "default", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
  };

  const config = variants[status] || { variant: "outline", label: status };
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const ActionsCell = ({ submission }: { submission: PendingSubmission }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(submission.submissionId)
            }
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Submission ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            Review Submission
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SubmissionDetailsDialog
        submission={submission}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
};

export const columns: ColumnDef<PendingSubmission>[] = [
  {
    accessorKey: "submissionId",
    header: "Submission ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("submissionId")}</div>
    ),
  },
  {
    id: "enquiryInfo",
    header: "Enquiry",
    cell: ({ row }) => {
      const enquiry = row.original.enquiryId;
      if (!enquiry) return <span className="text-muted-foreground">N/A</span>;

      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{enquiry.enquiryId}</span>
          <span className="text-xs text-muted-foreground">
            {enquiry.enquiryType} • {enquiry.city}
          </span>
        </div>
      );
    },
  },
  {
    id: "brokerInfo",
    header: "Broker",
    cell: ({ row }) => {
      const broker = row.original.brokerId;
      if (!broker) return <span className="text-muted-foreground">N/A</span>;

      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {broker.firstName} {broker.lastName}
          </span>
          <span className="text-xs text-muted-foreground">
            {broker.companyName}
          </span>
        </div>
      );
    },
  },
  {
    id: "propertyInfo",
    header: "Property",
    cell: ({ row }) => {
      const property = row.original.propertyId;
      if (!property) return <span className="text-muted-foreground">N/A</span>;

      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{property.propertyType}</span>
          <span className="text-xs text-muted-foreground">
            {formatCurrency(property.totalPrice)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return getStatusBadge(row.getValue("status"));
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
        <div className="text-sm whitespace-nowrap">
          {formatDate(row.getValue("createdAt"))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell submission={row.original} />,
  },
];
