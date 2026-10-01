import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";
import { useAuth } from "../context/AuthContext";
import {
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  AlertIcon,
  LoaderIcon,
  ArrowLeftIcon,
} from "../components/Icons";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in every field.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      setSubmitting(true);
      await register(name.trim(), email.trim(), password);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back-home">
        <ArrowLeftIcon width={15} height={15} /> Back to home
      </Link>

      <aside className="auth-page__brand">
        <div className="auth-page__brand-top">
          <span className="logo-mark">FA</span>
          <span>Forma AI</span>
        </div>

        <div className="auth-page__brand-mid">
          <h2>Get set up in under a minute.</h2>
          <p>
            Create your free account and start filing claims with plain-English
            descriptions instead of 50-question forms.
          </p>
        </div>

        <div className="auth-page__stats">
          <div>
            <strong>Free</strong>
            <span>to create an account</span>
          </div>
          <div>
            <strong>Secure</strong>
            <span>password hashing &amp; JWT sessions</span>
          </div>
        </div>
      </aside>

      <main className="auth-page__form">
        <div className="auth-card">
          <div className="auth-card__mobile-brand">
            <span className="logo-mark">FA</span>
            <strong>Forma AI</strong>
          </div>

          <h1>Create your account</h1>
          <p>Start using Forma AI in a few seconds.</p>

          {error && (
            <div className="auth-error">
              <AlertIcon width={16} height={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} noValidate>
            <div className="auth-field">
              <label>Full name</label>
              <div className="input-wrap">
                <UserIcon width={16} height={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Email</label>
              <div className="input-wrap">
                <MailIcon width={16} height={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="input-wrap">
                <LockIcon width={16} height={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon width={16} height={16} />
                  ) : (
                    <EyeIcon width={16} height={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label>Confirm password</label>
              <div className="input-wrap">
                <LockIcon width={16} height={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderIcon /> Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
