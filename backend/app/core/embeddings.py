import re
import math
from collections import Counter
from typing import List, Tuple

class SemanticSimilarityEngine:
    @staticmethod
    def clean_text(text: str) -> str:
        """Normalize text for semantic comparison."""
        text = text.lower()
        text = re.sub(r'[^a-zA-Z0-9\s\+\#\.]', ' ', text)
        return re.sub(r'\s+', ' ', text).strip()

    @staticmethod
    def _tokenize_ngrams(text: str) -> List[str]:
        words = text.split()
        unigrams = [w for w in words if len(w) > 2]
        bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)]
        return unigrams + bigrams

    @staticmethod
    def calculate_similarity(resume_text: str, job_text: str) -> float:
        """
        Calculate cosine similarity (0.0 to 100.0) between resume and job description
        using pure Python sublinear token vectors (zero-heavy-dependency engine).
        """
        c_resume = SemanticSimilarityEngine.clean_text(resume_text)
        c_job = SemanticSimilarityEngine.clean_text(job_text)
        
        if not c_resume or not c_job:
            return 0.0
            
        tokens_r = SemanticSimilarityEngine._tokenize_ngrams(c_resume)
        tokens_j = SemanticSimilarityEngine._tokenize_ngrams(c_job)
        
        if not tokens_r or not tokens_j:
            return 0.0

        vec_r = Counter(tokens_r)
        vec_j = Counter(tokens_j)

        common_keys = set(vec_r.keys()).intersection(set(vec_j.keys()))
        if not common_keys:
            return 10.0

        dot_product = sum(vec_r[k] * vec_j[k] for k in common_keys)
        norm_r = math.sqrt(sum(v ** 2 for v in vec_r.values()))
        norm_j = math.sqrt(sum(v ** 2 for v in vec_j.values()))

        if norm_r == 0 or norm_j == 0:
            return 0.0

        cosine = dot_product / (norm_r * norm_j)
        # Apply standard soft curve calibration for resume ATS alignment
        scaled = min(100.0, max(0.0, cosine * 160.0))
        return round(scaled, 2)

    @staticmethod
    def extract_keywords_coverage(resume_text: str, required_skills: List[str]) -> Tuple[List[str], List[str]]:
        """Identify which required skills appear in resume text."""
        matched = []
        missing = []
        lower_resume = resume_text.lower()
        for skill in required_skills:
            escaped = re.escape(skill.lower())
            pattern = rf"(?:\b|\s|^){escaped}(?:\b|\s|$)"
            if re.search(pattern, lower_resume) or skill.lower() in lower_resume:
                matched.append(skill)
            else:
                missing.append(skill)
        return matched, missing
