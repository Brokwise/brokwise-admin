"use client";

import { useState } from "react";
import {
  useGetTierConfig,
  useResetTierConfig,
} from "@/hooks/useTierConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Layers, Zap, Settings2 } from "lucide-react";
import { TierLimitsCard } from "./tier-limits-card";
import { CreditsPriceCard } from "./credits-price-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TierConfigSection() {
  const { data: config, isLoading } = useGetTierConfig();
  const resetConfig = useResetTierConfig();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleReset = () => {
    resetConfig.mutate();
    setShowResetDialog(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <div>
                <CardTitle>Tier Configuration</CardTitle>
                <CardDescription>
                  {config
                    ? "Manage tier limits, activation limits, and credit prices for the platform"
                    : "No configuration found. Configure tier limits and credit prices to get started."}
                </CardDescription>
              </div>
            </div>
            {config && (
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(true)}
                disabled={resetConfig.isPending}
              >
                {resetConfig.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Reset to Defaults
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <TierLimitsCard
          tierLimits={config?.tierLimits ?? null}
          title="Tier Limits"
          description="Free limits available per tier (monthly)"
          icon={Layers}
          limitType="regular"
        />
        <TierLimitsCard
          tierLimits={config?.activationLimits ?? null}
          title="Activation Limits"
          description="Limits included in activation packs"
          icon={Zap}
          limitType="activation"
        />
      </div>

      <div className="grid gap-6">
        <CreditsPriceCard creditsPrice={config?.creditsPrice ?? null} />
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all tier limits, activation limits, and credit prices to their default
              values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Configuration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
