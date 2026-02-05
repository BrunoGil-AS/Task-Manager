import "express";

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        sub: string;
        email: string | undefined;
        accessToken: string;
      };
    }
  }
}
