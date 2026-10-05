import React, { useState } from "react";
import { Key, X, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";
import { getCustomApiKey, setCustomApiKey } from "../services/api";

export default function ApiKeyModal({ isOpen, onClose }) {
  const [keyInput, setKeyInput] = useState(getCustomApiKey());
  const [savedStatus, setSavedStatus] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setCustomApiKey(keyInput.trim());
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setCustomApiKey("");
    setKeyInput("");
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 600);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.45)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 16
    }}>
      <div className="app-card-elevated" style={{ width: "100%", maxWidth: 500, padding: 24, position: "relative" }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
        >
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--accent-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-primary)"
          }}>
            <Key size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>LLM Provider Settings</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Groq Cloud / Fallback Orchestrator
            </p>
          </div>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
          Enter your <strong>Groq API Key</strong> to run live high-speed inference with <code>llama-3.3-70b-versatile</code> or <code>openai/gpt-oss-120b</code>. Your key is stored locally in your browser session.
        </p>

        <div style={{
          background: "var(--bg-subtle)",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          display: "flex",
          gap: 10,
          alignItems: "flex-start"
        }}>
          <Sparkles size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            <strong>Intelligent Demo Fallback:</strong> If left empty, the engine uses our high-fidelity built-in semantic evaluator so you can test all UI flows, batch comparisons, and STAR bullet polish with zero configuration!
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
              Groq API Key (gsk_...)
            </label>
            <input
              type="password"
              className="input-text"
              placeholder="gsk_..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-ghost"
              style={{ fontSize: "0.8rem", color: "var(--danger)" }}
            >
              Clear & Use Demo Engine
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {savedStatus ? (
                  <>
                    <CheckCircle size={16} /> Saved!
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
