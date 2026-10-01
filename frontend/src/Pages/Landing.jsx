import { Link } from "react-router-dom";
import "./landing.css";
import { useAuth } from "../context/AuthContext";
import {
  SparklesIcon,
  GaugeIcon,
  UploadIcon,
  FormIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ShieldIcon,
  ZapIcon,
  LayersIcon,
} from "../components/Icons";

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Magic Input",
    body: "Describe your incident in plain English. Forma AI extracts the vehicle, location, damage and date automatically.",
  },
  {
    icon: FormIcon,
    title: "Dynamic branching form",
    body: "Only the questions that matter show up — a theft claim asks for a police report, an animal collision asks about the animal.",
  },
  {
    icon: GaugeIcon,
    title: "Readiness scoring",
    body: "A live completeness score and a checklist of exactly what's missing before you submit.",
  },
  {
    icon: UploadIcon,
    title: "Evidence attachments",
    body: "Drag in photos or a PDF police report and attach them straight to the claim record.",
  },
];

const STEPS = [
  {
    title: "Describe what happened",
    body: "Type your claim story the way you'd tell a friend — no jargon, no dropdowns.",
  },
  {
    title: "Review the pre-filled form",
    body: "Forma AI structures it into fields, flags anything missing, and scores it for completeness.",
  },
  {
    title: "Save, attach evidence, done",
    body: "Save your claim, attach photos or documents, and revisit or edit it any time.",
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav__brand">
          <span className="logo-mark">FA</span>
          <span>Forma AI</span>
        </div>

        <nav className="landing-nav__links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="landing-nav__cta">
          {isAuthenticated ? (
            <Link to="/app" className="btn btn--primary btn--small">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--small">
                Login
              </Link>
              <Link to="/register" className="btn btn--primary btn--small">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* ============ Hero ============ */}
        <section className="hero">
          <div className="hero__copy">
            <span className="eyebrow">
              <ZapIcon width={13} height={13} /> AI-augmented claim assistant
            </span>

            <h1>
              File a claim in plain English.
              <br />
              <span className="hero__accent">Forma AI builds the form.</span>
            </h1>

            <p>
              Stop clicking through 50-question insurance forms. Describe what
              happened, and Forma AI structures it into a complete, submission-ready
              claim — branching questions, readiness score, and evidence all in one
              place.
            </p>

            <div className="hero__actions">
              <Link
                to={isAuthenticated ? "/app" : "/register"}
                className="btn btn--primary"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started — it's free"}
                <ArrowRightIcon width={16} height={16} />
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn btn--ghost">
                  I already have an account
                </Link>
              )}
            </div>

            <div className="hero__trust">
              <span>
                <ShieldIcon width={14} height={14} /> Passwords hashed &amp; JWT sessions
              </span>
              <span>
                <LayersIcon width={14} height={14} /> Schema-driven dynamic form
              </span>
            </div>
          </div>

          <div className="hero__preview" aria-hidden="true">
            <div className="preview-card">
              <div className="preview-card__dot-row">
                <span />
                <span />
                <span />
              </div>

              <div className="preview-card__label">
                <SparklesIcon width={13} height={13} /> Magic Input
              </div>
              <p className="preview-card__text">
                "I hit a deer on I-95 yesterday in my Honda, and the windshield
                shattered."
              </p>

              <div className="preview-card__arrow">
                <ArrowRightIcon width={16} height={16} />
              </div>

              <div className="preview-card__fields">
                <div>
                  <span>Incident Type</span>
                  <strong>Animal Collision</strong>
                </div>
                <div>
                  <span>Vehicle</span>
                  <strong>Honda</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>I-95</strong>
                </div>
                <div>
                  <span>Damage</span>
                  <strong>Windshield shattered</strong>
                </div>
              </div>

              <div className="preview-card__footer">
                <div className="mini-ring">
                  <svg viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" className="mini-ring__track" />
                    <circle cx="20" cy="20" r="16" className="mini-ring__fill" />
                  </svg>
                  <span>92%</span>
                </div>
                <span className="pill pill--violet">Ready to submit</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ Features ============ */}
        <section className="features" id="features">
          <h2>Everything a claim needs, nothing it doesn't</h2>
          <p className="section-subtitle">
            Built around one idea: the form should adapt to the story, not the
            other way around.
          </p>

          <div className="features__grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-card__icon">
                  <f.icon width={20} height={20} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ How it works ============ */}
        <section className="how-it-works" id="how-it-works">
          <h2>Three steps, start to finish</h2>

          <div className="steps">
            {STEPS.map((step, i) => (
              <div className="step" key={step.title}>
                <span className="step__number">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ CTA band ============ */}
        <section className="cta-band">
          <div>
            <h2>Ready to simplify your claims?</h2>
            <p>Create a free account and file your first claim in under a minute.</p>
          </div>

          <Link
            to={isAuthenticated ? "/app" : "/register"}
            className="btn btn--primary"
          >
            {isAuthenticated ? (
              <>
                Go to Dashboard <ArrowRightIcon width={16} height={16} />
              </>
            ) : (
              <>
                <CheckCircleIcon width={16} height={16} /> Get Started for free
              </>
            )}
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-nav__brand">
          <span className="logo-mark">FA</span>
          <span>Forma AI</span>
        </div>
        <p>AI-augmented dynamic insurance claim assistant.</p>
      </footer>
    </div>
  );
}
