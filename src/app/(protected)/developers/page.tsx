import React from "react";
import { DataTable } from "../_components/developersData/developers/data-table";

const DevelopersPage = () => {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DataTable />
    </div>
  );
};

export default DevelopersPage;
