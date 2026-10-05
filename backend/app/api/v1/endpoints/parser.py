import uuid
import re
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header
from app.models.schemas import ParsedResume, ExperienceItem, EducationItem
from app.core.extractor import DocumentExtractor
from app.core.llm import LLMOrchestrator
from app.utils.sample_data import get_sample_resumes_info

router = APIRouter(prefix="/parser", tags=["Resume Parser"])

def extract_resume_with_llm(
    text: str,
    filename: str,
    orchestrator: LLMOrchestrator
) -> ParsedResume:
    """Extract structured data from resume text using LLM with heuristic fallback."""
    system_prompt = """
    You are an expert ATS and HR intelligence parser.
    Extract candidate profile details from the resume into valid JSON matching this schema:
    {
      "name": "Candidate Full Name",
      "email": "candidate@example.com",
      "phone": "+1 234 567 8900",
      "location": "City, Country",
      "linkedin": "url or profile handle",
      "github": "url or username",
      "portfolio": "url",
      "summary": "2-3 sentence professional summary",
      "total_experience_years": 1.5,
      "skills": ["Python", "FastAPI", "React", "Docker", "SQL"],
      "experiences": [
        {
          "company": "Company Name",
          "role": "Title",
          "duration": "Dates (e.g. June 2023 - Present)",
          "description": "Key responsibilities and accomplishments",
          "skills_used": ["Skills applied"],
          "is_internship": false
        }
      ],
      "education": [
        {
          "institution": "University / College",
          "degree": "B.Tech / B.S. / M.S.",
          "field_of_study": "Computer Science",
          "graduation_year": "2024",
          "gpa": "3.8/4.0 or percentage"
        }
      ],
      "projects": ["Project 1 title with brief summary", "Project 2"],
      "certifications": ["AWS Certified", "TensorFlow"]
    }

    Rules:
    - Never invent contact info. If not found, set null.
    - Calculate total_experience_years accurately from tenure dates (use 0.0 or 0.5 for freshers/interns).
    - Extract hard technical tools and soft skills across the entire document.
    """

    def mock_parser(raw_text: str) -> dict:
        # Heuristic fallback for offline/demo
        # Extract email via regex
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', raw_text)
        
        # Candidate name guess from first lines
        lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
        guess_name = Path(filename).stem.split("-")[-1].strip() if "-" in filename else Path(filename).stem
        if lines and len(lines[0].split()) <= 4:
            guess_name = lines[0]
            
        # Common skill keywords
        common_skills = [
            "Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Node.js",
            "FastAPI", "Django", "SQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes",
            "AWS", "Git", "Machine Learning", "Deep Learning", "Data Structures", "Algorithms",
            "REST APIs", "HTML", "CSS", "Tailwind", "Linux", "PyTorch", "Pandas"
        ]
        found_skills = [s for s in common_skills if re.search(rf"\b{re.escape(s)}\b", raw_text, re.IGNORECASE)]

        return {
            "name": guess_name,
            "email": email_match.group(0) if email_match else "candidate@example.com",
            "phone": phone_match.group(0) if phone_match else "+91 98765 43210",
            "location": "India",
            "linkedin": "linkedin.com/in/candidate",
            "github": "github.com/candidate",
            "portfolio": None,
            "summary": lines[1] if len(lines) > 1 else "Motivated software engineer with experience in modern full-stack development.",
            "total_experience_years": 1.0,
            "skills": found_skills or ["Python", "Git", "Data Structures", "REST APIs"],
            "experiences": [
                {
                    "company": "Tech Solutions",
                    "role": "Software Engineering Intern",
                    "duration": "6 Months",
                    "description": "Contributed to building backend endpoints and integrating database queries.",
                    "skills_used": found_skills[:3] if found_skills else ["Python"],
                    "is_internship": True
                }
            ],
            "education": [
                {
                    "institution": "Institute of Engineering & Technology",
                    "degree": "Bachelor of Technology",
                    "field_of_study": "Computer Science & Engineering",
                    "graduation_year": "2025",
                    "gpa": "8.5 CGPA"
                }
            ],
            "projects": ["AI Resume Intelligence Engine", "Cloud File Storage Service"],
            "certifications": ["Python Programming Specialist"]
        }

    data = orchestrator.call_structured_json(
        system_prompt=system_prompt,
        user_prompt=f"Resume File: {filename}\nContent:\n{text[:6000]}",
        mock_fallback_handler=mock_parser
    )

    return ParsedResume(
        id=str(uuid.uuid4())[:8],
        file_name=filename,
        name=data.get("name") or Path(filename).stem,
        email=data.get("email"),
        phone=data.get("phone"),
        location=data.get("location"),
        linkedin=data.get("linkedin"),
        github=data.get("github"),
        portfolio=data.get("portfolio"),
        summary=data.get("summary"),
        total_experience_years=float(data.get("total_experience_years", 0.0) or 0.0),
        skills=data.get("skills", []),
        experiences=[ExperienceItem(**e) for e in data.get("experiences", [])],
        education=[EducationItem(**ed) for ed in data.get("education", [])],
        projects=data.get("projects", []),
        certifications=data.get("certifications", []),
        raw_text=text
    )

@router.get("/samples")
def list_sample_resumes():
    """List bundled sample resumes from the resumes directory."""
    return get_sample_resumes_info()

@router.post("/parse-file", response_model=ParsedResume)
async def parse_uploaded_file(
    file: UploadFile = File(...),
    x_api_key: Optional[str] = Header(None, alias="X-Groq-API-Key")
):
    """Upload and parse any PDF, DOCX, or TXT resume."""
    try:
        content_bytes = await file.read()
        text = DocumentExtractor.extract_text_from_bytes(content_bytes, file.filename)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document. Ensure file is not scanned/empty.")
        
        orchestrator = LLMOrchestrator(api_key=x_api_key)
        parsed = extract_resume_with_llm(text, file.filename, orchestrator)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")

@router.post("/parse-sample/{filename}", response_model=ParsedResume)
def parse_sample_by_name(
    filename: str,
    x_api_key: Optional[str] = Header(None, alias="X-Groq-API-Key")
):
    """Load and parse one of the pre-bundled sample resumes on disk."""
    resumes_dir = Path("resumes")
    if not resumes_dir.exists():
        resumes_dir = Path("../resumes")
        
    target_path = resumes_dir / filename
    if not target_path.exists():
        raise HTTPException(status_code=404, detail=f"Sample resume '{filename}' not found.")
        
    try:
        text = DocumentExtractor.extract_text_from_path(target_path)
        orchestrator = LLMOrchestrator(api_key=x_api_key)
        parsed = extract_resume_with_llm(text, filename, orchestrator)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading sample resume: {str(e)}")
