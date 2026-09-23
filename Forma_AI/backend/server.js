const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const Claim = require("./models/Claim");
const { extractClaimData } = require("./services/extraction");

const authRoutes = require("./routes/auth");
const { protect } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   AUTH ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* =========================================================
   MULTER
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      extension;

    cb(null, filename);
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

/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use(
  "/uploads",
  express.static(uploadDirectory)
);

/* =========================================================
   BASIC ROUTES
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Forma AI backend is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    project: "Forma AI",

    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",

    extractionMode:
      process.env.OPENAI_API_KEY
        ? "ai"
        : "rules",
  });
});

/* =========================================================
   EXTRACT CLAIM
   POST /api/claims/extract
========================================================= */

app.post(
  "/api/claims/extract",
  protect,
  async (req, res) => {
    try {
      const { claim } = req.body;

      if (
        typeof claim !== "string" ||
        !claim.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: "Claim text is required",
        });
      }

      const result = await extractClaimData(
        claim.trim()
      );

      return res.json({
        success: true,
        data: result.data || {},
        source: result.source || "rules",
      });
    } catch (error) {
      console.error(
        "Extraction error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Extraction failed",
      });
    }
  }
);

/* =========================================================
   SAVE CLAIM
   POST /api/claims
========================================================= */

app.post(
  "/api/claims",
  protect,
  async (req, res) => {
    try {
      const {
        claimText,
        extractedData,
      } = req.body;

      if (
        typeof claimText !== "string" ||
        !claimText.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: "Claim text is required",
        });
      }

      const savedClaim = await Claim.create({
        claimText: claimText.trim(),

        extractedData:
          extractedData || {},

        user: req.user?._id,
      });

      return res.status(201).json({
        success: true,
        data: savedClaim,
      });
    } catch (error) {
      console.error(
        "Save claim error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Failed to save claim",
      });
    }
  }
);

/* =========================================================
   GET ALL CLAIMS
   GET /api/claims
========================================================= */

app.get(
  "/api/claims",
  protect,
  async (req, res) => {
    try {
      const filter = req.user?._id
        ? { user: req.user._id }
        : {};

      const claims = await Claim.find(filter)
        .sort({
          createdAt: -1,
        });

      return res.json({
        success: true,
        data: claims,
      });
    } catch (error) {
      console.error(
        "Fetch claims error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Failed to fetch claims",
      });
    }
  }
);

/* =========================================================
   GET SINGLE CLAIM
   GET /api/claims/:id
========================================================= */

app.get(
  "/api/claims/:id",
  protect,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid claim ID",
        });
      }

      const filter = {
        _id: req.params.id,
      };

      if (req.user?._id) {
        filter.user = req.user._id;
      }

      const claim =
        await Claim.findOne(filter);

      if (!claim) {
        return res.status(404).json({
          success: false,
          error: "Claim not found",
        });
      }

      return res.json({
        success: true,
        data: claim,
      });
    } catch (error) {
      console.error(
        "Fetch claim error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Failed to fetch claim",
      });
    }
  }
);

/* =========================================================
   UPDATE CLAIM
   PUT /api/claims/:id
========================================================= */

app.put(
  "/api/claims/:id",
  protect,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid claim ID",
        });
      }

      const {
        claimText,
        extractedData,
      } = req.body;

      if (
        typeof claimText !== "string" ||
        !claimText.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: "Claim text is required",
        });
      }

      const filter = {
        _id: req.params.id,
      };

      if (req.user?._id) {
        filter.user = req.user._id;
      }

      const updatedClaim =
        await Claim.findOneAndUpdate(
          filter,
          {
            claimText: claimText.trim(),
            extractedData:
              extractedData || {},
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

      return res.json({
        success: true,
        data: updatedClaim,
      });
    } catch (error) {
      console.error(
        "Update claim error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Failed to update claim",
      });
    }
  }
);

/* =========================================================
   DELETE CLAIM
   DELETE /api/claims/:id
========================================================= */

app.delete(
  "/api/claims/:id",
  protect,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid claim ID",
        });
      }

      const filter = {
        _id: req.params.id,
      };

      if (req.user?._id) {
        filter.user = req.user._id;
      }

      const deletedClaim =
        await Claim.findOneAndDelete(
          filter
        );

      if (!deletedClaim) {
        return res.status(404).json({
          success: false,
          error: "Claim not found",
        });
      }

      return res.json({
        success: true,
        message:
          "Claim deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete claim error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Failed to delete claim",
      });
    }
  }
);

/* =========================================================
   CHECK MISSING FIELDS
   POST /api/claims/check-missing
========================================================= */

app.post(
  "/api/claims/check-missing",
  protect,
  async (req, res) => {
    try {
      const {
        extractedData,
      } = req.body;

      if (!extractedData) {
        return res.status(400).json({
          success: false,
          error:
            "Extracted claim data is required",
        });
      }

      const missingFields = [];

      const value = (field) =>
        typeof extractedData[field] ===
        "string"
          ? extractedData[field].trim()
          : "";

      /* Common fields */

      if (!value("incidentType")) {
        missingFields.push({
          field: "incidentType",
          label: "Incident Type",
          message:
            "Please specify what type of incident occurred.",
        });
      }

      if (!value("vehicle")) {
        missingFields.push({
          field: "vehicle",
          label: "Vehicle",
          message:
            "Please provide the vehicle details.",
        });
      }

      if (!value("location")) {
        missingFields.push({
          field: "location",
          label: "Location",
          message:
            "Please provide where the incident occurred.",
        });
      }

      if (!value("damage")) {
        missingFields.push({
          field: "damage",
          label: "Damage",
          message:
            "Please describe the damage.",
        });
      }

      if (!value("date")) {
        missingFields.push({
          field: "date",
          label: "Incident Date",
          message:
            "Please provide when the incident occurred.",
        });
      }

      const incidentType =
        value("incidentType").toLowerCase();

      /* Theft */

      if (
        incidentType === "theft" &&
        !value("policeReportNumber")
      ) {
        missingFields.push({
          field:
            "policeReportNumber",
          label:
            "Police Report Number",
          message:
            "Please provide the police report number.",
        });
      }

      /* Animal */

      if (
        incidentType ===
          "animal collision" &&
        !value("animalDetails")
      ) {
        missingFields.push({
          field: "animalDetails",
          label: "Animal Details",
          message:
            "Please provide details about the animal involved.",
        });
      }

      const totalRequired =
        incidentType === "theft" ||
        incidentType ===
          "animal collision"
          ? 7
          : 5;

      const completed =
        totalRequired -
        missingFields.length;

      const readinessScore = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (completed /
              totalRequired) *
              100
          )
        )
      );

      return res.json({
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
        "Missing field error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Failed to check missing fields",
      });
    }
  }
);

/* =========================================================
   GENERATE SUMMARY
   POST /api/claims/generate-summary
========================================================= */

app.post(
  "/api/claims/generate-summary",
  protect,
  async (req, res) => {
    try {
      const {
        claimText,
        extractedData,
      } = req.body;

      if (
        typeof claimText !== "string" ||
        !claimText.trim()
      ) {
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

      const incidentType =
        extractedData.incidentType ||
        "insurance incident";

      const vehicle =
        extractedData.vehicle ||
        "vehicle details not provided";

      const location =
        extractedData.location ||
        "location not provided";

      const date =
        extractedData.date ||
        "incident date not provided";

      const damage =
        extractedData.damage ||
        "damage details not provided";

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

      if (
        extractedData.animalDetails
      ) {
        summary +=
          ` The animal involved was described as ${extractedData.animalDetails}.`;
      }

      return res.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error(
        "Summary error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Failed to generate claim summary",
      });
    }
  }
);

/* =========================================================
   UPLOAD EVIDENCE
   POST /api/claims/:id/evidence
========================================================= */

app.post(
  "/api/claims/:id/evidence",
  protect,
  upload.array("evidence", 5),
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid claim ID",
        });
      }

      const filter = {
        _id: req.params.id,
      };

      if (req.user?._id) {
        filter.user = req.user._id;
      }

      const claim =
        await Claim.findOne(filter);

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

          fileName:
            file.filename,

          filePath:
            `/uploads/${file.filename}`,

          mimeType:
            file.mimetype,

          size: file.size,
        }));

      if (!claim.evidence) {
        claim.evidence = [];
      }

      claim.evidence.push(
        ...evidenceFiles
      );

      await claim.save();

      return res.json({
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

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to upload evidence",
      });
    }
  }
);

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

app.use(
  (error, req, res, next) => {
    if (
      error instanceof multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          error:
            "File size cannot exceed 10 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (
      error?.message?.includes(
        "Only JPG"
      )
    ) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
);

/* =========================================================
   GENERAL ERROR HANDLER
========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Internal server error",
    });
  }
);

/* =========================================================
   MONGODB
========================================================= */

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error(
        "❌ MONGODB_URI is missing in .env"
      );

      process.exit(1);
    }

    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      "✅ MongoDB connected successfully"
    );

    app.listen(PORT, () => {
      console.log(
        `🚀 Backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ MongoDB connection error:",
      error.message
    );

    console.error(
      "Backend was not started because MongoDB connection failed."
    );

    process.exit(1);
  }
}

startServer();