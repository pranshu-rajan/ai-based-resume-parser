from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    skills_used: List[str] = Field(default_factory=list)
    is_internship: bool = False
    achievements: List[str] = Field(default_factory=list)

class EducationItem(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    gpa: Optional[str] = None

class ParsedResume(BaseModel):
    id: Optional[str] = None
    file_name: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    summary: Optional[str] = None
    total_experience_years: Optional[float] = 0.0
    skills: List[str] = Field(default_factory=list)
    experiences: List[ExperienceItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    raw_text: Optional[str] = None

class JobDescription(BaseModel):
    id: Optional[str] = "custom-jd"
    title: str = "Software Development Engineer"
    company: Optional[str] = "Tech Corp"
    role: Optional[str] = "Full Stack Engineer"
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    minimum_experience: Optional[float] = None
    education_requirements: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    raw_text: Optional[str] = None

class RubricWeights(BaseModel):
    skills_weight: float = 0.35
    experience_weight: float = 0.25
    education_weight: float = 0.10
    impact_weight: float = 0.20
    trajectory_weight: float = 0.10

class ScoreBreakdown(BaseModel):
    skills_score: float = Field(..., description="0-100 score for hard/soft skills match")
    experience_score: float = Field(..., description="0-100 score for tenure and relevance")
    education_score: float = Field(..., description="0-100 score for degree and academic fit")
    impact_score: float = Field(..., description="0-100 score for quantifiable impact / STAR evidence")
    trajectory_score: float = Field(..., description="0-100 score for career growth velocity")
    semantic_similarity: float = Field(default=0.0, description="0-100 vector cosine similarity")

class CandidateEvaluation(BaseModel):
    candidate_id: str
    file_name: str
    name: str
    overall_score: float
    match_tier: str  # Strong Fit (>=85), Good Fit (70-84), Partial Fit (50-69), Low Fit (<50)
    score_breakdown: ScoreBreakdown
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    experience_match: bool = True
    experience_summary: str = ""
    strengths: List[str] = Field(default_factory=list)
    red_flags: List[str] = Field(default_factory=list)
    recommended_interview_questions: List[str] = Field(default_factory=list)
    verdict: str = ""
    parsed_resume: Optional[ParsedResume] = None

class BatchEvaluationResponse(BaseModel):
    total_candidates: int
    job_title: str
    evaluations: List[CandidateEvaluation]
    summary_verdict: str

class STARImprovement(BaseModel):
    original_bullet: str
    improved_bullet: str
    metrics_added: str
    rationale: str

class ATSOptimizationReport(BaseModel):
    candidate_name: str
    ats_score: float
    formatting_score: float
    keyword_match_percentage: float
    critical_missing_keywords: List[str] = Field(default_factory=list)
    found_keywords: List[str] = Field(default_factory=list)
    actionable_fixes: List[str] = Field(default_factory=list)
    star_improvements: List[STARImprovement] = Field(default_factory=list)
    overall_feedback: str
