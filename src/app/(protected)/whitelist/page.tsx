"use client";

import { WhitelistTable } from "./_components/whitelist-table";
import { AddWhitelistDialog } from "./_components/add-whitelist-dialog";
import { useWhitelist } from "@/hooks/useWhitelist";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WhitelistPage() {
  const { whitelist, isLoadingWhitelist } = useWhitelist();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Whitelist Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage whitelisted emails for restricted access.
          </p>
        </div>
        <AddWhitelistDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Whitelisted Emails</CardTitle>
          <CardDescription>
            A list of all emails currently whitelisted in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WhitelistTable
            data={whitelist || []}
            isLoading={isLoadingWhitelist}
          />
        </CardContent>
      </Card>
    </div>
  );
}
