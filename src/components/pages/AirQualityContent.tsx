"use client";

import { Shield, Heart, TrendingUp, AlertCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PageHeader } from "@/components/Navigation";
import { ChartCard } from "@/components/ChartCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AirQualityData, getAqiCategory, getAqiColor } from "@/types";
import { formatDate } from "@/lib/utils";

interface AirQualityContentProps {
  data: AirQualityData;
}

export function AirQualityContent({ data }: AirQualityContentProps) {
  const { current } = data;
  const aqiColor = getAqiColor(current.aqi);
  const category = getAqiCategory(current.aqi);

  const chart7d = data.history7d.map((d) => ({
    date: formatDate(d.date),
    aqi: d.aqi,
  }));

  const chart30d = data.history30d.map((d) => ({
    date: formatDate(d.date),
    aqi: d.aqi,
  }));

  const pollutants = [
    { name: "PM2.5", value: current.pm25, unit: "µg/m³" },
    { name: "PM10", value: current.pm10, unit: "µg/m³" },
    { name: "O₃", value: current.o3, unit: "ppm" },
    { name: "NO₂", value: current.no2, unit: "ppm" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Air Quality Analytics"
        description="Real-time AQI monitoring and historical trends for River Islands, California."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-2" style={{ borderColor: `${aqiColor}30` }}>
          <CardContent className="p-8 flex flex-col items-center text-center">
            <Shield className="h-8 w-8 mb-4" style={{ color: aqiColor }} />
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Current AQI
            </p>
            <AnimatedCounter
              value={current.aqi}
              className="text-7xl font-light mt-2"
              style={{ color: aqiColor } as React.CSSProperties}
            />
            <Badge
              className="mt-4 text-sm px-4 py-1"
              style={{
                backgroundColor: `${aqiColor}15`,
                color: aqiColor,
                borderColor: `${aqiColor}30`,
              }}
            >
              {category}
            </Badge>
            <p className="text-xs text-muted-foreground mt-4">
              Primary: {current.primaryPollutant}
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          {pollutants.map((p) => (
            <Card key={p.name} className="hover:border-white/20 transition-all">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground font-medium">{p.name}</p>
                <p className="text-2xl font-bold mt-1 font-mono">{p.value}</p>
                <p className="text-[10px] text-muted-foreground">{p.unit}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs defaultValue="7d">
        <TabsList>
          <TabsTrigger value="7d">7 Days</TabsTrigger>
          <TabsTrigger value="30d">30 Days</TabsTrigger>
        </TabsList>

        <TabsContent value="7d">
          <ChartCard title="7-Day AQI History" subtitle="Daily average air quality index">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chart7d}>
                <defs>
                  <linearGradient id="aqiGrad7" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 150]} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <ReferenceLine y={50} stroke="#10B981" strokeDasharray="3 3" label={{ value: "Good", fill: "#10B981", fontSize: 10 }} />
                <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: "Moderate", fill: "#F59E0B", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1f2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#10B981" fill="url(#aqiGrad7)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="30d">
          <ChartCard title="30-Day AQI History" subtitle="Monthly pollution trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chart30d}>
                <defs>
                  <linearGradient id="aqiGrad30" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis domain={[0, 150]} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <ReferenceLine y={50} stroke="#10B981" strokeDasharray="3 3" />
                <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{
                    background: "#1a1f2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#3B82F6" fill="url(#aqiGrad30)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Pollution Trend Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.trendAnalysis}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">Health Impact</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.healthImpact}
            </p>
            <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-white/5 border border-border">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                This is general environmental guidance, not medical advice. Consult a healthcare provider for personal health decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChartCard title="AQI Scale Reference" subtitle="US EPA Air Quality Index categories">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { range: "0–50", label: "Good", color: "#10B981" },
            { range: "51–100", label: "Moderate", color: "#F59E0B" },
            { range: "101–150", label: "Unhealthy SG", color: "#F97316" },
            { range: "151–200", label: "Unhealthy", color: "#EF4444" },
            { range: "201–300", label: "Very Unhealthy", color: "#A855F7" },
            { range: "301+", label: "Hazardous", color: "#7F1D1D" },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl border text-center"
              style={{
                borderColor: `${item.color}30`,
                backgroundColor: `${item.color}08`,
              }}
            >
              <p className="text-lg font-bold" style={{ color: item.color }}>
                {item.range}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
