import express from "express";
import router from "./tasks/routes/router.js";
import { loggingMiddleware } from "./middleware/loggingMiddleware.js";
import cors from "cors";
import ApiError from "./error/ApiError.js";
import { errorHandler } from "./error/errorHandler.js";

const tasksRouter = router;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Logging middleware should run before routes and the 404 handler
app.use(loggingMiddleware);

//cors middleware
app.use(cors());

// API routes
app.use("/api/tasks", tasksRouter);

// 404 handler: forward to centralized error handler for consistent responses
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
