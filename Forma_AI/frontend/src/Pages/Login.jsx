import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();


    navigate("/claims");
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="logo-mark">FA</div>

        <h1>Welcome back</h1>

        <p>Login to continue to Forma AI.</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            className="btn btn--primary"
          >
            Login
          </button>
        </form>

        <p className="auth-link">
          New here?{" "}
          <Link to="/register">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}