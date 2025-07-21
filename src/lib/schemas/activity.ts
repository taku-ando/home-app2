import { z } from "zod";

export const activitySchema = z.object({
  emoji: z
    .string()
    .min(1, "アイコンを選択してください")
    .max(1, "アイコンは1文字で入力してください"),
  name: z
    .string()
    .min(1, "アクティビティ名を入力してください")
    .max(50, "アクティビティ名は50文字以内で入力してください"),
  deadline: z
    .number()
    .int("整数で入力してください")
    .min(1, "1日以上で設定してください")
    .max(365, "365日以内で設定してください")
    .nullable(),
  tags: z.array(z.string().min(1).max(20)).default([]),
  isShared: z.boolean().default(true),
});

export type ActivityFormData = z.infer<typeof activitySchema>;
