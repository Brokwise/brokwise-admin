"use client";
import React from "react";
import {
  useGetAllDeletedEnquiries,
  useGetEnquiries,
  useGetPendingSubmissionsReviews,
} from "@/hooks/useEnquiry";
import { DataTable as EnquiriesDataTable } from "../_components/enquiriesData/enquiries/data-table";
import { columns as enquiryColumns } from "../_components/enquiriesData/enquiries/columns";
import { deletedColumns } from "../_components/enquiriesData/enquiries/deleted-columns";
import { DataTable as SubmissionsDataTable } from "../_components/enquiriesData/pendingSubmissions/data-table";
import { columns as submissionColumns } from "../_components/enquiriesData/pendingSubmissions/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EnquieriesPage = () => {
  const { data, isLoading, error } = useGetEnquiries();
  const {
    data: pendingSubmissionsReviews,
    isLoading: isLoadingPendingSubmissionsReviews,
    error: errorPendingSubmissionsReviews,
  } = useGetPendingSubmissionsReviews();
  const {
    data: deletedEnquiries,
    isLoading: isLoadingDeletedEnquiries,
    error: errorDeletedEnquiries,
  } = useGetAllDeletedEnquiries();

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="enquiries">
        <TabsList>
          <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
          <TabsTrigger value="submissions">
            Pending Submissions Reviews
          </TabsTrigger>
          <TabsTrigger value="deleted">Deleted Enquiries</TabsTrigger>
        </TabsList>
        <TabsContent value="enquiries">
          <EnquiriesDataTable
            columns={enquiryColumns}
            data={data || []}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        <TabsContent value="submissions">
          <SubmissionsDataTable
            columns={submissionColumns}
            data={pendingSubmissionsReviews || []}
            isLoading={isLoadingPendingSubmissionsReviews}
            error={errorPendingSubmissionsReviews}
          />
        </TabsContent>
        <TabsContent value="deleted">
          <EnquiriesDataTable
            columns={deletedColumns}
            data={deletedEnquiries || []}
            isLoading={isLoadingDeletedEnquiries}
            error={errorDeletedEnquiries}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnquieriesPage;
