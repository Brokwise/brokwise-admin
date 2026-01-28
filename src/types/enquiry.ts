import {
  PropertyCategory,
  PropertyType,
  SizeUnit,
  PlotType,
  Facing,
  Property,
  AreaType,
} from "@/types/properties";

// === ENUMS ===
export type EnquiryStatus = "active" | "closed" | "expired";
export type EnquirySource = "broker" | "admin";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type MessageThreadType = "enquirer_admin" | "submitter_admin";

// === PREFERRED LOCATION ===
export interface PreferredLocation {
  address: string;
  placeId?: string;
  city?: string;
  locality?: string;
}

// === RANGE TYPES ===
export interface BudgetRange {
  min: number;
  max: number;
}

export interface SizeRange {
  min: number;
  max: number;
  unit: SizeUnit;
}

export interface RentalIncomeRange {
  min: number;
  max: number;
}

// === MAIN ENQUIRY INTERFACE ===
export interface Enquiry {
  _id: string;
  enquiryId: string; // FLAT-2511-0042 format

  // Source Tracking
  source: EnquirySource;
  createdBy: string; // Ref: 'Broker' | 'Admin'

  // Classification
  enquiryCategory: PropertyCategory;
  enquiryType: PropertyType;

  // Location
  address: string;
  preferredLocations?: PreferredLocation[];
  // Budget Range
  budget: BudgetRange;

  // Description
  description: string;

  // --- Category Specific Optional/Required Fields ---
  // Size Range (for Land, Villa, Warehouse, Commercial)
  size?: SizeRange;

  // Land / Villa
  plotType?: PlotType;
  facing?: Facing;
  frontRoadWidth?: number;

  // Flat
  bhk?: number;
  washrooms?: number;
  preferredFloor?: string;
  society?: string;

  // Commercial (Hotel/Hostel)
  rooms?: number;
  beds?: number;
  rentalIncome?: RentalIncomeRange;

  purpose?: string;
  areaType?: AreaType;

  status: EnquiryStatus;
  expiresAt?: Date;

  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deletionReason?: string;

  forwardedTo: string[];
  submissionCount: number;

  interestedBrokersAndCompanies?: {
    _id: string;
    email: string;
    companyName: string;
    firstName: string;
    lastName: string;
    mobile: string;
  }[];

  creatorInfo?: {
    _id: string;
    email: string;
    brokerId: string | null;
    city: string;
    companyName: string;
    firstName: string;
    lastName: string;
    mobile: string;
  };

  stats?: {
    totalSubmissions: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    forwardedToCount: number;
  };

  createdAt: string;
  updatedAt: string;
}

// === MARKETPLACE ENQUIRY (Sanitized for broker view) ===
export interface MarketplaceEnquiry
  extends Omit<Enquiry, "createdBy" | "forwardedTo" | "deletedBy"> {
  isRecommended: boolean;
  mySubmissionCount?: number;
  myLastSubmissionStatus?: string | null;
}

export interface EnquirySubmission {
  _id: string;
  submissionId: string;

  enquiryId: string;
  brokerId: string;
  companyId?: string;

  propertyId: Property;

  // Communication
  privateMessage: string;

  // Review Status
  status: SubmissionStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminNote?: string;

  // Forwarding to Original Enquirer
  isForwardedToEnquirer: boolean;
  forwardedToEnquirerAt?: Date;
  enquirerMessage?: string;

  preferredLocationIndex?: number;

  createdAt: string;
  updatedAt: string;
}

export interface SubmissionProperty extends Omit<Property, "address"> {
  address:
    | string
    | { address: string; city: string; state: string; pincode: string };
  localities?: string[];
}

export interface PendingSubmission
  extends Omit<EnquirySubmission, "enquiryId" | "brokerId"> {
  enquiryId: Enquiry;
  brokerId: {
    _id: string;
    email: string;
    brokerId: string | null;
    companyName: string;
    firstName: string;
    lastName: string;
  };
}

export interface EnquirySubmissionPopulated
  extends Omit<EnquirySubmission, "brokerId" | "propertyId"> {
  brokerId: {
    _id: string;
    email: string;
    brokerId: string | null;
    companyName: string;
    firstName: string;
    lastName: string;
    mobile: string;
  };
  propertyId: SubmissionProperty;
}

// === ENQUIRY MESSAGE INTERFACE (Thread-Isolated Chat) ===
export interface EnquiryMessage {
  _id: string;
  enquiryId: string;

  submissionId?: string;

  threadType: MessageThreadType;
  participantBrokerId: string;

  senderId: string;
  senderType: "broker" | "admin";

  message: string;
  isRead: boolean;

  createdAt: string;
}

// === THREAD SUMMARY (For Admin view) ===
export interface MessageThread {
  enquiryId: string;
  submissionId?: string | undefined;
  threadType: MessageThreadType;
  participantBrokerId: string;
  participantBrokerName?: string | undefined;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

// === FILTERS ===
export interface EnquiryFilters {
  source?: EnquirySource;
  status?: EnquiryStatus;
  category?: PropertyCategory;
  type?: PropertyType;
  address?: string;
  creatorId?: string;
  includeDeleted?: boolean;
}

export interface MarketplaceFilters {
  city?: string;
  category?: string;
  type?: string;
  minBudget?: number;
  maxBudget?: number;
}

export interface CreateEnquiryDTO {
  address?: string;
  preferredLocations?: PreferredLocation[];
  enquiryCategory: PropertyCategory;
  enquiryType: PropertyType;
  budget: BudgetRange;
  description: string;
  size?: SizeRange;
  plotType?: PlotType;
  facing?: Facing;
  frontRoadWidth?: number;
  bhk?: number;
  washrooms?: number;
  preferredFloor?: string;
  society?: string;
  rooms?: number;
  beds?: number;
  rentalIncome?: RentalIncomeRange;
  purpose?: string;
  areaType?: AreaType;
}
