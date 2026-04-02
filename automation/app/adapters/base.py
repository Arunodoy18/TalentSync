from typing import Protocol, Any, Dict

class BaseApplier(Protocol):
    """
    Protocol for Job Board Auto-Apply Adapters.
    """
    async def apply(self, apply_url: str, applicant_data: Dict[str, Any], resume_path: str) -> bool:
        """
        Navigates to the apply_url, fills out the form using applicant_data,
        uploads the resume located at resume_path, and submits the application.
        Returns True if successful, False otherwise.
        """
        ...
