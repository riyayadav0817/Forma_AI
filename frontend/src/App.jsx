import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { api } from "./api";
import { ToastProvider, useToast } from "./components/Toast";
import ProgressRing from "./components/ProgressRing";
import EvidenceUploader from "./components/EvidenceUploader";
import ClaimsDashboard from "./components/ClaimsDashboard";
import {
  SparklesIcon,
  FormIcon,
  CheckCircleIcon,
  AlertIcon,
  GaugeIcon,
  CopyIcon,
  LoaderIcon,
  ChevronRightIcon,
} from "./components/Icons";

const EMPTY_FORM = {
  incidentType: "",
  vehicle: "",
  location: "",
  damage: "",
  date: "",
  policeReportNumber: "",
  animalDetails: "",
};

const FORM_FIELDS = [
  { name: "incidentType", label: "Incident Type", placeholder: "e.g. Accident" },
  { name: "vehicle", label: "Vehicle", placeholder: "e.g. Honda City" },
  { name: "location", label: "Location", placeholder: "e.g. I-95" },
  { name: "date", label: "Incident Date", placeholder: "e.g. Yesterday" },
  { name: "damage", label: "Damage", placeholder: "e.g. Windshield damaged", wide: true },
  {
    name: "policeReportNumber",
    label: "Police Report Number",
    placeholder: "e.g. PR-2026-00451",
    showIf: { field: "incidentType", equals: "Theft" },
  },
  {
    name: "animalDetails",
    label: "Animal Details",
    placeholder: "e.g. Full-grown deer, ran off after impact",
    showIf: { field: "incidentType", equals: "Animal Collision" },
  },
];

const EXAMPLES = [
  {
    label: "🦌 Animal collision",
    text: "I hit a deer on I-95 yesterday in my Honda, and the windshield shattered.",
  },
  {
    label: "🚗 Accident",
    text: "I was in an accident today near a parking lot — my Toyota's bumper and door are damaged.",
  },
  {
    label: "🔓 Theft",
    text: "My BMW was stolen last night from the parking lot outside my apartment.",
  },
];

function AppContent() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("new");

  const [claim, setClaim] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [extractionSource, setExtractionSource] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsLoaded, setClaimsLoaded] = useState(false);

  const [editingClaimId, setEditingClaimId] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [evidence, setEvidence] = useState([]);

  const [missingFields, setMissingFields] = useState([]);
  const [checkingMissing, setCheckingMissing] = useState(false);
  const [claimComplete, setClaimComplete] = useState(null);
  const [readinessScore, setReadinessScore] = useState(null);

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Load the saved-claims list once, lazily, the first time it's needed.
  useEffect(() => {
    if (activeTab === "saved" && !claimsLoaded) {
      loadClaims();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const resetResults = () => {
    setMissingFields([]);
    setClaimComplete(null);
    setReadinessScore(null);
    setSummary("");
  };

  const extractClaim = async () => {
    if (!claim.trim()) {
      toast.error("Please describe your claim first.");
      return;
    }

    try {
      setLoading(true);
      const result = await api.extractClaim(claim);
      setForm((prev) => ({ ...prev, ...result.data }));
      setExtractionSource(result.source || null);
      resetResults();
      toast.success(
        result.source === "ai"
          ? "Claim parsed with AI."
          : "Claim parsed — form pre-filled."
      );
    } catch (error) {
      toast.error(error.message || "Extraction failed. Check the backend.");
    } finally {
      setLoading(false);
    }
  };

  const checkMissingFields = async () => {
    try {
      setCheckingMissing(true);
      const result = await api.checkMissingFields(form);
      setMissingFields(result.missingFields || []);
      setClaimComplete(result.complete ?? false);
      setReadinessScore(result.readinessScore ?? null);
    } catch (error) {
      toast.error(error.message || "Failed to check missing information.");
    } finally {
      setCheckingMissing(false);
    }
  };

  const generateSummary = async () => {
    if (!claim.trim()) {
      toast.error("Please describe your claim first.");
      return;
    }

    try {
      setSummaryLoading(true);
      const result = await api.generateSummary(claim, form);
      setSummary(result.summary || "");
    } catch (error) {
      toast.error(error.message || "Failed to generate claim summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const saveClaim = async () => {
    if (!claim.trim()) {
      toast.error("Please describe your claim first.");
      return;
    }

    try {
      setSaving(true);
      const result = await api.saveClaim(claim, form, editingClaimId);

      toast.success(editingClaimId ? "Claim updated." : "Claim saved.");

      setEditingClaimId(result.data._id);
      setEvidence(result.data.evidence || []);
      setClaimsLoaded(false);
    } catch (error) {
      toast.error(
        error.message ||
          (editingClaimId ? "Failed to update claim." : "Failed to save claim.")
      );
    } finally {
      setSaving(false);
    }
  };

  const loadClaims = async () => {
    try {
      setClaimsLoading(true);
      const result = await api.fetchClaims();
      setClaims(result.data || []);
      setClaimsLoaded(true);
    } catch (error) {
      toast.error(error.message || "Failed to load saved claims.");
    } finally {
      setClaimsLoading(false);
    }
  };

  const openClaim = async (id) => {
    try {
      setEditLoadingId(id);
      const result = await api.fetchClaim(id);
      const savedClaim = result.data;

      setClaim(savedClaim.claimText || "");
      setForm({ ...EMPTY_FORM, ...savedClaim.extractedData });
      setEditingClaimId(savedClaim._id);
      setEvidence(savedClaim.evidence || []);
      setExtractionSource(null);
      resetResults();
      setActiveTab("new");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(error.message || "Failed to open claim.");
    } finally {
      setEditLoadingId(null);
    }
  };

  const deleteClaim = async (id) => {
    if (!window.confirm("Delete this claim? This can't be undone.")) return;

    try {
      setDeletingId(id);
      await api.deleteClaim(id);
      setClaims((prev) => prev.filter((c) => c._id !== id));
      toast.success("Claim deleted.");

      if (editingClaimId === id) cancelEditing();
    } catch (error) {
      toast.error(error.message || "Failed to delete claim.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingClaimId(null);
    setClaim("");
    setForm(EMPTY_FORM);
    setEvidence([]);
    setExtractionSource(null);
    resetResults();
  };

  const handleChange = (fieldName, value) => {
    setForm((prev) => ({ ...prev, [fieldName]: value }));
    resetResults();
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Summary copied to clipboard.");
    } catch {
      toast.error("Couldn't copy — please select and copy manually.");
    }
  };

  const stats = useMemo(() => {
    if (claims.length === 0) return null;
    const withVehicle = claims.filter((c) => c.extractedData?.vehicle).length;
    return { total: claims.length, withVehicle };
  }, [claims]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="logo-mark">FA</span>
          <div>
            <h1>Forma AI</h1>
            <p>AI-augmented dynamic insurance claim assistant</p>
          </div>
        </div>

        <nav className="tabs">
          <button
            className={`tab ${activeTab === "new" ? "is-active" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            <FormIcon width={16} height={16} />
            New Claim
          </button>
          <button
            className={`tab ${activeTab === "saved" ? "is-active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <SparklesIcon width={16} height={16} />
            Saved Claims
            {stats && <span className="tab__count">{stats.total}</span>}
          </button>
        </nav>
      </header>

      <main className="container">
        {activeTab === "new" ? (
          <>
            {/* Magic Input */}
            <section className="card">
              <div className="card__header">
                <h2>
                  <SparklesIcon /> Magic Input
                </h2>
                {editingClaimId && (
                  <span className="pill pill--info">Editing saved claim</span>
                )}
              </div>

              <p className="card__hint">
                Describe what happened in your own words — Forma AI pre-fills the
                structured form below for you.
              </p>

              <textarea
                placeholder="e.g. I hit a deer on I-95 yesterday in my Honda, and the windshield shattered."
                value={claim}
                onChange={(e) => {
                  setClaim(e.target.value);
                  setExtractionSource(null);
                  resetResults();
                }}
              />

              <div className="chip-row">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    className="chip"
                    onClick={() => setClaim(ex.text)}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              <div className="card__footer">
                <button
                  className="btn btn--primary"
                  onClick={extractClaim}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderIcon /> Extracting…
                    </>
                  ) : (
                    <>
                      <SparklesIcon width={16} height={16} /> Extract Information
                    </>
                  )}
                </button>

                {extractionSource && (
                  <span className={`pill pill--${extractionSource === "ai" ? "violet" : "slate"}`}>
                    {extractionSource === "ai" ? "Parsed with AI" : "Parsed with rules engine"}
                  </span>
                )}
              </div>
            </section>

            {/* Dynamic Claim Form */}
            <section className="card">
              <div className="card__header">
                <h2>
                  <FormIcon /> Claim Form
                </h2>
              </div>

              <div className="form-grid">
                {FORM_FIELDS.map((field) => {
                  if (
                    field.showIf &&
                    form[field.showIf.field] !== field.showIf.equals
                  ) {
                    return null;
                  }

                  const flagged = missingFields.some((m) => m.field === field.name);

                  return (
                    <div
                      key={field.name}
                      className={`field ${field.wide ? "field--wide" : ""} ${
                        flagged ? "field--flagged" : ""
                      }`}
                    >
                      <label>{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={form[field.name] || ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="action-row">
                <button
                  className="btn btn--secondary"
                  onClick={checkMissingFields}
                  disabled={checkingMissing}
                  type="button"
                >
                  {checkingMissing ? (
                    <>
                      <LoaderIcon /> Checking…
                    </>
                  ) : (
                    <>
                      <GaugeIcon width={16} height={16} /> Check Completeness
                    </>
                  )}
                </button>

                <button
                  className="btn btn--secondary"
                  onClick={generateSummary}
                  disabled={summaryLoading}
                  type="button"
                >
                  {summaryLoading ? (
                    <>
                      <LoaderIcon /> Generating…
                    </>
                  ) : (
                    <>
                      <SparklesIcon width={16} height={16} /> AI Claim Summary
                    </>
                  )}
                </button>
              </div>

              {/* Readiness + Missing fields */}
              {readinessScore !== null && (
                <div className="result-panel result-panel--readiness">
                  <ProgressRing value={readinessScore} />

                  <div className="result-panel__body">
                    <h3>
                      {claimComplete ? (
                        <>
                          <CheckCircleIcon width={18} height={18} /> Claim
                          information complete
                        </>
                      ) : (
                        <>
                          <AlertIcon width={18} height={18} /> Missing information
                        </>
                      )}
                    </h3>

                    {!claimComplete && missingFields.length > 0 && (
                      <ul className="missing-list">
                        {missingFields.map((item) => (
                          <li key={item.field}>
                            <ChevronRightIcon width={14} height={14} />
                            <div>
                              <strong>{item.label}</strong>
                              <span>{item.message}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {summary && (
                <div className="result-panel result-panel--summary">
                  <div className="result-panel__header">
                    <h3>
                      <SparklesIcon width={17} height={17} /> AI-Generated Claim
                      Summary
                    </h3>
                    <button className="icon-btn" onClick={copySummary} title="Copy summary">
                      <CopyIcon width={15} height={15} />
                    </button>
                  </div>
                  <p>{summary}</p>
                </div>
              )}

              {/* Evidence upload — only once a claim exists to attach files to */}
              {editingClaimId ? (
                <div className="section-divider">
                  <h3 className="section-title">Evidence</h3>
                  <EvidenceUploader
                    claimId={editingClaimId}
                    evidence={evidence}
                    onUploaded={setEvidence}
                  />
                </div>
              ) : (
                <p className="hint-note">
                  💡 Save the claim first to attach photos or a police report as
                  evidence.
                </p>
              )}

              <div className="card__footer">
                <button className="btn btn--primary" onClick={saveClaim} disabled={saving}>
                  {saving ? (
                    <>
                      <LoaderIcon /> Saving…
                    </>
                  ) : editingClaimId ? (
                    "💾 Update Claim"
                  ) : (
                    "💾 Save Claim"
                  )}
                </button>

                {editingClaimId && (
                  <button
                    className="btn btn--ghost"
                    onClick={cancelEditing}
                    type="button"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </section>
          </>
        ) : (
          <ClaimsDashboard
            claims={claims}
            loading={claimsLoading}
            editLoadingId={editLoadingId}
            deletingId={deletingId}
            onOpen={openClaim}
            onDelete={deleteClaim}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
