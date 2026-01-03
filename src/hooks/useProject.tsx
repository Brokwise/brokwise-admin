"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";
import { Project, ProjectStatus, ProjectDetails, Plot } from "@/types/project";
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
      const data = response.data.data;
      return Array.isArray(data.bookings) ? data.bookings : [];
    },
    enabled: !!projectId,
  });
};

export const useProjectPlots = (projectId: string) => {
  const api = useAxios();
  return useQuery<Plot[]>({
    queryKey: ["project-plots", projectId],
    queryFn: async () => {
      const response = await api.get(`/admin/projects/${projectId}/plots`);
      const data = response.data.data;
      return Array.isArray(data.plots)
        ? data.plots
        : Array.isArray(data)
        ? data
        : [];
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
      const response = await api.put(`/admin/projects/${projectId}/status`, {
        projectStatus: status,
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

export const useUpdateProject = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      data,
    }: {
      projectId: string;
      data: Partial<Project>;
    }) => {
      const response = await api.put(`/admin/projects/${projectId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      toast.success("Project updated successfully");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error(error.response?.data?.message || "Failed to update project");
    },
  });
};

export const useReleaseHold = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ plotId }: { plotId: string }) => {
      const response = await api.put("/admin/bookings/releaseHold", {
        plotId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      toast.success("Hold released successfully");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error(error.response?.data?.message || "Failed to release hold");
    },
  });
};

export const useProject = useProjects;
