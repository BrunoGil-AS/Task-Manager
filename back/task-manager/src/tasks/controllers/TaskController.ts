import type { Request, Response } from "express";
import taskService from "../services/taskService.js";
import type { CreateTaskDTO, UpdateTaskDTO } from "../models/Task.js";
import { getRequestLogger } from "../../config/logger.js";
import type {
  TaskListResponseDTO,
  TaskResponseDTO,
  MessageResponseDTO,
} from "./TaskControllerDTOs.js";

type TaskStatusFilter = "all" | "pending" | "completed";
type TaskSortBy = "createdAt" | "updatedAt" | "title";
type TaskSortOrder = "asc" | "desc";

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

      // Pagination inputs with safe defaults and hard limit.
      const query = req.query ?? {};
      const page = Number((query as Record<string, unknown>).page ?? 1);
      const pageSize = Number(
        (query as Record<string, unknown>).pageSize ?? 20,
      );
      const safePage = Number.isFinite(page) && page > 0 ? page : 1;
      const safePageSize =
        Number.isFinite(pageSize) && pageSize > 0
          ? Math.min(pageSize, 100)
          : 20;
      const rawStatus = String((query as Record<string, unknown>).status ?? "all");
      const rawSortBy = String((query as Record<string, unknown>).sortBy ?? "createdAt");
      const rawSortOrder = String((query as Record<string, unknown>).sortOrder ?? "desc");

      const safeStatus: TaskStatusFilter =
        rawStatus === "pending" || rawStatus === "completed" ? rawStatus : "all";
      const safeSortBy: TaskSortBy =
        rawSortBy === "title" || rawSortBy === "updatedAt" ? rawSortBy : "createdAt";
      const safeSortOrder: TaskSortOrder = rawSortOrder === "asc" ? "asc" : "desc";

      const result = await taskService.getTasksByUser(userId, accessToken, {
        page: safePage,
        pageSize: safePageSize,
        status: safeStatus,
        sortBy: safeSortBy,
        sortOrder: safeSortOrder,
      });
      log.debug(
        {
          userId,
          count: result.data.length,
          page: safePage,
          status: safeStatus,
          sortBy: safeSortBy,
          sortOrder: safeSortOrder,
        },
        "tasks.getAll.ok",
      );
      const response: TaskListResponseDTO = {
        success: true,
        data: result.data,
        count: result.count,
        page: result.page,
        pageSize: result.pageSize,
      };
      res.status(200).json(response);
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
      const response: TaskResponseDTO = { success: true, data: task };
      res.status(200).json(response);
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

      const { title, description, completed } = req.body as CreateTaskDTO;

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
      if (typeof completed === "boolean") {
        taskData.completed = completed;
      }

      const newTask = await taskService.createTask(
        userId,
        taskData,
        accessToken,
      );
      log.info({ userId, taskId: newTask.id }, "tasks.create.ok");
      const response: TaskResponseDTO = {
        success: true,
        data: newTask,
        message: "Task created successfully",
      };
      res.status(201).json(response);
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
      const response: TaskResponseDTO = {
        success: true,
        data: updatedTask,
        message: "Task updated successfully",
      };
      res.status(200).json(response);
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
      const response: TaskResponseDTO = {
        success: true,
        data: updatedTask,
        message: "Task status toggled",
      };
      res.status(200).json(response);
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
      const response: MessageResponseDTO = {
        success: true,
        message: "Task deleted successfully",
      };
      res.status(200).json(response);
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
