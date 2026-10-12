import pytest
from httpx import AsyncClient, ASGITransport
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.eligibility import evaluate_candidate_eligibility
from app.models.entities import JobPosition

@pytest.mark.asyncio
async def test_root_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert "Job Portal" in response.json()["project"]

@pytest.mark.asyncio
async def test_admin_login_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={
            "email": "admin@jobportal.com",
            "password": "Admin@123"
        })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"

@pytest.mark.asyncio
async def test_login_invalid_password():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={
            "email": "admin@jobportal.com",
            "password": "WrongPassword!99"
        })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_jobs_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) >= 2
    titles = [j["title"] for j in jobs]
    assert "Programmer" in titles
    assert "Data Entry Operator" in titles

def test_programmer_eligibility_rule():
    job = JobPosition(
        title="Programmer",
        min_academic_percentage=75.0,
        min_exam_score=8.01,
        max_exam_score=10.0
    )
    # Case 1: Candidate with score 9.0 and 80% aggregate -> Eligible
    eligible, reason = evaluate_candidate_eligibility(job, academic_percentage=80.0, exam_score=9.0)
    assert eligible is True

    # Case 2: Candidate with score 7.5 (<= 8) and 80% aggregate -> NOT eligible
    eligible, reason = evaluate_candidate_eligibility(job, academic_percentage=80.0, exam_score=7.5)
    assert eligible is False

    # Case 3: Candidate with score 9.5 and 70% aggregate (< 75%) -> NOT eligible
    eligible, reason = evaluate_candidate_eligibility(job, academic_percentage=70.0, exam_score=9.5)
    assert eligible is False

def test_data_entry_operator_eligibility_rule():
    job = JobPosition(
        title="Data Entry Operator",
        min_academic_percentage=65.0,
        min_exam_score=6.0,
        max_exam_score=8.0
    )
    # Case 1: Candidate with score 7.0 and 70% aggregate -> Eligible
    eligible, reason = evaluate_candidate_eligibility(job, academic_percentage=70.0, exam_score=7.0)
    assert eligible is True

    # Case 2: Boundary test: Score 6.0 and 65% aggregate -> Eligible
    eligible, reason = evaluate_candidate_eligibility(job, academic_percentage=65.0, exam_score=6.0)
    assert eligible is True

    # Case 3: Boundary test: Score 8.0 and 65% aggregate -> Eligible
    eligible, reason = evaluate_candidate_eligibility(job, academic_percentage=65.0, exam_score=8.0)
    assert eligible is True

    # Case 4: Candidate with score 5.0 (< 6.0) -> NOT eligible
    eligible, reason = evaluate_candidate_eligibility(job, academic_percentage=70.0, exam_score=5.0)
    assert eligible is False
