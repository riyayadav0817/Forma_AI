// Central place for every backend call the UI makes.
// Base URL can be overridden per-environment via VITE_API_URL
// (see .env.example) — defaults to the local dev backend.

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: options.body instanceof FormData
      ? undefined
      : { "Content-Type": "application/json" },
    ...options,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.error || `Request to ${path} failed`);
  }

  return result;
}

export const api = {
  health: () => request("/health"),

  extractClaim: (claim) =>
    request("/ai/extract", {
      method: "POST",
      body: JSON.stringify({ claim }),
    }),

  checkMissingFields: (extractedData) =>
    request("/claims/check-missing", {
      method: "POST",
      body: JSON.stringify({ extractedData }),
    }),

  generateSummary: (claimText, extractedData) =>
    request("/claims/generate-summary", {
      method: "POST",
      body: JSON.stringify({ claimText, extractedData }),
    }),

  saveClaim: (claimText, extractedData, editingId) =>
    request(editingId ? `/claims/${editingId}` : "/claims", {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify({ claimText, extractedData }),
    }),

  fetchClaims: () => request("/claims"),

  fetchClaim: (id) => request(`/claims/${id}`),

  deleteClaim: (id) =>
    request(`/claims/${id}`, { method: "DELETE" }),

  uploadEvidence: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("evidence", file));

    return request(`/claims/${id}/evidence`, {
      method: "POST",
      body: formData,
    });
  },
};

export const ASSET_BASE_URL = BASE_URL.replace(/\/api$/, "");
