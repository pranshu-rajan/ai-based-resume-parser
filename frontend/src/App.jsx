import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import JobSelector from "./components/JobSelector";
import ResumeUploader from "./components/ResumeUploader";
import CandidateLeaderboard from "./components/CandidateLeaderboard";
import CandidateModal from "./components/CandidateModal";
import CandidateComparison from "./components/CandidateComparison";
import ATSOptimizerView from "./components/ATSOptimizerView";
import ApiKeyModal from "./components/ApiKeyModal";

import {
  fetchJobTemplates,
  fetchSampleResumes,
  evaluateBatchSamples,
  evaluateBatchFiles
} from "./services/api";

export default function App() {
  const [activeMode, setActiveMode] = useState("recruiter"); // "recruiter" | "candidate"
  const [templates, setTemplates] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const [sampleResumes, setSampleResumes] = useState([]);
  const [useSampleResumes, setUseSampleResumes] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [evaluations, setEvaluations] = useState([]);
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [comparisonPair, setComparisonPair] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    async function init() {
      try {
        const [jobs, resumes] = await Promise.all([
          fetchJobTemplates(),
          fetchSampleResumes()
        ]);
        setTemplates(jobs);
        if (jobs.length > 0) {
          setSelectedJob(jobs[0]); // Amazon SDE-1 by default
        }
        setSampleResumes(resumes);
      } catch (err) {
        console.warn("Initial load fallback:", err);
      }
    }
    init();
  }, []);

  const handleRunEvaluation = async () => {
    if (!selectedJob) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      let result;
      if (useSampleResumes) {
        result = await evaluateBatchSamples(selectedJob, null);
      } else {
        result = await evaluateBatchFiles(selectedFiles, selectedJob);
      }
      setEvaluations(result.evaluations || []);
    } catch (err) {
      setErrorMsg(err.message || "Evaluation encountered an issue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navigation */}
      <Navbar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Canvas */}
      <main style={{ flex: 1, maxWidth: 1300, width: "100%", margin: "0 auto", padding: "28px 24px" }}>
        {/* Error notification banner if any */}
        {errorMsg && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: "0.85rem"
          }}>
            {errorMsg}
          </div>
        )}

        {/* Recruiter Evaluation Mode */}
        {activeMode === "recruiter" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Step 1: Benchmark Job Profile */}
            <JobSelector
              templates={templates}
              selectedJob={selectedJob}
              setSelectedJob={setSelectedJob}
            />

            {/* Step 2: Resume Ingestion */}
            <ResumeUploader
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              sampleResumes={sampleResumes}
              useSampleResumes={useSampleResumes}
              setUseSampleResumes={setUseSampleResumes}
              onRunEvaluation={handleRunEvaluation}
              isLoading={isLoading}
            />

            {/* Step 3: Ranked Talent Leaderboard */}
            <CandidateLeaderboard
              evaluations={evaluations}
              onSelectCandidate={(cand) => setActiveCandidate(cand)}
              onCompareCandidates={(c1, c2) => setComparisonPair({ c1, c2 })}
            />
          </div>
        )}

        {/* Job Seeker ATS Mode */}
        {activeMode === "candidate" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <JobSelector
              templates={templates}
              selectedJob={selectedJob}
              setSelectedJob={setSelectedJob}
            />
            <ATSOptimizerView
              selectedJob={selectedJob}
              sampleResumes={sampleResumes}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <CandidateModal
        candidate={activeCandidate}
        onClose={() => setActiveCandidate(null)}
      />

      {comparisonPair && (
        <CandidateComparison
          candidate1={comparisonPair.c1}
          candidate2={comparisonPair.c2}
          onClose={() => setComparisonPair(null)}
        />
      )}

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "#ffffff",
        padding: "16px 24px",
        marginTop: 40,
        textAlign: "center",
        fontSize: "0.78rem",
        color: "var(--text-muted)"
      }}>
        Next-Gen AI Talent Intelligence Platform • FastAPI & React • Powered by Groq Ultra-Low Latency Inference & Hybrid Scoring
      </footer>
    </div>
  );
}
