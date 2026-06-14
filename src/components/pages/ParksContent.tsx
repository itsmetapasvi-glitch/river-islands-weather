"use client";

import { useState } from "react";
import { MapPin, Clock, Users, Sun, TreePine } from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { ChartCard } from "@/components/ChartCard";
import { ScoreRing } from "@/components/ScoreRing";
import { MapView } from "@/components/MapView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParkData } from "@/types";
import { getScoreColor } from "@/utils/calcComfortScore";

interface ParksContentProps {
  parks: ParkData[];
}

export function ParksContent({ parks }: ParksContentProps) {
  const [selectedPark, setSelectedPark] = useState<ParkData | null>(null);

  const center: [number, number] = [37.738, -121.425];
  const markers = parks.map((p) => ({
    id: p.id,
    lat: p.lat,
    lon: p.lon,
    label: p.name,
    description: `Comfort: ${p.comfortScore}/100 · ${p.crowdPrediction} crowd`,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Park Conditions"
        description="Local park intelligence for River Islands — comfort scores, crowd predictions, and optimal visiting windows."
      />

      <ChartCard title="River Islands Park Map" subtitle="Interactive map of local recreation areas">
        <MapView center={center} zoom={13} markers={markers} height="420px" />
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-4">
        {parks.map((park) => (
          <Card
            key={park.id}
            className={`cursor-pointer transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5 ${
              selectedPark?.id === park.id ? "border-primary/40 ring-1 ring-primary/20" : ""
            }`}
            onClick={() => setSelectedPark(park)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold text-lg">{park.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {park.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      <span className="text-muted-foreground">{park.bestHours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground">{park.crowdPrediction} crowd</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sun className="h-3.5 w-3.5 text-warning" />
                      <span className="text-muted-foreground">{park.weatherSuitability}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">
                        {park.lat.toFixed(4)}, {park.lon.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {park.amenities.map((a) => (
                      <Badge key={a} variant="secondary" className="text-[10px]">
                        {a}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-xs text-accent/80 pt-1">{park.highlights}</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <ScoreRing
                    score={park.comfortScore}
                    size={80}
                    strokeWidth={6}
                    label="Comfort"
                    color={getScoreColor(park.comfortScore)}
                  />
                  <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${park.crowdLevel}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Crowd level</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl overflow-hidden border border-border h-32">
                <MapView
                  center={[park.lat, park.lon]}
                  zoom={15}
                  markers={[
                    {
                      id: park.id,
                      lat: park.lat,
                      lon: park.lon,
                      label: park.name,
                    },
                  ]}
                  height="128px"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
