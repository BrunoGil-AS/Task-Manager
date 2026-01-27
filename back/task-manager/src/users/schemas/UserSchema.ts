import { z } from "zod";

// Reutilizamos el esquema de usuario
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
});
