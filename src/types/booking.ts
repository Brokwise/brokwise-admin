export interface BookingBroker {
  _id: string;
  email: string;
}

export interface BookingCustomer {
  _id?: string; // Schema says subdoc but usually frontend sees it as object
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
}

export interface BookingPlot {
  _id: string;
  plotNumber: string;
  area: number;
  areaUnit: string;
  price: number;
  facing: string;
  status: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "on_hold"
  | "reserved";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface Booking {
  _id: string;
  plotId: BookingPlot;
  blockId: string;
  projectId: string;
  brokerId: BookingBroker;
  developerId: string;
  customerDetails: BookingCustomer;
  bookingStatus: BookingStatus;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  paymentStatus?: PaymentStatus;
  receiptUrl?: string;
  bookingDate: string;
  notes?: string;
  cancelledReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  holdExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
