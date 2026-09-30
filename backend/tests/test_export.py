import pytest
from backend.app.schemas.document import StructuredDocumentContent, DocumentSection, Party
from backend.app.document.document_exporter import DocumentExporter


@pytest.fixture
def sample_document_content():
    return StructuredDocumentContent(
        title="Consulting and Advisory Agreement",
        document_type="Consulting Agreement",
        jurisdiction="State of Delaware, United States",
        parties=[
            Party(name="Global Advisory Corp", role="Consultant", company="Global Advisory", address="100 Wall St, New York"),
            Party(name="Tech Growth Inc", role="Client", company="Tech Growth Inc", address="500 Tech Blvd, San Francisco")
        ],
        sections=[
            DocumentSection(heading="1. Services", content="Consultant shall provide strategic advisory services."),
            DocumentSection(heading="2. Compensation", content="Client shall pay Consultant $10,000 monthly retainer."),
            DocumentSection(heading="3. Confidentiality", content="All proprietary information shall remain confidential.")
        ]
    )


def test_export_txt(sample_document_content):
    txt_bytes = DocumentExporter.export_txt(sample_document_content)
    assert len(txt_bytes) > 0
    text_str = txt_bytes.decode("utf-8")
    assert "CONSULTING AND ADVISORY AGREEMENT" in text_str
    assert "Global Advisory Corp" in text_str
    assert "1. SERVICES" in text_str


def test_export_docx(sample_document_content):
    docx_bytes = DocumentExporter.export_docx(sample_document_content)
    assert len(docx_bytes) > 1000
    # Check docx zip signature (PK\x03\x04)
    assert docx_bytes[:4] == b"PK\x03\x04"


def test_export_pdf(sample_document_content):
    pdf_bytes = DocumentExporter.export_pdf(sample_document_content)
    assert len(pdf_bytes) > 1000
    # Check PDF signature (%PDF-)
    assert pdf_bytes[:5] == b"%PDF-"


def test_export_api_endpoints(client, auth_headers):
    # Generate a document first
    gen_res = client.post(
        "/api/documents/generate",
        json={"document_type": "General Agreement", "parties": [{"name": "A", "role": "Party 1"}, {"name": "B", "role": "Party 2"}]},
        headers=auth_headers
    )
    doc_id = gen_res.json()["data"]["id"]

    # Test PDF
    pdf_res = client.get(f"/api/documents/{doc_id}/export/pdf", headers=auth_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 500

    # Test DOCX
    docx_res = client.get(f"/api/documents/{doc_id}/export/docx", headers=auth_headers)
    assert docx_res.status_code == 200
    assert "openxmlformats" in docx_res.headers["content-type"]
    assert len(docx_res.content) > 500

    # Test TXT
    txt_res = client.get(f"/api/documents/{doc_id}/export/txt", headers=auth_headers)
    assert txt_res.status_code == 200
    assert "text/plain" in txt_res.headers["content-type"]
    assert len(txt_res.content) > 200
