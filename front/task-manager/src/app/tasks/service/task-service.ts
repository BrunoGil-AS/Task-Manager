import { HttpClient } from '@angular/common/http';
import { Injectable, signal, inject, effect } from '@angular/core';
import Task from '../models/task.model';
import { map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { apiRoutes } from '../../core/api-routes';
import ApiResponse from './model/api-response';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);

  private tasks$ = this.getTasks();

  tasks = toSignal(this.tasks$, { initialValue: [] });

  constructor() {
    effect(() => {
      console.log('Tasks changed:');
      this.tasks().forEach((task) => console.log(task));
    });
  }

  private getTasks(): Observable<Task[]> {
    console.log('getTasks called');
    let response = this.http.get<ApiResponse>(apiRoutes.tasksApi + '/tasks');
    //aqui debo procesar la respuesta de la api y retornar las task para convertirse en una señal
    return response.pipe(map((res) => res.data));
  }
  addTask(task: Task) {
    return this.http.post(apiRoutes.tasksApi + '/tasks', task);
  }

  deleteTask(id: number) {
    return this.http.delete(apiRoutes.tasksApi + '/tasks/' + id);
  }

  updateTask(id: number, task: Task) {
    return this.http.put(apiRoutes.tasksApi + '/tasks/' + id, task);
  }

  getTask(id: number) {
    return this.http.get<Task>(apiRoutes.tasksApi + '/tasks/' + id);
  }
}
