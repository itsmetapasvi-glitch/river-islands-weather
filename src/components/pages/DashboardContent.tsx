"use client";

import {
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Shield,
  Clock,
  TrendingUp,
  Leaf,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { PageHeader } from "@/components/Navigation";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ScoreRing } from "@/components/ScoreRing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityData } from "@/types";
import { getAqiColor } from "@/types";
import { getComfortLabel, getScoreColor } from "@/utils/calcComfortScore";
import Link from "next/link";

interface DashboardContentProps {
  insights: Awaited<ReturnType<typeof import("@/lib/data").getDashboardInsights>>;
  activities: ActivityData[];
}

export function DashboardContent({ insights, activities }: DashboardContentProps) {
  const { weather, airQuality, comfortScore, bestTime } = insights;
  const { current } = weather;
  const aqiColor = getAqiColor(airQuality.current.aqi);

  const forecastChartData = weather.daily.map((d) => ({
    day: d.day,
    high: d.high,
    low: d.low,
    aqi: d.aqi,
  }));

  const hourlyTrend = weather.hourly.slice(0, 8).map((h) => ({
    hour: h.hour,
    comfort: Math.round(
      100 -
        Math.abs(h.temp - 72) * 1.5 -
        Math.max(0, h.aqi - 50) * 0.5 -
        Math.max(0, h.uv - 5) * 3
    ),
  }));

  const topActivities = [...activities]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-8 animate-slide-up">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />
        <PageHeader
          title="Environmental Command Center"
          description={`Live conditions for ${weather.location.name}, ${weather.location.state} — updated ${new Date(current.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · refreshes hourly`}
        />
        <div className="relative grid lg:grid-cols-2 gap-8 mt-6">
          <div className="space-y-6">
            <div className="flex items-end gap-4">
              <AnimatedCounter
                value={current.temperature}
                suffix="°"
                className="text-7xl md:text-8xl font-light tracking-tighter"
              />
              <div className="pb-3 space-y-1">
                <p className="text-lg text-muted-foreground">{current.condition}</p>
                <p className="text-sm text-muted-foreground">
                  Feels like {current.feelsLike}° · H {current.humidity}% · Wind {current.windSpeed} mph {current.windDirection}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="AQI"
                value={
                  <span style={{ color: aqiColor }}>
                    <AnimatedCounter value={airQuality.current.aqi} />
                  </span>
                }
                icon={Shield}
                subtext={airQuality.current.category}
              />
              <StatCard
                label="UV Index"
                value={<AnimatedCounter value={current.uvIndex} />}
                icon={Sun}
                subtext={current.uvIndex >= 7 ? "High" : "Moderate"}
                accent={current.uvIndex >= 7 ? "#F59E0B" : undefined}
              />
              <StatCard
                label="Wind"
                value={<><AnimatedCounter value={current.windSpeed} suffix=" mph" /></>}
                icon={Wind}
              />
              <StatCard
                label="Humidity"
                value={<><AnimatedCounter value={current.humidity} suffix="%" /></>}
                icon={Droplets}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Card className="hover:border-white/20 transition-all">
              <CardContent className="p-6 flex items-center gap-6">
                <ScoreRing score={comfortScore} size={100} label="Comfort" color={getScoreColor(comfortScore)} />
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Outdoor Comfort Score</p>
                  <p className="text-2xl font-bold mt-1">{getComfortLabel(comfortScore)}</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                    Composite score based on temperature, air quality, UV, wind, and humidity.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-accent/5 hover:border-accent/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent">Best Time to Go Outside</p>
                    <p className="text-xl font-bold mt-1">{bestTime.time}</p>
                    <p className="text-sm text-muted-foreground mt-2">{bestTime.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ChartCard title="7-Day Forecast" subtitle="High / low temperatures">
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={forecastChartData}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1f2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="high" stroke="#3B82F6" fill="url(#tempGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="low" stroke="#10B981" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Activity Recommendations" subtitle="Top outdoor opportunities today">
          <div className="grid grid-cols-2 gap-3">
            {topActivities.map((activity) => (
              <Link key={activity.id} href="/activity">
                <Card className="hover:border-primary/30 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.name}</p>
                      <Badge variant={activity.score >= 75 ? "success" : "default"}>
                        {activity.score}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {activity.bestTime}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Environmental Health" subtitle="Today's summary">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border">
              <Leaf className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">Air Quality</p>
                <p className="text-xs text-muted-foreground">
                  AQI {airQuality.current.aqi} — {airQuality.current.category}. Primary pollutant: {airQuality.current.primaryPollutant}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border">
              <Thermometer className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">Heat Risk</p>
                <p className="text-xs text-muted-foreground">
                  {weather.heatRisk.advisory}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Trend</p>
                <p className="text-xs text-muted-foreground">
                  Conditions stable. Peak heat expected {weather.heatRisk.peakHour} at {weather.heatRisk.peakTemp}°F.
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Comfort Trend Today" subtitle="Morning → evening score projection">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyTrend}>
            <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#1a1f2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="comfort" fill="#3B82F6" radius={[6, 6, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
