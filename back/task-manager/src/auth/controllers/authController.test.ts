import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const resetPasswordForEmailMock: jest.Mock = jest.fn();
const updateUserMock: jest.Mock = jest.fn();
const createAuthenticatedClientMock = jest.fn(() => ({
  auth: {
    updateUser: updateUserMock,
  },
}));

const logStub = {
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule("../../config/supabaseClient.js", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: resetPasswordForEmailMock,
    },
  },
  createAuthenticatedClient: createAuthenticatedClientMock,
}));

jest.unstable_mockModule("../../config/logger.js", () => ({
  getRequestLogger: () => logStub,
}));

const { AuthController } = await import("./authController.js");

describe("AuthController", () => {
  const controller = new AuthController();

  const createRes = () => {
    const res: any = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  beforeEach(() => {
    resetPasswordForEmailMock.mockReset();
    updateUserMock.mockReset();
    createAuthenticatedClientMock.mockClear();
    Object.values(logStub).forEach((fn) => (fn as jest.Mock).mockClear());
  });

  it("requestPasswordReset returns 400 for invalid email", async () => {
    const req: any = { body: { email: "bad-email" } };
    const res = createRes();

    await controller.requestPasswordReset(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Please provide a valid email address",
    });
  });

  it("requestPasswordReset sends email", async () => {
    const req: any = { body: { email: "a@a.com" } };
    const res = createRes();
    resetPasswordForEmailMock.mockImplementation(async () => ({ error: null }));

    await controller.requestPasswordReset(req, res);

    expect(resetPasswordForEmailMock).toHaveBeenCalledWith(
      "a@a.com",
      expect.objectContaining({
        redirectTo: expect.stringContaining("/reset-password"),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Password reset email sent",
    });
  });

  it("requestPasswordReset returns 500 on Supabase error", async () => {
    const req: any = { body: { email: "a@a.com" } };
    const res = createRes();
    resetPasswordForEmailMock.mockImplementation(async () => ({
      error: { message: "boom", code: "500" },
    }));

    await controller.requestPasswordReset(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "boom",
    });
  });

  it("updatePassword returns 400 for short password", async () => {
    const req: any = {
      body: { password: "123" },
      user: { sub: "u1", accessToken: "token-1" },
    };
    const res = createRes();

    await controller.updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Password must be at least 6 characters long",
    });
  });

  it("updatePassword updates password", async () => {
    const req: any = {
      body: { password: "newpass123" },
      user: { sub: "u1", accessToken: "token-1" },
    };
    const res = createRes();
    updateUserMock.mockImplementation(async () => ({ error: null }));

    await controller.updatePassword(req, res);

    expect(createAuthenticatedClientMock).toHaveBeenCalledWith("token-1");
    expect(updateUserMock).toHaveBeenCalledWith({ password: "newpass123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Password updated successfully",
    });
  });

  it("updatePassword returns 401 for invalid token", async () => {
    const req: any = {
      body: { password: "newpass123" },
      user: { sub: "u1", accessToken: "token-1" },
    };
    const res = createRes();
    updateUserMock.mockImplementation(async () => ({
      error: { message: "invalid", status: 401, code: "401" },
    }));

    await controller.updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "invalid",
    });
  });
});
