import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.extractor import DocumentExtractor
from app.core.embeddings import SemanticSimilarityEngine
from app.core.llm import LLMOrchestrator
from app.core.scorer import EvaluationEngine
from app.models.schemas import JobDescription, ParsedResume, ExperienceItem
from app.utils.sample_data import SAMPLE_JOBS

def test_extraction_and_scoring():
    resumes_dir = Path("resumes")
    if not resumes_dir.exists():
        resumes_dir = Path("../resumes")
        
    pdf_files = list(resumes_dir.glob("*.pdf"))
    docx_files = list(resumes_dir.glob("*.docx"))
    
    assert len(pdf_files) > 0, "PDF resumes should exist in resumes/"
    assert len(docx_files) > 0, "DOCX resumes should exist in resumes/"
    
    # Test PDF extraction
    sample_pdf = pdf_files[0]
    pdf_text = DocumentExtractor.extract_text_from_path(sample_pdf)
    assert len(pdf_text) > 100, f"Failed to extract text from {sample_pdf.name}"
    print(f"[PASS] Successfully extracted {len(pdf_text)} chars from PDF: {sample_pdf.name}")
    
    # Test DOCX extraction
    sample_docx = docx_files[0]
    docx_text = DocumentExtractor.extract_text_from_path(sample_docx)
    assert len(docx_text) > 50, f"Failed to extract text from {sample_docx.name}"
    print(f"[PASS] Successfully extracted {len(docx_text)} chars from DOCX: {sample_docx.name}")
    
    # Test TF-IDF Semantic similarity
    job = SAMPLE_JOBS[0] # Amazon SDE-1
    sim_score = SemanticSimilarityEngine.calculate_similarity(pdf_text, job.raw_text or "")
    print(f"[PASS] Semantic similarity calculated: {sim_score}%")
    assert 0 <= sim_score <= 100
    
    # Test Evaluation Engine with mock/offline fallback
    orchestrator = LLMOrchestrator()
    eval_engine = EvaluationEngine(orchestrator)
    
    dummy_resume = ParsedResume(
        name="Ashish Raj",
        file_name=sample_pdf.name,
        skills=["Python", "Java", "Data Structures", "SQL"],
        total_experience_years=0.5,
        raw_text=pdf_text
    )
    evaluation = eval_engine.evaluate_candidate(dummy_resume, job)
    print(f"[PASS] Candidate Evaluated: {evaluation.name}, Score: {evaluation.overall_score}%, Tier: {evaluation.match_tier}")
    assert evaluation.overall_score > 0
    assert len(evaluation.recommended_interview_questions) > 0
    print("[ALL CORE TESTS PASSED]")

if __name__ == "__main__":
    test_extraction_and_scoring()
