import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type Props = {
  id: number;
  title: string;
  emoji: string;
  lastDate: number;
  tags: string[];
  recordAction: (id: number) => Promise<void>;
};

export const ActivityCard: FC<Props> = ({
  id,
  title,
  emoji,
  lastDate,
  tags = [],
  recordAction,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">{emoji}</span>
          <span className="text-base font-semibold text-slate-800">
            {title}
          </span>
          <span className="text-sm text-slate-600 ml-auto">
            前回から{lastDate}日経過
          </span>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <form action={recordAction.bind(null, id)}>
          <Button type="submit">記録する</Button>
        </form>
      </div>
    </div>
  );
};
