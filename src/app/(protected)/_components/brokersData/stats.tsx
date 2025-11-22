"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBroker } from "@/hooks/useBroker";
import { Users } from "lucide-react";
import { useMemo } from "react";
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
        <h1 className="text-3xl font-bold tracking-tight">Broker Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all registered brokers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-blue-100 dark:bg-blue-900 shadow-none border-blue-300 dark:border-blue-800 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Brokers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-100 dark:bg-green-900 shadow-none border-green-300 dark:border-green-800 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-100 dark:bg-yellow-900 shadow-none border-yellow-300 dark:border-yellow-800 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-100 dark:bg-red-900 shadow-none border-red-300 dark:border-red-800 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">{stats.incomplete}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 dark:bg-gray-900 shadow-none border-gray-300 dark:border-gray-800 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blacklisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">{stats.blacklisted}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
