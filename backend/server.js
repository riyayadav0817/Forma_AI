const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

app.post("/api/ai/extract", async (req, res) => {
  try {
    const { claim } = req.body;

    if (!claim) {
      return res.status(400).json({
        error: "Claim text is required",
      });
    }

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `
Extract insurance claim information from the following text.

Return ONLY valid JSON with these fields:
{
  "incidentType": "",
  "vehicle": "",
  "location": "",
  "damage": "",
  "date": ""
}

Claim:
${claim}
      `,
    });

    const result = response.output_text;

    res.json({
      success: true,
      data: JSON.parse(result),
    });
  } catch (error) {
    console.error("AI extraction error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});