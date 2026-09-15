const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Claim = require("./models/Claim");

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

    // Incident type detection
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

    // Vehicle detection
    if (text.includes("honda")) {
      vehicle = "Honda";
    } else if (text.includes("toyota")) {
      vehicle = "Toyota";
    } else if (text.includes("bmw")) {
      vehicle = "BMW";
    } else if (text.includes("ford")) {
      vehicle = "Ford";
    }

    // Location detection
    const locationMatch = claim.match(
      /\b(I-\d+|NH-\d+|Highway|highway|parking lot|parking area)\b/i
    );

    if (locationMatch) {
      location = locationMatch[0];
    }

    // Damage detection
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

    // Date detection
    if (text.includes("yesterday")) {
      date = "Yesterday";
    } else if (text.includes("today")) {
      date = "Today";
    } else if (text.includes("last night")) {
      date = "Last night";
    }

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
   Save Claim
========================= */

app.post("/api/claims", async (req, res) => {
  try {
    const { claimText, extractedData } = req.body;

    if (!claimText || !claimText.trim()) {
      return res.status(400).json({
        success: false,
        error: "Claim text is required",
      });
    }

    const savedClaim = await Claim.create({
      claimText,
      extractedData,
    });

    res.status(201).json({
      success: true,
      data: savedClaim,
    });
  } catch (error) {
    console.error("Save claim error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to save claim",
    });
  }
});

/* =========================
   Get All Claims
========================= */

app.get("/api/claims", async (req, res) => {
  try {
    const claims = await Claim.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: claims,
    });
  } catch (error) {
    console.error("Fetch claims error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch claims",
    });
  }
});

/* =========================
   Get Single Claim
========================= */

app.get("/api/claims/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: "Claim not found",
      });
    }

    res.json({
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error(
      "Fetch single claim error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to fetch claim",
    });
  }
});

/* =========================
   Update Claim
========================= */

app.put("/api/claims/:id", async (req, res) => {
  try {
    const { claimText, extractedData } = req.body;

    if (!claimText || !claimText.trim()) {
      return res.status(400).json({
        success: false,
        error: "Claim text is required",
      });
    }

    const updatedClaim =
      await Claim.findByIdAndUpdate(
        req.params.id,
        {
          claimText,
          extractedData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedClaim) {
      return res.status(404).json({
        success: false,
        error: "Claim not found",
      });
    }

    res.json({
      success: true,
      data: updatedClaim,
    });
  } catch (error) {
    console.error(
      "Update claim error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to update claim",
    });
  }
});

/* =========================
   MongoDB + Start Server
========================= */

const PORT = 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully"
    );

    app.listen(PORT, () => {
      console.log(
        `Backend running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error.message
    );
  });
