import { useMemo, useState } from "react";
import {
  SearchIcon,
  FolderIcon,
  EditIcon,
  TrashIcon,
  LoaderIcon,
  CarIcon,
} from "./Icons";

const INCIDENT_STYLES = {
  Theft: { label: "Theft", tone: "amber" },
  "Animal Collision": { label: "Animal Collision", tone: "teal" },
  Accident: { label: "Accident", tone: "red" },
};

function incidentTone(type) {
  return INCIDENT_STYLES[type]?.tone || "slate";
}

export default function ClaimsDashboard({
  claims,
  loading,
  editLoadingId,
  deletingId,
  onOpen,
  onDelete,
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return claims;

    const q = query.toLowerCase();
    return claims.filter((c) => {
      const haystack = [
        c.claimText,
        c.extractedData?.incidentType,
        c.extractedData?.vehicle,
        c.extractedData?.location,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [claims, query]);

  return (
    <section className="card">
      <div className="card__header">
        <h2>
          <FolderIcon /> Saved Claims
        </h2>
        <span className="pill">{claims.length}</span>
      </div>

      {claims.length > 0 && (
        <div className="search-input">
          <SearchIcon width={16} height={16} />
          <input
            type="text"
            placeholder="Search by vehicle, location, incident type…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {loading && claims.length === 0 ? (
        <div className="empty-state">
          <LoaderIcon />
          <p>Loading your saved claims…</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <FolderIcon width={30} height={30} />
          <p>No saved claims yet.</p>
          <span>Fill out the form above and save your first claim.</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <SearchIcon width={26} height={26} />
          <p>No claims match “{query}”.</p>
        </div>
      ) : (
        <div className="claims-grid">
          {filtered.map((claim) => {
            const tone = incidentTone(claim.extractedData?.incidentType);
            return (
              <div key={claim._id} className="claim-card">
                <div className="claim-card__top">
                  <span className={`badge badge--${tone}`}>
                    <CarIcon width={13} height={13} />
                    {claim.extractedData?.incidentType || "Insurance Claim"}
                  </span>
                  {claim.evidence?.length > 0 && (
                    <span className="claim-card__evidence-count">
                      {claim.evidence.length} file
                      {claim.evidence.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <p className="claim-card__text">{claim.claimText}</p>

                <dl className="claim-card__meta">
                  <div>
                    <dt>Vehicle</dt>
                    <dd>{claim.extractedData?.vehicle || "—"}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{claim.extractedData?.location || "—"}</dd>
                  </div>
                  <div>
                    <dt>Date</dt>
                    <dd>{claim.extractedData?.date || "—"}</dd>
                  </div>
                </dl>

                <div className="claim-card__actions">
                  <button
                    className="btn btn--secondary btn--small"
                    onClick={() => onOpen(claim._id)}
                    disabled={editLoadingId === claim._id}
                  >
                    <EditIcon width={15} height={15} />
                    {editLoadingId === claim._id ? "Opening…" : "Open & Edit"}
                  </button>

                  <button
                    className="btn btn--ghost-danger btn--small"
                    onClick={() => onDelete(claim._id)}
                    disabled={deletingId === claim._id}
                  >
                    <TrashIcon width={15} height={15} />
                    {deletingId === claim._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
