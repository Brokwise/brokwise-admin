"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useMemo } from "react";
import {
  useBroker,
  BrokerStatus,
  useBrokerStatusUpdate,
} from "@/hooks/useBroker";
import { AlertCircle, ArrowRight, Filter, Loader2, Search } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export const BrokersTable = () => {
  const { brokers, isLoadingBrokers, errorBrokers } = useBroker();
  const { updateMutation, isUpdating, error } = useBrokerStatusUpdate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBrokers = useMemo(() => {
    if (!brokers) return [];

    return brokers.filter((broker) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        broker.firstName.toLowerCase().includes(searchLower) ||
        broker.lastName.toLowerCase().includes(searchLower) ||
        broker.email.toLowerCase().includes(searchLower) ||
        broker.mobile.includes(searchQuery) ||
        broker.companyName.toLowerCase().includes(searchLower) ||
        broker.city.toLowerCase().includes(searchLower) ||
        broker.brokerId.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        statusFilter === "all" || broker.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [brokers, searchQuery, statusFilter]);

  // Status badge styling
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

  return (
    <Card>
      <CardHeader>
        {error && (
          <Alert>
            <AlertDescription>{error?.message}</AlertDescription>
          </Alert>
        )}
        <CardTitle>Brokers</CardTitle>
        <CardDescription>
          Search and filter through all broker records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, mobile, company, city, or broker ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingBrokers && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {errorBrokers && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load brokers. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Table */}
        {!isLoadingBrokers && !errorBrokers && (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Mobile</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">City</TableHead>
                    <TableHead className="font-semibold">Experience</TableHead>
                    <TableHead className="font-semibold">RERA No.</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="font-semibold">Broker ID</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrokers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No brokers found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBrokers.map((broker) => (
                      <TableRow key={broker._id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {broker.firstName} {broker.lastName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {broker.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {broker.mobile}
                        </TableCell>
                        <TableCell className="text-sm">
                          {broker.companyName}
                        </TableCell>
                        <TableCell className="text-sm">{broker.city}</TableCell>
                        <TableCell className="text-sm">
                          {broker.yearsOfExperience} years
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {broker.reraNumber}
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={broker.status as BrokerStatus}
                            value={broker.status as BrokerStatus}
                            onValueChange={(value) => {
                              updateMutation({
                                status: value as BrokerStatus,
                                _id: broker._id,
                              });
                            }}
                          >
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="incomplete">
                                Incomplete
                              </SelectItem>
                              <SelectItem value="blacklisted">
                                Blacklisted
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(broker.createdAt)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {broker.brokerId}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger>
                              <Button variant="outline" size="sm">
                                View Details <ArrowRight className="w-2 h-2" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Broker Details</DialogTitle>
                              </DialogHeader>
                              <DialogDescription>
                                <div className="flex flex-col gap-2">
                                  <p className="text-sm">
                                    Name: {broker.firstName} {broker.lastName}
                                  </p>
                                  <p className="text-sm">
                                    Email: {broker.email}
                                  </p>
                                  <p className="text-sm">
                                    Mobile: {broker.mobile}
                                  </p>
                                  <p className="text-sm">
                                    Company: {broker.companyName}
                                  </p>
                                  <p className="text-sm">City: {broker.city}</p>
                                  <p className="text-sm">
                                    Experience: {broker.yearsOfExperience} years
                                  </p>
                                  <p className="text-sm">
                                    RERA No.: {broker.reraNumber}
                                  </p>
                                  <p className="text-sm">
                                    Status: {getStatusBadge(broker.status)}
                                  </p>
                                  <p className="text-sm"></p>
                                </div>
                              </DialogDescription>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground mt-4">
              Showing {filteredBrokers.length} of {brokers?.length || 0} brokers
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
