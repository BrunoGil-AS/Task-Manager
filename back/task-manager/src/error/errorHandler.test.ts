import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";

import ApiError from "./ApiError.js";

const logStub = {
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule("../config/logger.js", () => ({
  getRequestLogger: () => logStub,
}));

const { errorHandler } = await import("./errorHandler.js");

describe("errorHandler", () => {
  const createRes = () => {
    const res: any = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  const req = {} as Request;
  const next = jest.fn() as NextFunction;

  beforeEach(() => {
    Object.values(logStub).forEach((fn) => (fn as jest.Mock).mockClear());
  });

  it("returns ApiError details with provided status and code", () => {
    const res = createRes();
    const err = new ApiError(403, "Forbidden", "FORBIDDEN");

    errorHandler(err, req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Forbidden",
      code: "FORBIDDEN",
    });
  });

  it("returns 500 for generic errors without leaking details", () => {
    const res = createRes();
    const err = new Error("token=secret");

    errorHandler(err, req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Internal Server Error",
      code: "INTERNAL_ERROR",
    });
  });
});
