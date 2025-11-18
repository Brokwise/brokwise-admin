import { useMutation, useQuery } from "@tanstack/react-query";
import useAxios, { ApiError, ApiResponse } from "./use-axios";
import { toast } from "sonner";

export type BrokerStatus =
  | "approved"
  | "pending"
  | "incomplete"
  | "blacklisted";
export interface Broker {
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  uid: string;
  mobile: string;
  companyName: string;
  gstin: string;
  yearsOfExperience: number;
  city: string;
  officeAddress: string;
  reraNumber: string;
  status: BrokerStatus;
  companyId?: string;
  createdAt: string;
  brokerId: string;
}
export const useBroker = () => {
  const api = useAxios();
  const {
    data: brokers,
    isLoading: isLoadingBrokers,
    error: errorBrokers,
  } = useQuery<Broker[]>({
    queryKey: ["brokers"],
    queryFn: async () => (await api.get("/admin/getBrokers")).data.data,
  });
  return { brokers, isLoadingBrokers, errorBrokers };
};

export const useBrokerStatusUpdate = () => {
  const api = useAxios();
  const {
    mutate: updateMutation,
    isPending: isUpdating,
    error,
  } = useMutation({
    mutationFn: async (data: { status: BrokerStatus; _id: string }) => {
      return await api.put("/admin/updateBrokerStatus", data);
    },
    onSuccess: () => {
      toast.success(`Status updated!`);
    },
    onError: () => {
      toast.error(`Status updation failed`);
    },
  });
  return { updateMutation, isUpdating, error };
};
