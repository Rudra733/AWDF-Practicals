const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");
const cache = require("../cache");
const taskEvents = require("../events");
const {
  validateTask,
  validateTaskUpdate,
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Protected Route Flow:
// Client Request (Authorization: Bearer <token>) -> [Auth Middleware] -> req.user set
router.use(authMiddleware);

// GET /tasks - Fetch tasks for the authenticated user (with in-memory cache)
router.get("/", async (req, res, next) => {
  try {
    const cacheKey = req.user?.userId ? `tasks_${req.user.userId}` : "all_tasks";

    // 1. Check cache first (Cache HIT)
    const cached = cache.get(cacheKey) || cache.get("all_tasks");
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cached);
    }

    // 2. Cache MISS: Query MongoDB
    const tasks = await Task.find({
      $or: [
        { user: req.user.userId },
        { user: null },
        { user: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    // 3. Store in cache (TTL: 60s)
    cache.set(cacheKey, tasks);
    cache.set("all_tasks", tasks);

    res.setHeader("X-Cache", "MISS");
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create a new task (Invalidates cache)
router.post("/", validateTask, async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : "",
      completed: Boolean(completed),
      user: req.user.userId,
    });

    const savedTask = await newTask.save();

    // Invalidate cache on write
    cache.del("all_tasks");
    if (req.user?.userId) {
      cache.del(`tasks_${req.user.userId}`);
    }

    // 1. Send immediate response to client
    const apiResponseTimestamp = new Date().toISOString();
    console.log(`[API] Response sent at ${apiResponseTimestamp} for task: "${savedTask.title}"`);
    res.status(201).json(savedTask);

    // 2. Emit asynchronous event for background processing
    taskEvents.emit("task-created", savedTask);
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - Update task by ID (Invalidates cache)
router.put("/:id", validateTaskUpdate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (completed !== undefined) updateFields.completed = completed;

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { user: req.user.userId },
          { user: null },
          { user: { $exists: false } },
        ],
      },
      updateFields,
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not authorized to update.",
      });
    }

    // Invalidate cache on write
    cache.del("all_tasks");
    if (req.user?.userId) {
      cache.del(`tasks_${req.user.userId}`);
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete task by ID (Invalidates cache)
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      $or: [
        { user: req.user.userId },
        { user: null },
        { user: { $exists: false } },
      ],
    });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not authorized to delete.",
      });
    }

    // Invalidate cache on write
    cache.del("all_tasks");
    if (req.user?.userId) {
      cache.del(`tasks_${req.user.userId}`);
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
