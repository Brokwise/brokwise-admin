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
import { Pencil, Layers } from "lucide-react";
import { TIER, TierLimitsConfig } from "@/types/tier-config";
import { TierLimitsDialog } from "./tier-limits-dialog";

interface TierLimitsCardProps {
  tierLimits: Record<TIER, TierLimitsConfig>;
}

const tierColors: Record<TIER, string> = {
  [TIER.STARTER]: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  [TIER.ESSENTIAL]: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  [TIER.ELITE]: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
};

const tierDescriptions: Record<TIER, string> = {
  [TIER.STARTER]: "Basic tier for new users",
  [TIER.ESSENTIAL]: "Standard tier with enhanced limits",
  [TIER.ELITE]: "Premium tier with maximum limits",
};

const limitLabels: Record<keyof TierLimitsConfig, string> = {
  PROPERTY_LISTING: "Property Listings",
  ENQUIRY_LISTING: "Enquiry Listings",
  SUBMIT_PROPERTY_ENQUIRY: "Submit Property Enquiries",
};

export function TierLimitsCard({ tierLimits }: TierLimitsCardProps) {
  const [editingTier, setEditingTier] = useState<TIER | null>(null);
  const [editingLimits, setEditingLimits] = useState<TierLimitsConfig | null>(null);

  const handleEdit = (tier: TIER) => {
    setEditingTier(tier);
    setEditingLimits(tierLimits[tier]);
  };

  const handleClose = () => {
    setEditingTier(null);
    setEditingLimits(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">Tier Limits</CardTitle>
              <CardDescription>
                Free limits available per tier
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.values(TIER).map((tier) => (
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
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(tierLimits[tier]).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-xs text-muted-foreground">
                      {limitLabels[key as keyof TierLimitsConfig]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <TierLimitsDialog
        open={!!editingTier}
        onOpenChange={(open) => !open && handleClose()}
        tier={editingTier}
        currentLimits={editingLimits}
      />
    </>
  );
}
