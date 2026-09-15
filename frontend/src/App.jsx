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
  // Save New Claim
  // =========================

  const saveClaim = async () => {
    if (!claim.trim()) {
      alert("Please describe your claim first.");
      return;
    }

    // If editing an existing claim,
    // update functionality will be added next.
    if (editingClaimId) {
      alert(
        "Update functionality will be added in the next step."
      );
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
      console.error("Fetch claims error:", error);

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
          savedClaim.extractedData?.incidentType || "",

        vehicle:
          savedClaim.extractedData?.vehicle || "",

        location:
          savedClaim.extractedData?.location || "",

        damage:
          savedClaim.extractedData?.damage || "",

        date:
          savedClaim.extractedData?.date || "",

        policeReportNumber:
          savedClaim.extractedData
            ?.policeReportNumber || "",

        animalDetails:
          savedClaim.extractedData
            ?.animalDetails || "",
      });

      // Store currently editing claim ID
      setEditingClaimId(savedClaim._id);

      // Scroll to top so user can edit
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Open claim error:", error);

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

        {editingClaimId && (
          <p>
            ✏️ You are editing a saved claim.
          </p>
        )}

        <textarea
          placeholder="Describe your insurance claim..."
          value={claim}
          onChange={(e) =>
            setClaim(e.target.value)
          }
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

              {/* Open / Resume Button */}
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
