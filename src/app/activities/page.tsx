import { ActivityCard } from "./_components/ActivityCard";

export default function ProfilePage() {
  const activities = [
    { id: 1, title: "洗車" },
    { id: 2, title: "洗車" },
    { id: 3, title: "洗車" },
    { id: 4, title: "洗車" },
  ];

  return (
    <div className="container h-full mx-auto px-2 py-8 space-y-2 bg-neutral-50">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          id={activity.id}
          title={activity.title}
        />
      ))}
    </div>
  );
}
