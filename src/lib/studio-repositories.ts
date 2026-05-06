export type PrototypeQuality = "wireframe" | "high-fidelity";
export type PrototypeType = "website" | "mobile-app" | "design-system";
export type PrototypeStatus = "Draft" | "Ready" | "Archived";
export type PrototypeVisibility = "private" | "workspace";
export type PrototypeOrigin = "seed" | "user";

export type DesignSystemSettings = {
  colorPreset: "Sky / Paper / Graphite" | "Ocean / Paper / Ink" | "Mono / Cloud / Graphite";
  typographyPreset: "Clean UI scale" | "Editorial scale" | "Compact product scale";
  spacingPreset: "8px rhythm" | "6px compact rhythm" | "12px spacious rhythm";
};

export type PrototypeItem = {
  id: string;
  name: string;
  type: PrototypeType;
  quality: PrototypeQuality;
  createdAt: string;
  updatedAt: string;
  status: PrototypeStatus;
  visibility: PrototypeVisibility;
  brief: string;
  tags: string[];
  designSystem: DesignSystemSettings;
  origin: PrototypeOrigin;
};

export type AssetType =
  | "image"
  | "vector"
  | "model"
  | "document"
  | "texture"
  | "reference"
  | "export"
  | "audio";

export type StudioAsset = {
  id: string;
  name: string;
  type: AssetType;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  previewUrl?: string;
  tags: string[];
  source: "local";
  status: "Ready";
};

const PROTOTYPES_KEY = "alternus-design-prototypes";
const ASSETS_KEY = "alternus-asset-library";

export const defaultDesignSystem: DesignSystemSettings = {
  colorPreset: "Sky / Paper / Graphite",
  typographyPreset: "Clean UI scale",
  spacingPreset: "8px rhythm",
};

const seededPrototypes: PrototypeItem[] = [
  {
    id: "seed-gallery-checkout-redesign",
    name: "Gallery checkout redesign",
    type: "website",
    quality: "high-fidelity",
    createdAt: "2026-05-06T08:30:00.000Z",
    updatedAt: "2026-05-06T08:30:00.000Z",
    status: "Ready",
    visibility: "private",
    brief: "Redesign the gallery checkout with a cleaner buyer flow, responsive summary, and reusable checkout components.",
    tags: ["Responsive", "Components", "Prototype flow"],
    designSystem: defaultDesignSystem,
    origin: "seed",
  },
  {
    id: "seed-collector-mobile-app",
    name: "Collector mobile app",
    type: "mobile-app",
    quality: "high-fidelity",
    createdAt: "2026-05-05T10:15:00.000Z",
    updatedAt: "2026-05-05T10:15:00.000Z",
    status: "Draft",
    visibility: "private",
    brief: "A mobile collection tracker for saved artworks, artist notes, and quick inquiry actions.",
    tags: ["Responsive", "Prototype flow"],
    designSystem: defaultDesignSystem,
    origin: "seed",
  },
  {
    id: "seed-artist-dashboard-system",
    name: "Artist dashboard system",
    type: "design-system",
    quality: "wireframe",
    createdAt: "2026-05-04T13:00:00.000Z",
    updatedAt: "2026-05-04T13:00:00.000Z",
    status: "Ready",
    visibility: "private",
    brief: "A dashboard-oriented UI system for artist inventory, messages, analytics, and publishing workflows.",
    tags: ["Design tokens", "Components"],
    designSystem: defaultDesignSystem,
    origin: "seed",
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const prototypeRepository = {
  list(): PrototypeItem[] {
    return readJson<PrototypeItem[]>(PROTOTYPES_KEY, seededPrototypes);
  },

  saveAll(items: PrototypeItem[]) {
    writeJson(PROTOTYPES_KEY, items);
  },

  create(input: {
    name: string;
    type: Exclude<PrototypeType, "design-system">;
    quality: PrototypeQuality;
    brief: string;
    tags: string[];
    designSystem: DesignSystemSettings;
  }): PrototypeItem {
    const now = new Date().toISOString();
    return {
      id: generateId("prototype"),
      name: input.name,
      type: input.type,
      quality: input.quality,
      createdAt: now,
      updatedAt: now,
      status: "Draft",
      visibility: "private",
      brief: input.brief,
      tags: input.tags,
      designSystem: input.designSystem,
      origin: "user",
    };
  },

  duplicate(item: PrototypeItem): PrototypeItem {
    const now = new Date().toISOString();
    return {
      ...item,
      id: generateId("prototype"),
      name: `${item.name} copy`,
      createdAt: now,
      updatedAt: now,
      status: "Draft",
      origin: "user",
    };
  },
};

export const assetRepository = {
  list(): StudioAsset[] {
    return readJson<StudioAsset[]>(ASSETS_KEY, []);
  },

  saveAll(items: StudioAsset[]) {
    const persisted = items.map((asset) => ({
      ...asset,
      // Blob object URLs only work for the active browser session. Real binary
      // persistence needs backend storage.
      previewUrl: asset.previewUrl?.startsWith("blob:") ? undefined : asset.previewUrl,
    }));
    writeJson(ASSETS_KEY, persisted);
  },

  fromFile(file: File, type: AssetType, previewUrl?: string): StudioAsset {
    const now = new Date().toISOString();
    return {
      id: generateId("asset"),
      name: file.name.replace(/\.[^.]+$/, "") || file.name,
      type,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      createdAt: now,
      updatedAt: now,
      previewUrl,
      tags: [],
      source: "local",
      status: "Ready",
    };
  },
};

export function detectAssetType(file: File): AssetType | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type.toLowerCase();

  if (mime.startsWith("image/")) {
    if (["svg", "ai", "eps"].includes(extension) || mime.includes("svg")) return "vector";
    if (["psd", "tif", "tiff", "webp", "png", "jpg", "jpeg", "gif"].includes(extension)) return "image";
    return "reference";
  }
  if (mime.startsWith("audio/")) return "audio";
  if (mime.includes("pdf") || mime.includes("word") || mime.includes("text") || ["doc", "docx", "pdf", "txt", "md"].includes(extension)) return "document";
  if (["svg", "ai", "eps"].includes(extension)) return "vector";
  if (["glb", "gltf", "obj", "fbx", "blend", "stl", "dae"].includes(extension)) return "model";
  if (["exr", "hdr", "ktx", "dds"].includes(extension)) return "texture";
  if (["zip", "rar", "7z", "tar"].includes(extension)) return "export";
  if (["dwg", "dxf", "skp"].includes(extension)) return "reference";
  return null;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(1)} KB`;
  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(1)} MB`;
}
