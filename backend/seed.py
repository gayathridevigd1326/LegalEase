import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import engine, Base, SessionLocal
from backend.app.services.template_service import TemplateService
from backend.app.models.user import User
from backend.app.security.auth_handler import get_password_hash
import uuid


def run_seed():
    print("Creating tables if not present...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding legal templates...")
        TemplateService.seed_templates(db)
        print("Templates seeded successfully.")

        # Seed demo user
        demo_email = "demo@legalease.app"
        existing = db.query(User).filter(User.email == demo_email).first()
        if not existing:
            demo_user = User(
                id=uuid.uuid4(),
                email=demo_email,
                password_hash=get_password_hash("password123"),
                full_name="Demo User",
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            print(f"Created demo user: {demo_email} (password: password123)")
        else:
            existing.full_name = "Demo User"
            db.commit()
            print(f"Demo user updated: {demo_email}")

        print("Database seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
