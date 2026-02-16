import type { Request, Response } from "express";
import userService from "../services/userService.js";
import type { UpdateUserDTO } from "../model/User.js";
import { getRequestLogger } from "../../config/logger.js";
import type { UserResponseDTO } from "./UserControllerDTOs.js";

/**
 * HTTP controller for authenticated user profile operations.
 */
export class UserController {
  /**
   * Handles `GET /api/users/me`.
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const log = getRequestLogger(req);
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken;

      if (!userId || !accessToken) {
        log.warn({ hasUser: Boolean(userId) }, "users.getProfile.unauthorized");
        res.status(401).json({ error: "Access denied" });
        return;
      }

      const user = await userService.getUserInfo(userId, accessToken);
      log.debug({ userId }, "users.getProfile.ok");
      const response: UserResponseDTO = { success: true, data: user };
      res.status(200).json(response);
    } catch (error) {
      const log = getRequestLogger(req);
      log.error({ err: error }, "users.getProfile.error");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Handles `PUT /api/users/me`.
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const log = getRequestLogger(req);
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken;

      if (!userId || !accessToken) {
        log.warn(
          { hasUser: Boolean(userId) },
          "users.updateProfile.unauthorized",
        );
        res.status(401).json({ error: "Access denied" });
        return;
      }

      const { name } = req.body as UpdateUserDTO;
      if (!name || !name.toString().trim()) {
        log.warn({ userId }, "users.updateProfile.missing_name");
        res.status(400).json({ error: "Name is required" });
        return;
      }

      const updatedUser = await userService.updateUser(
        userId,
        { name: name.toString().trim() },
        accessToken,
      );

      log.info({ userId }, "users.updateProfile.ok");
      const response: UserResponseDTO = {
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      };
      res.status(200).json(response);
    } catch (error) {
      const log = getRequestLogger(req);
      log.error({ err: error }, "users.updateProfile.error");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Handles `DELETE /api/users/me`.
   */
  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const log = getRequestLogger(req);
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken;

      if (!userId || !accessToken) {
        log.warn(
          { hasUser: Boolean(userId) },
          "users.deleteAccount.unauthorized",
        );
        res.status(401).json({ error: "Access denied" });
        return;
      }

      const disabledUser = await userService.deleteUser(userId, accessToken);
      log.info({ userId }, "users.deleteAccount.ok");
      const response: UserResponseDTO = {
        success: true,
        data: disabledUser,
        message: "User disabled successfully",
      };
      res.status(200).json(response);
    } catch (error) {
      const log = getRequestLogger(req);
      log.error({ err: error }, "users.deleteAccount.error");
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new UserController();
