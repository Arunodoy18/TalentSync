from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="TalentSync Analytics Service", version="0.1.0")


class DashboardSnapshot(BaseModel):
    applications_sent: int
    interview_rate: float
    response_rate: float
    ats_score_improvement: float
    avg_match_score: float
    conversion_rate: float
    revenue: float


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "analytics"}


@app.get("/analytics/dashboard", response_model=DashboardSnapshot)
def dashboard() -> DashboardSnapshot:
    return DashboardSnapshot(
        applications_sent=0,
        interview_rate=0.0,
        response_rate=0.0,
        ats_score_improvement=0.0,
        avg_match_score=0.0,
        conversion_rate=0.0,
        revenue=0.0,
    )
