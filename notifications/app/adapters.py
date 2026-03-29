from __future__ import annotations

import os
from typing import Any, Dict

import requests


class NotificationAdapterError(RuntimeError):
    pass


def _post_json(url: str, headers: Dict[str, str], payload: Dict[str, Any]) -> Dict[str, Any]:
    response = requests.post(url, headers=headers, json=payload, timeout=20)
    if response.status_code >= 400:
        raise NotificationAdapterError(f"provider error {response.status_code}: {response.text}")
    try:
        return response.json()
    except Exception:  # noqa: BLE001
        return {"raw": response.text}


def send_sendgrid(destination: str, template: str, data: Dict[str, Any]) -> Dict[str, Any]:
    api_key = os.getenv("SENDGRID_API_KEY", "")
    sender = os.getenv("SENDGRID_FROM_EMAIL", "")
    if not api_key or not sender:
        raise NotificationAdapterError("SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are required")

    payload = {
        "personalizations": [{"to": [{"email": destination}], "dynamic_template_data": data}],
        "from": {"email": sender},
        "template_id": template,
    }
    return _post_json(
        "https://api.sendgrid.com/v3/mail/send",
        {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        payload,
    )


def send_twilio(destination: str, template: str, data: Dict[str, Any]) -> Dict[str, Any]:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    sender = os.getenv("TWILIO_FROM_NUMBER", "")
    if not account_sid or not auth_token or not sender:
        raise NotificationAdapterError("TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are required")

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    body = f"[{template}] {data}"
    response = requests.post(
        url,
        data={"To": destination, "From": sender, "Body": body},
        auth=(account_sid, auth_token),
        timeout=20,
    )
    if response.status_code >= 400:
        raise NotificationAdapterError(f"provider error {response.status_code}: {response.text}")
    return response.json()


def send_firebase(destination: str, template: str, data: Dict[str, Any]) -> Dict[str, Any]:
    server_key = os.getenv("FIREBASE_SERVER_KEY", "")
    if not server_key:
        raise NotificationAdapterError("FIREBASE_SERVER_KEY is required")

    payload = {
        "to": destination,
        "notification": {
            "title": template,
            "body": str(data),
        },
        "data": data,
    }
    return _post_json(
        "https://fcm.googleapis.com/fcm/send",
        {
            "Authorization": f"key={server_key}",
            "Content-Type": "application/json",
        },
        payload,
    )


def send_via_channel(channel: str, destination: str, template: str, data: Dict[str, Any]) -> Dict[str, Any]:
    normalized = channel.lower().strip()
    if normalized == "email":
        return send_sendgrid(destination, template, data)
    if normalized == "sms":
        return send_twilio(destination, template, data)
    if normalized == "push":
        return send_firebase(destination, template, data)

    raise NotificationAdapterError(f"unsupported channel: {channel}")
