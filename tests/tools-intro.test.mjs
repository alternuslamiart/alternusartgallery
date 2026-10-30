import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("public/introduction.png exists and is a valid image asset", () => {
  const introPath = path.resolve(process.cwd(), "public/introduction.png");
  assert.ok(fs.existsSync(introPath), "public/introduction.png must exist");

  const stat = fs.statSync(introPath);
  assert.ok(stat.size > 1000, "public/introduction.png should have non-trivial size");

  // Verify PNG header
  const buf = fs.readFileSync(introPath);
  assert.equal(buf[0], 0x89);
  assert.equal(buf[1], 0x50); // P
  assert.equal(buf[2], 0x4e); // N
  assert.equal(buf[3], 0x47); // G
});

test("tools-intro-modal defines required specifications and dimensions", () => {
  const modalSourcePath = path.resolve(process.cwd(), "src/components/tools-intro-modal.tsx");
  assert.ok(fs.existsSync(modalSourcePath), "tools-intro-modal.tsx must exist");

  const content = fs.readFileSync(modalSourcePath, "utf-8");

  // Verify outer frame 412x540px, corner 16px
  assert.ok(content.includes("412"), "Must specify width 412px");
  assert.ok(content.includes("540"), "Must specify height 540px");
  assert.ok(content.includes("16") && content.includes("borderRadius: 16"), "Must specify border radius 16px for outer frame");

  // Verify intro video/image frame 372x192px, corner 12px
  assert.ok(content.includes("372"), "Must specify width 372px");
  assert.ok(content.includes("192"), "Must specify height 192px");
  assert.ok(content.includes("borderRadius: 12"), "Must specify corner 12px for intro frame");
  assert.ok(content.includes("/introduction.png"), "Must reference introduction image");

  // Verify frame icon 64x64px
  assert.ok(content.includes("width: 64") && content.includes("height: 64"), "Must specify frame icon 64x64px");

  // Verify scroll button icon 64x24px, circle 16x16px
  assert.ok(content.includes("width: 64") && content.includes("height: 24"), "Must specify scroll button container 64x24px");
  assert.ok(content.includes("width: 16") && content.includes("height: 16"), "Must specify circle buttons 16x16px");
  assert.ok(content.includes("minHeight: 16") && content.includes("maxHeight: 16"), "Must constrain circle button height to prevent oval stretching");
  assert.ok(content.includes('aspectRatio: "1 / 1"'), "Must enforce 1:1 aspect ratio on circle buttons");
  assert.ok(content.includes(".tools-intro-circle-btn"), "Must have scoped circle button class to override external button rules");

  // Verify header title 1 (16px), line 2 (12px Roboto)
  assert.ok(content.includes("fontSize: 16"), "Must specify header title 1 font size 16px");
  assert.ok(content.includes("fontSize: 12"), "Must specify header line 2 font size 12px");
  assert.ok(content.includes("Roboto"), "Must specify Roboto font family for header line 2");

  // Verify Architecture, Sketch, and Infrastructure Tools titles
  assert.ok(content.includes("Architecture Tools"), "Must contain Architecture Tools header");
  assert.ok(content.includes("Sketch Studio Tools"), "Must contain Sketch Studio Tools header");
  assert.ok(content.includes("Infrastructure Tools"), "Must contain Infrastructure Tools header");
  assert.ok(content.includes("Continue learn another tools"), "Must contain Continue learn another tools action");
});

test("home-tool-marquee triggers intro modal on hover", () => {
  const marqueeSourcePath = path.resolve(process.cwd(), "src/components/home-tool-marquee.tsx");
  assert.ok(fs.existsSync(marqueeSourcePath), "home-tool-marquee.tsx must exist");

  const content = fs.readFileSync(marqueeSourcePath, "utf-8");
  assert.ok(content.includes("ToolsIntroModal"), "Must import ToolsIntroModal");
  assert.ok(content.includes("onMouseEnter"), "Must trigger on mouse hover");
  assert.ok(content.includes("handleMouseEnter"), "Must have handleMouseEnter logic");
});

test("studios (architecture, sketch, infrastructure) trigger intro modal on hover", () => {
  // StudioViewportToolbar integration
  const toolbarPath = path.resolve(process.cwd(), "src/components/crystal-studio/StudioViewportToolbar.tsx");
  assert.ok(fs.existsSync(toolbarPath), "StudioViewportToolbar.tsx must exist");
  const toolbarContent = fs.readFileSync(toolbarPath, "utf-8");
  assert.ok(toolbarContent.includes("ToolsIntroModal"), "StudioViewportToolbar must import ToolsIntroModal");
  assert.ok(toolbarContent.includes("handleToolbarMouseEnter"), "StudioViewportToolbar must have hover trigger");
  assert.ok(toolbarContent.includes("studio={p.studio}"), "StudioViewportToolbar must forward studio prop");

  // SceneWorkbench forwards studio
  const workbenchPath = path.resolve(process.cwd(), "src/components/scene-studio/SceneWorkbench.tsx");
  const workbenchContent = fs.readFileSync(workbenchPath, "utf-8");
  assert.ok(workbenchContent.includes("studio={studio}"), "SceneWorkbench must pass studio to toolbar");

  // Viewport passes sketch studio
  const viewportPath = path.resolve(process.cwd(), "src/components/crystal-studio/Viewport.tsx");
  const viewportContent = fs.readFileSync(viewportPath, "utf-8");
  assert.ok(viewportContent.includes('studio="sketch"'), "Viewport must pass sketch studio");

  // SketchWorkspace has intro modal
  const sketchWorkspacePath = path.resolve(process.cwd(), "src/components/crystal-studio/SketchWorkspace.tsx");
  const sketchContent = fs.readFileSync(sketchWorkspacePath, "utf-8");
  assert.ok(sketchContent.includes("ToolsIntroModal"), "SketchWorkspace must import ToolsIntroModal");
  assert.ok(sketchContent.includes('studio="sketch"'), "SketchWorkspace must configure sketch studio");

  // ClassicInfrastructure has intro modal
  const classicInfraPath = path.resolve(process.cwd(), "src/app/infrastructure/ClassicInfrastructure.tsx");
  const classicContent = fs.readFileSync(classicInfraPath, "utf-8");
  assert.ok(classicContent.includes("ToolsIntroModal"), "ClassicInfrastructure must import ToolsIntroModal");
  assert.ok(classicContent.includes('studio="infrastructure"'), "ClassicInfrastructure must configure infrastructure studio");
});
