import type { NextFunction, Request, Response } from "express";

export const cacheHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Apply conservative caching for API reads and no-store for mutations.
  if (req.method === "GET") {
    if (req.path === "/health") {
      res.setHeader("Cache-Control", "public, max-age=60");
    } else if (req.path.startsWith("/api/")) {
      // Avoid caching authenticated API responses to prevent stale task lists.
      res.setHeader("Cache-Control", "no-store");
    }
  } else {
    res.setHeader("Cache-Control", "no-store");
  }

  next();
};
