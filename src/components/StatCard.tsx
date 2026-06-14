"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  subtext?: string;
  accent?: string;
  className?: string;
  large?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  accent,
  className,
  large,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "group hover:border-white/20 hover:shadow-glass hover:-translate-y-0.5",
        className
      )}
    >
      <CardContent className={cn("p-5", large && "p-6")}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <div
              className={cn(
                "font-semibold tracking-tight",
                large ? "text-5xl md:text-6xl" : "text-2xl"
              )}
              style={accent ? { color: accent } : undefined}
            >
              {value}
            </div>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            )}
          </div>
          {Icon && (
            <div className="rounded-xl bg-white/5 p-2.5 border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
