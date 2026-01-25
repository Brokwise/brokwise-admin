"use client";

import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DeleteRequestsTable } from "./delete-requests-table";
import { deleteRequestsColumns } from "./delete-requests-columns";
import { useDeleteRequests, usePaginatedProperties, useDeletedProperties } from "@/hooks/useProperty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Property } from "@/types/properties";

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

  const { deletedProperties, isLoadingDeletedProperties } = useDeletedProperties();

  // Helper to get deleter name from potentially populated field
  const getDeleterName = (deletedBy: Property["deletedBy"], deletedByType?: string) => {
    if (!deletedBy) return "Unknown";
    if (typeof deletedBy === "string") return deletedBy;
    if (deletedBy.firstName && deletedBy.lastName) {
      return `${deletedBy.firstName} ${deletedBy.lastName}`;
    }
    if (deletedBy.name) return deletedBy.name;
    return deletedBy.email || "Unknown";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="all-properties" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[700px]">
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
          <TabsTrigger value="deleted-properties">
            Deleted{" "}
            {deletedProperties && deletedProperties?.length > 0 && (
              <Badge variant={"outline"} className="rounded-full ml-2">
                {deletedProperties?.length}
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
        <TabsContent value="deleted-properties" className="mt-6">
          {isLoadingDeletedProperties ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Deleted By</TableHead>
                    <TableHead>Deleted At</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedProperties && deletedProperties.length > 0 ? (
                    deletedProperties.map((property) => (
                      <TableRow key={property._id}>
                        <TableCell className="font-medium">
                          {property.propertyId || property._id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          {property.propertyCategory} - {property.propertyType}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{getDeleterName(property.deletedBy, property.deletedByType)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({property.deletedByType || "Unknown"})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {property.deletedAt
                            ? formatDistanceToNow(new Date(property.deletedAt), { addSuffix: true })
                            : "Unknown"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {property.deletionReason || "No reason provided"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No deleted properties found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
