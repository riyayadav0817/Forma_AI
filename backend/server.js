const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Claim = require("./models/Claim");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   Evidence Upload Setup
========================= */

const uploadDirectory = path.join(
  __dirname,
  "uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}` + path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG, WEBP and PDF files are allowed."
        )
      );
    }
  },
});

/* =========================
   Serve Uploaded Files
========================= */

app.use(
  "/uploads",
  express.static(uploadDirectory)
);

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
      damageWords.push(
        "Vehicle glass shattered"
      );
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
    console.error(
      "Extraction error:",
      error
    );

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
    console.error(
      "Save claim error:",
      error
    );

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
    console.error(
      "Fetch claims error:",
      error
    );

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
    const claim = await Claim.findById(
      req.params.id
    );

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
    const { claimText, extractedData } =
      req.body;

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
   Smart Missing-Field Detection
   + Claim Readiness Score
========================= */

app.post(
  "/api/claims/check-missing",
  async (req, res) => {
    try {
      const { extractedData } = req.body;

      if (!extractedData) {
        return res.status(400).json({
          success: false,
          error:
            "Extracted claim data is required",
        });
      }

      const missingFields = [];

      // Common required fields
      if (
        !extractedData.incidentType?.trim()
      ) {
        missingFields.push({
          field: "incidentType",
          label: "Incident Type",
          message:
            "Please specify what type of incident occurred.",
        });
      }

      if (!extractedData.vehicle?.trim()) {
        missingFields.push({
          field: "vehicle",
          label: "Vehicle",
          message:
            "Please provide the vehicle details.",
        });
      }

      if (!extractedData.location?.trim()) {
        missingFields.push({
          field: "location",
          label: "Location",
          message:
            "Please provide where the incident occurred.",
        });
      }

      if (!extractedData.damage?.trim()) {
        missingFields.push({
          field: "damage",
          label: "Damage",
          message:
            "Please describe the damage.",
        });
      }

      if (!extractedData.date?.trim()) {
        missingFields.push({
          field: "date",
          label: "Incident Date",
          message:
            "Please provide when the incident occurred.",
        });
      }

      // Theft-specific field
      if (
        extractedData.incidentType ===
          "Theft" &&
        !extractedData.policeReportNumber?.trim()
      ) {
        missingFields.push({
          field: "policeReportNumber",
          label: "Police Report Number",
          message:
            "A police report number is required for theft claims.",
        });
      }

      // Animal collision-specific field
      if (
        extractedData.incidentType ===
          "Animal Collision" &&
        !extractedData.animalDetails?.trim()
      ) {
        missingFields.push({
          field: "animalDetails",
          label: "Animal Details",
          message:
            "Please provide details about the animal involved.",
        });
      }

      // Readiness Score
      const totalRequiredFields =
        extractedData.incidentType === "Theft" ||
        extractedData.incidentType ===
          "Animal Collision"
          ? 7
          : 5;

      const completedFields =
        totalRequiredFields -
        missingFields.length;

      const readinessScore = Math.max(
        0,
        Math.round(
          (completedFields /
            totalRequiredFields) *
            100
        )
      );

      res.json({
        success: true,
        complete:
          missingFields.length === 0,
        missingFields,
        missingCount:
          missingFields.length,
        readinessScore,
      });
    } catch (error) {
      console.error(
        "Missing field detection error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Failed to check missing fields",
      });
    }
  }
);

/* =========================
   AI-Generated Claim Summary
========================= */

app.post(
  "/api/claims/generate-summary",
  async (req, res) => {
    try {
      const {
        claimText,
        extractedData,
      } = req.body;

      if (!claimText || !claimText.trim()) {
        return res.status(400).json({
          success: false,
          error:
            "Claim text is required",
        });
      }

      if (!extractedData) {
        return res.status(400).json({
          success: false,
          error:
            "Extracted claim data is required",
        });
      }

      // Temporary mock AI summary
      // Later replace with real LLM.

      const incidentType =
        extractedData.incidentType ||
        "insurance incident";

      const vehicle =
        extractedData.vehicle ||
        "vehicle details not provided";

      const location =
        extractedData.location ||
        "location not provided";

      const damage =
        extractedData.damage ||
        "damage details not provided";

      const date =
        extractedData.date ||
        "incident date not provided";

      let summary =
        `The policyholder reported a ${incidentType.toLowerCase()} involving ${vehicle}. ` +
        `The incident occurred at ${location} on ${date}. ` +
        `Reported damage/details include: ${damage}.`;

      if (
        extractedData.policeReportNumber
      ) {
        summary +=
          ` The associated police report number is ${extractedData.policeReportNumber}.`;
      }

      if (extractedData.animalDetails) {
        summary +=
          ` The animal involved was described as ${extractedData.animalDetails}.`;
      }

      res.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error(
        "Generate summary error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Failed to generate claim summary",
      });
    }
  }
);

/* =========================
   Upload Claim Evidence
========================= */

app.post(
  "/api/claims/:id/evidence",
  upload.array("evidence", 5),
  async (req, res) => {
    try {
      const claim = await Claim.findById(
        req.params.id
      );

      if (!claim) {
        return res.status(404).json({
          success: false,
          error: "Claim not found",
        });
      }

      if (
        !req.files ||
        req.files.length === 0
      ) {
        return res.status(400).json({
          success: false,
          error:
            "No evidence files uploaded",
        });
      }

      const evidenceFiles =
        req.files.map((file) => ({
          originalName:
            file.originalname,

          fileName: file.filename,

          filePath:
            `/uploads/${file.filename}`,

          mimeType: file.mimetype,

          size: file.size,
        }));

      claim.evidence.push(
        ...evidenceFiles
      );

      await claim.save();

      res.json({
        success: true,
        message:
          "Evidence uploaded successfully",
        data: claim.evidence,
      });
    } catch (error) {
      console.error(
        "Evidence upload error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to upload evidence",
      });
    }
  }
);

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
