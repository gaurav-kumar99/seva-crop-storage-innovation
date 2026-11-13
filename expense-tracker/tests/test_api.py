import pytest
from fastapi.testclient import TestClient

from app.main import app, reset_store

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_store():
    reset_store()
    yield
    reset_store()


def make(description="Lunch", amount=12.5, category="food"):
    return client.post(
        "/expenses",
        json={"description": description, "amount": amount, "category": category},
    )


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_create_and_get_expense():
    r = make()
    assert r.status_code == 201
    body = r.json()
    assert body["id"] == 1
    assert body["spent_on"] is not None
    assert client.get("/expenses/1").json()["description"] == "Lunch"


def test_rejects_non_positive_amount():
    assert make(amount=0).status_code == 422
    assert make(amount=-5).status_code == 422


def test_list_and_filter_by_category():
    make("Lunch", 10, "food")
    make("Bus", 3, "travel")
    assert len(client.get("/expenses").json()) == 2
    food = client.get("/expenses", params={"category": "FOOD"}).json()
    assert [e["description"] for e in food] == ["Lunch"]


def test_get_missing_returns_404():
    assert client.get("/expenses/999").status_code == 404


def test_delete_expense():
    make()
    assert client.delete("/expenses/1").status_code == 204
    assert client.get("/expenses/1").status_code == 404
    assert client.delete("/expenses/1").status_code == 404


def test_summary_totals():
    make("Lunch", 10, "food")
    make("Dinner", 20.25, "Food")
    make("Bus", 3, "travel")
    s = client.get("/summary").json()
    assert s["count"] == 3
    assert s["total"] == 33.25
    assert s["by_category"] == {"food": 30.25, "travel": 3.0}
