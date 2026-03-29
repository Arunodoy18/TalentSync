from __future__ import annotations

from typing import List

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="TalentSync Matching Engine", version="0.1.0")


class MatchCandidate(BaseModel):
    job_id: str
    embedding: List[float]


class MatchRequest(BaseModel):
    user_id: str
    resume_embedding: List[float] = Field(min_length=1)
    candidates: List[MatchCandidate]


class MatchResult(BaseModel):
    job_id: str
    match_score: float


class MatchResponse(BaseModel):
    user_id: str
    results: List[MatchResult]


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    numerator = float(np.dot(a, b))
    denominator = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denominator == 0:
        return 0.0
    return numerator / denominator


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "matching-engine"}


@app.post("/match/run", response_model=MatchResponse)
def run_match(payload: MatchRequest) -> MatchResponse:
    resume_vec = np.array(payload.resume_embedding, dtype=np.float32)
    results: List[MatchResult] = []

    for candidate in payload.candidates:
        job_vec = np.array(candidate.embedding, dtype=np.float32)
        score = cosine_similarity(resume_vec, job_vec)
        results.append(MatchResult(job_id=candidate.job_id, match_score=round(score, 4)))

    results.sort(key=lambda x: x.match_score, reverse=True)
    return MatchResponse(user_id=payload.user_id, results=results)
