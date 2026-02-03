import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Extender Request de Express
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

const JWKS_URL = `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`;
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

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

    // Verificar el JWT usando las claves públicas de Supabase
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.SUPABASE_URL}/auth/v1`, // Revisar si esto es aun aplicable
    });

    // Agregar usuario al request
    req.user = {
      sub: payload.sub as string,
      email: payload.email as string | undefined,
      accessToken: token,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
