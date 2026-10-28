# 3D AI Texturing Pipeline & Shader Configuration Guide
*Technical Director & Lead 3D Texture Artist Specification*

This guide establishes the production-grade workflow, AI prompt frameworks, shader parameters, and conversion pipelines for generating game-ready texture maps across four essential rendering and material styles:
1. **Normal Map (Tangent Space)**
2. **Albedo Map (Diffuse / Pure Base Color)**
3. **MatCap (Material Capture / Viewport Sculpt Shading)**
4. **Solid with Cavity (Clay / Crevice Shading)**

---

## 1. Tangent Space Normal Map Pipeline

A tangent-space normal map encodes micro-surface geometric orientations into 8-bit RGB color channels:
- **Red (R)**: Tangent X vector (Horizontal slope: Left `0` / Right `255`, neutral `128`)
- **Green (G)**: Bitangent Y vector (Vertical slope: DirectX uses Y-down, OpenGL/Blender/Three.js/Casynus uses Y-up)
- **Blue (B)**: Normal Z vector (Surface depth facing camera: typically `128-255`, flat neutral is `(128, 128, 255) = #8080FF`)

### A. AI Generation Strategy & Prompt Set
Direct generation of tangent normal maps with raw text-to-image AI can introduce illegal non-unit vectors (`length != 1.0`). The recommended production workflow uses **height-to-normal diffusion** or **multi-view displacement estimation**:

#### Recommended Prompt Structure (Displacement / Tangent Normal):
```text
tangent-space normal map, 3D surface relief, micro-surface normal map texture, seamless PBR texture map, purple blue vector field, 8k resolution, flat lighting, clean vector normals, #8080ff neutral background, accurate bevel details, no shadows, no specular highlights, high-frequency micro details, mechanical paneling / organic pore structure
```

#### Negative Prompt:
```text
directional lighting, baked shadows, ambient occlusion, photographic shading, color variation, specular glare, soft gradient blur, non-normal colors, artifacts, seams, watermark
```

### B. Post-Processing & Vector Normalization (Blender / Python / Substance)
1. **Vector Length Normalization**: Ensure every pixel satisfies $\sqrt{R^2 + G^2 + B^2} = 1.0$.
2. **OpenGL vs. DirectX Inversion**:
   - Casynus, Blender, Unreal Engine, and WebGL expect **OpenGL** (Green = `+Y`).
   - If using DirectX assets (3ds Max, standard Unity), invert the Green channel: `G_inverted = 255 - G`.
3. **Height/Bump to Normal Conversion (Blender Shader Graph)**:
   - Connect height texture $\to$ `Vector > Bump Node` (set Strength: `1.0`, Distance: `0.02` to `0.05`).
   - Connect `Bump.Normal` $\to$ `Principled BSDF.Normal`.
   - Bake mode: *Bake Type = Normal*, *Space = Tangent*.

---

## 2. Albedo / Diffuse (Pure Base Color) Map

The Albedo map represents the intrinsic surface reflectance of non-metals and conductive base color of metals, **completely devoid of shadows, directional lighting, ambient occlusion, or specular highlights**.

### A. AI Generation Strategy & De-lighting Workflow
When generating textures with AI tools (Stable Diffusion, Midjourney, ComfyUI, Meshy, Tripo):

#### Prompt Structure:
```text
pure albedo texture map, flat diffuse base color, shadowless, uniform overcast diffuse illumination, completely de-lit, neutral lighting, calibrated color values, raw surface pigment, PBR base color standard, photogrammetry delit texture, 8k, crisp detail, non-directional lighting
```

#### Negative Prompt:
```text
harsh directional shadows, baked ambient occlusion, cast shadows, sun glare, specular shine, reflections, flashlight glare, high contrast chiaroscuro, bloom
```

### B. Calibrated PBR Values & Color Space
- **Color Space**: sRGB with sRGB gamma transfer.
- **Dielectric (Non-metal) Luminance Range**: Albedo values should stay within **30 to 240 sRGB** (avoid pure black `0` and pure blown-out white `255`).
  - Dark charcoal/soil: ~`50, 50, 50`
  - Fresh snow: ~`230, 230, 230`
- **Metals (Conductors)**: Have high specular base colors:
  - Gold: `(255, 226, 158)`
  - Iron / Steel: `(198, 202, 207)`
  - Copper: `(250, 209, 194)`

### C. Blender & Casynus Material Binding:
- Connect Albedo map directly to `Principled BSDF -> Base Color`.
- In Casynus: Slot `map` (base color) in the Material Inspector.

---

## 3. MatCap (Material Capture) Viewport Shader

MatCap captures all complex lighting, reflections, fresnel falloff, and surface material shading inside a single pre-baked 2D spherical texture. The shader maps the camera-space surface normals directly to the UV coordinates of this sphere.

### A. MatCap UV Mapping Formula (GLSL / Three.js / Blender Shader)
Given the camera-space normal $N_{view} = (N_x, N_y, N_z)$:
$$U = 0.5 \cdot N_x + 0.5$$
$$V = 0.5 \cdot N_y + 0.5$$

### B. AI Generation Strategy for MatCap Spheres
To generate a MatCap sphere texture via 2D AI image generators:

#### Prompt Structure:
```text
matcap sphere texture, material capture sphere, perfectly centered smooth 3D sphere on pure black background, studio rim lighting, subtle rim light, soft specular highlight top-left, clay wax sculpting shader preview, ZBrush matcap style, orthographic projection, no perspective distortion, seamless circular vignette
```

#### Negative Prompt:
```text
flat disk, square, oblong sphere, off-center, harsh background, complex scenery, text, cropped sphere edges
```

### C. Blender Viewport & Material Setup
1. **Native Viewport**: Set Viewport Shading to `Solid` $\to$ Lighting: `MatCap` $\to$ choose preset or click gear icon to load custom `.exr` / `.png`.
2. **Custom Shader Graph Setup (Eevee / Cycles)**:
   - Add `Input > Texture Coordinate` node. Use the `Normal` output.
   - Route through `Vector Transform` (Type: `Vector`, Convert from: `World`, Convert to: `Camera`).
   - Add `Vector Math` (Operation: `Multiply`, Value: `(0.5, 0.5, 0)`).
   - Add `Vector Math` (Operation: `Add`, Value: `(0.5, 0.5, 0)`).
   - Route into `Texture > Image Texture` (set interpolation to `Linear` or `Smart`).
   - Route Color into `Emission` or `Surface` output.

---

## 4. Solid with Cavity (Clay / Crevice Shading)

A neutral architectural/sculptor preview style that renders the geometry in uniform clay or matte plaster, dramatically accentuating micro-crevices, crevices, and sharp convex edges through combined **Ambient Occlusion (AO)** and **Curvature / Cavity** maps.

### A. Texture Components
- **Base Clay Color**: Neutral warm grey / buff clay (`#B8B2A8` or `#8C867A`).
- **Cavity / Crevice Factor (Concave)**: Multiplies darkness into tight cracks, seams, and corners.
- **Edge Highlighting (Convex)**: Lighter tint on prominent silhouette ridges and bevels.

### B. AI Generation & Prompt Modifiers
For generating curvature and cavity textures or stylized clay renders:

#### Prompt Structure:
```text
clay sculpt render with cavity map shading, ZBrush clay preview, ambient occlusion crevice pass, neutral warm grey plaster matte surface, soft contact shadows, pronounced curvature highlights, crisp edge bevels, dirty crevices, architectural model clay finish, studio softbox ambient light
```

#### Negative Prompt:
```text
high gloss, metallic reflections, colored paint, chromatic aberration, deep black shadows, noise, low resolution
```

### C. Blender Procedural Clay & Cavity Shader Setup
1. **Geometry & Pointiness Node**:
   - Add `Input > Geometry`.
   - Take the `Pointiness` output (for high-poly meshes) or use `Input > Ambient Occlusion`.
2. **Color Ramp Balancing**:
   - Feed `Pointiness` into a `Converter > Color Ramp`.
   - Left stop: `0.45` (Black/Dark Brown for deep crevices).
   - Middle stop: `0.50` (Neutral Clay tone `#9C968F`).
   - Right stop: `0.58` (Light Chalk `#DCD7D0` for highlighted ridges).
3. **Principled BSDF Configuration**:
   - `Roughness`: `0.85` (chalky matte).
   - `Specular IOR Level`: `0.2`.
   - `Subsurface Weight`: `0.05` (subtle wax/clay translucency).

---

## 5. Summary Matrix for 3D AI Texturing Tools

| Map Type | Target Slot | Neutral / Range | Key Conversion / Math |
| :--- | :--- | :--- | :--- |
| **Normal Map** | `normalMap` | `(128, 128, 255)` / `#8080FF` | Tangent space vector normalization, Green channel OpenGL (+Y). |
| **Albedo Map** | `map` (Base Color) | `30 - 240` sRGB (Dielectrics) | Strip all shadows, diffuse-only reflectance, calibrated values. |
| **MatCap** | Custom / Viewport | Normalized view sphere | $UV = 0.5 \cdot N_{cam} + 0.5$, single-texture lighting bake. |
| **Solid Cavity** | `aoMap` + Clay Diffuse | Crevice `0.0` - Peak `1.0` | Invert curvature for concave crevices; multiply with clay tone. |
