import weatherData from "../../data/weather.json";
import airQualityData from "../../data/air-quality.json";
import parksData from "../../data/parks.json";
import communityReportsData from "../../data/community-reports.json";
import {
  WeatherData,
  AirQualityData,
  ActivityData,
  ParkData,
  CommunityReport,
} from "@/types";
import { calcComfortScore, getBestTimeToGoOutside, getComfortLabel } from "@/utils/calcComfortScore";
import {
  calcActivityScore,
  getActivityReasoning,
  ActivityType,
} from "@/utils/calcActivityScore";
import { fetchLiveAirQualityData, fetchLiveWeatherData } from "@/lib/open-meteo";

export { REVALIDATE_SECONDS } from "@/lib/location";

const ACTIVITY_DEFINITIONS: Array<{
  id: ActivityType;
  name: string;
  icon: string;
}> = [
  { id: "soccer", name: "Soccer", icon: "footprints" },
  { id: "running", name: "Running", icon: "activity" },
  { id: "cycling", name: "Cycling", icon: "bike" },
  { id: "walking", name: "Walking", icon: "footprints" },
  { id: "fishing", name: "Fishing", icon: "fish" },
  { id: "boating", name: "Boating", icon: "sailboat" },
  { id: "photography", name: "Photography", icon: "camera" },
  { id: "outdoor-events", name: "Outdoor Events", icon: "users" },
];

function getActivityBestTime(
  activity: ActivityType,
  hourly: WeatherData["hourly"]
): string {
  let best = { hour: hourly[0]?.hour ?? "9 AM", score: -1, index: 0 };

  hourly.forEach((hour, index) => {
    const score = calcActivityScore(activity, {
      temperature: hour.temp,
      aqi: hour.aqi,
      uvIndex: hour.uv,
      windSpeed: hour.wind,
      humidity: hour.humidity,
    });

    if (score > best.score) {
      best = { hour: hour.hour, score, index };
    }
  });

  const endHour = hourly[Math.min(best.index + 2, hourly.length - 1)]?.hour ?? best.hour;
  return `${best.hour} – ${endHour}`;
}

export async function getWeather(): Promise<WeatherData> {
  try {
    return await fetchLiveWeatherData();
  } catch (error) {
    console.error("Live weather unavailable, using static fallback:", error);
    return weatherData as WeatherData;
  }
}

export async function getAirQuality(): Promise<AirQualityData> {
  try {
    const staticData = airQualityData as AirQualityData;
    return await fetchLiveAirQualityData({
      history7d: staticData.history7d,
      history30d: staticData.history30d,
    });
  } catch (error) {
    console.error("Live air quality unavailable, using static fallback:", error);
    return airQualityData as AirQualityData;
  }
}

export async function getActivityScores(): Promise<ActivityData[]> {
  const weather = await getWeather();
  const airQuality = await getAirQuality();

  const currentInputs = {
    temperature: weather.current.temperature,
    aqi: airQuality.current.aqi,
    uvIndex: weather.current.uvIndex,
    windSpeed: weather.current.windSpeed,
    humidity: weather.current.humidity,
  };

  return ACTIVITY_DEFINITIONS.map((activity) => {
    const score = calcActivityScore(activity.id, currentInputs);
    const trend = weather.hourly.slice(0, 8).map((hour) =>
      calcActivityScore(activity.id, {
        temperature: hour.temp,
        aqi: hour.aqi,
        uvIndex: hour.uv,
        windSpeed: hour.wind,
        humidity: hour.humidity,
      })
    );

    return {
      id: activity.id,
      name: activity.name,
      icon: activity.icon,
      score,
      reasoning: getActivityReasoning(activity.id, currentInputs, score),
      bestTime: getActivityBestTime(activity.id, weather.hourly),
      trend,
    };
  });
}

export async function getParks(): Promise<ParkData[]> {
  const weather = await getWeather();
  const airQuality = await getAirQuality();
  const comfortScore = calcComfortScore({
    temperature: weather.current.temperature,
    aqi: airQuality.current.aqi,
    uvIndex: weather.current.uvIndex,
    windSpeed: weather.current.windSpeed,
    humidity: weather.current.humidity,
  });
  const suitability = `${getComfortLabel(comfortScore)} — ${weather.current.temperature}°F, AQI ${airQuality.current.aqi}`;

  return (parksData.parks as ParkData[]).map((park) => ({
    ...park,
    comfortScore,
    weatherSuitability: suitability,
  }));
}

export async function getCommunityReports(): Promise<CommunityReport[]> {
  return communityReportsData.reports as CommunityReport[];
}

export async function getDashboardInsights() {
  const weather = await getWeather();
  const airQuality = await getAirQuality();

  const inputs = {
    temperature: weather.current.temperature,
    aqi: airQuality.current.aqi,
    uvIndex: weather.current.uvIndex,
    windSpeed: weather.current.windSpeed,
    humidity: weather.current.humidity,
  };

  const comfortScore = calcComfortScore(inputs);
  const bestTime = getBestTimeToGoOutside(weather.hourly);

  return {
    weather,
    airQuality,
    comfortScore,
    bestTime,
  };
}
