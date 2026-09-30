"""Initial database schema for LegalEase

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-30

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from backend.app.database import GUID

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Documents table
    op.create_table(
        'documents',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('document_type', sa.String(length=100), nullable=False),
        sa.Column('jurisdiction', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('current_version_id', GUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_user_id'), 'documents', ['user_id'], unique=False)

    # Document versions table
    op.create_table(
        'document_versions',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('document_id', GUID(), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('content', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', GUID(), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_versions_document_id'), 'document_versions', ['document_id'], unique=False)

    # Templates table
    op.create_table(
        'templates',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('jurisdiction', sa.String(length=100), nullable=True),
        sa.Column('schema', sa.JSON(), nullable=False),
        sa.Column('prompt_template', sa.Text(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_templates_name'), 'templates', ['name'], unique=True)
    op.create_index(op.f('ix_templates_category'), 'templates', ['category'], unique=False)

    # Uploaded documents table
    op.create_table(
        'uploaded_documents',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=20), nullable=False),
        sa.Column('storage_reference', sa.String(length=500), nullable=False),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_uploaded_documents_user_id'), 'uploaded_documents', ['user_id'], unique=False)

    # Analysis results table
    op.create_table(
        'analysis_results',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('document_id', GUID(), nullable=True),
        sa.Column('uploaded_document_id', GUID(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('key_clauses', sa.JSON(), nullable=False),
        sa.Column('risks', sa.JSON(), nullable=False),
        sa.Column('missing_information', sa.JSON(), nullable=False),
        sa.Column('questions_to_review', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_document_id'], ['uploaded_documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Generation requests table
    op.create_table(
        'generation_requests',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('document_id', GUID(), nullable=True),
        sa.Column('document_type', sa.String(length=100), nullable=False),
        sa.Column('input_data', sa.JSON(), nullable=False),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('generation_requests')
    op.drop_table('analysis_results')
    op.drop_table('uploaded_documents')
    op.drop_table('templates')
    op.drop_table('document_versions')
    op.drop_table('documents')
    op.drop_table('users')
