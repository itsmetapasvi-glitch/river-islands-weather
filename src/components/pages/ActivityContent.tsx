"use client";

import {
  Activity,
  Bike,
  Camera,
  Fish,
  Footprints,
  Sailboat,
  Users,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/Navigation";
import { ChartCard } from "@/components/ChartCard";
import { ScoreRing } from "@/components/ScoreRing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityData, WeatherData } from "@/types";
import { getScoreColor } from "@/utils/calcComfortScore";
import { getActivityScoreLabel } from "@/utils/calcActivityScore";

const iconMap: Record<string, React.ElementType> = {
  footprints: Footprints,
  activity: Activity,
  bike: Bike,
  fish: Fish,
  sailboat: Sailboat,
  camera: Camera,
  users: Users,
};

const trendLabels = ["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"];

interface ActivityContentProps {
  activities: ActivityData[];
  weather: WeatherData;
  aqi: number;
}

export function ActivityContent({ activities, weather, aqi }: ActivityContentProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Activity Intelligence"
        description="Data-driven scoring for 8 outdoor activities — based on temperature, UV, AQI, wind, and humidity in River Islands."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activities.map((activity, idx) => {
          const Icon = iconMap[activity.icon] || Activity;
          const trendData = activity.trend.map((score, i) => ({
            time: trendLabels[i],
            score,
          }));
          const scoreColor = getScoreColor(activity.score);
          const label = getActivityScoreLabel(activity.score);

          return (
            <Card
              key={activity.id}
              className="hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/5 p-2.5 border border-border group-hover:border-primary/20 transition-all">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{activity.name}</h3>
                      <Badge
                        variant={
                          activity.score >= 75
                            ? "success"
                            : activity.score >= 50
                            ? "default"
                            : "warning"
                        }
                        className="mt-1"
                      >
                        {label}
                      </Badge>
                    </div>
                  </div>
                  <ScoreRing score={activity.score} size={64} strokeWidth={5} color={scoreColor} />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activity.reasoning}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  <span>Best: {activity.bestTime}</span>
                </div>

                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip
                        contentStyle={{
                          background: "#1a1f2e",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke={scoreColor}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ChartCard
        title="Scoring Methodology"
        subtitle="How we calculate activity scores"
      >
        <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Current Conditions Input</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Temperature: {weather.current.temperature}°F</li>
              <li>UV Index: {weather.current.uvIndex}</li>
              <li>AQI: {aqi}</li>
              <li>Wind: {weather.current.windSpeed} mph</li>
              <li>Humidity: {weather.current.humidity}%</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Per-Activity Weights</p>
            <p>
              Each activity uses custom weighted formulas. Running prioritizes cool temps and clean air.
              Boating favors moderate wind. Photography optimizes for golden-hour lighting conditions.
            </p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
