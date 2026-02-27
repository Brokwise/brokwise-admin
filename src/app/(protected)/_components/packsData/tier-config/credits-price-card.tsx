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
import { Pencil, Plus, Coins } from "lucide-react";
import { CreditsPriceConfig } from "@/types/tier-config";
import { CreditsPriceDialog } from "./credits-price-dialog";

interface CreditsPriceCardProps {
  creditsPrice: CreditsPriceConfig | null;
}

const priceLabels: Record<keyof CreditsPriceConfig, { label: string; description: string }> = {
  REQUEST_CONTACT: {
    label: "Request Contact",
    description: "Credits to request contact details",
  },
  MARK_PROPERTY_AS_FEATURED: {
    label: "Feature Property",
    description: "Credits to mark a property as featured",
  },
  MARK_ENQUIRY_AS_URGENT: {
    label: "Urgent Enquiry",
    description: "Credits to mark an enquiry as urgent",
  },
  PROPERTY_LISTING: {
    label: "Property Listing",
    description: "Credits to list a property",
  },
  ENQUIRY_LISTING: {
    label: "Enquiry Listing",
    description: "Credits to list an enquiry",
  },
  SUBMIT_PROPERTY_ENQUIRY: {
    label: "Submit Enquiry",
    description: "Credits to submit a property enquiry",
  },
};

export function CreditsPriceCard({ creditsPrice }: CreditsPriceCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              <div>
                <CardTitle className="text-lg">Credit Prices</CardTitle>
                <CardDescription>
                  Credits required for each action
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              {creditsPrice ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Configure
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {creditsPrice ? (
            <div className="grid gap-3">
              {Object.entries(creditsPrice).map(([key, value]) => {
                const config = priceLabels[key as keyof CreditsPriceConfig];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{value}</span>
                      <span className="text-sm text-muted-foreground">credits</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Not configured yet. Click Configure to set credit prices.
            </div>
          )}
        </CardContent>
      </Card>

      <CreditsPriceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentPrices={creditsPrice}
      />
    </>
  );
}
