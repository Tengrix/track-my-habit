import { getTopics } from "@/app/actions/topics";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const topics = await getTopics();

  return <DashboardClient topics={topics} />;
}
