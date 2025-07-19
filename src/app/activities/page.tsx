import Link from "next/link";
import {
  ActivityCard,
  type Props as ActivityCardProps,
} from "./_components/ActivityCard";

async function recordActivity(id: number) {
  "use server";
  console.log("Activity recorded:", id);
  // ここに実際の記録処理を追加
}

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProfilePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedTag = typeof params.tag === "string" ? params.tag : undefined;

  const activities: Omit<ActivityCardProps, "recordAction">[] = [
    { id: 1, title: "洗車", emoji: "🚗", lastDate: 1, tags: ["test"] },
    { id: 2, title: "洗車", emoji: "🚗", lastDate: 1, tags: ["test", "タグ"] },
    { id: 3, title: "洗車", emoji: "🚗", lastDate: 1, tags: [] },
    { id: 4, title: "洗車", emoji: "🚗", lastDate: 1, tags: [] },
  ];

  const filteredActivities = selectedTag
    ? activities.filter((activity) => activity.tags.includes(selectedTag))
    : activities;

  return (
    <div className="flex flex-col px-2 py-4 space-y-2">
      {selectedTag && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              タグ「{selectedTag}」でフィルタ中
            </span>
            <Link
              href="/activities"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              フィルタを解除
            </Link>
          </div>
        </div>
      )}
      <section className="flex flex-col gap-4">
        {filteredActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            {...activity}
            recordAction={recordActivity}
          />
        ))}
      </section>
    </div>
  );
}
