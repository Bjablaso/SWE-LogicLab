import pytest
from datetime import datetime, timedelta, timezone
from app.services.student_feed import _date_group

NOW = datetime(2026, 11, 11, 15, 0, tzinfo=timezone.utc)