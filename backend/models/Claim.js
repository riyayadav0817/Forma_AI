const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    claimText: {
      type: String,
      required: true,
    },

    extractedData: {
      incidentType: {
        type: String,
        default: "",
      },
      vehicle: {
        type: String,
        default: "",
      },
      location: {
        type: String,
        default: "",
      },
      damage: {
        type: String,
        default: "",
      },
      date: {
        type: String,
        default: "",
      },
      policeReportNumber: {
        type: String,
        default: "",
      },
      animalDetails: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Claim", claimSchema);