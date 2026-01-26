"use client";

import { useGetCreditPacks } from "@/hooks/useCreditPack";
import { CreditCard, Package, PackageCheck, PackageX } from "lucide-react";
import { useMemo } from "react";
import { StatsCard } from "../stats-card";

export const PacksDataStats = () => {
  const { data: packs } = useGetCreditPacks(true);

  const stats = useMemo(() => {
    if (!packs)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        totalCredits: 0,
        avgPrice: 0,
      };

    const active = packs.filter((p) => p.isActive);
    const inactive = packs.filter((p) => !p.isActive);
    const totalCredits = packs.reduce((sum, p) => sum + p.credits, 0);
    const avgPrice =
      active.length > 0
        ? active.reduce((sum, p) => sum + p.priceInr, 0) / active.length
        : 0;

    return {
      total: packs.length,
      active: active.length,
      inactive: inactive.length,
      totalCredits,
      avgPrice: Math.round(avgPrice),
    };
  }, [packs]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Packs"
        value={stats.total}
        variant="blue"
        icon={Package}
      />
      <StatsCard
        title="Active Packs"
        value={stats.active}
        variant="green"
        icon={PackageCheck}
      />
      <StatsCard
        title="Inactive Packs"
        value={stats.inactive}
        variant="gray"
        icon={PackageX}
      />
      <StatsCard
        title="Avg. Pack Price"
        value={formatCurrency(stats.avgPrice)}
        variant="yellow"
        icon={CreditCard}
      />
    </div>
  );
};
