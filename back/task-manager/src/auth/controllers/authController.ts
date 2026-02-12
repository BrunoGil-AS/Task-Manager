import type { Request, Response } from "express";
import { createAuthenticatedClient, supabase } from "../../config/supabaseClient.js";
import { getRequestLogger } from "../../config/logger.js";

const FRONTEND_RESET_PASSWORD_URL =
  process.env.FRONTEND_RESET_PASSWORD_URL ?? "http://localhost:4200/reset-password";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export class AuthController {
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    const log = getRequestLogger(req);
    try {
      const email = (req.body?.email ?? "").toString().trim().toLowerCase();

      if (!email || !EMAIL_REGEX.test(email)) {
        res.status(400).json({
          success: false,
          error: "Please provide a valid email address",
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: FRONTEND_RESET_PASSWORD_URL,
      });

      if (error) {
        log.error({ code: error.code, message: error.message }, "auth.forgot_password.error");
        res.status(500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (error) {
      log.error({ err: error }, "auth.forgot_password.exception");
      res.status(500).json({
        success: false,
        error: "Could not process forgot password request",
      });
    }
  }

  async updatePassword(req: Request, res: Response): Promise<void> {
    const log = getRequestLogger(req);
    try {
      const accessToken = req.user?.accessToken;
      const password = (req.body?.password ?? "").toString();

      if (!accessToken) {
        res.status(401).json({ success: false, error: "Invalid or expired token" });
        return;
      }

      if (password.length < MIN_PASSWORD_LENGTH) {
        res.status(400).json({
          success: false,
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        });
        return;
      }

      const authenticatedClient = createAuthenticatedClient(accessToken);
      const { error } = await authenticatedClient.auth.updateUser({ password });

      if (error) {
        const statusCode =
          error.status === 401 || error.status === 403
            ? 401
            : error.status && error.status >= 400 && error.status < 500
              ? 400
              : 500;
        log.error({ code: error.code, message: error.message }, "auth.reset_password.error");
        res.status(statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      log.error({ err: error }, "auth.reset_password.exception");
      res.status(500).json({
        success: false,
        error: "Could not update password",
      });
    }
  }
}

export default new AuthController();
