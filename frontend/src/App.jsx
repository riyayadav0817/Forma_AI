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
  });

  const extractClaim = () => {
    const text = claim.toLowerCase();

    setForm({
      incidentType: text.includes("deer")
        ? "Animal Collision"
        : "Vehicle Accident",
      vehicle: text.includes("honda") ? "Honda" : "",
      location: text.includes("i-95") ? "I-95" : "",
      damage: text.includes("windshield")
        ? "Windshield Damage"
        : "",
      date: text.includes("yesterday") ? "Yesterday" : "",
    });
  };

  return (
    <div className="container">
      <h1>Forma AI 🤖</h1>
      <p>AI-powered dynamic insurance claim form</p>

      <section className="card">
        <h2>✨ Magic Input</h2>

        <textarea
          placeholder="Describe your insurance claim..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
        />

        <button onClick={extractClaim}>
          Extract Information
        </button>
      </section>

      <section className="card">
        <h2>📋 Claim Form</h2>

        <label>Incident Type</label>
        <input
          value={form.incidentType}
          onChange={(e) =>
            setForm({
              ...form,
              incidentType: e.target.value,
            })
          }
        />

        <label>Vehicle</label>
        <input
          value={form.vehicle}
          onChange={(e) =>
            setForm({
              ...form,
              vehicle: e.target.value,
            })
          }
        />

        <label>Location</label>
        <input
          value={form.location}
          onChange={(e) =>
            setForm({
              ...form,
              location: e.target.value,
            })
          }
        />

        <label>Damage</label>
        <input
          value={form.damage}
          onChange={(e) =>
            setForm({
              ...form,
              damage: e.target.value,
            })
          }
        />

        <label>Date</label>
        <input
          value={form.date}
          onChange={(e) =>
            setForm({
              ...form,
              date: e.target.value,
            })
          }
        />
      </section>
    </div>
  );
}

export default App;