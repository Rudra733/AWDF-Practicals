require("dotenv").config();
const dns = require("dns");

// Set public DNS servers only when connecting to MongoDB Atlas SRV clusters (avoids breaking Docker internal DNS)
if (process.env.MONGO_URI && process.env.MONGO_URI.startsWith("mongodb+srv://")) {
  try {
    dns.setDefaultResultOrder?.("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
  }
}

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Reduce Mongoose operation buffering timeout to 3 seconds
mongoose.set("bufferTimeoutMS", 3000);

// Initialize background event listeners
require("./listeners");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend requests
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Request Logging Middleware (disable in test environment)
if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Connect to MongoDB Atlas (skip during isolated unit tests)
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://24it016_db_user:RRtf6c9leEY9Cbq8@cluster0.uhwsxln.mongodb.net/taskdb?retryWrites=true&w=majority";

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    })
    .then(() => {
      console.log("Connected to MongoDB Atlas successfully");
    })
    .catch((err) => {
      console.error("MongoDB Atlas connection error:", err.message);
    });
}

// Test / Health Route
app.get("/", (req, res) => {
  res.status(200).send("Task Management API is running!");
});

// Auth Routes (Registration & Login)
app.use("/", authRoutes);
app.use("/api", authRoutes);

// Protected Task Routes
app.use("/tasks", taskRoutes);
app.use("/api/tasks", taskRoutes);

// Test Global Error Handler
app.get("/error", (req, res, next) => {
  const error = new Error("Something went wrong!");
  error.status = 500;
  next(error);
});

// Global Error Handler
app.use(errorHandler);

// Start Server only when executed directly (not when required by Jest)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
