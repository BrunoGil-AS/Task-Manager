import { beforeEach, describe, expect, it, jest } from "@jest/globals";

/**
 * Unit tests for UserService using mocked Supabase and logger.
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

const { UserService } = await import("./userService.js");

describe("UserService", () => {
  beforeEach(() => {
    createAuthenticatedClient.mockReset();
    mockLogger.child.mockClear();
  });

  // Happy path: returns user when Supabase returns a record.
  it("getUserInfo returns user", async () => {
    const user = { id: "u1", name: "Bruno" };
    const single = mockAsync<{ data: typeof user; error: null }>();
    single.mockResolvedValue({ data: user, error: null });
    const eq = mockSync<{ single: typeof single }>(() => ({ single }));
    const select = mockSync<{ eq: typeof eq }>(() => ({ eq }));
    const from = mockSync<{ select: typeof select }>(() => ({ select }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new UserService();
    const result = await service.getUserInfo("u1", "token-1");

    expect(result).toEqual(user);
    expect(eq).toHaveBeenCalledWith("id", "u1");
  });

  // Not found: Supabase returns null data with no error.
  it("getUserInfo throws when user not found", async () => {
    const single = mockAsync<{ data: null; error: null }>();
    single.mockResolvedValue({ data: null, error: null });
    const eq = mockSync<{ single: typeof single }>(() => ({ single }));
    const select = mockSync<{ eq: typeof eq }>(() => ({ eq }));
    const from = mockSync<{ select: typeof select }>(() => ({ select }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new UserService();
    await expect(service.getUserInfo("u1", "token-1")).rejects.toThrow(
      "User not found",
    );
  });

  // Error path: propagate Supabase error as exception.
  it("getUserInfo throws on supabase error", async () => {
    const single = mockAsync<{
      data: null;
      error: { code: string; message: string };
    }>();
    single.mockResolvedValue({
      data: null,
      error: { code: "X", message: "boom" },
    });
    const eq = mockSync<{ single: typeof single }>(() => ({ single }));
    const select = mockSync<{ eq: typeof eq }>(() => ({ eq }));
    const from = mockSync<{ select: typeof select }>(() => ({ select }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new UserService();
    await expect(service.getUserInfo("u1", "token-1")).rejects.toThrow(
      "Error user does not exist. boom",
    );
  });

  // Happy path: inserts a user with required fields.
  it("createUser inserts payload", async () => {
    const user = { id: "u1", name: "Bruno", enabled: true };
    const single = mockAsync<{ data: typeof user; error: null }>();
    single.mockResolvedValue({ data: user, error: null });
    const select = mockSync<{ single: typeof single }>(() => ({ single }));
    const insert = mockSync<{ select: typeof select }>(() => ({ select }));
    const from = mockSync<{ insert: typeof insert }>(() => ({ insert }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new UserService();
    const result = await service.createUser(
      { id: "u1", name: "Bruno", enabled: true },
      "token-1",
    );

    expect(result).toEqual(user);
    expect(insert).toHaveBeenCalledWith({
      id: "u1",
      name: "Bruno",
      enabled: true,
    });
  });

  // Happy path: updates the user's name.
  it("updateUser updates payload", async () => {
    const user = { id: "u1", name: "Updated" };
    const single = mockAsync<{ data: typeof user; error: null }>();
    single.mockResolvedValue({ data: user, error: null });
    const select = mockSync<{ single: typeof single }>(() => ({ single }));
    const eq = mockSync<{ select: typeof select }>(() => ({ select }));
    const update = mockSync<{ eq: typeof eq }>(() => ({ eq }));
    const from = mockSync<{ update: typeof update }>(() => ({ update }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new UserService();
    const result = await service.updateUser(
      "u1",
      { name: "Updated" },
      "token-1",
    );

    expect(result).toEqual(user);
    expect(update).toHaveBeenCalledWith({ name: "Updated" });
  });

  // Happy path: marks user as disabled.
  it("disableUser sets enabled false", async () => {
    const user = { id: "u1", enabled: false };
    const single = mockAsync<{ data: typeof user; error: null }>();
    single.mockResolvedValue({ data: user, error: null });
    const select = mockSync<{ single: typeof single }>(() => ({ single }));
    const eq = mockSync<{ select: typeof select }>(() => ({ select }));
    const update = mockSync<{ eq: typeof eq }>(() => ({ eq }));
    const from = mockSync<{ update: typeof update }>(() => ({ update }));

    createAuthenticatedClient.mockReturnValue({ from });

    const service = new UserService();
    const result = await service.disableUser("u1", "token-1");

    expect(result).toEqual(user);
    expect(update).toHaveBeenCalledWith({ enabled: false });
  });

  // Delete is implemented as disable; ensure delegation.
  it("deleteUser delegates to disableUser", async () => {
    const service = new UserService();
    const spy = jest
      .spyOn(service, "disableUser")
      .mockResolvedValue({ id: "u1", enabled: false } as any);

    const result = await service.deleteUser("u1", "token-1");

    expect(spy).toHaveBeenCalledWith("u1", "token-1");
    expect(result).toEqual({ id: "u1", enabled: false });
  });
});
