import { beforeEach, describe, expect, it, jest } from "@jest/globals";

/**
 * Unit tests for TaskService using mocked Supabase and logger.
 */

const createAuthenticatedClient = jest.fn();

type AsyncMock<TArgs extends unknown[], TResult> = jest.MockedFunction<
  (...args: TArgs) => Promise<TResult>
>;
type SyncMock<TArgs extends unknown[], TResult> = jest.MockedFunction<
  (...args: TArgs) => TResult
>;

const mockAsync = <T>(impl?: () => Promise<T>) =>
  (jest.fn(impl) as unknown) as AsyncMock<[], T>;
const mockSync = <T>(impl?: () => T) =>
  (jest.fn(impl) as unknown) as SyncMock<[], T>;

const mockLogger = {
  child: jest.fn(() => ({
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
};

jest.unstable_mockModule("../../config/supabaseClient.js", () => ({
  createAuthenticatedClient,
}));

jest.unstable_mockModule("../../config/logger.js", () => ({
  logger: mockLogger,
}));

const { TaskService } = await import("./taskService.js");

describe("TaskService", () => {
  beforeEach(() => {
    createAuthenticatedClient.mockReset();
    mockLogger.child.mockClear();
  });

  // Happy path: returns tasks for a user and orders by newest first.
  it("getTasksByUser returns tasks", async () => {
    const tasks = [{ id: 1, title: "A" }];
    const order = mockAsync<{ data: typeof tasks; error: null }>();
    order.mockResolvedValue({ data: tasks, error: null });
    const eq = mockSync<{ order: typeof order }>(() => ({ order }));
    const select = mockSync<{ eq: typeof eq }>(() => ({ eq }));
    const from = mockSync<{ select: typeof select }>(() => ({ select }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    const result = await service.getTasksByUser("user-1", "token-1");

    expect(result).toEqual(tasks);
    expect(createAuthenticatedClient).toHaveBeenCalledWith("token-1");
    expect(from).toHaveBeenCalledWith("tasks");
    expect(select).toHaveBeenCalledWith("*");
    expect(eq).toHaveBeenCalledWith("owner_id", "user-1");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  // Error path: surface Supabase error as a thrown exception.
  it("getTasksByUser throws on supabase error", async () => {
    const order = mockAsync<{
      data: null;
      error: { code: string; message: string };
    }>();
    order.mockResolvedValue({
      data: null,
      error: { code: "X", message: "boom" },
    });
    const eq = mockSync<{ order: typeof order }>(() => ({ order }));
    const select = mockSync<{ eq: typeof eq }>(() => ({ eq }));
    const from = mockSync<{ select: typeof select }>(() => ({ select }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    await expect(service.getTasksByUser("user-1", "token-1")).rejects.toThrow(
      "Error fetching tasks: boom",
    );
  });

  // Happy path: returns a task when ID and owner match.
  it("getTaskById returns task", async () => {
    const task = { id: 5, title: "Task" };
    const single = mockAsync<{ data: typeof task; error: null }>();
    single.mockResolvedValue({ data: task, error: null });
    const eqOwner = mockSync<{ single: typeof single }>(() => ({ single }));
    const eqId = mockSync<{ eq: typeof eqOwner }>(() => ({ eq: eqOwner }));
    const select = mockSync<{ eq: typeof eqId }>(() => ({ eq: eqId }));
    const from = mockSync<{ select: typeof select }>(() => ({ select }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    const result = await service.getTaskById(5, "user-1", "token-1");

    expect(result).toEqual(task);
    expect(eqId).toHaveBeenCalledWith("id", 5);
    expect(eqOwner).toHaveBeenCalledWith("owner_id", "user-1");
  });

  // Not found: Supabase returns PGRST116, service returns null.
  it("getTaskById returns null on not found", async () => {
    const single = mockAsync<{ data: null; error: { code: string } }>();
    single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    const eqOwner = mockSync<{ single: typeof single }>(() => ({ single }));
    const eqId = mockSync<{ eq: typeof eqOwner }>(() => ({ eq: eqOwner }));
    const select = mockSync<{ eq: typeof eqId }>(() => ({ eq: eqId }));
    const from = mockSync<{ select: typeof select }>(() => ({ select }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    const result = await service.getTaskById(5, "user-1", "token-1");

    expect(result).toBeNull();
  });

  // Error path: non-not-found Supabase error should throw.
  it("getTaskById throws on supabase error", async () => {
    const single = mockAsync<{
      data: null;
      error: { code: string; message: string };
    }>();
    single.mockResolvedValue({
      data: null,
      error: { code: "X", message: "boom" },
    });
    const eqOwner = mockSync<{ single: typeof single }>(() => ({ single }));
    const eqId = mockSync<{ eq: typeof eqOwner }>(() => ({ eq: eqOwner }));
    const select = mockSync<{ eq: typeof eqId }>(() => ({ eq: eqId }));
    const from = mockSync<{ select: typeof select }>(() => ({ select }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    await expect(service.getTaskById(5, "user-1", "token-1")).rejects.toThrow(
      "Error fetching task: boom",
    );
  });

  // Happy path: inserts a new task with optional description handling.
  it("createTask inserts payload", async () => {
    const task = { id: 1, title: "New" };
    const single = mockAsync<{ data: typeof task; error: null }>();
    single.mockResolvedValue({ data: task, error: null });
    const select = mockSync<{ single: typeof single }>(() => ({ single }));
    const insert = mockSync<{ select: typeof select }>(() => ({ select }));
    const from = mockSync<{ insert: typeof insert }>(() => ({ insert }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    const result = await service.createTask(
      "user-1",
      { title: "New" },
      "token-1",
    );

    expect(result).toEqual(task);
    expect(insert).toHaveBeenCalledWith({
      title: "New",
      description: null,
      owner_id: "user-1",
    });
  });

  // Error path: create failure throws with Supabase message.
  it("createTask throws on supabase error", async () => {
    const single = mockAsync<{
      data: null;
      error: { code: string; message: string };
    }>();
    single.mockResolvedValue({
      data: null,
      error: { code: "X", message: "boom" },
    });
    const select = mockSync<{ single: typeof single }>(() => ({ single }));
    const insert = mockSync<{ select: typeof select }>(() => ({ select }));
    const from = mockSync<{ insert: typeof insert }>(() => ({ insert }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    await expect(
      service.createTask("user-1", { title: "New" }, "token-1"),
    ).rejects.toThrow("Error creating task: boom");
  });

  // Happy path: update returns the updated task record.
  it("updateTask returns updated task", async () => {
    const task = { id: 1, title: "Updated" };
    const single = mockAsync<{ data: typeof task; error: null }>();
    single.mockResolvedValue({ data: task, error: null });
    const select = mockSync<{ single: typeof single }>(() => ({ single }));
    const eqOwner = mockSync<{ select: typeof select }>(() => ({ select }));
    const eqId = mockSync<{ eq: typeof eqOwner }>(() => ({ eq: eqOwner }));
    const update = mockSync<{ eq: typeof eqId }>(() => ({ eq: eqId }));
    const from = mockSync<{ update: typeof update }>(() => ({ update }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    const result = await service.updateTask(
      1,
      "user-1",
      { title: "Updated" },
      "token-1",
    );

    expect(result).toEqual(task);
  });

  // Not found: Supabase PGRST116 should return null.
  it("updateTask returns null on not found", async () => {
    const single = mockAsync<{ data: null; error: { code: string } }>();
    single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    const select = mockSync<{ single: typeof single }>(() => ({ single }));
    const eqOwner = mockSync<{ select: typeof select }>(() => ({ select }));
    const eqId = mockSync<{ eq: typeof eqOwner }>(() => ({ eq: eqOwner }));
    const update = mockSync<{ eq: typeof eqId }>(() => ({ eq: eqId }));
    const from = mockSync<{ update: typeof update }>(() => ({ update }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    const result = await service.updateTask(
      1,
      "user-1",
      { title: "Updated" },
      "token-1",
    );

    expect(result).toBeNull();
  });

  // Happy path: delete returns true when Supabase reports success.
  it("deleteTask returns true", async () => {
    const eqOwner = mockAsync<{ error: null }>();
    eqOwner.mockResolvedValue({ error: null });
    const eqId = mockSync<{ eq: typeof eqOwner }>(() => ({ eq: eqOwner }));
    const del = mockSync<{ eq: typeof eqId }>(() => ({ eq: eqId }));
    const from = mockSync<{ delete: typeof del }>(() => ({ delete: del }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new TaskService();
    const result = await service.deleteTask(1, "user-1", "token-1");

    expect(result).toBe(true);
  });

  // Not found: toggling a missing task returns null.
  it("toggleTaskCompletion returns null when task missing", async () => {
    const service = new TaskService();
    const getSpy = jest.spyOn(service, "getTaskById").mockResolvedValue(null);

    const result = await service.toggleTaskCompletion(1, "user-1", "token-1");

    expect(result).toBeNull();
    expect(getSpy).toHaveBeenCalled();
  });

  // Happy path: toggles completed from false to true.
  it("toggleTaskCompletion toggles completion", async () => {
    const service = new TaskService();
    jest
      .spyOn(service, "getTaskById")
      .mockResolvedValue({ id: 1, completed: false } as any);
    const updateSpy = jest
      .spyOn(service, "updateTask")
      .mockResolvedValue({ id: 1, completed: true } as any);

    const result = await service.toggleTaskCompletion(1, "user-1", "token-1");

    expect(updateSpy).toHaveBeenCalledWith(
      1,
      "user-1",
      { completed: true },
      "token-1",
    );
    expect(result).toEqual({ id: 1, completed: true });
  });
});
