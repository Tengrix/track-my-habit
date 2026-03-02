import { getTopics } from "@/app/actions/topics";
import { DashboardClient } from "@/components/DashboardClient";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardPage() {
  const topics = await getTopics();

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-10">
        <UserButton />
      </div>
      <DashboardClient topics={topics} />
    </div>
  );
}
