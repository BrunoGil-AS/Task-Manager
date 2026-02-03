import type { CreateUserDTO as User } from "../model/User.js";

export const users: User[] = [
  {
    id: "bg-" + 1,
    name: "Bruno Gil",
    enabled: true,
  },
];

let nextId = 2;

export function getNextId(): number {
  return nextId++;
}
