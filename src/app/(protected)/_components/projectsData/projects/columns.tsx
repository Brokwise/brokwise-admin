"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Project, ProjectStatus } from "@/types/project";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateProjectStatus } from "@/hooks/useProject";
import { format } from "date-fns";
import { ArrowUpDown, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const StatusCell = ({ row }: { row: Row<Project> }) => {
  const project = row.original;
  const updateStatus = useUpdateProjectStatus();

  const handleStatusChange = (value: string) => {
    updateStatus.mutate({
      projectId: project._id,
      status: value as ProjectStatus,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "draft":
        return "bg-gray-500 hover:bg-gray-600";
      case "rejected":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Select
      defaultValue={project.projectStatus}
      onValueChange={handleStatusChange}
      disabled={updateStatus.isPending}
    >
      <SelectTrigger
        className={`w-[130px] text-white ${getStatusColor(
          project.projectStatus
        )} border-none capitalize`}
      >
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
};

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const images = row.original.images;
      const displayImage = images && images.length > 0 ? images[0] : null;

      return (
        <div className="relative h-10 w-16 overflow-hidden rounded-md">
          {displayImage ? (
            <Image
              src={displayImage}
              alt="Project"
              fill
              className="object-cover"
              sizes="64px"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.webp";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const developer = row.original.developerId;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          {developer && typeof developer === "object" && (
            <span className="text-xs text-muted-foreground">
              by {developer.firstName} {developer.lastName}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Location",
    cell: ({ row }) => {
      const address = row.original.address;

      if (!address) {
        return (
          <div className="flex items-start gap-1 max-w-[200px] text-muted-foreground text-xs">
            No location info
          </div>
        );
      }

      return (
        <div className="flex items-start gap-1 max-w-[200px]">
          <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-col text-sm">
            <span className="truncate" title={address.address}>
              {address.city}, {address.state}
            </span>
            <span className="text-xs text-muted-foreground">
              {address.pincode}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "projectType",
    header: "Type",
    cell: ({ row }) => {
      const projectType = row.original.projectType;
      const projectUse = row.original.projectUse;

      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium capitalize">
            {projectType?.replace(/-/g, " ") || "-"}
          </span>
          {projectUse && (
            <span className="text-xs text-muted-foreground capitalize">
              {projectUse}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "numberOfPlots",
    header: "Plots",
    cell: ({ row }) => {
      const plots = row.original.numberOfPlots;

      if (!plots) return <span className="text-muted-foreground">-</span>;

      return <div className="text-sm font-medium">{plots}</div>;
    },
  },
  {
    accessorKey: "reraNumber",
    header: "RERA",
    cell: ({ row }) => {
      const rera = row.getValue("reraNumber") as string;
      return rera ? (
        <div className="font-mono text-xs max-w-[120px] truncate" title={rera}>
          {rera}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "possessionDate",
    header: "Possession",
    cell: ({ row }) => {
      const date = row.getValue("possessionDate") as string;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return <div className="text-sm">{format(new Date(date), "PP")}</div>;
    },
  },
  {
    accessorKey: "projectStatus",
    header: "Status",
    cell: ({ row }) => <StatusCell row={row} />,
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
        <div className="text-xs text-muted-foreground">
          {format(new Date(row.getValue("createdAt")), "PP")}
        </div>
      );
    },
  },
];
