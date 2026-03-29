from __future__ import annotations

import time
from typing import Callable, TypeVar

T = TypeVar("T")


def with_retry(fn: Callable[[], T], max_attempts: int = 3, base_delay_seconds: float = 0.5) -> T:
    last_error: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        try:
            return fn()
        except Exception as error:  # noqa: BLE001
            last_error = error
            if attempt >= max_attempts:
                break
            delay = min(5.0, base_delay_seconds * (2 ** (attempt - 1)))
            time.sleep(delay)

    raise RuntimeError("Retry attempts exhausted") from last_error
