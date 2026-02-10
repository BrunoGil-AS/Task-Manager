import { createAuthenticatedClient } from "../../config/supabaseClient.js";
import type { Task } from "../../types/database.types.js";
import type { CreateTaskDTO, UpdateTaskDTO } from "../models/Task.js";
import { logger } from "../../config/logger.js";

export class TaskService {
  /**
   * Obtener todas las tareas de un usuario
   */
  async getTasksByUser(
    userId: string,
    accessToken: string,
    options: { page: number; pageSize: number } = { page: 1, pageSize: 20 },
  ): Promise<{ data: Task[]; count: number; page: number; pageSize: number }> {
    const log = logger.child({ userId, scope: "tasks.getAll" });
    // Start timer to flag slow queries.
    const start = process.hrtime.bigint();
    const supabase = createAuthenticatedClient(accessToken);
    // Pagination window for the current page.
    const from = (options.page - 1) * options.pageSize;
    const to = from + options.pageSize - 1;
    const { data, error, count } = await supabase
      .from("tasks")
      .select("*", {
        count: "exact",
      })
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const slowQueryMs = Number(process.env.SLOW_QUERY_MS ?? 200);

    if (error) {
      log.error(
        { code: error.code, message: error.message, durationMs },
        "supabase.error",
      );
      throw new Error(`Error fetching tasks: ${error.message}`);
    }

    if (durationMs >= slowQueryMs) {
      log.warn(
        {
          durationMs,
          slowQueryMs,
          page: options.page,
          pageSize: options.pageSize,
        },
        "supabase.slow_query",
      );
    }

    log.debug(
      { count: data?.length ?? 0, durationMs, page: options.page },
      "supabase.ok",
    );

    return {
      data: data || [],
      count: count ?? 0,
      page: options.page,
      pageSize: options.pageSize,
    };
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
    const start = process.hrtime.bigint();
    const supabase = createAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("owner_id", userId)
      .single();

    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const slowQueryMs = Number(process.env.SLOW_QUERY_MS ?? 200);

    if (error) {
      if (error.code === "PGRST116") {
        log.debug({ durationMs }, "supabase.not_found");
        return null; // No encontrado
      }
      log.error(
        { code: error.code, message: error.message, durationMs },
        "supabase.error",
      );
      throw new Error(`Error fetching task: ${error.message}`);
    }

    if (durationMs >= slowQueryMs) {
      log.warn({ durationMs, slowQueryMs }, "supabase.slow_query");
    }

    log.debug({ durationMs }, "supabase.ok");
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
    const start = process.hrtime.bigint();
    const supabase = createAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: taskData.title,
        description: taskData.description || null,
        owner_id: userId,
        completed: taskData.completed ?? false,
      })
      .select("*")
      .single();

    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const slowQueryMs = Number(process.env.SLOW_QUERY_MS ?? 200);

    if (error) {
      log.error(
        { code: error.code, message: error.message, durationMs },
        "supabase.error",
      );
      throw new Error(`Error creating task: ${error.message}`);
    }
    if (durationMs >= slowQueryMs) {
      log.warn({ durationMs, slowQueryMs }, "supabase.slow_query");
    }
    log.debug({ taskId: data?.id, durationMs }, "supabase.ok");
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
    const start = process.hrtime.bigint();
    const supabase = createAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("owner_id", userId)
      .select("*")
      .single();

    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const slowQueryMs = Number(process.env.SLOW_QUERY_MS ?? 200);

    if (error) {
      if (error.code === "PGRST116") {
        log.debug({ durationMs }, "supabase.not_found");
        return null;
      }
      log.error(
        { code: error.code, message: error.message, durationMs },
        "supabase.error",
      );
      throw new Error(`Error updating task: ${error.message}`);
    }

    if (durationMs >= slowQueryMs) {
      log.warn({ durationMs, slowQueryMs }, "supabase.slow_query");
    }
    log.debug({ durationMs }, "supabase.ok");
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
    const start = process.hrtime.bigint();
    const supabase = createAuthenticatedClient(accessToken);
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("owner_id", userId);

    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const slowQueryMs = Number(process.env.SLOW_QUERY_MS ?? 200);

    if (error) {
      log.error(
        { code: error.code, message: error.message, durationMs },
        "supabase.error",
      );
      throw new Error(`Error deleting task: ${error.message}`);
    }
    if (durationMs >= slowQueryMs) {
      log.warn({ durationMs, slowQueryMs }, "supabase.slow_query");
    }
    log.debug({ durationMs }, "supabase.ok");
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
