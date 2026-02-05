import { HttpClient } from '@angular/common/http';
import { Injectable, inject, effect } from '@angular/core';
import { Task, type CreateTaskPayload } from '../models/task.model';
import { BehaviorSubject, finalize, map, of, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { apiRoutes } from '../../core/api-routes';
import ApiResponse from './model/api-response';

/**
 * Service for managing tasks.
 *
 * This service is responsible for fetching, creating, updating, and deleting tasks from the API.
 * It uses a BehaviorSubject to store the tasks and exposes them as a signal.
 * It also exposes a loading signal to indicate when tasks are being loaded.
 *
 * @export
 * @class TaskService
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  /**
   * Http client used to communicate with the tasks API.
   */
  private http = inject(HttpClient);

  /**
   * Internal store for the current task list.
   */
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  /**
   * Internal store for the loading state of task operations.
   */
  private loadingSubject = new BehaviorSubject<boolean>(true);

  /**
   * Tracks whether tasks have been loaded at least once.
   */
  private hasLoaded = false;

  /**
   * A signal representing the list of tasks.
   *
   * @memberof TaskService
   */
  tasks = toSignal(this.tasksSubject.asObservable(), { initialValue: [] });

  /**
   * A signal indicating if tasks are being loaded.
   *
   * @memberof TaskService
   */
  loading = toSignal(this.loadingSubject.asObservable(), { initialValue: true });

  constructor() {
    effect(() => {
      console.log('Tasks changed:');
      this.tasks().forEach((task) => console.log(task));
    });

    this.loadTasks();
  }

  /**
   * Reloads the tasks.
   *
   * @param {boolean} [force=true] If true, forces a reload even if tasks have already been loaded.
   * @memberof TaskService
   */
  refreshTasks(force = true) {
    this.loadTasks(force);
  }

  /**
   * Loads tasks from the API into the in-memory store.
   *
   * Skips the request when tasks were already loaded unless `force` is true.
   * Updates the loading signal and keeps `hasLoaded` in sync with success/failure.
   *
   * @param {boolean} [force=false] Forces a reload even if tasks have already been loaded.
   * @memberof TaskService
   */
  private loadTasks(force = false) {
    if (this.hasLoaded && !force) {
      return;
    }

    this.loadingSubject.next(true);

    this.http
      .get<ApiResponse>(apiRoutes.tasksApi + '/tasks')
      .pipe(
        map((res) => res.data.map((task) => this.mapTask(task))),
        finalize(() => this.loadingSubject.next(false)),
      )
      .subscribe({
        next: (tasks) => {
          this.tasksSubject.next(tasks);
          this.hasLoaded = true;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.hasLoaded = false;
        },
      });
  }

  /**
   * Inserts the task if it doesn't exist, or replaces the existing entry by id.
   *
   * Uses the current in-memory list to keep updates fast and avoids a full reload.
   *
   * @param {Task} task The task to insert or update.
   * @memberof TaskService
   */
  private upsertTask(task: Task) {
    const current = this.tasksSubject.value;
    const index = current.findIndex((item) => item.id === task.id);
    if (index === -1) {
      this.tasksSubject.next([task, ...current]);
      return;
    }

    const next = [...current];
    next[index] = task;
    this.tasksSubject.next(next);
  }

  /**
   * Returns a snapshot of the current task list.
   */
  getTasksSnapshot() {
    return this.tasksSubject.value;
  }

  /**
   * Replaces the in-memory task list.
   *
   * Useful for optimistic updates with rollback.
   */
  restoreTasks(tasks: Task[]) {
    this.tasksSubject.next(tasks);
  }

  /**
   * Removes a task from the in-memory list.
   */
  removeTaskFromStore(id: number) {
    const current = this.tasksSubject.value;
    if (!current.length) {
      return;
    }
    this.tasksSubject.next(current.filter((task) => task.id !== id));
  }

  /**
   * Maps a raw task object from the API to a `Task` model.
   *
   * This function ensures that the data received from the API conforms to the `Task` model used throughout the application.
   * It handles potential differences in property names (e.g., `created_at` vs. `createdAt`) and ensures type consistency.
   *
   * @param {any} raw The raw task object from the API.
   * @returns {Task} The mapped `Task` object.
   * @memberof TaskService
   */
  private mapTask(raw: any): Task {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description ?? undefined,
      completed: Boolean(raw.completed),
      createdAt: raw.created_at ?? raw.createdAt,
      updatedAt: raw.updated_at ?? raw.updatedAt,
    } as Task;
  }

  /**
   * Adds a new task.
   *
   * @param {CreateTaskPayload} task The task to add.
   * @returns An observable that completes when the task is added.
   * @memberof TaskService
   */
  addTask(task: CreateTaskPayload) {
    return this.http.post(apiRoutes.tasksApi + '/tasks', task);
  }

  /**
   * Deletes a task.
   *
   * @param {number} id The id of the task to delete.
   * @returns An observable that completes when the task is deleted.
   * @memberof TaskService
   */
  deleteTask(id: number) {
    return this.http.delete(apiRoutes.tasksApi + '/tasks/' + id);
  }

  /**
   * Updates a task.
   *
   * @param {number} id The id of the task to update.
   * @param {Task} task The updated task.
   * @returns An observable that completes when the task is updated.
   * @memberof TaskService
   */
  updateTask(id: number, task: Task) {
    return this.http.put(apiRoutes.tasksApi + '/tasks/' + id, task);
  }

  /**
   * Gets a single task, from cache or from the API.
   *
   * @param {number} id The id of the task to get.
   * @returns An observable that emits the task.
   * @memberof TaskService
   */
  getTask(id: number) {
    const cached = this.tasksSubject.value.find((item) => item.id === id);
    if (cached) {
      return of(cached);
    }

    return this.http.get<{ data: any }>(apiRoutes.tasksApi + '/tasks/' + id).pipe(
      map((res) => this.mapTask(res.data)),
      tap((task) => this.upsertTask(task)),
    );
  }
}
