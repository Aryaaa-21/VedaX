const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");
const path = require("path");

// Load env vars before reading deployment config.
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Use public DNS resolvers only if explicitly configured in environment variables
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(","));
}

const connectDB = require("./config/db");

// Connect to database
connectDB();

const app = express();

// Middlewares
const allowedOrigins = [
  process.env.CLIENT_URL,
  // Netlify
  "https://vedaxmaths.netlify.app",
  // Vercel — add your production Vercel URL here
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  // Local dev
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost:") ||
      // Allow all Vercel preview deployments (*.vercel.app)
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      // Allow all Render frontend deployments (*.onrender.com)
      /^https:\/\/.*\.onrender\.com$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/leaderboard", require("./routes/leaderboard"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error occurred" });
});

const PORT = process.env.PORT || 5000;
// Bind to 0.0.0.0 so Render (and other cloud hosts) can route traffic in
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
