"use client";

import React, { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { useUpdateProject } from "@/hooks/useProject";

const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  holdTime: z.coerce
    .number()
    .min(1, "Hold time must be at least 1 hour")
    .default(4),
  description: z.string().optional(),
  reraNumber: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectEditDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectEditDialog = ({
  project,
  open,
  onOpenChange,
}: ProjectEditDialogProps) => {
  const { mutate: updateProject, isPending } = useUpdateProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema) as Resolver<ProjectFormValues>,
    defaultValues: {
      name: project.name || "",
      holdTime: project.holdTime || 4,
      description: project.description || "",
      reraNumber: project.reraNumber || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: project.name || "",
        holdTime: project.holdTime || 4,
        description: project.description || "",
        reraNumber: project.reraNumber || "",
      });
    }
  }, [open, project, form]);

  const onSubmit = (data: ProjectFormValues) => {
    updateProject(
      {
        projectId: project._id,
        data: {
          name: data.name,
          holdTime: data.holdTime,
          description: data.description,
          reraNumber: data.reraNumber,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details and settings.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Project Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="holdTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hold Duration (Hours)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Duration in hours for which a plot remains on hold before
                    automatically releasing.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reraNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RERA Number</FormLabel>
                  <FormControl>
                    <Input placeholder="RERA Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
