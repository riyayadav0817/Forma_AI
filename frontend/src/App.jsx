import { useState } from "react";
import "./App.css";

function App() {
  const [claim, setClaim] = useState("");

  const [form, setForm] = useState({
    incidentType: "",
    vehicle: "",
    location: "",
    damage: "",
    date: "",
    policeReportNumber: "",
    animalDetails: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  // Resume/Edit state
  const [editingClaimId, setEditingClaimId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Smart Missing-Field Detection
  const [missingFields, setMissingFields] = useState([]);
  const [checkingMissing, setCheckingMissing] = useState(false);
  const [claimComplete, setClaimComplete] = useState(null);

  // Claim Readiness Score
  const [readinessScore, setReadinessScore] = useState(null);

  // AI Claim Summary
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // =========================
  // Dynamic Form Schema
  // =========================

  const formFields = [
    {
      name: "incidentType",
      label: "Incident Type",
      type: "text",
    },
    {
      name: "vehicle",
      label: "Vehicle",
      type: "text",
    },
    {
      name: "location",
      label: "Location",
      type: "text",
    },
    {
      name: "damage",
      label: "Damage",
      type: "text",
    },
    {
      name: "date",
      label: "Date",
      type: "text",
    },
    {
      name: "policeReportNumber",
      label: "Police Report Number",
      type: "text",
      showIf: {
        field: "incidentType",
        equals: "Theft",
      },
    },
    {
      name: "animalDetails",
      label: "Animal Details",
      type: "text",
      showIf: {
        field: "incidentType",
        equals: "Animal Collision",
      },
    },
  ];

  // =========================
  // AI Extraction
  // =========================

  const extractClaim = async () => {
    if (!claim.trim()) {
      alert("Please describe your claim first.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/ai/extract",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            claim: claim,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "AI extraction failed"
        );
      }

      setForm({
        ...form,
        ...result.data,
      });

      // Reset previous results
      setMissingFields([]);
      setClaimComplete(null);
      setReadinessScore(null);
      setSummary("");
    } catch (error) {
      console.error("Extraction error:", error);

      alert(
        "Extraction failed. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Check Missing Fields
  // =========================

  const checkMissingFields = async () => {
    try {
      setCheckingMissing(true);

      const response = await fetch(
        "http://localhost:5000/api/claims/check-missing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            extractedData: form,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to check missing fields"
        );
      }

      setMissingFields(
        result.missingFields || []
      );

      setClaimComplete(result.complete);

      setReadinessScore(
        result.readinessScore ?? null
      );
    } catch (error) {
      console.error(
        "Missing field check error:",
        error
      );

      alert(
        "Failed to check missing information."
      );
    } finally {
      setCheckingMissing(false);
    }
  };

  // =========================
  // Generate AI Claim Summary
  // =========================

  const generateSummary = async () => {
    if (!claim.trim()) {
      alert("Please describe your claim first.");
      return;
    }

    try {
      setSummaryLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/claims/generate-summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            claimText: claim,
            extractedData: form,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to generate claim summary"
        );
      }

      setSummary(result.summary || "");
    } catch (error) {
      console.error(
        "Generate summary error:",
        error
      );

      alert(
        "Failed to generate claim summary."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  // =========================
  // Save / Update Claim
  // =========================

  const saveClaim = async () => {
    if (!claim.trim()) {
      alert("Please describe your claim first.");
      return;
    }

    try {
      setSaving(true);

      const url = editingClaimId
        ? `http://localhost:5000/api/claims/${editingClaimId}`
        : "http://localhost:5000/api/claims";

      const method = editingClaimId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimText: claim,
          extractedData: form,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to save claim"
        );
      }

      if (editingClaimId) {
        alert("Claim updated successfully! 🎉");
      } else {
        alert("Claim saved successfully! 🎉");
      }

      setEditingClaimId(null);

      await fetchClaims();
    } catch (error) {
      console.error(
        "Save claim error:",
        error
      );

      alert(
        editingClaimId
          ? "Failed to update claim."
          : "Failed to save claim."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Fetch All Saved Claims
  // =========================

  const fetchClaims = async () => {
    try {
      setClaimsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/claims"
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to fetch claims"
        );
      }

      setClaims(result.data);
    } catch (error) {
      console.error(
        "Fetch claims error:",
        error
      );

      alert("Failed to load saved claims.");
    } finally {
      setClaimsLoading(false);
    }
  };

  // =========================
  // Open / Resume Claim
  // =========================

  const openClaim = async (id) => {
    try {
      setEditLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/claims/${id}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to open claim"
        );
      }

      const savedClaim = result.data;

      // Load original claim text
      setClaim(savedClaim.claimText || "");

      // Load extracted form data
      setForm({
        incidentType:
          savedClaim.extractedData
            ?.incidentType || "",

        vehicle:
          savedClaim.extractedData
            ?.vehicle || "",

        location:
          savedClaim.extractedData
            ?.location || "",

        damage:
          savedClaim.extractedData
            ?.damage || "",

        date:
          savedClaim.extractedData
            ?.date || "",

        policeReportNumber:
          savedClaim.extractedData
            ?.policeReportNumber || "",

        animalDetails:
          savedClaim.extractedData
            ?.animalDetails || "",
      });

      // Store currently editing claim ID
      setEditingClaimId(savedClaim._id);

      // Reset completeness + summary
      setMissingFields([]);
      setClaimComplete(null);
      setReadinessScore(null);
      setSummary("");

      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Open claim error:",
        error
      );

      alert("Failed to open claim.");
    } finally {
      setEditLoading(false);
    }
  };

  // =========================
  // Cancel Editing
  // =========================

  const cancelEditing = () => {
    setEditingClaimId(null);

    setClaim("");

    setForm({
      incidentType: "",
      vehicle: "",
      location: "",
      damage: "",
      date: "",
      policeReportNumber: "",
      animalDetails: "",
    });

    setMissingFields([]);
    setClaimComplete(null);
    setReadinessScore(null);
    setSummary("");
  };

  // =========================
  // Handle Manual Field Changes
  // =========================

  const handleChange = (fieldName, value) => {
    setForm({
      ...form,
      [fieldName]: value,
    });

    // Clear previous completeness result
    setClaimComplete(null);
    setMissingFields([]);
    setReadinessScore(null);

    // Summary is based on old form data
    setSummary("");
  };

  return (
    <div className="container">
      <h1>Forma AI 🤖</h1>

      <p>
        AI-powered dynamic insurance claim form
      </p>

      {/* =========================
          Magic Input
      ========================= */}

      <section className="card">
        <h2>✨ Magic Input</h2>

        {editingClaimId && (
          <p>
            ✏️ You are editing a saved claim.
          </p>
        )}

        <textarea
          placeholder="Describe your insurance claim..."
          value={claim}
          onChange={(e) => {
            setClaim(e.target.value);
            setSummary("");
            setClaimComplete(null);
            setMissingFields([]);
            setReadinessScore(null);
          }}
        />

        <button
          onClick={extractClaim}
          disabled={loading}
        >
          {loading
            ? "Extracting..."
            : "Extract Information"}
        </button>
      </section>

      {/* =========================
          Dynamic Claim Form
      ========================= */}

      <section className="card">
        <h2>📋 Claim Form</h2>

        {formFields.map((field) => {
          // Conditional field logic
          if (
            field.showIf &&
            form[field.showIf.field] !==
              field.showIf.equals
          ) {
            return null;
          }

          return (
            <div key={field.name}>
              <label>{field.label}</label>

              <input
                type={field.type}
                value={form[field.name] || ""}
                onChange={(e) =>
                  handleChange(
                    field.name,
                    e.target.value
                  )
                }
              />
            </div>
          );
        })}

        {/* =========================
            Smart Completeness Check
        ========================= */}

        <button
          onClick={checkMissingFields}
          disabled={checkingMissing}
          type="button"
        >
          {checkingMissing
            ? "Checking..."
            : "🧠 Check Claim Completeness"}
        </button>

        {claimComplete !== null && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: claimComplete
                ? "#ecfdf5"
                : "#fff7ed",
              border: claimComplete
                ? "1px solid #10b981"
                : "1px solid #f59e0b",
            }}
          >
            <h3>
              {claimComplete
                ? "✅ Claim Information Complete"
                : "⚠️ Missing Information"}
            </h3>

            {!claimComplete && (
              <>
                <p>
                  Please provide the following
                  information:
                </p>

                <ul>
                  {missingFields.map((item) => (
                    <li key={item.field}>
                      <strong>
                        {item.label}:
                      </strong>{" "}
                      {item.message}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* =========================
            Claim Readiness Score
        ========================= */}

        {readinessScore !== null && (
          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              borderRadius: "12px",
              backgroundColor: "#f5f3ff",
              border: "1px solid #8b5cf6",
            }}
          >
            <h3>📊 Claim Readiness Score</h3>

            <div
              style={{
                width: "100%",
                height: "12px",
                backgroundColor: "#e5e7eb",
                borderRadius: "999px",
                overflow: "hidden",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  width: `${readinessScore}%`,
                  height: "100%",
                  backgroundColor: "#7c3aed",
                  transition: "width 0.4s ease",
                }}
              />
            </div>

            <p>
              <strong>
                {readinessScore}%
              </strong>{" "}
              claim information completed.
            </p>
          </div>
        )}

        {/* =========================
            AI Claim Summary
        ========================= */}

        <button
          onClick={generateSummary}
          disabled={summaryLoading}
          type="button"
        >
          {summaryLoading
            ? "Generating Summary..."
            : "✨ Generate AI Claim Summary"}
        </button>

        {summary && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
            }}
          >
            <h3>📝 AI-Generated Claim Summary</h3>

            <p
              style={{
                lineHeight: "1.7",
                marginTop: "12px",
              }}
            >
              {summary}
            </p>
          </div>
        )}

        {/* =========================
            Save / Update
        ========================= */}

        <button
          onClick={saveClaim}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : editingClaimId
            ? "💾 Update Claim"
            : "💾 Save Claim"}
        </button>

        {editingClaimId && (
          <button
            onClick={cancelEditing}
            type="button"
          >
            ❌ Cancel Editing
          </button>
        )}
      </section>

      {/* =========================
          Saved Claims Dashboard
      ========================= */}

      <section className="card">
        <h2>📂 Saved Claims</h2>

        <button
          onClick={fetchClaims}
          disabled={claimsLoading}
        >
          {claimsLoading
            ? "Loading..."
            : "🔄 Load Claims"}
        </button>

        {claims.length === 0 &&
        !claimsLoading ? (
          <p>No saved claims yet.</p>
        ) : (
          claims.map((savedClaim) => (
            <div
              key={savedClaim._id}
              style={{
                marginTop: "20px",
                padding: "18px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
              }}
            >
              <h3>
                {savedClaim.extractedData
                  ?.incidentType ||
                  "Insurance Claim"}
              </h3>

              <p>
                {savedClaim.claimText}
              </p>

              <p>
                <strong>Vehicle:</strong>{" "}
                {savedClaim.extractedData
                  ?.vehicle || "N/A"}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {savedClaim.extractedData
                  ?.location || "N/A"}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {savedClaim.extractedData
                  ?.date || "N/A"}
              </p>

              <p>
                <strong>Damage:</strong>{" "}
                {savedClaim.extractedData
                  ?.damage || "N/A"}
              </p>

              <p>
                <strong>Claim ID:</strong>{" "}
                {savedClaim._id}
              </p>

              <button
                onClick={() =>
                  openClaim(savedClaim._id)
                }
                disabled={editLoading}
              >
                {editLoading
                  ? "Opening..."
                  : "✏️ Open & Edit"}
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;
