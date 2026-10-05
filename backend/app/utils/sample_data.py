from pathlib import Path
from typing import List, Dict, Any
from app.models.schemas import JobDescription

SAMPLE_JOBS: List[JobDescription] = [
    JobDescription(
        id="amazon-sde-1",
        title="Software Development Engineer I (SDE-I)",
        company="Amazon",
        role="Distributed Systems & Cloud Services",
        required_skills=[
            "Java", "Python", "Data Structures", "Algorithms",
            "Object-Oriented Design", "Distributed Systems", "Git"
        ],
        preferred_skills=[
            "AWS", "Microservices", "Docker", "CI/CD", "GenAI Tools",
            "SQL", "NoSQL", "REST APIs"
        ],
        minimum_experience=0.0,
        education_requirements=[
            "Bachelor's degree in Computer Science, Computer Engineering, or related STEM field"
        ],
        responsibilities=[
            "Design and develop scalable microservices in a large distributed computing environment.",
            "Write clean, maintainable code following best practices and design patterns.",
            "Work in an agile environment practicing CI/CD principles and operational excellence.",
            "Participate in code reviews and operational on-call responsibilities."
        ],
        raw_text="""Amazon Software Development Engineer I (SDE-I)
Basic Qualifications:
- Experience with at least one general-purpose programming language such as Java, Python, C++, C#, Go, Rust, or TypeScript
- Experience with data structure implementation, basic algorithm development, and object-oriented design principles
- Bachelor's degree in Computer Science, Computer Engineering, or STEM fields
Preferred:
- AWS, GenAI tools, Microservices, CI/CD, SQL/NoSQL databases"""
    ),
    JobDescription(
        id="fullstack-ai-engineer",
        title="Full Stack AI Engineer",
        company="NextGen Tech Solutions",
        role="Frontend & Generative AI Integration",
        required_skills=[
            "React", "TypeScript", "FastAPI", "Python",
            "Tailwind CSS", "REST APIs", "LLM APIs", "Prompt Engineering"
        ],
        preferred_skills=[
            "LangChain", "Vector DBs", "Docker", "PostgreSQL",
            "Next.js", "Redis", "Cloud Deployment"
        ],
        minimum_experience=1.0,
        education_requirements=[
            "Bachelor's in Computer Science or equivalent practical portfolio experience"
        ],
        responsibilities=[
            "Build responsive, modern UI applications with React and state-of-the-art styling.",
            "Integrate generative AI APIs and vector embeddings into production user experiences.",
            "Develop high-performance asynchronous REST backend microservices with FastAPI.",
            "Optimize latency and token throughput for LLM interactions."
        ],
        raw_text="""Full Stack AI Engineer
Requires React, TypeScript, Python, FastAPI, and direct experience integrating LLMs and vector search. Strong focus on clean UI/UX and asynchronous systems."""
    ),
    JobDescription(
        id="data-ml-engineer",
        title="Machine Learning & Data Engineer",
        company="Apex Data Labs",
        role="ML Pipelines & Predictive Analytics",
        required_skills=[
            "Python", "PyTorch", "scikit-learn", "Pandas",
            "SQL", "Data Pipelines", "Model Evaluation"
        ],
        preferred_skills=[
            "MLOps", "FastAPI", "GCP / AWS", "Docker",
            "Apache Spark", "Vector Search"
        ],
        minimum_experience=2.0,
        education_requirements=[
            "Degree in Data Science, Computer Science, Statistics or related quantitative domain"
        ],
        responsibilities=[
            "Train, evaluate and deploy machine learning models in production.",
            "Build robust data ingestion and validation pipelines.",
            "Monitor drift and optimize model throughput and memory footprint."
        ],
        raw_text="""Machine Learning & Data Engineer
Focus on Python, PyTorch, Scikit-Learn, data modeling, feature engineering, and deploying inference microservices."""
    )
]

def get_sample_resumes_info() -> List[Dict[str, Any]]:
    """Scan the resumes directory for pre-bundled sample resumes."""
    resumes_dir = Path("resumes")
    if not resumes_dir.exists():
        resumes_dir = Path("../resumes")
    
    samples = []
    if resumes_dir.exists():
        for file_path in resumes_dir.iterdir():
            if file_path.suffix.lower() in [".pdf", ".docx"]:
                samples.append({
                    "name": file_path.stem,
                    "filename": file_path.name,
                    "extension": file_path.suffix.lower(),
                    "size_kb": round(file_path.stat().st_size / 1024, 1),
                    "path": str(file_path)
                })
    return samples
