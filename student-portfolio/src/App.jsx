import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Spinner from "./components/Spinner";

// Route-based lazy loading and code splitting
const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));

function App() {
  return (
    <div className="container">
      <NavBar />

      <Suspense
        fallback={
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
            <p style={{ marginTop: "8px", color: "#888", fontSize: "0.95rem" }}>
              Loading page...
            </p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
