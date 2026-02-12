import { Router } from "express";
import authController from "../controllers/authController.js";
import { authenticateUser } from "../../middleware/auth.js";

const router = Router();

router.post("/forgot-password", authController.requestPasswordReset.bind(authController));
router.post(
  "/reset-password",
  authenticateUser,
  authController.updatePassword.bind(authController),
);

export default router;
