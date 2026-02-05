import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task-service';
import { Task } from '../models/task.model';
import { apiRoutes } from '../../core/api-routes';
import ApiResponse from './model/api-response';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial loading state as true', () => {
    expect(service.loading()).toBe(true);
  });

  it('should load tasks and update tasks signal', () => {
    const mockTasks: Task[] = [
      { id: 1, title: 'Task 1', completed: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, title: 'Task 2', completed: true, createdAt: new Date(), updatedAt: new Date() },
    ];
    const apiResponse: ApiResponse = {
      data: mockTasks.map(task => ({ ...task, created_at: task.createdAt, updated_at: task.updatedAt })),
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
      },
    };

    service.refreshTasks();

    const req = httpMock.expectOne(apiRoutes.tasksApi + '/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(apiResponse);

    expect(service.tasks().length).toBe(2);
    expect(service.tasks()[0].title).toBe('Task 1');
    expect(service.loading()).toBe(false);
  });

  it('should add a task', () => {
    const newTask: Task = { id: 3, title: 'Task 3', completed: false, createdAt: new Date(), updatedAt: new Date() };
    service.addTask(newTask).subscribe();

    const req = httpMock.expectOne(apiRoutes.tasksApi + '/tasks');
    expect(req.request.method).toBe('POST');
    req.flush(newTask);
  });

  it('should delete a task', () => {
    service.deleteTask(1).subscribe();

    const req = httpMock.expectOne(apiRoutes.tasksApi + '/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should update a task', () => {
    const updatedTask: Task = { id: 1, title: 'Updated Task 1', completed: true, createdAt: new Date(), updatedAt: new Date() };
    service.updateTask(1, updatedTask).subscribe();

    const req = httpMock.expectOne(apiRoutes.tasksApi + '/tasks/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedTask);
  });

  it('should get a task from cache', () => {
    const mockTasks: Task[] = [
      { id: 1, title: 'Task 1', completed: false, createdAt: new Date(), updatedAt: new Date() },
    ];
    service['tasksSubject'].next(mockTasks);

    service.getTask(1).subscribe(task => {
      expect(task.title).toBe('Task 1');
    });

    httpMock.expectNone(apiRoutes.tasksApi + '/tasks/1');
  });

  it('should get a task from http', () => {
    const mockTask: Task = { id: 1, title: 'Task 1', completed: false, createdAt: new Date(), updatedAt: new Date() };
    const apiResponse = {
      data: { ...mockTask, created_at: mockTask.createdAt, updated_at: mockTask.updatedAt }
    };

    // First, ensure the cache is empty for this task
    service['tasksSubject'].next([]);

    service.getTask(1).subscribe(task => {
      expect(task.title).toBe('Task 1');
    });

    const req = httpMock.expectOne(apiRoutes.tasksApi + '/tasks/1');
    expect(req.request.method).toBe('GET');
    req.flush(apiResponse);
  });
});
