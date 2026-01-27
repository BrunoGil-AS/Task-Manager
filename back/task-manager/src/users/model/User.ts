import type Task from "../../tasks/models/Task.js";

export default interface User {
  id: string;
  name: string;
  enabled: boolean;
}
