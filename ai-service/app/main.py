from fastapi import FastAPI

from .pipeline import AIPipeline
from .schemas import (
    AtsScoreRequest,
    AtsScoreResponse,
    ChatRequest,
    ChatResponse,
    CoverLetterRequest,
    CoverLetterResponse,
    EmbeddingRequest,
    EmbeddingResponse,
    GenerateBulletRequest,
    GenerateBulletResponse,
    ResumeParseRequest,
    ResumeParseResponse,
    ResumeTailorRequest,
    ResumeTailorResponse,
)

app = FastAPI(title="TalentSync AI Service", version="0.1.0")
pipeline = AIPipeline()


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "ai-service"}


@app.post("/ai/resume/parse", response_model=ResumeParseResponse)
def parse_resume(payload: ResumeParseRequest) -> ResumeParseResponse:
    result = pipeline.parse_resume(payload.raw_text)
    return ResumeParseResponse(**result)


@app.post("/ai/resume/tailor", response_model=ResumeTailorResponse)
def tailor_resume(payload: ResumeTailorRequest) -> ResumeTailorResponse:
    result = pipeline.tailor_resume(payload.resume_json, payload.job_description)
    return ResumeTailorResponse(**result)


@app.post("/ai/resume/ats-score", response_model=AtsScoreResponse)
def ats_score(payload: AtsScoreRequest) -> AtsScoreResponse:
    result = pipeline.ats_score(payload.resume_json, payload.job_description)
    return AtsScoreResponse(**result)


@app.post("/ai/resume/bullet", response_model=GenerateBulletResponse)
def generate_bullet(payload: GenerateBulletRequest) -> GenerateBulletResponse:
    result = pipeline.generate_bullet(payload.action, payload.task, payload.tools, payload.impact)
    return GenerateBulletResponse(bullet=result)


@app.post("/ai/cover-letter", response_model=CoverLetterResponse)
def cover_letter(payload: CoverLetterRequest) -> CoverLetterResponse:
    result = pipeline.cover_letter(payload.resume_json, payload.job_description)
    return CoverLetterResponse(**result)


@app.post("/ai/embedding", response_model=EmbeddingResponse)
def embedding(payload: EmbeddingRequest) -> EmbeddingResponse:
    result = pipeline.embedding(payload.text)
    return EmbeddingResponse(vector=result)


@app.post("/ai/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    result = pipeline.chat(payload.message, payload.context)
    return ChatResponse(reply=result)
