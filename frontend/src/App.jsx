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

  // Dynamic form schema
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
  // Save Claim to MongoDB
  // =========================

  const saveClaim = async () => {
    if (!claim.trim()) {
      alert("Please describe your claim first.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/claims",
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
          result.error || "Failed to save claim"
        );
      }

      alert("Claim saved successfully! 🎉");

      // Refresh saved claims
      await fetchClaims();
    } catch (error) {
      console.error("Save claim error:", error);

      alert(
        "Failed to save claim. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Fetch Saved Claims
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
      console.error("Fetch claims error:", error);

      alert("Failed to load saved claims.");
    } finally {
      setClaimsLoading(false);
    }
  };

  // =========================
  // Handle Manual Field Changes
  // =========================

  const handleChange = (fieldName, value) => {
    setForm({
      ...form,
      [fieldName]: value,
    });
  };

  return (
    <div className="container">
      <h1>Forma AI 🤖</h1>

      <p>AI-powered dynamic insurance claim form</p>

      {/* =========================
          Magic Input
      ========================= */}

      <section className="card">
        <h2>✨ Magic Input</h2>

        <textarea
          placeholder="Describe your insurance claim..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
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

        <button
          onClick={saveClaim}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "💾 Save Claim"}
        </button>
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

        {claims.length === 0 && !claimsLoading ? (
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
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;
