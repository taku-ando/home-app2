"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FilterSheetProps {
  availableTags: string[];
  hasActiveFilter?: boolean;
}

export function FilterSheet({
  availableTags,
  hasActiveFilter = false,
}: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 複数タグ選択に対応
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagParam = searchParams.get("tags");
    return tagParam ? tagParam.split(",") : [];
  });

  // 優先度の選択状態（デフォルトはすべて選択）
  const [selectedPriorities, setSelectedPriorities] = useState({
    overdue: true,
    warning: true,
    good: true,
  });

  // 名前検索
  const [searchName, setSearchName] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const togglePriority = (priority: keyof typeof selectedPriorities) => {
    setSelectedPriorities((prev) => ({
      ...prev,
      [priority]: !prev[priority],
    }));
  };

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    } else {
      params.delete("tags");
    }

    const queryString = params.toString();
    router.push(`/activities${queryString ? `?${queryString}` : ""}`);
  };

  const resetFilter = () => {
    setSearchName("");
    setSelectedTags([]);
    setSelectedPriorities({
      overdue: true,
      warning: true,
      good: true,
    });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    const queryString = params.toString();
    router.push(`/activities${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant={hasActiveFilter ? "default" : "outline"}
          className={hasActiveFilter ? "bg-cyan-800" : ""}
        >
          <Search />
          フィルター
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>フィルター</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">名前で検索</h3>
            <input
              type="text"
              placeholder="名前で絞り込み"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">タグで絞り込み</h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedTags.includes(tag) &&
                      "border-cyan-600 bg-cyan-100 text-cyan-900"
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">優先度で絞り込み</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPriorities.overdue}
                  onChange={() => togglePriority("overdue")}
                  className="rounded"
                />
                <Badge
                  variant="outline"
                  className="bg-red-300 border-red-600 text-red-900"
                >
                  期限超過
                </Badge>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPriorities.warning}
                  onChange={() => togglePriority("warning")}
                  className="rounded"
                />
                <Badge
                  variant="outline"
                  className="bg-yellow-300 border-yellow-600 text-yellow-900"
                >
                  注意
                </Badge>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPriorities.good}
                  onChange={() => togglePriority("good")}
                  className="rounded"
                />
                <Badge
                  variant="outline"
                  className="bg-green-300 border-green-600 text-green-900"
                >
                  良好
                </Badge>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <SheetClose asChild>
              <Button onClick={applyFilter} className="flex-1">
                適用
              </Button>
            </SheetClose>
            <Button variant="outline" onClick={resetFilter} className="flex-1">
              リセット
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
