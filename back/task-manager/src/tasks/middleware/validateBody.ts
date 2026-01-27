import type { Request, Response, NextFunction } from "express";
import * as z from "zod";

export const validateBody =
  <S extends z.ZodTypeAny>(schema: S) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: z.treeifyError(result.error),
      });
    }

    req.body = result.data;
    next();
  };
