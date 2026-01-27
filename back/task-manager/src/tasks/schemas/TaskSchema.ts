import { z } from "zod";
import { userSchema } from "../../users/schemas/UserSchema.js";

export const createTaskSchema = z.object({
  owner: userSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});
