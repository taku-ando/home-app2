import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type PrioritySelection = {
  overdue: boolean;
  warning: boolean;
  good: boolean;
  none: boolean;
};

export type UseActivityFilterResult = {
  selectedTags: string[];
  selectedPriorities: PrioritySelection;
  searchName: string;
  toggleTag: (tag: string) => void;
  togglePriority: (priority: keyof PrioritySelection) => void;
  setSearchName: (name: string) => void;
  applyFilter: () => void;
  resetFilter: () => void;
};

export function useActivityFilter(): UseActivityFilterResult {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagParam = searchParams.get("tags");
    return tagParam ? tagParam.split(",") : [];
  });

  const [selectedPriorities, setSelectedPriorities] =
    useState<PrioritySelection>({
      overdue: true,
      warning: true,
      good: true,
      none: true,
    });

  const [searchName, setSearchName] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const togglePriority = (priority: keyof PrioritySelection) => {
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
      none: true,
    });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    const queryString = params.toString();
    router.push(`/activities${queryString ? `?${queryString}` : ""}`);
  };

  return {
    selectedTags,
    selectedPriorities,
    searchName,
    toggleTag,
    togglePriority,
    setSearchName,
    applyFilter,
    resetFilter,
  };
}
