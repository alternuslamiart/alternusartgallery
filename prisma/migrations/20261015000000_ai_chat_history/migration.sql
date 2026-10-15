BEGIN;

CREATE TYPE "AIChatMessageRole" AS ENUM ('USER', 'ASSISTANT');
CREATE TYPE "AIChatMessageStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

CREATE TABLE "ai_chat_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "legacy_id" TEXT,
    "title" VARCHAR(80) NOT NULL DEFAULT 'New Chat',
    "model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_chat_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "role" "AIChatMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "status" "AIChatMessageStatus" NOT NULL DEFAULT 'COMPLETED',
    "model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_chat_conversations_user_id_last_message_at_idx"
    ON "ai_chat_conversations"("user_id", "last_message_at" DESC);
CREATE INDEX "ai_chat_conversations_user_id_updated_at_idx"
    ON "ai_chat_conversations"("user_id", "updated_at" DESC);
CREATE UNIQUE INDEX "ai_chat_conversations_user_id_legacy_id_key"
    ON "ai_chat_conversations"("user_id", "legacy_id");
CREATE UNIQUE INDEX "ai_chat_messages_conversation_id_request_id_role_key"
    ON "ai_chat_messages"("conversation_id", "request_id", "role");
CREATE INDEX "ai_chat_messages_user_id_conversation_id_created_at_idx"
    ON "ai_chat_messages"("user_id", "conversation_id", "created_at");

ALTER TABLE "ai_chat_conversations"
    ADD CONSTRAINT "ai_chat_conversations_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_chat_messages"
    ADD CONSTRAINT "ai_chat_messages_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "ai_chat_conversations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_chat_messages"
    ADD CONSTRAINT "ai_chat_messages_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
