"use client";

import { Company, CompanyStatus } from "@/types/company";
import { useCompanyStatusUpdate } from "@/hooks/useCompany";
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
import Link from "next/link";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Company Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
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
      return <div className="text-sm">{row.getValue("email")}</div>;
    },
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => {
      return <div className="text-sm">{row.getValue("mobile")}</div>;
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
      return <div className="text-sm">{row.getValue("city")}</div>;
    },
  },
  {
    accessorKey: "gstin",
    header: "GSTIN",
    cell: ({ row }) => {
      return <div className="text-sm font-mono">{row.getValue("gstin")}</div>;
    },
  },
  {
    accessorKey: "noOfEmployees",
    header: "Employees",
    cell: ({ row }) => {
      return <div className="text-sm">{row.getValue("noOfEmployees")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const company = row.original;
      return <StatusCell company={company} />;
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
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const company = row.original;
      return (
        <div className="text-right">
          <Link href={`/companies/${company._id}`}>
            <Button variant="outline" size="sm">
              View Details <ArrowRight className="ml-2 w-3 h-3" />
            </Button>
          </Link>
        </div>
      );
    },
  },
];

function StatusCell({ company }: { company: Company }) {
  const { updateMutation } = useCompanyStatusUpdate();

  return (
    <Select
      defaultValue={company.status as CompanyStatus}
      value={company.status as CompanyStatus}
      onValueChange={(value: CompanyStatus) => {
        updateMutation({
          status: value as CompanyStatus,
          _id: company._id,
        });
        // Optimistic update if needed, but react-query invalidation handles it
      }}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="Select Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="incomplete">Incomplete</SelectItem>
        <SelectItem value="blacklisted">Blacklisted</SelectItem>
      </SelectContent>
    </Select>
  );
}




