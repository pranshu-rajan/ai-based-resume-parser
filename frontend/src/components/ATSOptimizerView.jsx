import React, { useState } from "react";
import { Sparkles, CheckCircle, AlertTriangle, ArrowRight, Wand2, ShieldCheck, FileCheck, Layers } from "lucide-react";
import { optimizeResumeATS, parseResumeFile } from "../services/api";

export default function ATSOptimizerView({ selectedJob, sampleResumes }) {
  const [activeResume, setActiveResume] = useState(null);
  const [atsReport, setAtsReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelectSample = (sample) => {
    // Generate simulated/sample candidate for instant optimization preview
    const cand = {
      id: "sample_cand",
      name: sample.name,
      file_name: sample.filename,
      skills: ["Python", "FastAPI", "React", "SQL", "Git"],
      summary: "Software engineer passionate about scalable cloud systems and modern web interfaces.",
      experiences: [
        {
          company: "Tech Systems",
          role: "Software Developer Intern",
          duration: "2024",
          description: "Worked on backend development and created API endpoints. Helped team build database queries and fix bugs.",
          skills_used: ["Python", "SQL"]
        }
      ],
      projects: ["AI Resume Intelligence Platform", "Task Management Web App"],
      raw_text: `${sample.name} Software Engineer Python SQL React FastAPI`
    };
    setActiveResume(cand);
    setAtsReport(null);
  };

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const parsed = await parseResumeFile(e.target.files[0]);
        setActiveResume(parsed);
        setAtsReport(null);
      } catch (err) {
        setErrorMsg(err.message || "Failed to parse resume");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRunOptimizer = async () => {
    if (!activeResume || !selectedJob) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const report = await optimizeResumeATS(activeResume, selectedJob);
      setAtsReport(report);
    } catch (err) {
      setErrorMsg(err.message || "Failed to optimize ATS");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Intro Header */}
      <div className="app-card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge badge-primary">Dual-Persona Mode</span>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Job Seeker ATS Optimization Studio</h2>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 4 }}>
              Audit your resume against <strong>{selectedJob?.title || "Target Role"}</strong>, uncover missing keywords, and polish bullets using the <strong>STAR (Situation, Task, Action, Result)</strong> framework.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label className="btn btn-secondary" style={{ cursor: "pointer", fontSize: "0.8rem", padding: "7px 14px" }}>
              Upload My Resume
              <input type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={handleFileUpload} />
            </label>

            {sampleResumes.length > 0 && (
              <button
                onClick={() => handleSelectSample(sampleResumes[0])}
                className="btn btn-ghost"
                style={{ fontSize: "0.8rem" }}
              >
                Use Sample: {sampleResumes[0].name.slice(0, 18)}...
              </button>
            )}
          </div>
        </div>

        {/* Selected Candidate Banner */}
        {activeResume && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: "var(--bg-subtle)",
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileCheck size={18} color="var(--accent-primary)" />
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{activeResume.name}</span>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginLeft: 8 }}>
                  ({activeResume.file_name || "Custom Upload"})
                </span>
              </div>
            </div>

            <button
              onClick={handleRunOptimizer}
              disabled={isLoading}
              className="btn btn-primary"
              style={{ fontSize: "0.8rem", padding: "6px 14px" }}
            >
              <Wand2 size={14} />
              {isLoading ? "Running Diagnostic..." : "Run ATS Diagnostic & STAR Polish"}
            </button>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: 12, color: "var(--danger)", fontSize: "0.8rem" }}>
            {errorMsg}
          </div>
        )}
      </div>

      {/* Diagnostic Report */}
      {atsReport && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Score Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div className="app-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                ATS Pass Probability
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 800, color: atsReport.ats_score >= 80 ? "var(--success)" : "var(--warning)", marginTop: 4 }}>
                {atsReport.ats_score}%
              </div>
              <span className={`badge ${atsReport.ats_score >= 80 ? "badge-success" : "badge-warning"}`}>
                {atsReport.ats_score >= 80 ? "High Pass Rate" : "Requires Keyword Optimization"}
              </span>
            </div>

            <div className="app-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Keyword Coverage
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--accent-primary)", marginTop: 4 }}>
                {atsReport.keyword_match_percentage}%
              </div>
              <span className="badge badge-primary">
                {atsReport.found_keywords?.length || 0} Matched / {atsReport.critical_missing_keywords?.length || 0} Missing
              </span>
            </div>

            <div className="app-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Parseability & Layout
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--success)", marginTop: 4 }}>
                {atsReport.formatting_score}%
              </div>
              <span className="badge badge-success">
                Clean Standard Structure
              </span>
            </div>
          </div>

          {/* Missing Keywords Warning */}
          <div className="app-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={18} color="var(--warning)" />
              Critical Missing Keywords to Add:
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {atsReport.critical_missing_keywords?.map((kw, i) => (
                <span key={i} className="badge badge-warning" style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                  + {kw}
                </span>
              ))}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Tip: Integrate these exact terms in your skills section and contextualized inside project descriptions.
            </p>
          </div>

          {/* STAR Method AI Polish (Before vs After) */}
          <div className="app-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Wand2 size={18} color="var(--accent-primary)" />
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                  AI Bullet Point Polisher (STAR Methodology)
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  Transforms passive duty descriptions into high-impact accomplishments with quantifiable metrics
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {atsReport.star_improvements?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    padding: 16,
                    background: "var(--bg-card)"
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                    {/* Before */}
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--danger)", textTransform: "uppercase", marginBottom: 4 }}>
                        Before (Weak / Passive):
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                        "{item.original_bullet}"
                      </div>
                    </div>

                    {/* After */}
                    <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--success)", textTransform: "uppercase", marginBottom: 4 }}>
                        After (High-Impact STAR Format):
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600 }}>
                        "{item.improved_bullet}"
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, fontSize: "0.78rem" }}>
                    <div>
                      <strong style={{ color: "var(--accent-primary)" }}>Quantifiable Metrics Injected:</strong> {item.metrics_added}
                    </div>
                    <div style={{ color: "var(--text-muted)" }}>
                      {item.rationale}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="app-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle size={18} color="var(--success)" />
              Strategic Optimization Checklist:
            </h3>
            <ul style={{ paddingLeft: 20, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {atsReport.actionable_fixes?.map((fix, idx) => (
                <li key={idx}>{fix}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
