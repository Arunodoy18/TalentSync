from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict

from .adapters import NotificationAdapterError, send_via_channel
from .audit import write_audit
from .retry import with_retry

app = FastAPI(title="TalentSync Notification Service", version="0.1.0")


class NotificationRequest(BaseModel):
    channel: str
    destination: str
    template: str
    data: Dict[str, Any]


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "notifications"}


@app.post("/notify/send")
def send_notification(payload: NotificationRequest) -> dict:
    try:
        provider_response = with_retry(
            lambda: send_via_channel(payload.channel, payload.destination, payload.template, payload.data),
            max_attempts=3,
            base_delay_seconds=0.5,
        )

        write_audit(
            {
                "status": "sent",
                "channel": payload.channel,
                "destination": payload.destination,
                "template": payload.template,
                "provider_response": provider_response,
            }
        )

        return {
            "ok": True,
            "data": {
                "status": "sent",
                "channel": payload.channel,
                "destination": payload.destination,
            },
        }
    except NotificationAdapterError as error:
        write_audit(
            {
                "status": "failed",
                "channel": payload.channel,
                "destination": payload.destination,
                "template": payload.template,
                "error": str(error),
            }
        )
        raise HTTPException(status_code=502, detail=str(error))
    except Exception as error:  # noqa: BLE001
        write_audit(
            {
                "status": "failed",
                "channel": payload.channel,
                "destination": payload.destination,
                "template": payload.template,
                "error": str(error),
            }
        )
        raise HTTPException(status_code=500, detail="notification delivery failed")
