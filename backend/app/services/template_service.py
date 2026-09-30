import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.template import Template


DEFAULT_TEMPLATES: List[Dict[str, Any]] = [
    {
        "name": "Employment Contract",
        "description": "Standard comprehensive employment agreement defining position, compensation, benefits, IP assignment, and termination provisions.",
        "category": "Employment",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a formal full-time Employment Contract incorporating fair labor protections and employer IP safeguards.",
        "schema": {
            "fields": [
                {"name": "job_title", "label": "Job Title", "type": "text", "required": True, "placeholder": "e.g. Senior Software Engineer"},
                {"name": "salary", "label": "Annual Salary / Compensation", "type": "currency", "required": True, "placeholder": "e.g. $120,000 / year"},
                {"name": "payment_frequency", "label": "Payment Frequency", "type": "select", "required": True, "options": ["Bi-weekly", "Semi-monthly", "Monthly"]},
                {"name": "start_date", "label": "Start Date", "type": "date", "required": True},
                {"name": "work_location", "label": "Work Location / Remote Status", "type": "text", "required": False, "placeholder": "e.g. Remote / Headquarters (Austin, TX)"},
                {"name": "probation", "label": "Probationary Period", "type": "select", "required": False, "options": ["None", "30 days", "60 days", "90 days"]},
                {"name": "leave_days", "label": "Annual Paid Time Off (Days)", "type": "number", "required": False, "placeholder": "e.g. 20"},
                {"name": "notice_period", "label": "Termination Notice Period", "type": "text", "required": False, "placeholder": "e.g. 30 days"}
            ]
        }
    },
    {
        "name": "Non-Disclosure Agreement (NDA)",
        "description": "Mutual or unilateral confidentiality agreement protecting trade secrets, proprietary technology, and business plans.",
        "category": "Confidentiality",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a strong Non-Disclosure Agreement protecting proprietary discussions and business information.",
        "schema": {
            "fields": [
                {"name": "agreement_type", "label": "NDA Type", "type": "select", "required": True, "options": ["Mutual (Bilateral)", "Unilateral (One-way)"]},
                {"name": "purpose", "label": "Purpose of Disclosure", "type": "textarea", "required": True, "placeholder": "e.g. Evaluating technical integration and business partnership"},
                {"name": "duration", "label": "Confidentiality Duration", "type": "select", "required": True, "options": ["1 Year", "2 Years", "3 Years", "5 Years", "In Perpetuity (Trade Secrets)"]},
                {"name": "permitted_use", "label": "Permitted Use Limitations", "type": "text", "required": False, "placeholder": "e.g. Strictly evaluation purposes"}
            ]
        }
    },
    {
        "name": "Lease Agreement",
        "description": "Commercial or residential property lease agreement specifying rent, security deposit, maintenance, and occupancy terms.",
        "category": "Real Estate",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a formal real estate lease agreement covering tenancy rights, utilities, security deposits, and maintenance.",
        "schema": {
            "fields": [
                {"name": "property", "label": "Premises / Property Address", "type": "textarea", "required": True, "placeholder": "e.g. 100 Main St, Suite 400, Chicago, IL 60601"},
                {"name": "rent", "label": "Monthly Rent Amount", "type": "currency", "required": True, "placeholder": "e.g. $3,500"},
                {"name": "deposit", "label": "Security Deposit", "type": "currency", "required": True, "placeholder": "e.g. $3,500"},
                {"name": "lease_duration", "label": "Lease Term", "type": "select", "required": True, "options": ["6 Months", "12 Months", "24 Months", "Month-to-Month"]},
                {"name": "start_date", "label": "Commencement Date", "type": "date", "required": True},
                {"name": "utilities", "label": "Utilities Responsible by Tenant", "type": "text", "required": False, "placeholder": "e.g. Electricity, Internet, Gas"},
                {"name": "pets_permitted", "label": "Pets Permitted", "type": "select", "required": False, "options": ["No", "Yes (Subject to pet deposit)", "Not applicable"]}
            ]
        }
    },
    {
        "name": "Rental Agreement",
        "description": "Short-term or flexible residential rental contract outlining monthly rent, house rules, and occupant obligations.",
        "category": "Real Estate",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a flexible residential rental agreement clearly detailing landlord and tenant rights.",
        "schema": {
            "fields": [
                {"name": "property", "label": "Rental Unit Address", "type": "text", "required": True, "placeholder": "e.g. Apt 4B, 742 Evergreen Terrace"},
                {"name": "monthly_rent", "label": "Monthly Rent", "type": "currency", "required": True, "placeholder": "e.g. $1,800"},
                {"name": "deposit", "label": "Deposit Amount", "type": "currency", "required": True, "placeholder": "e.g. $1,800"},
                {"name": "payment_day", "label": "Rent Due Day", "type": "select", "required": True, "options": ["1st of each month", "5th of each month", "15th of each month"]},
                {"name": "maximum_occupants", "label": "Max Occupants", "type": "number", "required": False, "placeholder": "e.g. 2"}
            ]
        }
    },
    {
        "name": "Freelance Agreement",
        "description": "Contract for independent creative, technical, or marketing professionals defining deliverables, milestones, and copyright transfer.",
        "category": "Freelance",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a clear Freelancer Agreement specifying scope of work, IP ownership upon payment, and milestones.",
        "schema": {
            "fields": [
                {"name": "project_name", "label": "Project / Assignment Name", "type": "text", "required": True, "placeholder": "e.g. Mobile App Redesign"},
                {"name": "scope_of_work", "label": "Deliverables & Scope", "type": "textarea", "required": True, "placeholder": "Detailed description of milestones and deliverables"},
                {"name": "fee_structure", "label": "Fee Structure", "type": "select", "required": True, "options": ["Fixed Project Fee", "Hourly Rate", "Milestone-Based Retainer"]},
                {"name": "rate_or_fee", "label": "Fee Amount", "type": "currency", "required": True, "placeholder": "e.g. $5,000 total or $90/hr"},
                {"name": "deadline", "label": "Project Deadline", "type": "date", "required": True},
                {"name": "revisions_included", "label": "Included Revisions", "type": "number", "required": False, "placeholder": "e.g. 2 rounds"}
            ]
        }
    },
    {
        "name": "Service Agreement",
        "description": "B2B commercial agreement for software, maintenance, facilities, or professional business services with SLA parameters.",
        "category": "Business",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a Master Service Agreement with statement of work terms, service levels, payment milestones, and limitation of liability.",
        "schema": {
            "fields": [
                {"name": "service_description", "label": "Services Provided", "type": "textarea", "required": True, "placeholder": "e.g. Managed Cloud Infrastructure and IT Support"},
                {"name": "billing_cycle", "label": "Billing Cycle", "type": "select", "required": True, "options": ["Monthly Retainer", "Quarterly", "Annual", "Net-30 upon invoice"]},
                {"name": "service_fee", "label": "Service Fee", "type": "currency", "required": True, "placeholder": "e.g. $4,000 / month"},
                {"name": "sla_uptime", "label": "Target SLA Uptime (%)", "type": "text", "required": False, "placeholder": "e.g. 99.9%"},
                {"name": "liability_cap", "label": "Limitation of Liability Cap", "type": "text", "required": False, "placeholder": "e.g. Total fees paid in previous 12 months"}
            ]
        }
    },
    {
        "name": "Consulting Agreement",
        "description": "Advisory and consulting engagement defining advisory scope, retainer, non-compete/non-solicit parameters, and work product rights.",
        "category": "Business",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft an executive Consulting Agreement covering advisory scope, confidential disclosures, and indemnification.",
        "schema": {
            "fields": [
                {"name": "consulting_area", "label": "Advisory Domain / Expertise", "type": "text", "required": True, "placeholder": "e.g. Strategic Corporate Finance & M&A"},
                {"name": "time_commitment", "label": "Expected Hours / Days per Month", "type": "text", "required": False, "placeholder": "e.g. 20 hours per month"},
                {"name": "retainer_fee", "label": "Monthly Retainer / Hourly Rate", "type": "currency", "required": True, "placeholder": "e.g. $7,500 / month"},
                {"name": "term_months", "label": "Engagement Length (Months)", "type": "number", "required": True, "placeholder": "e.g. 6"},
                {"name": "expense_reimbursement", "label": "Travel & Expense Reimbursement", "type": "select", "required": False, "options": ["Pre-approved business expenses reimbursed", "All inclusive in retainer"]}
            ]
        }
    },
    {
        "name": "Employment Offer Letter",
        "description": "Formal offer letter welcoming a prospective employee, setting out starting wage, title, benefits, and at-will notice.",
        "category": "Employment",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a welcoming yet legally sound formal employment offer letter.",
        "schema": {
            "fields": [
                {"name": "candidate_name", "label": "Candidate Name", "type": "text", "required": True, "placeholder": "Jane Doe"},
                {"name": "job_title", "label": "Position Offered", "type": "text", "required": True, "placeholder": "Product Manager"},
                {"name": "starting_salary", "label": "Base Salary", "type": "currency", "required": True, "placeholder": "e.g. $110,000"},
                {"name": "equity_grant", "label": "Stock Option / Equity Grant", "type": "text", "required": False, "placeholder": "e.g. 10,000 incentive stock options (4-year vesting, 1-year cliff)"},
                {"name": "start_date", "label": "Proposed Start Date", "type": "date", "required": True},
                {"name": "offer_expiry", "label": "Offer Expiration Date", "type": "date", "required": True}
            ]
        }
    },
    {
        "name": "Partnership Agreement",
        "description": "General or limited partnership contract specifying capital contributions, profit sharing ratios, management voting, and buyout terms.",
        "category": "Business",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a formal Partnership Agreement detailing capital contributions, profit allocation, voting thresholds, and dissolution.",
        "schema": {
            "fields": [
                {"name": "partnership_name", "label": "Partnership Firm Name", "type": "text", "required": True, "placeholder": "e.g. Apex Strategic Partners"},
                {"name": "business_purpose", "label": "Business Purpose", "type": "textarea", "required": True, "placeholder": "e.g. Commercial real estate acquisition and asset management"},
                {"name": "capital_contributions", "label": "Initial Capital Contributions", "type": "textarea", "required": True, "placeholder": "e.g. Partner A: $50,000 (50%); Partner B: $50,000 (50%)"},
                {"name": "profit_sharing", "label": "Profit & Loss Distribution", "type": "text", "required": True, "placeholder": "e.g. Equal 50/50 after expenses"},
                {"name": "voting_threshold", "label": "Major Decisions Approval", "type": "select", "required": True, "options": ["Unanimous Consent", "Majority (over 50%)", "Super-majority (75%)"]}
            ]
        }
    },
    {
        "name": "Business Agreement",
        "description": "General bilateral commercial agreement for co-marketing, joint ventures, or vendor transactions.",
        "category": "Business",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a standard commercial business agreement protecting mutual business interests and specifying performance standards.",
        "schema": {
            "fields": [
                {"name": "business_deal_summary", "label": "Transaction / Partnership Scope", "type": "textarea", "required": True, "placeholder": "Describe what each business is providing and receiving"},
                {"name": "financial_terms", "label": "Payment or Consideration", "type": "textarea", "required": True, "placeholder": "e.g. Fee schedules or revenue sharing breakdown"},
                {"name": "effective_term", "label": "Agreement Duration", "type": "text", "required": True, "placeholder": "e.g. 1 Year with automatic renewal"}
            ]
        }
    },
    {
        "name": "Internship Agreement",
        "description": "Educational or paid internship agreement outlining mentorship expectations, stipend, intellectual property, and academic credit.",
        "category": "Employment",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft an Internship Agreement complying with educational internship guidelines and company confidentiality.",
        "schema": {
            "fields": [
                {"name": "department", "label": "Host Department", "type": "text", "required": True, "placeholder": "e.g. Engineering & Design"},
                {"name": "stipend", "label": "Hourly Wage or Monthly Stipend", "type": "currency", "required": True, "placeholder": "e.g. $25/hour or $2,500/month"},
                {"name": "internship_duration", "label": "Internship Dates", "type": "text", "required": True, "placeholder": "e.g. June 1 to August 28, 2026"},
                {"name": "mentor_name", "label": "Designated Mentor / Supervisor", "type": "text", "required": False, "placeholder": "e.g. Lead Architect"}
            ]
        }
    },
    {
        "name": "Contractor Agreement",
        "description": "Independent 1099 contractor agreement establishing non-employee status, tax responsibilities, indemnification, and deliverables.",
        "category": "Employment",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a clear Independent Contractor Agreement ensuring proper worker classification and IP assignment.",
        "schema": {
            "fields": [
                {"name": "contractor_services", "label": "Contractor Scope of Services", "type": "textarea", "required": True, "placeholder": "e.g. Backend API development and DevOps automation"},
                {"name": "compensation_rate", "label": "Compensation Rate", "type": "currency", "required": True, "placeholder": "e.g. $100 / hour"},
                {"name": "invoicing_terms", "label": "Invoicing Terms", "type": "select", "required": True, "options": ["Net 15", "Net 30", "Weekly upon timesheet approval"]}
            ]
        }
    },
    {
        "name": "Terms of Service",
        "description": "Comprehensive Terms of Service (ToS) governing website, mobile application, or SaaS platform usage.",
        "category": "Personal",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a robust online Terms of Service for digital products, including user accounts, acceptable use, liability waivers, and DMCA.",
        "schema": {
            "fields": [
                {"name": "product_name", "label": "Platform / SaaS Name", "type": "text", "required": True, "placeholder": "e.g. LegalEase App"},
                {"name": "company_url", "label": "Website URL", "type": "text", "required": True, "placeholder": "https://example.com"},
                {"name": "subscription_terms", "label": "Subscription / Billing Terms", "type": "select", "required": True, "options": ["Monthly & Annual recurring billing", "Free tier with premium upgrades", "Free service"]},
                {"name": "minimum_age", "label": "Minimum User Age", "type": "select", "required": True, "options": ["13 years", "16 years", "18 years"]}
            ]
        }
    },
    {
        "name": "Privacy Policy Draft",
        "description": "Transparent data collection, GDPR, CCPA, and cookie compliance policy for digital apps, websites, and SaaS.",
        "category": "Personal",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a comprehensive Privacy Policy draft covering data collection, third-party analytics, user rights, and contact officer.",
        "schema": {
            "fields": [
                {"name": "company_name", "label": "Entity Operating the Service", "type": "text", "required": True, "placeholder": "e.g. Acme Cloud Corp"},
                {"name": "data_collected", "label": "Types of Data Collected", "type": "textarea", "required": True, "placeholder": "e.g. Email address, billing address, IP address, usage logs, uploaded documents"},
                {"name": "cookies_used", "label": "Uses Cookies & Analytics", "type": "select", "required": True, "options": ["Yes (Essential, analytics, and functional cookies)", "No"]},
                {"name": "dpo_contact", "label": "Privacy Officer Email", "type": "text", "required": True, "placeholder": "privacy@example.com"}
            ]
        }
    },
    {
        "name": "Memorandum of Understanding (MOU)",
        "description": "Preliminary framework agreement outlining intended collaboration, objectives, and conditions prior to a definitive contract.",
        "category": "General",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a formal Memorandum of Understanding expressing cooperative intent while maintaining clear non-binding and binding boundaries.",
        "schema": {
            "fields": [
                {"name": "initiative_title", "label": "Collaborative Initiative", "type": "text", "required": True, "placeholder": "e.g. Joint Clean Energy Feasibility Project"},
                {"name": "key_goals", "label": "Primary Goals & Objectives", "type": "textarea", "required": True, "placeholder": "Describe what the parties mutually seek to investigate or achieve"},
                {"name": "binding_status", "label": "Legal Status", "type": "select", "required": True, "options": ["Non-binding except for confidentiality and governing law", "Fully binding"]}
            ]
        }
    },
    {
        "name": "General Agreement",
        "description": "Versatile all-purpose legal contract adaptable for settlements, asset purchases, transfers, or custom arrangements.",
        "category": "General",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft an adaptable General Commercial Agreement establishing rights, obligations, dispute mechanisms, and execution clauses.",
        "schema": {
            "fields": [
                {"name": "subject_matter", "label": "Core Subject Matter", "type": "textarea", "required": True, "placeholder": "Explain the core transaction or agreement in detail"},
                {"name": "consideration", "label": "Consideration / Exchange", "type": "text", "required": True, "placeholder": "e.g. Mutual covenants and the payment of $1.00 and other good value"},
                {"name": "special_covenants", "label": "Special Covenants or Restrictions", "type": "textarea", "required": False, "placeholder": "Any specific restrictions or promises"}
            ]
        }
    },
    {
        "name": "Custom Document",
        "description": "Completely tailor-made legal document drafted specifically according to your unique instructions and requirements.",
        "category": "General",
        "jurisdiction": "General / Multi-jurisdiction",
        "prompt_template": "Draft a custom legal document fulfilling all specific user guidelines with high professional legal rigor.",
        "schema": {
            "fields": [
                {"name": "custom_purpose", "label": "Purpose and Structure of Document", "type": "textarea", "required": True, "placeholder": "Describe what kind of document you need, what it must accomplish, and key clauses to include"},
                {"name": "key_terms", "label": "Key Terms & Parameters", "type": "textarea", "required": False, "placeholder": "Any numbers, dates, requirements, or milestones"}
            ]
        }
    }
]


class TemplateService:
    @staticmethod
    def seed_templates(db: Session):
        """Seeds the 17 default production legal templates into the database if not present."""
        for t_data in DEFAULT_TEMPLATES:
            existing = db.query(Template).filter(Template.name == t_data["name"]).first()
            if not existing:
                template = Template(
                    id=uuid.uuid4(),
                    name=t_data["name"],
                    description=t_data["description"],
                    category=t_data["category"],
                    jurisdiction=t_data.get("jurisdiction", "General"),
                    schema=t_data["schema"],
                    prompt_template=t_data["prompt_template"],
                    is_active=True
                )
                db.add(template)
        db.commit()

    @staticmethod
    def list_templates(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[Template]:
        query = db.query(Template).filter(Template.is_active == True)
        if category and category.lower() != "all":
            query = query.filter(Template.category.ilike(category))
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                (Template.name.ilike(term)) | (Template.description.ilike(term))
            )
        return query.order_by(Template.name.asc()).all()

    @staticmethod
    def get_template_by_id(db: Session, template_id: uuid.UUID) -> Optional[Template]:
        return db.query(Template).filter(Template.id == template_id, Template.is_active == True).first()

    @staticmethod
    def get_template_by_name(db: Session, name: str) -> Optional[Template]:
        return db.query(Template).filter(Template.name.ilike(name), Template.is_active == True).first()
