import type User from "../../users/model/User.js";

export default interface Task {
  id: number;
  owner: User;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
