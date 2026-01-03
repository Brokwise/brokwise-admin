"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import {
  useProjectById,
  useProjectBookings,
  useReleaseHold,
} from "@/hooks/useProject";
import { BookingDetailsDialog } from "./booking-details-dialog";
import { ProjectEditDialog } from "./project-edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Building2,
  Home,
  FileText,
  ImageIcon,
  CheckCircle,
  Clock,
  User,
  LandPlot,
  ExternalLink,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const ProjectPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const projectId = id as string;
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const { data: projectDetails, isLoading: isLoadingProject } =
    useProjectById(projectId);
  const { data: bookings = [], isLoading: isLoadingBookings } =
    useProjectBookings(projectId);
  const { mutate: releaseHold, isPending: isReleasing } = useReleaseHold();

  const project = projectDetails?.project;
  const plotStats = projectDetails?.plotStats;

  if (isLoadingProject) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "draft":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getDevelopmentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "under-development":
        return "secondary";
      case "ready-to-develop":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {project.address
                  ? `${project.address.city}, ${project.address.state}`
                  : "Location not available"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            Edit Project
          </Button>
          <Badge
            variant={getStatusColor(project.projectStatus)}
            className="capitalize text-sm px-3 py-1"
          >
            {project.projectStatus}
          </Badge>
        </div>
      </div>

      {/* Plot Stats */}
      {plotStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Plots
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plotStats.available}</div>
              <p className="text-xs text-muted-foreground">Ready for booking</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Booked Plots
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plotStats.booked}</div>
              <p className="text-xs text-muted-foreground">
                Waiting for confirmation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reserved Plots
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plotStats.on_hold}</div>
              <p className="text-xs text-muted-foreground">Temporarily held</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold Plots</CardTitle>
              <LandPlot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plotStats.sold}</div>
              <p className="text-xs text-muted-foreground">Completed sales</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Project Type</p>
                  <div className="flex items-center gap-2 font-medium capitalize">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {project.projectType?.replace(/-/g, " ") || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Project Use</p>
                  <div className="flex items-center gap-2 font-medium capitalize">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    {project.projectUse || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">RERA Number</p>
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    {project.reraNumber || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Legal Status</p>
                  <div className="font-medium capitalize">
                    {project.legalStatus?.replace(/_/g, " ") || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Development Status
                  </p>
                  <Badge
                    variant={getDevelopmentStatusColor(
                      project.developmentStatus || ""
                    )}
                    className="capitalize mt-1"
                  >
                    {project.developmentStatus?.replace(/-/g, " ") || "-"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Plots</p>
                  <div className="font-medium">
                    {project.numberOfPlots || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Booking Token Amount
                  </p>
                  <div className="font-medium">
                    {project.bookingTokenAmount
                      ? new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(project.bookingTokenAmount)
                      : "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Possession Date
                  </p>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {project.possessionDate
                      ? format(new Date(project.possessionDate), "PPP")
                      : "-"}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.description || "No description provided."}
                </p>
              </div>

              {project.amenities && project.amenities.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media & Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Images */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </h3>
                {project.images && project.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {project.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-md overflow-hidden border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={`Project image ${index + 1}`}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No images uploaded.
                  </p>
                )}
              </div>

              <Separator />

              {/* Documents */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Site Plan
                  </h3>
                  {project.sitePlan ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <a
                        href={project.sitePlan}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="h-4 w-4" />
                        View Site Plan
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No site plan uploaded.
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Approval Documents
                  </h3>
                  {project.approvalDocuments &&
                  project.approvalDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {project.approvalDocuments.map((doc, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start gap-2"
                          asChild
                        >
                          <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-4 w-4" />
                            Document {index + 1}
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </a>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No approval documents.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location & Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">
                  Full Address
                </span>
                <p className="text-sm font-medium">
                  {project.address
                    ? `${project.address.address}`
                    : "Address not available"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">City</span>
                  <p className="font-medium">{project.address?.city || "-"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">State</span>
                  <p className="font-medium">{project.address?.state || "-"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Pincode</span>
                  <p className="font-medium">
                    {project.address?.pincode || "-"}
                  </p>
                </div>
              </div>

              {project.location && project.location.coordinates && (
                <div className="pt-2">
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${project.location.coordinates[1]},${project.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4" />
                      View on Google Maps
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Developer Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  {typeof project.developerId === "object" &&
                  project.developerId !== null ? (
                    <>
                      <p className="font-medium">
                        {project.developerId.firstName}{" "}
                        {project.developerId.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground break-all">
                        {project.developerId.email}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">ID</p>
                      <p className="text-sm font-medium break-all">
                        {(project.developerId as string) || "Unknown"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">
                  Created At
                </span>
                <p className="text-sm font-medium">
                  {project.createdAt
                    ? format(new Date(project.createdAt), "PPP p")
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">
                  Last Updated
                </span>
                <p className="text-sm font-medium">
                  {project.updatedAt
                    ? format(new Date(project.updatedAt), "PPP p")
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Bookings</h3>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plot</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingBookings ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">
                        {booking.plotId?.plotNumber || "-"}
                        {booking.plotId?.area && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({booking.plotId.area} {booking.plotId.areaUnit})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {booking.customerDetails?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {booking.customerDetails?.phone || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {booking.brokerId?.email || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {booking.bookingStatus || "pending"}
                        </Badge>
                        {booking.bookingStatus === "on_hold" &&
                          booking.holdExpiresAt && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Expires:{" "}
                              {format(new Date(booking.holdExpiresAt), "PP p")}
                            </div>
                          )}
                      </TableCell>
                      <TableCell>
                        {booking.createdAt
                          ? format(new Date(booking.createdAt), "PP")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookingDetailsDialog
                            booking={booking}
                            trigger={
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            }
                          />
                          {booking.bookingStatus === "on_hold" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={isReleasing}
                                >
                                  Release Hold
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Release Hold?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to release the hold on
                                    Plot {booking.plotId?.plotNumber}? It will
                                    become available for other brokers
                                    immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      releaseHold({
                                        plotId: booking.plotId._id,
                                      })
                                    }
                                  >
                                    Release
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No bookings found for this project.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <ProjectEditDialog
        project={project}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
};

export default ProjectPage;
