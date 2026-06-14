"use client";

import { useEffect, useState } from "react";
import {
  ThumbsUp,
  CheckCircle,
  MapPin,
  Plus,
  Flame,
  Thermometer,
  TreePine,
  Bug,
  Droplets,
} from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { ChartCard } from "@/components/ChartCard";
import { MapView } from "@/components/MapView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CommunityReport,
  ReportCategory,
  REPORT_CATEGORIES,
} from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { formatRelativeTime, cn } from "@/lib/utils";

const categoryIcons: Record<ReportCategory, React.ElementType> = {
  smoke: Flame,
  heat: Thermometer,
  "park-issue": TreePine,
  mosquito: Bug,
  water: Droplets,
};

interface CommunityContentProps {
  initialReports: CommunityReport[];
}

export function CommunityContent({ initialReports }: CommunityContentProps) {
  const {
    communityReports,
    setCommunityReports,
    selectedReportCategory,
    setReportCategory,
    upvoteReport,
    confirmReport,
    addReport,
  } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<ReportCategory>("park-issue");

  useEffect(() => {
    setCommunityReports(initialReports);
  }, [initialReports, setCommunityReports]);

  const filtered =
    selectedReportCategory === "all"
      ? communityReports
      : communityReports.filter((r) => r.category === selectedReportCategory);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const mapMarkers = filtered.map((r) => ({
    id: r.id,
    lat: r.lat,
    lon: r.lon,
    label: r.title,
    description: REPORT_CATEGORIES[r.category].label,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const report: CommunityReport = {
      id: `r${Date.now()}`,
      category: newCategory,
      title: newTitle,
      description: newDescription,
      lat: 37.738 + (Math.random() - 0.5) * 0.02,
      lon: -121.425 + (Math.random() - 0.5) * 0.02,
      timestamp: new Date().toISOString(),
      upvotes: 0,
      confirmations: 0,
      author: "You",
    };

    addReport(report);
    setNewTitle("");
    setNewDescription("");
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Community Reports"
          description="Civic environmental reporting for River Islands — smoke, heat, park issues, and more."
        />
        <Button onClick={() => setShowForm(!showForm)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Submit Report
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 animate-slide-up">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((cat) => {
                  const Icon = categoryIcons[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        newCategory === cat
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-white/5"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {REPORT_CATEGORIES[cat].label}
                    </button>
                  );
                })}
              </div>
              <Input
                placeholder="Report title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Describe what you observed..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setReportCategory("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            selectedReportCategory === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-white/5"
          )}
        >
          All
        </button>
        {(Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((cat) => {
          const Icon = categoryIcons[cat];
          return (
            <button
              key={cat}
              onClick={() => setReportCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                selectedReportCategory === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-white/5"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {REPORT_CATEGORIES[cat].label}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          {sorted.map((report) => {
            const Icon = categoryIcons[report.category];
            const catInfo = REPORT_CATEGORIES[report.category];

            return (
              <Card
                key={report.id}
                className="hover:border-white/15 transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="rounded-xl p-2.5 border shrink-0"
                      style={{
                        backgroundColor: `${catInfo.color}10`,
                        borderColor: `${catInfo.color}30`,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: catInfo.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">{report.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {report.author} · {formatRelativeTime(report.timestamp)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-[10px]"
                          style={{ color: catInfo.color }}
                        >
                          {catInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() => upvoteReport(report.id)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {report.upvotes}
                        </button>
                        <button
                          onClick={() => confirmReport(report.id)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {report.confirmations} confirmed
                        </button>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          River Islands
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <ChartCard title="Report Map" subtitle="Community pins by category">
            <MapView
              center={[37.738, -121.425]}
              zoom={13}
              markers={mapMarkers}
              height="350px"
            />
          </ChartCard>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm mb-3">Timeline Feed</h3>
              <div className="space-y-3">
                {sorted.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-3 text-xs border-l-2 pl-3"
                    style={{
                      borderColor: REPORT_CATEGORIES[report.category].color,
                    }}
                  >
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-muted-foreground">
                        {formatRelativeTime(report.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
