"use client";
import { Component, forwardRef, Suspense, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Grid, Html, Line, OrbitControls, OrthographicCamera, PerspectiveCamera, TransformControls } from "@react-three/drei";
import { PointerLockControls as WalkImpl } from "three-stdlib";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildScene, disposeScene } from "@/lib/scene/geometry.mjs";
import type { SceneDocument, SceneObject, Vec3 } from "@/lib/scene/document.mjs";
import { useCrystalTheme } from "@/lib/crystal-theme";

export type ViewportAPI = {
  fit: () => void; focus: () => void; preset: (name: string) => void; zoom: (factor: number) => void;
  camera: () => SceneDocument["camera"]; screenshot: (format: "png" | "jpeg") => Promise<Blob>;
  walk: () => void;
  point: (x: number, y: number) => Vec3 | null;
};
export type SceneTool = "select" | "translate" | "rotate" | "scale" | "measure";
type Props = { document: SceneDocument; selected: string[]; tool: SceneTool; snap: boolean; grid: boolean;
  onSelect: (id: string | null, additive?: boolean) => void; onTransform: (id: string, patch: Partial<SceneObject>) => void;
  onCameraChange?: (camera: SceneDocument["camera"]) => void };

class RenderBoundary extends Component<{ children: ReactNode; retry: () => void }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? <div className="scene-render-error" role="alert">The 3D renderer stopped. Your document is retained.<button onClick={this.props.retry}>Restart viewport</button></div> : this.props.children; }
}

const Contents = forwardRef<ViewportAPI, Props & { walking: boolean; setWalking: (value: boolean) => void }>(function Contents(p, ref) {
  const { camera, gl, scene, invalidate, size } = useThree();
  const { theme } = useCrystalTheme();
  const orbit = useRef<OrbitImpl>(null), walk = useRef<WalkImpl | null>(null);
  const keys = useRef(new Set<string>());
  const dragging = useRef(false);
  const selectionBox = useRef<THREE.BoxHelper>(null);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const root = useMemo(() => buildScene(p.document, { helpers: true, onTextureLoad: invalidate }), [p.document.objects, invalidate]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => disposeScene(root), [root]);
  const selected = useMemo(() => {
    let found: THREE.Object3D | undefined;
    root.traverse(o => { if (o.userData.sceneId === p.selected[0]) found = o; });
    return found;
  }, [root, p.selected]);
  let transformNode: THREE.Object3D | null | undefined = selected;
  let transformLocked = false;
  while (transformNode) { if (transformNode.userData.locked) transformLocked = true; transformNode = transformNode.parent; }
  const canTransform = selected && selected.visible && !transformLocked && !p.walking;
  const e = p.document.environment;
  const az = THREE.MathUtils.degToRad(e.sunAzimuth), el = THREE.MathUtils.degToRad(e.sunElevation);
  const sun: Vec3 = [Math.cos(el) * Math.cos(az) * 40, Math.sin(el) * 40, Math.cos(el) * Math.sin(az) * 40];
  const shadowSize = e.quality === "performance" ? 512 : e.quality === "ultra" ? 2048 : 1024;

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = e.exposure; gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.type = THREE.PCFSoftShadowMap; invalidate();
  }, [e.exposure, e.quality, gl, invalidate]);
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, .04);
    scene.environment = environment.texture; scene.environmentIntensity = .55;
    room.dispose(); generator.dispose(); invalidate();
    return () => { scene.environment = null; environment.dispose(); };
  }, [gl, scene, invalidate]);
  useEffect(() => {
    camera.position.fromArray(p.document.camera.position); camera.lookAt(new THREE.Vector3().fromArray(p.document.camera.target));
    orbit.current?.target.fromArray(p.document.camera.target); orbit.current?.update(); invalidate();
  }, [camera, p.document.camera, invalidate]);
  useEffect(() => {
    const controls = new WalkImpl(camera, gl.domElement);
    walk.current = controls;
    const locked = () => p.setWalking(true);
    const unlocked = () => {
      const target = camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(3));
      orbit.current?.target.copy(target);
      p.onCameraChange?.({ position: camera.position.toArray() as Vec3, target: target.toArray() as Vec3, projection: p.document.camera.projection });
      p.setWalking(false); invalidate();
    };
    controls.addEventListener("lock", locked); controls.addEventListener("unlock", unlocked);
    return () => { if (controls.isLocked) controls.unlock(); controls.removeEventListener("lock", locked); controls.removeEventListener("unlock", unlocked); controls.dispose(); walk.current = null; };
  }, [camera, gl]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (p.tool !== "measure") setPoints([]); }, [p.tool]);
  useEffect(() => {
    const down = (event: KeyboardEvent) => { if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) keys.current.add(event.code); };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, []);
  useFrame((_, delta) => {
    selectionBox.current?.update();
    if (!p.walking || !walk.current?.isLocked) return;
    const speed = Math.min(delta, .05) * (keys.current.has("ShiftLeft") ? 6 : 2.5);
    walk.current.moveForward((Number(keys.current.has("KeyW")) - Number(keys.current.has("KeyS"))) * speed);
    walk.current.moveRight((Number(keys.current.has("KeyD")) - Number(keys.current.has("KeyA"))) * speed);
  });

  const frame = (object: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.isEmpty() ? new THREE.Vector3(0, 1, 0) : box.getCenter(new THREE.Vector3());
    const radius = Math.max(2, box.getSize(new THREE.Vector3()).length() * .65);
    camera.position.copy(center).add(new THREE.Vector3(1, .75, 1).normalize().multiplyScalar(radius * 2));
    camera.lookAt(center); orbit.current?.target.copy(center); orbit.current?.update();
    if (camera instanceof THREE.OrthographicCamera) { camera.zoom = Math.min(size.width, size.height) / (radius * 2.2); camera.updateProjectionMatrix(); }
    invalidate();
  };
  useImperativeHandle(ref, () => ({
    fit: () => frame(root), focus: () => frame(selected ?? root),
    preset: name => {
      const directions: Record<string, Vec3> = { Front: [0, 0, 1], Back: [0, 0, -1], Left: [-1, 0, 0], Right: [1, 0, 0], Top: [0, 1, .0001], Perspective: [1, .75, 1] };
      const target = orbit.current?.target ?? new THREE.Vector3();
      const distance = Math.max(5, camera.position.distanceTo(target));
      camera.position.copy(target).add(new THREE.Vector3().fromArray(directions[name] ?? directions.Perspective).normalize().multiplyScalar(distance));
      camera.lookAt(target); orbit.current?.update(); invalidate();
    },
    zoom: factor => { if (camera instanceof THREE.OrthographicCamera) { camera.zoom = Math.max(.1, Math.min(500, camera.zoom * factor)); camera.updateProjectionMatrix(); } else { const target = orbit.current?.target ?? new THREE.Vector3(); camera.position.sub(target).multiplyScalar(1 / factor).add(target); } orbit.current?.update(); invalidate(); },
    camera: () => ({ position: camera.position.toArray() as Vec3, target: (orbit.current?.target.toArray() ?? [0, 1, 0]) as Vec3, projection: p.document.camera.projection }),
    screenshot: format => { gl.render(scene, camera); return new Promise((resolve, reject) => gl.domElement.toBlob(blob => blob ? resolve(blob) : reject(new Error("Screenshot failed.")), `image/${format}`, .94)); },
    walk: () => { if (camera instanceof THREE.OrthographicCamera) throw new Error("Switch to perspective before entering walkthrough."); camera.position.y = Math.max(1.6, camera.position.y); walk.current?.lock(); },
    point: (x, y) => {
      const bounds = gl.domElement.getBoundingClientRect();
      const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((x - bounds.left) / bounds.width * 2 - 1, -(y - bounds.top) / bounds.height * 2 + 1), camera);
      const point = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0)), new THREE.Vector3());
      return point ? point.toArray() as Vec3 : null;
    },
  }));
  const pick = (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    if (event.button !== 0 || dragging.current || p.walking) return;
    event.stopPropagation();
    if (p.tool === "measure") { setPoints(current => current.length === 2 ? [event.point.clone()] : [...current, event.point.clone()]); return; }
    let node: THREE.Object3D | null = event.object;
    while (node && !node.userData.sceneId) node = node.parent;
    if (node) {
      let parent: THREE.Object3D | null = node;
      while (parent) { if (parent.userData.locked) return; parent = parent.parent; }
      p.onSelect(node.userData.sceneId, event.shiftKey || event.ctrlKey || event.metaKey);
    }
  };
  return <>
    {p.document.camera.projection === "orthographic" ? <OrthographicCamera makeDefault position={p.document.camera.position} zoom={35} near={.01} far={20000} /> : <PerspectiveCamera makeDefault position={p.document.camera.position} fov={45} near={.05} far={20000} />}
    <color attach="background" args={[theme === "dark" ? "#191c21" : "#e9edf1"]} />
    <hemisphereLight args={["#e6efff", "#9a8d78", .7]} />
    <directionalLight position={sun} color={e.sunElevation < 25 ? "#ffce94" : "#fff6e6"} intensity={e.sunIntensity} castShadow={e.shadows}
      shadow-mapSize={[shadowSize, shadowSize]} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35} shadow-camera-near={.1} shadow-camera-far={150} shadow-bias={-.00015} shadow-normalBias={.02} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.42, 0]} receiveShadow onPointerDown={event => { if (p.tool === "measure") pick(event); else if (event.button === 0 && !dragging.current) p.onSelect(null); }}>
      <planeGeometry args={[500, 500]} /><meshStandardMaterial color={theme === "dark" ? "#373c43" : "#c9cdd2"} roughness={.95} />
    </mesh>
    {p.grid && <Grid position={[0, -.4, 0]} args={[200, 200]} cellSize={1} sectionSize={5} cellColor={theme === "dark" ? "#555b63" : "#a0a8b3"} sectionColor="#748396" fadeDistance={80} infiniteGrid />}
    <primitive object={root} onPointerDown={pick} onDoubleClick={(event: ThreeEvent<MouseEvent>) => { pick(event); frame(event.object); }} />
    {selected && selected.visible && <boxHelper ref={selectionBox} args={[selected, 0x4284ff]} />}
    {canTransform && ["translate", "rotate", "scale"].includes(p.tool) && <TransformControls object={selected} mode={p.tool as "translate" | "rotate" | "scale"} size={.8}
      translationSnap={p.snap ? .25 : null} rotationSnap={p.snap ? Math.PI / 12 : null} scaleSnap={p.snap ? .1 : null}
      onMouseDown={() => { dragging.current = true; }} onObjectChange={() => invalidate()}
      onMouseUp={() => {
        dragging.current = false;
        if (selected) {
          const original = p.document.objects.find(o => o.id === p.selected[0]);
          const patch = { position: selected.position.toArray() as Vec3, rotation: [selected.rotation.x, selected.rotation.y, selected.rotation.z] as Vec3, scale: selected.scale.toArray().map(v => Math.max(.001, v)) as Vec3 };
          p.onTransform(p.selected[0], patch);
          if (original) { selected.position.fromArray(original.position); selected.rotation.fromArray([...original.rotation, "XYZ"]); selected.scale.fromArray(original.scale); }
        }
      }} />}
    {points.length === 2 && <><Line points={points} color="#ffca64" lineWidth={2} /><Html position={points[0].clone().lerp(points[1], .5)} center><span className="scene-measurement">{points[0].distanceTo(points[1]).toFixed(3)} m</span></Html></>}
    <OrbitControls ref={orbit} makeDefault enabled={!p.walking} enableDamping dampingFactor={.12} maxDistance={1500} minDistance={.1} mouseButtons={{ LEFT: -1 as THREE.MOUSE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE }}
      onEnd={() => p.onCameraChange?.({ position: camera.position.toArray() as Vec3, target: (orbit.current?.target.toArray() ?? [0, 1, 0]) as Vec3, projection: p.document.camera.projection })} />
  </>;
});

export const SceneViewport = forwardRef<ViewportAPI, Props>(function SceneViewport(p, ref) {
  const [generation, setGeneration] = useState(0), [walking, setWalking] = useState(false), [contextLost, setContextLost] = useState(false);
  const e = p.document.environment;
  const maxDpr = e.quality === "performance" ? 1 : e.quality === "ultra" ? 2 : 1.5;
  return <div className="scene-canvas" data-object-count={p.document.objects.length}>
    <RenderBoundary key={generation} retry={() => { setContextLost(false); setGeneration(g => g + 1); }}>
      <Canvas frameloop={walking ? "always" : "demand"} shadows={e.shadows} dpr={[1, maxDpr]} gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => { gl.domElement.addEventListener("webglcontextlost", event => { event.preventDefault(); setContextLost(true); }, { once: true }); }}
        fallback={<div role="alert" className="scene-render-error">WebGL 2 is unavailable. Enable hardware acceleration; your scene document remains accessible.</div>}>
        <Suspense fallback={null}><Contents {...p} ref={ref} walking={walking} setWalking={setWalking} /></Suspense>
      </Canvas>
    </RenderBoundary>
    {contextLost && <div className="scene-render-error" role="alert">Graphics context lost. Your scene document is retained.<button onClick={() => { setContextLost(false); setGeneration(g => g + 1); }}>Restart viewport</button></div>}
    {walking && <div className="scene-walk-hint">WASD to walk · mouse to look · Esc to exit</div>}
  </div>;
});
