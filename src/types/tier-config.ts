export enum TIER {
  BASIC = "BASIC",
  ESSENTIAL = "ESSENTIAL",
  PRO = "PRO",
}

export interface TierLimitsConfig {
  PROPERTY_LISTING: number;
  ENQUIRY_LISTING: number;
  SUBMIT_PROPERTY_ENQUIRY: number;
}

export interface CreditsPriceConfig {
  REQUEST_CONTACT: number;
  MARK_PROPERTY_AS_FEATURED: number;
  MARK_ENQUIRY_AS_URGENT: number;
  PROPERTY_LISTING: number;
  ENQUIRY_LISTING: number;
  SUBMIT_PROPERTY_ENQUIRY: number;
}

export interface TierConfig {
  _id?: string;
  tierLimits: Record<TIER, TierLimitsConfig>;
  activationLimits: Record<TIER, TierLimitsConfig>;
  creditsPrice: CreditsPriceConfig;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateTierLimitsDTO {
  tier: TIER;
  limits: Partial<TierLimitsConfig>;
}

export interface UpdateActivationLimitsDTO {
  tier: TIER;
  limits: Partial<TierLimitsConfig>;
}

export interface UpdateAllTierLimitsDTO {
  tierLimits: Record<TIER, TierLimitsConfig>;
}

export interface UpdateCreditsPriceDTO {
  credits: Partial<CreditsPriceConfig>;
}

export interface UpdateFullConfigDTO {
  tierLimits: Record<TIER, TierLimitsConfig>;
  activationLimits: Record<TIER, TierLimitsConfig>;
  creditsPrice: CreditsPriceConfig;
}
