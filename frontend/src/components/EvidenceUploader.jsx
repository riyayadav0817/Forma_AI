import { useRef, useState } from "react";
import { api, ASSET_BASE_URL } from "../api";
import { useToast } from "./Toast";
import { UploadIcon, ImageIcon, FileIcon, LoaderIcon } from "./Icons";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EvidenceUploader({ claimId, evidence, onUploaded }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const result = await api.uploadEvidence(claimId, files);
      onUploaded(result.data || []);
      toast.success("Evidence uploaded.");
    } catch (error) {
      toast.error(error.message || "Evidence upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="evidence">
      <div
        className={`evidence__dropzone ${dragActive ? "is-active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <>
            <LoaderIcon />
            <p>Uploading evidence…</p>
          </>
        ) : (
          <>
            <UploadIcon />
            <p>
              <strong>Click to upload</strong> or drag photos / PDFs here
            </p>
            <span className="evidence__hint">JPG, PNG, WEBP or PDF · up to 10 MB each</span>
          </>
        )}
      </div>

      {evidence && evidence.length > 0 && (
        <ul className="evidence__list">
          {evidence.map((file) => (
            <li key={file.fileName} className="evidence__item">
              {file.mimeType?.startsWith("image/") ? (
                <ImageIcon width={16} height={16} />
              ) : (
                <FileIcon width={16} height={16} />
              )}

              <a
                href={`${ASSET_BASE_URL}${file.filePath}`}
                target="_blank"
                rel="noreferrer"
              >
                {file.originalName}
              </a>

              <span className="evidence__size">{formatSize(file.size)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
