"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PRESET_EMOJIS = [
  "🏃‍♂️",
  "🚗",
  "🏠",
  "🧽",
  "📚",
  "💊",
  "🍎",
  "💻",
  "🎮",
  "🎵",
  "🏋️‍♂️",
  "🚿",
  "🍽️",
  "☕",
  "🛏️",
  "📱",
  "🧹",
  "🌱",
  "🎨",
  "📝",
  "🔧",
  "🧺",
  "🍳",
  "🚶‍♂️",
  "🏃‍♀️",
  "🧘‍♂️",
  "🧘‍♀️",
  "🎯",
  "🧸",
  "🧼",
  "💧",
  "🔋",
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handlePresetSelect = (emoji: string) => {
    onChange(emoji);
    // setIsOpen(false);
  };

  const handleCustomSubmit = () => {
    if (customInput.trim() && customInput.trim().length === 1) {
      onChange(customInput.trim());
      setCustomInput("");
      setIsOpen(false);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 1) {
      setCustomInput(value);
    }
  };

  return (
    <div className={cn("", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 text-2xl p-0"
          >
            {value || "😊"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* プリセット絵文字セクション */}
            <div>
              <Label className="text-sm font-medium">プリセット絵文字</Label>
              <div className="grid grid-cols-8 gap-2 mt-2 max-h-48 overflow-y-auto">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handlePresetSelect(emoji)}
                    className={cn(
                      "h-10 w-10 text-xl hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center",
                      value === emoji && "bg-blue-100 ring-2 ring-blue-500"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 区切り線 */}
            <hr className="border-gray-200" />

            {/* カスタム入力セクション */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">カスタム入力</Label>
              <div className="flex gap-2">
                <Input
                  value={customInput}
                  onChange={handleCustomInputChange}
                  placeholder="1文字入力"
                  className="flex-1"
                  maxLength={1}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCustomSubmit}
                  disabled={!customInput.trim()}
                >
                  適用
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
