const dns = require("dns");
const mongoose = require("mongoose");
const { log } = require("../utils/logger");

// Use Google/Cloudflare public DNS servers to resolve MongoDB SRV records on environments where local router DNS fails
try {
  const dnsServers = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
    : ["8.8.8.8", "1.1.1.1"];
  dns.setServers(dnsServers);
} catch (dnsErr) {
  log("warn", "Failed to set custom DNS servers, using system default", { reason: dnsErr.message });
}

const connectDB = async () => {
  try {
    mongoose.set("bufferCommands", false);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
      family: 4
    });
    log("info", "MongoDB connected", { host: conn.connection.host });
    return conn;
  } catch (error) {
    log("error", "MongoDB connection failed", { reason: error.message });
    return null;
  }
};

module.exports = connectDB;
