import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios, { ApiResponse } from "./use-axios";
import { toast } from "sonner";

export type FormStatus = "draft" | "published" | "deleted";

export interface Form {
  _id: string;
  formId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: "application/pdf" | "image/png" | "image/jpeg";
  fileSize?: number;
  version: number;
  isLatest: boolean;
  status: FormStatus;
  publishedAt?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormDTO {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  status?: FormStatus;
  notifyBrokers?: boolean;
}

export const useGetJDAForms = (includeHistory: boolean = false) => {
  const api = useAxios();
  return useQuery({
    queryKey: ["jda-forms", { includeHistory }],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Form[]>>(
        `/admin/forms?includeHistory=${includeHistory}`
      );
      return response.data.data;
    },
  });
};

export const useCreateForm = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFormDTO) => {
      const response = await api.post<ApiResponse<Form>>("/admin/forms", data);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Form created successfully");
      queryClient.invalidateQueries({ queryKey: ["jda-forms"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(error.response?.data?.message || "Failed to create form");
    },
  });
};

export const useUpdateForm = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateFormDTO }) => {
      const response = await api.put<ApiResponse<Form>>(
        `/admin/forms/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Form updated successfully");
      queryClient.invalidateQueries({ queryKey: ["jda-forms"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(error.response?.data?.message || "Failed to update form");
    },
  });
};

export const useDeleteForm = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<Form>>(
        `/admin/forms/${id}`
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Form deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["jda-forms"] });
    },
    onError: (error: {
      response?: {
        data?: {
          message?: string;
        };
      };
    }) => {
      toast.error(error.response?.data?.message || "Failed to delete form");
    },
  });
};
