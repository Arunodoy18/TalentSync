from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class ResumeParseRequest(BaseModel):
    raw_text: str = Field(min_length=40)


class ResumeParseResponse(BaseModel):
    entities: Dict[str, Any]
    skills: List[str]


class ResumeTailorRequest(BaseModel):
    resume_json: Dict[str, Any]
    job_description: str = Field(min_length=40)


class ResumeTailorResponse(BaseModel):
    tailored_resume: Dict[str, Any]
    notes: List[str]


class AtsScoreRequest(BaseModel):
    resume_json: Dict[str, Any]
    job_description: str = Field(min_length=40)


class AtsScoreResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    breakdown: Dict[str, int]
    recommendations: List[str]
    missing_skills: List[str]


class GenerateBulletRequest(BaseModel):
    action: str
    task: str
    tools: str
    impact: str


class GenerateBulletResponse(BaseModel):
    bullet: str


class CoverLetterRequest(BaseModel):
    resume_json: Dict[str, Any]
    job_description: str = Field(min_length=40)


class CoverLetterResponse(BaseModel):
    cover_letter: str


class EmbeddingRequest(BaseModel):
    text: str = Field(min_length=5)


class EmbeddingResponse(BaseModel):
    vector: List[float]


class ChatRequest(BaseModel):
    message: str = Field(min_length=2)
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    reply: str
