import json
import re
import os
from typing import Optional, Dict, Any
from groq import Groq
from app.config import settings

class LLMOrchestrator:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.client = None
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                print(f"[LLMOrchestrator] Warning: Groq init failed: {e}")

    def call_structured_json(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        mock_fallback_handler = None
    ) -> Dict[str, Any]:
        """
        Call LLM expecting a strict JSON response.
        If no API key is configured or Groq is unreachable, gracefully fallback.
        """
        if not self.client:
            if mock_fallback_handler:
                return mock_fallback_handler(user_prompt)
            raise ValueError("No Groq API key configured. Provide an API key in settings or UI.")

        target_model = model or settings.DEFAULT_GROQ_MODEL
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = self.client.chat.completions.create(
                model=target_model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=4096
            )
            raw_content = response.choices[0].message.content
            return self._parse_json_safely(raw_content)
        except Exception as e:
            # Try fallback model if rate limit or model decommissioned
            print(f"[LLMOrchestrator] Primary model {target_model} error: {e}. Trying fallback...")
            try:
                fallback_model = settings.FALLBACK_GROQ_MODEL
                response = self.client.chat.completions.create(
                    model=fallback_model,
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    max_tokens=4096
                )
                raw_content = response.choices[0].message.content
                return self._parse_json_safely(raw_content)
            except Exception as e2:
                print(f"[LLMOrchestrator] Fallback model failed: {e2}")
                if mock_fallback_handler:
                    return mock_fallback_handler(user_prompt)
                raise e2

    def _parse_json_safely(self, text: str) -> Dict[str, Any]:
        """Strip markdown fences and parse json."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        return json.loads(text)
