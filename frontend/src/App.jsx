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

  // AI extraction
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
        throw new Error(result.error || "AI extraction failed");
      }

      setForm({
        ...form,
        ...result.data,
      });
    } catch (error) {
      console.error("Extraction error:", error);

      alert(
        "AI extraction failed. Make sure the backend is running and API credits are available."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle manual field changes
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

      {/* Magic Input */}
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

      {/* Dynamic Claim Form */}
      <section className="card">
        <h2>📋 Claim Form</h2>

        {formFields.map((field) => {
          // Conditional field logic
          if (
            field.showIf &&
            form[field.showIf.field] !== field.showIf.equals
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
      </section>
    </div>
  );
}

export default App;