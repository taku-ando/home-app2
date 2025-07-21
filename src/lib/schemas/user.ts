import { z } from "zod";

export const userSchema = z.object({
  id: z.number().int().positive(),
  googleId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  googleId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export type User = z.infer<typeof userSchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
