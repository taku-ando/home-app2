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

export default function ProfilePage() {
  const activities: Omit<ActivityCardProps, "recordAction">[] = [
    { id: 1, title: "洗車", emoji: "🚗", lastDate: 1, tags: ["test"] },
    { id: 2, title: "洗車", emoji: "🚗", lastDate: 1, tags: ["test", "タグ"] },
    { id: 3, title: "洗車", emoji: "🚗", lastDate: 1, tags: [] },
    { id: 4, title: "洗車", emoji: "🚗", lastDate: 1, tags: [] },
  ];

  return (
    <div className="flex flex-col container h-full px-2 py-8 space-y-2 bg-sky-50">
      {activities.map((activity) => (
        <Link key={activity.id} href={`/activities/${activity.id}`}>
          <ActivityCard {...activity} recordAction={recordActivity} />
        </Link>
      ))}
    </div>
  );
}
