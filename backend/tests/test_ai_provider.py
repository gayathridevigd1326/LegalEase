import pytest
from backend.app.ai.document_generator import get_ai_provider
from backend.app.schemas.ai import GenerateDocumentRequest
from backend.app.schemas.document import Party


@pytest.mark.asyncio
async def test_mock_provider_generation():
    provider = get_ai_provider()
    req = GenerateDocumentRequest(
        document_type="Employment Contract",
        title="Senior AI Engineer Agreement",
        jurisdiction="State of New York, USA",
        parties=[
            Party(name="Nova Labs Inc.", role="Employer"),
            Party(name="David Miller", role="Employee")
        ],
        terms={
            "job_title": "Lead AI Architect",
            "salary": "$175,000 / year",
            "probation": "60 days"
        }
    )
    result = await provider.generate_document(req)
    assert result.title == "Senior AI Engineer Agreement"
    assert len(result.sections) >= 4
    assert result.jurisdiction == "State of New York, USA"
    assert any("Lead AI Architect" in s.content for s in result.sections)


def test_ai_generate_endpoint(client, auth_headers):
    payload = {
        "document_type": "Non-Disclosure Agreement (NDA)",
        "jurisdiction": "Delaware",
        "parties": [
            {"name": "Venture Corp", "role": "Disclosing Party"},
            {"name": "Partner Ltd", "role": "Receiving Party"}
        ],
        "terms": {
            "purpose": "technical due diligence",
            "duration": "3 Years"
        }
    }
    res = client.post("/api/documents/generate", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "data" in data
    assert len(data["data"]["content"]["sections"]) >= 4


def test_ai_assistant_improve_and_explain(client, auth_headers):
    # Improve
    imp_res = client.post(
        "/api/ai/improve",
        json={"text": "The party will not tell secrets to anyone.", "instruction": "formal"},
        headers=auth_headers
    )
    assert imp_res.status_code == 200
    assert imp_res.json()["success"] is True
    assert len(imp_res.json()["data"]["proposed_text"]) > 0

    # Explain
    exp_res = client.post(
        "/api/ai/explain",
        json={"text": "Each party indemnifies and holds harmless the other against consequential damages."},
        headers=auth_headers
    )
    assert exp_res.status_code == 200
    assert exp_res.json()["success"] is True
    assert len(exp_res.json()["data"]["key_implications"]) > 0
