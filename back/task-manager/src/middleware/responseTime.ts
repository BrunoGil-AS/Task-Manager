import type { NextFunction, Request, Response } from "express";
import { getRequestLogger } from "../config/logger.js";

export const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Track elapsed time for response logging/monitoring.
  const start = process.hrtime.bigint();
  const originalEnd = res.end;

  res.end = function (this: Response, chunk?: any, encoding?: any, cb?: any) {
    // Attach response time header just before headers are sent.
    const diffMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    if (!res.headersSent) {
      res.setHeader("X-Response-Time", `${diffMs.toFixed(1)}ms`);
    }
    if (typeof encoding === "function") {
      return originalEnd.call(this, chunk, encoding);
    }
    if (typeof cb === "function") {
      return originalEnd.call(this, chunk, encoding, cb);
    }
    return originalEnd.call(this, chunk, encoding);
  } as any;

  res.on("finish", () => {
    // Log duration for monitoring.
    const diffMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const log = getRequestLogger(req);
    log.info(
      {
        statusCode: res.statusCode,
        durationMs: Number(diffMs.toFixed(1)),
      },
      "http.response_time",
    );
  });

  next();
};
