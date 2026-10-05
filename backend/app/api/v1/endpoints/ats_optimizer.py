from typing import Optional, List
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from app.models.schemas import (
    ParsedResume, JobDescription, ATSOptimizationReport, STARImprovement
)
from app.core.llm import LLMOrchestrator
from app.core.embeddings import SemanticSimilarityEngine

router = APIRouter(prefix="/ats", tags=["ATS Optimizer"])

class OptimizeRequest(BaseModel):
    resume: ParsedResume
    job: JobDescription

@router.post("/optimize", response_model=ATSOptimizationReport)
def optimize_for_ats(
    request: OptimizeRequest,
    x_api_key: Optional[str] = Header(None, alias="X-Groq-API-Key")
):
    """
    Generate actionable ATS diagnostic report and rewrite weak resume bullet points
    using the STAR (Situation, Task, Action, Result) impact framework.
    """
    resume = request.resume
    job = request.job
    
    # Keyword coverage
    found_keys, missing_keys = SemanticSimilarityEngine.extract_keywords_coverage(
        resume.raw_text or " ".join(resume.skills),
        job.required_skills + job.preferred_skills
    )
    
    coverage_pct = round((len(found_keys) / (len(found_keys) + len(missing_keys) or 1)) * 100, 1)

    orchestrator = LLMOrchestrator(api_key=x_api_key)

    system_prompt = """
    You are an Executive Resume Coach and ATS Algorithm Specialist.
    Analyze the candidate's resume against the target Job Description.
    
    Provide:
    1. ats_score (0-100): Realistic probability of clearing algorithmic keyword screeners.
    2. formatting_score (0-100): Cleanliness of layout, lack of unparseable tables/graphics.
    3. actionable_fixes: List 4-5 concrete changes the candidate must make.
    4. star_improvements: Pick 2-3 weak or generic bullet points from candidate's experiences/projects,
       and rewrite them into powerhouse STAR-format bullets with quantifiable metrics, strong action verbs, and business outcomes.
    5. overall_feedback: Encouraging but direct strategic coaching advice.

    Return ONLY a JSON object:
    {
      "ats_score": float,
      "formatting_score": float,
      "actionable_fixes": ["string"],
      "star_improvements": [
        {
          "original_bullet": "string",
          "improved_bullet": "string",
          "metrics_added": "e.g. +35% latency reduction, 10k users",
          "rationale": "why this version wins"
        }
      ],
      "overall_feedback": "string"
    }
    """

    user_prompt = f"""
    TARGET JOB:
    Title: {job.title}
    Required Skills: {', '.join(job.required_skills)}
    Responsibilities: {', '.join(job.responsibilities)}

    CANDIDATE RESUME:
    Name: {resume.name}
    Skills: {', '.join(resume.skills)}
    Summary: {resume.summary}
    Experiences: {[exp.model_dump() for exp in resume.experiences]}
    Projects: {resume.projects}
    """

    def mock_ats(prompt: str):
        # Heuristic fallback
        return {
            "ats_score": round(max(55.0, min(95.0, coverage_pct * 0.9 + 15)), 1),
            "formatting_score": 92.0,
            "actionable_fixes": [
                f"Integrate missing core keywords directly into bullet points: {', '.join(missing_keys[:3]) if missing_keys else 'Distributed Systems, Docker'}",
                "Quantify project outcomes with numbers (e.g., latency, active users, throughput)",
                "Standardize section headers to standard terms: 'Professional Experience', 'Technical Skills', 'Education'",
                "Add a 3-line targeted Summary section aligning directly with the job requirements"
            ],
            "star_improvements": [
                {
                    "original_bullet": "Worked on backend development and created API endpoints.",
                    "improved_bullet": "Architected and deployed 12+ RESTful microservice endpoints using Python and FastAPI, reducing response latency by 32% across 50,000+ daily requests.",
                    "metrics_added": "32% latency reduction, 50,000+ daily requests",
                    "rationale": "Transitions from passive duty description to active accomplishment with measurable system impact."
                },
                {
                    "original_bullet": "Helped team build database queries and fix bugs.",
                    "improved_bullet": "Optimized relational database queries and indexed foreign keys, eliminating N+1 query bottlenecks and cutting server memory footprint by 25%.",
                    "metrics_added": "25% memory reduction, resolved N+1 bottlenecks",
                    "rationale": "Demonstrates architectural depth and problem-solving initiative."
                }
            ],
            "overall_feedback": f"Your profile has solid foundations with {len(found_keys)} matching skills. By embedding quantifiable outcomes and integrating the missing technical keywords, your profile will stand out in the top 5% of applicants."
        }

    ats_data = orchestrator.call_structured_json(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        mock_fallback_handler=mock_ats
    )

    improvements = [
        STARImprovement(
            original_bullet=item.get("original_bullet", ""),
            improved_bullet=item.get("improved_bullet", ""),
            metrics_added=item.get("metrics_added", ""),
            rationale=item.get("rationale", "")
        )
        for item in ats_data.get("star_improvements", [])
    ]

    return ATSOptimizationReport(
        candidate_name=resume.name or "Candidate",
        ats_score=float(ats_data.get("ats_score", 75.0)),
        formatting_score=float(ats_data.get("formatting_score", 90.0)),
        keyword_match_percentage=coverage_pct,
        critical_missing_keywords=missing_keys,
        found_keywords=found_keys,
        actionable_fixes=ats_data.get("actionable_fixes", []),
        star_improvements=improvements,
        overall_feedback=ats_data.get("overall_feedback", "Solid candidate profile.")
    )
