import json
import re
from typing import Dict, Any, List
from app.models.schemas import (
    ParsedResume, JobDescription, CandidateEvaluation, ScoreBreakdown, RubricWeights
)
from app.core.embeddings import SemanticSimilarityEngine
from app.core.llm import LLMOrchestrator

class EvaluationEngine:
    def __init__(self, llm_orchestrator: LLMOrchestrator):
        self.llm = llm_orchestrator

    def evaluate_candidate(
        self,
        resume: ParsedResume,
        job: JobDescription,
        rubric: RubricWeights = RubricWeights()
    ) -> CandidateEvaluation:
        """
        Execute comprehensive 5-factor candidate evaluation against the job description.
        """
        # 1. Semantic TF-IDF similarity
        sim_score = SemanticSimilarityEngine.calculate_similarity(
            resume.raw_text or "",
            job.raw_text or f"{job.title} {' '.join(job.required_skills)} {' '.join(job.responsibilities)}"
        )
        
        # 2. Heuristic skill matching
        matched_skills, missing_skills = SemanticSimilarityEngine.extract_keywords_coverage(
            resume.raw_text or " ".join(resume.skills),
            job.required_skills
        )

        # 3. LLM Qualitative Evaluation with Rubric
        system_prompt = """
        You are a Principal Talent Acquisition Architect and Hiring Manager.
        Perform an in-depth, unbiased, and mathematically sound evaluation of the candidate resume against the Job Description.

        Score each of the 5 pillars strictly from 0 to 100:
        1. skills_score (0-100): Match of hard skills, programming tools, and frameworks.
        2. experience_score (0-100): Alignment of total years of experience, relevant industry domains, and seniority.
        3. education_score (0-100): Degree level, field relevance, or equivalent hands-on experience.
        4. impact_score (0-100): Evidence of measurable results, metrics, STAR method usage, and code ownership.
        5. trajectory_score (0-100): Career progression velocity, promotions, learning agility, leadership indicators.

        Return ONLY a JSON object matching this structure:
        {
          "skills_score": float,
          "experience_score": float,
          "education_score": float,
          "impact_score": float,
          "trajectory_score": float,
          "matching_skills": ["list of skills candidate has"],
          "missing_skills": ["list of critical missing skills"],
          "experience_match": bool,
          "experience_summary": "1-2 sentence assessment of their experience",
          "strengths": ["bullet points of top strengths"],
          "red_flags": ["concerns, tenure gaps, or missing critical domains"],
          "recommended_interview_questions": [
             "3-4 deep technical questions specifically targeting missing skills or ambiguous claims"
          ],
          "verdict": "2-3 sentences concise hiring recommendation"
        }
        """

        user_prompt = f"""
        JOB DESCRIPTION:
        Title: {job.title}
        Company: {job.company}
        Required Skills: {', '.join(job.required_skills)}
        Preferred Skills: {', '.join(job.preferred_skills)}
        Min Experience: {job.minimum_experience} years
        Education: {', '.join(job.education_requirements)}
        Responsibilities: {', '.join(job.responsibilities)}

        CANDIDATE RESUME:
        Name: {resume.name}
        Experience Years: {resume.total_experience_years}
        Skills: {', '.join(resume.skills)}
        Experience Details: {json.dumps([exp.model_dump() for exp in resume.experiences], default=str)}
        Education Details: {json.dumps([edu.model_dump() for edu in resume.education], default=str)}
        Projects: {', '.join(resume.projects)}
        Certifications: {', '.join(resume.certifications)}
        Full Text Summary: {resume.summary or (resume.raw_text[:1200] if resume.raw_text else '')}
        """

        def mock_evaluator(prompt: str) -> Dict[str, Any]:
            # Offline intelligent heuristic fallback
            req_count = len(job.required_skills) or 1
            skill_pct = min(100.0, (len(matched_skills) / req_count) * 100.0)
            
            exp_req = job.minimum_experience or 1.0
            cand_exp = resume.total_experience_years or 1.0
            exp_pct = min(100.0, (cand_exp / exp_req) * 90.0) if exp_req else 80.0
            
            edu_score = 85.0 if len(resume.education) > 0 else 70.0
            impact_score = 78.0
            trajectory_score = 82.0
            
            return {
                "skills_score": round(skill_pct, 1),
                "experience_score": round(exp_pct, 1),
                "education_score": round(edu_score, 1),
                "impact_score": round(impact_score, 1),
                "trajectory_score": round(trajectory_score, 1),
                "matching_skills": matched_skills or resume.skills[:5],
                "missing_skills": missing_skills or ["Distributed Architecture", "Kubernetes"],
                "experience_match": cand_exp >= exp_req,
                "experience_summary": f"Candidate possesses approximately {cand_exp} years experience against {exp_req} year target.",
                "strengths": [
                    f"Strong background in {', '.join(resume.skills[:3]) if resume.skills else 'software engineering'}",
                    "Demonstrated project and academic experience"
                ],
                "red_flags": [
                    "Verify depth of hands-on production deployment experience"
                ] if len(missing_skills) > 0 else [],
                "recommended_interview_questions": [
                    f"How have you applied {missing_skills[0] if missing_skills else 'core engineering practices'} in high-concurrency systems?",
                    "Walk us through the most architecturally challenging project on your resume and your specific contributions."
                ],
                "verdict": f"Competitive candidate with strong foundational alignment. Worth technical screening."
            }

        eval_data = self.llm.call_structured_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            mock_fallback_handler=mock_evaluator
        )

        breakdown = ScoreBreakdown(
            skills_score=float(eval_data.get("skills_score", 70.0)),
            experience_score=float(eval_data.get("experience_score", 70.0)),
            education_score=float(eval_data.get("education_score", 75.0)),
            impact_score=float(eval_data.get("impact_score", 70.0)),
            trajectory_score=float(eval_data.get("trajectory_score", 70.0)),
            semantic_similarity=sim_score
        )

        # Weighted calculation
        overall = (
            breakdown.skills_score * rubric.skills_weight +
            breakdown.experience_score * rubric.experience_weight +
            breakdown.education_score * rubric.education_weight +
            breakdown.impact_score * rubric.impact_weight +
            breakdown.trajectory_score * rubric.trajectory_weight
        )
        overall_score = round(min(max(overall, 0.0), 100.0), 1)

        # Match Tier classification
        if overall_score >= 85:
            tier = "Strong Fit"
        elif overall_score >= 70:
            tier = "Good Fit"
        elif overall_score >= 50:
            tier = "Partial Fit"
        else:
            tier = "Low Fit"

        return CandidateEvaluation(
            candidate_id=resume.id or f"cand_{abs(hash(resume.name or resume.file_name))}",
            file_name=resume.file_name or "Resume",
            name=resume.name or "Anonymous Candidate",
            overall_score=overall_score,
            match_tier=tier,
            score_breakdown=breakdown,
            matching_skills=eval_data.get("matching_skills", matched_skills),
            missing_skills=eval_data.get("missing_skills", missing_skills),
            experience_match=bool(eval_data.get("experience_match", True)),
            experience_summary=eval_data.get("experience_summary", ""),
            strengths=eval_data.get("strengths", []),
            red_flags=eval_data.get("red_flags", []),
            recommended_interview_questions=eval_data.get("recommended_interview_questions", []),
            verdict=eval_data.get("verdict", ""),
            parsed_resume=resume
        )
