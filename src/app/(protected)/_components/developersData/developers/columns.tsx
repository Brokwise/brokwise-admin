"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Developer, DeveloperStatus } from "@/types/developer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateDeveloperStatus } from "@/hooks/useDeveloper";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const StatusCell = ({ row }: { row: Row<Developer> }) => {
  const developer = row.original;
  const updateStatus = useUpdateDeveloperStatus();

  const handleStatusChange = (value: string) => {
    updateStatus.mutate({
      developerId: developer._id,
      status: value as DeveloperStatus,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 hover:bg-green-600";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "blacklisted":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Select
      defaultValue={developer.status}
      onValueChange={handleStatusChange}
      disabled={updateStatus.isPending}
    >
      <SelectTrigger
        className={`w-[130px] text-white ${getStatusColor(
          developer.status
        )} border-none`}
      >
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="blacklisted">Blacklisted</SelectItem>
      </SelectContent>
    </Select>
  );
};

export const columns: ColumnDef<Developer>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "contactNumber",
    header: "Contact Number",
  },
  {
    accessorKey: "createdAt",
    header: "Registered At",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "PPP");
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell row={row} />,
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const developer = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(developer._id)}
  //           >
  //             Copy ID
  //           </DropdownMenuItem>
  //           {/* Add more actions like View Details here if needed */}
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
