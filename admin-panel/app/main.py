from fastapi import FastAPI

app = FastAPI(title="TalentSync Admin Panel Service", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "admin-panel"}
