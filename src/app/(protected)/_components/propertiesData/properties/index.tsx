"use client";

import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DeleteRequestsTable } from "./delete-requests-table";
import { deleteRequestsColumns } from "./delete-requests-columns";
import { useDeleteRequests, usePaginatedProperties } from "@/hooks/useProperty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const PropertiesData = () => {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [enquiryPage, setEnquiryPage] = React.useState(1);
  const [enquiryPageSize, setEnquiryPageSize] = React.useState(10);

  const {
    propertiesPage: allPropertiesPage,
    isLoadingProperties,
    errorProperties,
  } = usePaginatedProperties({ page, limit: pageSize });

  const {
    propertiesPage: enquiryOnlyPage,
    isLoadingProperties: isLoadingEnquiryProperties,
    errorProperties: errorEnquiryProperties,
  } = usePaginatedProperties({ page: enquiryPage, limit: enquiryPageSize });

  const { deleteRequests, isLoadingDeleteRequests, errorDeleteRequests } =
    useDeleteRequests();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="all-properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[500px]">
          <TabsTrigger value="all-properties">All Properties</TabsTrigger>
          <TabsTrigger value="enquiry-only-properties">
            Enquiry only
          </TabsTrigger>
          <TabsTrigger value="delete-requests">
            Delete Requests{" "}
            {deleteRequests && deleteRequests?.length > 0 && (
              <Badge variant={"outline"} className="rounded-full ml-2">
                {deleteRequests?.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all-properties" className="mt-6">
          <DataTable
            columns={columns}
            data={
              allPropertiesPage?.properties.filter((p) => {
                return p.listingStatus !== "ENQUIRY_ONLY";
              }) || []
            }
            isLoading={isLoadingProperties}
            error={errorProperties}
            pagination={{
              page: allPropertiesPage?.page ?? page,
              pageSize,
              total: allPropertiesPage?.total,
              totalPages: allPropertiesPage?.totalPages,
              onPageChange: setPage,
              onPageSizeChange: (nextSize) => {
                setPage(1);
                setPageSize(nextSize);
              },
            }}
          />
        </TabsContent>
        <TabsContent value="enquiry-only-properties" className="mt-6">
          <DataTable
            columns={columns}
            data={
              enquiryOnlyPage?.properties.filter((p) => {
                return p.listingStatus === "ENQUIRY_ONLY";
              }) || []
            }
            isLoading={isLoadingEnquiryProperties}
            error={errorEnquiryProperties}
            pagination={{
              page: enquiryOnlyPage?.page ?? enquiryPage,
              pageSize: enquiryPageSize,
              total: enquiryOnlyPage?.total,
              totalPages: enquiryOnlyPage?.totalPages,
              onPageChange: setEnquiryPage,
              onPageSizeChange: (nextSize) => {
                setEnquiryPage(1);
                setEnquiryPageSize(nextSize);
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
