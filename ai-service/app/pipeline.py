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
        self.chat_system_prompt = (
            "You are Zap, a human-like career assistant. Sound natural, warm, and practical, "
            "like a trusted mentor in a real conversation. Use plain language and avoid robotic "
            "phrasing. Start with a direct answer, then provide concrete next steps when useful. "
            "Be honest, helpful, and specific for resumes, ATS, job search, interviews, projects, "
            "and career planning."
        )

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
        if not self.client:
            return {
                "score": 75,
                "breakdown": {
                    "keyword_match": 80,
                    "skills_match": 70,
                    "experience_match": 85,
                    "education_match": 100,
                    "formatting_score": 100,
                },
                "recommendations": ["OpenAI key missing. Please configure for accurate scoring."],
                "missing_skills": ["Python", "AWS"]
            }
        
        prompt = (
            "You are an ATS Scoring Engine. Analyze the given resume JSON against the Job Description. "
            "Calculate pure numbers to support this strict formula:\n"
            "ATS_SCORE = (keyword_match*0.40 + skills_match*0.20 + experience_match*0.20 + education_match*0.10 + formatting_score*0.10)\n"
            "Calculate values (0-100) for each. Then find bonus points: 10 for projects, 10 for metrics, 5 for github, 10 for internship, 5 for leadership, 5 open_source, 5 certs.\n"
            "List 3-4 specific recommendations and missing skills comparing them directly to the JD. "
            "Output MUST be strict JSON with keys: keyword_match (int), skills_match (int), experience_match (int), education_match (int), formatting_score (int), bonus_score (int), recommendations (list of str), missing_skills (list of str)."
        )
        payload = {"resume": resume_json, "job_description": job_description}
        
        try:
            response = self.client.responses.create(
                model=self.model_parse,
                input=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": json.dumps(payload)},
                ],
            )
            data = json.loads(response.output_text)
            
            k = data.get("keyword_match", 70)
            s = data.get("skills_match", 70)
            exp = data.get("experience_match", 70)
            edu = data.get("education_match", 100)
            form = data.get("formatting_score", 100)
            bonus = data.get("bonus_score", 0)
            
            raw_score = (k*0.40) + (s*0.20) + (exp*0.20) + (edu*0.10) + (form*0.10)
            final_score = int(min(raw_score + bonus, 100))
            
            return {
                "score": final_score,
                "breakdown": {
                    "keyword_match": k,
                    "skills_match": s,
                    "experience_match": exp,
                    "education_match": edu,
                    "formatting_score": form,
                },
                "recommendations": data.get("recommendations", []),
                "missing_skills": data.get("missing_skills", [])
            }
        except Exception as e:
            # Fallback algorithm
            return {
                "score": 60,
                "breakdown": {
                    "keyword_match": 50,
                    "skills_match": 50,
                    "experience_match": 50,
                    "education_match": 50,
                    "formatting_score": 100,
                },
                "recommendations": [f"Error calculating score: {str(e)}"],
                "missing_skills": []
            }

    def generate_bullet(self, action: str, task: str, tools: str, impact: str) -> str:
        if not self.client:
            return f"{action} {task} using {tools}, resulting in {impact}"
            
        prompt = (
            "You are a FAANG-level resume writer. Create exactly ONE bullet point "
            "following this strict formula: Action Verb + What You Built + Tools Used + Measurable Impact. "
            "Make it sound highly impressive and professional."
        )
        payload = f"Action: {action}\nTask: {task}\nTools: {tools}\nImpact: {impact}"
        
        response = self.client.responses.create(
            model=self.model_parse,
            input=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": payload},
            ],
        )
        return response.output_text.strip("- ")
        
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
            return (
                "I can still help, but my advanced response engine is offline right now. "
                "Share your goal and I will give you a practical step-by-step plan."
            )

        response = self.client.responses.create(
            model=self.model_chat,
            input=[
                {
                    "role": "system",
                    "content": self.chat_system_prompt,
                },
                {"role": "user", "content": json.dumps({"message": message, "context": context or {}})},
            ],
        )
        return response.output_text
