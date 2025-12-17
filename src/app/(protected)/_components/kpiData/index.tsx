"use client";

import { StatsCard } from "../stats-card";
import {
  Building2,
  MessageSquare,
  Users,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// --- Dummy Data ---

// Row 1: Stats
const statsData = {
  totalListings: 1245,
  totalEnquiries: 850,
  totalBrokers: 120,
  pendingApprovals: 15,
};

// Row 2: Charts
const trendData = [
  { month: "Jan", listings: 65, enquiries: 40 },
  { month: "Feb", listings: 59, enquiries: 48 },
  { month: "Mar", listings: 80, enquiries: 60 },
  { month: "Apr", listings: 81, enquiries: 75 },
  { month: "May", listings: 56, enquiries: 50 },
  { month: "Jun", listings: 95, enquiries: 85 },
  { month: "Jul", listings: 110, enquiries: 100 },
];

const trendChartConfig = {
  listings: {
    label: "New Listings",
    color: "hsl(var(--primary))",
  },
  enquiries: {
    label: "New Enquiries",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

// Converted Inventory Data for Progress Bars
const inventoryData = [
  {
    location: "Residentail Flat",
    value: 400,
    total: 1245,
    color: "bg-blue-500",
  },
  {
    location: "Commercial Shops",
    value: 300,
    total: 1245,
    color: "bg-green-500",
  },
  { location: "Resort", value: 300, total: 1245, color: "bg-yellow-500" },
  { location: "Industrial", value: 200, total: 1245, color: "bg-purple-500" },
  { location: "Other", value: 45, total: 1245, color: "bg-gray-500" },
];

// Row 3: Tables
const recentEnquiries = [
  {
    id: "ENQ-101",
    client: "Alice Johnson",
    property: "Sunset Villa",
    date: "2 mins ago",
    status: "New",
  },
  {
    id: "ENQ-102",
    client: "Bob Smith",
    property: "Downtown Loft",
    date: "15 mins ago",
    status: "Pending",
  },
  {
    id: "ENQ-103",
    client: "Charlie Davis",
    property: "Office Space 4B",
    date: "1 hour ago",
    status: "Reviewed",
  },
  {
    id: "ENQ-104",
    client: "Dana Lee",
    property: "Warehouse 12",
    date: "3 hours ago",
    status: "New",
  },
  {
    id: "ENQ-105",
    client: "Evan Wright",
    property: "Seaside Condo",
    date: "5 hours ago",
    status: "Closed",
  },
];

const recentBrokers = [
  {
    id: "BRK-201",
    name: "Sarah Conner",
    agency: "Sky High Realty",
    joined: "Today",
  },
  {
    id: "BRK-202",
    name: "John Doe",
    agency: "Urban Living",
    joined: "Yesterday",
  },
  {
    id: "BRK-203",
    name: "Jane Smith",
    agency: "Prime Estates",
    joined: "2 days ago",
  },
  {
    id: "BRK-204",
    name: "Mike Ross",
    agency: "Legal Homes",
    joined: "3 days ago",
  },
  {
    id: "BRK-205",
    name: "Rachel Zane",
    agency: "Pearson Specter",
    joined: "4 days ago",
  },
];

export const KPI = () => {
  return (
    <main className="container py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Key performance Indicators</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Listings"
          value={statsData.totalListings.toLocaleString()}
          icon={Building2}
          variant="blue"
        />
        <StatsCard
          title="Total Enquiries"
          value={statsData.totalEnquiries.toLocaleString()}
          icon={MessageSquare}
          variant="green"
        />
        <StatsCard
          title="Total Brokers"
          value={statsData.totalBrokers.toLocaleString()}
          icon={Users}
          variant="yellow"
        />
        <StatsCard
          title="Pending Approvals"
          value={statsData.pendingApprovals.toLocaleString()}
          icon={AlertCircle}
          variant="red"
        />
      </div>

      {/* Row 2: Charts Area */}
      <div className="grid gap-4 md:grid-cols-10">
        {/* Left Chart: Performance (60%) */}
        <Card className="md:col-span-6 shadow-sm border-none bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">
                Performance
              </CardTitle>
              <CardDescription>Weekly listings and enquiries</CardDescription>
            </div>
            {/* Legend simulation or extra controls could go here */}
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={trendChartConfig}
              className="h-[300px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={trendData}
                margin={{
                  left: 20,
                  right: 20,
                  top: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid
                  vertical={true}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tickFormatter={(value) => value}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip
                  cursor={{
                    stroke: "hsl(var(--muted-foreground))",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="listings"
                  type="monotone"
                  stroke="var(--color-listings)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "var(--color-listings)",
                    strokeWidth: 2,
                    stroke: "var(--background)",
                  }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  dataKey="enquiries"
                  type="monotone"
                  stroke="var(--color-enquiries)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "var(--color-enquiries)",
                    strokeWidth: 2,
                    stroke: "var(--background)",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Right Panel: Highlights (40%) */}
        <Card className="md:col-span-4 shadow-sm border-none bg-card/50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Highlights</CardTitle>
            <Badge
              variant="secondary"
              className="text-green-500 bg-green-500/10 hover:bg-green-500/20"
            >
              +8.4% MoM
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            {/* Mini Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Avg. Listing
                </div>
                <div className="mt-2 text-2xl font-bold">$642K</div>
                <div className="mt-1 text-xs font-medium text-green-500 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  2.1%
                </div>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Conversion
                </div>
                <div className="mt-2 text-2xl font-bold">28.3%</div>
                <div className="mt-1 text-xs font-medium text-red-500 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  0.6%
                </div>
              </div>
            </div>

            {/* Top Locations (Progress Bars) */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Top Categories
              </h4>
              <div className="space-y-4">
                {inventoryData.slice(0, 3).map((item) => (
                  <div key={item.location} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.location}</span>
                      <span className="text-muted-foreground">
                        {Math.round((item.value / item.total) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(item.value / item.total) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Table: Top 5 Recent Enquiries */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Recent Enquiries</CardTitle>
            <CardDescription>Latest incoming enquiries.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEnquiries.map((enquiry) => (
                  <TableRow key={enquiry.id}>
                    <TableCell className="font-medium">{enquiry.id}</TableCell>
                    <TableCell>{enquiry.client}</TableCell>
                    <TableCell>{enquiry.property}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {enquiry.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Table: Recent Broker Registrations */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Recent Broker Registrations</CardTitle>
            <CardDescription>New brokers joining the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBrokers.map((broker) => (
                  <TableRow key={broker.id}>
                    <TableCell className="font-medium">{broker.name}</TableCell>
                    <TableCell>{broker.agency}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {broker.joined}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
