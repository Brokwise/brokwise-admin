export type ProjectStatus = "draft" | "pending" | "approved" | "rejected";
export type ProjectType =
  | "land"
  | "apartment"
  | "villa"
  | "commercial"
  | "other";
export type ProjectUse = "residential" | "commercial" | "industrial" | "mixed";
export type LegalStatus = "clear_title" | "pending" | "disputed";
export type DevelopmentStatus =
  | "ready-to-develop"
  | "under-development"
  | "completed";

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  _id?: string;
}

export interface Address {
  state: string;
  city: string;
  address: string;
  pincode: string;
}

export interface Developer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Project {
  _id: string;
  name: string;
  developerId?: Developer | string;
  reraNumber?: string;
  projectType?: ProjectType;
  projectUse?: ProjectUse;
  legalStatus?: LegalStatus;
  numberOfPlots?: number;
  address: Address;
  location: GeoLocation;
  possessionDate?: string;
  description?: string;
  approvalDocuments?: string[];
  images?: string[];
  sitePlan?: string;
  amenities?: string[];
  developmentStatus?: DevelopmentStatus;
  bookingTokenAmount?: number;
  holdTime?: number;
  projectStatus: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlotStats {
  available: number;
  booked: number;
  on_hold: number;
  sold: number;
}

export interface Plot {
  _id: string;
  projectId: string;
  blockId: string | { _id: string; name: string };
  plotNumber: string;
  area: number;
  areaUnit: string;
  price: number;
  facing: string;
  status: "available" | "booked" | "sold" | "on_hold";
  bookedBy?: string;
  bookingDate?: string;
  holdExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetails {
  project: Project;
  plotStats: PlotStats;
}
