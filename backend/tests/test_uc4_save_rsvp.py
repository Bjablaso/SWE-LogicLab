import pytest
from tests.conftest import titles

pytestmark = pytest.mark.integration

STUDENT = 1
EVENT = 2          # AWS Security Workshop in seed.sql
RSVP_EVENT = 3


def saved_list(client):
    return client.get(f"/api/students/{STUDENT}/saved-events")


def test_t7_save_event(client):
    """T7: saveEvent(U1, E1, V1): not saved yet."""
    r = client.post(f"/api/students/{STUDENT}/saved-events/{EVENT}")
    assert r.status_code == 200
    assert "AWS Security Workshop" in titles(saved_list(client))   # the save really happened


def test_t8_save_twice_returns_same_event(client):
    """T8: saveEvent(U1, E1, V2): already saved, no duplicate."""
    first = client.post(f"/api/students/{STUDENT}/saved-events/{EVENT}")
    second = client.post(f"/api/students/{STUDENT}/saved-events/{EVENT}")
    assert second.status_code == 200
    assert second.json() == first.json()
    assert titles(saved_list(client)).count("AWS Security Workshop") == 1


def test_t9_get_saved_events(client):
    """T9: getSavedEvents(U1)."""
    client.post(f"/api/students/{STUDENT}/saved-events/{EVENT}")    # arrange: make sure it's saved
    r = saved_list(client)
    assert r.status_code == 200
    assert "AWS Security Workshop" in titles(r)


def test_t10_save_unknown_event_returns_404(client):
    """T10: saveEvent(U1, E3): event does not exist."""
    r = client.post(f"/api/students/{STUDENT}/saved-events/9999")
    assert r.status_code == 404
    assert r.json()["detail"] == "Event not found"


def test_t11_cancel_active_rsvp(client):
    """T11: cancelRSVP(U1, E1, R3): RSVP is active."""
    # arrange: make sure the RSVP is active (409 = seed already has it active)
    setup = client.post(f"/api/students/{STUDENT}/rsvps/{RSVP_EVENT}")
    assert setup.status_code in (200, 201, 409)

    r = client.delete(f"/api/students/{STUDENT}/rsvps/{RSVP_EVENT}")
    assert r.status_code == 200

    active = client.get(f"/api/students/{STUDENT}/rsvps")
    assert RSVP_EVENT not in [item["event_id"] for item in active.json()]   # really cancelled