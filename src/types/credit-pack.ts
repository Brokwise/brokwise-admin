export interface ICreditPack {
  _id: string;
  id: string;
  name: string;
  credits: number;
  priceInr: number;
  description: string;
  flagText?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditPackDTO {
  name: string;
  credits: number;
  priceInr: number;
  description: string;
  flagText?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCreditPackDTO {
  name?: string;
  credits?: number;
  priceInr?: number;
  description?: string;
  flagText?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}
