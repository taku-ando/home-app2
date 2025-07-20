import { Button } from "@/components/ui/button";

export const ActivityHistoryCard = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl p-4 border-1">
      <div className="flex justify-between items-center">
        <span>2024年1月15日</span>
        <div>
          <Button variant="outline" size="sm">
            編集
          </Button>
        </div>
      </div>
      <div>メモの内容</div>
      <div className="text-sm text-slate-400">35日前・登録者: ユーザー名</div>
    </div>
  );
};
