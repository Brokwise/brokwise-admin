import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import {
  Conversation,
  ConversationDetails,
  CreateConversationPayload,
  Message,
  SendMessagePayload,
} from "@/types/chat";
import { toast } from "sonner";

export const useGetConversations = (
  page = 1,
  limit = 10,
  enabled: boolean = true
) => {
  const api = useAxios();
  return useQuery<Conversation[]>({
    queryKey: ["conversations", page, limit],
    queryFn: async () => {
      const response = await api.get(
        `/admin/conversations?page=${page}&limit=${limit}`
      );
      return response.data.data;
    },
    enabled,
  });
};

export const useGetConversationDetails = (
  conversationId: string,
  page = 1,
  limit = 50,
  enabled: boolean = true
) => {
  const api = useAxios();
  return useQuery<ConversationDetails>({
    queryKey: ["conversation", conversationId, page, limit],
    queryFn: async () => {
      const response = await api.get(
        `/admin/conversations/${conversationId}?page=${page}&limit=${limit}`
      );
      return response.data.data;
    },
    enabled: !!conversationId && enabled,
  });
};

export const useCreateConversation = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateConversationPayload) => {
      const response = await api.post("/admin/createConversation", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation created successfully");
    },
    onError: (error: { response: { data: { message: string } } }) => {
      toast.error(
        error.response?.data?.message || "Failed to create conversation"
      );
    },
  });
};

export const useSendMessage = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const response = await api.post(
        "/admin/conversation/sendMessage",
        payload
      );
      return response.data.data;
    },
    onSuccess: (data: Message) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", data.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: { response: { data: { message: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to send message");
    },
  });
};

export const useDeleteMessage = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      await api.delete(`/admin/deleteMessage/${messageId}`);
      return messageId;
    },
    onSuccess: () => {
      // We can't easily invalidate just the message list without the conversation ID,
      // but we might be able to find it in the cache if needed.
      // For now, simpler to just assume the UI will handle optimistic updates or invalidations if the conversation ID is known in context.
      // However, invalidating "conversation" queries is a broad stroke that works.
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
      toast.success("Message deleted");
    },
    onError: (error: { response: { data: { message: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to delete message");
    },
  });
};

export const useUpdateMessage = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => {
      const response = await api.put(`/admin/updateMessage/${messageId}`, {
        content,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
      toast.success("Message updated");
    },
    onError: (error: { response: { data: { message: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update message");
    },
  });
};
