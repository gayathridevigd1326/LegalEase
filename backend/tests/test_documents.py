import pytest
import uuid


def test_create_and_get_document(client, auth_headers):
    create_payload = {
        "title": "Master Services Agreement 2026",
        "document_type": "Service Agreement",
        "jurisdiction": "California, United States",
        "content": {
            "title": "Master Services Agreement 2026",
            "document_type": "Service Agreement",
            "jurisdiction": "California, United States",
            "parties": [
                {"name": "Alpha Corp", "role": "Client"},
                {"name": "Beta LLC", "role": "Provider"}
            ],
            "sections": [
                {"heading": "1. Scope", "content": "Provider will deliver development services."}
            ]
        }
    }

    create_res = client.post("/api/documents", json=create_payload, headers=auth_headers)
    assert create_res.status_code == 200
    doc_data = create_res.json()["data"]
    doc_id = doc_data["id"]
    assert doc_data["title"] == "Master Services Agreement 2026"
    assert doc_data["version_count"] == 1

    # Get by ID
    get_res = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == doc_id
    assert len(get_res.json()["data"]["content"]["sections"]) == 1


def test_update_document_and_versions(client, auth_headers):
    # Create doc
    create_res = client.post(
        "/api/documents",
        json={"title": "NDA Initial", "document_type": "Non-Disclosure Agreement"},
        headers=auth_headers
    )
    doc_id = create_res.json()["data"]["id"]

    # Update with new version
    update_payload = {
        "title": "NDA Revised Version 2",
        "content": {
            "title": "NDA Revised Version 2",
            "document_type": "Non-Disclosure Agreement",
            "sections": [
                {"heading": "1. Definition", "content": "Updated confidentiality clause text."}
            ]
        }
    }
    update_res = client.put(f"/api/documents/{doc_id}?new_version=true", json=update_payload, headers=auth_headers)
    assert update_res.status_code == 200
    assert update_res.json()["data"]["title"] == "NDA Revised Version 2"

    # Check versions
    ver_res = client.get(f"/api/documents/{doc_id}/versions", headers=auth_headers)
    assert ver_res.status_code == 200
    versions = ver_res.json()["data"]
    assert len(versions) >= 1

    # Duplicate
    dup_res = client.post(f"/api/documents/{doc_id}/duplicate", headers=auth_headers)
    assert dup_res.status_code == 200
    assert "Copy of" in dup_res.json()["data"]["title"]

    # Delete original
    del_res = client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Ensure 404
    get_again = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
    assert get_again.status_code == 404
