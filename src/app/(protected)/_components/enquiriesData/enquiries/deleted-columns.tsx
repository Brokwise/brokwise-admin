"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  RotateCcw,
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
import { useResortEnquiry } from "@/hooks/useEnquiry";
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

const DeletedCellAction = ({ enquiry }: { enquiry: Enquiry }) => {
  const [open, setOpen] = useState(false);
  const { mutate: restoreEnquiry, isPending } = useResortEnquiry(enquiry._id);

  const onRestore = () => {
    restoreEnquiry(undefined, {
      onSuccess: () => {
        toast.success("Enquiry restored successfully");
        setOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to restore enquiry");
        console.error(error);
      },
    });
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the enquiry back to the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onRestore} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restore
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
            onClick={() => setOpen(true)}
            className="text-primary focus:text-primary"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore Enquiry
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const deletedColumns: ColumnDef<Enquiry>[] = [
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
      const locations = row.original.preferredLocations;
      const address = locations?.[0]?.address || row.original.address;
      const count = locations?.length ?? (address ? 1 : 0);
      return (
        <div className="max-w-[220px]">
          <div className="truncate" title={address}>
            {address || <span className="text-muted-foreground">N/A</span>}
          </div>
          {count > 1 && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 mt-0.5">
              +{count - 1} more
            </Badge>
          )}
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
    accessorKey: "deletedAt",
    header: "Deleted At",
    cell: ({ row }) => {
      const deletedAt = row.original.deletedAt;
      return deletedAt ? (
        <div className="text-sm whitespace-nowrap">
          {formatDate(deletedAt.toString())}
        </div>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DeletedCellAction enquiry={row.original} />,
  },
];
