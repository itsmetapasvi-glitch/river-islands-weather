"use client";

import { AlertTriangle, Thermometer, Clock } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
} from "recharts";
import { PageHeader } from "@/components/Navigation";
import { ChartCard } from "@/components/ChartCard";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AirQualityData, WeatherData } from "@/types";

interface ForecastContentProps {
  weather: WeatherData;
  airQuality: AirQualityData;
}

export function ForecastContent({ weather }: ForecastContentProps) {
  const hourlyData = weather.hourly.map((h) => ({
    hour: h.hour.replace(" ", ""),
    temp: h.temp,
    aqi: h.aqi,
    uv: h.uv,
    wind: h.wind,
    condition: h.condition,
  }));

  const dailyData = weather.daily.map((d) => ({
    day: d.day,
    high: d.high,
    low: d.low,
    aqi: d.aqi,
    precip: d.precip,
  }));

  const combinedData = weather.hourly.map((h) => ({
    hour: h.hour,
    temp: h.temp,
    aqi: h.aqi,
  }));

  const riskHours = weather.heatRisk.riskHours;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Environmental Forecast"
        description="Hourly and 7-day predictions combining weather patterns, air quality, and heat risk analysis."
      />

      <Tabs defaultValue="hourly" className="w-full">
        <TabsList>
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
          <TabsTrigger value="daily">7-Day</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly">
          <div className="grid md:grid-cols-4 gap-3 mb-6">
            {weather.hourly.slice(0, 4).map((h) => (
              <StatCard
                key={h.hour}
                label={h.hour}
                value={`${h.temp}°`}
                subtext={h.condition}
              />
            ))}
          </div>

          <ChartCard title="Hourly Temperature" subtitle="Next 14 hours">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="hourlyTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1f2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="temp" stroke="#3B82F6" fill="url(#hourlyTemp)" strokeWidth={2} name="Temp °F" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="daily">
          <ChartCard title="7-Day Outlook" subtitle="High / low temperatures and precipitation chance">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailyData}>
                <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="temp" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="precip" orientation="right" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1f2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar yAxisId="precip" dataKey="precip" fill="#10B981" opacity={0.3} radius={[4, 4, 0, 0]} name="Precip %" />
                <Line yAxisId="temp" type="monotone" dataKey="high" stroke="#3B82F6" strokeWidth={2} name="High °F" dot={{ fill: "#3B82F6", r: 4 }} />
                <Line yAxisId="temp" type="monotone" dataKey="low" stroke="#10B981" strokeWidth={2} name="Low °F" dot={{ fill: "#10B981", r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>

      <ChartCard title="Temperature + AQI Combined" subtitle="Correlated environmental signals">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={combinedData}>
            <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
            <YAxis yAxisId="temp" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="aqi" orientation="right" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#1a1f2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Area yAxisId="temp" type="monotone" dataKey="temp" stroke="#3B82F6" fill="#3B82F620" strokeWidth={2} name="Temp °F" />
            <Line yAxisId="aqi" type="monotone" dataKey="aqi" stroke="#F59E0B" strokeWidth={2} name="AQI" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-warning/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold">Heat Risk Prediction</h3>
              <Badge variant="warning">{weather.heatRisk.level}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{weather.heatRisk.advisory}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-warning" />
                <span className="text-sm">
                  Peak: <strong>{weather.heatRisk.peakTemp}°F</strong> at {weather.heatRisk.peakHour}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <ChartCard title="Risk Hours of the Day" subtitle="Elevated heat exposure windows">
          <div className="space-y-3">
            {weather.hourly.map((h) => {
              const isRisk = riskHours.includes(h.hour);
              return (
                <div
                  key={h.hour}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    isRisk
                      ? "border-warning/30 bg-warning/5"
                      : "border-border bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`h-3.5 w-3.5 ${isRisk ? "text-warning" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{h.hour}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span>{h.temp}°F</span>
                    <span className="text-muted-foreground">UV {h.uv}</span>
                    {isRisk && (
                      <Badge variant="warning" className="text-[10px]">
                        Risk
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
