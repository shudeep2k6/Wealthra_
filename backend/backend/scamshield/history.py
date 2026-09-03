from datetime import datetime, timezone
from threading import Lock

_MAX_HISTORY = 100

_history = []
_lock = Lock()


def add_scan(scan_result):
    """Store a ScamShield scan result in memory."""

    entry = {
        "id": len(_history) + 1,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **scan_result,
    }

    with _lock:
        _history.insert(0, entry)

        if len(_history) > _MAX_HISTORY:
            del _history[_MAX_HISTORY:]

    return entry


def get_history():
    """Return the most recent ScamShield scans."""

    with _lock:
        return list(_history)


def clear_history():
    """Clear all stored ScamShield scan history."""

    with _lock:
        _history.clear()

    return True
