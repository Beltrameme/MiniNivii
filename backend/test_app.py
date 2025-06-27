import pytest
from fastapi.testclient import TestClient
from App import app  # Assuming your FastAPI app is in a file named main.py

client = TestClient(app)
def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
def test_echo_no_question():
    response = client.post("/ask", json={})
    assert response.status_code == 400
    assert response.json() == {"detail": "no question"}
def test_echo_missing_question_field():
    response = client.post("/ask", json={"question": None})
    assert response.status_code == 400
    assert response.json() == {"detail": "question field is required"}
def test_echo_unable_to_make_query():
    response = client.post("/ask", json={"question": "Invalid question"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Unable to make Query"}