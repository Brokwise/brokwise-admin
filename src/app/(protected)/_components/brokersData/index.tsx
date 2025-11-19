"use client";

import { BrokersDataStats } from "./stats";
import { DataTable } from "./brokers/data-table";
import { columns } from "./brokers/columns";
import { useBroker } from "@/hooks/useBroker";

export const BrokersData = () => {
  const { brokers, isLoadingBrokers, errorBrokers } = useBroker();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <BrokersDataStats />
      <DataTable
        columns={columns}
        data={brokers || []}
        isLoading={isLoadingBrokers}
        error={errorBrokers}
      />
    </div>
  );
};
