import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import {
  Enquiry,
  PendingSubmission,
  EnquirySubmissionPopulated,
  EnquiryMessage,
  MessageThread,
  MessageThreadType,
  CreateEnquiryDTO,
} from "@/types/enquiry";

export const useGetEnquiries = () => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<Enquiry[]>({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const response = await api.get("/admin/enquiry");
      return response.data.data.enquiries;
    },
  });
  return { data, isLoading, error };
};

export const useCreateEnquiry = () => {
  const api = useAxios();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["createEnquiry"],
    mutationFn: async (enquiry: CreateEnquiryDTO) => {
      const response = await api.post("/admin/enquiry", enquiry);
      return response.data.data.enquiry;
    },
  });
  return { mutate, isPending, error };
};

export const useGetPendingSubmissionsReviews = () => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<PendingSubmission[]>({
    queryKey: ["pendingSubmissionsReviews"],
    queryFn: async () => {
      const response = await api.get("/admin/enquiry/pending-reviews");
      return response.data.data.submissions;
    },
  });
  return { data, isLoading, error };
};

export const useGetSubmission = (id: string) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<PendingSubmission>({
    queryKey: ["submission", id],
    queryFn: async () => {
      const response = await api.get(`/admin/enquiry/submission/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
  return { data, isLoading, error };
};

export const useUpdateSubmissionStatus = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateSubmissionStatus"],
    mutationFn: async ({
      id,
      status,
      adminNote,
    }: {
      id: string;
      status: "approved" | "rejected";
      adminNote?: string;
    }) => {
      const response = await api.patch(`/admin/enquiry/submissions/${id}`, {
        status,
        adminNote,
      });
      queryClient.invalidateQueries({
        queryKey: ["pendingSubmissionsReviews"],
      });
      return response.data;
    },
  });
};

export const useGetEnquiry = (id: string) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<Enquiry>({
    queryKey: ["enquiry", id],
    queryFn: async () => {
      const response = await api.get(`/admin/enquiry/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
  return { data, isLoading, error };
};
export const useGetAllSubmissions = (enquiryId: string) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<EnquirySubmissionPopulated[]>({
    queryKey: ["submissions", enquiryId],
    queryFn: async () => {
      const response = await api.get(`/admin/enquiry/${enquiryId}/submissions`);
      return response.data.data;
    },
    enabled: !!enquiryId,
  });
  return { data, isLoading, error };
};

export const useGetMessagesThreadsForEnquiry = (enquiryId: string) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<MessageThread[]>({
    queryKey: ["messageThreads", enquiryId],
    queryFn: async () => {
      const response = await api.get(`/admin/enquiry/${enquiryId}/threads`);
      return response.data.data;
    },
    enabled: !!enquiryId,
  });
  return { data, isLoading, error };
};

export const useGetMessageForThread = (
  enquiryId: string,
  brokerId: string,
  threadType: MessageThreadType,
  submissionId?: string
) => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<EnquiryMessage[]>({
    queryKey: ["messages", enquiryId, brokerId, threadType, submissionId],
    queryFn: async () => {
      const response = await api.get(
        `/admin/enquiry/${enquiryId}/messages/${brokerId}`,
        {
          params: {
            threadType,
            submissionId,
          },
        }
      );
      return response.data.data;
    },
    enabled: !!enquiryId && !!brokerId && !!threadType,
  });
  return { data, isLoading, error };
};

export const useSendMessage = (enquiryId: string, brokerId: string) => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["sendMessage", enquiryId, brokerId],
    mutationFn: async (message: {
      message: string;
      threadType?: MessageThreadType;
      submissionId?: string;
    }) => {
      const response = await api.post(
        `/admin/enquiry/${enquiryId}/message/${brokerId}`,
        message
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", enquiryId, brokerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["messageThreads", enquiryId],
      });
    },
  });
  return { mutate, isPending, error };
};

export const useDeleteEnquiry = (id: string) => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["deleteEnquiry", id],
    mutationFn: async (data: { reason: string }) => {
      const response = await api.delete(`/admin/enquiry/${id}`, {
        data,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["deletedEnquiries"] });
    },
  });
  return { mutate, isPending, error };
};

export const useGetAllDeletedEnquiries = () => {
  const api = useAxios();
  const { data, isLoading, error } = useQuery<Enquiry[]>({
    queryKey: ["deletedEnquiries"],
    queryFn: async () => {
      const response = await api.get("/admin/enquiry/deleted");
      return response.data.data.enquiries;
    },
  });
  return { data, isLoading, error };
};

export const useResortEnquiry = (id: string) => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["resortEnquiry", id],
    mutationFn: async () => {
      const response = await api.patch(`/admin/enquiry/${id}/restore`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      queryClient.invalidateQueries({ queryKey: ["deletedEnquiries"] });
    },
  });
  return { mutate, isPending, error };
};
