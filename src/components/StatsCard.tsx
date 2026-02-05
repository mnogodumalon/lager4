import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent";
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "accent" && "bg-accent text-accent-foreground"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p
              className={cn(
                "text-sm font-medium",
                variant === "default" && "text-muted-foreground"
              )}
            >
              {title}
            </p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs mt-2 font-medium",
                  trend.isPositive
                    ? "text-[var(--status-in-stock)]"
                    : "text-[var(--status-out-of-stock)]"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-xl",
              variant === "default" && "bg-secondary",
              variant === "primary" && "bg-primary-foreground/10",
              variant === "accent" && "bg-accent-foreground/10"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
