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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAvgPropertyValue,
  useGetEnquiryTrend,
  useGetListingTrend,
  useGetPropertyDistribution,
  useGetStats,
} from "@/hooks/useKPI";
import { useState, useMemo } from "react";

const processStats = (counts: Array<Record<string, number>> = []) => {
  let total = 0;
  const breakdown: Record<string, number> = {};

  if (!counts) return { total, breakdown };

  counts.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      if (typeof value === "number") {
        breakdown[key] = (breakdown[key] || 0) + value;
        total += value;
      }
    });
  });

  return { total, breakdown };
};

const Breakdown = ({ items }: { items: Record<string, number> }) => {
  if (Object.keys(items).length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
      {Object.entries(items).map(([status, count]) => (
        <div
          key={status}
          className="flex items-center gap-1 bg-background/50 px-1.5 py-0.5 rounded-md border border-border/50"
        >
          <span className="capitalize">
            {status.toLowerCase().replace(/_/g, " ")}:
          </span>
          <span className="font-semibold">{count}</span>
        </div>
      ))}
    </div>
  );
};

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

// Row 3: Tables
// const recentEnquiries = [
//   {
//     id: "ENQ-101",
//     client: "Alice Johnson",
//     property: "Sunset Villa",
//     date: "2 mins ago",
//     status: "New",
//   },
//   {
//     id: "ENQ-102",
//     client: "Bob Smith",
//     property: "Downtown Loft",
//     date: "15 mins ago",
//     status: "Pending",
//   },
//   {
//     id: "ENQ-103",
//     client: "Charlie Davis",
//     property: "Office Space 4B",
//     date: "1 hour ago",
//     status: "Reviewed",
//   },
//   {
//     id: "ENQ-104",
//     client: "Dana Lee",
//     property: "Warehouse 12",
//     date: "3 hours ago",
//     status: "New",
//   },
//   {
//     id: "ENQ-105",
//     client: "Evan Wright",
//     property: "Seaside Condo",
//     date: "5 hours ago",
//     status: "Closed",
//   },
// ];

// const recentBrokers = [
//   {
//     id: "BRK-201",
//     name: "Sarah Conner",
//     agency: "Sky High Realty",
//     joined: "Today",
//   },
//   {
//     id: "BRK-202",
//     name: "John Doe",
//     agency: "Urban Living",
//     joined: "Yesterday",
//   },
//   {
//     id: "BRK-203",
//     name: "Jane Smith",
//     agency: "Prime Estates",
//     joined: "2 days ago",
//   },
//   {
//     id: "BRK-204",
//     name: "Mike Ross",
//     agency: "Legal Homes",
//     joined: "3 days ago",
//   },
//   {
//     id: "BRK-205",
//     name: "Rachel Zane",
//     agency: "Pearson Specter",
//     joined: "4 days ago",
//   },
// ];

export const KPI = () => {
  const [timeFrame, setTimeFrame] = useState<"YEAR" | "MONTH" | "ALL" | "WEEK">(
    "MONTH"
  );
  const { data } = useGetStats();
  const { data: listingTrend } = useGetListingTrend(timeFrame);
  const { data: enquiryTrend } = useGetEnquiryTrend(timeFrame);
  const { data: distribution } = useGetPropertyDistribution();
  const { data: avgValue } = useGetAvgPropertyValue();

  const listingStats = processStats(data?.listingCounts);
  const enquiryStats = processStats(data?.enquiryCounts);
  const brokerStats = processStats(data?.brokerCounts);
  const companyStats = processStats(data?.companyCounts);

  const chartData = useMemo(() => {
    if (!listingTrend || !enquiryTrend) return [];

    // Create a map for enquiries for faster lookup
    const enquiryMap = new Map(
      enquiryTrend.map((item) => [item.period, item.count])
    );

    // Merge listings with enquiries
    // Assuming both endpoints return the same periods for the same timeFrame
    return listingTrend.map((item) => ({
      month: item.period,
      listings: item.count,
      enquiries: enquiryMap.get(item.period) ?? 0,
    }));
  }, [listingTrend, enquiryTrend]);

  const distributionData = useMemo(() => {
    if (!distribution) return [];

    // The backend returns an array of objects like [{ "CATEGORY_TYPE": 25.5 }, ...]
    // We need to transform this into what the UI expects
    return distribution
      .map((item, index) => {
        const key = Object.keys(item)[0];
        const value = item[key]; // This is percentage

        // Generate a color based on index
        const colors = [
          "bg-blue-500",
          "bg-green-500",
          "bg-yellow-500",
          "bg-purple-500",
          "bg-gray-500",
          "bg-red-500",
          "bg-indigo-500",
          "bg-pink-500",
        ];

        return {
          location: key
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase()), // Title Case
          value: value, // This is percentage
          total: 100, // Since value is percentage
          color: colors[index % colors.length],
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by highest percentage
  }, [distribution]);

  return (
    <main className="container py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Key performance Indicators</h1>
      <div className="flex gap-4 ">
        <div className="w-full grid gap-4 md:grid-cols-4 lg:grid-cols-4">
          <StatsCard
            title="Total Listings"
            value={listingStats.total.toLocaleString()}
            icon={Building2}
            variant="blue"
          >
            <Breakdown items={listingStats.breakdown} />
          </StatsCard>
          <StatsCard
            title="Total Enquiries"
            value={enquiryStats.total.toLocaleString()}
            icon={MessageSquare}
            variant="green"
          >
            <Breakdown items={enquiryStats.breakdown} />
          </StatsCard>
          <StatsCard
            title="Total Brokers"
            value={brokerStats.total.toLocaleString()}
            icon={Users}
            variant="yellow"
          >
            <Breakdown items={brokerStats.breakdown} />
          </StatsCard>
          <StatsCard
            title="Total Companies"
            value={companyStats.total.toLocaleString()}
            icon={AlertCircle}
            variant="red"
          >
            <Breakdown items={companyStats.breakdown} />
          </StatsCard>
        </div>
        {/* <div className="w-1/2">
          <CalendarNotes />
        </div> */}
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
              <CardDescription>
                {timeFrame === "WEEK"
                  ? "Daily"
                  : timeFrame === "MONTH"
                  ? "Daily (Last 30 Days)"
                  : timeFrame === "YEAR"
                  ? "Monthly (Last 12 Months)"
                  : "All Time"}{" "}
                listings and enquiries
              </CardDescription>
            </div>
            <Select
              value={timeFrame}
              onValueChange={(v) =>
                setTimeFrame(v as "YEAR" | "MONTH" | "ALL" | "WEEK")
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEK">Week</SelectItem>
                <SelectItem value="MONTH">Month</SelectItem>
                <SelectItem value="YEAR">Year</SelectItem>
                <SelectItem value="ALL">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={trendChartConfig}
              className="h-[300px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={chartData}
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
                  tickFormatter={(value) => {
                    if (timeFrame === "YEAR" || timeFrame === "ALL") {
                      // Format YYYY-MM to Month Name or similar if needed
                      // For now keeping simpler format
                      return value;
                    }
                    // For daily data, maybe show Day only or MM-DD
                    return value.slice(5);
                  }}
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
                <div className="mt-2 text-2xl font-bold">
                  {avgValue && !isNaN(Number(avgValue))
                    ? new Intl.NumberFormat("en-AE", {
                        style: "currency",
                        currency: "AED",
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(Number(avgValue))
                    : "AED 0"}
                </div>
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
                {distributionData.slice(0, 5).map((item) => (
                  <div key={item.location} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.location}</span>
                      <span className="text-muted-foreground">
                        {Math.round(item.value)}%
                      </span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
                {distributionData.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No distribution data available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
