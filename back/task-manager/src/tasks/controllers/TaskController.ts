import type { Request, Response } from "express";
import taskService from "../services/taskService.js";
import type { CreateTaskDTO, UpdateTaskDTO } from "../models/Task.js";
import { getRequestLogger } from "../../config/logger.js";

export class TaskController {
  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const log = getRequestLogger(req);
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        log.warn({ hasUser: Boolean(userId) }, "tasks.getAll.unauthorized");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const tasks = await taskService.getTasksByUser(userId, accessToken);
      log.debug({ userId, count: tasks.length }, "tasks.getAll.ok");
      res.status(200).json({ success: true, data: tasks, count: tasks.length });
    } catch (error) {
      const log = getRequestLogger(req);
      log.error({ err: error }, "tasks.getAll.error");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const log = getRequestLogger(req);
      const userId = req.user?.sub;
      const taskId = req.params.id ? parseInt(req.params.id) : NaN;

      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        log.warn({ hasUser: Boolean(userId) }, "tasks.getById.unauthorized");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(taskId)) {
        log.warn({ rawId: req.params.id }, "tasks.getById.invalid_id");
        res.status(400).json({ error: "Invalid task ID" });
        return;
      }

      const task = await taskService.getTaskById(taskId, userId, accessToken);
      if (!task) {
        log.warn({ userId, taskId }, "tasks.getById.not_found");
        res.status(404).json({ error: "Task not found" });
        return;
      }

      log.debug({ userId, taskId }, "tasks.getById.ok");
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      const log = getRequestLogger(req);
      log.error({ err: error }, "tasks.getById.error");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const log = getRequestLogger(req);
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        log.warn({ hasUser: Boolean(userId) }, "tasks.create.unauthorized");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { title, description } = req.body as CreateTaskDTO;

      if (!title?.trim()) {
        log.warn({ userId }, "tasks.create.missing_title");
        res.status(400).json({ error: "Title is required" });
        return;
      }

      const taskData: CreateTaskDTO = {
        title: title.trim(),
      };

      if (typeof description === "string" && description.trim().length > 0) {
        taskData.description = description.trim();
      }

      const newTask = await taskService.createTask(
        userId,
        taskData,
        accessToken,
      );
      log.info({ userId, taskId: newTask.id }, "tasks.create.ok");
      res.status(201).json({
        success: true,
        data: newTask,
        message: "Task created successfully",
      });
    } catch (error) {
      const log = getRequestLogger(req);
      log.error({ err: error }, "tasks.create.error");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const log = getRequestLogger(req);
      const userId = req.user?.sub;
      const taskId = req.params.id ? parseInt(req.params.id) : NaN;

      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        log.warn({ hasUser: Boolean(userId) }, "tasks.update.unauthorized");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(taskId)) {
        log.warn({ rawId: req.params.id }, "tasks.update.invalid_id");
        res.status(400).json({ error: "Invalid task ID" });
        return;
      }

      const { title, description, completed } = req.body;
      const updateData: UpdateTaskDTO = {};

      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined)
        updateData.description = description?.trim() || null;
      if (completed !== undefined) updateData.completed = completed;

      if (Object.keys(updateData).length === 0) {
        log.warn({ userId, taskId }, "tasks.update.no_data");
        res.status(400).json({ error: "No data to update" });
        return;
      }

      const updatedTask = await taskService.updateTask(
        taskId,
        userId,
        updateData,
        accessToken,
      );
      if (!updatedTask) {
        log.warn({ userId, taskId }, "tasks.update.not_found");
        res.status(404).json({ error: "Task not found" });
        return;
      }

      log.info({ userId, taskId }, "tasks.update.ok");
      res.status(200).json({
        success: true,
        data: updatedTask,
        message: "Task updated successfully",
      });
    } catch (error) {
      const log = getRequestLogger(req);
      log.error({ err: error }, "tasks.update.error");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async toggleTask(req: Request, res: Response): Promise<void> {
    try {
      const log = getRequestLogger(req);
      const userId = req.user?.sub;
      const taskId = req.params.id ? parseInt(req.params.id) : NaN;

      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        log.warn({ hasUser: Boolean(userId) }, "tasks.toggle.unauthorized");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(taskId)) {
        log.warn({ rawId: req.params.id }, "tasks.toggle.invalid_id");
        res.status(400).json({ error: "Invalid task ID" });
        return;
      }

      const updatedTask = await taskService.toggleTaskCompletion(
        taskId,
        userId,
        accessToken,
      );
      if (!updatedTask) {
        log.warn({ userId, taskId }, "tasks.toggle.not_found");
        res.status(404).json({ error: "Task not found" });
        return;
      }

      log.info({ userId, taskId }, "tasks.toggle.ok");
      res.status(200).json({
        success: true,
        data: updatedTask,
        message: "Task status toggled",
      });
    } catch (error) {
      const log = getRequestLogger(req);
      log.error({ err: error }, "tasks.toggle.error");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const log = getRequestLogger(req);
      const userId = req.user?.sub;
      const taskId = req.params.id ? parseInt(req.params.id) : NaN;

      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        log.warn({ hasUser: Boolean(userId) }, "tasks.delete.unauthorized");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(taskId)) {
        log.warn({ rawId: req.params.id }, "tasks.delete.invalid_id");
        res.status(400).json({ error: "Invalid task ID" });
        return;
      }

      await taskService.deleteTask(taskId, userId, accessToken);
      log.info({ userId, taskId }, "tasks.delete.ok");
      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      const log = getRequestLogger(req);
      log.error({ err: error }, "tasks.delete.error");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new TaskController();
