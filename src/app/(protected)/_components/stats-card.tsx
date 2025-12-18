import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: "blue" | "green" | "yellow" | "red" | "gray";
  children?: React.ReactNode;
}

const colorMap = {
  blue: "bg-blue-100 dark:bg-blue-900",
  green: "bg-green-100 dark:bg-green-900",
  yellow: "bg-yellow-100 dark:bg-yellow-900",
  red: "bg-red-100 dark:bg-red-900",
  gray: "bg-gray-100 dark:bg-gray-900",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = "blue",
  children,
}: StatsCardProps) {
  return (
    <Card className="shadow-none overflow-hidden relative">
      <div
        className={cn(
          "absolute bottom-0 h-full w-full blur-2xl bg-grain opacity-50",
          colorMap[variant]
        )}
      ></div>
      <CardHeader className="flex relative flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold">{value}</div>
        {children && <div className="mt-2">{children}</div>}
      </CardContent>
    </Card>
  );
}
