import { ArrowDownWideNarrow } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ActivityCard,
  type Props as ActivityCardProps,
} from "./_components/ActivityCard";
import { FilterSheet } from "./_components/FilterSheet";

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

  // 複数タグフィルターに対応
  const selectedTags =
    typeof params.tags === "string"
      ? params.tags.split(",").filter(Boolean)
      : [];

  const activities: Omit<ActivityCardProps, "recordAction">[] = [
    { id: 1, title: "洗車", emoji: "🚗", lastDate: 1, tags: ["test"] },
    { id: 2, title: "洗車", emoji: "🚗", lastDate: 1, tags: ["test", "タグ"] },
    { id: 3, title: "洗車", emoji: "🚗", lastDate: 1, tags: [] },
    { id: 4, title: "洗車", emoji: "🚗", lastDate: 1, tags: [] },
  ];

  // 利用可能なタグを抽出
  const availableTags = Array.from(
    new Set(activities.flatMap((activity) => activity.tags))
  ).filter(Boolean);

  // フィルター処理（複数タグの場合は少なくとも一つのタグを含む）
  const filteredActivities =
    selectedTags.length > 0
      ? activities.filter((activity) =>
          selectedTags.some((tag) => activity.tags.includes(tag))
        )
      : activities;

  return (
    <div className="flex flex-col px-2 py-4 space-y-2">
      <section>
        <div className="flex justify-end gap-2">
          <FilterSheet
            availableTags={availableTags}
            hasActiveFilter={selectedTags.length > 0}
          />
          <Button size="sm" variant="outline">
            <ArrowDownWideNarrow />
            期限順
          </Button>
        </div>
      </section>
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
