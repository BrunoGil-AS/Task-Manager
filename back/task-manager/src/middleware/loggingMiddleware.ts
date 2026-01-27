import type { NextFunction, Request, Response } from "express";

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  console.log(
    `\$ [${timestamp}] ${req.method} ${req.url} - Incoming request from ${req.ip} \$`
  );

  // Capture when response is sent
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(
      `✓ ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
