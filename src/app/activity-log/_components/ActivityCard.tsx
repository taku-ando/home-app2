import { ChevronRight, CircleCheck, Clock3 } from "lucide-react";

export const ActivityCard = () => {
  return (
    <div className="bg-white py-3 px-3 rounded-md shadow-xs flex items-center gap-3">
      <div className="size-10 rounded-full bg-slate-100 text-center">
        <span className="text-2xl">🚗</span>
      </div>
      <div className="mr-auto">
        <div>
          <span>洗車</span>
        </div>
        <div className="inline-flex items-center gap-1 size text-sm text-slate-400">
          <Clock3 size="14px" />
          <span>2025/12/31・10日経過</span>
        </div>
      </div>
      <div>
        <CircleCheck className="size-8 text-green-500" />
      </div>
      <div>
        <ChevronRight className="size-10 text-slate-400" />
      </div>
    </div>
  );
};
