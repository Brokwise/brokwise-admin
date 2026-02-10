"use client";

import { ListingStatus, Property } from "@/types/properties";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowUpDown, ArrowRight, MapPin } from "lucide-react";
import { useUpdatePropertyStatus } from "@/hooks/useProperty";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission, normalizeUserType } from "@/lib/permissions";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const columns: ColumnDef<Property>[] = [
  {
    accessorKey: "featuredMedia",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("featuredMedia") as string;
      const isHeic = image?.toLowerCase().includes(".heic");

      return (
        <div className="relative h-10 w-16 overflow-hidden rounded-md">
          {image ? (
            isHeic ? (
              <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                HEIC
              </div>
            ) : (
              <Image
                src={
                  image.includes("firebasestorage.googleapis.com") ||
                    image.includes("picsum.photos")
                    ? image
                    : "/placeholder.webp"
                }
                alt="Property"
                fill
                className="object-cover"
                sizes="64px"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.webp";
                }}
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
              No Img
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "propertyId",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs">
        {row.getValue("propertyId") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "category_type",
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
    accessorFn: (row) => `${row.propertyCategory} ${row.propertyType}`,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-xs">
            {row.original.propertyCategory.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {row.original.propertyType.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("totalPrice"));
      return <div className="font-medium">{formatPrice(price)}</div>;
    },
  },
  {
    accessorKey: "address",
    header: "Location",
    cell: ({ row }) => {
      const address = row.original.address;
      const formattedAddress = `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
      return (
        <div
          className="max-w-[200px] truncate text-sm"
          title={formattedAddress}
        >
          <MapPin className="mr-1 inline-block h-3 w-3 text-muted-foreground" />
          {address.city}, {address.state}
        </div>
      );
    },
  },
  {
    accessorKey: "listedBy",
    header: "Listed By",
    cell: ({ row }) => {
      const broker = row.original.listedBy;

      // Handle if broker is an object (old data) or string ID (new type)
      if (typeof broker === "object" && broker !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const brokerObj = broker as any;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {brokerObj.firstName} {brokerObj.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {brokerObj.mobile}
            </span>
          </div>
        );
      }

      return (
        <div className="flex flex-col">
          <span
            className="text-sm font-medium truncate max-w-[150px]"
            title={broker as string}
          >
            ID: {broker}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "listingStatus",
    header: "Status",
    cell: ({ row }) => {
      const property = row.original;
      return property.listingStatus === "ENQUIRY_ONLY" ? (
        <h1>Enquiry only</h1>
      ) : (
        <StatusCell property={property} />
      );
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
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-xs text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const property = row.original;
      return (
        <Link href={`/properties/${property._id}`}>
          <Button variant="outline" size="sm" className="h-8 px-2">
            View <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </Link>
      );
    },
  },
];

function StatusCell({ property }: { property: Property }) {
  const { mutate: updateStatus, isPending } = useUpdatePropertyStatus();
  const rawUserType = useAuthStore((state) => state.userType);
  const permissions = useAuthStore((state) => state.permissions);
  const userType = normalizeUserType(rawUserType);
  const canChangeStatus = hasPermission(userType, permissions, "property:status");

  return (
    <Select
      defaultValue={property.listingStatus}
      disabled={isPending || !canChangeStatus}
      onValueChange={(value: ListingStatus) => {
        updateStatus({
          propertyId: property._id,
          status: value,
        });
        // Optimistic update (optional, but good for UI)
        property.listingStatus = value;
      }}
    >
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue placeholder="Select Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
        <SelectItem value="ACTIVE">Active</SelectItem>
        <SelectItem value="REJECTED">Rejected</SelectItem>
        <SelectItem value="DRAFT">Draft</SelectItem>
        <SelectItem value="SOLD">Sold</SelectItem>
        <SelectItem value="RENTED">Rented</SelectItem>
        <SelectItem value="EXPIRED">Expired</SelectItem>
        <SelectItem value="DELISTED">Delisted</SelectItem>
        <SelectItem value="DELETED">Deleted</SelectItem>
      </SelectContent>
    </Select>
  );
}
