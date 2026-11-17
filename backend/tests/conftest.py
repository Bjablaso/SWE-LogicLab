import os
import pathlib

import pytest

# Point the app at the TEST database BEFORE importing it (database.py reads DATABASE_URL on import)
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql://test:test@localhost:5433/campus_connect_test",
)
assert "supabase" not in os.environ["DATABASE_URL"], "Refusing to run tests against Supabase"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlmodel import Session

from app.main import app
from app.database import get_session

BACKEND = pathlib.Path(__file__).resolve().parents[1]


@pytest.fixture(scope="session")
def engine():
    """Fresh tables + seed data once per test run."""
    eng = create_engine(os.environ["DATABASE_URL"])
    with eng.begin() as conn:
        conn.exec_driver_sql("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
        conn.exec_driver_sql((BACKEND / "schema.sql").read_text())
        conn.exec_driver_sql((BACKEND / "seed.sql").read_text())
    yield eng
    eng.dispose()


@pytest.fixture
def session(engine):
    """Each test runs inside a transaction that is rolled back afterwards,
    so every test starts from the same seed data."""
    conn = engine.connect()
    trans = conn.begin()
    s = Session(bind=conn, join_transaction_mode="create_savepoint")
    yield s
    s.close()
    trans.rollback()
    conn.close()


@pytest.fixture
def client(session):
    """API client whose routes use the test session."""
    app.dependency_overrides[get_session] = lambda: session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def titles(response):
    """Event titles from a list response."""
    return [item["title"] for item in response.json()]