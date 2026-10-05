import React from "react";
import { X, GitCompare, Check, AlertCircle } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

export default function CandidateComparison({ candidate1, candidate2, onClose }) {
  if (!candidate1 || !candidate2) return null;

  const radarData = [
    { subject: "Hard Skills", c1: candidate1.score_breakdown.skills_score, c2: candidate2.score_breakdown.skills_score },
    { subject: "Experience", c1: candidate1.score_breakdown.experience_score, c2: candidate2.score_breakdown.experience_score },
    { subject: "Education", c1: candidate1.score_breakdown.education_score, c2: candidate2.score_breakdown.education_score },
    { subject: "Impact", c1: candidate1.score_breakdown.impact_score, c2: candidate2.score_breakdown.impact_score },
    { subject: "Trajectory", c1: candidate1.score_breakdown.trajectory_score, c2: candidate2.score_breakdown.trajectory_score },
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
      zIndex: 95,
      padding: 20
    }}>
      <div className="app-card-elevated" style={{
        width: "100%",
        maxWidth: 950,
        maxHeight: "90vh",
        overflowY: "auto",
        padding: 28,
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
        >
          <X size={22} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "var(--accent-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-primary)"
          }}>
            <GitCompare size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Candidate Head-to-Head Comparison</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Direct side-by-side evaluation against benchmark role
            </p>
          </div>
        </div>

        {/* Dual Radar Chart */}
        <div style={{
          background: "var(--bg-subtle)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>
            Competency Overlay: {candidate1.name} (Blue) vs. {candidate2.name} (Emerald)
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name={candidate1.name} dataKey="c1" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                <Radar name={candidate2.name} dataKey="c2" stroke="#059669" fill="#059669" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side by Side Comparative Table */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Candidate 1 */}
          <div style={{ border: "2px solid #c7d2fe", borderRadius: 10, padding: 16, background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent-primary)" }}>{candidate1.name}</h3>
                <span className="badge badge-primary">{candidate1.match_tier}</span>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-primary)" }}>
                {candidate1.overall_score}%
              </div>
            </div>
            
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 12 }}>
              {candidate1.verdict}
            </p>

            <div style={{ fontSize: "0.78rem", marginBottom: 8 }}>
              <strong>Matching Skills:</strong> {candidate1.matching_skills?.slice(0, 6).join(", ") || "None"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--danger)" }}>
              <strong>Missing Gaps:</strong> {candidate1.missing_skills?.slice(0, 4).join(", ") || "None"}
            </div>
          </div>

          {/* Candidate 2 */}
          <div style={{ border: "2px solid #a7f3d0", borderRadius: 10, padding: 16, background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--success)" }}>{candidate2.name}</h3>
                <span className="badge badge-success">{candidate2.match_tier}</span>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--success)" }}>
                {candidate2.overall_score}%
              </div>
            </div>

            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 12 }}>
              {candidate2.verdict}
            </p>

            <div style={{ fontSize: "0.78rem", marginBottom: 8 }}>
              <strong>Matching Skills:</strong> {candidate2.matching_skills?.slice(0, 6).join(", ") || "None"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--danger)" }}>
              <strong>Missing Gaps:</strong> {candidate2.missing_skills?.slice(0, 4).join(", ") || "None"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
