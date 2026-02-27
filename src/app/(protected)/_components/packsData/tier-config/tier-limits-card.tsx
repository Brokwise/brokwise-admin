"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, LucideIcon } from "lucide-react";
import { TIER, TierLimitsConfig } from "@/types/tier-config";
import { TierLimitsDialog } from "./tier-limits-dialog";

export type LimitType = "regular" | "activation";

interface TierLimitsCardProps {
  tierLimits: Record<TIER, TierLimitsConfig> | null;
  title: string;
  description: string;
  icon: LucideIcon;
  limitType: LimitType;
}

const tierColors: Record<TIER, string> = {
  [TIER.BASIC]: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  [TIER.ESSENTIAL]: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  [TIER.PRO]: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
};

const tierDescriptions: Record<TIER, string> = {
  [TIER.BASIC]: "Basic tier for new users",
  [TIER.ESSENTIAL]: "Standard tier with enhanced limits",
  [TIER.PRO]: "Premium tier with maximum limits",
};

const limitLabels: Record<keyof TierLimitsConfig, string> = {
  PROPERTY_LISTING: "Property Listings",
  ENQUIRY_LISTING: "Enquiry Listings",
  SUBMIT_PROPERTY_ENQUIRY: "Submit Property Enquiries",
};

export function TierLimitsCard({
  tierLimits,
  title,
  description,
  icon: Icon,
  limitType,
}: TierLimitsCardProps) {
  const [editingTier, setEditingTier] = useState<TIER | null>(null);
  const [editingLimits, setEditingLimits] = useState<TierLimitsConfig | null>(null);

  const handleEdit = (tier: TIER) => {
    setEditingTier(tier);
    setEditingLimits(tierLimits?.[tier] ?? null);
  };

  const handleClose = () => {
    setEditingTier(null);
    setEditingLimits(null);
  };

  const isConfigured = tierLimits !== null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.values(TIER).map((tier) => {
            const limits = tierLimits?.[tier];
            const hasLimits = limits !== undefined && limits !== null;

            return (
              <div
                key={tier}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={tierColors[tier]}>{tier}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {tierDescriptions[tier]}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tier)}
                  >
                    {hasLimits ? (
                      <Pencil className="h-4 w-4" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Configure
                      </>
                    )}
                  </Button>
                </div>

                {hasLimits ? (
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(limits).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold">{value}</div>
                        <div className="text-xs text-muted-foreground">
                          {limitLabels[key as keyof TierLimitsConfig]}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                    Not configured yet
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <TierLimitsDialog
        open={!!editingTier}
        onOpenChange={(open) => !open && handleClose()}
        tier={editingTier}
        currentLimits={editingLimits}
        limitType={limitType}
        isCreating={!isConfigured}
      />
    </>
  );
}
