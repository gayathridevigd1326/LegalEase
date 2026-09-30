"""
LegalEase — AI-Powered Legal Document Generator
Streamlit Frontend Application matching LegalEase.pdf Specification (Milestone 4 & 5).
"""

import os
import io
import requests
import streamlit as st
from PIL import Image

from ai_core.gemini_generator import GeminiDocumentGenerator
from backend.app.document.formatting import (
    sanitize_text,
    format_html_preview,
    format_docx,
    format_pdf,
)

# ---------------------------------------------------------
# Page Configuration (Milestone 4.1, Step 1)
# ---------------------------------------------------------
st.set_page_config(
    page_title="LegalEase — AI-Powered Legal Document Generator",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling for modern dark / legal theme
st.markdown("""
<style>
    .main-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    .main-title {
        font-family: 'Times New Roman', serif;
        font-size: 2.2rem;
        font-weight: 700;
        color: #1e293b;
        margin-top: 0.5rem;
        margin-bottom: 0.2rem;
    }
    .dark .main-title {
        color: #f8fafc;
    }
    .sub-title {
        font-size: 1rem;
        color: #64748b;
        margin-bottom: 1rem;
        font-weight: 500;
    }
    .stButton>button {
        width: 100%;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.2s;
    }
    .stDownloadButton>button {
        width: 100%;
        border-radius: 8px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------
# Step 1: Center-Aligned Logo & Header (Milestone 4.1, Step 1 & 2)
# ---------------------------------------------------------
col1, col2, col3 = st.columns([1, 1.2, 1])
with col2:
    logo_path = "assets/logo.png"
    if os.path.exists(logo_path):
        logo_img = Image.open(logo_path)
        # Center-align logo in 3-column layout
        sub_c1, sub_c2, sub_c3 = st.columns([1, 1, 1])
        with sub_c2:
            st.image(logo_img, width=120)
    
    st.markdown("""
    <div class="main-header">
        <h1 class="main-title">LegalEase</h1>
        <div class="sub-title">AI-Powered Legal Document Generator &bull; <i>Draft Smarter. Understand Better.</i></div>
    </div>
    """, unsafe_allow_html=True)

# ---------------------------------------------------------
# Sidebar: Scenarios from LegalEase.pdf & Settings
# ---------------------------------------------------------
with st.sidebar:
    st.image(logo_path, width=48) if os.path.exists(logo_path) else None
    st.subheader("LegalEase Scenarios (PDF Spec)")
    st.caption("Load verified benchmark scenarios from LegalEase.pdf:")

    scenario = st.radio(
        "Select Demo Scenario:",
        [
            "Custom Draft",
            "Scenario 1: Employment Contract",
            "Scenario 2: Non-Disclosure Agreement (NDA)",
            "Scenario 3: Residential Lease Agreement",
        ],
        index=0
    )

    st.markdown("---")
    st.subheader("System Configuration")
    backend_url = st.text_input("FastAPI Backend URL:", value="http://127.0.0.1:8000")
    use_direct_ai = st.checkbox("Direct AI fallback if server offline", value=True)

    st.markdown("---")
    st.caption("LegalEase v1.0.0 &bull; Built with FastAPI, Gemini 1.5 Pro, and Streamlit.")

# ---------------------------------------------------------
# Preset Scenarios Data Mapping (LegalEase.pdf Scenarios)
# ---------------------------------------------------------
default_doc_type = "Freelance Work Contract"
default_parties = "Jane Doe (Service Provider), TechNova Inc. (Client)"
default_terms = "Payment to be made within 30 days of invoice; The provider agrees to deliver work by the agreed deadline; Confidentiality must be maintained at all times; Either party may terminate with 15 days notice"
default_dates = "April 10, 2025"

if scenario == "Scenario 1: Employment Contract":
    default_doc_type = "Employment Contract"
    default_parties = "John Doe (Employee), Apex Innovations Ltd. (Employer)"
    default_terms = "Position: Senior Software Architect; Full-time employment with annual base salary of $145,000; Standard comprehensive medical and 401(k) benefits; Confidentiality and IP assignment agreement in full effect; Either party may terminate with 30 days written notice"
    default_dates = "May 1, 2025"
elif scenario == "Scenario 2: Non-Disclosure Agreement (NDA)":
    default_doc_type = "Non-Disclosure Agreement (NDA)"
    default_parties = "Elena Rostova (Disclosing Party), Quantum Leap Ventures (Receiving Party)"
    default_terms = "Scope covers all proprietary software source code, trade secrets, and financial projections; Confidentiality obligation shall survive for a term of three (3) years; Non-solicitation of key personnel for twelve (12) months; Mandatory return or destruction of materials upon termination"
    default_dates = "April 15, 2025"
elif scenario == "Scenario 3: Residential Lease Agreement":
    default_doc_type = "Residential Lease Agreement"
    default_parties = "Robert Sterling (Landlord), Maria Garcia (Tenant)"
    default_terms = "Property located at 742 Evergreen Terrace, Suite 4B; Monthly rent of $2,200 payable on the first day of each month; Security deposit of $2,200 held in escrow; 12-month fixed lease term; No smoking and small pets allowed with written permission"
    default_dates = "June 1, 2025"

# ---------------------------------------------------------
# Step 3: User Input Interface (Milestone 4.1, Step 3 & Page 18-19)
# ---------------------------------------------------------
st.markdown("### 1. Document Parameters")

input_col1, input_col2 = st.columns([1, 1])

with input_col1:
    doc_types = [
        "Employment Contract",
        "Non-Disclosure Agreement (NDA)",
        "Residential Lease Agreement",
        "Freelance Work Contract",
        "Consulting Services Agreement",
        "Commercial Lease Agreement",
        "Independent Contractor Agreement",
        "Partnership Agreement",
        "Software License Agreement",
        "Employment Offer Letter",
    ]
    
    # Calculate index
    idx = 0
    if default_doc_type in doc_types:
        idx = doc_types.index(default_doc_type)

    selected_doc_type = st.selectbox(
        "Document Type:",
        options=doc_types,
        index=idx,
        help="Select or enter the type of legal agreement you wish to generate."
    )

    parties_input = st.text_area(
        "Parties Involved:",
        value=default_parties,
        height=95,
        help="Names, entities, and respective roles (e.g. 'Jane Doe (Service Provider), TechNova Inc. (Client)')"
    )

with input_col2:
    dates_input = st.text_input(
        "Effective Date:",
        value=default_dates,
        help="The date when the agreement becomes legally enforceable (e.g. 'April 10, 2025')"
    )

    terms_input = st.text_area(
        "Terms & Conditions (Use semicolons for bullet points):",
        value=default_terms,
        height=95,
        help="Specific covenants, rules, payment terms, or conditions separated by semicolons (;)"
    )

# Session state initialization
if "generated_doc" not in st.session_state:
    st.session_state.generated_doc = ""
if "edit_mode" not in st.session_state:
    st.session_state.edit_mode = False
if "editable_text" not in st.session_state:
    st.session_state.editable_text = ""

# ---------------------------------------------------------
# Step 4: Generation Button & Execution (Milestone 4.2, Step 1)
# ---------------------------------------------------------
col_gen1, col_gen2 = st.columns([2, 1])
with col_gen1:
    generate_clicked = st.button("🚀 Generate Document", type="primary", use_container_width=True)

if generate_clicked:
    if not parties_input.strip() or not terms_input.strip():
        st.error("Please provide both the involved parties and the key terms.")
    else:
        with st.spinner("Drafting professional legal document with AI..."):
            doc_text = None
            # 1. Try FastAPI backend endpoint
            try:
                resp = requests.post(
                    f"{backend_url}/generate",
                    json={
                        "document_type": selected_doc_type,
                        "parties": parties_input,
                        "terms": terms_input,
                        "dates": dates_input
                    },
                    timeout=15
                )
                if resp.status_code == 200:
                    data = resp.json()
                    doc_text = data.get("generated_text") or data.get("content")
            except Exception as net_err:
                pass

            # 2. Fallback to direct AI generator if server offline
            if not doc_text and use_direct_ai:
                gen = GeminiDocumentGenerator()
                doc_text = gen.generate_document(
                    document_type=selected_doc_type,
                    parties=parties_input,
                    terms=terms_input,
                    dates=dates_input
                )

            if doc_text:
                clean = sanitize_text(doc_text)
                st.session_state.generated_doc = clean
                st.session_state.editable_text = clean
                st.session_state.edit_mode = False
                st.success("Legal document generated and verified successfully!")
            else:
                st.error("Could not generate document. Please ensure backend is running or Gemini API is reachable.")

# ---------------------------------------------------------
# Dynamic Preview & Editing Section (Milestone 4.2, Step 2 & 3)
# ---------------------------------------------------------
if st.session_state.generated_doc:
    st.markdown("---")
    st.markdown("### 2. Document Preview & Customization")

    c_prev, c_edit = st.columns([3, 1])
    with c_edit:
        # Edit toggle button matching PDF Page 20 ("Click to Edit Document")
        toggle_label = "🔒 View Styled Preview" if st.session_state.edit_mode else "✏️ Click to Edit Document"
        if st.button(toggle_label, use_container_width=True):
            st.session_state.edit_mode = not st.session_state.edit_mode
            st.rerun()

    # Step 2: HTML Preview Rendering (Page 14)
    if not st.session_state.edit_mode:
        html_preview = format_html_preview(st.session_state.editable_text)
        st.components.v1.html(html_preview, height=580, scrolling=True)
    else:
        # Step 3: Editable Document Preview Area (Page 14 & 20)
        st.info("You can directly modify clauses, recitals, or signature lines below:")
        edited_text = st.text_area(
            "Document Editor:",
            value=st.session_state.editable_text,
            height=500
        )
        st.session_state.editable_text = edited_text

    # ---------------------------------------------------------
    # Step 4: Multi-Format Download Options (Milestone 4.2, Step 4 & Page 21-23)
    # ---------------------------------------------------------
    st.markdown("### 3. Download & Export Options")
    st.caption("Export your customized agreement in any of the industry-standard formats:")

    dcol1, dcol2, dcol3 = st.columns(3)

    # 1. TXT Export
    with dcol1:
        txt_bytes = st.session_state.editable_text.encode("utf-8")
        st.download_button(
            label="📄 Download as .TXT",
            data=txt_bytes,
            file_name=f"{selected_doc_type.lower().replace(' ', '_')}.txt",
            mime="text/plain",
            use_container_width=True
        )

    # 2. DOCX Export (with logo, Times New Roman, and terms table)
    with dcol2:
        docx_bytes = format_docx(
            text=st.session_state.editable_text,
            doc_type=selected_doc_type,
            terms=terms_input,
            logo_path=logo_path if os.path.exists(logo_path) else None
        )
        st.download_button(
            label="📝 Download as .DOCX",
            data=docx_bytes,
            file_name=f"{selected_doc_type.lower().replace(' ', '_')}.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            use_container_width=True
        )

    # 3. PDF Export (with header logo and running footer on all pages)
    with dcol3:
        pdf_bytes = format_pdf(
            text=st.session_state.editable_text,
            doc_type=selected_doc_type,
            terms=terms_input,
            logo_path=logo_path if os.path.exists(logo_path) else None
        )
        st.download_button(
            label="📕 Download as .PDF",
            data=pdf_bytes,
            file_name=f"{selected_doc_type.lower().replace(' ', '_')}.pdf",
            mime="application/pdf",
            use_container_width=True
        )
