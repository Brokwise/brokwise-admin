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
import Link from "next/link";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
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
      return (
        <div className="font-medium">
          {broker.firstName} {broker.lastName}
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
      return <div className="text-sm">{row.getValue("companyName")}</div>;
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
      return (
        <div className="text-sm">{row.getValue("yearsOfExperience")} years</div>
      );
    },
  },
  {
    accessorKey: "reraNumber",
    header: "RERA No.",
    cell: ({ row }) => {
      return (
        <div className="font-mono text-xs">{row.getValue("reraNumber")}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const broker = row.original;
      return <StatusCell broker={broker} />;
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
        <div className="font-mono text-xs">{row.getValue("brokerId")}</div>
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

function StatusCell({ broker }: { broker: Broker }) {
  const { updateMutation } = useBrokerStatusUpdate();

  return (
    <Select
      defaultValue={broker.status as BrokerStatus}
      value={broker.status as BrokerStatus}
      onValueChange={(value: BrokerStatus) => {
        updateMutation({
          status: value as BrokerStatus,
          _id: broker._id,
        });
        broker.status = value;
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
