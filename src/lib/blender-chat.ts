export type BlenderChatResponse = {
 id: string;
 prompt: string;
 mode: BlenderChatMode;
 title: string;
 summary: string;
 script: string;
 objects: string[];
 warnings: string[];
};

export type BlenderChatMode = "new_scene" | "add_to_scene";

export type BlenderSceneContext = {
 objectNames?: string[];
};

function cleanPrompt(prompt: string) {
 return prompt.trim().replace(/\s+/g, " ").slice(0, 1200);
}

function hasAny(value: string, words: string[]) {
 return words.some((word) => value.includes(word));
}

function escapePythonString(value: string) {
 return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");
}

function normalizeMode(mode: unknown): BlenderChatMode {
 return mode === "add_to_scene" ? "add_to_scene" : "new_scene";
}

function inferScene(prompt: string) {
 const lower = prompt.toLowerCase();
 const isWorkspace = hasAny(lower, ["workspace", "studio", "lab", "command center", "showroom", "product scene"]);
 const isRoom = isWorkspace || hasAny(lower, ["room", "interior", "house", "apartment", "studio"]);
 const isProduct = hasAny(lower, ["product", "bottle", "chair", "lamp", "phone", "watch"]);
 const isCity = hasAny(lower, ["city", "street", "building", "architecture", "urban"]);
 const wantsSculptures = hasAny(lower, ["sculpture", "statue", "sculptures"]);
 const wantsTrees = hasAny(lower, ["tree", "forest", "park", "landscape"]);

 if (isWorkspace) {
 return {
 title: "AI Workspace Lab",
 objects: ["workspace shell", "white walls", "technical floor", "area lights", wantsSculptures ? "reference objects" : "display panels"],
 kind: "workspace",
 };
 }

 if (isCity) {
 return {
 title: "AI Architectural Massing",
 objects: ["street plane", "building masses", "glass tower", "sun light", "camera"],
 kind: "city",
 };
 }

 if (isProduct) {
 return {
 title: "AI Product Stage",
 objects: ["product pedestal", "hero object", "backdrop", "studio lights", "camera"],
 kind: "product",
 };
 }

 if (wantsTrees) {
 return {
 title: "AI Landscape Scene",
 objects: ["terrain", "trees", "path", "sun light", "camera"],
 kind: "landscape",
 };
 }

 if (isRoom) {
 return {
 title: "AI Interior Room",
 objects: ["room shell", "floor", "wall panels", "area light", "camera"],
 kind: "room",
 };
 }

 return {
 title: "AI 3D Scene",
 objects: ["ground plane", "primary forms", "materials", "lights", "camera"],
 kind: "abstract",
 };
}

export function generateBlenderSceneScript(promptInput: string): BlenderChatResponse {
 const prompt = cleanPrompt(promptInput);
 const scene = inferScene(prompt);
 const safePrompt = escapePythonString(prompt || "Create a clean 3D scene");
 const safeTitle = escapePythonString(scene.title);
 const safeKind = escapePythonString(scene.kind);

 const script = `import bpy
import math

PROMPT = "${safePrompt}"
SCENE_TITLE = "${safeTitle}"
SCENE_KIND = "${safeKind}"

def clear_scene():
 bpy.ops.object.select_all(action="SELECT")
 bpy.ops.object.delete()

def make_material(name, color, roughness=0.55):
 material = bpy.data.materials.new(name)
 material.use_nodes = True
 bsdf = material.node_tree.nodes.get("Principled BSDF")
 if bsdf:
 bsdf.inputs["Base Color"].default_value = color
 bsdf.inputs["Roughness"].default_value = roughness
 return material

def add_cube(name, location, scale, material):
 bpy.ops.mesh.primitive_cube_add(size=1, location=location)
 obj = bpy.context.object
 obj.name = name
 obj.scale = scale
 obj.data.materials.append(material)
 return obj

def add_uv_sphere(name, location, scale, material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=location)
 obj = bpy.context.object
 obj.name = name
 obj.scale = scale
 obj.data.materials.append(material)
 return obj

def add_cylinder(name, location, radius, depth, material):
 bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth, location=location)
 obj = bpy.context.object
 obj.name = name
 obj.data.materials.append(material)
 return obj

def add_light(name, location, energy, size=4):
 bpy.ops.object.light_add(type="AREA", location=location)
 light = bpy.context.object
 light.name = name
 light.data.energy = energy
 light.data.size = size
 return light

def add_camera(location, rotation):
 bpy.ops.object.camera_add(location=location, rotation=rotation)
 bpy.context.scene.camera = bpy.context.object
 return bpy.context.object

def add_label(text, location):
 bpy.ops.object.text_add(location=location, rotation=(math.radians(70), 0, 0))
 label = bpy.context.object
 label.name = "Prompt Label"
 label.data.body = text[:180]
 label.data.align_x = "CENTER"
 label.data.size = 0.18
 label.data.materials.append(make_material("Label Black", (0.02, 0.02, 0.02, 1), 0.4))
 return label

def build_workspace_scene(mats):
 floor = add_cube("Technical Floor", (0, 0, -0.08), (5.5, 4.0, 0.08), mats["concrete"])
 back_wall = add_cube("White Back Wall", (0, 2.05, 1.35), (5.5, 0.08, 1.45), mats["wall"])
 left_wall = add_cube("Left Wall", (-2.8, 0, 1.35), (0.08, 4.0, 1.45), mats["wall"])
 right_wall = add_cube("Right Wall", (2.8, 0, 1.35), (0.08, 4.0, 1.45), mats["wall"])
 add_cube("Module Plinth 01", (-1.5, 0.35, 0.35), (0.45, 0.45, 0.35), mats["stone"])
 add_cube("Module Plinth 02", (0, 0.1, 0.45), (0.55, 0.55, 0.45), mats["stone"])
 add_cube("Module Plinth 03", (1.5, 0.35, 0.35), (0.45, 0.45, 0.35), mats["stone"])
 add_uv_sphere("Reference Object 01", (-1.5, 0.35, 0.95), (0.28, 0.28, 0.42), mats["blue"])
 add_cylinder("Reference Object 02", (0, 0.1, 1.12), 0.22, 0.7, mats["dark"])
 add_uv_sphere("Reference Object 03", (1.5, 0.35, 0.95), (0.35, 0.2, 0.35), mats["glass"])
 for index, x in enumerate([-1.8, 0, 1.8]):
 add_cube(f"Interface Panel {index + 1}", (x, 1.96, 1.45), (0.55, 0.03, 0.38), mats["panel"])
 for index, x in enumerate([-2.0, 0, 2.0]):
 add_light(f"Workspace Area Light {index + 1}", (x, -0.8, 3.2), 350, 1.1)

def build_city_scene(mats):
 add_cube("Street Plane", (0, 0, -0.04), (5.5, 4.0, 0.04), mats["concrete"])
 heights = [1.1, 1.8, 1.35, 2.3, 1.55, 1.0]
 for index, height in enumerate(heights):
 x = -2.0 + index * 0.8
 y = 0.45 if index % 2 == 0 else 1.15
 mat = mats["glass"] if index % 3 == 0 else mats["stone"]
 add_cube(f"Building Mass {index + 1}", (x, y, height / 2), (0.32, 0.32, height / 2), mat)
 add_cube("Main Road", (0, -0.75, 0.01), (5.5, 0.22, 0.02), mats["dark"])
 add_light("Sun Wash", (-2.5, -3, 4), 650, 5)

def build_product_scene(mats):
 add_cube("Studio Backdrop", (0, 1.25, 1.15), (3.6, 0.08, 1.3), mats["wall"])
 add_cube("Product Pedestal", (0, 0, 0.32), (0.9, 0.9, 0.32), mats["stone"])
 add_cylinder("Hero Product Body", (0, 0, 1.0), 0.32, 1.05, mats["blue"])
 add_cube("Product Cap", (0, 0, 1.62), (0.22, 0.22, 0.08), mats["dark"])
 add_light("Key Softbox", (-1.6, -1.8, 2.8), 500, 3.2)
 add_light("Rim Light", (1.8, 1.4, 2.4), 220, 1.6)

def build_landscape_scene(mats):
 add_cube("Terrain", (0, 0, -0.06), (5.5, 4.0, 0.06), mats["grass"])
 add_cube("Path", (0, -0.6, 0.01), (0.45, 2.8, 0.02), mats["stone"])
 for index, x in enumerate([-2.0, -1.2, -0.35, 0.85, 1.65, 2.2]):
 y = 0.25 + (index % 3) * 0.55
 add_cylinder(f"Tree Trunk {index + 1}", (x, y, 0.38), 0.08, 0.75, mats["wood"])
 add_uv_sphere(f"Tree Crown {index + 1}", (x, y, 0.95), (0.38, 0.38, 0.38), mats["grass"])
 add_light("Landscape Sun", (-2.3, -2.5, 4.2), 700, 5)

def build_room_scene(mats):
 add_cube("Floor", (0, 0, -0.08), (4.5, 3.2, 0.08), mats["wood"])
 add_cube("Back Wall", (0, 1.65, 1.25), (4.5, 0.08, 1.35), mats["wall"])
 add_cube("Left Wall", (-2.3, 0, 1.25), (0.08, 3.2, 1.35), mats["wall"])
 add_cube("Desk Block", (-0.85, 0.25, 0.38), (0.75, 0.35, 0.25), mats["stone"])
 add_cube("Shelf Block", (1.05, 1.55, 1.35), (0.8, 0.08, 0.16), mats["dark"])
 add_uv_sphere("Decor Object", (0.85, 0.25, 0.65), (0.22, 0.22, 0.22), mats["blue"])
 add_light("Room Area Light", (0, -1.6, 3), 450, 4)

def build_abstract_scene(mats):
 add_cube("Ground Plane", (0, 0, -0.05), (5, 3.5, 0.05), mats["concrete"])
 add_cube("Primary Block", (-0.8, 0.2, 0.55), (0.55, 0.55, 0.55), mats["blue"])
 add_uv_sphere("Secondary Sphere", (0.55, 0.1, 0.62), (0.42, 0.42, 0.42), mats["clay"])
 add_cylinder("Vertical Form", (1.45, 0.25, 0.72), 0.22, 1.3, mats["dark"])
 add_light("Studio Area Light", (-2, -2, 3.5), 520, 4)

clear_scene()
bpy.context.scene.name = SCENE_TITLE

mats = {
 "wall": make_material("Warm White Wall", (0.92, 0.92, 0.88, 1), 0.62),
 "wood": make_material("Soft Wood", (0.52, 0.34, 0.19, 1), 0.5),
 "stone": make_material("Matte Stone", (0.64, 0.66, 0.66, 1), 0.72),
 "clay": make_material("Terracotta Clay", (0.72, 0.35, 0.22, 1), 0.68),
 "blue": make_material("Cedium Blue", (0.1, 0.52, 0.9, 1), 0.45),
 "dark": make_material("Graphite", (0.03, 0.035, 0.04, 1), 0.5),
 "panel": make_material("Interface Panel Surface", (0.82, 0.84, 0.88, 1), 0.4),
 "concrete": make_material("Concrete", (0.48, 0.5, 0.52, 1), 0.75),
 "glass": make_material("Blue Glass", (0.28, 0.55, 0.78, 0.7), 0.2),
 "grass": make_material("Deep Green", (0.18, 0.42, 0.22, 1), 0.7),
}

if SCENE_KIND == "workspace":
 build_workspace_scene(mats)
elif SCENE_KIND == "city":
 build_city_scene(mats)
elif SCENE_KIND == "product":
 build_product_scene(mats)
elif SCENE_KIND == "landscape":
 build_landscape_scene(mats)
elif SCENE_KIND == "room":
 build_room_scene(mats)
else:
 build_abstract_scene(mats)

add_label(PROMPT, (0, -1.9, 0.04))
add_camera((3.8, -4.2, 2.6), (math.radians(60), 0, math.radians(42)))

bpy.context.scene.render.engine = "CYCLES"
bpy.context.scene.cycles.samples = 64
bpy.context.scene.view_settings.view_transform = "Filmic"
bpy.context.scene.render.resolution_x = 1600
bpy.context.scene.render.resolution_y = 1000

for obj in bpy.context.scene.objects:
 obj.select_set(False)

print(f"Cedium AI generated scene: {SCENE_TITLE} from prompt: {PROMPT}")
`;

 return {
 id: `blender-scene-${Date.now()}`,
 prompt,
 mode: "new_scene",
 title: scene.title,
 summary: `${scene.title} generated with ${scene.objects.join(", ")}.`,
 script,
 objects: scene.objects,
 warnings: ["Local template generator. Replace with a real 3D provider when configured."],
 };
}

function inferAdditions(prompt: string) {
 const lower = prompt.toLowerCase();
 const additions: Array<"chair" | "table" | "plant" | "light" | "sculpture" | "displayPanel" | "window" | "roof"> = [];

 if (hasAny(lower, ["chair", "chairs", "seat", "seating"])) additions.push("chair");
 if (hasAny(lower, ["table", "desk", "coffee table"])) additions.push("table");
 if (hasAny(lower, ["plant", "plants", "tree", "green"])) additions.push("plant");
 if (hasAny(lower, ["light", "lights", "spotlight", "lamp", "warm"])) additions.push("light");
 if (hasAny(lower, ["sculpture", "statue", "object", "art piece"])) additions.push("sculpture");
 if (hasAny(lower, ["panel", "screen", "interface", "dashboard", "poster", "frame"])) additions.push("displayPanel");
 if (hasAny(lower, ["window", "glass", "view"])) additions.push("window");
 if (hasAny(lower, ["roof", "ceiling", "skylight"])) additions.push("roof");

 return additions.length ? additions : ["sculpture", "light"];
}

export function generateBlenderChatScript(
 promptInput: string,
 options: { mode?: unknown; sceneContext?: BlenderSceneContext } = {},
): BlenderChatResponse {
 const mode = normalizeMode(options.mode);
 if (mode === "new_scene") return generateBlenderSceneScript(promptInput);

 const prompt = cleanPrompt(promptInput);
 const additions = inferAdditions(prompt);
 const existingCount = options.sceneContext?.objectNames?.length ?? 0;
 const safePrompt = escapePythonString(prompt || "Add details to the current scene");
 const safeObjects = options.sceneContext?.objectNames?.slice(0, 20).map(escapePythonString) ?? [];
 const safeExistingObjects = safeObjects.map((name) => `"${name}"`).join(", ");
 const additionList = additions.map((item) => `"${item}"`).join(", ");

 const script = `import bpy
import math

PROMPT = "${safePrompt}"
EXISTING_OBJECTS = [${safeExistingObjects}]
ADDITIONS = [${additionList}]

def make_material(name, color, roughness=0.55):
 material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
 material.use_nodes = True
 bsdf = material.node_tree.nodes.get("Principled BSDF")
 if bsdf:
 bsdf.inputs["Base Color"].default_value = color
 bsdf.inputs["Roughness"].default_value = roughness
 return material

def add_cube(name, location, scale, material):
 bpy.ops.mesh.primitive_cube_add(size=1, location=location)
 obj = bpy.context.object
 obj.name = name
 obj.scale = scale
 obj.data.materials.append(material)
 return obj

def add_sphere(name, location, scale, material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=location)
 obj = bpy.context.object
 obj.name = name
 obj.scale = scale
 obj.data.materials.append(material)
 return obj

def add_cylinder(name, location, radius, depth, material):
 bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth, location=location)
 obj = bpy.context.object
 obj.name = name
 obj.data.materials.append(material)
 return obj

def add_area_light(name, location, energy, size):
 bpy.ops.object.light_add(type="AREA", location=location)
 light = bpy.context.object
 light.name = name
 light.data.energy = energy
 light.data.size = size
 return light

def next_position(index):
 x_positions = [-1.8, -0.65, 0.65, 1.8]
 x = x_positions[index % len(x_positions)]
 y = -0.75 + (index // len(x_positions)) * 0.65
 return x, y

materials = {
 "wood": make_material("AI Add Wood", (0.45, 0.28, 0.15, 1), 0.55),
 "fabric": make_material("AI Add Fabric", (0.12, 0.38, 0.72, 1), 0.68),
 "leaf": make_material("AI Add Leaf", (0.18, 0.42, 0.22, 1), 0.72),
 "clay": make_material("AI Add Clay", (0.72, 0.35, 0.22, 1), 0.66),
 "frame": make_material("AI Add Frame", (0.04, 0.04, 0.045, 1), 0.5),
 "glass": make_material("AI Add Glass", (0.55, 0.75, 0.9, 0.65), 0.22),
 "white": make_material("AI Add White", (0.9, 0.9, 0.86, 1), 0.6),
}

created = []
slot = 0

for addition in ADDITIONS:
 x, y = next_position(slot)
 slot += 1

 if addition == "chair":
 created.append(add_cube("AI Added Chair Seat", (x, y, 0.38), (0.32, 0.32, 0.12), materials["fabric"]))
 created.append(add_cube("AI Added Chair Back", (x, y + 0.22, 0.68), (0.32, 0.08, 0.32), materials["fabric"]))
 created.append(add_cube("AI Added Chair Legs", (x, y, 0.18), (0.26, 0.26, 0.16), materials["wood"]))
 elif addition == "table":
 created.append(add_cube("AI Added Table Top", (x, y, 0.5), (0.58, 0.38, 0.06), materials["wood"]))
 created.append(add_cube("AI Added Table Base", (x, y, 0.26), (0.12, 0.12, 0.24), materials["wood"]))
 elif addition == "plant":
 created.append(add_cylinder("AI Added Plant Pot", (x, y, 0.28), 0.18, 0.32, materials["clay"]))
 created.append(add_sphere("AI Added Plant Crown", (x, y, 0.72), (0.34, 0.34, 0.34), materials["leaf"]))
 elif addition == "light":
 created.append(add_area_light("AI Added Warm Area Light", (x, y - 0.6, 2.4), 280, 2.0))
 elif addition == "sculpture":
 created.append(add_cube("AI Added Sculpture Plinth", (x, y, 0.28), (0.32, 0.32, 0.28), materials["white"]))
 created.append(add_sphere("AI Added Sculpture", (x, y, 0.72), (0.24, 0.18, 0.34), materials["clay"]))
 elif addition == "displayPanel":
 created.append(add_cube("AI Added Interface Panel", (x, 1.92, 1.38), (0.5, 0.03, 0.34), materials["glass"]))
 created.append(add_cube("AI Added Panel Frame", (x, 1.9, 1.38), (0.56, 0.025, 0.4), materials["frame"]))
 elif addition == "window":
 created.append(add_cube("AI Added Window Glass", (x, 1.93, 1.48), (0.52, 0.03, 0.42), materials["glass"]))
 created.append(add_cube("AI Added Window Frame", (x, 1.9, 1.48), (0.6, 0.025, 0.48), materials["frame"]))
 elif addition == "roof":
 created.append(add_cube("AI Added Ceiling Plane", (0, 0, 2.55), (2.6, 2.0, 0.05), materials["white"]))
 created.append(add_cube("AI Added Skylight", (0, 0.05, 2.58), (0.85, 0.5, 0.035), materials["glass"]))

for obj in created:
 obj.select_set(True)

print(f"Cedium AI added {len(created)} objects from prompt: {PROMPT}. Existing context objects: {len(EXISTING_OBJECTS)}")
`;

 return {
 id: `blender-add-${Date.now()}`,
 prompt,
 mode: "add_to_scene",
 title: "AI Scene Addition",
 summary: `Added ${additions.join(", ")} to the current Blender scene using ${existingCount} existing context objects.`,
 script,
 objects: additions,
 warnings: ["Add mode preserves the current scene and adds template geometry only."],
 };
}
