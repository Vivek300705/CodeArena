import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});
