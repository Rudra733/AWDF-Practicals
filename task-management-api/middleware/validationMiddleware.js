// Middleware to validate user registration input
const validateRegister = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Email is required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Please provide a valid email address.",
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Password must be at least 6 characters long.",
    });
  }

  next();
};

// Middleware to validate user login input
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Email is required.",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Password is required.",
    });
  }

  next();
};

// Middleware to validate new task input
const validateTask = (req, res, next) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Task title is required and cannot be empty.",
    });
  }

  next();
};

// Middleware to validate task update input
const validateTaskUpdate = (req, res, next) => {
  const { title, completed, description } = req.body;

  if (
    title === undefined &&
    completed === undefined &&
    description === undefined
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Validation Error: Please provide at least one field to update (title, completed, or description).",
    });
  }

  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Task title cannot be empty.",
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask,
  validateTaskUpdate,
};
