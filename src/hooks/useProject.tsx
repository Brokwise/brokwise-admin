"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import { Project, ProjectStatus, ProjectDetails } from "@/types/project";
import { Booking } from "@/types/booking";
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

export const useProjectById = (projectId: string) => {
  const api = useAxios();
  return useQuery<ProjectDetails>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await api.get(`/admin/projects/${projectId}`);
      // The sample response is: { success: true, status: 200, data: { project: {...}, plotStats: {...} } }
      return response.data.data || response.data;
    },
    enabled: !!projectId,
  });
};

export const useProjectBookings = (projectId: string) => {
  const api = useAxios();
  return useQuery<Booking[]>({
    queryKey: ["project-bookings", projectId],
    queryFn: async () => {
      const response = await api.get(`/admin/bookings/project/${projectId}`);
      // Based on the sample response, the data is in data.bookings or data.data.bookings
      // The sample is: { success: true, status: 200, data: { bookings: [...], pagination: {...} } }
      // Our generic response handling might wrap this differently, but let's assume standard axios structure:
      // response.data is { success, status, data: { bookings, pagination } }
      // So we want response.data.data.bookings
      const data = response.data.data;
      return Array.isArray(data.bookings) ? data.bookings : [];
    },
    enabled: !!projectId,
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
