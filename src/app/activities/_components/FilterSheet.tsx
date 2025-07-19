"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FilterSheetProps {
  availableTags: string[];
}

export function FilterSheet({ availableTags }: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedTag) {
      params.set("tag", selectedTag);
    } else {
      params.delete("tag");
    }

    const queryString = params.toString();
    router.push(`/activities${queryString ? `?${queryString}` : ""}`);
  };

  const resetFilter = () => {
    setSelectedTag("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    const queryString = params.toString();
    router.push(`/activities${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Search />
          フィルター
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>フィルター設定</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 p-4">
          {/* タグフィルター */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">タグでフィルター</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="tag"
                  value=""
                  checked={selectedTag === ""}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="rounded"
                />
                <span className="text-sm">すべて</span>
              </label>
              {availableTags.map((tag) => (
                <label key={tag} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="tag"
                    value={tag}
                    checked={selectedTag === tag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="rounded"
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
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
