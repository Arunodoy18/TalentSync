# Auto Apply Service

Responsibilities:
- Playwright automation for job applications
- Session management
- Form autofill and resume upload
- Result logging

Recommended runtime:
- Python worker + queue consumer
- Human-in-the-loop for captcha/manual checkpoints

Run locally:
- API: `uvicorn app.main:app --host 0.0.0.0 --port 8004`
- Worker: `python -m app`
