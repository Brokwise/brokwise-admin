"use client";

import {
  ListingStatus,
  Property,
  PropertyCategory,
  PropertyType,
} from "@/types/properties";
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
import { ArrowUpDown, ArrowRight, MapPin } from "lucide-react";
import { useUpdatePropertyStatus } from "@/hooks/useProperty";
import Image from "next/image";

const getStatusBadge = (status: ListingStatus) => {
  const variants: Record<
    ListingStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
      className?: string;
    }
  > = {
    ACTIVE: {
      variant: "default",
      label: "Active",
      className: "bg-green-600 hover:bg-green-700",
    },
    PENDING_APPROVAL: {
      variant: "secondary",
      label: "Pending Approval",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    DRAFT: { variant: "outline", label: "Draft" },
    REJECTED: { variant: "destructive", label: "Rejected" },
    SOLD: {
      variant: "secondary",
      label: "Sold",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    RENTED: {
      variant: "secondary",
      label: "Rented",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    },
    EXPIRED: {
      variant: "outline",
      label: "Expired",
      className: "text-gray-500",
    },
    DELISTED: {
      variant: "destructive",
      label: "Delisted",
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
  };

  const config = variants[status] || { variant: "outline", label: status };
  return (
    <Badge
      variant={config.variant}
      className={`capitalize ${config.className || ""}`}
    >
      {config.label}
    </Badge>
  );
};

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
      return (
        <div className="relative h-10 w-16 overflow-hidden rounded-md">
          {image ? (
            <Image
              src={image}
              alt="Property"
              fill
              className="object-cover"
              sizes="64px"
            />
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
      <div className="font-mono text-xs">{row.getValue("propertyId")}</div>
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
      const address = row.getValue("address") as string;
      return (
        <div className="max-w-[200px] truncate text-sm" title={address}>
          <MapPin className="mr-1 inline-block h-3 w-3 text-muted-foreground" />
          {address}
        </div>
      );
    },
  },
  {
    accessorKey: "listedBy",
    header: "Listed By",
    cell: ({ row }) => {
      const broker = row.original.listedBy;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {broker.firstName} {broker.lastName}
          </span>
          <span className="text-xs text-muted-foreground">{broker.mobile}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "listingStatus",
    header: "Status",
    cell: ({ row }) => {
      const property = row.original;
      return <StatusCell property={property} />;
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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              View <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Property Details</DialogTitle>
              <DialogDescription>ID: {property.propertyId}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Media Preview */}
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                {property.featuredMedia ? (
                  <Image
                    src={property.featuredMedia}
                    alt="Featured"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    No Image
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Price
                  </h4>
                  <p className="text-lg font-bold">
                    {formatPrice(property.totalPrice)}
                  </p>
                  {property.isPriceNegotiable && (
                    <Badge variant="outline" className="mt-1">
                      Negotiable
                    </Badge>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Rate
                  </h4>
                  <p>
                    {formatPrice(property.rate)} / {property.sizeUnit || "unit"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Description
                </h4>
                <p className="text-sm">{property.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Category
                  </h4>
                  <p className="text-sm">{property.propertyCategory}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Type
                  </h4>
                  <p className="text-sm">{property.propertyType}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Size
                  </h4>
                  <p className="text-sm">
                    {property.size} {property.sizeUnit}
                  </p>
                </div>
                {property.facing && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Facing
                    </h4>
                    <p className="text-sm">{property.facing}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2">Location</h4>
                <p className="text-sm">{property.address}</p>
                {property.localities && property.localities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {property.localities.map((loc, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {loc}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2">Broker Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {property.listedBy.firstName} {property.listedBy.lastName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {property.listedBy.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mobile:</span>{" "}
                    {property.listedBy.mobile}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Broker ID:</span>{" "}
                    {property.listedBy.brokerId}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2">Status</h4>
                <div className="flex items-center gap-4">
                  {getStatusBadge(property.listingStatus)}
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(property.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];

function StatusCell({ property }: { property: Property }) {
  const { mutate: updateStatus, isPending } = useUpdatePropertyStatus();

  return (
    <Select
      defaultValue={property.listingStatus}
      disabled={isPending}
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
      </SelectContent>
    </Select>
  );
}
