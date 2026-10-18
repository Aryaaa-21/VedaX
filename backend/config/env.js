const DEFAULT_PORT = 5000;

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const splitCsv = (value) => String(value || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const getConfig = () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number.parseInt(process.env.PORT || String(DEFAULT_PORT), 10),
  mongodbUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  clientUrl: process.env.CLIENT_URL || "",
  corsOrigins: splitCsv(process.env.CORS_ORIGINS),
  allowPreviewOrigins: parseBoolean(process.env.ALLOW_PREVIEW_ORIGINS),
  bodyLimit: process.env.BODY_LIMIT || "64kb"
});

const validateEnvironment = () => {
  const config = getConfig();
  const missing = [];

  if (!config.mongodbUri) missing.push("MONGODB_URI");
  if (!config.jwtSecret) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (config.nodeEnv === "production" && config.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }

  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return config;
};

module.exports = { getConfig, validateEnvironment, splitCsv };
