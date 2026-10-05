import React, { useState } from "react";
import { Briefcase, Building, Clock, GraduationCap, ChevronDown, ChevronUp, Sparkles, Check } from "lucide-react";
import { parseJobDescription } from "../services/api";

export default function JobSelector({ templates, selectedJob, setSelectedJob }) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelectTemplate = (template) => {
    setSelectedJob(template);
  };

  const handleParseCustom = async () => {
    if (!customText.trim()) return;
    setIsParsing(true);
    setErrorMsg("");
    try {
      const parsed = await parseJobDescription(customText);
      setSelectedJob(parsed);
      setIsCustomOpen(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to extract criteria");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="app-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
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
            <Briefcase size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Target Job Profile & Criteria</h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Select benchmark role or provide your custom JD
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className="btn btn-secondary"
          style={{ padding: "6px 12px", fontSize: "0.78rem" }}
        >
          {isCustomOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isCustomOpen ? "Close Custom JD" : "+ Paste Custom JD"}
        </button>
      </div>

      {/* Preset Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {templates.map((tpl) => {
          const isSelected = selectedJob && selectedJob.id === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 8,
                border: isSelected ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                background: isSelected ? "var(--accent-light)" : "#ffffff",
                color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                fontWeight: isSelected ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isSelected ? "0 2px 8px rgba(79, 70, 229, 0.15)" : "none"
              }}
            >
              {isSelected && <Check size={14} />}
              <span>{tpl.title}</span>
              <span style={{ fontSize: "0.72rem", color: isSelected ? "var(--accent-primary)" : "var(--text-muted)" }}>
                ({tpl.company})
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom JD Accordion Drawer */}
      {isCustomOpen && (
        <div style={{
          background: "var(--bg-subtle)",
          padding: 16,
          borderRadius: 10,
          border: "1px solid var(--border-subtle)",
          marginBottom: 16
        }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6 }}>
            Paste Full Job Description Text:
          </label>
          <textarea
            className="textarea"
            rows={5}
            placeholder="Paste role description, responsibilities, required qualifications..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />

          {errorMsg && (
            <div style={{ color: "var(--danger)", fontSize: "0.78rem", marginTop: 6 }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button
              onClick={handleParseCustom}
              disabled={isParsing || !customText.trim()}
              className="btn btn-primary"
              style={{ fontSize: "0.8rem", padding: "7px 14px" }}
            >
              <Sparkles size={15} />
              {isParsing ? "Extracting Criteria with AI..." : "Extract Criteria with AI"}
            </button>
          </div>
        </div>
      )}

      {/* Selected Job Criteria Cards */}
      {selectedJob && (
        <div style={{
          background: "#ffffff",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Required Core Skills
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {selectedJob.required_skills?.map((skill, idx) => (
                <span key={idx} className="badge badge-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Preferred / Tools
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {selectedJob.preferred_skills?.slice(0, 6).map((skill, idx) => (
                <span key={idx} className="badge badge-neutral">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Experience & Education
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={14} color="var(--accent-primary)" />
                <span>Min: <strong>{selectedJob.minimum_experience || 0} years</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <GraduationCap size={14} color="var(--accent-primary)" />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedJob.education_requirements?.[0] || "STEM Degree / CS"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
