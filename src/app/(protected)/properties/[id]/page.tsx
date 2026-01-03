"use client";

import { useParams, useRouter } from "next/navigation";
import { useProperty, useUpdatePropertyStatus } from "@/hooks/useProperty";
import { ListingStatus, Broker } from "@/types/properties";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  CheckCircle2,
  Building2,
  Calendar,
  Ruler,
  Bath,
  BedDouble,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    ENQUIRY_ONLY: { variant: "outline", label: "ENQUIRY_ONLY" },
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

const formatDate = (dateInput: string | Date | undefined) => {
  if (!dateInput) return "N/A";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const BooleanBadge = ({ label, value }: { label: string; value?: boolean }) => {
  if (!value) return null;
  return (
    <Badge variant="secondary" className="gap-1">
      <CheckCircle2 className="h-3 w-3 text-green-600" />
      {label}
    </Badge>
  );
};

import { PropertyOffersList } from "./property-offers-list";
import Link from "next/link";

const PropertyDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { properties, isLoadingProperties } = useProperty();
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdatePropertyStatus();
  const id = params.id as string;

  const property = properties?.find((p) => p._id === id);

  if (isLoadingProperties) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!property) {
    return <div className="p-8">Property not found</div>;
  }
  console.log(property);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Property Details</h1>
            <span className="text-sm text-muted-foreground font-mono">
              ID: {property.propertyId || "Pending ID Assignment"}
            </span>
          </div>
          <div className="ml-auto flex gap-2">
            <BooleanBadge label="Verified" value={property.isVerified} />
            <BooleanBadge label="Featured" value={property.isFeatured} />
            <BooleanBadge label="Penthouse" value={property.isPenthouse} />
            <BooleanBadge
              label="Negotiable"
              value={property.isPriceNegotiable}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Main Image */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full bg-muted">
              {property.featuredMedia ? (
                property.featuredMedia.toLowerCase().includes(".heic") ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Preview not available (HEIC format)
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        window.open(property.featuredMedia, "_blank")
                      }
                    >
                      View Image
                    </Button>
                  </div>
                ) : (
                  <Image
                    src={
                      property.featuredMedia.includes(
                        "firebasestorage.googleapis.com"
                      ) || property.featuredMedia.includes("picsum.photos")
                        ? property.featuredMedia
                        : "/placeholder.webp"
                    }
                    alt="Featured Property Image"
                    fill
                    className="object-cover"
                    priority
                  />
                )
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
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Price
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(property.totalPrice)}
                  </p>
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
                  <div className="flex items-center gap-1">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {property.size} {property.sizeUnit}
                    </p>
                  </div>
                </div>
                {property.possessionDate && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Possession
                    </h4>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {formatDate(property.possessionDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                {property.bhk !== undefined && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      BHK
                    </h4>
                    <div className="flex items-center gap-1">
                      <BedDouble className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{property.bhk} BHK</p>
                    </div>
                  </div>
                )}
                {property.washrooms !== undefined && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Washrooms
                    </h4>
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{property.washrooms}</p>
                    </div>
                  </div>
                )}
                {property.society && (
                  <div className="col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      Society/Project
                    </h4>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{property.society}</p>
                    </div>
                  </div>
                )}
              </div>

              {property.projectArea && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Project Area
                  </h4>
                  <p className="font-medium">
                    {property.projectArea} {property.sizeUnit || ""}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Description
                </h4>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {property.description}
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Location
                </h4>
                <div className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded-md">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium">
                      {property.address.address}, {property.address.city}
                    </p>
                    <p className="text-muted-foreground">
                      {property.address.state} - {property.address.pincode}
                    </p>
                    {property.location?.coordinates && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        Coordinates: {property.location.coordinates[1]},{" "}
                        {property.location.coordinates[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Gallery */}
          <div className="grid md:grid-cols-2 gap-6">
            {property.images && property.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {property.images.map((img, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(img, "_blank")}
                        >
                          <Image
                            src={img}
                            alt={`Gallery image ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {property.floorPlans && property.floorPlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Floor Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {property.floorPlans.map((plan, i) => (
                        <div
                          key={i}
                          className="relative aspect-[3/4] rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(plan, "_blank")}
                        >
                          <Image
                            src={plan}
                            alt={`Floor plan ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 hover:opacity-100 transition-opacity">
                            <span className="bg-background/80 text-foreground text-xs px-2 py-1 rounded">
                              View
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
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
              {property.listingStatus !== "ENQUIRY_ONLY" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Change Status</label>
                  {property.listingStatus === "PENDING_APPROVAL" ? (
                    <div className="flex w-full gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={isUpdating}
                        onClick={() =>
                          updateStatus({
                            propertyId: property._id,
                            status: "ACTIVE",
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        className="flex-1"
                        variant="destructive"
                        disabled={isUpdating}
                        onClick={() =>
                          updateStatus({
                            propertyId: property._id,
                            status: "REJECTED",
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
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
                        <SelectItem value="PENDING_APPROVAL">
                          Pending
                        </SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="SOLD">Sold</SelectItem>
                        <SelectItem value="RENTED">Rented</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                        <SelectItem value="DELISTED">Delisted</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <div className="flex justify-between py-1">
                  <span>Created</span>
                  <span>{formatDate(property.createdAt)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Updated</span>
                  <span>{formatDate(property.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Broker Card */}
          <Card>
            <CardHeader>
              <CardTitle>Broker Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {typeof property.listedBy === "object" ? (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/brokers/${(property.listedBy as Broker)._id}`}
                      className="h-10 w-10 cursor-pointer rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold bg-slate-50"
                    >
                      {(property.listedBy as Broker).firstName?.[0]}
                      {(property.listedBy as Broker).lastName?.[0]}
                    </Link>
                    <Link
                      href={`/brokers/${(property.listedBy as Broker)._id}`}
                      className="cursor-pointer"
                    >
                      <p className="font-medium">
                        {(property.listedBy as Broker).firstName}{" "}
                        {(property.listedBy as Broker).lastName}
                      </p>
                      <p className="text-muted-foreground text-xs">Broker</p>
                    </Link>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Mobile</span>
                      <span className="font-medium">
                        {(property.listedBy as Broker).mobile}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Email</span>
                      <span
                        className="font-medium truncate max-w-[150px]"
                        title={(property.listedBy as Broker).email}
                      >
                        {(property.listedBy as Broker).email}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Company</span>
                      <span className="font-medium">
                        {(property.listedBy as Broker).companyName || "N/A"}
                      </span>
                    </div>
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

          {/* Extra Info Card (Optional: could handle deletion status here if needed) */}
          {property.deletingStatus && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700 text-lg">
                  Deletion Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600">
                  This property has a pending deletion request. Status:{" "}
                  {property.deletingStatus}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <PropertyOffersList propertyId={property._id} />
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
