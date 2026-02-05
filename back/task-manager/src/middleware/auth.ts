import type { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabaseClient.js";

// Extender Request de Express (SIN CAMBIOS)
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string; // user ID
        email: string | undefined;
        accessToken: string;
      };
    }
  }
}

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);

    // ✅ Verificar el JWT usando el cliente de Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Agregar usuario al request (MISMA ESTRUCTURA)
    req.user = {
      sub: user.id,
      email: user.email,
      accessToken: token,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
