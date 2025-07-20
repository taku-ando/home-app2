"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  type ActivityFormData,
  activitySchema,
} from "@/lib/validations/activity";
import { EmojiPicker } from "./EmojiPicker";
import { TagInput } from "./TagInput";

interface ActivityFormProps {
  mode?: "create" | "edit";
  initialData?: Partial<ActivityFormData>;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  title?: string;
}

export function ActivityForm({
  mode = "create",
  initialData,
  onSubmit,
  title,
}: ActivityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noDeadline, setNoDeadline] = useState(initialData?.deadline === null);

  const form = useForm<ActivityFormData>({
    resolver: standardSchemaResolver(activitySchema),
    defaultValues: {
      emoji: initialData?.emoji || "",
      name: initialData?.name || "",
      deadline: initialData?.deadline || null,
      tags: initialData?.tags || [],
      isShared: initialData?.isShared ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        emoji: initialData.emoji || "",
        name: initialData.name || "",
        deadline: initialData.deadline || null,
        tags: initialData.tags || [],
        isShared: initialData.isShared ?? true,
      });
      setNoDeadline(initialData.deadline === null);
    }
  }, [initialData, form]);

  const handleSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      router.push("/activities");
    } catch (error) {
      console.error("アクティビティの処理に失敗しました:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoDeadlineChange = (checked: boolean) => {
    setNoDeadline(checked);
    if (checked) {
      form.setValue("deadline", null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <h1 className="text-xl font-bold text-slate-800 mb-6">
        {title ||
          (mode === "edit"
            ? "アクティビティを編集"
            : "新しいアクティビティを追加")}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="emoji"
            render={({ field }) => (
              <FormItem>
                <FormLabel>アイコン</FormLabel>
                <FormControl>
                  <EmojiPicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>アクティビティ名</FormLabel>
                <FormControl>
                  <Input placeholder="例: 洗車、読書、運動など" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Label>期限設定</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="no-deadline"
                checked={noDeadline}
                onCheckedChange={handleNoDeadlineChange}
              />
              <Label htmlFor="no-deadline" className="text-sm font-normal">
                期限なし
              </Label>
            </div>

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="日数"
                        min={1}
                        max={365}
                        value={noDeadline ? "" : field.value || ""}
                        onChange={(e) => {
                          if (!noDeadline) {
                            const value = e.target.value;
                            field.onChange(value ? Number(value) : null);
                          }
                        }}
                        disabled={noDeadline}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">日後</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タグ</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isShared"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">共有設定</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {field.value
                      ? "同じグループ内の人が見ることができます"
                      : "自分だけが見ることができます"}
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-cyan-800 hover:bg-cyan-900"
            >
              {isSubmitting
                ? mode === "edit"
                  ? "更新中..."
                  : "作成中..."
                : mode === "edit"
                  ? "更新"
                  : "作成"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
