// controllers/taskController.ts
import { type Request, type Response } from "express";
import type Task from "../models/Task.js";
import { tasks, getNextId } from "../data/tasks.js";
import { users } from "../../users/data/users.js";

export const taskController = {
  // GET all tasks
  getAllTasks: (req: Request, res: Response): void => {
    // Pagination support
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;

    const paginatedTasks = tasks.slice(startIndex, startIndex + limit);

    res.json({
      data: paginatedTasks,
      pagination: {
        page,
        limit,
        total: tasks.length,
      },
    });
  },

  // GET task by ID
  getTaskById: (req: Request, res: Response): void => {
    const task = tasks.find((t) => t.id === parseInt(req.params.id!));

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(task);
  },

  // POST create task
  createTask: (req: Request, res: Response): void => {
    const { title, description, owner, completed } = req.body;

    if (!users.some((u) => u.id === owner.id)) {
      users.push(owner);
    }
    // Validation
    if (!title || title.trim() === "") {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const newTask: Task = {
      id: getNextId(),
      owner,
      title,
      description,
      completed: typeof completed === "boolean" ? completed : false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  },

  // PUT update task
  updateTask: (req: Request, res: Response): void => {
    const task = tasks.find((t) => t.id === parseInt(req.params.id!));

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    if (req.body.title) task.title = req.body.title;
    if (req.body.description !== undefined)
      task.description = req.body.description;
    if (req.body.completed !== undefined) task.completed = req.body.completed;
    task.updatedAt = new Date();

    res.json(task);
  },

  // PATCH partial update
  partialUpdateTask: (req: Request, res: Response): void => {
    const task = tasks.find((t) => t.id === parseInt(req.params.id!));

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Update only provided fields
    Object.assign(task, {
      ...req.body,
      updatedAt: new Date(),
      id: task.id, // Don't allow ID change
    });

    res.json(task);
  },

  // DELETE task
  deleteTask: (req: Request, res: Response): void => {
    const index = tasks.findIndex((t) => t.id === parseInt(req.params.id!));

    if (index === -1) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const deletedTask = tasks.splice(index, 1)[0];
    res.json({ message: "Task deleted", task: deletedTask });
  },
};
