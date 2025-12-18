"use client";

import { CompaniesDataStats } from "./stats";
import { DataTable } from "./companies/data-table";
import { columns } from "./companies/columns";
import { useCompany } from "@/hooks/useCompany";

export const CompaniesData = () => {
  const { companies, isLoadingCompanies, errorCompanies } = useCompany();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <CompaniesDataStats />
      <DataTable
        columns={columns}
        data={companies || []}
        isLoading={isLoadingCompanies}
        error={errorCompanies}
      />
    </div>
  );
};








