import { beforeEach, describe, expect, it, jest } from "@jest/globals";

/**
 * Unit tests for TaskController using mocked TaskService and logger.
 */

const taskService = {
  getTasksByUser: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  toggleTaskCompletion: jest.fn(),
  deleteTask: jest.fn(),
} as {
  getTasksByUser: jest.MockedFunction<
    (
      userId: string,
      token: string,
      options?: { page: number; pageSize: number },
    ) => Promise<{ data: any[]; count: number; page: number; pageSize: number }>
  >;
  getTaskById: jest.MockedFunction<
    (taskId: number, userId: string, token: string) => Promise<any | null>
  >;
  createTask: jest.MockedFunction<
    (userId: string, payload: any, token: string) => Promise<any>
  >;
  updateTask: jest.MockedFunction<
    (taskId: number, userId: string, payload: any, token: string) => Promise<any | null>
  >;
  toggleTaskCompletion: jest.MockedFunction<
    (taskId: number, userId: string, token: string) => Promise<any | null>
  >;
  deleteTask: jest.MockedFunction<
    (taskId: number, userId: string, token: string) => Promise<boolean>
  >;
};

const logStub = {
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule("../services/taskService.js", () => ({
  default: taskService,
}));

jest.unstable_mockModule("../../config/logger.js", () => ({
  getRequestLogger: () => logStub,
}));

const { TaskController } = await import("./TaskController.js");

describe("TaskController", () => {
  const controller = new TaskController();

  const createRes = () => {
    const res: any = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  beforeEach(() => {
    (Object.values(taskService) as Array<jest.MockedFunction<any>>).forEach(
      (fn) => fn.mockReset(),
    );
    Object.values(logStub).forEach((fn) => (fn as jest.Mock).mockClear());
  });

  // Authorization guard: missing user should return 401.
  it("getAllTasks returns 401 when unauthorized", async () => {
    const req: any = { user: undefined };
    const res = createRes();

    await controller.getAllTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  // Happy path: returns tasks and total count.
  it("getAllTasks returns tasks", async () => {
    const req: any = { user: { sub: "u1", accessToken: "t1" } };
    const res = createRes();

    taskService.getTasksByUser.mockResolvedValue({
      data: [{ id: 1 }],
      count: 1,
      page: 1,
      pageSize: 20,
    });

    await controller.getAllTasks(req, res);

    expect(taskService.getTasksByUser).toHaveBeenCalledWith("u1", "t1", {
      page: 1,
      pageSize: 20,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: 1 }],
      count: 1,
      page: 1,
      pageSize: 20,
    });
  });

  // Validation: non-numeric ID should return 400.
  it("getTaskById returns 400 for invalid id", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      params: { id: "abc" },
    };
    const res = createRes();

    await controller.getTaskById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid task ID" });
  });

  // Not found: service returns null -> 404.
  it("getTaskById returns 404 when not found", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      params: { id: "1" },
    };
    const res = createRes();

    taskService.getTaskById.mockResolvedValue(null);

    await controller.getTaskById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
  });

  // Validation: empty/blank title should return 400.
  it("createTask returns 400 when title missing", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      body: { title: "  " },
    };
    const res = createRes();

    await controller.createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Title is required" });
  });

  // Happy path: creates task and returns 201.
  it("createTask returns 201 when created", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      body: { title: "Title", description: "desc" },
    };
    const res = createRes();

    taskService.createTask.mockResolvedValue({ id: 2 });

    await controller.createTask(req, res);

    expect(taskService.createTask).toHaveBeenCalledWith(
      "u1",
      { title: "Title", description: "desc" },
      "t1",
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // Validation: empty body should return 400.
  it("updateTask returns 400 when no data", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      params: { id: "1" },
      body: {},
    };
    const res = createRes();

    await controller.updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No data to update" });
  });

  // Not found: service returns null -> 404.
  it("updateTask returns 404 when not found", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      params: { id: "1" },
      body: { title: "New" },
    };
    const res = createRes();

    taskService.updateTask.mockResolvedValue(null);

    await controller.updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
  });

  // Not found: service returns null -> 404.
  it("toggleTask returns 404 when not found", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      params: { id: "1" },
    };
    const res = createRes();

    taskService.toggleTaskCompletion.mockResolvedValue(null);

    await controller.toggleTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
  });

  // Happy path: delete returns 200 with success message.
  it("deleteTask returns 200 on success", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      params: { id: "1" },
    };
    const res = createRes();

    taskService.deleteTask.mockResolvedValue(true);

    await controller.deleteTask(req, res);

    expect(taskService.deleteTask).toHaveBeenCalledWith(1, "u1", "t1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Task deleted successfully",
    });
  });
});
