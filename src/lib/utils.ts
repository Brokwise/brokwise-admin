import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (
  amount: number | string,
  currency: string = "USD",
  locale: string = "en-US"
) => {
  const numberAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numberAmount)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberAmount);
};
