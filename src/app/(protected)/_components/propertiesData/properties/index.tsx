"use client";

import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DeleteRequestsTable } from "./delete-requests-table";
import { deleteRequestsColumns } from "./delete-requests-columns";
import { useDeleteRequests, usePaginatedProperties } from "@/hooks/useProperty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const PropertiesData = () => {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const { propertiesPage, isLoadingProperties, errorProperties } =
    usePaginatedProperties({ page, limit: pageSize });
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
            data={propertiesPage?.properties || []}
            isLoading={isLoadingProperties}
            error={errorProperties}
            pagination={{
              page: propertiesPage?.page ?? page,
              pageSize,
              total: propertiesPage?.total,
              totalPages: propertiesPage?.totalPages,
              onPageChange: setPage,
              onPageSizeChange: (nextSize) => {
                setPage(1);
                setPageSize(nextSize);
              },
            }}
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
