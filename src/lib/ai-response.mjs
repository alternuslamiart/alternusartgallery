// Persistence is optional for a generated answer. Never claim it was saved
// when storage is unavailable, and never retry a paid provider call to save it.
export async function persistAIResponse(save) {
  try {
    await save();
    return { saved: true };
  } catch {
    return { saved: false, warning: "The answer is available, but this conversation could not be saved to your workspace." };
  }
}
