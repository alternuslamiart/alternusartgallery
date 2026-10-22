-- Apply to PostgreSQL before deploying the new application. Existing values remain valid.
ALTER TYPE "WorkspacePlan" ADD VALUE IF NOT EXISTS 'BASIC';
ALTER TYPE "WorkspacePlan" ADD VALUE IF NOT EXISTS 'STUDIO';
