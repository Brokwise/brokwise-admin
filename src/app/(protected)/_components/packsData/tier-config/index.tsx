"use client";

import { useState } from "react";
import {
  useGetTierConfig,
  useInitializeTierConfig,
  useResetTierConfig,
} from "@/hooks/useTierConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Sparkles, Settings2 } from "lucide-react";
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
  const { data: config, isLoading, isError } = useGetTierConfig();
  const initializeConfig = useInitializeTierConfig();
  const resetConfig = useResetTierConfig();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleInitialize = () => {
    initializeConfig.mutate();
  };

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

  if (isError || !config) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <CardTitle>Tier Configuration</CardTitle>
            </div>
            <Button
              onClick={handleInitialize}
              disabled={initializeConfig.isPending}
            >
              {initializeConfig.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Initialize Configuration
            </Button>
          </div>
          <CardDescription>
            No configuration found. Initialize with default values to get started.
          </CardDescription>
        </CardHeader>
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
                  Manage tier limits and credit prices for the platform
                </CardDescription>
              </div>
            </div>
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
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <TierLimitsCard tierLimits={config.tierLimits} />
        <CreditsPriceCard creditsPrice={config.creditsPrice} />
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all tier limits and credit prices to their default
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
