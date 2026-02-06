import { beforeEach, describe, expect, it, jest } from "@jest/globals";

/**
 * Unit tests for UserController using mocked UserService and logger.
 */

const userService = {
  getUserInfo: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
} as {
  getUserInfo: jest.MockedFunction<(userId: string, token: string) => Promise<any>>;
  updateUser: jest.MockedFunction<
    (userId: string, payload: { name: string }, token: string) => Promise<any>
  >;
  deleteUser: jest.MockedFunction<(userId: string, token: string) => Promise<any>>;
};

const logStub = {
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule("../services/userService.js", () => ({
  default: userService,
}));

jest.unstable_mockModule("../../config/logger.js", () => ({
  getRequestLogger: () => logStub,
}));

const { UserController } = await import("./UserController.js");

describe("UserController", () => {
  const controller = new UserController();

  const createRes = () => {
    const res: any = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  beforeEach(() => {
    Object.values(userService).forEach((fn) => (fn as jest.Mock).mockReset());
    Object.values(logStub).forEach((fn) => (fn as jest.Mock).mockClear());
  });

  // Authorization guard: missing user should return 401.
  it("getProfile returns 401 when unauthorized", async () => {
    const req: any = { user: undefined };
    const res = createRes();

    await controller.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied" });
  });

  // Happy path: returns the profile for the authenticated user.
  it("getProfile returns user", async () => {
    const req: any = { user: { sub: "u1", accessToken: "t1" } };
    const res = createRes();

    userService.getUserInfo.mockResolvedValue({ id: "u1" });

    await controller.getProfile(req, res);

    expect(userService.getUserInfo).toHaveBeenCalledWith("u1", "t1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: "u1" },
    });
  });

  // Validation: empty/blank name should return 400.
  it("updateProfile returns 400 when name missing", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      body: { name: " " },
    };
    const res = createRes();

    await controller.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Name is required" });
  });

  // Happy path: updates name and returns the new profile.
  it("updateProfile returns 200 when updated", async () => {
    const req: any = {
      user: { sub: "u1", accessToken: "t1" },
      body: { name: "Bruno" },
    };
    const res = createRes();

    userService.updateUser.mockResolvedValue({ id: "u1", name: "Bruno" });

    await controller.updateProfile(req, res);

    expect(userService.updateUser).toHaveBeenCalledWith(
      "u1",
      { name: "Bruno" },
      "t1",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: "u1", name: "Bruno" },
      message: "User updated successfully",
    });
  });

  // Happy path: disable user account and return success.
  it("deleteAccount returns 200 on success", async () => {
    const req: any = { user: { sub: "u1", accessToken: "t1" } };
    const res = createRes();

    userService.deleteUser.mockResolvedValue({ id: "u1", enabled: false });

    await controller.deleteAccount(req, res);

    expect(userService.deleteUser).toHaveBeenCalledWith("u1", "t1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: "u1", enabled: false },
      message: "User disabled successfully",
    });
  });
});
