export async function shareConversation(conversation, platform = navigator) {
  const text = `${conversation.title}\n\n${conversation.messages.map(message => `${message.role === "user" ? "You" : "Casynus"}: ${message.content}${message.citations?.length ? `\nSources: ${message.citations.map(citation => citation.source).join("\n")}` : ""}`).join("\n\n")}`;
  if (platform.share) {
    await platform.share({ title: conversation.title, text });
    return "shared";
  }
  if (!platform.clipboard?.writeText) throw new Error("Sharing is unavailable in this browser. Open Casynus over HTTPS and try again.");
  await platform.clipboard.writeText(text);
  return "copied";
}
