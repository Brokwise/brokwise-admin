"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  Trash,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Enquiry } from "@/types/enquiry";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDeleteEnquiry } from "@/hooks/useEnquiry";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const getStatusBadge = (status: string) => {
  const variants: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    open: { variant: "default", label: "Open" },
    closed: { variant: "secondary", label: "Closed" },
    pending: { variant: "outline", label: "Pending" },
    resolved: { variant: "default", label: "Resolved" },
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

const CellAction = ({ enquiry }: { enquiry: Enquiry }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutate: deleteEnquiry, isPending } = useDeleteEnquiry(enquiry._id);
  const [reason, setReason] = useState("");

  const onDelete = () => {
    if (reason.length < 10) {
      toast.error("Deletion reason must be at least 10 characters");
      return;
    }
    if (reason.length > 500) {
      toast.error("Deletion reason cannot exceed 500 characters");
      return;
    }

    deleteEnquiry(
      { reason },
      {
        onSuccess: () => {
          toast.success("Enquiry deleted successfully");
          setOpen(false);
          setReason("");
        },
        onError: (error) => {
          toast.error("Failed to delete enquiry");
          console.error(error);
        },
      }
    );
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will soft delete the enquiry. You can restore it later
              from the Deleted Enquiries tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">
                Reason for deletion <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for deletion (10-500 chars)"
                className="resize-none"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReason("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                if (reason.length < 10 || reason.length > 500) {
                  e.preventDefault();
                  onDelete();
                } else {
                  onDelete();
                }
              }}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
            onClick={() => navigator.clipboard.writeText(enquiry.enquiryId)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Enquiry ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/enquiries/${enquiry._id}`)}
          >
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem>View Matches</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Enquiry
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<Enquiry>[] = [
  {
    accessorKey: "enquiryId",
    header: "Enquiry ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("enquiryId")}</div>
    ),
  },
  {
    accessorKey: "enquiryType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const category = row.original.enquiryCategory;
      const type = row.original.enquiryType;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{type}</span>
          <span className="text-xs text-muted-foreground">{category}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.original.address;
      return (
        <div className="max-w-[220px] truncate" title={address}>
          {address || <span className="text-muted-foreground">N/A</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "budget",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Budget
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const budget = row.original.budget;
      if (!budget) {
        return <div className="text-sm text-muted-foreground">N/A</div>;
      }
      return (
        <div className="text-sm whitespace-nowrap">
          {formatCurrency(budget.min)} - {formatCurrency(budget.max)}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const minA = rowA.original.budget?.min || 0;
      const minB = rowB.original.budget?.min || 0;
      return minA - minB;
    },
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      const size = row.original.size;
      if (!size) {
        return <div className="text-sm text-muted-foreground">N/A</div>;
      }
      return (
        <div className="text-sm whitespace-nowrap">
          {size.min} - {size.max} {size.unit?.toLowerCase().replace("_", " ")}
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
    filterFn: (row, id, value) => {
      return value === "all" || row.getValue(id) === value;
    },
  },
  {
    accessorKey: "submissionCount",
    header: "Submissions",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("submissionCount")}</div>
    ),
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
    cell: ({ row }) => <CellAction enquiry={row.original} />,
  },
];
