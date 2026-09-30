import asyncio
from typing import Optional, Dict, Any, List
from backend.app.ai.provider_base import BaseAIProvider
from backend.app.schemas.document import StructuredDocumentContent, DocumentSection, Party
from backend.app.schemas.ai import (
    GenerateDocumentRequest,
    ImproveClauseResponse,
    ExplainClauseResponse,
    SummarizeDocumentResponse,
    DocumentAnalysisResponse,
    KeyClauseItem,
    RiskItem,
)


class MockAIProvider(BaseAIProvider):
    """
    Realistic development & testing AI provider.
    Generates rich, fully customized legal drafts without requiring an external API key.
    """

    async def generate_document(self, req: GenerateDocumentRequest) -> StructuredDocumentContent:
        # Simulate slight AI latency for realistic UI UX testing
        await asyncio.sleep(0.4)

        doc_type_lower = req.document_type.lower()
        parties = req.parties
        terms = req.terms or {}
        jurisdiction = req.jurisdiction or "Delaware, United States"

        # Determine parties
        p1_name = parties[0].name if len(parties) > 0 else "First Party LLC"
        p1_role = parties[0].role if len(parties) > 0 else "Disclosing Party"
        p2_name = parties[1].name if len(parties) > 1 else "Second Party Inc."
        p2_role = parties[1].role if len(parties) > 1 else "Receiving Party"

        sections: List[DocumentSection] = []

        if "employment" in doc_type_lower or "offer" in doc_type_lower:
            job_title = terms.get("job_title", "Senior Software Engineer")
            salary = terms.get("salary", "$135,000 per annum")
            start_date = terms.get("start_date", "October 15, 2026")
            probation = terms.get("probation", "90 days")
            sections = [
                DocumentSection(
                    id="sec-1",
                    heading="1. POSITION AND DUTIES",
                    content=(
                        f"The Employer hereby engages the Employee to serve as {job_title}. The Employee shall report "
                        f"to the designated executive officer and perform such duties, responsibilities, and tasks as are "
                        f"customary for this position. The Employee agrees to devote their full working time, attention, "
                        f"and best efforts to the business affairs of the Employer."
                    ),
                    order=1,
                    clause_type="duties"
                ),
                DocumentSection(
                    id="sec-2",
                    heading="2. TERM AND COMMENCEMENT",
                    content=(
                        f"Employment shall commence on {start_date} and shall continue until terminated in accordance "
                        f"with the terms of this Agreement. The Employee shall be subject to an initial probationary period "
                        f"of {probation}, during which employment may be terminated by either party with two weeks' notice."
                    ),
                    order=2,
                    clause_type="term"
                ),
                DocumentSection(
                    id="sec-3",
                    heading="3. COMPENSATION AND BENEFITS",
                    content=(
                        f"In consideration for the services rendered, the Employer shall pay the Employee a base salary "
                        f"of {salary}, payable in regular installments in accordance with the Employer's customary payroll "
                        f"practices. The Employee shall be entitled to participate in all health, retirement, and welfare "
                        f"benefit plans generally made available to full-time employees."
                    ),
                    order=3,
                    clause_type="compensation"
                ),
                DocumentSection(
                    id="sec-4",
                    heading="4. CONFIDENTIALITY AND INTELLECTUAL PROPERTY",
                    content=(
                        "The Employee acknowledges that during employment, they will have access to proprietary trade "
                        "secrets, customer lists, algorithms, and confidential materials. The Employee covenants not to "
                        "disclose or use such information outside the scope of duties. All inventions, works of authorship, "
                        "and intellectual property developed by Employee within the scope of employment belong exclusively to the Employer."
                    ),
                    order=4,
                    clause_type="confidentiality"
                ),
                DocumentSection(
                    id="sec-5",
                    heading="5. TERMINATION AND NOTICE",
                    content=(
                        "Either party may terminate this employment relationship at any time, with or without cause, "
                        "upon thirty (30) days' written notice, or payment in lieu thereof. The Employer may terminate "
                        "employment immediately for 'Cause' (including fraud, gross negligence, or material breach)."
                    ),
                    order=5,
                    clause_type="termination"
                ),
                DocumentSection(
                    id="sec-6",
                    heading="6. GOVERNING LAW AND SEVERABILITY",
                    content=(
                        f"This Agreement shall be construed, interpreted, and governed in accordance with the laws "
                        f"of {jurisdiction}, without giving effect to conflicts of law principles. If any provision is "
                        f"held unenforceable, the remaining provisions shall continue in full force and effect."
                    ),
                    order=6,
                    clause_type="governing_law"
                ),
            ]
        elif "lease" in doc_type_lower or "rental" in doc_type_lower:
            rent = terms.get("rent", "$2,800 per month")
            deposit = terms.get("deposit", "$2,800")
            property_addr = terms.get("property", "124 Innovation Way, Suite 400")
            lease_dur = terms.get("lease_duration", "12 Months")
            sections = [
                DocumentSection(
                    id="sec-1",
                    heading="1. PREMISES LEASED",
                    content=(
                        f"The Landlord leases to the Tenant, and the Tenant rents from the Landlord, the real property "
                        f"located at: {property_addr} (the 'Premises'), strictly for lawful commercial/residential occupancy."
                    ),
                    order=1,
                    clause_type="premises"
                ),
                DocumentSection(
                    id="sec-2",
                    heading="2. TERM OF LEASE",
                    content=(
                        f"The term of this Lease shall be for {lease_dur}, beginning on the Commencement Date agreed by the "
                        f"parties. Holding over after expiration without Landlord's written consent shall constitute a month-to-month tenancy."
                    ),
                    order=2,
                    clause_type="term"
                ),
                DocumentSection(
                    id="sec-3",
                    heading="3. RENT AND SECURITY DEPOSIT",
                    content=(
                        f"Tenant shall pay to Landlord monthly rent of {rent}, payable in advance on or before the first day "
                        f"of each calendar month. Upon execution, Tenant shall deposit with Landlord the sum of {deposit} "
                        f"as a security deposit for the faithful performance of this Lease."
                    ),
                    order=3,
                    clause_type="payment"
                ),
                DocumentSection(
                    id="sec-4",
                    heading="4. MAINTENANCE AND UTILITIES",
                    content=(
                        "Tenant shall keep and maintain the Premises in good order and sanitary condition. Landlord shall "
                        "be responsible for structural repairs, plumbing systems, and common areas. Tenant shall pay for "
                        "all electricity, internet, and municipal utility services consumed during tenancy."
                    ),
                    order=4,
                    clause_type="maintenance"
                ),
                DocumentSection(
                    id="sec-5",
                    heading="5. GOVERNING JURISDICTION AND DISPUTE RESOLUTION",
                    content=(
                        f"This Lease shall be governed and enforced in accordance with the laws of {jurisdiction}. "
                        f"Any action or dispute arising out of this agreement shall be brought in the courts situated therein."
                    ),
                    order=5,
                    clause_type="governing_law"
                )
            ]
        else:
            # Default NDA / Commercial Agreement
            purpose = terms.get("purpose", "evaluating potential commercial partnerships and technical collaboration")
            duration = terms.get("duration", "2 (two) years")
            sections = [
                DocumentSection(
                    id="sec-1",
                    heading="1. PURPOSE AND DEFINITION OF CONFIDENTIAL INFORMATION",
                    content=(
                        f"This Agreement is entered into between {p1_name} (\"{p1_role}\") and {p2_name} (\"{p2_role}\") "
                        f"solely for the purpose of {purpose}. 'Confidential Information' refers to all proprietary data, "
                        f"technical designs, source code, financial projections, customer lists, and business strategies "
                        f"disclosed whether orally, visually, or in writing."
                    ),
                    order=1,
                    clause_type="definitions"
                ),
                DocumentSection(
                    id="sec-2",
                    heading="2. NON-DISCLOSURE AND DUTY OF CARE",
                    content=(
                        f"The Receiving Party agrees to maintain the Confidential Information in strict confidence, applying "
                        f"at least the degree of care it exercises with its own confidential data, but in no event less than a "
                        f"reasonable standard of care. The Receiving Party shall not copy, distribute, or reverse-engineer "
                        f"any portion without prior written authorization."
                    ),
                    order=2,
                    clause_type="confidentiality"
                ),
                DocumentSection(
                    id="sec-3",
                    heading="3. EXCLUSIONS FROM CONFIDENTIALITY",
                    content=(
                        "Confidential Information does not include information that: (a) is or becomes publicly known through "
                        "no breach of this Agreement; (b) was already known to the Receiving Party prior to disclosure; "
                        "(c) is independently developed without reference to the disclosing party's information; or "
                        "(d) is rightfully received from an unrestricted third party."
                    ),
                    order=3,
                    clause_type="exceptions"
                ),
                DocumentSection(
                    id="sec-4",
                    heading="4. DURATION AND RETURN OF MATERIALS",
                    content=(
                        f"The obligations of non-disclosure shall survive for a period of {duration} following disclosure. "
                        f"Upon written request, the Receiving Party shall immediately return or securely destroy all physical and "
                        f"electronic copies of Confidential Information and certify destruction in writing."
                    ),
                    order=4,
                    clause_type="term"
                ),
                DocumentSection(
                    id="sec-5",
                    heading="5. REMEDIES AND INJUNCTIVE RELIEF",
                    content=(
                        "The parties acknowledge that money damages alone would be inadequate in the event of an unauthorized "
                        "disclosure. The Disclosing Party shall be entitled to seek equitable and injunctive relief without "
                        "the necessity of posting a bond, in addition to all other statutory and legal remedies."
                    ),
                    order=5,
                    clause_type="remedies"
                ),
                DocumentSection(
                    id="sec-6",
                    heading="6. GOVERNING LAW AND JURISDICTION",
                    content=(
                        f"This Agreement shall be construed, interpreted, and governed under the laws of {jurisdiction}. "
                        f"The parties submit to the exclusive jurisdiction of the state and federal courts located within {jurisdiction}."
                    ),
                    order=6,
                    clause_type="governing_law"
                ),
            ]

        missing_info = [
            "Specific notice addresses and official contact persons for legal notice",
            "Dispute resolution escalation procedure (e.g. mandatory mediation prior to arbitration)",
        ]
        if "delaware" not in jurisdiction.lower() and "not specified" in jurisdiction.lower():
            missing_info.append("Explicit designation of governing jurisdiction and choice of forum")

        warnings = [
            f"Drafted under principles applicable to {jurisdiction}. Review with legal counsel prior to formal execution."
        ]

        title = req.title or f"{req.document_type.upper()}"

        return StructuredDocumentContent(
            title=title,
            document_type=req.document_type,
            jurisdiction=jurisdiction,
            parties=parties if parties else [
                Party(name=p1_name, role=p1_role),
                Party(name=p2_name, role=p2_role)
            ],
            sections=sections,
            terms=terms,
            warnings=warnings,
            missing_information=missing_info,
            disclaimer=(
                "LegalEase provides AI-generated legal information and document drafts for informational purposes only. "
                "It does not provide legal advice and does not replace review by a qualified legal professional."
            )
        )

    async def analyze_document(self, text: str) -> DocumentAnalysisResponse:
        await asyncio.sleep(0.4)
        sample_title = "Commercial Agreement"
        if "employment" in text.lower():
            sample_title = "Employment Agreement"
        elif "lease" in text.lower() or "tenant" in text.lower():
            sample_title = "Lease Agreement"
        elif "confidential" in text.lower() or "disclosure" in text.lower():
            sample_title = "Non-Disclosure Agreement (NDA)"

        return DocumentAnalysisResponse(
            summary=(
                f"This document is a drafted {sample_title}. It outlines obligations, rights, definitions of performance, "
                f"confidentiality considerations, and termination mechanisms between the named parties."
            ),
            detected_document_type=sample_title,
            detected_jurisdiction="Identified from text or Standard Commercial Law",
            key_clauses=[
                KeyClauseItem(
                    clause_title="Term & Termination",
                    clause_type="termination",
                    excerpt="Either party may terminate with notice or immediately for breach...",
                    analysis="Governs how the contract ends. Crucial to verify whether notice periods are reciprocal.",
                    risk_level="Medium"
                ),
                KeyClauseItem(
                    clause_title="Confidentiality & Proprietary Rights",
                    clause_type="confidentiality",
                    excerpt="All proprietary data shall be kept strictly confidential...",
                    analysis="Protects trade secrets and assigns inventions created during performance.",
                    risk_level="Low"
                ),
                KeyClauseItem(
                    clause_title="Governing Law & Forum",
                    clause_type="jurisdiction",
                    excerpt="This agreement is governed by the laws of the designated jurisdiction...",
                    analysis="Dictates where lawsuits must be filed and which statutory principles apply.",
                    risk_level="Low"
                ),
                KeyClauseItem(
                    clause_title="Limitation of Liability",
                    clause_type="liability",
                    excerpt="In no event shall either party be liable for consequential damages...",
                    analysis="Caps maximum financial exposure in the event of an inadvertent breach.",
                    risk_level="High"
                )
            ],
            risks=[
                RiskItem(
                    title="Unilateral Termination Disparity",
                    description="Check whether both parties have equal notice periods for termination without cause.",
                    severity="Medium",
                    recommendation="Ensure bilateral termination rights with matching 30-day notice provisions."
                ),
                RiskItem(
                    title="Broad Indemnification Scope",
                    description="Indemnity language may extend beyond direct willful misconduct to third-party claims.",
                    severity="High",
                    recommendation="Insert a reasonable monetary cap and limit indemnification to gross negligence."
                )
            ],
            missing_information=[
                "Explicit dispute resolution step (e.g. 30-day informal negotiation before litigation)",
                "Specific notice email addresses and statutory agent designations",
                "Explicit definition of force majeure events"
            ],
            questions_to_review=[
                "Does the limitation of liability cap match the total value of the contract?",
                "Are IP assignments fully compliant with local labor and patent assignment statutes?",
                "Is the governing jurisdiction practical and cost-effective for both parties in case of dispute?"
            ]
        )

    async def improve_clause(self, text: str, instruction: str, context: Optional[str] = None) -> ImproveClauseResponse:
        await asyncio.sleep(0.3)
        instr = instruction.lower()

        if "simplify" in instr:
            proposed = (
                "Each party agrees to keep the other party's secret information safe. "
                "Neither party will share it with anyone else without permission, except as required by law."
            )
            explanation = "Rewrote complex legalistic terminology into plain, modern business English without sacrificing the core obligation."
            changes = ["Removed archaic phrases ('herein', 'witnesseth')", "Shortened multi-clause sentence structure"]
        elif "formal" in instr:
            proposed = (
                f"The parties hereto expressly covenant, warrant, and agree that {text.strip()} "
                f"shall be strictly observed in accordance with the highest standards of commercial good faith and applicable statutory mandates."
            )
            explanation = "Elevated tone to formal standard contractual phrasing with customary legal warranties."
            changes = ["Added formal covenant language", "Enforced strict performance standard"]
        elif "protective" in instr:
            proposed = (
                f"{text.strip()} In addition, the Receiving Party shall indemnify, defend, and hold harmless "
                f"the Disclosing Party from and against any and all claims, damages, liabilities, and expenses arising out of any breach."
            )
            explanation = "Added defense and indemnification safeguards to maximize legal protection."
            changes = ["Inserted comprehensive indemnity clause", "Broadened remedies available upon breach"]
        else:
            proposed = (
                f"{text.strip()} Furthermore, each party shall ensure that its employees, contractors, "
                f"and agents are bound by obligations at least as restrictive as those contained herein."
            )
            explanation = "Strengthened clause clarity and added standard representative pass-through obligations."
            changes = ["Clarified operational scope", "Added agent flow-down requirements"]

        return ImproveClauseResponse(
            original_text=text,
            proposed_text=proposed,
            explanation=explanation,
            changes_made=changes
        )

    async def explain_clause(self, text: str, context: Optional[str] = None) -> ExplainClauseResponse:
        await asyncio.sleep(0.3)
        return ExplainClauseResponse(
            clause_text=text,
            plain_english_explanation=(
                "In simple terms, this clause defines your legal obligations and limits what the other party can do. "
                "It sets the ground rules so that neither party is surprised if an issue arises later on."
            ),
            key_implications=[
                "You are legally accountable for following this procedure exactly.",
                "Failing to adhere to this clause could entitle the other party to terminate or seek damages.",
                "This obligation continues even if other parts of the contract are completed."
            ],
            potential_risks=[
                "Vague deadlines or lack of grace periods could cause inadvertent technical default.",
                "Make sure you have internal procedures in place to comply with this standard."
            ],
            common_alternatives=[
                "Mutual provision: ensuring both parties have the identical right or restriction.",
                "Adding a 15-day cure period before any violation is declared a formal breach."
            ]
        )

    async def summarize_document(self, text: str) -> SummarizeDocumentResponse:
        await asyncio.sleep(0.3)
        return SummarizeDocumentResponse(
            summary="This agreement sets out the legal rights, obligations, compensation, and liability rules between the contracting parties.",
            key_points=[
                "Defines scope of relationship and designated responsibilities",
                "Specifies payment and delivery terms",
                "Protects confidential information and proprietary materials",
                "Includes standard termination and governing law provisions"
            ],
            parties_involved=["Party A", "Party B"],
            governing_law="Jurisdiction as specified in contract",
            effective_duration="Effective upon execution until formal termination"
        )
