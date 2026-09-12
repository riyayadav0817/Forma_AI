const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   Basic Routes
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Forma AI backend is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    project: "Forma AI",
  });
});

/* =========================
   Mock AI Extraction
========================= */

app.post("/api/ai/extract", async (req, res) => {
  try {
    const { claim } = req.body;

    if (!claim || !claim.trim()) {
      return res.status(400).json({
        success: false,
        error: "Claim text is required",
      });
    }

    const text = claim.toLowerCase();

    let incidentType = "";
    let vehicle = "";
    let location = "";
    let damage = "";
    let date = "";

    /* -------------------------
       Incident Type
    ------------------------- */

    if (
      text.includes("deer") ||
      text.includes("animal") ||
      text.includes("dog") ||
      text.includes("cow")
    ) {
      incidentType = "Animal Collision";
    } else if (
      text.includes("stolen") ||
      text.includes("theft") ||
      text.includes("robbed")
    ) {
      incidentType = "Theft";
    } else if (
      text.includes("accident") ||
      text.includes("crash") ||
      text.includes("collision")
    ) {
      incidentType = "Accident";
    }

    /* -------------------------
       Vehicle
    ------------------------- */

    if (text.includes("honda")) {
      vehicle = "Honda";
    } else if (text.includes("toyota")) {
      vehicle = "Toyota";
    } else if (text.includes("bmw")) {
      vehicle = "BMW";
    } else if (text.includes("ford")) {
      vehicle = "Ford";
    }

    /* -------------------------
       Location
    ------------------------- */

    const locationMatch = claim.match(
      /\b(I-\d+|NH-\d+|Highway|highway|parking lot|parking area)\b/i
    );

    if (locationMatch) {
      location = locationMatch[0];
    }

    /* -------------------------
       Damage
    ------------------------- */

    const damageWords = [];

    if (text.includes("windshield")) {
      damageWords.push("Windshield damaged");
    }

    if (text.includes("bumper")) {
      damageWords.push("Bumper damaged");
    }

    if (text.includes("door")) {
      damageWords.push("Door damaged");
    }

    if (text.includes("glass")) {
      damageWords.push("Glass damaged");
    }

    if (text.includes("broken")) {
      damageWords.push("Vehicle part broken");
    }

    if (text.includes("shattered")) {
      damageWords.push("Vehicle glass shattered");
    }

    damage = damageWords.join(", ");

    /* -------------------------
       Date
    ------------------------- */

    if (text.includes("yesterday")) {
      date = "Yesterday";
    } else if (text.includes("today")) {
      date = "Today";
    } else if (text.includes("last night")) {
      date = "Last night";
    }

    /* -------------------------
       Response
    ------------------------- */

    res.json({
      success: true,
      data: {
        incidentType,
        vehicle,
        location,
        damage,
        date,
      },
    });
  } catch (error) {
    console.error("Extraction error:", error);

    res.status(500).json({
      success: false,
      error: "Extraction failed",
    });
  }
});

/* =========================
   Start Server
========================= */

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});