import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

test("AI chat records persist complete messages and remain isolated and idempotent per user", {
  skip: !process.env.DATABASE_URL,
}, async () => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const suffix = randomUUID();
  const userIds = [];

  try {
    const owner = await prisma.user.create({
      data: { email: `chat-owner-${suffix}@example.test` },
      select: { id: true },
    });
    userIds.push(owner.id);
    const otherUser = await prisma.user.create({
      data: { email: `chat-other-${suffix}@example.test` },
      select: { id: true },
    });
    userIds.push(otherUser.id);

    const conversation = await prisma.aIChatConversation.create({
      data: { userId: owner.id },
    });
    const requestId = randomUUID();
    const multilinePrompt = "Keep all lines.\n\n```js\nconst answer = 42;\n```";
    await prisma.aIChatMessage.upsert({
      where: {
        conversationId_requestId_role: {
          conversationId: conversation.id,
          requestId,
          role: "USER",
        },
      },
      create: {
        conversationId: conversation.id,
        userId: owner.id,
        requestId,
        role: "USER",
        content: multilinePrompt,
      },
      update: {},
    });
    await prisma.aIChatMessage.upsert({
      where: {
        conversationId_requestId_role: {
          conversationId: conversation.id,
          requestId,
          role: "USER",
        },
      },
      create: {
        conversationId: conversation.id,
        userId: owner.id,
        requestId,
        role: "USER",
        content: "This duplicate must not replace the original.",
      },
      update: {},
    });
    await prisma.aIChatMessage.create({
      data: {
        conversationId: conversation.id,
        userId: owner.id,
        requestId,
        role: "ASSISTANT",
        content: "Complete assistant response.",
        status: "COMPLETED",
        model: "test-model",
      },
    });

    const restored = await prisma.aIChatConversation.findFirst({
      where: { id: conversation.id, userId: owner.id },
      include: { messages: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } },
    });
    assert.ok(restored);
    assert.equal(restored.messages.length, 2);
    assert.equal(restored.messages.find((message) => message.role === "USER").content, multilinePrompt);
    assert.equal(restored.messages.find((message) => message.role === "ASSISTANT").content, "Complete assistant response.");
    assert.equal(await prisma.aIChatConversation.findFirst({
      where: { id: conversation.id, userId: otherUser.id },
    }), null);
    const unauthorizedUpdate = await prisma.aIChatConversation.updateMany({
      where: { id: conversation.id, userId: otherUser.id },
      data: { title: "Unauthorized" },
    });
    assert.equal(unauthorizedUpdate.count, 0);

    const nextRequestId = randomUUID();
    await prisma.aIChatMessage.create({
      data: {
        conversationId: conversation.id,
        userId: owner.id,
        requestId: nextRequestId,
        role: "USER",
        content: "Append to the existing conversation.",
      },
    });
    await prisma.aIChatMessage.create({
      data: {
        conversationId: conversation.id,
        userId: owner.id,
        requestId: nextRequestId,
        role: "ASSISTANT",
        content: "Second response.",
        status: "COMPLETED",
      },
    });

    const failedRequestId = randomUUID();
    await prisma.aIChatMessage.create({
      data: {
        conversationId: conversation.id,
        userId: owner.id,
        requestId: failedRequestId,
        role: "USER",
        content: "Keep this message when generation fails.",
      },
    });
    await prisma.aIChatMessage.create({
      data: {
        conversationId: conversation.id,
        userId: owner.id,
        requestId: failedRequestId,
        role: "ASSISTANT",
        content: "",
        status: "FAILED",
      },
    });
    assert.equal(await prisma.aIChatMessage.count({
      where: { conversationId: conversation.id, userId: owner.id, requestId: failedRequestId, role: "USER" },
    }), 1);
    assert.equal(await prisma.aIChatMessage.count({
      where: { conversationId: conversation.id, userId: owner.id },
    }), 6);

    const deleted = await prisma.aIChatConversation.deleteMany({
      where: { id: conversation.id, userId: owner.id },
    });
    assert.equal(deleted.count, 1);
    assert.equal(await prisma.aIChatMessage.count({ where: { conversationId: conversation.id } }), 0);
  } finally {
    if (userIds.length) await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  }
});
