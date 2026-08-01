const express = require("express");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(
    `[${new Date().toLocaleString()}] ${req.method} ${req.url}`
  );

  next();
});

// In-memory task storage
let tasks = [
  {
    id: 1,
    title: "Learn Express",
    completed: false,
  },
  {
    id: 2,
    title: "Build Task API",
    completed: false,
  },
];

// Test Route
app.get("/", (req, res) => {
  res.send("Task Management API is running!");
});

// GET all tasks
app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});


// POST a new task
app.post("/tasks", (req, res) => {
  const { title, completed } = req.body;

  const newTask = {
    id: tasks.length + 1,
    title,
    completed: completed || false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// PUT (Update) a task
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const { title, completed } = req.body;

  if (title !== undefined) {
    task.title = title;
  }

  if (completed !== undefined) {
    task.completed = completed;
  }

  res.status(200).json(task);
});

// DELETE a task
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  tasks.splice(taskIndex, 1);

  res.status(200).json({
    message: "Task deleted successfully",
  });
});

// Test Global Error Handler
app.get("/error", (req, res, next) => {

  const error = new Error("Something went wrong!");

  error.status = 500;

  next(error);

});

app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});