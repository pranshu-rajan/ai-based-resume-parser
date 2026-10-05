import React, { useRef } from "react";
import { UploadCloud, File, FileText, CheckCircle2, Trash2, Sparkles, FolderArchive } from "lucide-react";

export default function ResumeUploader({
  selectedFiles,
  setSelectedFiles,
  sampleResumes,
  useSampleResumes,
  setUseSampleResumes,
  onRunEvaluation,
  isLoading
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
      setUseSampleResumes(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArr = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
      setUseSampleResumes(false);
    }
  };

  const handleSelectSamples = () => {
    setUseSampleResumes(true);
    setSelectedFiles([]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="app-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--accent-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-primary)"
          }}>
            <UploadCloud size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Resume Ingestion Hub</h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Upload candidates or evaluate bundled Day 5 test resumes
            </p>
          </div>
        </div>

        {/* 1-Click Test Button for Day 5 Resumes */}
        <button
          onClick={handleSelectSamples}
          className={`btn ${useSampleResumes ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "6px 14px", fontSize: "0.8rem" }}
        >
          <FolderArchive size={14} />
          <span>Use 4 Day 5 Sample Resumes</span>
          {useSampleResumes && <CheckCircle2 size={14} />}
        </button>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: "2px dashed var(--border-subtle)",
          borderRadius: 12,
          padding: "24px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: useSampleResumes ? "var(--bg-subtle)" : "#ffffff",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--accent-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent-primary)",
          margin: "0 auto 10px"
        }}>
          <UploadCloud size={22} />
        </div>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
          Drag & drop candidate resumes here, or <span style={{ color: "var(--accent-primary)" }}>browse files</span>
        </div>
        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 4 }}>
          Supports PDF, DOCX, TXT (up to 15MB each) • Layout-aware text extraction
        </div>
      </div>

      {/* Selected Sample Resumes Info */}
      {useSampleResumes && (
        <div style={{
          marginTop: 14,
          padding: 12,
          background: "var(--accent-light)",
          border: "1px solid var(--accent-subtle)",
          borderRadius: 8
        }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: 6 }}>
            Loaded 4 Benchmark Resumes from Day 5 Archive:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {sampleResumes.map((sample, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <FileText size={14} color="var(--accent-primary)" />
                <span style={{ fontWeight: 600 }}>{sample.name}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>({sample.size_kb} KB)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Uploaded Files List */}
      {!useSampleResumes && selectedFiles.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
            Selected Files ({selectedFiles.length}):
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--bg-subtle)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <File size={14} color="var(--accent-primary)" />
                <span>{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(idx);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action CTA */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button
          onClick={onRunEvaluation}
          disabled={isLoading || (!useSampleResumes && selectedFiles.length === 0)}
          className="btn btn-primary"
          style={{ padding: "10px 22px", fontSize: "0.9rem" }}
        >
          <Sparkles size={16} />
          {isLoading ? "Running 5-Pillar AI Evaluation..." : "Run AI Candidate Evaluation"}
        </button>
      </div>
    </div>
  );
}
