"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import { BookingStatus, PaymentStatus } from "@/types/booking";
import { toast } from "sonner";

export interface UpdateBookingPayload {
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  amount?: number;
  notes?: string;
  customerDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    address?: string;
  };
}

export interface UpdateBookingStatusPayload {
  bookingId: string;
  bookingStatus: BookingStatus;
  cancelledReason?: string;
}

export const useUpdateBooking = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      data,
    }: {
      bookingId: string;
      data: UpdateBookingPayload;
    }) => {
      // General update for non-status fields (or status without side effects if supported)
      const response = await api.put(`/admin/bookings/${bookingId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-bookings"] });
      toast.success("Booking details updated successfully");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error(error.response?.data?.message || "Failed to update booking");
    },
  });
};

export const useUpdateBookingStatus = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateBookingStatusPayload) => {
      const response = await api.put("/admin/bookings/status/update", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["project"] }); // Project stats might change (booked/available counts)
      toast.success("Booking status updated successfully");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error(
        error.response?.data?.message || "Failed to update booking status"
      );
    },
  });
};
