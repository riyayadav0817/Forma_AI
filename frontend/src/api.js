export const ASSET_BASE_URL = "http://localhost:5000";
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// Fires whenever a protected request comes back unauthorized so the
// app can clear the stale session and bounce to /login in one place,
// instead of every caller having to handle it individually.
const SESSION_EXPIRED_EVENT = "forma:session-expired";

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register"];

async function request(
  endpoint,
  options = {}
) {
  const token =
    localStorage.getItem("forma_token");

  const headers = {
    ...(options.headers || {}),
  };

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const isAuthCall = AUTH_ENDPOINTS.some((path) =>
      endpoint.startsWith(path)
    );

    if (response.status === 401 && !isAuthCall) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    throw new Error(
      data.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

export { SESSION_EXPIRED_EVENT };

/* =========================
   AUTH
========================= */

export const api = {
  register: async (
    name,
    email,
    password
  ) => {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
  },

  login: async (
    email,
    password
  ) => {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },

  me: async () => {
    return request("/auth/me");
  },

  /* =========================
     CLAIM EXTRACTION
  ========================= */

  extractClaim: async (claim) => {
    return request(
      "/claims/extract",
      {
        method: "POST",
        body: JSON.stringify({
          claim,
        }),
      }
    );
  },

  /* =========================
     SAVE / UPDATE
  ========================= */

  saveClaim: async (
    claimText,
    extractedData,
    id = null
  ) => {
    const payload = {
      claimText,
      extractedData,
    };

    if (id) {
      return request(
        `/claims/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(
            payload
          ),
        }
      );
    }

    return request("/claims", {
      method: "POST",
      body: JSON.stringify(
        payload
      ),
    });
  },

  /* =========================
     GET CLAIMS
  ========================= */

  fetchClaims: async () => {
    return request("/claims");
  },

  fetchClaim: async (id) => {
    return request(
      `/claims/${id}`
    );
  },

  /* =========================
     DELETE
  ========================= */

  deleteClaim: async (id) => {
    return request(
      `/claims/${id}`,
      {
        method: "DELETE",
      }
    );
  },

  /* =========================
     COMPLETENESS
  ========================= */

  checkMissingFields: async (
    form
  ) => {
    return request(
      "/claims/check-missing",
      {
        method: "POST",
        body: JSON.stringify({
          extractedData: form,
        }),
      }
    );
  },

  /* =========================
     SUMMARY
  ========================= */

  generateSummary: async (
    claimText,
    extractedData
  ) => {
    return request(
      "/claims/generate-summary",
      {
        method: "POST",
        body: JSON.stringify({
          claimText,
          extractedData,
        }),
      }
    );
  },

  /* =========================
     EVIDENCE
  ========================= */

  uploadEvidence: async (
    claimId,
    files
  ) => {
    const formData =
      new FormData();

    files.forEach((file) => {
      formData.append(
        "evidence",
        file
      );
    });

    return request(
      `/claims/${claimId}/evidence`,
      {
        method: "POST",
        body: formData,
      }
    );
  },
};