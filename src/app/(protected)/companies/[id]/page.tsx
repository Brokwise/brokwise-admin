"use client";

import { useParams, useRouter } from "next/navigation";
import { useCompanyDetails, useCompanyStatusUpdate } from "@/hooks/useCompany";
import { CompanyStatus } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBroker } from "@/hooks/useBroker";
import { DataTable } from "../../_components/brokersData/brokers/data-table";
import { columns } from "../../_components/brokersData/brokers/columns";

const getStatusBadge = (status: CompanyStatus) => {
  const variants: Record<
    CompanyStatus,
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

const CompanyDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { company, isLoadingCompany } = useCompanyDetails(id);
  const { updateMutation } = useCompanyStatusUpdate();
  const { brokers, isLoadingBrokers } = useBroker();

  const companyBrokers = brokers?.filter((broker) => broker.companyId === id);

  if (isLoadingCompany) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!company) {
    return <div className="p-8">Company not found</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Company Details</h1>
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
                  Company Name
                </p>
                <p className="text-lg font-semibold">{company.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p>{company.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Mobile
                </p>
                <p>{company.mobile}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  GSTIN
                </p>
                <p className="font-mono">{company.gstin}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(company.status)}
                  <Select
                    defaultValue={company.status as CompanyStatus}
                    value={company.status as CompanyStatus}
                    onValueChange={(value: CompanyStatus) => {
                      updateMutation({
                        status: value as CompanyStatus,
                        _id: company._id,
                      });
                      // Update local state if needed or rely on refetch
                      company.status = value;
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
                  <p>{company.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Employees
                  </p>
                  <p>{company.noOfEmployees}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Office Address
                </p>
                <p>{company.officeAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Joined
                </p>
                <p>{formatDate(company.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Associated Brokers</h2>
        <DataTable
          columns={columns}
          data={companyBrokers || []}
          isLoading={isLoadingBrokers}
        />
      </div>
    </div>
  );
};

export default CompanyDetailsPage;
