import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("public/no-wifi.png exists and is a valid image asset", () => {
  const imagePath = path.resolve(process.cwd(), "public/no-wifi.png");
  assert.ok(fs.existsSync(imagePath), "public/no-wifi.png must exist");

  const stat = fs.statSync(imagePath);
  assert.ok(stat.size > 50000, "public/no-wifi.png should be a high resolution asset");

  // Verify PNG header
  const buf = fs.readFileSync(imagePath);
  assert.equal(buf[0], 0x89);
  assert.equal(buf[1], 0x50); // P
  assert.equal(buf[2], 0x4e); // N
  assert.equal(buf[3], 0x47); // G
});

test("src/components/no-wifi-screen.tsx defines the no-wifi background and white Reload button with dark blue hover", () => {
  const componentPath = path.resolve(process.cwd(), "src/components/no-wifi-screen.tsx");
  assert.ok(fs.existsSync(componentPath), "no-wifi-screen.tsx must exist");

  const content = fs.readFileSync(componentPath, "utf-8");

  // Check client component directive
  assert.ok(content.includes('"use client"'), "Must be a client component");

  // Check offline and online listeners
  assert.ok(content.includes('"offline"'), "Must listen for offline event");
  assert.ok(content.includes('"online"'), "Must listen for online event");

  // Check reference to /no-wifi.png
  assert.ok(content.includes("/no-wifi.png"), "Must reference /no-wifi.png");

  // Check button text "Reload"
  assert.ok(content.includes("Reload"), "Button must say Reload");

  // Check button styling: white button with dark blue hover
  assert.ok(content.includes("bg-white"), "Button must have white background");
  assert.ok(
    content.includes("hover:bg-[#001035]") || content.includes("hover:bg-blue-950"),
    "Button must have dark blue hover"
  );
  assert.ok(content.includes("hover:text-white"), "Button must transition text to white on dark blue hover");

  // Check reload execution
  assert.ok(content.includes("window.location.reload()"), "Must reload page when clicked");
});

test("src/app/layout.tsx integrates NoWifiScreen", () => {
  const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf-8");

  assert.ok(content.includes("NoWifiScreen"), "Root layout must import and render NoWifiScreen");
  assert.ok(content.includes("<NoWifiScreen />"), "Root layout must include <NoWifiScreen />");
});

test("public/offline.html provides offline fallback with /no-wifi.png and white Reload button", () => {
  const htmlPath = path.resolve(process.cwd(), "public/offline.html");
  assert.ok(fs.existsSync(htmlPath), "public/offline.html must exist");

  const content = fs.readFileSync(htmlPath, "utf-8");
  assert.ok(content.includes("/no-wifi.png"), "offline.html must use /no-wifi.png");
  assert.ok(content.includes("Reload"), "offline.html must have Reload button");
  assert.ok(content.includes("background-color: #ffffff"), "Button must be white");
  assert.ok(content.includes("#001035"), "Button must have dark blue hover");
  assert.ok(content.includes("window.location.reload()"), "Must handle reload action");
});

test("public/sw.js caches offline assets and serves fallback on navigation failure", () => {
  const swPath = path.resolve(process.cwd(), "public/sw.js");
  assert.ok(fs.existsSync(swPath), "public/sw.js must exist");

  const content = fs.readFileSync(swPath, "utf-8");
  assert.ok(content.includes("/offline.html"), "sw.js must cache /offline.html");
  assert.ok(content.includes("/no-wifi.png"), "sw.js must cache /no-wifi.png");
  assert.ok(content.includes("navigate"), "sw.js must intercept navigate requests on network loss");
});
