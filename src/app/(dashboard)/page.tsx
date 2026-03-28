import { auth } from "@clerk/nextjs/server";
import { getTopics } from "@/app/actions/topics";
import { DashboardClient } from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  const isDemo = !userId;
  const topics = userId ? await getTopics() : [];

  return <DashboardClient topics={topics} isDemo={isDemo} />;
}
