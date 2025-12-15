"use client";
import { useBroker } from "@/hooks/useBroker";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { StatsCard } from "../stats-card";

export const BrokersDataStats = () => {
  const { brokers } = useBroker();

  const stats = useMemo(() => {
    if (!brokers)
      return {
        total: 0,
        approved: 0,
        pending: 0,
        incomplete: 0,
        blacklisted: 0,
      };
    return {
      total: brokers.length,
      approved: brokers.filter((b) => b.status === "approved").length,
      pending: brokers.filter((b) => b.status === "pending").length,
      incomplete: brokers.filter((b) => b.status === "incomplete").length,
      blacklisted: brokers.filter((b) => b.status === "blacklisted").length,
    };
  }, [brokers]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Brokers</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all registered brokers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatsCard
          title="Total Brokers"
          value={stats.total}
          variant="blue"
          icon={Users}
        />
        <StatsCard title="Approved" value={stats.approved} variant="green" />
        <StatsCard title="Pending" value={stats.pending} variant="yellow" />
        <StatsCard title="Incomplete" value={stats.incomplete} variant="red" />
        <StatsCard
          title="Blacklisted"
          value={stats.blacklisted}
          variant="gray"
        />
      </div>
    </div>
  );
};
