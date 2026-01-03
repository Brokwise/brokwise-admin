"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBooking } from "@/hooks/useBooking";
import { Loader2 } from "lucide-react";
import { Plot } from "@/types/project";
import { toast } from "sonner";

interface BookingDialogProps {
  plots: Plot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const BookingDialog = ({
  plots,
  open,
  onOpenChange,
  onSuccess,
}: BookingDialogProps) => {
  const { mutateAsync: createBooking, isPending } = useCreateBooking();

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!customerDetails.name || !customerDetails.phone) {
        toast.error("Name and Phone are required");
        return;
      }

      const promises = plots.map((plot) => {
        // Handle blockId whether it's populated or string
        const blockId =
          typeof plot.blockId === "object" && plot.blockId !== null
            ? plot.blockId._id
            : plot.blockId;

        return createBooking({
          projectId: plot.projectId,
          plotId: plot._id,
          blockId: blockId,
          customerDetails,
          notes,
        });
      });

      const results = await Promise.allSettled(promises);

      const successCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const failCount = results.filter((r) => r.status === "rejected").length;

      if (failCount === 0) {
        toast.success(`Successfully booked ${successCount} plot(s)`);
      } else if (successCount === 0) {
        toast.error("Failed to book selected plots");
      } else {
        toast.warning(
          `Booked ${successCount} plots. Failed to book ${failCount} plots.`
        );
      }

      onOpenChange(false);
      setCustomerDetails({ name: "", email: "", phone: "", address: "" });
      setNotes("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    }
  };

  if (plots.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {plots.length > 1
              ? `Book ${plots.length} Plots`
              : `Book Plot ${plots[0].plotNumber}`}
          </DialogTitle>
          <DialogDescription>
            Booking for: {plots.map((p) => p.plotNumber).join(", ")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              value={customerDetails.name}
              onChange={(e) =>
                setCustomerDetails({ ...customerDetails, name: e.target.value })
              }
              placeholder="Enter customer name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customerDetails.email}
              onChange={(e) =>
                setCustomerDetails({
                  ...customerDetails,
                  email: e.target.value,
                })
              }
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={customerDetails.phone}
              onChange={(e) =>
                setCustomerDetails({
                  ...customerDetails,
                  phone: e.target.value,
                })
              }
              placeholder="Enter phone number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={customerDetails.address}
              onChange={(e) =>
                setCustomerDetails({
                  ...customerDetails,
                  address: e.target.value,
                })
              }
              placeholder="Enter customer address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Booking ({plots.length})
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
