import type User from "../../users/model/User.js";
import type { Database } from "../../types/supabase.js";
export interface TaskDTO {
  id: number;
  owner: User;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateTaskDTO {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  completed?: boolean;
}
