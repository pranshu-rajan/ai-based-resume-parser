from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models import JobModel, CandidateModel, EvaluationModel
from app.models.schemas import CandidateEvaluation, JobDescription, ParsedResume

class DataRepository:
    @staticmethod
    def save_job(db: Session, job: JobDescription) -> JobModel:
        """Persist or retrieve a JobDescription."""
        job_record = db.query(JobModel).filter(JobModel.title == job.title, JobModel.company == job.company).first()
        if not job_record:
            job_record = JobModel(
                title=job.title,
                company=job.company or "Company",
                role=job.role,
                required_skills=job.required_skills,
                preferred_skills=job.preferred_skills,
                minimum_experience=job.minimum_experience or 0.0,
                education_requirements=job.education_requirements,
                responsibilities=job.responsibilities,
                raw_text=job.raw_text
            )
            db.add(job_record)
            db.commit()
            db.refresh(job_record)
        return job_record

    @staticmethod
    def save_candidate_evaluation(
        db: Session,
        evaluation: CandidateEvaluation,
        job_id: Optional[str] = None
    ) -> EvaluationModel:
        """Persist a candidate and their evaluation outcome."""
        resume = evaluation.parsed_resume
        # Upsert candidate
        candidate_record = None
        if resume and resume.email:
            candidate_record = db.query(CandidateModel).filter(CandidateModel.email == resume.email).first()
        
        if not candidate_record:
            candidate_record = CandidateModel(
                file_name=evaluation.file_name,
                name=evaluation.name,
                email=resume.email if resume else None,
                phone=resume.phone if resume else None,
                location=resume.location if resume else None,
                linkedin=resume.linkedin if resume else None,
                github=resume.github if resume else None,
                summary=resume.summary if resume else None,
                total_experience_years=resume.total_experience_years if resume else 0.0,
                skills=resume.skills if resume else evaluation.matching_skills,
                experiences=[exp.model_dump() for exp in resume.experiences] if resume and resume.experiences else [],
                education=[edu.model_dump() for edu in resume.education] if resume and resume.education else [],
                projects=resume.projects if resume else [],
                certifications=resume.certifications if resume else [],
                raw_text=resume.raw_text if resume else None
            )
            db.add(candidate_record)
            db.commit()
            db.refresh(candidate_record)

        # Create evaluation record
        eval_record = EvaluationModel(
            job_id=job_id,
            candidate_id=candidate_record.id,
            candidate_name=evaluation.name,
            file_name=evaluation.file_name,
            overall_score=evaluation.overall_score,
            match_tier=evaluation.match_tier,
            skills_score=evaluation.score_breakdown.skills_score,
            experience_score=evaluation.score_breakdown.experience_score,
            education_score=evaluation.score_breakdown.education_score,
            impact_score=evaluation.score_breakdown.impact_score,
            trajectory_score=evaluation.score_breakdown.trajectory_score,
            semantic_similarity=evaluation.score_breakdown.semantic_similarity,
            matching_skills=evaluation.matching_skills,
            missing_skills=evaluation.missing_skills,
            experience_match=evaluation.experience_match,
            experience_summary=evaluation.experience_summary,
            strengths=evaluation.strengths,
            red_flags=evaluation.red_flags,
            recommended_interview_questions=evaluation.recommended_interview_questions,
            verdict=evaluation.verdict
        )
        db.add(eval_record)
        db.commit()
        db.refresh(eval_record)
        return eval_record

    @staticmethod
    def get_recent_evaluations(db: Session, limit: int = 50) -> List[EvaluationModel]:
        """Fetch historical evaluations from database."""
        return db.query(EvaluationModel).order_by(EvaluationModel.created_at.desc()).limit(limit).all()
