"use client";

import React, { useState } from "react";
import { Booking, BookingStatus, PaymentStatus } from "@/types/booking";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useUpdateBooking, useUpdateBookingStatus } from "@/hooks/useBooking";
import { User, CreditCard, MapPin, CheckCircle, Loader2 } from "lucide-react";

interface BookingDetailsDialogProps {
  booking: Booking;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const BookingDetailsDialog = ({
  booking,
  trigger,
  open,
  onOpenChange,
}: BookingDetailsDialogProps) => {
  const { mutateAsync: updateBooking, isPending: isUpdatingDetails } =
    useUpdateBooking();
  const { mutateAsync: updateBookingStatus, isPending: isUpdatingStatus } =
    useUpdateBookingStatus();

  const [isEditing, setIsEditing] = useState(false);
  const isPending = isUpdatingDetails || isUpdatingStatus;

  // Form states
  const [status, setStatus] = useState<BookingStatus>(booking.bookingStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    booking.paymentStatus || "pending"
  );
  const [paymentId, setPaymentId] = useState(booking.paymentId || "");
  const [amount, setAmount] = useState(booking.amount?.toString() || "");
  const [notes, setNotes] = useState(booking.notes || "");
  const [cancelledReason, setCancelledReason] = useState(
    booking.cancelledReason || ""
  );

  const handleUpdate = async () => {
    try {
      // 1. Handle Status Update if changed
      if (status !== booking.bookingStatus) {
        await updateBookingStatus({
          bookingId: booking._id,
          bookingStatus: status,
          cancelledReason: status === "cancelled" ? cancelledReason : undefined,
        });
      }

      // 2. Handle Details Update if changed (simple check or just update)
      // We check if any detail fields differ to avoid unnecessary calls, or just send them.
      // Since API is PUT, sending all details is safer to ensure consistency if we want.
      // But typically we only want to send what changed or what's relevant.
      const hasDetailsChanged =
        paymentStatus !== booking.paymentStatus ||
        paymentId !== (booking.paymentId || "") ||
        amount !== (booking.amount?.toString() || "") ||
        notes !== (booking.notes || "");

      if (hasDetailsChanged) {
        await updateBooking({
          bookingId: booking._id,
          data: {
            paymentStatus,
            paymentId,
            amount: amount ? Number(amount) : undefined,
            notes,
          },
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update booking", error);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "confirmed":
      case "completed":
        return "default";
      case "pending":
      case "reserved":
      case "on_hold":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleConfirmPayment = async () => {
    try {
      // Update Payment Status
      await updateBooking({
        bookingId: booking._id,
        data: { paymentStatus: "paid" },
      });
      // Update Booking Status to Confirmed
      await updateBookingStatus({
        bookingId: booking._id,
        bookingStatus: "confirmed",
      });
      // Close dialog or refresh local state is handled by react-query invalidation
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsBooked = async () => {
    try {
      await updateBookingStatus({
        bookingId: booking._id,
        bookingStatus: "confirmed",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Booking Details</span>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Details
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Status Section */}
          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Current Status
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(booking.bookingStatus)}>
                  {booking.bookingStatus}
                </Badge>
                {booking.paymentStatus && (
                  <Badge
                    variant={
                      booking.paymentStatus === "paid" ? "default" : "outline"
                    }
                  >
                    Payment: {booking.paymentStatus}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Booking Date
              </span>
              <p className="font-medium">
                {format(new Date(booking.bookingDate), "PPP")}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> Customer Details
              </h3>
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="col-span-2 font-medium">
                    {booking.customerDetails.name}
                  </span>

                  <span className="text-muted-foreground">Email:</span>
                  <span className="col-span-2">
                    {booking.customerDetails.email}
                  </span>

                  <span className="text-muted-foreground">Phone:</span>
                  <span className="col-span-2">
                    {booking.customerDetails.phone}
                  </span>

                  {booking.customerDetails.alternatePhone && (
                    <>
                      <span className="text-muted-foreground">Alt Phone:</span>
                      <span className="col-span-2">
                        {booking.customerDetails.alternatePhone}
                      </span>
                    </>
                  )}

                  {booking.customerDetails.address && (
                    <>
                      <span className="text-muted-foreground">Address:</span>
                      <span className="col-span-2">
                        {booking.customerDetails.address}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Plot Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Plot Details
              </h3>
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Plot No:</span>
                  <span className="col-span-2 font-medium">
                    {booking.plotId.plotNumber}
                  </span>

                  <span className="text-muted-foreground">Area:</span>
                  <span className="col-span-2">
                    {booking.plotId.area} {booking.plotId.areaUnit}
                  </span>

                  <span className="text-muted-foreground">Price:</span>
                  <span className="col-span-2">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(booking.plotId.price)}
                  </span>

                  <span className="text-muted-foreground">Facing:</span>
                  <span className="col-span-2 capitalize">
                    {booking.plotId.facing}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment Details
            </h3>
            <div className="bg-card border rounded-lg p-4">
              {isEditing ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Status</Label>
                      <Select
                        value={paymentStatus}
                        onValueChange={(v) =>
                          setPaymentStatus(v as PaymentStatus)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount paid"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment ID / Transaction Ref</Label>
                    <Input
                      value={paymentId}
                      onChange={(e) => setPaymentId(e.target.value)}
                      placeholder="e.g. TXN123456"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      Status
                    </span>
                    <Badge
                      variant={
                        booking.paymentStatus === "paid"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {booking.paymentStatus || "Pending"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      Amount
                    </span>
                    <span className="font-medium">
                      {booking.amount
                        ? new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(booking.amount)
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      Payment ID
                    </span>
                    <span className="font-mono">
                      {booking.paymentId || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      Order ID
                    </span>
                    <span className="font-mono">{booking.orderId || "-"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Update Status
              </h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Booking Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as BookingStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="confirmed">
                        Confirmed (Booked)
                      </SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === "cancelled" && (
                  <div className="space-y-2">
                    <Label className="text-destructive">
                      Cancellation Reason
                    </Label>
                    <Textarea
                      value={cancelledReason}
                      onChange={(e) => setCancelledReason(e.target.value)}
                      placeholder="Why is this booking being cancelled?"
                      className="border-destructive/50 focus-visible:ring-destructive"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this booking..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </>
          ) : (
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-2">
                {booking.bookingStatus === "reserved" && (
                  <Button
                    variant="default"
                    onClick={() => {
                      handleMarkAsBooked();
                    }}
                    disabled={isPending}
                  >
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Mark as Booked
                  </Button>
                )}
                {booking.paymentStatus === "pending" && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleConfirmPayment();
                    }}
                    disabled={isPending}
                  >
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirm Payment
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
