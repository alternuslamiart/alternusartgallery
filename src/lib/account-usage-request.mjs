/**
 * @param {number} days
 * @param {{ signal?: AbortSignal, timeoutMs?: number, fetchImpl?: typeof fetch }} [options]
 */
export async function loadAccountUsage(days, { signal, timeoutMs = 15_000, fetchImpl = fetch } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort(signal?.reason);
  if (signal?.aborted) cancel();
  else signal?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetchImpl(`/api/usage?days=${days}`, { cache: "no-store", signal: controller.signal });
    const body = await response.json();
    if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : body.error?.message || "Usage could not be loaded.");
    return body;
  } catch (error) {
    if (timedOut) throw new Error("Usage is taking too long to load. Please retry.");
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", cancel); }
}
