"use client";

import { useState } from "react";
import {
  usePropertyOffers,
  useAcceptOffer,
  useRejectOffer,
} from "@/hooks/useProperty";
import { PropertyOffer } from "@/types/properties";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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

interface PropertyOffersListProps {
  propertyId: string;
}

export function PropertyOffersList({ propertyId }: PropertyOffersListProps) {
  const { offers, isLoadingOffers } = usePropertyOffers(propertyId);
  const { mutate: acceptOffer } = useAcceptOffer();
  const { mutate: rejectOffer, isPending: isRejecting } = useRejectOffer();

  const [rejectReason, setRejectReason] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<PropertyOffer | null>(
    null
  );
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAccept = (offerId: string) => {
    acceptOffer(
      { propertyId, offerId },
      {
        onSuccess: () => {
          toast.success("Offer accepted successfully");
        },
        onError: (
          error: Error & { response?: { data?: { message?: string } } }
        ) => {
          toast.error(
            error?.response?.data?.message || "Failed to accept offer"
          );
        },
      }
    );
  };

  const handleReject = () => {
    if (!selectedOffer || !rejectReason.trim()) return;

    rejectOffer(
      {
        propertyId,
        offerId: selectedOffer._id,
        rejectionReason: rejectReason,
      },
      {
        onSuccess: () => {
          toast.success("Offer rejected successfully");
          setIsRejectModalOpen(false);
          setRejectReason("");
          setSelectedOffer(null);
        },
        onError: (
          error: Error & { response?: { data?: { message?: string } } }
        ) => {
          toast.error(
            error?.response?.data?.message || "Failed to reject offer"
          );
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
      case "final_accepted":
        return <Badge className="bg-green-600">Accepted</Badge>;
      case "rejected":
      case "final_rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
      case "final_pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoadingOffers) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bids & Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No offers received yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bids & Offers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broker</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => {
              // Ensure offerBy is an object before accessing properties
              const brokerName =
                typeof offer.offerBy === "object" && offer.offerBy !== null
                  ? `${offer.offerBy.firstName} ${offer.offerBy.lastName}`
                  : "Unknown Broker";

              const brokerMobile =
                typeof offer.offerBy === "object" && offer.offerBy !== null
                  ? offer.offerBy.mobile
                  : "";

              return (
                <TableRow key={offer._id}>
                  <TableCell>
                    <div className="font-medium">{brokerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {brokerMobile}
                    </div>
                    {typeof offer.offerBy === "object" &&
                      offer.offerBy?.companyName && (
                        <div className="text-xs text-muted-foreground">
                          {offer.offerBy.companyName}
                        </div>
                      )}
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(offer.rate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(offer.status)}
                      {offer.isFinalOffer && (
                        <span className="text-[10px] font-bold text-red-500 uppercase">
                          Final Offer
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {offer.createdAt
                      ? format(new Date(offer.createdAt), "PP p")
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {offer.rejectionReason && (
                      <div className="text-xs text-red-500">
                        <strong>Reason:</strong> {offer.rejectionReason}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {(offer.status === "pending" ||
                      offer.status === "final_pending") && (
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" /> Accept
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Accept Offer?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to accept this offer of{" "}
                                {formatCurrency(offer.rate)}?
                                <br />
                                <br />
                                <strong>Note:</strong> You will need to manually
                                contact the broker to discuss further details.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleAccept(offer._id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirm Accept
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Dialog
                          open={
                            isRejectModalOpen &&
                            selectedOffer?._id === offer._id
                          }
                          onOpenChange={(open) => {
                            if (!open) {
                              setIsRejectModalOpen(false);
                              setSelectedOffer(null);
                            } else {
                              setIsRejectModalOpen(true);
                              setSelectedOffer(offer);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Offer</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejecting this
                                offer. The broker will be notified.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Textarea
                                placeholder="Reason for rejection..."
                                value={rejectReason}
                                onChange={(e) =>
                                  setRejectReason(e.target.value)
                                }
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsRejectModalOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || isRejecting}
                              >
                                {isRejecting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Reject Offer"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
