import { AppShell } from "@/components/AppShell";
import { ActivityContent } from "@/components/pages/ActivityContent";
import { getActivityScores, getWeather, getAirQuality } from "@/lib/data";

export const revalidate = 3600;

export default async function ActivityPage() {
  const [activities, weather, airQuality] = await Promise.all([
    getActivityScores(),
    getWeather(),
    getAirQuality(),
  ]);

  return (
    <AppShell>
      <ActivityContent
        activities={activities}
        weather={weather}
        aqi={airQuality.current.aqi}
      />
    </AppShell>
  );
}
