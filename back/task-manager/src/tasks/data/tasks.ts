import { users } from "../../users/data/users.js";
import type Task from "../models/Task.js";

export const tasks: Task[] = [
  {
    id: 1,
    owner: users[0]!,
    title: "Learn Express",
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let nextId = 2;

export function getNextId(): number {
  return nextId++;
}
