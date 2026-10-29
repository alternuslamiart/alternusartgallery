import * as THREE from "three";

export type ShadingMode = "pbr" | "normal" | "albedo" | "matcap" | "clay";

let matcapTexture: THREE.CanvasTexture | null = null;

function getMatcapTexture(): THREE.CanvasTexture {
  if (matcapTexture) return matcapTexture;
  if (typeof document === "undefined") {
    matcapTexture = new THREE.CanvasTexture({} as HTMLCanvasElement);
    return matcapTexture;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Sculptor red-wax / terracotta clay MatCap sphere
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, 256, 256);

    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.clip();

    // Base body gradient (warm terracotta / reddish wax)
    const baseGrad = ctx.createRadialGradient(108, 98, 10, 128, 128, 126);
    baseGrad.addColorStop(0, "#d87b5a");
    baseGrad.addColorStop(0.45, "#a6492e");
    baseGrad.addColorStop(0.75, "#682517");
    baseGrad.addColorStop(1.0, "#2c0e09");
    ctx.fillStyle = baseGrad;
    ctx.fill();

    // Key specular highlight (top-left)
    const specGrad = ctx.createRadialGradient(90, 80, 2, 90, 80, 50);
    specGrad.addColorStop(0, "rgba(255, 235, 220, 0.75)");
    specGrad.addColorStop(0.3, "rgba(255, 190, 160, 0.35)");
    specGrad.addColorStop(1, "rgba(255, 180, 150, 0)");
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.fill();

    // Rim lighting (bottom-right / cool accent)
    const rimGrad = ctx.createRadialGradient(165, 175, 40, 128, 128, 126);
    rimGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    rimGrad.addColorStop(0.7, "rgba(0, 0, 0, 0)");
    rimGrad.addColorStop(1.0, "rgba(100, 160, 220, 0.45)");
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.fill();
  }
  matcapTexture = new THREE.CanvasTexture(canvas);
  matcapTexture.colorSpace = THREE.SRGBColorSpace;
  return matcapTexture;
}

const normalMaterial = new THREE.MeshNormalMaterial();
let cachedMatcapMaterial: THREE.MeshMatcapMaterial | null = null;
const clayMaterial = new THREE.MeshStandardMaterial({
  color: 0xb5aba0,
  roughness: 0.88,
  metalness: 0.0,
  vertexColors: true,
});

function getMatcapMaterial(): THREE.MeshMatcapMaterial {
  if (!cachedMatcapMaterial) {
    cachedMatcapMaterial = new THREE.MeshMatcapMaterial({
      matcap: getMatcapTexture(),
      color: 0xffffff,
    });
  }
  return cachedMatcapMaterial;
}

/**
 * Traverses a 3D object/hierarchy and applies the given viewport shading mode,
 * preserving original physical materials in userData.__origMaterial.
 */
export function applyShadingMode(root: THREE.Object3D, mode: ShadingMode) {
  root.traverse(child => {
    if (!(child instanceof THREE.Mesh) || child.userData.editorOnly) return;

    // Cache original material
    if (!child.userData.__origMaterial) {
      child.userData.__origMaterial = child.material;
    }
    const orig = child.userData.__origMaterial as THREE.Material | THREE.Material[];

    if (mode === "pbr") {
      child.material = orig;
      return;
    }

    if (mode === "normal") {
      child.material = normalMaterial;
      return;
    }

    if (mode === "matcap") {
      child.material = getMatcapMaterial();
      return;
    }

    if (mode === "albedo") {
      // Pure base color / diffuse without directional shadows
      const first = Array.isArray(orig) ? orig[0] : orig;
      let albedo = child.userData.__albedoMaterial as THREE.MeshBasicMaterial | undefined;
      if (!albedo) {
        albedo = new THREE.MeshBasicMaterial({
          color: (first && "color" in first && first.color instanceof THREE.Color) ? first.color.clone() : 0xcccccc,
          map: (first && "map" in first && first.map instanceof THREE.Texture) ? first.map : null,
          transparent: first && "transparent" in first ? Boolean(first.transparent) : false,
          opacity: first && "opacity" in first && typeof first.opacity === "number" ? first.opacity : 1.0,
        });
        child.userData.__albedoMaterial = albedo;
      } else {
        if (first && "color" in first && first.color instanceof THREE.Color) albedo.color.copy(first.color);
        if (first && "map" in first && first.map instanceof THREE.Texture) albedo.map = first.map;
      }
      child.material = albedo;
      return;
    }

    if (mode === "clay") {
      // Solid clay with procedural cavity / curvature lighting on vertices
      const geom = child.geometry;
      if (geom && !geom.getAttribute("color")) {
        const pos = geom.getAttribute("position");
        const norm = geom.getAttribute("normal");
        if (pos) {
          const colors = new Float32Array(pos.count * 3);
          for (let i = 0; i < pos.count; i++) {
            const ny = norm ? norm.getY(i) : 0;
            const nx = norm ? norm.getX(i) : 0;
            const nz = norm ? norm.getZ(i) : 0;
            // Upward faces catch ambient sky light; crevices / downward faces stay deep warm grey
            const ambient = 0.55 + ny * 0.25 + Math.abs(nx + nz) * 0.1;
            const factor = Math.max(0.35, Math.min(1.15, ambient));
            colors[i * 3] = Math.min(1, 0.72 * factor);
            colors[i * 3 + 1] = Math.min(1, 0.68 * factor);
            colors[i * 3 + 2] = Math.min(1, 0.63 * factor);
          }
          geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        }
      }
      child.material = clayMaterial;
    }
  });
}
