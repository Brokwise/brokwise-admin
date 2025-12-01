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
  Calendar,
  Info,
  Coins,
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
import { PendingSubmission } from "@/types/enquiry";
import { useUpdateSubmissionStatus } from "@/hooks/useEnquiry";
import { useRouter } from "next/navigation";

interface SubmissionDetailsDialogProps {
  submission: PendingSubmission;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const SubmissionDetailsDialog = ({
  submission,
  isOpen,
  onClose,
}: SubmissionDetailsDialogProps) => {
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateSubmissionStatus();
  const router = useRouter();

  const [adminNote, setAdminNote] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(
    null
  );

  const handleAction = async () => {
    if (!actionType) return;

    try {
      await updateStatus({
        id: submission._id,
        status: actionType,
        adminNote,
      });
      toast.success(`Submission ${actionType} successfully`);
      setIsConfirmDialogOpen(false);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update submission status");
    }
  };

  const openConfirmDialog = (type: "approved" | "rejected") => {
    setActionType(type);
    setIsConfirmDialogOpen(true);
  };

  const {
    propertyId: property,
    enquiryId: enquiry,
    brokerId: broker,
  } = submission;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Review</DialogTitle>
            <DialogDescription>
              Review details for submission{" "}
              <span className="font-mono">{submission.submissionId}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-3 py-4">
            {/* Left Column: Property & Enquiry Details */}
            <div className="md:col-span-2 space-y-6">
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
                  {(enquiry.bhk ||
                    enquiry.washrooms ||
                    enquiry.preferredFloor) && (
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
                      {enquiry.description ||
                        "No specific description provided."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Property Details Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Submitted Property
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Property Image */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    {property.featuredMedia ? (
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
                        className="object-cover"
                      />
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
                        {property.address.city}
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
                    "{submission.privateMessage}"
                  </p>
                </CardContent>
              </Card>
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

              {/* Broker Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Broker Information
                  </CardTitle>
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
                      <span
                        className="truncate max-w-[180px]"
                        title={broker.email}
                      >
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
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </>
  );
};
