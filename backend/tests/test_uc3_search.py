import pytest
from tests.conftest import titles

pytestmark = pytest.mark.integration


def test_t1_search_keyword_in_title(client):
    """T1: searchEvents(S1, C2): keyword in a title, no category."""
    r = client.get("/api/events", params={"search": "aws"})
    assert r.status_code == 200
    assert "AWS Security Workshop" in titles(r)


def test_t2_search_is_case_insensitive(client):
    """T2: searchEvents(S3, C2): different letter case returns the same event."""
    lower = client.get("/api/events", params={"search": "aws"})
    upper = client.get("/api/events", params={"search": "AWS"})
    assert upper.status_code == 200
    assert titles(upper) == titles(lower)


def test_t3_search_no_match_returns_empty(client):
    """T3: searchEvents(S5, C2): matches nothing."""
    r = client.get("/api/events", params={"search": "zzzz"})
    assert r.status_code == 200
    assert r.json() == []


def test_t4_search_with_category(client):
    """T4: searchEvents(S1, C1): keyword + existing category."""
    r = client.get("/api/events", params={"search": "career", "category_id": 1})
    assert r.status_code == 200
    assert titles(r) == ["Cybersecurity Club Meeting"]


def test_t5_category_not_a_number_returns_422(client):
    """T5: searchEvents(S4, C4): category_id is not a number."""
    r = client.get("/api/events", params={"category_id": "abc"})
    assert r.status_code == 422


def test_t6_recommendations_unknown_student_returns_404(client):
    """T6: getRecommendations(U3): student does not exist."""
    r = client.get("/api/students/9999/recommendations")
    assert r.status_code == 404
    assert r.json()["detail"] == "Student not found"