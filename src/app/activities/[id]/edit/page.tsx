import { redirect } from "next/navigation";
import type { ActivityFormData } from "@/lib/schemas/activity";
import { ActivityForm } from "../../_components/ActivityForm";

export type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function updateActivity(id: string, data: ActivityFormData) {
  "use server";

  console.log("アクティビティ更新:", { id, data });

  // TODO: 実際のAPI更新処理をここに追加
  // await updateActivityAPI(id, data);

  redirect(`/activities/${id}`);
}

export default async function EditActivityPage({ params }: Props) {
  const { id } = await params;

  // TODO: 実際のAPI呼び出しでデータを取得
  // const activity = await getActivityById(id);

  // モックデータ（将来的にAPIから取得）
  const activity: ActivityFormData = {
    emoji: "🚗",
    name: "洗車",
    deadline: 30,
    tags: ["メンテナンス", "車"],
    isShared: true,
  };

  const handleSubmit = updateActivity.bind(null, id);

  return (
    <div className="flex flex-col px-2 py-4">
      <ActivityForm
        mode="edit"
        initialData={activity}
        onSubmit={handleSubmit}
        title="アクティビティを編集"
      />
    </div>
  );
}
