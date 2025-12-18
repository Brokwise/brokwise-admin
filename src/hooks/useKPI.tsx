import useAxios, { ApiResponse } from "./use-axios";
import { useQuery } from "@tanstack/react-query";
import { ListingStatus } from "@/types/properties";
import { BrokerStatus } from "@/hooks/useBroker";
import { CompanyStatus } from "@/types/company";

export type EnquiryStatus = "active" | "closed" | "expired";

export interface StatsKPI {
  companyCounts: Array<Partial<Record<CompanyStatus, number>>>;
  brokerCounts: Array<Partial<Record<BrokerStatus, number>>>;
  enquiryCounts: Array<Partial<Record<EnquiryStatus, number>>>;
  listingCounts: Array<Partial<Record<ListingStatus, number>>>;
}

export const useGetStats = () => {
  const api = useAxios();
  return useQuery({
    queryKey: ["kpi-stats"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<StatsKPI>>(`/kpi/getStats`);
      return response.data.data;
    },
  });
};

export const useGetListingTrend = (
  timeFrame: "YEAR" | "MONTH" | "ALL" | "WEEK" = "MONTH"
) => {
  const api = useAxios();
  return useQuery({
    queryKey: ["kpi-listing-trend", timeFrame],
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<Array<{ period: string; count: number }>>
      >(`/kpi/getListingTrend?timeFrame=${timeFrame}`);
      return response.data.data;
    },
  });
};

export const useGetEnquiryTrend = (
  timeFrame: "YEAR" | "MONTH" | "ALL" | "WEEK" = "MONTH"
) => {
  const api = useAxios();
  return useQuery({
    queryKey: ["kpi-enquiry-trend", timeFrame],
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<Array<{ period: string; count: number }>>
      >(`/kpi/getEnquiryTrend?timeFrame=${timeFrame}`);
      return response.data.data;
    },
  });
};

export const useGetPropertyDistribution = () => {
  const api = useAxios();
  return useQuery({
    queryKey: ["kpi-property-distribution"],
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<Array<Record<string, number>>>
      >(`/kpi/getDistribution`);
      return response.data.data;
    },
  });
};

export const useGetAvgPropertyValue = () => {
  const api = useAxios();
  return useQuery({
    queryKey: ["kpi-avg-property-value"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<number>>(
        `/kpi/getAvgPropertyValue`
      );
      return response.data.data;
    },
  });
};
