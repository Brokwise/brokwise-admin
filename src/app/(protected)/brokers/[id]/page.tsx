"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useBroker,
  BrokerStatus,
  useBrokerStatusUpdate,
} from "@/hooks/useBroker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const getStatusBadge = (status: BrokerStatus) => {
  const variants: Record<
    BrokerStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    approved: { variant: "default", label: "Approved" },
    pending: { variant: "secondary", label: "Pending" },
    incomplete: { variant: "outline", label: "Incomplete" },
    blacklisted: { variant: "destructive", label: "Blacklisted" },
  };

  const config = variants[status];
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const BrokerDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { brokers, isLoadingBrokers } = useBroker();
  const { updateMutation } = useBrokerStatusUpdate();
  const id = params.id as string;

  const broker = brokers?.find((b) => b._id === id);

  if (isLoadingBrokers) {
    return <div className="p-8">Loading...</div>;
  }

  if (!broker) {
    return <div className="p-8">Broker not found</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Broker Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="text-lg font-semibold">
                  {broker.firstName} {broker.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p>{broker.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Mobile
                </p>
                <p>{broker.mobile}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Company
                </p>
                <p>{broker.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Broker ID
                </p>
                <p className="font-mono">{broker.brokerId}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(broker.status)}
                  <Select
                    defaultValue={broker.status as BrokerStatus}
                    value={broker.status as BrokerStatus}
                    onValueChange={(value: BrokerStatus) => {
                      updateMutation({
                        status: value as BrokerStatus,
                        _id: broker._id,
                      });
                      // Optimistically update not possible easily here without query invalidation or state update,
                      // but the mutation hook might handle it or we rely on refetch.
                    }}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="incomplete">Incomplete</SelectItem>
                      <SelectItem value="blacklisted">Blacklisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    City
                  </p>
                  <p>{broker.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Experience
                  </p>
                  <p>{broker.yearsOfExperience} years</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  RERA Number
                </p>
                <p className="font-mono">{broker.reraNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  GSTIN
                </p>
                <p className="font-mono">{broker.gstin}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Office Address
                </p>
                <p>{broker.officeAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Joined
                </p>
                <p>{formatDate(broker.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerDetailsPage;
