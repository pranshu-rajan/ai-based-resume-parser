from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from pydantic import BaseModel
from app.models.schemas import JobDescription
from app.core.llm import LLMOrchestrator
from app.utils.sample_data import SAMPLE_JOBS

router = APIRouter(prefix="/jobs", tags=["Jobs"])

class ParseJDRequest(BaseModel):
    raw_text: str
    title: Optional[str] = None

@router.get("/templates", response_model=List[JobDescription])
def get_job_templates():
    """Retrieve pre-configured industry standard job templates."""
    return SAMPLE_JOBS

@router.post("/parse", response_model=JobDescription)
def parse_job_description(
    request: ParseJDRequest,
    x_api_key: Optional[str] = Header(None, alias="X-Groq-API-Key")
):
    """
    Extract structured criteria from any pasted job description using LLM.
    """
    if not request.raw_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    orchestrator = LLMOrchestrator(api_key=x_api_key)
    
    system_prompt = """
    You are an expert technical HR architect.
    Extract structured criteria from this job description into valid JSON:
    {
      "title": "Role Title",
      "company": "Company Name (or Tech Company if not specified)",
      "role": "Brief specialization summary",
      "required_skills": ["essential hard technical skills and tools"],
      "preferred_skills": ["nice to have skills"],
      "minimum_experience": 0.0,
      "education_requirements": ["degrees or certifications"],
      "responsibilities": ["3-5 core duties"]
    }
    If minimum experience is not explicitly stated, estimate or return 0.0.
    """
    
    def fallback_extractor(text: str):
        # Heuristic fallback
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        title = request.title or (lines[0] if lines else "Software Engineer")
        return {
            "title": title[:60],
            "company": "Hiring Organization",
            "role": "Software Engineering",
            "required_skills": ["Python", "JavaScript", "SQL", "Git", "Problem Solving"],
            "preferred_skills": ["Cloud (AWS/GCP)", "Docker", "REST APIs"],
            "minimum_experience": 1.0,
            "education_requirements": ["Bachelor's degree in STEM or equivalent"],
            "responsibilities": [
                "Collaborate on scalable software solutions",
                "Write clean, maintainable, tested code",
                "Participate in agile sprints and code reviews"
            ]
        }

    try:
        data = orchestrator.call_structured_json(
            system_prompt=system_prompt,
            user_prompt=request.raw_text,
            mock_fallback_handler=fallback_extractor
        )
        return JobDescription(
            title=data.get("title", request.title or "Software Engineer"),
            company=data.get("company", "Company"),
            role=data.get("role", "Engineering"),
            required_skills=data.get("required_skills", []),
            preferred_skills=data.get("preferred_skills", []),
            minimum_experience=data.get("minimum_experience", 0.0),
            education_requirements=data.get("education_requirements", []),
            responsibilities=data.get("responsibilities", []),
            raw_text=request.raw_text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse job description: {str(e)}")
