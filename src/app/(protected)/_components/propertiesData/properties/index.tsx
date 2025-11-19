"use client";

import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useProperty } from "@/hooks/useProperty";

export const PropertiesData = () => {
  const { properties, isLoadingProperties, errorProperties } = useProperty();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <DataTable
        columns={columns}
        data={properties || []}
        isLoading={isLoadingProperties}
        error={errorProperties}
      />
    </div>
  );
};
