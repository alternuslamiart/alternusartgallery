import { createHash, randomUUID } from "crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import { AssetType } from "@prisma/client";
import { sanitizeName, ValidationError } from "./validation";

const unsafeExtensions = new Set(["exe", "sh", "bat", "cmd", "php", "py", "rb", "jar", "dll"]);
const extensionTypeMap: Record<string, AssetType> = {
  jpg: "IMAGE",
  jpeg: "IMAGE",
  png: "IMAGE",
  webp: "IMAGE",
  gif: "IMAGE",
  svg: "VECTOR",
  ai: "VECTOR",
  eps: "VECTOR",
  pdf: "DOCUMENT",
  glb: "MODEL",
  gltf: "MODEL",
  obj: "MODEL",
  fbx: "MODEL",
  blend: "MODEL",
  doc: "DOCUMENT",
  docx: "DOCUMENT",
  txt: "DOCUMENT",
  md: "DOCUMENT",
  tiff: "TEXTURE",
  exr: "TEXTURE",
  zip: "EXPORT",
  json: "EXPORT",
  mp3: "AUDIO",
  wav: "AUDIO",
  m4a: "AUDIO",
  ogg: "AUDIO",
};

const safePreviewMimePrefixes = ["image/", "audio/", "text/"];
const safePreviewMimes = new Set(["application/pdf", "image/svg+xml"]);

export type StoredFile = {
  storageKey: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  checksum: string;
  type: AssetType;
};

export function getMaxAssetUploadBytes() {
  const mb = Number(process.env.MAX_ASSET_UPLOAD_MB ?? "25");
  return Math.max(1, Math.floor(mb)) * 1024 * 1024;
}

export function getAssetUploadRoot() {
  const configured = process.env.ASSET_UPLOAD_DIR ?? "./storage/assets";
  return path.resolve(process.cwd(), configured);
}

export function detectTypeFromFile(filename: string, mimeType: string): AssetType {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  if (unsafeExtensions.has(extension)) {
    throw new ValidationError("Executable or server-side file uploads are not allowed.", { extension });
  }
  if (mimeType.startsWith("image/")) {
    if (extension === "svg" || mimeType === "image/svg+xml") return "VECTOR";
    return "IMAGE";
  }
  if (mimeType.startsWith("audio/")) return "AUDIO";
  return extensionTypeMap[extension] ?? "UNKNOWN";
}

export function assertSupportedAsset(filename: string, mimeType: string) {
  const type = detectTypeFromFile(filename, mimeType);
  if (type === "UNKNOWN") {
    throw new ValidationError("Unsupported asset type.", { filename, mimeType });
  }
  return type;
}

export async function storeAssetFile(file: File, workspaceId: string): Promise<StoredFile> {
  const maxBytes = getMaxAssetUploadBytes();
  if (file.size > maxBytes) {
    throw new ValidationError("File is larger than the configured upload limit.", { maxBytes });
  }

  const originalFilename = sanitizeName(file.name || "asset");
  const extension = originalFilename.split(".").pop()?.toLowerCase() ?? "bin";
  const mimeType = file.type || "application/octet-stream";
  const type = assertSupportedAsset(originalFilename, mimeType);
  const bytes = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const storageKey = `${workspaceId}/${new Date().getFullYear()}/${randomUUID()}.${extension}`;
  const root = getAssetUploadRoot();
  const absolutePath = resolveStorageKey(storageKey);

  if (!absolutePath.startsWith(root)) {
    throw new ValidationError("Storage path is not safe.", { storageKey });
  }

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);

  return {
    storageKey,
    filename: `${path.basename(originalFilename, path.extname(originalFilename))}-${Date.now()}.${extension}`,
    originalFilename,
    mimeType,
    extension,
    sizeBytes: bytes.length,
    checksum,
    type,
  };
}

export function resolveStorageKey(storageKey: string) {
  if (!storageKey || storageKey.includes("..") || path.isAbsolute(storageKey)) {
    throw new ValidationError("Storage key is not safe.", { storageKey });
  }
  return path.resolve(getAssetUploadRoot(), storageKey);
}

export async function readStoredFile(storageKey: string) {
  const filePath = resolveStorageKey(storageKey);
  await stat(filePath);
  return readFile(filePath);
}

export async function deleteStoredFile(storageKey: string) {
  try {
    await unlink(resolveStorageKey(storageKey));
  } catch {
    // Metadata delete should not fail just because a local development file is gone.
  }
}

export function canPreviewInline(mimeType: string) {
  return safePreviewMimePrefixes.some((prefix) => mimeType.startsWith(prefix)) || safePreviewMimes.has(mimeType);
}

export function contentDisposition(filename: string, inline = false) {
  const safe = sanitizeName(filename).replace(/"/g, "");
  return `${inline ? "inline" : "attachment"}; filename="${safe || "asset"}"`;
}
