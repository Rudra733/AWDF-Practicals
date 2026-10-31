# AWDF Practicals — Full Stack Task Management & Portfolio

**Author:** Rudra Dodiya  
**Affiliation:** 3rd Year B.Tech Information Technology, CSPIT, CHARUSAT  
**Role:** Cyber Security Intern at SproutSong, Gandhinagar  

---

## 📁 Project Structure

```text
AWDF/
├── docker-compose.yml           # Multi-service container orchestration
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI/CD pipeline on push to main
├── student-portfolio/           # React frontend (Vite, lazy routes, cyber dark UI)
│   ├── Dockerfile
│   ├── src/
│   └── package.json
└── task-management-api/         # Express backend (JWT auth, caching, events, Gemini AI)
    ├── Dockerfile
    ├── routes/                  # Task, Auth, and AI routes
    ├── app.test.js              # Automated Jest/Supertest test suite
    └── package.json
```

---

## 🚀 Key Features Implemented

1. **Route-Based Lazy Loading & Code Splitting:**
   - React `lazy()` and `Suspense` with meaningful fallback spinners.
2. **Server-Side In-Memory Caching:**
   - Powered by `node-cache` on `GET /tasks` with 60s TTL and automatic write invalidation.
3. **Asynchronous Background Processing:**
   - Node.js native `EventEmitter` for non-blocking task notification events.
4. **External AI Integration (Google Gemini API):**
   - AI-powered task description generator and urgency priority classifier via `@google/genai`.
   - API key stored server-side only in `.env` with graceful fallback handling.
5. **Containerization & Orchestration:**
   - Multi-stage Dockerfiles for both frontend and backend.
   - `docker-compose.yml` orchestrating MongoDB, Express API, and React frontend over a bridge network.
6. **Automated CI/CD Pipeline:**
   - GitHub Actions workflow testing on push to `main`.

---

## 🛠️ Running the Application

### Option A: With Docker Compose (Single Command)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017/taskdb`

### Option B: Local Development
1. **Backend:**
   ```bash
   cd task-management-api
   npm install
   npm start
   ```
2. **Frontend:**
   ```bash
   cd student-portfolio
   npm install
   npm run dev
   ```
