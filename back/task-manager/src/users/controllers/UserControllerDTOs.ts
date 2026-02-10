import type { User } from "../../types/supabase.js";

export type UserResponseDTO = {
  success: true;
  data: User;
  message?: string;
};
