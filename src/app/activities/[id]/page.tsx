import { Calendar, Share, Tags, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActivityHistoryCard } from "./_components/ActivityHistoryCard";

export type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  console.log("id: ", { id });

  const activity = {
    name: "洗車",
    emoji: "🚗",
  };

  return (
    <div className="flex flex-col gap-6 px-2 py-4 space-y-2">
      <section className="flex flex-col gap-5 bg-white rounded-2xl p-4 border-1">
        <div>
          <div className="text-sm text-slate-400 pb-1">アクティビティ名</div>
          <div className="font-bold">
            {activity.emoji} {activity.name}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-400 pb-1 flex items-center gap-1">
            <Timer className="size-3.5" />
            次回期限まで
          </div>
          <div className="font-bold">あと12日</div>
        </div>
        <div>
          <div className="text-sm text-slate-400 pb-1 flex items-center gap-1">
            <Calendar className="size-3.5" />
            <span>期限設定</span>
          </div>
          <div className="font-bold">30日ごと</div>
        </div>
        <div>
          <div className="text-sm text-slate-400 pb-1 flex items-center gap-1">
            <Tags className="size-3.5" />
            タグ
          </div>
          <div>
            <Badge variant="outline">タグ</Badge>
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-400 pb-1 flex items-center gap-1">
            <Share className="size-3.5" />
            <span>共有設定</span>
          </div>
          <div className="font-bold">共有</div>
        </div>
      </section>
      <section>
        <h2 className="font-bold text-xl">実行履歴</h2>
        <div className="flex flex-col gap-3 mt-2">
          <ActivityHistoryCard />
          <ActivityHistoryCard />
          <ActivityHistoryCard />
        </div>
      </section>
    </div>
  );
}
