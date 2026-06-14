import { AppShell } from "@/components/AppShell";
import { CommunityContent } from "@/components/pages/CommunityContent";
import { getCommunityReports } from "@/lib/data";

export default async function CommunityPage() {
  const reports = await getCommunityReports();

  return (
    <AppShell>
      <CommunityContent initialReports={reports} />
    </AppShell>
  );
}
