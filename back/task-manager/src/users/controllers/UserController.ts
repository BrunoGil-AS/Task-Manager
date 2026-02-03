import type { Request, Response } from "express";
import userService from "../services/userService.js";
import type { UpdateUserDTO } from "../model/User.js";

export class UserController {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken;

      if (!userId || !accessToken) {
        res.status(401).json({ error: "Access denied" });
        return;
      }

      const user = await userService.getUserInfo(userId, accessToken);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken;

      if (!userId || !accessToken) {
        res.status(401).json({ error: "Access denied" });
        return;
      }

      const { name } = req.body as UpdateUserDTO;
      if (!name || !name.toString().trim()) {
        res.status(400).json({ error: "Name is required" });
        return;
      }

      const updatedUser = await userService.updateUser(
        userId,
        { name: name.toString().trim() },
        accessToken,
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const accessToken = req.user?.accessToken;

      if (!userId || !accessToken) {
        res.status(401).json({ error: "Access denied" });
        return;
      }

      const disabledUser = await userService.deleteUser(userId, accessToken);
      res.status(200).json({
        success: true,
        data: disabledUser,
        message: "User disabled successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new UserController();
