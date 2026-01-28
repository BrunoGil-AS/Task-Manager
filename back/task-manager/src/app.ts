import express from "express";
import router from "./tasks/routes/router.js";
import { loggingMiddleware } from "./middleware/loggingMiddleware.js";
import cors from "cors";
import ApiError from "./error/ApiError.js";
import { errorHandler } from "./error/errorHandler.js";
import helmet from "helmet";
import dotenv from "dotenv";

const tasksRouter = router;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Logging middleware should run before routes and the 404 handler
app.use(loggingMiddleware);

app.use(helmet());
app.use(express.urlencoded({ extended: true }));

//cors middleware
app.use(cors());

// API routes
app.use("/api/tasks", tasksRouter);
// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// 404 handler: forward to centralized error handler for consistent responses
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
