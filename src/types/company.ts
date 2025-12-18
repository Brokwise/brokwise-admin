export type CompanyStatus =
  | "approved"
  | "pending"
  | "incomplete"
  | "blacklisted";

export interface Company {
  name: string;
  email: string;
  _id: string;
  uid: string;
  mobile: string;
  gstin: string;
  city: string;
  officeAddress: string;
  status: CompanyStatus;
  createdAt: string;
  noOfEmployees: number;
}








