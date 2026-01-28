import supabase from "../../config/supabaseClient.js";
import type { Task } from "../../types/database.types.js";
import type { CreateTaskDTO, UpdateTaskDTO } from "../models/Task.js";

export class TaskService {
  /**
   * Obtener todas las tareas de un usuario
   */
  async getTasksByUser(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Error fetching tasks: ${error.message}`);
    return data || [];
  }

  /**
   * Obtener una tarea por ID
   */
  async getTaskById(taskId: number, userId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("owner_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No encontrado
      throw new Error(`Error fetching task: ${error.message}`);
    }

    return data;
  }

  /**
   * Crear una nueva tarea
   */
  async createTask(userId: string, taskData: CreateTaskDTO): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: taskData.title,
        description: taskData.description || null,
        owner_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating task: ${error.message}`);
    return data;
  }

  /**
   * Actualizar una tarea
   */
  async updateTask(
    taskId: number,
    userId: string,
    updateData: UpdateTaskDTO,
  ): Promise<Task | null> {
    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("owner_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error updating task: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar una tarea
   */
  async deleteTask(taskId: number, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("owner_id", userId);

    if (error) throw new Error(`Error deleting task: ${error.message}`);
    return true;
  }

  /**
   * Alternar estado completado
   */
  async toggleTaskCompletion(
    taskId: number,
    userId: string,
  ): Promise<Task | null> {
    // Primero obtenemos la tarea
    const task = await this.getTaskById(taskId, userId);
    if (!task) return null;

    // Alternamos el estado
    return this.updateTask(taskId, userId, {
      completed: !task.completed,
    });
  }
}

export default new TaskService();
