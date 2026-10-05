from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header, Body
from pydantic import BaseModel
import json

from app.models.schemas import (
    ParsedResume, JobDescription, CandidateEvaluation, BatchEvaluationResponse, RubricWeights
)
from app.core.extractor import DocumentExtractor
from app.core.llm import LLMOrchestrator
from app.core.scorer import EvaluationEngine
from app.api.v1.endpoints.parser import extract_resume_with_llm

router = APIRouter(prefix="/match", tags=["Matching & Evaluation"])

class SingleEvaluationRequest(BaseModel):
    resume: ParsedResume
    job: JobDescription
    rubric: Optional[RubricWeights] = RubricWeights()

class BatchSampleEvaluationRequest(BaseModel):
    job: JobDescription
    sample_filenames: Optional[List[str]] = None
    rubric: Optional[RubricWeights] = RubricWeights()

@router.post("/evaluate", response_model=CandidateEvaluation)
def evaluate_single_candidate(
    request: SingleEvaluationRequest,
    x_api_key: Optional[str] = Header(None, alias="X-Groq-API-Key")
):
    """Evaluate a single parsed resume against the provided Job Description."""
    orchestrator = LLMOrchestrator(api_key=x_api_key)
    engine = EvaluationEngine(orchestrator)
    return engine.evaluate_candidate(request.resume, request.job, request.rubric or RubricWeights())

@router.post("/batch-evaluate-samples", response_model=BatchEvaluationResponse)
def evaluate_samples_batch(
    request: BatchSampleEvaluationRequest,
    x_api_key: Optional[str] = Header(None, alias="X-Groq-API-Key")
):
    """
    Evaluate multiple bundled sample resumes in batch against a Job Description.
    """
    resumes_dir = Path("resumes")
    if not resumes_dir.exists():
        resumes_dir = Path("../resumes")
        
    orchestrator = LLMOrchestrator(api_key=x_api_key)
    engine = EvaluationEngine(orchestrator)
    
    # Determine target files
    if request.sample_filenames:
        target_files = [resumes_dir / fn for fn in request.sample_filenames if (resumes_dir / fn).exists()]
    else:
        target_files = [f for f in resumes_dir.iterdir() if f.suffix.lower() in [".pdf", ".docx"]]

    evaluations: List[CandidateEvaluation] = []
    
    for f in target_files:
        try:
            text = DocumentExtractor.extract_text_from_path(f)
            parsed = extract_resume_with_llm(text, f.name, orchestrator)
            evaluation = engine.evaluate_candidate(parsed, request.job, request.rubric or RubricWeights())
            evaluations.append(evaluation)
        except Exception as e:
            print(f"[BatchEvaluate] Error evaluating {f.name}: {e}")
            continue

    # Sort descending by overall score
    evaluations.sort(key=lambda x: x.overall_score, reverse=True)
    
    top_cand = evaluations[0].name if evaluations else "None"
    summary = f"Evaluated {len(evaluations)} candidates. Top candidate: {top_cand} with score {evaluations[0].overall_score if evaluations else 0}%."
    
    return BatchEvaluationResponse(
        total_candidates=len(evaluations),
        job_title=request.job.title,
        evaluations=evaluations,
        summary_verdict=summary
    )

@router.post("/batch-evaluate-files", response_model=BatchEvaluationResponse)
async def evaluate_uploaded_files_batch(
    files: List[UploadFile] = File(...),
    job_json: str = Form(...),
    rubric_json: Optional[str] = Form(None),
    x_api_key: Optional[str] = Header(None, alias="X-Groq-API-Key")
):
    """
    Evaluate a batch of user-uploaded files against the specified Job Description.
    """
    try:
        job_dict = json.loads(job_json)
        job = JobDescription(**job_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid job_json: {str(e)}")

    rubric = RubricWeights()
    if rubric_json:
        try:
            rubric = RubricWeights(**json.loads(rubric_json))
        except Exception:
            pass

    orchestrator = LLMOrchestrator(api_key=x_api_key)
    engine = EvaluationEngine(orchestrator)
    evaluations: List[CandidateEvaluation] = []

    for file in files:
        try:
            content_bytes = await file.read()
            text = DocumentExtractor.extract_text_from_bytes(content_bytes, file.filename)
            parsed = extract_resume_with_llm(text, file.filename, orchestrator)
            evaluation = engine.evaluate_candidate(parsed, job, rubric)
            evaluations.append(evaluation)
        except Exception as e:
            print(f"[BatchUpload] Error processing {file.filename}: {e}")
            continue

    evaluations.sort(key=lambda x: x.overall_score, reverse=True)
    top_cand = evaluations[0].name if evaluations else "None"
    summary = f"Batch completed. Ranked {len(evaluations)} resumes. Leader: {top_cand}."

    return BatchEvaluationResponse(
        total_candidates=len(evaluations),
        job_title=job.title,
        evaluations=evaluations,
        summary_verdict=summary
    )
