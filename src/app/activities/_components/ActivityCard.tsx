import Link from "next/link";
import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityCardButton } from "./ActivityCardSubmitButton";

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
            <Link key={tag} href={`/activities?tag=${encodeURIComponent(tag)}`}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-slate-100"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <form action={recordAction.bind(null, id)}>
          <ActivityCardButton />
        </form>
        <Button asChild>
          <Link href={`/activities/${id}`}>詳細</Link>
        </Button>
      </div>
    </div>
  );
};
