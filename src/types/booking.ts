export interface BookingBroker {
  _id: string;
  email: string;
}

export interface BookingCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: string;
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

export interface Booking {
  _id: string;
  plotId: BookingPlot;
  blockId: string;
  projectId: string;
  brokerId: BookingBroker;
  developerId: string;
  customerDetails: BookingCustomer;
  bookingStatus: string;
  bookingDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
