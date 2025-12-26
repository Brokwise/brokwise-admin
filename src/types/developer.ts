export type DeveloperStatus = "pending" | "approved" | "blacklisted";

export interface Developer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  status: DeveloperStatus;
  createdAt: string;
  updatedAt: string;
}
