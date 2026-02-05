import { createAuthenticatedClient } from "../../config/supabaseClient.js";
import type { Task } from "../../types/database.types.js";
import type { CreateTaskDTO, UpdateTaskDTO } from "../models/Task.js";
import { logger } from "../../config/logger.js";

export class TaskService {
  /**
   * Obtener todas las tareas de un usuario
   */
  async getTasksByUser(userId: string, accessToken: string): Promise<Task[]> {
    const log = logger.child({ userId, scope: "tasks.getAll" });
    const supabase = createAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      log.error({ code: error.code, message: error.message }, "supabase.error");
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
    log.debug({ count: data?.length ?? 0 }, "supabase.ok");
    return data || [];
  }

  /**
   * Obtener una tarea por ID
   */
  async getTaskById(
    taskId: number,
    userId: string,
    accessToken: string,
  ): Promise<Task | null> {
    const log = logger.child({ userId, taskId, scope: "tasks.getById" });
    const supabase = createAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("owner_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        log.debug("supabase.not_found");
        return null; // No encontrado
      }
      log.error({ code: error.code, message: error.message }, "supabase.error");
      throw new Error(`Error fetching task: ${error.message}`);
    }

    log.debug("supabase.ok");
    return data;
  }

  /**
   * Crear una nueva tarea
   */
  async createTask(
    userId: string,
    taskData: CreateTaskDTO,
    accessToken: string,
  ): Promise<Task> {
    const log = logger.child({ userId, scope: "tasks.create" });
    const supabase = createAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: taskData.title,
        description: taskData.description || null,
        owner_id: userId,
      })
      .select()
      .single();

    if (error) {
      log.error({ code: error.code, message: error.message }, "supabase.error");
      throw new Error(`Error creating task: ${error.message}`);
    }
    log.debug({ taskId: data?.id }, "supabase.ok");
    return data;
  }

  /**
   * Actualizar una tarea
   */
  async updateTask(
    taskId: number,
    userId: string,
    updateData: UpdateTaskDTO,
    accessToken: string,
  ): Promise<Task | null> {
    const log = logger.child({ userId, taskId, scope: "tasks.update" });
    const supabase = createAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("owner_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        log.debug("supabase.not_found");
        return null;
      }
      log.error({ code: error.code, message: error.message }, "supabase.error");
      throw new Error(`Error updating task: ${error.message}`);
    }

    log.debug("supabase.ok");
    return data;
  }

  /**
   * Eliminar una tarea
   */
  async deleteTask(
    taskId: number,
    userId: string,
    accessToken: string,
  ): Promise<boolean> {
    const log = logger.child({ userId, taskId, scope: "tasks.delete" });
    const supabase = createAuthenticatedClient(accessToken);
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("owner_id", userId);

    if (error) {
      log.error({ code: error.code, message: error.message }, "supabase.error");
      throw new Error(`Error deleting task: ${error.message}`);
    }
    log.debug("supabase.ok");
    return true;
  }

  /**
   * Alternar estado completado
   */
  async toggleTaskCompletion(
    taskId: number,
    userId: string,
    accessToken: string,
  ): Promise<Task | null> {
    const log = logger.child({ userId, taskId, scope: "tasks.toggle" });
    // Primero obtenemos la tarea
    const task = await this.getTaskById(taskId, userId, accessToken);
    if (!task) {
      log.debug("task.not_found");
      return null;
    }

    // Alternamos el estado
    return this.updateTask(
      taskId,
      userId,
      {
        completed: !task.completed,
      },
      accessToken,
    );
  }
}

export default new TaskService();
