import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    company = Column(String(255), default="Company")
    role = Column(String(255), nullable=True)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    minimum_experience = Column(Float, default=0.0)
    education_requirements = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    evaluations = relationship("EvaluationModel", back_populates="job", cascade="all, delete-orphan")

class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_name = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(64), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    github = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    total_experience_years = Column(Float, default=0.0)
    skills = Column(JSON, default=list)
    experiences = Column(JSON, default=list)
    education = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    evaluations = relationship("EvaluationModel", back_populates="candidate", cascade="all, delete-orphan")

class EvaluationModel(Base):
    __tablename__ = "evaluations"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(64), ForeignKey("jobs.id"), nullable=True)
    candidate_id = Column(String(64), ForeignKey("candidates.id"), nullable=False)
    candidate_name = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    overall_score = Column(Float, nullable=False)
    match_tier = Column(String(64), nullable=False)
    skills_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    impact_score = Column(Float, default=0.0)
    trajectory_score = Column(Float, default=0.0)
    semantic_similarity = Column(Float, default=0.0)
    matching_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    experience_match = Column(Boolean, default=True)
    experience_summary = Column(Text, nullable=True)
    strengths = Column(JSON, default=list)
    red_flags = Column(JSON, default=list)
    recommended_interview_questions = Column(JSON, default=list)
    verdict = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("JobModel", back_populates="evaluations")
    candidate = relationship("CandidateModel", back_populates="evaluations")
