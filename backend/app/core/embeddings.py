import re
import math
from collections import Counter
from typing import List, Tuple

class SemanticSimilarityEngine:
    # Key technical terms that contain punctuation characters
    PRESERVED_TERMS = {
        "c++", "c#", ".net", "node.js", "react.js", "vue.js", "next.js",
        "ci/cd", "restful", "scikit-learn", "tcp/ip"
    }

    @staticmethod
    def clean_text(text: str) -> str:
        """Normalize text while preserving programming languages and technical tokens."""
        if not text:
            return ""
        text = text.lower()
        # Protect specific symbols before punctuation stripping
        text = text.replace("c++", "cpp_lang").replace("c#", "csharp_lang").replace(".net", "dotnet_lang")
        text = text.replace("ci/cd", "cicd_pipe").replace("node.js", "nodejs_env")
        # Replace non-alphanumeric except underscore
        text = re.sub(r'[^a-zA-Z0-9_\s]', ' ', text)
        return re.sub(r'\s+', ' ', text).strip()

    @staticmethod
    def _tokenize_ngrams(text: str) -> List[str]:
        words = text.split()
        unigrams = [w for w in words if len(w) > 1]
        bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)]
        return unigrams + bigrams

    @staticmethod
    def calculate_similarity(resume_text: str, job_text: str) -> float:
        """
        Calculate cosine similarity (0.0 to 100.0) between resume and job description.
        Guards against zero-division and empty texts.
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
            return 5.0  # Baseline token floor

        dot_product = sum(vec_r[k] * vec_j[k] for k in common_keys)
        norm_r = math.sqrt(sum(v ** 2 for v in vec_r.values()))
        norm_j = math.sqrt(sum(v ** 2 for v in vec_j.values()))

        if norm_r == 0 or norm_j == 0:
            return 0.0

        cosine = dot_product / (norm_r * norm_j)
        scaled = min(100.0, max(0.0, cosine * 160.0))
        return round(scaled, 2)

    @staticmethod
    def extract_keywords_coverage(resume_text: str, required_skills: List[str]) -> Tuple[List[str], List[str]]:
        """
        Extract matched and missing keywords with proper support for C++, C#, .NET, CI/CD.
        Guards against empty skill lists.
        """
        if not required_skills:
            return [], []

        matched = []
        missing = []
        lower_resume = resume_text.lower() if resume_text else ""

        for raw_skill in required_skills:
            skill = raw_skill.strip()
            if not skill:
                continue

            low_skill = skill.lower()
            
            # Special symbol handling
            if low_skill in ["c++", "c#", ".net", "ci/cd"]:
                if low_skill in lower_resume:
                    matched.append(skill)
                else:
                    missing.append(skill)
            else:
                escaped = re.escape(low_skill)
                # Word boundary match where applicable
                pattern = rf"(?:\b|\s|^){escaped}(?:\b|\s|$)"
                if re.search(pattern, lower_resume) or low_skill in lower_resume:
                    matched.append(skill)
                else:
                    missing.append(skill)

        return matched, missing
