export type InfrastructureType =
  | "road"
  | "building"
  | "pavilion"
  | "tree"
  | "lamp"
  | "water"
  | "bridge"
  | "parking"
  | "plaza"
  | "vehicle"
  | "fountain"
  | "roundabout"
  | "path"
  | "crosswalk"
  | "barrier"
  | "bench"
  | "shrub"
  | "sidewalk"
  | "bikeLane"
  | "busStop"
  | "trafficLight"
  | "roadSign"
  | "ferrisWheel";

export type InfrastructureObject = {
  id: number;
  type: InfrastructureType;
  name: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  visible: boolean;
  locked: boolean;
  lanes?: number;
  path?: [number, number][];
  style?: "commercial" | "retail" | "service" | "curved" | "solar" | "glass" | "highway";
};

export type LightingPreset = "Day" | "Golden hour" | "Night" | "Studio";

export const infrastructureLabels: Record<InfrastructureType, string> = {
  road: "Road",
  building: "Building",
  pavilion: "Pavilion",
  tree: "Tree",
  lamp: "Street light",
  water: "Waterway",
  bridge: "Pedestrian bridge",
  parking: "Parking",
  plaza: "Public plaza",
  vehicle: "Vehicle",
  fountain: "Fountain",
  roundabout: "Roundabout",
  path: "Pedestrian path",
  crosswalk: "Crosswalk",
  barrier: "Road barrier",
  bench: "Public bench",
  shrub: "Shrub bed",
  sidewalk: "Sidewalk",
  bikeLane: "Bike lane",
  busStop: "Bus stop",
  trafficLight: "Traffic signal",
  roadSign: "Road sign",
  ferrisWheel: "Ferris wheel",
};

export const makeInfrastructureObject = (
  id: number,
  type: InfrastructureType,
  x: number,
  z: number,
  overrides: Partial<InfrastructureObject> = {},
): InfrastructureObject => ({
  id,
  type,
  name: `${infrastructureLabels[type]} ${id}`,
  x,
  y: 0,
  z,
  rotation: 0,
  width: type === "road" ? 8 : type === "building" ? 10 : type === "crosswalk" ? 8 : 3,
  depth: type === "road" ? 12 : type === "building" ? 8 : type === "crosswalk" ? 4 : 3,
  height: type === "building" ? 5 : type === "tree" ? 4 : type === "lamp" ? 4 : 1,
  color: {
    road: "#343a40",
    building: "#d9e3e9",
    pavilion: "#b9dce1",
    tree: "#4f9a61",
    lamp: "#66737b",
    water: "#388da4",
    bridge: "#c3c4bd",
    parking: "#454b4e",
    plaza: "#c8c5bc",
    vehicle: "#708ca7",
    fountain: "#419cb5",
    roundabout: "#559366",
    path: "#c6c1ad",
    crosswalk: "#e8e5d8",
    barrier: "#c49e53",
    bench: "#9b6b3f",
    shrub: "#567e4e",
    sidewalk: "#b7b3a9",
    bikeLane: "#347dab",
    busStop: "#94b9c6",
    trafficLight: "#50565a",
    roadSign: "#d45145",
    ferrisWheel: "#f0ede2",
  }[type],
  visible: true,
  locked: false,
  ...overrides,
});

export function createInitialInfrastructure(): InfrastructureObject[] {
  const objects: InfrastructureObject[] = [];
  const add = (
    type: InfrastructureType,
    x: number,
    z: number,
    overrides: Partial<InfrastructureObject> = {},
  ) => objects.push(makeInfrastructureObject(objects.length + 1, type, x, z, overrides));

  add("road", 0, 24, {
    name: "South arterial · 6 lanes",
    width: 16,
    depth: 92,
    lanes: 6,
    path: [[-46, 0], [46, 0]],
  });
  add("road", -35, -38, {
    name: "Northwest elevated expressway",
    width: 12,
    depth: 48,
    height: 4,
    lanes: 4,
    style: "highway",
    path: [[-16, 18], [-5, 10], [7, 1], [21, -13]],
  });
  add("road", -25, 1, {
    name: "West access boulevard",
    width: 8,
    depth: 49,
    lanes: 2,
    path: [[-5, 23], [-5, 12], [-3, 5], [-3, -10], [2, -20]],
  });
  add("road", 25, 1, {
    name: "East access boulevard",
    width: 8,
    depth: 49,
    lanes: 2,
    path: [[5, 23], [5, 11], [3, 4], [3, -10], [-2, -20]],
  });
  add("road", 0, 0, {
    name: "North connector",
    width: 7,
    depth: 56,
    lanes: 2,
    path: [[0, 26], [0, 8], [2, -2], [0, -22]],
  });
  add("roundabout", -24, 4, { name: "West gateway roundabout", width: 8, depth: 8 });
  add("roundabout", 24, 4, { name: "East gateway roundabout", width: 8, depth: 8 });
  add("sidewalk", -35, 1, { name: "West pedestrian walk", width: 1.8, depth: 35 });
  add("sidewalk", 35, 1, { name: "East pedestrian walk", width: 1.8, depth: 35 });
  add("bikeLane", -31, 1, { name: "West cycle connection", width: 2.2, depth: 35 });
  add("crosswalk", -28, 24, { name: "West gateway crossing", width: 8, depth: 4 });
  add("crosswalk", 0, 24, { name: "Central avenue crossing", width: 8, depth: 4 });
  add("crosswalk", 28, 24, { name: "East gateway crossing", width: 8, depth: 4 });

  add("building", -27, -8, {
    name: "Casynus Central · curved commercial",
    width: 17,
    depth: 12,
    height: 7,
    color: "#e3e8e8",
    style: "curved",
  });
  add("building", 1, -8, {
    name: "Casynus Gallery · retail",
    width: 15,
    depth: 11,
    height: 6,
    color: "#c78f67",
    style: "retail",
  });
  add("building", 18, -11, {
    name: "North Market Hall",
    width: 11,
    depth: 9,
    height: 5,
    color: "#b7c7ce",
    style: "solar",
  });
  add("building", 25, -1, {
    name: "East Commerce House",
    width: 9,
    depth: 8,
    height: 5,
    color: "#d9d6ca",
    style: "service",
  });
  add("building", -17, -19, {
    name: "Garden Pavilion",
    width: 10,
    depth: 7,
    height: 4,
    color: "#d5e4e6",
    style: "glass",
  });
  add("building", 17, -21, {
    name: "South Service Hall",
    width: 9,
    depth: 6,
    height: 3.5,
    color: "#c4cdd0",
    style: "service",
  });
  add("building", 8, -17, {
    name: "Riverside food hall",
    width: 8,
    depth: 6,
    height: 4,
    color: "#c8b18b",
    style: "retail",
  });

  add("water", -8, -1, {
    name: "Willow Creek",
    width: 3.8,
    depth: 44,
    color: "#388da4",
    path: [[0, 22], [-2, 14], [1, 7], [4, 1], [2, -7], [5, -14], [2, -22]],
  });
  add("bridge", -7, -2, { name: "Willow Creek footbridge", width: 7, depth: 1.8, height: 2.3 });
  add("path", 0, 2, {
    name: "Riverside promenade",
    width: 2.2,
    depth: 38,
    color: "#c6c1ad",
    path: [[-4, 18], [-1, 12], [-2, 4], [2, -3], [1, -10], [4, -18]],
  });
  add("plaza", 6, 5, { name: "Central civic plaza", width: 16, depth: 10, color: "#c8c5bc" });
  add("fountain", 7, 4, { name: "Civic fountain", width: 3.5, depth: 3.5, height: 1.2 });
  add("bench", 11, 7, { name: "Plaza bench", width: 1.8, depth: 0.6, height: 1 });
  add("shrub", 3, 10, { name: "Plaza planting bed", width: 3.5, depth: 1.4, height: 0.9 });
  add("barrier", 36, 18, { name: "East road guardrail", width: 8, depth: 0.25, height: 1.1 });
  add("pavilion", 8, -1, { name: "Glass event pavilion", width: 8, depth: 7, height: 4.5 });
  add("pavilion", -10, 10, { name: "Garden rotunda", width: 5.5, depth: 5.5, height: 4 });
  add("ferrisWheel", 1, -27, { name: "Willow Creek observation wheel", width: 12, depth: 3, height: 14 });
  add("busStop", 13, 20, { name: "Willow Creek transit stop", width: 2.8, depth: 1.4, height: 2.6 });
  add("trafficLight", -1.8, 19, { name: "Central crossing signal", width: 0.4, depth: 0.4, height: 4.2 });
  add("roadSign", 31, 18.5, { name: "District wayfinding sign", width: 1.2, depth: 0.2, height: 2.5 });
  add("parking", 27, 8, { name: "East visitor parking", width: 18, depth: 13, color: "#454b4e" });
  add("parking", -29, 10, { name: "West visitor parking", width: 13, depth: 10, color: "#454b4e" });

  const trees: Array<[number, number, number]> = [
    [-39, -14, 1.1], [-37, -7, 0.9], [-38, 2, 1.05], [-37, 12, 0.9],
    [-34, -22, 0.9], [-31, -23, 1.1], [-24, -23, 0.85], [-15, -23, 1.2],
    [-8, -21, 0.9], [0, -23, 1.15], [9, -24, 0.9], [27, -22, 1.1],
    [35, -20, 0.9], [37, -11, 1.15], [38, -3, 0.9], [37, 7, 1.1],
    [36, 16, 0.95], [-18, 8, 0.9], [-16, 15, 1.1], [-12, 18, 0.8],
    [13, 13, 1.05], [17, 15, 0.9], [20, 14, 1.15], [10, -16, 0.85],
    [-10, -13, 0.85], [12, 2, 0.8], [-20, -3, 1.1], [-21, 5, 0.85],
    [-14, -5, 0.9], [-13, 2, 0.95], [-5, 15, 0.85], [2, 13, 1.05],
    [15, 7, 0.9], [18, 4, 1.1], [21, 1, 0.85], [29, -16, 0.95],
    [-30, -18, 0.8], [-28, -15, 0.95], [31, -6, 0.9], [32, 2, 0.85],
    [-34, 7, 0.8], [-33, 15, 0.9], [33, 11, 0.85], [28, -2, 0.9],
  ];
  trees.forEach(([x, z, scale], index) =>
    add("tree", x, z, { name: `Landscape tree ${String(index + 1).padStart(2, "0")}`, width: scale, depth: scale, height: 4 * scale }),
  );

  [[-34, 20], [-19, 20], [-3, 20], [14, 20], [32, 20], [-32, -3], [33, -5], [-12, -20], [11, -22], [33, 13]].forEach(
    ([x, z], index) => add("lamp", x, z, { name: `Path light ${String(index + 1).padStart(2, "0")}`, height: 4 }),
  );
  [[-36, 22], [-25, 22], [-12, 22], [2, 22], [17, 22], [31, 22], [39, 22]].forEach(
    ([x, z], index) => add("vehicle", x, z, { name: `Arterial vehicle ${index + 1}`, width: 2.1, depth: 4.3, height: 1.2, color: ["#f3f3ed", "#6d8fbd", "#d58c59", "#89958c"][index % 4] }),
  );
  add("vehicle", 26, 8, { name: "Parking vehicle", width: 2, depth: 4, height: 1.2, color: "#d2d8d7", rotation: Math.PI / 2 });
  [
    [21, 5], [25, 5], [29, 5], [33, 5], [21, 11], [25, 11], [29, 11], [33, 11],
    [-33, 7], [-29, 7], [-25, 7], [-33, 12], [-29, 12],
  ].forEach(([x, z], index) =>
    add("vehicle", x, z, {
      name: `Visitor parking vehicle ${String(index + 1).padStart(2, "0")}`,
      width: 1.85,
      depth: 3.9,
      height: 1.15,
      color: ["#e7e5dc", "#718aa1", "#9c5d4c", "#929985", "#c8b891"][index % 5],
      rotation: Math.PI / 2,
    }),
  );

  return objects;
}
