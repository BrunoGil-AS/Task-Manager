import type { Request, Response, NextFunction } from "express";
import ApiError from "./ApiError.js";
import { getRequestLogger } from "../config/logger.js";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const log = getRequestLogger(req);

  if (err instanceof ApiError) {
    log.warn(
      { statusCode: err.statusCode, code: err.code, message: err.message },
      "error.api",
    );
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  // Unexpected error
  log.error({ err }, "error.unhandled");
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    code: "INTERNAL_ERROR",
  });
};
