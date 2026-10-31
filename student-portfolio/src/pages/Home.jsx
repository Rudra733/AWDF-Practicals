import { useState } from "react";
import Header from "../components/Header";
import About from "../components/About";
import Skills from "../components/Skills";
import Footer from "../components/Footer";

function Home() {
  const [themeColor, setThemeColor] = useState("#2563eb");
  const [showAbout, setShowAbout] = useState(true);

  const skills = [
    "C",
    "C++",
    "Java",
    "HTML",
    "CSS",
    "React"
  ];

  return (
    <div className="container">

      <Header
        name="Rudra Dodiya"
        themeColor={themeColor}
      />

      <button
        onClick={() =>
          setThemeColor(themeColor === "#2563eb" ? "red" : "#00ff00")
        }
      >
        Change Header Color
      </button>

      <button
  onClick={() => setShowAbout(!showAbout)}
>
  {showAbout ? "Hide About" : "Show About"}
</button>

      {showAbout && <About />}

      <Skills skillList={skills} />

      <Footer />

    </div>
  );
}

export default Home;