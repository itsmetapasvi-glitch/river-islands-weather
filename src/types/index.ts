export interface Location {
  name: string;
  state: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface CurrentWeather {
  timestamp: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  visibility: number;
  pressure: number;
  dewPoint: number;
}

export interface HourlyForecast {
  hour: string;
  temp: number;
  aqi: number;
  uv: number;
  wind: number;
  humidity: number;
  condition: string;
}

export interface DailyForecast {
  date: string;
  day: string;
  high: number;
  low: number;
  aqi: number;
  condition: string;
  precip: number;
}

export interface WeatherData {
  location: Location;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  heatRisk: {
    level: string;
    peakHour: string;
    peakTemp: number;
    riskHours: string[];
    advisory: string;
  };
}

export interface AirQualityData {
  current: {
    aqi: number;
    category: string;
    primaryPollutant: string;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    timestamp: string;
  };
  history7d: Array<{ date: string; aqi: number; category?: string }>;
  history30d: Array<{ date: string; aqi: number }>;
  trendAnalysis: string;
  healthImpact: string;
}

export interface ActivityData {
  id: string;
  name: string;
  icon: string;
  score: number;
  reasoning: string;
  bestTime: string;
  trend: number[];
}

export interface ParkData {
  id: string;
  name: string;
  description: string;
  lat: number;
  lon: number;
  comfortScore: number;
  crowdPrediction: string;
  crowdLevel: number;
  bestHours: string;
  weatherSuitability: string;
  amenities: string[];
  highlights: string;
}

export type ReportCategory =
  | "smoke"
  | "heat"
  | "park-issue"
  | "mosquito"
  | "water";

export interface CommunityReport {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  lat: number;
  lon: number;
  timestamp: string;
  upvotes: number;
  confirmations: number;
  author: string;
}

export function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

export function getAqiColor(aqi: number): string {
  if (aqi <= 50) return "#10B981";
  if (aqi <= 100) return "#F59E0B";
  if (aqi <= 150) return "#F97316";
  if (aqi <= 200) return "#EF4444";
  if (aqi <= 300) return "#A855F7";
  return "#7F1D1D";
}

export const REPORT_CATEGORIES: Record<
  ReportCategory,
  { label: string; color: string }
> = {
  smoke: { label: "Smoke", color: "#78716C" },
  heat: { label: "Heat", color: "#EF4444" },
  "park-issue": { label: "Park Issue", color: "#F59E0B" },
  mosquito: { label: "Mosquito", color: "#8B5CF6" },
  water: { label: "Water", color: "#3B82F6" },
};
