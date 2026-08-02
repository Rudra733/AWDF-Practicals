# Richardson Maturity Model Evaluation

## API

Task Management API

Base URL:

```
http://localhost:3000
```

---

# Richardson Maturity Model Evaluation

## Level 0 – The Swamp of POX

### Description

Level 0 APIs expose a single endpoint and perform all operations through it.

### Evaluation

The Task Management API does not use a single endpoint. Instead, it exposes separate endpoints for task operations.

**Result:** Passed Level 0.

---

## Level 1 – Resources

### Description

Level 1 introduces resource-oriented URLs.

### Evaluation

The API exposes resources using meaningful URLs:

- GET /tasks
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id

Each endpoint represents the Task resource.

**Result:** Satisfies Level 1.

---

## Level 2 – HTTP Verbs

### Description

Level 2 correctly uses HTTP methods and status codes.

### Evaluation

The API uses:

| Method | Endpoint | Purpose |
|---------|-----------|---------|
| GET | /tasks | Retrieve all tasks |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

The API also returns appropriate status codes:

- 200 OK
- 201 Created
- 404 Not Found

Therefore, the API satisfies Richardson Maturity Model Level 2.

---

## Level 3 – Hypermedia (HATEOAS)

### Description

Level 3 APIs include hyperlinks in responses that guide clients to available actions.

Example:

```json
{
  "id": 1,
  "title": "Learn Express",
  "completed": false,
  "_links": {
    "self": "/tasks/1",
    "update": "/tasks/1",
    "delete": "/tasks/1"
  }
}
```

### Evaluation

The current API does not return hypermedia links.

Therefore, it does not satisfy Level 3.

---

# Final Result

| Level | Status |
|--------|--------|
| Level 0 | ✔ Passed |
| Level 1 | ✔ Passed |
| Level 2 | ✔ Passed |
| Level 3 | ✘ Not Implemented |

---

# Conclusion

The Task Management API satisfies **Richardson Maturity Model Level 2** because it uses resource-based URLs, appropriate HTTP methods, and proper HTTP status codes. It does not satisfy Level 3 because it does not implement HATEOAS (Hypermedia as the Engine of Application State).