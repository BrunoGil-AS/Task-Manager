import express from "express";
import tasksRouter from "./tasks/routes/router.js";
import usersRouter from "./users/routes/router.js";
import { loggingMiddleware } from "./middleware/loggingMiddleware.js";
import cors, { type CorsOptions } from "cors";
import ApiError from "./error/ApiError.js";
import { errorHandler } from "./error/errorHandler.js";
import helmet from "helmet";
import dotenv from "dotenv";
import { getRequestLogger } from "./config/logger.js";

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Logging middleware should run before routes and the 404 handler
app.use(loggingMiddleware);

app.use(helmet());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (
  process.env.CORS_ORIGIN ?? "http://localhost:4200,http://127.0.0.1:4200"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed =
      allowedOrigins.length === 0 || allowedOrigins.includes(origin);
    callback(isAllowed ? null : new Error("CORS origin blocked"), isAllowed);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

app.use((req, _res, next) => {
  if (req.method === "OPTIONS") {
    const log = getRequestLogger(req);
    log.info(
      {
        origin: req.headers.origin,
        accessControlRequestMethod: req.headers["access-control-request-method"],
        accessControlRequestHeaders:
          req.headers["access-control-request-headers"],
      },
      "cors.preflight",
    );
  }
  next();
});

//cors middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// API routes
app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);
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
