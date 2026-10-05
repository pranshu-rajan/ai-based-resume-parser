import React, { useState } from "react";
import { Trophy, Award, CheckCircle, AlertTriangle, ArrowUpDown, Download, GitCompare, Eye, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function CandidateLeaderboard({
  evaluations,
  onSelectCandidate,
  onCompareCandidates
}) {
  const [filterTier, setFilterTier] = useState("all");
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  if (!evaluations || evaluations.length === 0) return null;

  const topCandidate = evaluations[0];

  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleToggleCompare = (id) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 2) {
          return [prev[1], id];
        }
        return [...prev, id];
      }
    });
  };

  const filteredEvaluations = evaluations.filter((c) => {
    if (filterTier === "all") return true;
    return c.match_tier.toLowerCase().includes(filterTier.toLowerCase());
  });

  const exportToCSV = () => {
    const headers = ["Rank", "Name", "File", "Overall_Score", "Tier", "Skills_Score", "Experience_Score", "Impact_Score", "Verdict"];
    const rows = evaluations.map((c, i) => [
      i + 1,
      `"${c.name}"`,
      `"${c.file_name}"`,
      c.overall_score,
      `"${c.match_tier}"`,
      c.score_breakdown.skills_score,
      c.score_breakdown.experience_score,
      c.score_breakdown.impact_score,
      `"${c.verdict.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidate_evaluation_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Candidate Spotlight Trophy Card */}
      {topCandidate && (
        <div
          className="app-card-elevated"
          style={{
            padding: 24,
            background: "linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)",
            border: "1px solid #ddd6fe",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                onClick={handleTriggerConfetti}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 6px 16px rgba(245, 158, 11, 0.3)",
                  cursor: "pointer"
                }}
                title="Click for celebration!"
              >
                <Trophy size={28} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge badge-warning" style={{ background: "#fef3c7", color: "#b45309" }}>
                    #1 Top Match Candidate
                  </span>
                  <span className="badge badge-success">
                    {topCandidate.match_tier}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
                  {topCandidate.name}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2, maxWidth: 650 }}>
                  {topCandidate.verdict}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-primary)", lineHeight: 1 }}>
                  {topCandidate.overall_score}%
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Overall Match Index
                </div>
              </div>

              <button
                onClick={() => onSelectCandidate(topCandidate)}
                className="btn btn-primary"
                style={{ padding: "10px 18px" }}
              >
                <Eye size={16} />
                <span>View Full Scorecard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Controls */}
      <div className="app-card" style={{ padding: 18 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
              Ranked Talent Leaderboard ({evaluations.length})
            </h3>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "strong", "good", "low"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: filterTier === tier ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                    background: filterTier === tier ? "var(--accent-light)" : "transparent",
                    color: filterTier === tier ? "var(--accent-primary)" : "var(--text-secondary)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize"
                  }}
                >
                  {tier === "all" ? "All Tiers" : `${tier} Fit`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {selectedForCompare.length === 2 && (
              <button
                onClick={() => {
                  const c1 = evaluations.find(e => e.candidate_id === selectedForCompare[0]);
                  const c2 = evaluations.find(e => e.candidate_id === selectedForCompare[1]);
                  if (c1 && c2) onCompareCandidates(c1, c2);
                }}
                className="btn btn-primary"
                style={{ padding: "6px 14px", fontSize: "0.8rem", background: "var(--success)" }}
              >
                <GitCompare size={14} />
                Compare Selected 2
              </button>
            )}

            <button
              onClick={exportToCSV}
              className="btn btn-secondary"
              style={{ padding: "6px 14px", fontSize: "0.8rem" }}
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                <th style={{ padding: "10px 12px", width: 60 }}>Rank</th>
                <th style={{ padding: "10px 12px" }}>Candidate & File</th>
                <th style={{ padding: "10px 12px", width: 140 }}>Match Score</th>
                <th style={{ padding: "10px 12px", width: 120 }}>Tier</th>
                <th style={{ padding: "10px 12px", width: 130 }}>Skills Score</th>
                <th style={{ padding: "10px 12px", width: 130 }}>Experience</th>
                <th style={{ padding: "10px 12px", width: 80, textAlign: "center" }}>Compare</th>
                <th style={{ padding: "10px 12px", width: 90, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvaluations.map((cand, idx) => {
                const isSelected = selectedForCompare.includes(cand.candidate_id);
                return (
                  <tr
                    key={cand.candidate_id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      background: isSelected ? "var(--accent-light)" : "transparent",
                      transition: "background 0.15s ease"
                    }}
                  >
                    <td style={{ padding: "12px", fontWeight: 700, color: idx === 0 ? "#b45309" : "var(--text-secondary)" }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{cand.name}</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{cand.file_name}</div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          flex: 1,
                          height: 6,
                          background: "#e2e8f0",
                          borderRadius: 3,
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: `${cand.overall_score}%`,
                            height: "100%",
                            background: cand.overall_score >= 80 ? "var(--success)" : cand.overall_score >= 65 ? "var(--accent-primary)" : "var(--warning)",
                            borderRadius: 3
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{cand.overall_score}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span className={`badge ${
                        cand.match_tier === "Strong Fit" ? "badge-success" :
                        cand.match_tier === "Good Fit" ? "badge-primary" : "badge-warning"
                      }`}>
                        {cand.match_tier}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontWeight: 600 }}>
                      {cand.score_breakdown.skills_score}%
                    </td>
                    <td style={{ padding: "12px" }}>
                      {cand.experience_match ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--success)", fontSize: "0.78rem", fontWeight: 600 }}>
                          <CheckCircle size={14} /> Qualified
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--warning)", fontSize: "0.78rem", fontWeight: 600 }}>
                          <AlertTriangle size={14} /> Under Target
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCompare(cand.candidate_id)}
                        style={{ cursor: "pointer", width: 16, height: 16, accentColor: "var(--accent-primary)" }}
                        title="Select 2 to compare side-by-side"
                      />
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button
                        onClick={() => onSelectCandidate(cand)}
                        className="btn btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "0.76rem" }}
                      >
                        Inspect
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
