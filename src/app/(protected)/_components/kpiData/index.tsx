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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { CalendarNotes } from "./calendar-notes";
import { useCalendarEvents, NoteEvent } from "@/hooks/useCalendarEvents";
import { isSameDay } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export const KPI = () => {
  const [timeFrame, setTimeFrame] = useState<"YEAR" | "MONTH" | "ALL" | "WEEK">(
    "MONTH"
  );
  const { data } = useGetStats();
  const { data: listingTrend } = useGetListingTrend(timeFrame);
  const { data: enquiryTrend } = useGetEnquiryTrend(timeFrame);
  const { data: distribution } = useGetPropertyDistribution();
  const { data: avgValue } = useGetAvgPropertyValue();

  const { events, addEvent, updateEvent, deleteEvent, toggleComplete } =
    useCalendarEvents();
  const [newEventTitle, setNewEventTitle] = useState("");
  const [editingEvent, setEditingEvent] = useState<NoteEvent | null>(null);

  const todayEvents = events.filter(
    (e) => e.start && isSameDay(new Date(e.start), new Date())
  );

  const handleAddQuickEvent = () => {
    if (!newEventTitle.trim()) return;
    const now = new Date();
    addEvent({
      id: crypto.randomUUID(),
      title: newEventTitle,
      start: now,
      end: now,
      allDay: true,
      completed: false,
    });
    setNewEventTitle("");
  };

  const handleUpdateEvent = () => {
    if (editingEvent) {
      updateEvent(editingEvent);
      setEditingEvent(null);
    }
  };

  const listingStats = processStats(data?.listingCounts);
  const enquiryStats = processStats(data?.enquiryCounts);
  const brokerStats = processStats(data?.brokerCounts);
  const companyStats = processStats(data?.companyCounts);

  const chartData = useMemo(() => {
    if (!listingTrend || !enquiryTrend) return [];

    const enquiryMap = new Map(
      enquiryTrend.map((item) => [item.period, item.count])
    );

    return listingTrend.map((item) => ({
      month: item.period,
      listings: item.count,
      enquiries: enquiryMap.get(item.period) ?? 0,
    }));
  }, [listingTrend, enquiryTrend]);

  const distributionData = useMemo(() => {
    if (!distribution) return [];

    return distribution
      .map((item, index) => {
        const key = Object.keys(item)[0];
        const value = item[key];
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
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          value: value,
          total: 100,
          color: colors[index % colors.length],
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [distribution]);

  return (
    <main className="container py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Key performance Indicators</h1>
      <div className="flex gap-4 ">
        <div className="w-full grid gap-4 md:grid-cols-5 lg:grid-cols-5">
          <StatsCard
            title="Total Listings"
            value={listingStats.total.toLocaleString()}
            icon={Building2}
            variant="blue"
            link={"/properties"}
          >
            <Breakdown items={listingStats.breakdown} />
          </StatsCard>
          <StatsCard
            title="Total Enquiries"
            value={enquiryStats.total.toLocaleString()}
            link={"/enquiries"}
            icon={MessageSquare}
            variant="green"
          >
            <Breakdown items={enquiryStats.breakdown} />
          </StatsCard>
          <StatsCard
            link={"/brokers"}
            title="Total Brokers"
            value={brokerStats.total.toLocaleString()}
            icon={Users}
            variant="yellow"
          >
            <Breakdown items={brokerStats.breakdown} />
          </StatsCard>
          <StatsCard
            link={"/companies"}
            title="Total Companies"
            value={companyStats.total.toLocaleString()}
            icon={AlertCircle}
            variant="red"
          >
            <Breakdown items={companyStats.breakdown} />
          </StatsCard>
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <span>Today's Tasks</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[700px]">
                    <CalendarNotes
                      events={events}
                      onAdd={addEvent}
                      onUpdate={updateEvent}
                      onDelete={deleteEvent}
                    />
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new task..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddQuickEvent()}
                />
                <Button size="icon" onClick={handleAddQuickEvent}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {todayEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks for today
                  </p>
                )}
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <Checkbox
                      checked={event.completed}
                      onCheckedChange={() => toggleComplete(event.id)}
                      id={`task-${event.id}`}
                    />
                    <label
                      htmlFor={`task-${event.id}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer ${
                        event.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {event.title}
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingEvent(event)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog
            open={!!editingEvent}
            onOpenChange={(open) => !open && setEditingEvent(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingEvent?.title || ""}
                    onChange={(e) =>
                      setEditingEvent(
                        editingEvent
                          ? { ...editingEvent, title: e.target.value }
                          : null
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-desc">Description</Label>
                  <Textarea
                    id="edit-desc"
                    value={editingEvent?.desc || ""}
                    onChange={(e) =>
                      setEditingEvent(
                        editingEvent
                          ? { ...editingEvent, desc: e.target.value }
                          : null
                      )
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingEvent(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateEvent}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-10">
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
                      return value;
                    }

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

        <Card className="md:col-span-4 shadow-sm border-none bg-card/50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Highlights</CardTitle>
            {/* <Badge
              variant="secondary"
              className="text-green-500 bg-green-500/10 hover:bg-green-500/20"
            >
              +8.4% MoM
            </Badge> */}
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
                {/* <div className="mt-1 text-xs font-medium text-green-500 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  2.1%
                </div> */}
              </div>
              {/* <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Conversion
                </div>
                <div className="mt-2 text-2xl font-bold">28.3%</div>
                <div className="mt-1 text-xs font-medium text-red-500 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  0.6%
                </div>
              </div> */}
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
