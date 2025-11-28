"use client";

import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DeleteRequestsTable } from "./delete-requests-table";
import { deleteRequestsColumns } from "./delete-requests-columns";
import { useProperty, useDeleteRequests } from "@/hooks/useProperty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const PropertiesData = () => {
  const { properties, isLoadingProperties, errorProperties } = useProperty();
  const { deleteRequests, isLoadingDeleteRequests, errorDeleteRequests } =
    useDeleteRequests();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="all-properties" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="all-properties">All Properties</TabsTrigger>
          <TabsTrigger value="delete-requests">Delete Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="all-properties" className="mt-6">
          <DataTable
            columns={columns}
            data={properties || []}
            isLoading={isLoadingProperties}
            error={errorProperties}
          />
        </TabsContent>
        <TabsContent value="delete-requests" className="mt-6">
          <DeleteRequestsTable
            columns={deleteRequestsColumns}
            data={deleteRequests || []}
            isLoading={isLoadingDeleteRequests}
            error={errorDeleteRequests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
