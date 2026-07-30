-- Add new columns to sds_documents for enterprise features
ALTER TABLE sds_documents
ADD COLUMN IF NOT EXISTS publication_status VARCHAR(50) DEFAULT 'not_published',
ADD COLUMN IF NOT EXISTS validation_status VARCHAR(50) DEFAULT 'not_validated',
ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS review_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS issue_counts JSONB DEFAULT '{"critical": 0, "major": 0, "minor": 0, "info": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS source_quality JSONB DEFAULT '{"missingSourceCount": 0, "lowConfidenceFieldCount": 0, "unverifiedAiFieldCount": 0}'::jsonb;

-- Create indexes for new commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_sds_publication_status ON sds_documents(publication_status);
CREATE INDEX IF NOT EXISTS idx_sds_lifecycle_status ON sds_documents(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_sds_validation_status ON sds_documents(validation_status);
CREATE INDEX IF NOT EXISTS idx_sds_owner_id ON sds_documents(owner_id);

-- Create table for saved views
CREATE TABLE IF NOT EXISTS sds_saved_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    visibility VARCHAR(50) DEFAULT 'private', -- 'private' or 'company'
    filter_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_definition JSONB DEFAULT '{"column": "updated_at", "direction": "desc"}'::jsonb,
    column_configuration JSONB DEFAULT '[]'::jsonb,
    view_mode VARCHAR(20) DEFAULT 'table',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying saved views by user
CREATE INDEX IF NOT EXISTS idx_sds_saved_views_user ON sds_saved_views(user_id);
