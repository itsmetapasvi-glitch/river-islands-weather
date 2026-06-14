import { AppShell } from "@/components/AppShell";
import { ForecastContent } from "@/components/pages/ForecastContent";
import { getWeather, getAirQuality } from "@/lib/data";

export const revalidate = 3600;

export default async function ForecastPage() {
  const [weather, airQuality] = await Promise.all([
    getWeather(),
    getAirQuality(),
  ]);

  return (
    <AppShell>
      <ForecastContent weather={weather} airQuality={airQuality} />
    </AppShell>
  );
}
