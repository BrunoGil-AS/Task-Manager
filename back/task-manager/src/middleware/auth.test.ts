import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import type { AuthUserDTO } from "../users/model/User.js";
import type ApiError from "../error/ApiError.js";

const logStub = {
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
} as {
  warn: jest.MockedFunction<(...args: unknown[]) => void>;
  info: jest.MockedFunction<(...args: unknown[]) => void>;
  debug: jest.MockedFunction<(...args: unknown[]) => void>;
  error: jest.MockedFunction<(...args: unknown[]) => void>;
};

const supabaseAuth = {
  getUser: jest.fn(),
} as {
  getUser: jest.MockedFunction<
    (
      token: string,
    ) => Promise<{ data: { user: AuthUserDTO | null }; error: ApiError | null }>
  >;
};

// Mock logger
jest.unstable_mockModule("../config/logger.js", () => ({
  getRequestLogger: () => logStub,
}));

// Mock supabase client
jest.unstable_mockModule("../config/supabaseClient.js", () => ({
  supabase: {
    auth: supabaseAuth,
  },
}));

const { authenticateUser } = await import("./auth.js");

describe("authenticateUser middleware", () => {
  const createRes = () => {
    const res: any = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  beforeEach(() => {
    supabaseAuth.getUser.mockReset();
    Object.values(logStub).forEach((fn) => (fn as jest.Mock).mockClear());
  });

  it("returns 401 when no token is provided", async () => {
    const req: any = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    await authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    const req: any = { headers: { authorization: "Bearer bad" } };
    const res = createRes();
    const next = jest.fn();

    supabaseAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: {
        statusCode: 401,
        message: "invalid",
        code: "INVALID_TOKEN",
        name: "ApiError",
      },
    });

    await authenticateUser(req, res, next);

    expect(supabaseAuth.getUser).toHaveBeenCalledWith("bad");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and sets req.user when token is valid", async () => {
    const req: any = { headers: { authorization: "Bearer good" } };
    const res = createRes();
    const next = jest.fn();

    supabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@a.com" } },
      error: null,
    });

    await authenticateUser(req, res, next);

    expect(supabaseAuth.getUser).toHaveBeenCalledWith("good");
    expect(req.user).toEqual({
      sub: "u1",
      email: "a@a.com",
      accessToken: "good",
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when supabase client throws", async () => {
    const req: any = { headers: { authorization: "Bearer boom" } };
    const res = createRes();
    const next = jest.fn();

    supabaseAuth.getUser.mockRejectedValue(new Error("boom"));

    await authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
