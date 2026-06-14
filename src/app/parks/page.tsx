import { AppShell } from "@/components/AppShell";
import { ParksContent } from "@/components/pages/ParksContent";
import { getParks } from "@/lib/data";

export const revalidate = 3600;

export default async function ParksPage() {
  const parks = await getParks();

  return (
    <AppShell>
      <ParksContent parks={parks} />
    </AppShell>
  );
}
