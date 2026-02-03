import type { Request, Response } from "express";
import taskService from "../services/taskService.js";
import type { CreateTaskDTO, UpdateTaskDTO } from "../models/Task.js";

export class TaskController {
  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const tasks = await taskService.getTasksByUser(userId, accessToken);
      res.status(200).json({ success: true, data: tasks, count: tasks.length });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const taskId = req.params.id ? parseInt(req.params.id) : NaN;

      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(taskId)) {
        res.status(400).json({ error: "Invalid task ID" });
        return;
      }

      const task = await taskService.getTaskById(taskId, userId, accessToken);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { title, description } = req.body as CreateTaskDTO;

      if (!title?.trim()) {
        res.status(400).json({ error: "Title is required" });
        return;
      }

      const taskData: CreateTaskDTO = {
        title: title.trim(),
        description: description!.trim(),
      };

      const newTask = await taskService.createTask(
        userId,
        taskData,
        accessToken,
      );
      res.status(201).json({
        success: true,
        data: newTask,
        message: "Task created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const taskId = req.params.id ? parseInt(req.params.id) : NaN;

      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(taskId)) {
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
        res.status(404).json({ error: "Task not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedTask,
        message: "Task updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async toggleTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const taskId = req.params.id ? parseInt(req.params.id) : NaN;

      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(taskId)) {
        res.status(400).json({ error: "Invalid task ID" });
        return;
      }

      const updatedTask = await taskService.toggleTaskCompletion(
        taskId,
        userId,
        accessToken,
      );
      if (!updatedTask) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedTask,
        message: "Task status toggled",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const taskId = req.params.id ? parseInt(req.params.id) : NaN;

      const accessToken = req.user?.accessToken; // ← Extraer token

      if (!userId || !accessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(taskId)) {
        res.status(400).json({ error: "Invalid task ID" });
        return;
      }

      await taskService.deleteTask(taskId, userId, accessToken);
      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new TaskController();
