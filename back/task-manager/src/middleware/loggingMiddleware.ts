import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { getRequestLogger } from "../config/logger.js";

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = process.hrtime.bigint();
  const incomingRequestId = req.headers["x-request-id"];
  req.id =
    typeof incomingRequestId === "string" && incomingRequestId.trim().length > 0
      ? incomingRequestId
      : crypto.randomUUID();

  res.setHeader("x-request-id", req.id);

  const log = getRequestLogger(req);

  log.info(
    {
      ip: req.ip,
      origin: req.headers.origin,
      userAgent: req.headers["user-agent"],
    },
    "request.start",
  );

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    log.info(
      {
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      },
      "request.finish",
    );
  });

  next();
};
