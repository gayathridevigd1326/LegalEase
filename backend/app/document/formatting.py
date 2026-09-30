"""
LegalEase Formatting and Sanitization Utilities.
Directly implements core functions specified in LegalEase.pdf (Page 8, 9, 14, 15, 22, 23):
- sanitize_text(text)
- format_docx(text, doc_type, terms, logo_path)
- format_pdf(text, doc_type, terms, logo_path)
- format_html_preview(text)
"""

import os
import io
import re
import html
from datetime import datetime
from typing import Optional, List, Union

from docx import Document as DocxDocument
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable, Image as RLImage
)
from reportlab.pdfgen import canvas


def sanitize_text(text: str) -> str:
    """
    Removes special characters, typographic quotes, and unicode symbols to ensure clean formatting.
    Specified in LegalEase.pdf (Milestone 2 & 4, Page 15).
    """
    if not text:
        return ""

    # Replace smart quotes and apostrophes
    s = text.replace("“", '"').replace("”", '"').replace("„", '"').replace("«", '"').replace("»", '"')
    s = s.replace("‘", "'").replace("’", "'").replace("‚", "'").replace("‹", "'").replace("›", "'")
    
    # Replace em-dash, en-dash, minus
    s = s.replace("—", " - ").replace("–", " - ").replace("−", "-")
    
    # Replace non-breaking spaces and tabs
    s = s.replace("\u00a0", " ").replace("\t", "    ")
    
    # Replace bullet characters (e.g. \uf0b7, \u2022) with standard hyphen
    s = re.sub(r"[\uf0b7\u2022\u25cf\u25aa\u25cb]", "-", s)

    # Normalize double spaces
    s = re.sub(r" {2,}", " ", s)
    
    # Normalize Windows line endings
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    
    # Strip trailing whitespace on each line
    lines = [line.rstrip() for line in s.split("\n")]
    return "\n".join(lines).strip()


def format_html_preview(text: str) -> str:
    """
    Converts legal document text into an elegant dark-themed scrollable card with semantic HTML.
    Specified in LegalEase.pdf (Page 14 & 15).
    """
    clean = sanitize_text(text)
    lines = clean.split("\n")
    
    html_parts = []
    html_parts.append("""
<div class="legalease-preview-container" style="
    background: #0f172a;
    color: #e2e8f0;
    font-family: 'Georgia', 'Times New Roman', serif;
    padding: 28px;
    border-radius: 12px;
    border: 1px solid #334155;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    max-height: 560px;
    overflow-y: auto;
    line-height: 1.7;
">
    <div style="text-align: right; margin-bottom: 16px;">
        <span style="
            background: rgba(99, 102, 241, 0.15);
            color: #818cf8;
            border: 1px solid rgba(99, 102, 241, 0.3);
            font-size: 11px;
            font-family: sans-serif;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 4px 10px;
            border-radius: 9999px;
        ">LegalEase Verified Draft</span>
    </div>
""")

    in_list = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if in_list:
                html_parts.append("</ul>")
                in_list = False
            html_parts.append("<div style='height: 12px;'></div>")
            continue

        safe_stripped = html.escape(stripped)

        # Check for major Title (All caps, first few lines)
        if stripped == stripped.upper() and len(stripped) > 4 and len(stripped) < 70 and not stripped.startswith("-"):
            if in_list:
                html_parts.append("</ul>")
                in_list = False
            if "AGREEMENT" in stripped or "CONTRACT" in stripped or "LETTER" in stripped or "LEASE" in stripped or "NDA" in stripped:
                html_parts.append(f"""
<h1 style="
    text-align: center;
    color: #f8fafc;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin: 16px 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid #3b82f6;
">{safe_stripped}</h1>
""")
            else:
                html_parts.append(f"""
<h3 style="
    color: #93c5fd;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin: 18px 0 8px 0;
    text-transform: uppercase;
">{safe_stripped}</h3>
""")
        elif stripped.startswith("- ") or stripped.startswith("* "):
            if not in_list:
                html_parts.append("<ul style='margin: 8px 0; padding-left: 24px; color: #cbd5e1;'>")
                in_list = True
            content = html.escape(stripped[2:].strip())
            html_parts.append(f"<li style='margin-bottom: 6px;'>{content}</li>")
        else:
            if in_list:
                html_parts.append("</ul>")
                in_list = False
            
            # Highlight Recitals or Key labels
            if stripped.startswith("WHEREAS") or stripped.startswith("NOW, THEREFORE") or stripped.startswith("IN WITNESS WHEREOF"):
                html_parts.append(f"<p style='margin: 8px 0; color: #f1f5f9; font-style: italic;'>{safe_stripped}</p>")
            else:
                html_parts.append(f"<p style='margin: 8px 0; color: #cbd5e1; text-align: justify;'>{safe_stripped}</p>")

    if in_list:
        html_parts.append("</ul>")

    html_parts.append("""
    <div style="
        margin-top: 24px;
        padding-top: 14px;
        border-top: 1px dashed #475569;
        font-family: sans-serif;
        font-size: 11px;
        color: #94a3b8;
        text-align: center;
    ">
        LegalEase AI-Drafted Document — Informational Only. Consult Qualified Legal Counsel.
    </div>
</div>
""")

    return "\n".join(html_parts)


def format_docx(
    text: str,
    doc_type: str = "Legal Document",
    terms: Optional[Union[str, List[str]]] = None,
    logo_path: Optional[str] = None
) -> bytes:
    """
    Uses python-docx to format legal document with:
    - Times New Roman font throughout
    - Embedded logo on front page
    - Auto-generated Terms table from semicolon-separated input
    - Footer on the last page / running footer
    Specified in LegalEase.pdf (Page 9, 15, 22).
    """
    clean_text = sanitize_text(text)
    doc = DocxDocument()

    # Configure 1-inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

        # Footer on page
        footer = section.footer
        footer_p = footer.paragraphs[0]
        footer_p.text = "LegalEase AI-Drafted Document — Informational Only. Consult Qualified Legal Counsel."
        footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if footer_p.runs:
            frun = footer_p.runs[0]
            frun.font.name = "Times New Roman"
            frun.font.size = Pt(8.5)
            frun.font.color.rgb = RGBColor(120, 120, 120)

    # 1. Front Page Logo Embedding
    resolved_logo = None
    if logo_path and os.path.exists(logo_path):
        resolved_logo = logo_path
    elif os.path.exists("assets/logo.png"):
        resolved_logo = "assets/logo.png"

    if resolved_logo:
        try:
            logo_p = doc.add_paragraph()
            logo_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            logo_p.paragraph_format.space_after = Pt(12)
            run = logo_p.add_run()
            run.add_picture(resolved_logo, width=Inches(1.25))
        except Exception:
            pass

    # Header Brand Text
    brand_p = doc.add_paragraph()
    brand_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    b_run = brand_p.add_run("LEGAL EASE  |  OFFICIAL DRAFT")
    b_run.font.name = "Times New Roman"
    b_run.font.size = Pt(8.5)
    b_run.font.bold = True
    b_run.font.color.rgb = RGBColor(79, 70, 229)

    # Split lines and identify title
    lines = clean_text.split("\n")
    first_heading_idx = -1
    for idx, l in enumerate(lines[:6]):
        if l.strip() and l.strip() == l.strip().upper():
            first_heading_idx = idx
            break

    title = doc_type.upper()
    if first_heading_idx != -1:
        title = lines[first_heading_idx].strip()
        lines = lines[first_heading_idx+1:]

    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(8)
    title_p.paragraph_format.space_after = Pt(14)
    t_run = title_p.add_run(title)
    t_run.font.name = "Times New Roman"
    t_run.font.size = Pt(16)
    t_run.font.bold = True
    t_run.font.color.rgb = RGBColor(15, 23, 42)

    # Add Date & Document Type meta row
    meta_p = doc.add_paragraph()
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta_p.paragraph_format.space_after = Pt(14)
    m_run = meta_p.add_run(f"Document Type: {doc_type}   •   Date: {datetime.now().strftime('%B %d, %Y')}")
    m_run.font.name = "Times New Roman"
    m_run.font.size = Pt(9.5)
    m_run.font.italic = True
    m_run.font.color.rgb = RGBColor(100, 116, 139)

    # Process paragraphs
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Major section heading
        if stripped.startswith("SECTION") or stripped.startswith("ARTICLE") or (stripped == stripped.upper() and len(stripped) < 60 and not stripped.startswith("-")):
            hp = doc.add_paragraph()
            hp.paragraph_format.space_before = Pt(12)
            hp.paragraph_format.space_after = Pt(4)
            hp.paragraph_format.keep_with_next = True
            hrun = hp.add_run(stripped)
            hrun.font.name = "Times New Roman"
            hrun.font.size = Pt(11.5)
            hrun.font.bold = True
            hrun.font.color.rgb = RGBColor(15, 23, 42)
        elif stripped.startswith("- ") or stripped.startswith("* "):
            bp = doc.add_paragraph()
            bp.paragraph_format.left_indent = Inches(0.25)
            bp.paragraph_format.space_after = Pt(4)
            brun = bp.add_run("•  " + stripped[2:].strip())
            brun.font.name = "Times New Roman"
            brun.font.size = Pt(10.5)
        else:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.15
            prun = p.add_run(stripped)
            prun.font.name = "Times New Roman"
            prun.font.size = Pt(10.5)

    # 2. Terms Table from semicolon-separated input (PDF Page 9 & 15 requirement)
    terms_list = []
    if terms:
        if isinstance(terms, list):
            terms_list = [t.strip() for t in terms if t.strip()]
        elif isinstance(terms, str):
            terms_list = [t.strip() for t in terms.split(";") if t.strip()]

    if terms_list:
        tp_head = doc.add_paragraph()
        tp_head.paragraph_format.space_before = Pt(14)
        tp_head.paragraph_format.space_after = Pt(6)
        tp_head.paragraph_format.keep_with_next = True
        th_run = tp_head.add_run("SCHEDULE A — KEY TERMS & CONDITIONS TABLE")
        th_run.font.name = "Times New Roman"
        th_run.font.size = Pt(11.5)
        th_run.font.bold = True

        table = doc.add_table(rows=len(terms_list) + 1, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        # Header row
        hdr_cells = table.rows[0].cells
        hdr_cells[0].width = Inches(1.5)
        hdr_cells[1].width = Inches(5.0)
        h0 = hdr_cells[0].paragraphs[0].add_run("Clause #")
        h0.font.name = "Times New Roman"
        h0.font.bold = True
        h1 = hdr_cells[1].paragraphs[0].add_run("Key Term / Covenant Description")
        h1.font.name = "Times New Roman"
        h1.font.bold = True

        # Style header cell background
        for cell in hdr_cells:
            shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F1F5F9"/>')
            cell._tc.get_or_add_tcPr().append(shading)

        # Data rows
        for i, term in enumerate(terms_list, 1):
            row_cells = table.rows[i].cells
            row_cells[0].width = Inches(1.5)
            row_cells[1].width = Inches(5.0)
            
            c0 = row_cells[0].paragraphs[0].add_run(f"Term {i}")
            c0.font.name = "Times New Roman"
            c0.font.size = Pt(10)
            
            c1 = row_cells[1].paragraphs[0].add_run(term)
            c1.font.name = "Times New Roman"
            c1.font.size = Pt(10)

    bio = io.BytesIO()
    doc.save(bio)
    return bio.getvalue()


class RunningPDFCanvas(canvas.Canvas):
    """Custom ReportLab Canvas providing Running Logo in Header and Running Footer on all pages."""
    def __init__(self, *args, logo_path=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.logo_path = logo_path
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_and_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_and_footer(self, page_count):
        self.saveState()

        # Running Header on all pages
        # Center-aligned or left logo
        if self.logo_path and os.path.exists(self.logo_path):
            try:
                self.drawImage(self.logo_path, 54, letter[1] - 44, width=28, height=28, preserveAspectRatio=True, mask='auto')
            except Exception:
                pass

        self.setFont("Times-Bold", 8.5)
        self.setFillColor(HexColor("#334155"))
        self.drawString(90, letter[1] - 34, "LEGAL EASE  |  OFFICIAL DRAFT")

        self.setStrokeColor(HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 48, letter[0] - 54, letter[1] - 48)

        # Running Footer on all pages (PDF Page 23 requirement: Logo & Footer on all pages)
        self.line(54, 46, letter[0] - 54, 46)
        self.setFont("Times-Roman", 7.5)
        self.setFillColor(HexColor("#64748B"))
        self.drawString(54, 34, "LegalEase AI-Drafted Document — Informational Only. Consult Qualified Legal Counsel.")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 34, page_str)

        self.restoreState()


def format_pdf(
    text: str,
    doc_type: str = "Legal Document",
    terms: Optional[Union[str, List[str]]] = None,
    logo_path: Optional[str] = None
) -> bytes:
    """
    Generates branded PDF with:
    - Logo and footer on all pages
    - Bold headings for sections
    - Bullet-style terms
    Specified in LegalEase.pdf (Page 9, 15, 23).
    """
    clean_text = sanitize_text(text)
    buffer = io.BytesIO()

    resolved_logo = None
    if logo_path and os.path.exists(logo_path):
        resolved_logo = logo_path
    elif os.path.exists("assets/logo.png"):
        resolved_logo = "assets/logo.png"

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=64
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'LegalTitle',
        parent=styles['Heading1'],
        fontName='Times-Bold',
        fontSize=15,
        leading=19,
        alignment=1,  # Center
        textColor=HexColor('#0F172A'),
        spaceAfter=8
    )

    meta_style = ParagraphStyle(
        'LegalMeta',
        parent=styles['Normal'],
        fontName='Times-Italic',
        fontSize=8.5,
        leading=11,
        alignment=1,
        textColor=HexColor('#64748B'),
        spaceAfter=14
    )

    heading_style = ParagraphStyle(
        'LegalHeading',
        parent=styles['Heading2'],
        fontName='Times-Bold',
        fontSize=11,
        leading=15,
        textColor=HexColor('#0F172A'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'LegalBody',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=9.5,
        leading=13.5,
        textColor=HexColor('#1E293B'),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'LegalBullet',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=9.5,
        leading=13.5,
        textColor=HexColor('#1E293B'),
        leftIndent=15,
        spaceAfter=3
    )

    story = []

    # Large Center Logo on first page if available
    if resolved_logo:
        try:
            story.append(RLImage(resolved_logo, width=54, height=54))
            story.append(Spacer(1, 8))
        except Exception:
            pass

    # Split lines and find title
    lines = clean_text.split("\n")
    first_heading_idx = -1
    for idx, l in enumerate(lines[:6]):
        if l.strip() and l.strip() == l.strip().upper():
            first_heading_idx = idx
            break

    title = doc_type.upper()
    if first_heading_idx != -1:
        title = lines[first_heading_idx].strip()
        lines = lines[first_heading_idx+1:]

    story.append(Paragraph(title, title_style))
    story.append(Paragraph(f"Document Type: {doc_type} &nbsp;&bull;&nbsp; Date: {datetime.now().strftime('%B %d, %Y')}", meta_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor('#CBD5E1'), spaceAfter=10))

    # Process paragraphs
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if stripped.startswith("SECTION") or stripped.startswith("ARTICLE") or (stripped == stripped.upper() and len(stripped) < 60 and not stripped.startswith("-")):
            story.append(Paragraph(stripped, heading_style))
        elif stripped.startswith("- ") or stripped.startswith("* "):
            content = stripped[2:].strip()
            story.append(Paragraph(f"&bull;&nbsp;&nbsp;{content}", bullet_style))
        else:
            safe_content = stripped.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(safe_content, body_style))

    # Append Key Terms if provided
    terms_list = []
    if terms:
        if isinstance(terms, list):
            terms_list = [t.strip() for t in terms if t.strip()]
        elif isinstance(terms, str):
            terms_list = [t.strip() for t in terms.split(";") if t.strip()]

    if terms_list:
        story.append(Spacer(1, 10))
        story.append(Paragraph("SCHEDULE A — KEY TERMS & COVENANTS", heading_style))
        table_data = [[
            Paragraph("<b>Clause</b>", body_style),
            Paragraph("<b>Key Term / Obligation</b>", body_style)
        ]]
        for i, t in enumerate(terms_list, 1):
            table_data.append([
                Paragraph(f"Term {i}", body_style),
                Paragraph(t.replace("&", "&amp;"), body_style)
            ])

        term_table = Table(table_data, colWidths=[80, 420])
        term_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#F1F5F9')),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CBD5E1')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(KeepTogether(term_table))

    # Build canvas with custom header/footer
    def canvas_builder(*args, **kwargs):
        return RunningPDFCanvas(*args, logo_path=resolved_logo, **kwargs)

    doc.build(story, canvasmaker=canvas_builder)
    return buffer.getvalue()
