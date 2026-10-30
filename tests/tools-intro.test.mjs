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

  // Verify header title 1 (16px), line 2 (12px Roboto)
  assert.ok(content.includes("fontSize: 16"), "Must specify header title 1 font size 16px");
  assert.ok(content.includes("fontSize: 12"), "Must specify header line 2 font size 12px");
  assert.ok(content.includes("Roboto"), "Must specify Roboto font family for header line 2");

  // Verify Architecture Tools title
  assert.ok(content.includes("Architecture Tools"), "Must contain Architecture Tools header");
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
