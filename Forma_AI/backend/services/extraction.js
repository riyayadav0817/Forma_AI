const { z } = require("zod");

/* =========================================================
   Forma AI — Claim Extraction Service
   ---------------------------------------------------------
   Turns a free-text claim story into the structured fields
   the dynamic form needs. Tries the real LLM first (OpenAI)
   and falls back to a deterministic keyword-based parser so
   the app keeps working even without an API key or if the
   AI call fails / times out.
========================================================= */

const ExtractionSchema = z.object({
  incidentType: z.string().default(""),
  vehicle: z.string().default(""),
  location: z.string().default(""),
  damage: z.string().default(""),
  date: z.string().default(""),
  policeReportNumber: z.string().default(""),
  animalDetails: z.string().default(""),
});

const EMPTY_RESULT = {
  incidentType: "",
  vehicle: "",
  location: "",
  damage: "",
  date: "",
  policeReportNumber: "",
  animalDetails: "",
};

/* =========================================================
   Rule-Based Fallback Extraction
   (deterministic keyword matching — always available,
   zero cost, zero external dependency)
========================================================= */

function ruleBasedExtract(claim) {
  const text = claim.toLowerCase();

  let incidentType = "";
  let vehicle = "";
  let location = "";
  let damage = "";
  let date = "";

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

  if (text.includes("honda")) vehicle = "Honda";
  else if (text.includes("toyota")) vehicle = "Toyota";
  else if (text.includes("bmw")) vehicle = "BMW";
  else if (text.includes("ford")) vehicle = "Ford";
  else if (text.includes("hyundai")) vehicle = "Hyundai";
  else if (text.includes("suzuki") || text.includes("maruti"))
    vehicle = "Maruti Suzuki";
  else if (text.includes("tata")) vehicle = "Tata";

  const locationMatch = claim.match(
    /\b(I-\d+|NH-\d+|Highway|parking lot|parking area)\b/i
  );
  if (locationMatch) location = locationMatch[0];

  const damageWords = [];
  if (text.includes("windshield")) damageWords.push("Windshield damaged");
  if (text.includes("bumper")) damageWords.push("Bumper damaged");
  if (text.includes("door")) damageWords.push("Door damaged");
  if (text.includes("glass")) damageWords.push("Glass damaged");
  if (text.includes("broken")) damageWords.push("Vehicle part broken");
  if (text.includes("shattered")) damageWords.push("Vehicle glass shattered");
  damage = damageWords.join(", ");

  if (text.includes("yesterday")) date = "Yesterday";
  else if (text.includes("today")) date = "Today";
  else if (text.includes("last night")) date = "Last night";

  return {
    ...EMPTY_RESULT,
    incidentType,
    vehicle,
    location,
    damage,
    date,
  };
}

/* =========================================================
   LLM Extraction (OpenAI)
========================================================= */

const SYSTEM_PROMPT = `You are the extraction engine for Forma AI, a dynamic insurance claim form.
Read the policyholder's free-text claim story and extract structured fields.
Respond with ONLY a JSON object, no prose, matching exactly this shape:
{
  "incidentType": one of "Accident" | "Theft" | "Animal Collision" | "" (best guess, empty if unclear),
  "vehicle": the vehicle make/model mentioned, or "",
  "location": where the incident happened, or "",
  "damage": a short comma-separated description of the damage, or "",
  "date": when it happened (as phrased by the user, e.g. "Yesterday", "12 March"), or "",
  "policeReportNumber": only if explicitly mentioned, or "",
  "animalDetails": only if incidentType is "Animal Collision", or ""
}
Never invent facts that are not implied by the text. Leave a field as "" if it isn't mentioned.`;

async function llmExtract(claim) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    // Lazy-require so the app still boots if the package or key is missing.
    const OpenAI = require("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: claim },
      ],
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const validated = ExtractionSchema.safeParse(parsed);

    if (!validated.success) return null;

    return validated.data;
  } catch (error) {
    console.error(
      "⚠️  LLM extraction failed, falling back to rule-based parser:",
      error.message
    );
    return null;
  }
}

/* =========================================================
   Public API
========================================================= */

async function extractClaimData(claim) {
  const aiResult = await llmExtract(claim);

  if (aiResult) {
    return { data: aiResult, source: "ai" };
  }

  return { data: ruleBasedExtract(claim), source: "rules" };
}

module.exports = { extractClaimData, ruleBasedExtract };
