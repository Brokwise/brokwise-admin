"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import { Project, ProjectStatus } from "@/types/project";
import { toast } from "sonner";

export const useProjects = () => {
  const api = useAxios();
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get("/admin/projects/all");
      return response.data.data.projects || response.data;
    },
  });
};

export const useUpdateProjectStatus = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      status,
    }: {
      projectId: string;
      status: ProjectStatus;
    }) => {
      const response = await api.put("/admin/projects/updateStatus", {
        projectId,
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project status updated successfully");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error(
        error.response?.data?.message || "Failed to update project status"
      );
    },
  });
};

// Keep the old hook for backward compatibility
export const useProject = useProjects;
