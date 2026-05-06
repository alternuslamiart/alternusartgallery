import assert from "node:assert/strict";
import test from "node:test";

const unsafePattern = /[<>:"/\\|?*\u0000-\u001F]/g;
const unsafeExtensions = new Set(["exe", "sh", "bat", "cmd", "php", "py", "rb", "jar", "dll"]);

function sanitizeName(name) {
  return name.replace(unsafePattern, " ").replace(/\s+/g, " ").trim();
}

function assertSafePath(path) {
  if (!path || path.length > 260 || path.includes("..") || path.startsWith("/") || /^[a-zA-Z]:/.test(path)) {
    throw new Error("Path is not safe.");
  }
}

function detectType(filename, mimeType) {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  if (unsafeExtensions.has(extension)) throw new Error("Executable or server-side file uploads are not allowed.");
  if (mimeType.startsWith("image/")) return extension === "svg" || mimeType === "image/svg+xml" ? "VECTOR" : "IMAGE";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  return { pdf: "DOCUMENT", glb: "MODEL", obj: "MODEL", zip: "EXPORT", md: "DOCUMENT" }[extension] ?? "UNKNOWN";
}

test("sanitizeName removes unsafe filename characters", () => {
  assert.equal(sanitizeName('../bad:"name".png'), ".. bad name .png");
});

test("assertSafePath rejects traversal and absolute paths", () => {
  assert.throws(() => assertSafePath("../secret.txt"));
  assert.throws(() => assertSafePath("/secret.txt"));
  assert.throws(() => assertSafePath("C:\\secret.txt"));
  assert.doesNotThrow(() => assertSafePath("src/app/page.tsx"));
});

test("detectType rejects executable uploads", () => {
  assert.throws(() => detectType("deploy.sh", "text/x-shellscript"));
  assert.equal(detectType("hero.png", "image/png"), "IMAGE");
  assert.equal(detectType("scene.glb", "model/gltf-binary"), "MODEL");
});
