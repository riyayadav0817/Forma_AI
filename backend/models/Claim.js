const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    claimNumber: {
      type: String,
      unique: true,
      index: true,
      default: () => {
        const timestamp = Date.now();
        const random = Math.floor(1000 + Math.random() * 9000);

        return `CLM-${timestamp}-${random}`;
      },
    },

    claimText: {
      type: String,
      required: true,
      trim: true,
    },

    extractedData: {
      incidentType: { type: String, default: "" },
      vehicle: { type: String, default: "" },
      location: { type: String, default: "" },
      damage: { type: String, default: "" },
      date: { type: String, default: "" },
      policeReportNumber: { type: String, default: "" },
      animalDetails: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "Under Review",
        "Additional Information Required",
        "Approved",
        "Rejected",
        "Closed",
      ],
      default: "Draft",
    },

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    evidence: [
      {
        originalName: {
          type: String,
          required: true,
        },

        fileName: {
          type: String,
          required: true,
        },

        filePath: {
          type: String,
          required: true,
        },

        mimeType: {
          type: String,
          required: true,
        },

        size: {
          type: Number,
          required: true,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Claim", claimSchema);