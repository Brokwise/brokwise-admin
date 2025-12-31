"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useDevelopers } from "@/hooks/useDeveloper";
import { useProjects } from "@/hooks/useProject";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mail, Phone, User } from "lucide-react";
import { DataTable as ProjectsTable } from "../../_components/projectsData/projects/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const DeveloperPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const { data: developers = [], isLoading: isLoadingDeveloper } =
    useDevelopers();
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();

  const developer = useMemo(() => {
    return developers.find((d) => d._id === id);
  }, [developers, id]);

  const developerProjects = useMemo(() => {
    if (!developer) return [];
    return projects.filter((p) => {
      if (typeof p.developerId === "string") {
        return p.developerId === developer._id;
      }
      return p.developerId?._id === developer._id;
    });
  }, [projects, developer]);

  if (isLoadingDeveloper) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <h2 className="text-2xl font-bold mb-2">Developer not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Developer Details</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {developer.firstName} {developer.lastName}
                </CardTitle>
                <CardDescription>Developer Information</CardDescription>
              </div>
              <Badge
                variant={
                  developer.status === "approved"
                    ? "default" // Using default (primary) for approved
                    : developer.status === "pending"
                    ? "secondary" // Secondary for pending
                    : "destructive" // Destructive for blacklisted
                }
                className="capitalize"
              >
                {developer.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{developer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{developer.contactNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  ID: {developer._id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{developerProjects.length}</div>
            <p className="text-xs text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Projects</h3>
        <ProjectsTable data={developerProjects} isLoading={isLoadingProjects} />
      </div>
    </div>
  );
};

export default DeveloperPage;
