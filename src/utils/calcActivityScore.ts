import { WeatherInputs } from "./calcComfortScore";

export type ActivityType =
  | "soccer"
  | "running"
  | "cycling"
  | "walking"
  | "fishing"
  | "boating"
  | "photography"
  | "outdoor-events";

interface ActivityWeights {
  temperature: number;
  aqi: number;
  uv: number;
  wind: number;
  humidity: number;
  tempIdeal: { min: number; max: number };
  windIdeal: { min: number; max: number };
  uvPenaltyAbove?: number;
}

const ACTIVITY_CONFIG: Record<ActivityType, ActivityWeights> = {
  soccer: {
    temperature: 0.3,
    aqi: 0.25,
    uv: 0.2,
    wind: 0.1,
    humidity: 0.15,
    tempIdeal: { min: 60, max: 78 },
    windIdeal: { min: 3, max: 15 },
    uvPenaltyAbove: 8,
  },
  running: {
    temperature: 0.35,
    aqi: 0.3,
    uv: 0.15,
    wind: 0.1,
    humidity: 0.1,
    tempIdeal: { min: 55, max: 72 },
    windIdeal: { min: 2, max: 12 },
    uvPenaltyAbove: 7,
  },
  cycling: {
    temperature: 0.25,
    aqi: 0.2,
    uv: 0.15,
    wind: 0.25,
    humidity: 0.15,
    tempIdeal: { min: 58, max: 80 },
    windIdeal: { min: 5, max: 18 },
    uvPenaltyAbove: 9,
  },
  walking: {
    temperature: 0.3,
    aqi: 0.25,
    uv: 0.2,
    wind: 0.1,
    humidity: 0.15,
    tempIdeal: { min: 58, max: 85 },
    windIdeal: { min: 2, max: 15 },
    uvPenaltyAbove: 9,
  },
  fishing: {
    temperature: 0.25,
    aqi: 0.15,
    uv: 0.1,
    wind: 0.35,
    humidity: 0.15,
    tempIdeal: { min: 55, max: 82 },
    windIdeal: { min: 2, max: 10 },
    uvPenaltyAbove: 10,
  },
  boating: {
    temperature: 0.2,
    aqi: 0.1,
    uv: 0.15,
    wind: 0.4,
    humidity: 0.15,
    tempIdeal: { min: 65, max: 90 },
    windIdeal: { min: 8, max: 20 },
    uvPenaltyAbove: 10,
  },
  photography: {
    temperature: 0.2,
    aqi: 0.15,
    uv: 0.25,
    wind: 0.2,
    humidity: 0.2,
    tempIdeal: { min: 50, max: 85 },
    windIdeal: { min: 0, max: 12 },
    uvPenaltyAbove: 11,
  },
  "outdoor-events": {
    temperature: 0.3,
    aqi: 0.3,
    uv: 0.2,
    wind: 0.1,
    humidity: 0.1,
    tempIdeal: { min: 65, max: 80 },
    windIdeal: { min: 3, max: 12 },
    uvPenaltyAbove: 7,
  },
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function scoreRange(value: number, ideal: { min: number; max: number }): number {
  if (value >= ideal.min && value <= ideal.max) return 100;
  if (value < ideal.min) return clamp(100 - (ideal.min - value) * 4);
  return clamp(100 - (value - ideal.max) * 5);
}

function scoreAqi(aqi: number): number {
  if (aqi <= 50) return 100;
  if (aqi <= 100) return clamp(100 - (aqi - 50));
  return clamp(30 - (aqi - 100) * 0.5);
}

function scoreUv(uv: number, penaltyAbove?: number): number {
  const threshold = penaltyAbove ?? 8;
  if (uv <= 3) return 90;
  if (uv <= threshold) return 100;
  return clamp(100 - (uv - threshold) * 15);
}

function scoreWind(wind: number, ideal: { min: number; max: number }): number {
  if (wind >= ideal.min && wind <= ideal.max) return 100;
  if (wind < ideal.min) return clamp(50 + wind * 8);
  return clamp(100 - (wind - ideal.max) * 6);
}

function scoreHumidity(humidity: number): number {
  if (humidity >= 30 && humidity <= 65) return 100;
  if (humidity < 30) return clamp(75 + humidity * 0.5);
  return clamp(100 - (humidity - 65) * 2);
}

export function calcActivityScore(
  activity: ActivityType,
  inputs: WeatherInputs
): number {
  const config = ACTIVITY_CONFIG[activity];
  const scores = {
    temperature: scoreRange(inputs.temperature, config.tempIdeal),
    aqi: scoreAqi(inputs.aqi),
    uv: scoreUv(inputs.uvIndex, config.uvPenaltyAbove),
    wind: scoreWind(inputs.windSpeed, config.windIdeal),
    humidity: scoreHumidity(inputs.humidity),
  };

  const total =
    scores.temperature * config.temperature +
    scores.aqi * config.aqi +
    scores.uv * config.uv +
    scores.wind * config.wind +
    scores.humidity * config.humidity;

  return clamp(total);
}

export function getActivityScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 35) return "Poor";
  return "Not Recommended";
}

export function getActivityReasoning(
  activity: ActivityType,
  inputs: WeatherInputs,
  score: number
): string {
  const reasons: string[] = [];

  if (inputs.temperature > 85) reasons.push("high afternoon heat");
  else if (inputs.temperature < 55) reasons.push("cool temperatures");
  else reasons.push("comfortable temperature range");

  if (inputs.aqi > 100) reasons.push("elevated air pollution");
  else if (inputs.aqi <= 50) reasons.push("clean air quality");

  if (inputs.uvIndex > 7) reasons.push("strong UV exposure");
  if (inputs.windSpeed > 15) reasons.push("gusty winds");
  else if (inputs.windSpeed < 3) reasons.push("calm conditions");

  const prefix = score >= 70 ? "Favorable" : score >= 50 ? "Acceptable" : "Challenging";
  return `${prefix} conditions with ${reasons.slice(0, 3).join(", ")}.`;
}

export const ACTIVITY_NAMES: Record<ActivityType, string> = {
  soccer: "Soccer",
  running: "Running",
  cycling: "Cycling",
  walking: "Walking",
  fishing: "Fishing",
  boating: "Boating",
  photography: "Photography",
  "outdoor-events": "Outdoor Events",
};
