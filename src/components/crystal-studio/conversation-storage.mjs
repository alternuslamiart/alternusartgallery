/** Browser-session recovery only; authenticated /aichat storage remains server-owned. */
export function parseStudioConversation(raw) {
  if (!raw || raw.length > 1_000_000) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.messages) || value.messages.length > 200) return null;
    const ids = new Set();
    for (const message of value.messages) {
      if (!message || typeof message.id !== "string" || !message.id || message.id.length > 100 || ids.has(message.id) ||
        !["user", "assistant", "system"].includes(message.role) || typeof message.text !== "string" || message.text.length > 20_000 ||
        (message.meta !== undefined && (typeof message.meta !== "string" || message.meta.length > 1000)) ||
        (message.assetJobId !== undefined && (typeof message.assetJobId !== 'string' || !/^[0-9a-f-]{36}$/i.test(message.assetJobId))) ||
        (message.timestamp !== undefined && (typeof message.timestamp !== "string" || message.timestamp.length > 100))) return null;
      ids.add(message.id);
    }
    return { messages: value.messages, open: value.open !== false, expanded: value.expanded === true };
  } catch { return null; }
}

/** Keep the newest recoverable history within the reader's size limit. */
export function serializeStudioConversation({ messages, open, expanded }) {
  const recent = [];
  let size = JSON.stringify({ version: 1, messages: [], open, expanded }).length;
  for (const message of messages.slice(-200).reverse()) {
    const length = JSON.stringify(message).length + (recent.length ? 1 : 0);
    if (size + length > 1_000_000) break;
    size += length;
    recent.unshift(message);
  }
  const raw = JSON.stringify({ version: 1, messages: recent, open, expanded });
  return parseStudioConversation(raw) ? raw : null;
}
