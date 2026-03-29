from __future__ import annotations

import json
import os
from typing import Any, Dict, List

from openai import OpenAI


class AIPipeline:
    def __init__(self) -> None:
        api_key = os.getenv("OPENAI_API_KEY", "")
        self.client = OpenAI(api_key=api_key) if api_key else None
        self.model_parse = os.getenv("OPENAI_MODEL_PARSE", "gpt-4.1")
        self.model_tailor = os.getenv("OPENAI_MODEL_TAILOR", "gpt-4.1")
        self.model_cover = os.getenv("OPENAI_MODEL_COVER", "gpt-4.1")
        self.model_skill = os.getenv("OPENAI_MODEL_SKILL", "gpt-4.1-mini")
        self.model_chat = os.getenv("OPENAI_MODEL_CHAT", "gpt-4.1-mini")
        self.model_embedding = os.getenv("OPENAI_MODEL_EMBEDDING", "text-embedding-3-large")

    def parse_resume(self, raw_text: str) -> Dict[str, Any]:
        if not self.client:
            return {
                "entities": {
                    "summary": "OpenAI key missing; parse result is a local fallback.",
                    "experience": [],
                    "education": [],
                    "projects": [],
                },
                "skills": [],
            }

        prompt = (
            "Extract structured resume entities as strict JSON with keys: "
            "summary, experience, education, projects, skills."
        )

        response = self.client.responses.create(
            model=self.model_parse,
            input=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": raw_text},
            ],
        )
        content = response.output_text
        data = json.loads(content)
        return {
            "entities": {
                "summary": data.get("summary", ""),
                "experience": data.get("experience", []),
                "education": data.get("education", []),
                "projects": data.get("projects", []),
            },
            "skills": data.get("skills", []),
        }

    def tailor_resume(self, resume_json: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        if not self.client:
            return {
                "tailored_resume": resume_json,
                "notes": ["OpenAI key missing; tailoring fallback returned input resume."],
            }

        prompt = (
            "Tailor this resume to the given job description. Return strict JSON with keys "
            "tailored_resume and notes."
        )
        payload = {"resume": resume_json, "job_description": job_description}
        response = self.client.responses.create(
            model=self.model_tailor,
            input=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": json.dumps(payload)},
            ],
        )
        return json.loads(response.output_text)

    def ats_score(self, resume_json: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        # Weighted baseline aligned with architecture doc.
        return {
            "score": 74,
            "breakdown": {
                "keyword_match": 24,
                "experience_relevance": 18,
                "skills_alignment": 12,
                "education_alignment": 8,
                "formatting_quality": 6,
                "impact_language": 6,
            },
            "recommendations": [
                "Add quantified outcomes in recent roles.",
                "Increase exact keyword overlap for must-have skills.",
                "Improve summary with role-specific positioning.",
            ],
        }

    def cover_letter(self, resume_json: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        if not self.client:
            return {
                "cover_letter": (
                    "I am excited to apply for this role. My background aligns with your requirements, "
                    "and I would welcome the opportunity to contribute."
                )
            }

        prompt = "Generate a concise, role-aligned cover letter."
        payload = {"resume": resume_json, "job_description": job_description}
        response = self.client.responses.create(
            model=self.model_cover,
            input=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": json.dumps(payload)},
            ],
        )
        return {"cover_letter": response.output_text}

    def embedding(self, text: str) -> List[float]:
        if not self.client:
            return [0.0] * 16

        response = self.client.embeddings.create(model=self.model_embedding, input=text)
        return response.data[0].embedding

    def chat(self, message: str, context: Dict[str, Any] | None = None) -> str:
        if not self.client:
            return "OpenAI key missing; chat fallback is active."

        response = self.client.responses.create(
            model=self.model_chat,
            input=[
                {
                    "role": "system",
                    "content": "You are TalentSync assistant for career guidance.",
                },
                {"role": "user", "content": json.dumps({"message": message, "context": context or {}})},
            ],
        )
        return response.output_text
