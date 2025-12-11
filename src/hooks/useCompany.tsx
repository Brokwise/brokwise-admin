import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import { Company, CompanyStatus } from "@/types/company";
import { toast } from "sonner";

export const useCompany = () => {
  const api = useAxios();
  const {
    data: companies,
    isLoading: isLoadingCompanies,
    error: errorCompanies,
  } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => (await api.get("/admin/companies/all")).data.data,
  });
  return { companies, isLoadingCompanies, errorCompanies };
};

export const useCompanyStatusUpdate = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const {
    mutate: updateMutation,
    isPending: isUpdating,
    error,
  } = useMutation({
    mutationFn: async (data: { status: CompanyStatus; _id: string }) => {
      return await api.put("/admin/companies/updateStatus", data);
    },
    onSuccess: () => {
      toast.success(`Status updated!`);
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: () => {
      toast.error(`Status updation failed`);
    },
  });
  return { updateMutation, isUpdating, error };
};

export const useCompanyDetails = (id: string) => {
  const api = useAxios();
  const {
    data: company,
    isLoading: isLoadingCompany,
    error: errorCompany,
  } = useQuery<Company>({
    queryKey: ["company", id],
    queryFn: async () => (await api.get(`/admin/companies/${id}`)).data.data,
    enabled: !!id,
  });
  return { company, isLoadingCompany, errorCompany };
};
