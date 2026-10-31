const request = require("supertest");
const app = require("./index");

describe("Task Management API Automated Tests", () => {
  test("GET / health check returns status 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Task Management API is running!");
  });

  test("GET /tasks without token returns 401 Unauthorized", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(401);
  });
});
