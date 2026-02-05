export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTaskPayload = Pick<Task, 'title' | 'description' | 'completed'>;
