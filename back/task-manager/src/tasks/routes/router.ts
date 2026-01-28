import { Router } from "express";
import taskController from "../controllers/TaskController.js";
import { validateBody } from "../middleware/validateBody.js";
import { createTaskSchema } from "../schemas/TaskSchema.js";

const router = Router();

// GET all tasks
router.get("/", taskController.getAllTasks);

// POST create task
router.post("/", validateBody(createTaskSchema), taskController.createTask);

// GET task by ID
router.get("/:id", taskController.getTaskById);

// PUT update task
router.put("/:id", taskController.updateTask);

// PATCH partial update
router.patch("/:id/toggle", taskController.toggleTask);

// DELETE task
router.delete("/:id", taskController.deleteTask);

export default router;
