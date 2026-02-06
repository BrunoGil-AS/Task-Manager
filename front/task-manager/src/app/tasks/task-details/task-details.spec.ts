import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { TaskDetails } from './task-details';
import { TaskService } from '../service/task-service';
import type { Task } from '../models/task.model';

describe('TaskDetails', () => {
  let component: TaskDetails;
  let fixture: ComponentFixture<TaskDetails>;
  let taskService: TaskService;
  let router: Router;
  const task: Task = {
    id: 1,
    title: 'Task',
    description: 'Desc',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetails],
      providers: [
        {
          provide: TaskService,
          useValue: {
            getTask: vi.fn().mockReturnValue(of(task)),
            updateTask: vi.fn().mockReturnValue(of(task)),
            deleteTask: vi.fn().mockReturnValue(of({})),
            tasks: signal([task]),
            loading: signal(false),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetails);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load task from route param', () => {
    expect(taskService.getTask).toHaveBeenCalledWith(1);
  });

  it('should toggle completion and call update', () => {
    component.toggleComplete();

    expect(taskService.updateTask).toHaveBeenCalled();
    const [, payload] = (taskService.updateTask as any).mock.calls.at(-1) as [
      number,
      Task,
    ];
    expect(payload.completed).toBe(true);
  });

  it('should delete task', () => {
    component.deleteTask();

    expect(taskService.deleteTask).toHaveBeenCalledWith(1);
  });

  it('should navigate back', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });
});
