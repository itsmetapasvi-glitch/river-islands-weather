import { AppShell } from "@/components/AppShell";
import { DashboardContent } from "@/components/pages/DashboardContent";
import { getDashboardInsights, getActivityScores } from "@/lib/data";

export const revalidate = 3600;

export default async function DashboardPage() {
  const [insights, activities] = await Promise.all([
    getDashboardInsights(),
    getActivityScores(),
  ]);

  return (
    <AppShell>
      <DashboardContent insights={insights} activities={activities} />
    </AppShell>
  );
}
