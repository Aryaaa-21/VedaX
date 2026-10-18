const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const connectDB = require("./config/db");
const { getConfig, validateEnvironment } = require("./config/env");
const { isDatabaseReady } = require("./middleware/database");
const { apiLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { log } = require("./utils/logger");

const getAllowedOrigins = (config) => {
  const origins = new Set([
    ...config.corsOrigins,
    config.clientUrl,
    process.env.FRONTEND_URL,
    "https://vedaxmaths.netlify.app",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
  ]);

  return [...origins].filter(Boolean);
};

const createApp = () => {
  const config = getConfig();
  const app = express();
  const allowedOrigins = getAllowedOrigins(config);

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);

      const isPreview = config.allowPreviewOrigins && config.nodeEnv !== "production" && (
        /^https:\/\/.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.onrender\.com$/.test(origin)
      );

      if (isPreview) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: false
  }));

  app.use(express.json({ limit: config.bodyLimit }));
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      log("info", "HTTP request", {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      });
    });
    next();
  });

  app.get("/health", (req, res) => res.json({
    status: "healthy",
    database: isDatabaseReady() ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  }));

  app.get("/ready", (req, res) => {
    if (!isDatabaseReady()) {
      return res.status(503).json({ status: "not_ready", database: "unavailable" });
    }
    return res.json({ status: "ready", database: "connected" });
  });

  app.use(apiLimiter);
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/user", require("./routes/user"));
  app.use("/api/leaderboard", require("./routes/leaderboard"));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

const app = createApp();

const startServer = async () => {
  const config = validateEnvironment();
  await connectDB();

  return app.listen(config.port, "0.0.0.0", () => {
    log("info", "VedaX API listening", { port: config.port, environment: config.nodeEnv });
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    log("error", "Server startup failed", { reason: error.message });
    process.exitCode = 1;
  });
}

module.exports = { app, createApp, startServer, getAllowedOrigins };
