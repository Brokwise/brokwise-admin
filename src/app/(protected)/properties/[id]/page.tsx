"use client";

import { useParams, useRouter } from "next/navigation";
import { useProperty, useUpdatePropertyStatus } from "@/hooks/useProperty";
import { ListingStatus, Property } from "@/types/properties";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const PropertyDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { properties, isLoadingProperties } = useProperty();
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdatePropertyStatus();
  const id = params.id as string;

  const property = properties?.find((p) => p._id === id);

  if (isLoadingProperties) {
    return <div className="p-8">Loading...</div>;
  }

  if (!property) {
    return <div className="p-8">Property not found</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Property Details</h1>
        <span className="text-sm text-muted-foreground ml-2 font-mono">
          ID: {property.propertyId}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Main Image */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full bg-muted">
              {property.featuredMedia ? (
                <Image
                  src={
                    property.featuredMedia.includes(
                      "firebasestorage.googleapis.com"
                    )
                      ? property.featuredMedia
                      : "/placeholder.webp"
                  }
                  alt="Featured Property Image"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No Image Available
                </div>
              )}
            </div>
          </Card>

          {/* Key Details */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Price
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(property.totalPrice)}
                  </p>
                  {property.isPriceNegotiable && (
                    <Badge variant="secondary" className="mt-1">
                      Negotiable
                    </Badge>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Rate
                  </h4>
                  <p className="text-lg">
                    {formatPrice(property.rate)} / {property.sizeUnit || "unit"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Category
                  </h4>
                  <p className="font-medium">{property.propertyCategory}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Type
                  </h4>
                  <p className="font-medium">{property.propertyType}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Size
                  </h4>
                  <p className="font-medium">
                    {property.size} {property.sizeUnit}
                  </p>
                </div>
                {property.facing && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Facing
                    </h4>
                    <p className="font-medium">{property.facing}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Description
                </h4>
                <p className="text-sm whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Location
                </h4>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p>
                    {property.address.address}, {property.address.city},{" "}
                    {property.address.state} - {property.address.pincode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Current Status
                </span>
                {getStatusBadge(property.listingStatus)}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Change Status</label>
                <Select
                  defaultValue={property.listingStatus}
                  disabled={isUpdating}
                  onValueChange={(value: ListingStatus) => {
                    updateStatus({
                      propertyId: property._id,
                      status: value,
                    });
                  }}
                >
                  <SelectTrigger>
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
              </div>
              <div className="pt-4 border-t text-xs text-muted-foreground">
                Created: {formatDate(property.createdAt)}
              </div>
            </CardContent>
          </Card>

          {/* Broker Card */}
          <Card>
            <CardHeader>
              <CardTitle>Broker Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {typeof property.listedBy === "object" ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">
                      Name
                    </span>
                    <span className="font-medium">
                      {(property.listedBy as any).firstName}{" "}
                      {(property.listedBy as any).lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">
                      Mobile
                    </span>
                    <span>{(property.listedBy as any).mobile}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">
                      Email
                    </span>
                    <span>{(property.listedBy as any).email}</span>
                  </div>
                </>
              ) : (
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">
                    Broker ID
                  </span>
                  <span className="font-mono">{property.listedBy}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
