"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MapPin,
  Mail,
  User,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  Ruler,
  Info,
  Coins,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SubmissionChat } from "@/app/(protected)/_components/enquiriesData/submission-chat";
import {
  useGetSubmission,
  useUpdateSubmissionStatus,
} from "@/hooks/useEnquiry";
import { useRouter, useParams } from "next/navigation";

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const SubmissionPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: submission, isLoading, error } = useGetSubmission(id as string);
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateSubmissionStatus();

  const [adminNote, setAdminNote] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(
    null
  );

  const handleAction = async () => {
    if (!actionType || !submission) return;

    try {
      await updateStatus({
        id: submission._id,
        status: actionType,
        adminNote,
      });
      toast.success(`Submission ${actionType} successfully`);
      setIsConfirmDialogOpen(false);
      router.back();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update submission status");
    }
  };

  const openConfirmDialog = (type: "approved" | "rejected") => {
    setActionType(type);
    setIsConfirmDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-semibold">Submission not found</h2>
        <p className="text-muted-foreground">
          The submission you are looking for does not exist or an error
          occurred.
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const {
    propertyId: property,
    enquiryId: enquiry,
    brokerId: broker,
  } = submission;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Submission Review
          </h1>
          <p className="text-muted-foreground">
            Review details for submission{" "}
            <span className="font-mono">{submission.submissionId}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Property & Enquiry Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enquiry Context Card (Expanded) */}
          <Card className="border-muted-foreground/20">
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Enquiry Requirements
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {enquiry.enquiryId} • {formatDate(enquiry.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block uppercase tracking-wider">
                  Requirement
                </span>
                <div className="font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {enquiry.enquiryType} ({enquiry.enquiryCategory})
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block uppercase tracking-wider">
                  Budget
                </span>
                <div className="font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  {formatCurrency(enquiry.budget.min)} -{" "}
                  {formatCurrency(enquiry.budget.max)}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block uppercase tracking-wider">
                  Location
                </span>
                <div className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {enquiry.city}
                  {enquiry.localities && enquiry.localities.length > 0 && (
                    <span className="text-muted-foreground text-sm font-normal">
                      ({enquiry.localities.join(", ")})
                    </span>
                  )}
                </div>
              </div>

              {enquiry.size && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block uppercase tracking-wider">
                    Size Preference
                  </span>
                  <div className="font-medium flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    {enquiry.size.min} - {enquiry.size.max}{" "}
                    {enquiry.size.unit.replace("_", " ")}
                  </div>
                </div>
              )}

              {/* Conditional Fields based on Type */}
              {(enquiry.bhk || enquiry.washrooms || enquiry.preferredFloor) && (
                <div className="sm:col-span-2 pt-2 border-t mt-2">
                  <div className="flex gap-4 text-sm">
                    {enquiry.bhk && (
                      <span>
                        <strong>{enquiry.bhk}</strong> BHK
                      </span>
                    )}
                    {enquiry.washrooms && (
                      <span>
                        <strong>{enquiry.washrooms}</strong> Bath
                      </span>
                    )}
                    {enquiry.preferredFloor && (
                      <span>
                        Floor: <strong>{enquiry.preferredFloor}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="sm:col-span-2 pt-2 border-t mt-2">
                <span className="text-xs text-muted-foreground block uppercase tracking-wider mb-1">
                  Description
                </span>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {enquiry.description || "No specific description provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Property Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Submitted Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                {property.featuredMedia ? (
                  property.featuredMedia.toLowerCase().includes(".heic") ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
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
                        )
                          ? property.featuredMedia
                          : "/placeholder.webp"
                      }
                      alt="Property Image"
                      fill
                      onError={(e) => {
                        console.log(e);
                      }}
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(property.totalPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(property.rate)} /{" "}
                    {property.sizeUnit?.toLowerCase()}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant="secondary" className="mb-2">
                    {property.propertyType}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    {property.address?.city || "N/A"}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Specs */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-muted-foreground text-xs">
                    Category
                  </span>
                  <span className="font-medium">
                    {property.propertyCategory}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground text-xs">
                    Size
                  </span>
                  <span className="font-medium">
                    {property.size} {property.sizeUnit}
                  </span>
                </div>
                {property.bhk && (
                  <div>
                    <span className="block text-muted-foreground text-xs">
                      BHK
                    </span>
                    <span className="font-medium">{property.bhk} BHK</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-1 text-sm">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {property.description}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() =>
                    window.open(`/properties/${property._id}`, "_blank")
                  }
                >
                  View Full Property Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Private Message Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Private Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic text-muted-foreground bg-muted p-3 rounded-md">
                &quot;{submission.privateMessage}&quot;
              </p>
            </CardContent>
          </Card>

          {/* Submission Chat */}
          <SubmissionChat
            enquiryId={submission.enquiryId._id}
            brokerId={submission.brokerId._id}
            brokerName={`${submission.brokerId.firstName} ${submission.brokerId.lastName}`}
            submissionId={submission._id}
          />
        </div>

        {/* Right Column: Context & Actions */}
        <div className="space-y-6">
          {/* Actions Card */}
          {submission.status === "pending" && (
            <Card className="border-primary/20 shadow-md bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Review Action</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => openConfirmDialog("approved")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => openConfirmDialog("rejected")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Card (if not pending) */}
          {submission.status !== "pending" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {submission.status === "approved" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="capitalize font-medium text-lg">
                    {submission.status}
                  </span>
                </div>
                {submission.adminNote && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground block uppercase tracking-wider mb-1">
                      Admin Note
                    </span>
                    <p className="text-sm">{submission.adminNote}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Broker Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Broker Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {broker.firstName[0]}
                  {broker.lastName[0]}
                </div>
                <div>
                  <div className="font-medium">
                    {broker.firstName} {broker.lastName}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {broker.companyName}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[180px]" title={broker.email}>
                    {broker.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">
                    {broker.brokerId || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog (Nested) */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approved" ? "Approve" : "Reject"} Submission
            </DialogTitle>
            <DialogDescription>
              Add an optional note for the broker regarding this{" "}
              {actionType === "approved" ? "approval" : "rejection"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Admin Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Enter your feedback..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "approved" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {actionType === "approved" ? "Approval" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionPage;
