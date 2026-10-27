-- Additive and safe to rerun; apply before deploying the regenerated client.
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS unread BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS project_id TEXT;
