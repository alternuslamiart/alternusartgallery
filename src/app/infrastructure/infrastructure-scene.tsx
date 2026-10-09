"use client";

import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
  Grid,
  Line,
  OrbitControls,
  RoundedBox,
  TransformControls,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Group,
  Vector3,
} from "three";
import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  InfrastructureObject,
  InfrastructureType,
  LightingPreset,
} from "./infrastructure-types";

export type CameraPreset = "Front" | "Back" | "Left" | "Right" | "Top" | "Bottom" | "Perspective";
export type TransformMode = "select" | "move" | "rotate" | "scale" | "delete" | "measure" | InfrastructureType;
export type ViewportApi = {
  zoom: (inward: boolean) => void;
  fit: () => void;
  focus: (object: InfrastructureObject) => void;
  preset: (view: CameraPreset) => void;
  reset: () => void;
};
export type LightingSettings = {
  preset: LightingPreset;
  intensity: number;
  azimuth: number;
  elevation: number;
  shadowSoftness: number;
  shadows: boolean;
};

type Point2 = [number, number];
type Props = {
  objects: InfrastructureObject[];
  selectedId: number | null;
  tool: TransformMode;
  lighting: LightingSettings;
  undergroundUtilities: boolean;
  onSelect: (id: number, point: Vector3) => void;
  onEmpty: (point: Vector3) => void;
  onFocus: (object: InfrastructureObject) => void;
  onTransform: (id: number, values: Partial<InfrastructureObject>) => void;
};

const RESET_TARGET = new Vector3(0, 0, -1);
const RESET_POSITION = new Vector3(81, 74, 98);
const FIT_TARGET = new Vector3(0, 1, -1);
const FIT_POSITION = new Vector3(84, 78, 102);

function ribbonGeometry(points: Point2[], width: number, y: number) {
  const curve = new CatmullRomCurve3(points.map(([x, z]) => new Vector3(x, y, z)));
  const sampled = curve.getPoints(Math.max(32, points.length * 18));
  const positions: number[] = [];
  const indices: number[] = [];
  sampled.forEach((point, index) => {
    const before = sampled[Math.max(0, index - 1)];
    const after = sampled[Math.min(sampled.length - 1, index + 1)];
    const tangent = after.clone().sub(before).normalize();
    const sideX = -tangent.z * width * 0.5;
    const sideZ = tangent.x * width * 0.5;
    positions.push(point.x + sideX, y, point.z + sideZ, point.x - sideX, y, point.z - sideZ);
    if (index < sampled.length - 1) {
      const a = index * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function TransitStop({ object }: { object: InfrastructureObject }) {
  return (
    <group>
      <mesh position={[-object.width * 0.42, object.height / 2, 0]} castShadow>
        <boxGeometry args={[0.09, object.height, 0.09]} />
        <meshStandardMaterial color="#788b91" metalness={0.42} roughness={0.44} />
      </mesh>
      <mesh position={[0, object.height - 0.1, 0]}>
        <boxGeometry args={[object.width, 0.12, object.depth]} />
        <meshStandardMaterial color={object.color} metalness={0.24} roughness={0.3} />
      </mesh>
      <mesh position={[0, object.height * 0.53, -object.depth * 0.42]}>
        <boxGeometry args={[object.width * 0.86, object.height * 0.64, 0.055]} />
        <meshStandardMaterial color="#8eb8c4" transparent opacity={0.52} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.46, object.depth * 0.24]}>
        <boxGeometry args={[object.width * 0.72, 0.12, object.depth * 0.44]} />
        <meshStandardMaterial color="#687276" roughness={0.62} />
      </mesh>
    </group>
  );
}

function Signal({ object }: { object: InfrastructureObject }) {
  return (
    <group>
      <mesh position={[0, object.height / 2, 0]}>
        <cylinderGeometry args={[0.055, 0.075, object.height, 8]} />
        <meshStandardMaterial color={object.color} metalness={0.45} roughness={0.44} />
      </mesh>
      <mesh position={[0, object.height - 0.32, 0]}>
        <boxGeometry args={[0.32, 0.82, 0.28]} />
        <meshStandardMaterial color="#252a2e" roughness={0.52} />
      </mesh>
      {["#e44d47", "#e6b94f", "#51b86a"].map((color, index) => (
        <mesh key={color} position={[0, object.height - 0.08 - index * 0.25, 0.15]}>
          <sphereGeometry args={[0.085, 12, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={index === 0 ? 0.42 : 0.12} />
        </mesh>
      ))}
    </group>
  );
}

function Sign({ object }: { object: InfrastructureObject }) {
  return (
    <group>
      <mesh position={[0, object.height / 2, 0]}>
        <cylinderGeometry args={[0.045, 0.055, object.height, 8]} />
        <meshStandardMaterial color="#858d8d" metalness={0.46} roughness={0.5} />
      </mesh>
      <mesh position={[0, object.height * 0.82, 0]}>
        <boxGeometry args={[object.width, 0.72, Math.max(object.depth, 0.08)]} />
        <meshStandardMaterial color={object.color} roughness={0.46} />
      </mesh>
    </group>
  );
}

function offsetPath(points: Point2[], offset: number, count = 64): Vector3[] {
  const curve = new CatmullRomCurve3(points.map(([x, z]) => new Vector3(x, 0.09, z)));
  return curve.getPoints(count).map((point, index, sampled) => {
    const tangent = sampled[Math.min(index + 1, sampled.length - 1)]
      .clone()
      .sub(sampled[Math.max(0, index - 1)])
      .normalize();
    return point.add(new Vector3(-tangent.z * offset, 0, tangent.x * offset));
  });
}

function Ribbon({
  points,
  width,
  color,
  y = 0.05,
  onClick,
  transparent = false,
}: {
  points: Point2[];
  width: number;
  color: string;
  y?: number;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  transparent?: boolean;
}) {
  const geometry = useMemo(() => ribbonGeometry(points, width, y), [points, width, y]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} onClick={onClick} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.86} transparent={transparent} opacity={transparent ? 0.8 : 1} side={2} />
    </mesh>
  );
}

function Road({
  object,
  onClick,
}: {
  object: InfrastructureObject;
  onClick: (event: ThreeEvent<MouseEvent>) => void;
}) {
  const points = object.path ?? [[-object.depth / 2, 0], [object.depth / 2, 0]];
  const edges = [-(object.width + 1.2) / 2, (object.width + 1.2) / 2].map((offset) =>
    offsetPath(points, offset),
  );
  const dividers = Array.from({ length: Math.max(1, (object.lanes ?? 2) - 1) }, (_, index) => {
    const laneOffset = (index - ((object.lanes ?? 2) - 2) / 2) * (object.width / (object.lanes ?? 2));
    return offsetPath(points, laneOffset);
  });
  const stopLine = object.name.toLowerCase().includes("connector") ? offsetPath([[-object.width / 2, 9], [object.width / 2, 9]], 0, 2) : null;
  return (
    <group onClick={onClick}>
      <Ribbon points={points} width={object.width + 1.2} color="#88877f" y={0.015} />
      <Ribbon points={points} width={object.width} color={object.color} y={0.045} />
      {edges.map((line, index) => <Line key={`edge-${index}`} points={line} color="#d7d1b3" lineWidth={1.25} />)}
      {dividers.map((line, index) => (
        <Line key={`lane-${index}`} points={line} color="#eee7cb" lineWidth={0.85} dashed dashSize={1.5} gapSize={1.1} />
      ))}
      {stopLine && <Line points={stopLine} color="#f6f0d9" lineWidth={3} />}
    </group>
  );
}

function Building({ object }: { object: InfrastructureObject }) {
  const { width, depth, height, color, style } = object;
  const windows = Array.from({ length: Math.max(2, Math.floor(width / 1.65)) }, (_, index) => {
    const x = -width * 0.42 + (index * width * 0.84) / Math.max(1, Math.floor(width / 1.65) - 1);
    return x;
  });
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.5, 0.6, depth + 0.5]} />
        <meshStandardMaterial color="#b7c0c1" roughness={0.68} />
      </mesh>
      <RoundedBox args={[width, height, depth]} radius={style === "curved" ? 1.25 : 0.28} smoothness={3} position={[0, height / 2 + 0.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.12} />
      </RoundedBox>
      <mesh position={[0, height / 2 + 0.65, depth / 2 + 0.02]}>
        <boxGeometry args={[width * 0.9, Math.min(height * 0.68, 2.4), 0.08]} />
        <meshStandardMaterial color={style === "curved" ? "#57808b" : "#6e9aa6"} roughness={0.23} metalness={0.38} />
      </mesh>
      {windows.map((x, index) => (
        <mesh key={index} position={[x, height * 0.64 + 0.6, depth / 2 + 0.07]}>
          <boxGeometry args={[0.82, Math.min(1.35, height * 0.24), 0.045]} />
          <meshStandardMaterial color="#a8d4df" roughness={0.2} metalness={0.32} />
        </mesh>
      ))}
      <mesh position={[0, height + 0.65, 0]} castShadow>
        <boxGeometry args={[width + 0.32, 0.28, depth + 0.32]} />
        <meshStandardMaterial color={style === "solar" ? "#344753" : "#e6ebea"} roughness={0.62} />
      </mesh>
      {style === "solar" && Array.from({ length: 4 }, (_, index) => (
        <mesh key={index} position={[-width * 0.3 + index * width * 0.2, height + 0.83, 0]}>
          <boxGeometry args={[width * 0.14, 0.045, depth * 0.62]} />
          <meshStandardMaterial color="#35668a" metalness={0.45} roughness={0.3} />
        </mesh>
      ))}
      {(style === "retail" || style === "curved") && (
        <mesh position={[0, height * 0.36 + 0.6, depth / 2 + 0.18]} castShadow>
          <boxGeometry args={[width * 0.58, 0.22, 1.6]} />
          <meshStandardMaterial color="#edf1ee" roughness={0.42} />
        </mesh>
      )}
      <mesh position={[0, 0.17, depth / 2 + 0.1]}>
        <boxGeometry args={[Math.min(2.8, width * 0.22), 2.2, 0.12]} />
        <meshStandardMaterial color="#364f58" roughness={0.26} metalness={0.3} />
      </mesh>
    </group>
  );
}

function Tree({ object }: { object: InfrastructureObject }) {
  const size = object.width;
  return (
    <group>
      <mesh position={[0, object.height * 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.12 * size, 0.2 * size, object.height * 0.58, 7]} />
        <meshStandardMaterial color="#72543b" roughness={0.95} />
      </mesh>
      <mesh position={[0, object.height * 0.73, 0]} castShadow>
        <icosahedronGeometry args={[size * 1.02, 1]} />
        <meshStandardMaterial color={object.color} roughness={0.92} />
      </mesh>
      <mesh position={[size * 0.45, object.height * 0.62, -size * 0.24]} castShadow>
        <icosahedronGeometry args={[size * 0.55, 0]} />
        <meshStandardMaterial color={object.color} roughness={0.92} />
      </mesh>
    </group>
  );
}

function Pavilion({ object }: { object: InfrastructureObject }) {
  const columns = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    return [Math.cos(angle) * object.width * 0.38, Math.sin(angle) * object.depth * 0.38] as Point2;
  });
  return (
    <group>
      {columns.map(([x, z], index) => (
        <mesh key={index} position={[x, object.height / 2, z]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, object.height, 8]} />
          <meshStandardMaterial color="#d5dddc" metalness={0.52} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, object.height, 0]} castShadow>
        <cylinderGeometry args={[object.width * 0.62, object.width * 0.72, 0.36, 12]} />
        <meshStandardMaterial color={object.color} roughness={0.22} metalness={0.38} transparent opacity={0.88} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[object.width * 0.52, object.width * 0.56, 0.28, 32]} />
        <meshStandardMaterial color="#a8b1ad" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Vehicle({ object }: { object: InfrastructureObject }) {
  return (
    <group>
      <mesh position={[0, object.height * 0.36, 0]} castShadow>
        <boxGeometry args={[object.width, object.height * 0.42, object.depth]} />
        <meshStandardMaterial color={object.color} metalness={0.22} roughness={0.38} />
      </mesh>
      <mesh position={[0, object.height * 0.7, -object.depth * 0.08]} castShadow>
        <boxGeometry args={[object.width * 0.76, object.height * 0.36, object.depth * 0.48]} />
        <meshStandardMaterial color="#9eb8be" metalness={0.38} roughness={0.2} />
      </mesh>
      {[-1, 1].flatMap((side) => [-1, 1].map((end) => (
        <mesh key={`${side}-${end}`} position={[side * object.width * 0.38, 0.18, end * object.depth * 0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 10]} />
          <meshStandardMaterial color="#202327" roughness={0.92} />
        </mesh>
      )))}
    </group>
  );
}

function Parking({ object }: { object: InfrastructureObject }) {
  const bayCount = Math.max(4, Math.floor(object.width / 2.5));
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]} receiveShadow>
        <planeGeometry args={[object.width, object.depth]} />
        <meshStandardMaterial color={object.color} roughness={0.9} />
      </mesh>
      {Array.from({ length: bayCount + 1 }, (_, index) => {
        const x = -object.width / 2 + (index * object.width) / bayCount;
        return <Line key={index} points={[[x, 0.1, -object.depth * 0.36], [x, 0.1, -object.depth * 0.08]]} color="#e8e5d6" lineWidth={0.7} />;
      })}
      <Line points={[[-object.width / 2, 0.1, -object.depth * 0.36], [object.width / 2, 0.1, -object.depth * 0.36]]} color="#e8e5d6" lineWidth={0.7} />
      <Line points={[[-object.width / 2, 0.1, -object.depth * 0.08], [object.width / 2, 0.1, -object.depth * 0.08]]} color="#e8e5d6" lineWidth={0.7} />
      <Line points={[[-object.width / 2, 0.1, object.depth * 0.36], [object.width / 2, 0.1, object.depth * 0.36]]} color="#e8e5d6" lineWidth={0.7} />
      {Array.from({ length: bayCount }, (_, index) => {
        const x = -object.width / 2 + (index + 0.5) * object.width / bayCount;
        return <Line key={`second-${index}`} points={[[x, 0.1, object.depth * 0.08], [x, 0.1, object.depth * 0.36]]} color="#e8e5d6" lineWidth={0.7} />;
      })}
    </group>
  );
}

function Roundabout({ object }: { object: InfrastructureObject }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.065, 0]}>
        <ringGeometry args={[object.width * 0.3, object.width * 0.68, 48]} />
        <meshStandardMaterial color="#343a3e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[object.width * 0.28, object.width * 0.3, 0.55, 40]} />
        <meshStandardMaterial color={object.color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <icosahedronGeometry args={[object.width * 0.18, 1]} />
        <meshStandardMaterial color="#39784d" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Fountain({ object }: { object: InfrastructureObject }) {
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[object.width * 0.55, object.width * 0.58, 0.32, 40]} />
        <meshStandardMaterial color="#bab9b1" roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[object.width * 0.42, object.width * 0.42, 0.045, 40]} />
        <meshStandardMaterial color={object.color} roughness={0.2} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.055, 0.08, 0.9, 10]} />
        <meshStandardMaterial color="#84d4e3" emissive="#388ca3" emissiveIntensity={0.32} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#9be3ee" emissive="#3f9caf" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Lamp({ object, night }: { object: InfrastructureObject; night: boolean }) {
  return (
    <group>
      <mesh position={[0, object.height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.09, object.height, 8]} />
        <meshStandardMaterial color={object.color} metalness={0.6} roughness={0.38} />
      </mesh>
      <mesh position={[0.25, object.height, 0]}>
        <boxGeometry args={[0.65, 0.12, 0.16]} />
        <meshStandardMaterial color="#e8d7a5" emissive={night ? "#ffcc78" : "#000000"} emissiveIntensity={night ? 1.2 : 0} />
      </mesh>
      {night && <pointLight position={[0.25, object.height - 0.1, 0]} color="#ffd897" intensity={0.28} distance={6} />}
    </group>
  );
}

function Bench({ object }: { object: InfrastructureObject }) {
  return (
    <group>
      <mesh position={[0, object.height * 0.48, 0]} castShadow>
        <boxGeometry args={[object.width, 0.16, object.depth]} />
        <meshStandardMaterial color={object.color} roughness={0.68} />
      </mesh>
      <mesh position={[0, object.height * 0.82, -object.depth * 0.38]}>
        <boxGeometry args={[object.width, object.height * 0.56, 0.1]} />
        <meshStandardMaterial color={object.color} roughness={0.72} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * object.width * 0.38, object.height * 0.22, 0]}>
          <boxGeometry args={[0.12, object.height * 0.44, object.depth * 0.8]} />
          <meshStandardMaterial color="#535c60" metalness={0.38} roughness={0.52} />
        </mesh>
      ))}
    </group>
  );
}

function Barrier({ object }: { object: InfrastructureObject }) {
  const posts = Math.max(2, Math.floor(object.width / 1.8));
  return (
    <group>
      <mesh position={[0, object.height * 0.72, 0]}>
        <boxGeometry args={[object.width, 0.14, object.depth]} />
        <meshStandardMaterial color={object.color} metalness={0.38} roughness={0.42} />
      </mesh>
      {Array.from({ length: posts + 1 }, (_, index) => (
        <mesh key={index} position={[-object.width / 2 + index * object.width / posts, object.height * 0.38, 0]} castShadow>
          <boxGeometry args={[0.12, object.height * 0.76, object.depth]} />
          <meshStandardMaterial color={object.color} metalness={0.34} roughness={0.46} />
        </mesh>
      ))}
    </group>
  );
}

function Crosswalk({ object }: { object: InfrastructureObject }) {
  const stripes = Math.max(5, Math.floor(object.width / 1.1));
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
        <planeGeometry args={[object.width + 0.25, object.depth]} />
        <meshStandardMaterial color="#343a40" roughness={0.9} />
      </mesh>
      {Array.from({ length: stripes }, (_, index) => (
        <mesh key={index} position={[-object.width / 2 + (index + 0.5) * object.width / stripes, 0.075, 0]}>
          <boxGeometry args={[object.width / stripes * 0.58, 0.025, object.depth * 0.84]} />
          <meshStandardMaterial color={object.color} roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function SceneObject({
  object,
  selected,
  tool,
  night,
  onSelect,
  onFocus,
  onTransform,
}: {
  object: InfrastructureObject;
  selected: boolean;
  tool: TransformMode;
  night: boolean;
  onSelect: (event: ThreeEvent<MouseEvent>) => void;
  onFocus: () => void;
  onTransform: (values: Partial<InfrastructureObject>) => void;
}) {
  const groupRef = useRef<Group>(null);
  const [attached, setAttached] = useState<Group | null>(null);
  useEffect(() => setAttached(groupRef.current), []);
  const handleTransformEnd = () => {
    const group = groupRef.current;
    if (!group) return;
    const scale = group.scale.clone();
    onTransform({
      x: Number(group.position.x.toFixed(2)),
      y: Number(group.position.y.toFixed(2)),
      z: Number(group.position.z.toFixed(2)),
      rotation: Number(group.rotation.y.toFixed(3)),
      width: Math.max(0.4, Number((object.width * (object.type === "road" ? scale.z : scale.x)).toFixed(2))),
      height: Math.max(0.3, Number((object.height * scale.y).toFixed(2))),
      depth: Math.max(0.4, Number((object.depth * (object.type === "road" ? scale.x : scale.z)).toFixed(2))),
      path: object.path?.map(([x, z]) => [x * scale.x, z * scale.z]),
    });
    group.scale.set(1, 1, 1);
  };
  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(event);
  };
  const path = object.path ?? [[-object.depth / 2, 0], [object.depth / 2, 0]];

  return (
    <>
      <group
        ref={groupRef}
        position={[object.x, object.y, object.z]}
        rotation={[0, object.rotation, 0]}
        onClick={click}
        onDoubleClick={(event) => { event.stopPropagation(); onFocus(); }}
        visible={object.visible}
      >
        {object.type === "road" && <Road object={object} onClick={click} />}
        {object.type === "sidewalk" && (
          <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
            <boxGeometry args={[object.width, 0.18, object.depth]} />
            <meshStandardMaterial color={object.color} roughness={0.84} />
          </mesh>
        )}
        {object.type === "bikeLane" && (
          <group>
            <mesh position={[0, 0.065, 0]} receiveShadow>
              <boxGeometry args={[object.width, 0.13, object.depth]} />
              <meshStandardMaterial color={object.color} roughness={0.75} />
            </mesh>
            {[-object.depth * 0.32, 0, object.depth * 0.32].map((z) => (
              <mesh key={z} position={[0, 0.14, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.7, 1.1]} />
                <meshBasicMaterial color="#d9edf4" />
              </mesh>
            ))}
          </group>
        )}
        {object.type === "building" && <Building object={object} />}
        {object.type === "tree" && <Tree object={object} />}
        {object.type === "pavilion" && <Pavilion object={object} />}
        {object.type === "vehicle" && <Vehicle object={object} />}
        {object.type === "parking" && <Parking object={object} />}
        {object.type === "roundabout" && <Roundabout object={object} />}
        {object.type === "fountain" && <Fountain object={object} />}
        {object.type === "lamp" && <Lamp object={object} night={night} />}
        {object.type === "busStop" && <TransitStop object={object} />}
        {object.type === "trafficLight" && <Signal object={object} />}
        {object.type === "roadSign" && <Sign object={object} />}
        {object.type === "bench" && <Bench object={object} />}
        {object.type === "barrier" && <Barrier object={object} />}
        {object.type === "crosswalk" && <Crosswalk object={object} />}
        {object.type === "shrub" && (
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
              <planeGeometry args={[object.width, object.depth]} />
              <meshStandardMaterial color="#5c7650" roughness={0.98} />
            </mesh>
            {Array.from({ length: 5 }, (_, index) => (
              <mesh key={index} position={[-object.width * 0.38 + index * object.width * 0.19, object.height * 0.35, (index % 2 ? 1 : -1) * object.depth * 0.18]} castShadow>
                <icosahedronGeometry args={[object.height * 0.42, 1]} />
                <meshStandardMaterial color={object.color} roughness={0.92} />
              </mesh>
            ))}
          </group>
        )}
        {object.type === "water" && (
          <>
            <Ribbon points={path} width={object.width + 1.4} color="#84a58c" y={0.025} />
            <Ribbon points={path} width={object.width} color={object.color} y={0.065} transparent />
            <Line points={offsetPath(path, object.width * 0.58)} color="#c6c6a6" lineWidth={1.8} />
            <Line points={offsetPath(path, -object.width * 0.58)} color="#c6c6a6" lineWidth={1.8} />
          </>
        )}
        {object.type === "path" && <Ribbon points={path} width={object.width} color={object.color} y={0.07} />}
        {object.type === "bridge" && (
          <>
            <mesh position={[0, object.height, 0]} castShadow receiveShadow>
              <boxGeometry args={[object.width, 0.32, object.depth]} />
              <meshStandardMaterial color={object.color} roughness={0.64} />
            </mesh>
            {[-1, 1].map((side) => (
              <group key={side}>
                <mesh position={[0, object.height + 0.72, side * object.depth * 0.48]}>
                  <boxGeometry args={[object.width, 0.09, 0.09]} />
                  <meshStandardMaterial color="#6f858a" metalness={0.6} roughness={0.36} />
                </mesh>
                {Array.from({ length: 7 }, (_, index) => (
                  <mesh key={index} position={[-object.width * 0.44 + index * object.width * 0.88 / 6, object.height + 0.36, side * object.depth * 0.48]}>
                    <boxGeometry args={[0.07, 0.72, 0.07]} />
                    <meshStandardMaterial color="#7b8b8b" metalness={0.52} roughness={0.4} />
                  </mesh>
                ))}
              </group>
            ))}
          </>
        )}
        {object.type === "plaza" && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.075, 0]} receiveShadow>
              <planeGeometry args={[object.width, object.depth]} />
              <meshStandardMaterial color={object.color} roughness={0.84} />
            </mesh>
            {Array.from({ length: 5 }, (_, index) => (
              <Line key={index} points={[[-object.width / 2, 0.09, -object.depth / 2 + index * object.depth / 4], [object.width / 2, 0.09, -object.depth / 2 + index * object.depth / 4]]} color="#a8a69e" lineWidth={0.55} />
            ))}
          </>
        )}
        {selected && (
          <mesh position={[0, Math.max(object.height, 1.2) / 2, 0]} raycast={() => null}>
            <boxGeometry args={[Math.max(object.width, 1) + 0.25, Math.max(object.height, 1.2) + 0.25, Math.max(object.depth, 1) + 0.25]} />
            <meshBasicMaterial color="#78b7ff" wireframe transparent opacity={0.92} depthTest={false} />
          </mesh>
        )}
      </group>
      {selected && attached && !object.locked && ["move", "rotate", "scale"].includes(tool) && (
        <TransformControls
          object={attached}
          mode={tool === "move" ? "translate" : tool === "rotate" ? "rotate" : "scale"}
          onMouseUp={handleTransformEnd}
        />
      )}
    </>
  );
}

const CameraRig = forwardRef<ViewportApi>(function CameraRig(_props, ref) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const destination = useRef<{ position: Vector3; target: Vector3 } | null>(null);
  const defaultUp = useMemo(() => new Vector3(0, 1, 0), []);
  const transitionTo = useCallback((position: Vector3, target: Vector3, up = defaultUp) => {
    destination.current = { position: position.clone(), target: target.clone() };
    camera.up.copy(up);
  }, [camera, defaultUp]);

  useImperativeHandle(ref, () => ({
    zoom: (inward) => {
      const controls = controlsRef.current;
      if (!controls) return;
      const direction = camera.position.clone().sub(controls.target);
      const distance = direction.length();
      const next = Math.max(8, Math.min(230, distance * (inward ? 0.82 : 1.22)));
      camera.position.copy(controls.target).add(direction.normalize().multiplyScalar(next));
      controls.update();
    },
    fit: () => transitionTo(FIT_POSITION, FIT_TARGET),
    focus: (object) => {
      const target = new Vector3(object.x, object.y + Math.max(object.height / 2, 0.5), object.z);
      const controls = controlsRef.current;
      const direction = controls
        ? camera.position.clone().sub(controls.target).normalize()
        : new Vector3(0.7, 0.7, 0.8).normalize();
      const distance = Math.max(10, Math.max(object.width, object.depth, object.height) * 2.1);
      transitionTo(target.clone().add(direction.multiplyScalar(distance)), target);
    },
    preset: (view) => {
      const target = FIT_TARGET.clone();
      const distance = view === "Top" || view === "Bottom" ? 112 : 104;
      const directions: Record<CameraPreset, Vector3> = {
        Front: new Vector3(0, 0.34, 1),
        Back: new Vector3(0, 0.34, -1),
        Left: new Vector3(-1, 0.34, 0),
        Right: new Vector3(1, 0.34, 0),
        Top: new Vector3(0, 1, 0),
        Bottom: new Vector3(0, -1, 0),
        Perspective: new Vector3(0.78, 0.72, 0.95),
      };
      const up = view === "Top" ? new Vector3(0, 0, -1) : view === "Bottom" ? new Vector3(0, 0, 1) : defaultUp;
      transitionTo(target.clone().add(directions[view].normalize().multiplyScalar(distance)), target, up);
    },
    reset: () => {
      camera.up.copy(defaultUp);
      transitionTo(RESET_POSITION, RESET_TARGET);
    },
  }), [camera, defaultUp, transitionTo]);

  useFrame(() => {
    const target = destination.current;
    const controls = controlsRef.current;
    if (!target || !controls) return;
    camera.position.lerp(target.position, 0.12);
    controls.target.lerp(target.target, 0.12);
    if (camera.position.distanceToSquared(target.position) < 0.12 && controls.target.distanceToSquared(target.target) < 0.12) {
      camera.position.copy(target.position);
      controls.target.copy(target.target);
      destination.current = null;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.085}
      enablePan
      minDistance={8}
      maxDistance={230}
      maxPolarAngle={Math.PI}
      screenSpacePanning
    />
  );
});

function SceneContents(props: Props) {
  const { objects, selectedId, tool, lighting, undergroundUtilities, onSelect, onEmpty, onFocus, onTransform } = props;
  const isNight = lighting.preset === "Night";
  const azimuth = (lighting.azimuth * Math.PI) / 180;
  const elevation = (lighting.elevation * Math.PI) / 180;
  const sunPosition: [number, number, number] = [
    Math.cos(elevation) * Math.cos(azimuth) * 72,
    Math.sin(elevation) * 78,
    Math.cos(elevation) * Math.sin(azimuth) * 72,
  ];
  const ambient = (lighting.preset === "Night" ? 0.56 : lighting.preset === "Studio" ? 0.8 : 0.68) * lighting.intensity;
  const background = lighting.preset === "Night" ? "#101a2b" : lighting.preset === "Golden hour" ? "#d7a46c" : lighting.preset === "Studio" ? "#242932" : "#b8c9d0";
  return (
    <>
      <color attach="background" args={[new Color(background)]} />
      {lighting.preset !== "Studio" && <fog attach="fog" args={[background, 105, 230]} />}
      <hemisphereLight args={[isNight ? "#657da5" : "#dbeaff", "#758163", ambient]} />
      <ambientLight intensity={ambient * 0.55} />
      <directionalLight
        position={sunPosition}
        intensity={(isNight ? 0.3 : lighting.preset === "Golden hour" ? 1.4 : lighting.preset === "Studio" ? 1.15 : 1.22) * lighting.intensity}
        color={lighting.preset === "Golden hour" ? "#ffd19b" : isNight ? "#a8c8ff" : "#fff5e5"}
        castShadow={lighting.shadows}
        shadow-mapSize-width={lighting.shadows ? 1536 : 512}
        shadow-mapSize-height={lighting.shadows ? 1536 : 512}
        shadow-radius={lighting.shadowSoftness}
        shadow-camera-left={-78}
        shadow-camera-right={78}
        shadow-camera-top={78}
        shadow-camera-bottom={-78}
        shadow-bias={-0.00015}
      />
      <Grid
        args={[150, 150]}
        cellSize={2}
        cellThickness={0.35}
        cellColor="#77818a"
        sectionSize={10}
        sectionThickness={0.65}
        sectionColor="#63717a"
        fadeDistance={115}
        fadeStrength={1.4}
        infiniteGrid
        position={[0, -0.035, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.24, 0]} receiveShadow onClick={(event) => onEmpty(event.point)}>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color="#78926e" roughness={1} />
      </mesh>
      {undergroundUtilities && (
        <group position={[0, -0.7, 0]}>
          {[-2, 0, 2].map((x, index) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 90, 8]} />
              <meshStandardMaterial color={["#397bd5", "#d7b847", "#cf5252"][index]} roughness={0.45} />
            </mesh>
          ))}
        </group>
      )}
      <group position={[0, -0.2, 0]}>
        {objects.filter((object) => object.visible).map((object) => (
          <SceneObject
            key={object.id}
            object={object}
            selected={object.id === selectedId}
            tool={tool}
            night={isNight}
            onSelect={(event) => onSelect(object.id, event.point)}
            onFocus={() => onFocus(object)}
            onTransform={(values) => onTransform(object.id, values)}
          />
        ))}
      </group>
      <CameraRig />
    </>
  );
}

export const InfrastructureViewport = forwardRef<ViewportApi, Props>(function InfrastructureViewport(props, ref) {
  const controlsRef = useRef<ViewportApi | null>(null);
  useImperativeHandle(ref, () => ({
    zoom: (inward) => controlsRef.current?.zoom(inward),
    fit: () => controlsRef.current?.fit(),
    focus: (object) => controlsRef.current?.focus(object),
    preset: (view) => controlsRef.current?.preset(view),
    reset: () => controlsRef.current?.reset(),
  }), []);

  return (
    <Canvas
      shadows={props.lighting.shadows}
      camera={{ position: [81, 74, 98], fov: 43, near: 0.1, far: 500 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      fallback={<div className="grid h-full place-items-center bg-[#11161b] p-8 text-center text-sm text-zinc-300">WebGL is unavailable in this browser. Enable hardware acceleration to open the 3D infrastructure viewport.</div>}
    >
      <Suspense fallback={null}>
        <SceneContents {...props} />
      </Suspense>
    </Canvas>
  );
});
