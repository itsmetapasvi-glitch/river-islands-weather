export interface WeatherInputs {
  temperature: number;
  aqi: number;
  uvIndex: number;
  windSpeed: number;
  humidity: number;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function scoreTemperature(temp: number): number {
  const idealMin = 65;
  const idealMax = 78;
  if (temp >= idealMin && temp <= idealMax) return 100;
  if (temp < idealMin) {
    const diff = idealMin - temp;
    return clamp(100 - diff * 4);
  }
  const diff = temp - idealMax;
  return clamp(100 - diff * 5);
}

function scoreAqi(aqi: number): number {
  if (aqi <= 50) return 100;
  if (aqi <= 100) return clamp(100 - (aqi - 50) * 1.2);
  if (aqi <= 150) return clamp(40 - (aqi - 100) * 0.8);
  return clamp(10 - (aqi - 150) * 0.2);
}

function scoreUv(uv: number): number {
  if (uv <= 2) return 85;
  if (uv <= 5) return 100;
  if (uv <= 7) return 80;
  if (uv <= 10) return 50;
  return 25;
}

function scoreWind(wind: number): number {
  if (wind >= 4 && wind <= 12) return 100;
  if (wind < 4) return clamp(60 + wind * 10);
  if (wind <= 18) return clamp(100 - (wind - 12) * 8);
  return clamp(20 - (wind - 18) * 3);
}

function scoreHumidity(humidity: number): number {
  if (humidity >= 30 && humidity <= 60) return 100;
  if (humidity < 30) return clamp(70 + humidity);
  return clamp(100 - (humidity - 60) * 2);
}

export function calcComfortScore(inputs: WeatherInputs): number {
  const weights = {
    temperature: 0.3,
    aqi: 0.25,
    uv: 0.2,
    wind: 0.15,
    humidity: 0.1,
  };

  const scores = {
    temperature: scoreTemperature(inputs.temperature),
    aqi: scoreAqi(inputs.aqi),
    uv: scoreUv(inputs.uvIndex),
    wind: scoreWind(inputs.windSpeed),
    humidity: scoreHumidity(inputs.humidity),
  };

  const total =
    scores.temperature * weights.temperature +
    scores.aqi * weights.aqi +
    scores.uv * weights.uv +
    scores.wind * weights.wind +
    scores.humidity * weights.humidity;

  return clamp(total);
}

export function getComfortLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 30) return "Poor";
  return "Stay Inside";
}

export function getBestTimeToGoOutside(
  hourly: Array<{ hour: string; temp: number; aqi: number; uv: number; wind: number; humidity: number }>
): { time: string; score: number; reason: string } {
  let best = { time: "", score: 0, reason: "" };

  for (const h of hourly) {
    const score = calcComfortScore({
      temperature: h.temp,
      aqi: h.aqi,
      uvIndex: h.uv,
      windSpeed: h.wind,
      humidity: h.humidity,
    });
    if (score > best.score) {
      best = {
        time: h.hour,
        score,
        reason: generateTimeReason(h, score),
      };
    }
  }

  const nextHour = hourly.find((h) => h.hour === best.time);
  const idx = hourly.indexOf(nextHour!);
  const endHour = hourly[Math.min(idx + 2, hourly.length - 1)]?.hour ?? best.time;

  return {
    time: `${best.time} – ${endHour}`,
    score: best.score,
    reason: best.reason,
  };
}

function generateTimeReason(
  hour: { temp: number; aqi: number; uv: number },
  score: number
): string {
  if (score >= 85) {
    return `Ideal conditions at ${hour.temp}°F with AQI ${hour.aqi} and UV ${hour.uv}. Perfect window for outdoor activities.`;
  }
  if (score >= 70) {
    return `Comfortable ${hour.temp}°F with manageable UV. Good time for most outdoor plans.`;
  }
  return `Acceptable conditions but monitor heat and air quality during this window.`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#3B82F6";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}
