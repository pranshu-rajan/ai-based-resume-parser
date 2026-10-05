import React from "react";
import { Sparkles, Key, FileText, Users, ExternalLink, ShieldCheck } from "lucide-react";
import { getCustomApiKey } from "../services/api";

export default function Navbar({ activeMode, setActiveMode, onOpenApiKeyModal }) {
  const hasKey = Boolean(getCustomApiKey());

  return (
    <header style={{
      background: "#ffffff",
      borderBottom: "1px solid var(--border-subtle)",
      position: "sticky",
      top: 0,
      zIndex: 40,
      padding: "12px 24px"
    }}>
      <div style={{
        maxWidth: 1300,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 4px 10px rgba(79, 70, 229, 0.25)"
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                TalentIntel <span style={{ color: "var(--accent-primary)" }}>AI</span>
              </h1>
              <span className="badge badge-primary">2026 Edition</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: -2 }}>
              Enterprise ATS & Explainable Candidate Intelligence
            </p>
          </div>
        </div>

        {/* Dual-Persona Switcher */}
        <div style={{
          display: "flex",
          background: "var(--bg-subtle)",
          padding: 4,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)"
        }}>
          <button
            onClick={() => setActiveMode("recruiter")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: activeMode === "recruiter" ? "#ffffff" : "transparent",
              color: activeMode === "recruiter" ? "var(--accent-primary)" : "var(--text-secondary)",
              boxShadow: activeMode === "recruiter" ? "var(--shadow-sm)" : "none"
            }}
          >
            <Users size={15} />
            Recruiter Leaderboard
          </button>
          <button
            onClick={() => setActiveMode("candidate")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: activeMode === "candidate" ? "#ffffff" : "transparent",
              color: activeMode === "candidate" ? "var(--accent-primary)" : "var(--text-secondary)",
              boxShadow: activeMode === "candidate" ? "var(--shadow-sm)" : "none"
            }}
          >
            <FileText size={15} />
            Job Seeker ATS Studio
          </button>
        </div>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onOpenApiKeyModal}
            className="btn btn-secondary"
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            title="Configure Groq API Key or use built-in intelligent demo engine"
          >
            <Key size={14} color={hasKey ? "var(--success)" : "var(--warning)"} />
            <span>{hasKey ? "Groq API: Connected" : "Mode: Demo / Custom Key"}</span>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: hasKey ? "var(--success)" : "var(--warning)"
            }} />
          </button>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
            style={{ padding: "6px 10px", fontSize: "0.8rem" }}
          >
            <ExternalLink size={14} />
            FastAPI Docs
          </a>
        </div>
      </div>
    </header>
  );
}
