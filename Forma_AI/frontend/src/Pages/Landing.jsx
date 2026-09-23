import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <div className="landing-card">
        <div className="logo-mark">FA</div>

        <h1>Forma AI</h1>

        <p>
          AI-augmented insurance claim assistant.
          Describe your incident and let Forma AI
          structure your claim automatically.
        </p>

        <button
          className="btn btn--primary"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>

        <button
          className="btn btn--ghost"
          onClick={() => navigate("/register")}
        >
          Create Account
        </button>
      </div>
    </main>
  );
}