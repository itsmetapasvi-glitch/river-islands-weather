import { RIVER_ISLANDS, REVALIDATE_SECONDS } from "@/lib/location";
import {
  AirQualityData,
  DailyForecast,
  HourlyForecast,
  WeatherData,
  getAqiCategory,
} from "@/types";

const FETCH_OPTIONS: RequestInit = {
  next: { revalidate: REVALIDATE_SECONDS },
};

interface OpenMeteoWeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    uv_index: number;
    visibility: number;
    pressure_msl: number;
    dew_point_2m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    uv_index: number[];
    wind_speed_10m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
}

interface OpenMeteoAirQualityResponse {
  current: {
    time: string;
    us_aqi: number;
    pm10: number;
    pm2_5: number;
    ozone: number;
    nitrogen_dioxide: number;
  };
  hourly: {
    time: string[];
    us_aqi: number[];
    pm10: number[];
    pm2_5: number[];
    ozone: number[];
    nitrogen_dioxide: number[];
  };
}

function weatherCodeToCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Partly Cloudy";
}

function weatherCodeToIcon(code: number): string {
  if (code === 0 || code === 1) return "clear";
  if (code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 95) return "storm";
  return "partly-cloudy";
}

function degreesToCompass(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8];
}

function formatHourLabel(isoTime: string): string {
  const date = new Date(isoTime);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: RIVER_ISLANDS.timezone,
  });
}

function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: RIVER_ISLANDS.timezone,
  });
}

function round(value: number | null | undefined, digits = 0): number {
  if (value == null || Number.isNaN(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function buildAqiLookup(hourly: OpenMeteoAirQualityResponse["hourly"]) {
  const lookup = new Map<string, number>();
  hourly.time.forEach((time, index) => {
    lookup.set(time, round(hourly.us_aqi[index]));
  });
  return lookup;
}

function getAqiForTime(aqiLookup: Map<string, number>, isoTime: string, fallback: number) {
  return aqiLookup.get(isoTime) ?? fallback;
}

function getDailyAqi(
  aqiLookup: Map<string, number>,
  date: string,
  fallback: number
): number {
  const values = [...aqiLookup.entries()]
    .filter(([time]) => time.startsWith(date))
    .map(([, aqi]) => aqi)
    .filter((aqi) => aqi > 0);

  if (values.length === 0) return fallback;
  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function calcHeatRisk(hourly: HourlyForecast[]): WeatherData["heatRisk"] {
  const peak = hourly.reduce(
    (best, hour) => (hour.temp > best.temp ? hour : best),
    hourly[0] ?? { hour: "12 PM", temp: 0, aqi: 0, uv: 0, wind: 0, humidity: 0, condition: "Clear" }
  );

  const riskHours = hourly.filter((hour) => hour.temp >= 80).map((hour) => hour.hour);

  let level = "low";
  let advisory =
    "Comfortable temperatures expected. Good conditions for outdoor activity throughout the day.";

  if (peak.temp >= 95) {
    level = "high";
    advisory =
      "Extreme heat expected. Limit strenuous outdoor activity, stay hydrated, and seek shade during peak afternoon hours.";
  } else if (peak.temp >= 88) {
    level = "moderate";
    advisory =
      "Afternoon heat may affect sensitive groups. Hydrate and seek shade between noon and 4 PM.";
  } else if (peak.temp >= 80) {
    level = "low-moderate";
    advisory =
      "Warm afternoon temperatures. Plan vigorous activity for morning or evening hours.";
  }

  return {
    level,
    peakHour: peak.hour,
    peakTemp: round(peak.temp),
    riskHours,
    advisory,
  };
}

function getPrimaryPollutant(current: OpenMeteoAirQualityResponse["current"]): string {
  const pollutants = [
    { name: "PM2.5", value: current.pm2_5 ?? 0 },
    { name: "PM10", value: current.pm10 ?? 0 },
    { name: "O3", value: current.ozone ?? 0 },
    { name: "NO2", value: current.nitrogen_dioxide ?? 0 },
  ];

  return pollutants.sort((a, b) => b.value - a.value)[0]?.name ?? "PM2.5";
}

function buildHealthImpact(aqi: number): string {
  const category = getAqiCategory(aqi).toLowerCase();

  if (aqi <= 50) {
    return "Current conditions are suitable for all outdoor activities. Air quality is in the good range.";
  }
  if (aqi <= 100) {
    return "Air quality is acceptable for most people. Unusually sensitive individuals should consider limiting prolonged outdoor exertion.";
  }
  if (aqi <= 150) {
    return `Air quality is ${category}. Sensitive groups should reduce outdoor activity, especially during afternoon hours.`;
  }
  return `Air quality is ${category}. Everyone should limit prolonged outdoor exertion and consider moving activities indoors.`;
}

function buildTrendAnalysis(aqi: number): string {
  const category = getAqiCategory(aqi);
  return `Live air quality in River Islands is currently ${category} (AQI ${aqi}). Readings refresh hourly from regional monitoring models near River Islands.`;
}

async function fetchWeatherResponse(): Promise<OpenMeteoWeatherResponse> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(RIVER_ISLANDS.lat));
  url.searchParams.set("longitude", String(RIVER_ISLANDS.lon));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility,pressure_msl,dew_point_2m"
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,relative_humidity_2m,uv_index,wind_speed_10m,weather_code"
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code"
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("timezone", RIVER_ISLANDS.timezone);
  url.searchParams.set("forecast_days", "7");

  const response = await fetch(url.toString(), FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error(`Weather API failed: ${response.status}`);
  }

  return response.json();
}

async function fetchAirQualityResponse(): Promise<OpenMeteoAirQualityResponse> {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(RIVER_ISLANDS.lat));
  url.searchParams.set("longitude", String(RIVER_ISLANDS.lon));
  url.searchParams.set("current", "us_aqi,pm10,pm2_5,ozone,nitrogen_dioxide");
  url.searchParams.set("hourly", "us_aqi,pm10,pm2_5,ozone,nitrogen_dioxide");
  url.searchParams.set("timezone", RIVER_ISLANDS.timezone);
  url.searchParams.set("forecast_days", "7");

  const response = await fetch(url.toString(), FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error(`Air quality API failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchLiveWeatherData(): Promise<WeatherData> {
  const [weatherResponse, airQualityResponse] = await Promise.all([
    fetchWeatherResponse(),
    fetchAirQualityResponse(),
  ]);

  const currentAqi = round(airQualityResponse.current.us_aqi);
  const aqiLookup = buildAqiLookup(airQualityResponse.hourly);
  const startIndex = Math.max(
    0,
    weatherResponse.hourly.time.findIndex(
      (time) => new Date(time).getTime() >= Date.now() - 30 * 60 * 1000
    )
  );

  const upcomingHourly = weatherResponse.hourly.time
    .slice(startIndex, startIndex + 15)
    .map((time, offset) => ({ time, index: startIndex + offset }));

  const hourly: HourlyForecast[] = upcomingHourly.map(({ time, index }) => ({
    hour: formatHourLabel(time),
    temp: round(weatherResponse.hourly.temperature_2m[index]),
    aqi: getAqiForTime(aqiLookup, time, currentAqi),
    uv: round(weatherResponse.hourly.uv_index[index], 1),
    wind: round(weatherResponse.hourly.wind_speed_10m[index], 1),
    humidity: round(weatherResponse.hourly.relative_humidity_2m[index]),
    condition: weatherCodeToCondition(weatherResponse.hourly.weather_code[index]),
  }));

  const daily: DailyForecast[] = weatherResponse.daily.time.map((date, index) => ({
    date,
    day: formatDayLabel(date),
    high: round(weatherResponse.daily.temperature_2m_max[index]),
    low: round(weatherResponse.daily.temperature_2m_min[index]),
    aqi: getDailyAqi(aqiLookup, date, currentAqi),
    condition: weatherCodeToCondition(weatherResponse.daily.weather_code[index]),
    precip: round(weatherResponse.daily.precipitation_probability_max[index]),
  }));

  const current = weatherResponse.current;

  return {
    location: {
      name: RIVER_ISLANDS.name,
      state: RIVER_ISLANDS.state,
      lat: RIVER_ISLANDS.lat,
      lon: RIVER_ISLANDS.lon,
      timezone: RIVER_ISLANDS.timezone,
    },
    current: {
      timestamp: `${current.time}:00-07:00`,
      temperature: round(current.temperature_2m),
      feelsLike: round(current.apparent_temperature),
      condition: weatherCodeToCondition(current.weather_code),
      icon: weatherCodeToIcon(current.weather_code),
      humidity: round(current.relative_humidity_2m),
      windSpeed: round(current.wind_speed_10m, 1),
      windDirection: degreesToCompass(current.wind_direction_10m),
      uvIndex: round(current.uv_index, 1),
      visibility: round(current.visibility / 1609.34, 1),
      pressure: round(current.pressure_msl, 1),
      dewPoint: round(current.dew_point_2m),
    },
    hourly,
    daily,
    heatRisk: calcHeatRisk(hourly),
  };
}

export async function fetchLiveAirQualityData(
  staticHistory: Pick<AirQualityData, "history7d" | "history30d">
): Promise<AirQualityData> {
  const airQualityResponse = await fetchAirQualityResponse();
  const current = airQualityResponse.current;
  const aqi = round(current.us_aqi);
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: RIVER_ISLANDS.timezone,
  });

  const history7d = staticHistory.history7d.map((entry) =>
    entry.date === today
      ? { ...entry, aqi, category: getAqiCategory(aqi) }
      : entry
  );

  const history30d = staticHistory.history30d.map((entry) =>
    entry.date === today ? { ...entry, aqi } : entry
  );

  return {
    current: {
      aqi,
      category: getAqiCategory(aqi),
      primaryPollutant: getPrimaryPollutant(current),
      pm25: round(current.pm2_5, 1),
      pm10: round(current.pm10, 1),
      o3: round(current.ozone, 3),
      no2: round(current.nitrogen_dioxide, 3),
      timestamp: `${current.time}:00-07:00`,
    },
    history7d,
    history30d,
    trendAnalysis: buildTrendAnalysis(aqi),
    healthImpact: buildHealthImpact(aqi),
  };
}
