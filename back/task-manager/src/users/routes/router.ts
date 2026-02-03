import { Router } from "express";
import userController from "../controllers/UserController.js";
import { authenticateUser } from "../../middleware/auth.js";

const router = Router();

router.use(authenticateUser);

// GET current user profile
router.get("/me", userController.getProfile);

// PUT update current user profile
router.put("/me", userController.updateProfile);

// DELETE disable current user account
router.delete("/me", userController.deleteAccount);

export default router;
