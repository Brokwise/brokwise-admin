"use client";

import { PacksDataStats } from "./stats";
import { DataTable } from "./packs/data-table";
import { TierConfigSection } from "./tier-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Settings2 } from "lucide-react";

export const PacksData = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Credits & Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage credit packs, tier limits, and pricing configuration
        </p>
      </div>

      <Tabs defaultValue="packs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="packs" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Credit Packs
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Tier Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packs" className="space-y-6">
          <PacksDataStats />
          <DataTable />
        </TabsContent>

        <TabsContent value="config">
          <TierConfigSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
