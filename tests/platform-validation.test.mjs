import assert from "node:assert/strict";
import test from "node:test";

const unsafePattern = /[<>:"/\\|?*\u0000-\u001F]/g;
const unsafeExtensions = new Set([
  "exe", "dll", "com", "scr", "bat", "cmd", "ps1", "psm1", "psd1", "sh", "bash", "zsh", "ksh",
  "php", "php3", "php4", "php5", "phtml", "py", "pyw", "rb", "pl", "jsp", "asp", "aspx", "jar",
  "vbs", "js", "mjs", "cjs", "ts", "tsx", "jsx", "html", "htm", "xhtml", "css", "scss", "sass", "less",
]);

function sanitizeName(name) {
  const cleaned = name.replace(unsafePattern, " ").replace(/\s+/g, " ").trim();
  return cleaned.replace(/^\.+$/, "").replace(/\.+$/g, "").trim();
}

function assertSafePath(path) {
  const candidate = typeof path === "string" ? path.trim() : "";
  if (!candidate || candidate.length > 260 || candidate.includes("..") || candidate.includes("\\") || candidate.includes(":") || candidate.startsWith("/") || candidate.startsWith("./") || candidate.startsWith("../") || candidate === "." || /^[a-zA-Z]:/.test(candidate)) {
    throw new Error("Path is not safe.");
  }
  if (candidate.includes("//")) {
    throw new Error("Path is not safe.");
  }
}

function detectType(filename, mimeType) {
  const extension = filename.split(".").pop()?.toLowerCase().replace(/[?#].*$/, "") ?? "";
  if (unsafeExtensions.has(extension)) throw new Error("Executable or server-side file uploads are not allowed.");
  if (mimeType.startsWith("image/")) return extension === "svg" || mimeType === "image/svg+xml" ? "VECTOR" : "IMAGE";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  return { pdf: "DOCUMENT", glb: "MODEL", obj: "MODEL", zip: "EXPORT", md: "DOCUMENT" }[extension] ?? "UNKNOWN";
}

test("sanitizeName removes unsafe filename characters", () => {
  assert.equal(sanitizeName('../bad:"name".png'), ".. bad name .png");
  assert.equal(sanitizeName('evil\\script.js'), "evil script.js");
});

test("assertSafePath rejects traversal and absolute paths", () => {
  assert.throws(() => assertSafePath("../secret.txt"));
  assert.throws(() => assertSafePath("/secret.txt"));
  assert.throws(() => assertSafePath("C:\\secret.txt"));
  assert.throws(() => assertSafePath("src\\app\\page.tsx"));
  assert.doesNotThrow(() => assertSafePath("src/app/page.tsx"));
});

test("detectType rejects executable uploads", () => {
  assert.throws(() => detectType("deploy.sh", "text/x-shellscript"));
  assert.throws(() => detectType("cron.ps1", "application/x-powershell"));
  assert.throws(() => detectType("exploit.js", "application/javascript"));
  assert.equal(detectType("hero.png", "image/png"), "IMAGE");
  assert.equal(detectType("scene.glb", "model/gltf-binary"), "MODEL");
});
