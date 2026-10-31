import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

function Projects() {
  const [tasks, setTasks] = useState([]);

  // Auth states
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // AI generation states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null); // { description, priority, fallback, message }

  // Individual operation states
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all tasks with JWT token
  const fetchTasks = (authToken = token) => {
    if (!authToken) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch("http://localhost:3000/tasks", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          handleLogout();
          throw new Error("Session expired or unauthorized. Please log in.");
        }
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return response.json();
      })
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch tasks when token changes
  useEffect(() => {
    if (token) {
      fetchTasks(token);
    }
  }, [token]);

  // Handle Login / Registration
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    setAuthMessage(null);

    const endpoint = isRegistering
      ? "http://localhost:3000/register"
      : "http://localhost:3000/login";

    const payload = isRegistering
      ? { name: authName, email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword };

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Authentication failed");
        }
        return data;
      })
      .then((data) => {
        if (isRegistering) {
          setAuthMessage("Registration successful! Please log in.");
          setIsRegistering(false);
          setAuthPassword("");
        } else {
          // Login successful
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
          setAuthPassword("");
          setAuthMessage(null);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setTasks([]);
  };

  // AI: Generate task description using Gemini API (via backend)
  const generateAiDescription = async () => {
    if (!title.trim()) {
      setError("Enter a task title first before generating a description.");
      return;
    }
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await fetch("http://localhost:3000/api/ai/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      setAiSuggestion(data);
      if (data.description) {
        setDescription(data.description); // auto-fill the textarea
      }
    } catch {
      setAiSuggestion({
        description: "",
        fallback: true,
        message: "Could not reach AI service. Please enter description manually.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Create a new task (Protected with JWT & validated)
  const createTask = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setCreating(true);
    setError(null);

    fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to create task");
        }
        return data;
      })
      .then((newTask) => {
        setTasks((previousTasks) => [newTask, ...previousTasks]);
        setTitle("");
        setDescription("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setCreating(false);
      });
  };

  // Toggle task completed status (Protected with JWT)
  const updateTask = (task) => {
    setUpdatingId(task._id);
    setError(null);

    fetch(`http://localhost:3000/tasks/${task._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        completed: !task.completed,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to update task");
        }
        return data;
      })
      .then((updatedTask) => {
        setTasks((previousTasks) =>
          previousTasks.map((item) =>
            item._id === updatedTask._id ? updatedTask : item
          )
        );
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setUpdatingId(null);
      });
  };

  // Delete a task (Protected with JWT)
  const deleteTask = (id) => {
    setDeletingId(id);
    setError(null);

    fetch(`http://localhost:3000/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to delete task");
        }
        return data;
      })
      .then(() => {
        setTasks((previousTasks) =>
          previousTasks.filter((task) => task._id !== id)
        );
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setDeletingId(null);
      });
  };

  return (
    <div>
      <h1>Task Management</h1>

      {/* Global Error message */}
      {error && (
        <div style={{ marginBottom: "1rem" }}>
          <ErrorMessage message={error} />
          {token && <button onClick={() => fetchTasks()}>Retry</button>}
        </div>
      )}

      {/* Auth Success message */}
      {authMessage && (
        <div
          style={{
            padding: "0.5rem 1rem",
            marginBottom: "1rem",
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: "4px",
          }}
        >
          {authMessage}
        </div>
      )}

      {/* Auth Section: Login / Register when no token */}
      {!token ? (
        <div
          style={{
            background: "rgba(18, 24, 38, 0.8)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            borderRadius: "14px",
            padding: "2rem",
            maxWidth: "420px",
            marginBottom: "2rem",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.6)",
          }}
        >
          <h2>{isRegistering ? "Register New Account" : "Login"}</h2>
          <form onSubmit={handleAuthSubmit} style={{ padding: 0, border: "none", background: "none", boxShadow: "none" }}>
            {isRegistering && (
              <div style={{ marginBottom: "0.75rem" }}>
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem 0.9rem" }}
                />
              </div>
            )}
            <div style={{ marginBottom: "0.75rem" }}>
              <input
                type="email"
                placeholder="Email address"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={{ width: "100%", padding: "0.6rem 0.9rem" }}
              />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={{ width: "100%", padding: "0.6rem 0.9rem" }}
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              style={{ width: "100%", padding: "0.65rem 1rem", marginTop: "0.5rem" }}
            >
              {authLoading
                ? "Processing..."
                : isRegistering
                  ? "Register"
                  : "Log In"}
            </button>
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                  setAuthMessage(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#38bdf8",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                  fontSize: "0.9rem",
                  boxShadow: "none",
                }}
              >
                {isRegistering
                  ? "Already have an account? Log in here"
                  : "Need an account? Register here"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Authenticated User Status */
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(18, 24, 38, 0.75)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            padding: "0.85rem 1.25rem",
            borderRadius: "12px",
            marginBottom: "1.75rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div>
            <span style={{ color: "#94a3b8", marginRight: "6px" }}>Logged in as:</span>
            <strong style={{ color: "#ffffff" }}>{user?.name || user?.email || "User"}</strong>{" "}
            <span style={{ color: "#64748b" }}>({user?.email})</span>
            <span
              style={{
                marginLeft: "0.85rem",
                fontSize: "0.8rem",
                color: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "3px 10px",
                borderRadius: "9999px",
                fontWeight: "700",
                letterSpacing: "0.03em",
              }}
            >
              🔒 JWT Protected
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 1rem",
              cursor: "pointer",
              backgroundColor: "rgba(244, 63, 94, 0.12)",
              color: "#fb7185",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              borderRadius: "8px",
              boxShadow: "none",
              fontSize: "0.85rem",
              margin: 0,
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* When authenticated, show Create Task and Task List */}
      {token && (
        <>
          {/* Create Task Form */}
          <form onSubmit={createTask}>
            <h2>Create Task</h2>

            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <br />

            {/* ✨ AI Generate Description Button */}
            <button
              type="button"
              onClick={generateAiDescription}
              disabled={aiLoading}
              style={{
                margin: "0.5rem 0 1rem",
                padding: "0.55rem 1.15rem",
                background: aiLoading
                  ? "rgba(100, 116, 139, 0.4)"
                  : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                color: "#fff",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                borderRadius: "8px",
                cursor: aiLoading ? "not-allowed" : "pointer",
                fontSize: "0.92rem",
                fontWeight: 600,
                boxShadow: aiLoading
                  ? "none"
                  : "0 4px 18px rgba(168, 85, 247, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              {aiLoading ? "⏳ Generating with Gemini..." : "✨ Generate Description with AI"}
            </button>

            {/* AI Suggestion Feedback */}
            {aiSuggestion && !aiSuggestion.fallback && (
              <div
                style={{
                  margin: "0.75rem 0 1rem",
                  padding: "0.85rem 1.25rem",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "10px",
                  fontSize: "0.92rem",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.15)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>
                    ✅ <strong>AI Description Applied!</strong>
                  </span>
                  {aiSuggestion.priority && (
                    <span
                      style={{
                        padding: "0.2rem 0.65rem",
                        backgroundColor:
                          aiSuggestion.priority === "high"
                            ? "rgba(244, 63, 94, 0.18)"
                            : aiSuggestion.priority === "low"
                              ? "rgba(16, 185, 129, 0.18)"
                              : "rgba(245, 158, 11, 0.18)",
                        color:
                          aiSuggestion.priority === "high"
                            ? "#fb7185"
                            : aiSuggestion.priority === "low"
                              ? "#34d399"
                              : "#fbbf24",
                        border:
                          aiSuggestion.priority === "high"
                            ? "1px solid rgba(244, 63, 94, 0.4)"
                            : aiSuggestion.priority === "low"
                              ? "1px solid rgba(16, 185, 129, 0.4)"
                              : "1px solid rgba(245, 158, 11, 0.4)",
                        borderRadius: "9999px",
                        fontWeight: "700",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Priority: {aiSuggestion.priority}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: "0.45rem", color: "#e2e8f0", fontStyle: "italic", lineHeight: 1.5 }}>
                  "{aiSuggestion.description}"
                </div>
              </div>
            )}

            {aiSuggestion && aiSuggestion.fallback && (
              <div
                style={{
                  margin: "0.75rem 0 1rem",
                  padding: "0.85rem 1.25rem",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  color: "#fbbf24",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "10px",
                  fontSize: "0.92rem",
                }}
              >
                ⚠️ <strong>AI Notice:</strong>{" "}
                {aiSuggestion.message || "Please enter description manually."}
              </div>
            )}

            <br />

            <textarea
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <br />

            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Add Task"}
            </button>
          </form>

          <hr />

          {/* Task List */}
          <h2>Tasks</h2>

          {loading ? (
            <Spinner />
          ) : tasks.length === 0 ? (
            <p>No tasks found.</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task._id}>
                  <strong>{task.title}</strong>

                  <p>{task.description}</p>

                  <p>
                    Status: {task.completed ? "Completed" : "Pending"}
                  </p>

                  <button
                    onClick={() => updateTask(task)}
                    disabled={updatingId === task._id}
                  >
                    {updatingId === task._id
                      ? "Updating..."
                      : task.completed
                        ? "Mark Pending"
                        : "Mark Completed"}
                  </button>{" "}
                  <button
                    onClick={() => deleteTask(task._id)}
                    disabled={deletingId === task._id}
                  >
                    {deletingId === task._id ? "Deleting..." : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default Projects;