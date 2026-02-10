import type { Task } from "../../types/database.types.js";

export type TaskListResponseDTO = {
  success: true;
  data: Task[];
  count: number;
  page: number;
  pageSize: number;
};

export type TaskResponseDTO = {
  success: true;
  data: Task;
  message?: string;
};

export type MessageResponseDTO = {
  success: true;
  message: string;
};
