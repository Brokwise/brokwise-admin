"use client";

import { useParams, useRouter } from "next/navigation";
import {
  BrokerStatus,
  useBrokerStatusUpdate,
  useBrokerById,
} from "@/hooks/useBroker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission, normalizeUserType } from "@/lib/permissions";

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
    rejected: { variant: "destructive", label: "Rejected" },
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
  const { id } = useParams();
  const router = useRouter();
  const { data: broker, isLoading: isLoadingBroker } = useBrokerById(id as string);
  const { updateMutation } = useBrokerStatusUpdate();
  console.log(broker?.usage)
  const rawUserType = useAuthStore((state) => state.userType);
  const permissions = useAuthStore((state) => state.permissions);
  const userType = normalizeUserType(rawUserType);
  const canChangeStatus = hasPermission(userType, permissions, "broker:status");

  if (isLoadingBroker) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
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
                <p>{broker.companyName || "NA"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Broker ID
                </p>
                <p className="font-mono">{broker.brokerId || "NA"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {getStatusBadge(broker.status)}
                  {broker.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={!canChangeStatus}
                        onClick={() =>
                          updateMutation({
                            status: "approved",
                            _id: broker._id,
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={!canChangeStatus}
                        onClick={() =>
                          updateMutation({
                            status: "rejected",
                            _id: broker._id,
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {broker.status === "approved" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={!canChangeStatus}
                      onClick={() =>
                        updateMutation({
                          status: "blacklisted",
                          _id: broker._id,
                        })
                      }
                    >
                      Blacklist
                    </Button>
                  )}
                  {(broker.status === "rejected" ||
                    broker.status === "blacklisted") && (
                      <Button
                        size="sm"
                        disabled={!canChangeStatus}
                        onClick={() =>
                          updateMutation({
                            status: "approved",
                            _id: broker._id,
                          })
                        }
                      >
                        Approve
                      </Button>
                    )}
                </div>
                {!canChangeStatus && (
                  <p className="text-xs text-muted-foreground mt-1">
                    You don&apos;t have permission to perform this action.
                  </p>
                )}
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
                <p className="font-mono">{broker.reraNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  GSTIN
                </p>
                <p className="font-mono">{broker.gstin || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Office Address
                </p>
                <p>{broker.officeAddress || "NA"}</p>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            {broker.plan ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Plan
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold capitalize">
                      {broker.plan.tier}
                    </p>
                    <Badge variant="outline" className="capitalize">
                      {broker.plan.phase}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Subscription ID
                  </p>
                  <p className="font-mono text-sm">
                    {broker.plan.razorpaySubscriptionId}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Start Date
                    </p>
                    <p>{formatDate(broker.plan.currentPeriodStart)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      End Date
                    </p>
                    <p>{formatDate(broker.plan.currentPeriodEnd)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[150px] items-center justify-center text-muted-foreground">
                No active subscription
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {broker.usage ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Property Listings
                    </p>
                    <span className="font-bold">
                      {broker.usage.usage.property_listing}
                    </span>
                  </div>
                  {/* You could add a progress bar here if you have limits */}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Enquiry Listings
                    </p>
                    <span className="font-bold">
                      {broker.usage.usage.enquiry_listing}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Property Enquiries Submitted
                    </p>
                    <span className="font-bold">
                      {broker.usage.usage.submit_property_enquiry}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[150px] items-center justify-center text-muted-foreground">
                No usage data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrokerDetailsPage;
