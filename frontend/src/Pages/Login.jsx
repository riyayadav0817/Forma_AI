import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./auth.css";
import { useAuth } from "../context/AuthContext";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertIcon,
  LoaderIcon,
  ArrowLeftIcon,
} from "../components/Icons";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/app";

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);

      await login(email.trim(), password);

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePassword = () => {
    setShowPassword((current) => !current);
  };

  return (
    <div className="auth-page">
      {/* Back to home */}
      <Link to="/" className="auth-back-home">
        <ArrowLeftIcon width={15} height={15} />
        <span>Back to home</span>
      </Link>

      {/* =====================================================
          LEFT BRAND PANEL
      ====================================================== */}

      <aside className="auth-page__brand">
        <div className="auth-page__brand-top">
          <span className="logo-mark">FA</span>
          <span>Forma AI</span>
        </div>

        <div className="auth-page__brand-mid">
          <h2>Claims that write themselves.</h2>

          <p>
            Describe what happened in plain language — Forma AI structures it,
            flags what's missing, and keeps every claim organized in one place.
          </p>
        </div>

        <div className="auth-page__stats">
          <div>
            <strong>90%</strong>
            <span>less manual form-filling</span>
          </div>

          <div>
            <strong>&lt; 30s</strong>
            <span>to a pre-filled claim</span>
          </div>
        </div>
      </aside>

      {/* =====================================================
          LOGIN FORM
      ====================================================== */}

      <main className="auth-page__form">
        <div className="auth-card">

          {/* Mobile brand */}
          <div className="auth-card__mobile-brand">
            <span className="logo-mark">FA</span>
            <strong>Forma AI</strong>
          </div>

          <h1>Welcome back</h1>

          <p>
            Login to continue to your claims dashboard.
          </p>

          {/* Error */}
          {error && (
            <div className="auth-error" role="alert">
              <AlertIcon width={16} height={16} />

              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>

            {/* =================================================
                EMAIL
            ================================================== */}

            <div className="auth-field">
              <label htmlFor="login-email">
                Email
              </label>

              <div className="input-wrap">
                <MailIcon
                  width={16}
                  height={16}
                  aria-hidden="true"
                />

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <div className="auth-field">
              <label htmlFor="login-password">
                Password
              </label>

              <div className="input-wrap">
                {/* Lock icon */}
                <LockIcon
                  width={16}
                  height={16}
                  aria-hidden="true"
                />

                {/* Password input */}
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                {/* Show / Hide password */}
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={togglePassword}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOffIcon
                      width={18}
                      height={18}
                      aria-hidden="true"
                    />
                  ) : (
                    <EyeIcon
                      width={18}
                      height={18}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* =================================================
                LOGIN BUTTON
            ================================================== */}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderIcon />
                  <span>Logging in…</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Register */}
          <p className="auth-link">
            New here?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}