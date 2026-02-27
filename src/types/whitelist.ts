export interface WhitelistEntry {
  _id: string;
  email: string;
  addedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWhitelistDto {
  email: string;
}

export interface DeleteWhitelistDto {
  email: string;
}
