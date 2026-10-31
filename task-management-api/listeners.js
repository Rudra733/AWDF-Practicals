const taskEvents = require("./events");

// Register listener for 'task-created' event
taskEvents.on("task-created", (task) => {
  // Asynchronous background task execution with artificial delay
  setTimeout(() => {
    const notificationTime = new Date().toISOString();
    console.log(
      `[Notification Listener] Task "${task.title}" processed at ${notificationTime} | Assigned User: ${task.user || "Unassigned"}`
    );
  }, 1000); // 1-second delay demonstrating non-blocking async execution
});

module.exports = taskEvents;

