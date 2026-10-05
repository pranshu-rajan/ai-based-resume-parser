import React from "react";
import { X, CheckCircle, AlertCircle, HelpCircle, User, Briefcase, GraduationCap, Mail, Phone, ExternalLink } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function CandidateModal({ candidate, onClose }) {
  if (!candidate) return null;

  const radarData = [
    { subject: "Hard Skills", value: candidate.score_breakdown.skills_score, fullMark: 100 },
    { subject: "Experience", value: candidate.score_breakdown.experience_score, fullMark: 100 },
    { subject: "Education", value: candidate.score_breakdown.education_score, fullMark: 100 },
    { subject: "Quant Impact", value: candidate.score_breakdown.impact_score, fullMark: 100 },
    { subject: "Trajectory", value: candidate.score_breakdown.trajectory_score, fullMark: 100 },
  ];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 90,
      padding: 20
    }}>
      <div className="app-card-elevated" style={{
        width: "100%",
        maxWidth: 900,
        maxHeight: "90vh",
        overflowY: "auto",
        padding: 28,
        position: "relative"
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{candidate.name}</h2>
              <span className={`badge ${
                candidate.match_tier === "Strong Fit" ? "badge-success" :
                candidate.match_tier === "Good Fit" ? "badge-primary" : "badge-warning"
              }`}>
                {candidate.match_tier}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 6 }}>
              {candidate.parsed_resume?.email && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Mail size={13} color="var(--accent-primary)" /> {candidate.parsed_resume.email}
                </span>
              )}
              {candidate.parsed_resume?.phone && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={13} color="var(--accent-primary)" /> {candidate.parsed_resume.phone}
                </span>
              )}
              <span style={{ color: "var(--text-muted)" }}>File: {candidate.file_name}</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--accent-primary)", lineHeight: 1 }}>
              {candidate.overall_score}%
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Overall Match Score
            </div>
          </div>
        </div>

        {/* Grid: Radar Chart + 5-Pillar Score List */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 24 }}>
          {/* Radar Chart */}
          <div style={{
            background: "var(--bg-subtle)",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              5-Pillar Competency Radar
            </div>
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Radar name="Candidate" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
            {[
              { label: "Hard Skills Alignment (35%)", val: candidate.score_breakdown.skills_score },
              { label: "Experience & Domain Tenure (25%)", val: candidate.score_breakdown.experience_score },
              { label: "Quantifiable Impact & STAR Metrics (20%)", val: candidate.score_breakdown.impact_score },
              { label: "Academic / Degree Fit (10%)", val: candidate.score_breakdown.education_score },
              { label: "Career Velocity & Trajectory (10%)", val: candidate.score_breakdown.trajectory_score },
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 600, marginBottom: 4 }}>
                  <span>{item.label}</span>
                  <span style={{ color: "var(--accent-primary)" }}>{item.val}%</span>
                </div>
                <div style={{ width: "100%", height: 7, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${item.val}%`, height: "100%", background: "var(--accent-primary)", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills: Matching vs Missing */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
          <div style={{ padding: 14, borderRadius: 10, background: "var(--success-light)", border: "1px solid var(--success-border)" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--success)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <CheckCircle size={15} /> Validated Skills ({candidate.matching_skills?.length || 0})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {candidate.matching_skills?.map((s, i) => (
                <span key={i} className="badge badge-success">{s}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 10, background: "var(--danger-light)", border: "1px solid var(--danger-border)" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--danger)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <AlertCircle size={15} /> Missing / Gaps ({candidate.missing_skills?.length || 0})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {candidate.missing_skills?.map((s, i) => (
                <span key={i} className="badge badge-danger">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths & Red Flags */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
          <div>
            <h4 style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
              Top Evaluation Strengths
            </h4>
            <ul style={{ paddingLeft: 18, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {candidate.strengths?.map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 6, color: "var(--danger)" }}>
              Potential Red Flags / Probes
            </h4>
            <ul style={{ paddingLeft: 18, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {candidate.red_flags?.length > 0 ? (
                candidate.red_flags.map((rf, i) => <li key={i}>{rf}</li>)
              ) : (
                <li>No significant structural anomalies or tenure red flags detected.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Dynamic AI Interview Questions */}
        {candidate.recommended_interview_questions?.length > 0 && (
          <div style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            padding: 16,
            marginBottom: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <HelpCircle size={16} color="var(--accent-primary)" />
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                AI-Generated Technical Interview Questions (Tailored to Candidate Gaps)
              </h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {candidate.recommended_interview_questions.map((q, i) => (
                <div key={i} style={{ fontSize: "0.8rem", background: "#ffffff", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>Q{i + 1}:</strong> {q}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}
