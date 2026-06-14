import { AppShell } from "@/components/AppShell";
import { AirQualityContent } from "@/components/pages/AirQualityContent";
import { getAirQuality } from "@/lib/data";

export const revalidate = 3600;

export default async function AirQualityPage() {
  const airQuality = await getAirQuality();

  return (
    <AppShell>
      <AirQualityContent data={airQuality} />
    </AppShell>
  );
}
