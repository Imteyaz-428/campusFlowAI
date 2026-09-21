-- ================================================================
-- CampusFlow AI
-- Migration 004
-- Student Document Verification
-- ================================================================

CREATE TABLE IF NOT EXISTS student_documents (
    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,
    organization_id INTEGER NOT NULL,

    document_type VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER,

    file_path VARCHAR(500) NOT NULL,

    file_hash VARCHAR(64),

    verification_status VARCHAR(50) NOT NULL DEFAULT 'uploaded',

    extracted_data JSON,
    extracted_text TEXT,

    verification_reason VARCHAR(1000),

    verified_by_user_id INTEGER,

    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    verified_at TIMESTAMP,

    CONSTRAINT fk_student_documents_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_student_documents_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_student_documents_verified_by
        FOREIGN KEY (verified_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- ================================================================
-- INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS ix_student_documents_student_id
    ON student_documents(student_id);

CREATE INDEX IF NOT EXISTS ix_student_documents_organization_id
    ON student_documents(organization_id);

CREATE INDEX IF NOT EXISTS ix_student_documents_document_type
    ON student_documents(document_type);

CREATE INDEX IF NOT EXISTS ix_student_documents_verification_status
    ON student_documents(verification_status);

CREATE INDEX IF NOT EXISTS ix_student_documents_file_hash
    ON student_documents(file_hash);

CREATE INDEX IF NOT EXISTS ix_student_documents_verified_by_user_id
    ON student_documents(verified_by_user_id);