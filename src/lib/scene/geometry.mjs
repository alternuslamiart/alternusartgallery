import * as THREE from "three";
import { makeObject, validateDocument } from "./document.mjs";
import { generatedAsset, loadGeneratedAssets } from './generated-assets.mjs';

function applyTextures(material,m,enabled,onTextureLoad){
  if(!enabled)return;
  for(const key of ['map','normalMap','roughnessMap','metalnessMap','aoMap'])if(m[key]){
    let ready,failed;
    const loaded=new Promise((resolve,reject)=>{ready=resolve;failed=reject;});
    const texture=new THREE.TextureLoader().load(m[key],()=>{onTextureLoad?.();ready();},undefined,failed);
    texture.userData.loaded=loaded;loaded.catch(()=>{});
    if(key==='map')texture.colorSpace=THREE.SRGBColorSpace;
    texture.flipY=m.flipY??true;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.repeat.fromArray(m.uvScale??[1,1]);material[key]=texture;
  }
}

export function buildScene(document, { textures = typeof window !== "undefined", helpers = false, onTextureLoad } = {}) {
  const root = new THREE.Group();
  root.name = document.name;
  root.userData = { casynusVersion: 1, units: "m" };
  const nodes = new Map();
  for (const o of document.objects) {
    let node;
    if (o.kind === "group") node = new THREE.Group();
    else if (o.kind === 'model') {
      node=new THREE.Group();
      const asset=generatedAsset(o.asset.jobId);
      if(asset){
        const content=asset.source.clone(true),wrapper=new THREE.Group();wrapper.scale.fromArray(o.dimensions);wrapper.add(content);node.add(wrapper);
        content.traverse(child=>{child.userData={};if(child.isMesh){child.geometry=child.geometry.clone();child.material=new THREE.MeshPhysicalMaterial({color:o.material.color,roughness:o.material.roughness,metalness:o.material.metalness,opacity:o.material.opacity,transparent:o.material.opacity<1,transmission:o.material.transmission});applyTextures(child.material,o.material,textures,onTextureLoad);child.castShadow=true;child.receiveShadow=true;}});
      }
    }
    else if (o.kind.endsWith("Light")) {
      node = o.kind === "spotLight" ? new THREE.SpotLight(o.material.color, o.intensity, 50, Math.PI / 4, .5) : new THREE.PointLight(o.material.color, o.intensity, 40, 2);
      if (node.isSpotLight) { node.target.position.set(0, -1, 0); node.add(node.target); }
      // Per-object shadow maps are intentionally bounded; sunlight owns shadows.
      if (helpers) {
        const marker = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), new THREE.MeshBasicMaterial({ color: o.material.color }));
        marker.userData.editorOnly = true; node.add(marker);
      }
    } else {
      let geometry;
      if (o.kind === "box") geometry = new THREE.BoxGeometry(...o.dimensions);
      else if (o.kind === "sphere") { geometry = new THREE.SphereGeometry(.5, 24, 16); geometry.scale(...o.dimensions); }
      else if (o.kind === "cylinder") { geometry = new THREE.CylinderGeometry(.5, .5, 1, 24); geometry.scale(...o.dimensions); }
      else {
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(o.geometry.positions, 3));
        if (o.geometry.normals) geometry.setAttribute("normal", new THREE.Float32BufferAttribute(o.geometry.normals, 3));
        else geometry.computeVertexNormals();
        if (o.geometry.uvs) geometry.setAttribute("uv", new THREE.Float32BufferAttribute(o.geometry.uvs, 2));
        if (o.geometry.uvs1) geometry.setAttribute("uv1", new THREE.Float32BufferAttribute(o.geometry.uvs1, 2));
        if (o.geometry.indices) { geometry.setIndex(o.geometry.indices); if (!o.geometry.normals) geometry.computeVertexNormals(); }
        geometry.scale(...o.dimensions);
      }
      const m = o.material;
      const material = new THREE.MeshPhysicalMaterial({ color: m.color, roughness: m.roughness, metalness: m.metalness,
        opacity: m.opacity, transparent: m.opacity < 1, transmission: m.transmission, thickness: .05, ior: 1.5 });
      applyTextures(material,m,textures,onTextureLoad);
      node = new THREE.Mesh(geometry, material);
      node.castShadow = true; node.receiveShadow = true;
    }
    node.name = o.name; node.position.fromArray(o.position); node.rotation.fromArray([...o.rotation, "XYZ"]); node.scale.fromArray(o.scale);
    node.visible = o.visible; node.userData = { ...node.userData, sceneId: o.id, kind: o.kind, locked: o.locked };
    nodes.set(o.id, node);
  }
  for (const o of document.objects) (nodes.get(o.parentId) ?? root).add(nodes.get(o.id));
  root.updateMatrixWorld(true);
  return root;
}

export function disposeScene(root) {
  const resources = new Set();
  root.traverse(node => {
    if (node.geometry) resources.add(node.geometry);
    for (const m of Array.isArray(node.material) ? node.material : node.material ? [node.material] : []) {
      for (const v of Object.values(m)) if (v?.isTexture) resources.add(v);
      resources.add(m);
    }
  });
  resources.forEach(r => r.dispose());
}

export async function exportScene(document, format) {
  await loadGeneratedAssets(document);
  const root = buildScene(document);
  try {
    const textures = new Set();
    root.traverse(node => { for (const material of Array.isArray(node.material) ? node.material : node.material ? [node.material] : []) for (const value of Object.values(material)) if (value?.isTexture && value.userData.loaded) textures.add(value.userData.loaded); });
    await Promise.all(textures);
    if (format === "glb" || format === "gltf") {
      const { GLTFExporter } = await import("three/addons/exporters/GLTFExporter.js");
      const output = await new GLTFExporter().parseAsync(root, { binary: format === "glb", onlyVisible: true });
      if (format === "glb") {
        if (!(output instanceof ArrayBuffer) || new DataView(output).getUint32(0, true) !== 0x46546c67) throw new Error("Invalid GLB output.");
        return new Blob([output], { type: "model/gltf-binary" });
      }
      return new Blob([JSON.stringify(output)], { type: "model/gltf+json" });
    }
    if (format === "obj") {
      const { OBJExporter } = await import("three/addons/exporters/OBJExporter.js");
      return new Blob([new OBJExporter().parse(root)], { type: "text/plain" });
    }
    if (format === "stl") {
      const { STLExporter } = await import("three/addons/exporters/STLExporter.js");
      const data = new STLExporter().parse(root, { binary: true });
      return new Blob([data], { type: "application/octet-stream" });
    }
    throw new Error("Unsupported export format.");
  } finally { disposeScene(root); }
}

function validateEmbeddedGLTF(json) {
  for (const item of [...(json.buffers ?? []), ...(json.images ?? [])]) {
    if (item.uri && !/^data:(application\/octet-stream|application\/gltf-buffer|image\/(png|jpeg|webp));base64,/.test(item.uri)) throw new Error("Import requires embedded buffers and PNG/JPEG/WebP textures. External URLs are not fetched.");
  }
}

function embeddedTexture(texture) {
  if (!texture?.image || typeof document === "undefined") return undefined;
  const image = texture.image;
  const canvas = document.createElement("canvas");
  const ratio = Math.min(1, 1024 / Math.max(image.width, image.height));
  canvas.width = Math.max(1, Math.round(image.width * ratio)); canvas.height = Math.max(1, Math.round(image.height * ratio));
  const context = canvas.getContext("2d");
  context?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return context ? canvas.toDataURL("image/png") : undefined;
}

export async function importModel(buffer, filename) {
  if (buffer.byteLength > 20_000_000) throw new Error("Model imports are limited to 20 MB.");
  const extension = filename.split(".").at(-1)?.toLowerCase();
  let source;
  if (["glb", "gltf"].includes(extension)) {
    let json;
    if (extension === "glb") {
      const view = new DataView(buffer);
      if (buffer.byteLength < 20 || view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== buffer.byteLength) throw new Error("Invalid GLB header.");
      const length = view.getUint32(12, true);
      if (view.getUint32(16, true) !== 0x4e4f534a || length > buffer.byteLength - 20) throw new Error("Invalid GLB JSON chunk.");
      json = JSON.parse(new TextDecoder().decode(buffer.slice(20, 20 + length)));
    } else json = JSON.parse(new TextDecoder().decode(buffer));
    validateEmbeddedGLTF(json);
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const gltf = await new GLTFLoader().parseAsync(extension === "glb" ? buffer : JSON.stringify(json), "");
    if (gltf.animations.length) { disposeScene(gltf.scene); throw new Error("Animated assets are not supported by the static scene editor."); }
    source = gltf.scene;
  } else if (extension === "obj") {
    const { OBJLoader } = await import("three/addons/loaders/OBJLoader.js");
    source = new OBJLoader().parse(new TextDecoder().decode(buffer));
  } else if (extension === "stl") {
    const { STLLoader } = await import("three/addons/loaders/STLLoader.js");
    source = new THREE.Mesh(new STLLoader().parse(buffer), new THREE.MeshStandardMaterial());
  } else throw new Error("Choose GLB, embedded glTF, OBJ or STL.");
  const output = [];
  const walk = (node, parentId = null) => {
    if (node.isSkinnedMesh || node.morphTargetInfluences?.length) throw new Error("Skinned and morph-target meshes are not supported.");
    const group = makeObject("group", { name: (node.name || filename).slice(0, 120), parentId, position: node.position.toArray(), rotation: new THREE.Euler().setFromQuaternion(node.quaternion).toArray().slice(0, 3), scale: node.scale.toArray(), visible: node.visible });
    output.push(group);
    if (node.isLight) {
      if (!node.isPointLight && !node.isSpotLight) throw new Error("Only point and spot lights are supported in imported assets.");
      output.push(makeObject(node.isSpotLight ? "spotLight" : "pointLight", { name: (node.name || "Imported light").slice(0, 120), parentId: group.id, position: [0, 0, 0], intensity: node.intensity, material: { color: `#${node.color.getHexString()}`, roughness: 1, metalness: 0, opacity: 1, transmission: 0 } }));
    }
    if (node.isMesh) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      const groups = node.geometry.groups.length && materials.length > 1 ? node.geometry.groups : [{ start: 0, count: node.geometry.index?.count ?? node.geometry.attributes.position.count, materialIndex: 0 }];
      for (const part of groups) {
        const geometry = node.geometry.clone();
        if (node.geometry.index) geometry.setIndex(Array.from(node.geometry.index.array).slice(part.start, part.start + part.count));
        else for (const key of Object.keys(geometry.attributes)) {
          const attribute = geometry.getAttribute(key);
          geometry.setAttribute(key, new THREE.BufferAttribute(attribute.array.slice(part.start * attribute.itemSize, (part.start + part.count) * attribute.itemSize), attribute.itemSize));
        }
        geometry.computeBoundingBox();
        const box = geometry.boundingBox, center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()).max(new THREE.Vector3(.001, .001, .001));
        const positions = Array.from(geometry.attributes.position.array);
        for (let i = 0; i < positions.length; i++) positions[i] = (positions[i] - center.getComponent(i % 3)) / size.getComponent(i % 3);
        const m = materials[part.materialIndex] ?? materials[0];
        output.push(makeObject("mesh", { name: (node.name || "Imported mesh").slice(0, 120), parentId: group.id, position: center.toArray(), dimensions: size.toArray(),
          material: { color: `#${m.color?.getHexString() ?? "cccccc"}`, roughness: m.roughness ?? .6, metalness: m.metalness ?? 0, opacity: m.opacity ?? 1, transmission: m.transmission ?? 0, ...(m.map ? { flipY: m.map.flipY, uvScale: m.map.repeat.toArray() } : {}),
            ...Object.fromEntries(["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap"].flatMap(key => { const data = embeddedTexture(m[key]); return data ? [[key, data]] : []; })) },
          geometry: { positions, ...(geometry.attributes.uv ? { uvs: Array.from(geometry.attributes.uv.array) } : {}), ...(geometry.attributes.uv1 ? { uvs1: Array.from(geometry.attributes.uv1.array) } : {}), ...(geometry.index ? { indices: Array.from(geometry.index.array) } : {}) } }));
        geometry.dispose();
      }
    }
    node.children.forEach(child => walk(child, group.id));
  };
  try { walk(source); return output; } finally { disposeScene(source); }
}

export function duplicateObjects(document, selectedIds) {
  const included = new Set(selectedIds);
  for (let i = 0; i < 32; i++) document.objects.forEach(o => { if (included.has(o.parentId)) included.add(o.id); });
  const mapping = new Map([...included].map(old => [old, crypto.randomUUID()]));
  const copies = document.objects.filter(o => included.has(o.id)).map(o => ({ ...o, id: mapping.get(o.id), name: `${o.name.slice(0, 110)} copy`, parentId: mapping.get(o.parentId) ?? o.parentId,
    position: !included.has(o.parentId) ? [o.position[0] + 1, o.position[1], o.position[2] + 1] : o.position }));
  return { document: validateDocument({ ...document, objects: [...document.objects, ...copies] }), ids: copies.filter(o => !included.has(document.objects.find(old => mapping.get(old.id) === o.id)?.parentId)).map(o => o.id) };
}

export function regroupObjects(document, selectedIds, ungroup = false) {
  const root = buildScene(document, { textures: false });
  const nodes = new Map(); root.traverse(o => { if (o.userData.sceneId) nodes.set(o.userData.sceneId, o); });
  try {
    const ids = new Set(selectedIds);
    const selected = document.objects.filter(o => ids.has(o.id));
    const locked = object => { let node = object; while (node) { if (node.locked) return true; node = document.objects.find(o => o.id === node.parentId); } return false; };
    if (selected.some(locked)) throw new Error("Unlock selected objects and their parents before grouping.");
    const group = ungroup ? selected[0] : makeObject("group", { name: "Group", position: [0, 0, 0] });
    if (!group || (ungroup && (selected.length !== 1 || group.kind !== "group"))) throw new Error("Select one group to ungroup.");
    const moved = ungroup ? document.objects.filter(o => o.parentId === group.id) : selected.filter(o => {
      let parent = o.parentId;
      while (parent) { if (ids.has(parent)) return false; parent = document.objects.find(n => n.id === parent)?.parentId; }
      return true;
    });
    if (moved.some(o => o.locked)) throw new Error("Unlock grouped objects first.");
    const parentId = ungroup ? group.parentId : group.id;
    const parentMatrix = ungroup && parentId ? nodes.get(parentId).matrixWorld.clone().invert() : new THREE.Matrix4();
    const patches = new Map(moved.map(o => {
      const matrix = parentMatrix.clone().multiply(nodes.get(o.id).matrixWorld);
      const position = new THREE.Vector3(), rotation = new THREE.Quaternion(), scale = new THREE.Vector3(); matrix.decompose(position, rotation, scale);
      const rebuilt = new THREE.Matrix4().compose(position, rotation, scale);
      if (rebuilt.elements.some((v, i) => Math.abs(v - matrix.elements[i]) > .0001)) throw new Error("Cannot regroup a sheared transform. Use uniform parent scales first.");
      return [o.id, { ...o, parentId, position: position.toArray(), rotation: new THREE.Euler().setFromQuaternion(rotation).toArray().slice(0, 3), scale: scale.toArray() }];
    }));
    const objects = document.objects.filter(o => !(ungroup && o.id === group.id)).map(o => patches.get(o.id) ?? o);
    if (!ungroup) objects.push(group);
    return validateDocument({ ...document, objects });
  } finally { disposeScene(root); }
}
