const mongoose = require("mongoose");
const { log } = require("../utils/logger");

const connectDB = async () => {
  try {
    mongoose.set("bufferCommands", false);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
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
