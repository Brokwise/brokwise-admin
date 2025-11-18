"use client";
import { Broker, BrokerStatus, useBrokerStatusUpdate } from "@/hooks/useBroker";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpDown, ArrowRight } from "lucide-react";

const getStatusBadge = (status: BrokerStatus) => {
  const variants: Record<
    BrokerStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    approved: { variant: "default", label: "Approved" },
    pending: { variant: "secondary", label: "Pending" },
    incomplete: { variant: "outline", label: "Incomplete" },
    blacklisted: { variant: "destructive", label: "Blacklisted" },
  };

  const config = variants[status];
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                View Details <ArrowRight className="ml-2 w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Broker Details</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <div className="flex flex-col gap-3 text-foreground">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">
                      {broker.firstName} {broker.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{broker.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mobile</p>
                    <p className="text-sm">{broker.mobile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm">{broker.companyName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">City</p>
                      <p className="text-sm">{broker.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Experience
                      </p>
                      <p className="text-sm">
                        {broker.yearsOfExperience} years
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">RERA Number</p>
                    <p className="text-sm font-mono">{broker.reraNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">GSTIN</p>
                    <p className="text-sm font-mono">{broker.gstin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Office Address
                    </p>
                    <p className="text-sm">{broker.officeAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(broker.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Broker ID</p>
                    <p className="text-sm font-mono">{broker.brokerId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm">{formatDate(broker.createdAt)}</p>
                  </div>
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
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
