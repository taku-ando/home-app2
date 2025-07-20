import { redirect } from "next/navigation";
import type { ActivityFormData } from "@/lib/validations/activity";
import { ActivityForm } from "../_components/ActivityForm";

async function createActivity(data: ActivityFormData) {
  "use server";

  console.log("フォームデータ:", data);

  // TODO: 実際のAPI送信処理をここに追加
  // await createActivityAPI(data);

  redirect("/activities");
}

export default function NewActivityPage() {
  return (
    <div className="flex flex-col px-2 py-4">
      <ActivityForm mode="create" onSubmit={createActivity} />
    </div>
  );
}
