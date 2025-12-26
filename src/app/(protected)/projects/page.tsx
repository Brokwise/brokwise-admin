import React from "react";
import { DataTable } from "../_components/projectsData/projects/data-table";

const ProjectsPage = () => {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DataTable />
    </div>
  );
};

export default ProjectsPage;
