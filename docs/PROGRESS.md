# Verified progress

Last updated: 2026-10-30

## Fix: Test Card Checkout & Upgrade Intent Server Error Resolution (2026-10-30)

- Fixed "Unexpected server error" on test payment card checkout in `/pricing` modal and `/api/subscription/upgrade-intent`:
  - **Transaction Isolation & PgBouncer Compatibility (`src/lib/platform/api.ts`)**:
    - Removed `isolationLevel: Prisma.TransactionIsolationLevel.Serializable` from `requirePlatformContext` workspace provisioning transaction, which was rejected by Supabase PgBouncer/Supavisor poolers in transaction pooling mode.
    - Added upserts with graceful recovery on workspace member, subscription state, and settings records during initialization.
  - **Robust Upgrade Intent Endpoint (`src/app/api/subscription/upgrade-intent/route.ts`)**:
    - Synchronized both `Workspace` plan column and `SubscriptionState` record to the target plan (`BASIC`, `PRO`, `TEAM`, `STUDIO`).
    - Added fallback resolution for visitors and test payment sessions using input email or test workspace resolution.
    - Immediately resets the current month's rate limit bucket counter upon plan upgrade so new credits take effect instantly.
    - Wrapped audit activity logging in non-blocking error handling and replaced generic 500 crashes with informative error messages.
  - **Pricing Modal State Binding (`src/app/pricing/page.tsx`)**:
    - Bound `cardEmail`, `cardNumber`, `cardExpiry`, and `cardCvc` to state and forwarded them with test payment payload.
    - Pre-filled email from authenticated NextAuth session where available.
  - **Automated Verification**:
    - Created unit test in `tests/subscription-upgrade.test.mjs` verifying plan validation, approval, entitlements, and limit updates.
    - All 205 unit tests passing (`node --test tests/*.test.mjs`).
    - `npm run typecheck` (tsc --noEmit) passed with 0 errors.
    - `npm run build` production build completed with 0 errors.

## Plan Testing Profile, Simulated Checkout, and Real Usage Limit Enforcement (2026-10-30)

- Implemented full plan testing lifecycle, simulated payment processing, and real limit enforcement:
  - **Test Payment Processing (`POST /api/subscription/upgrade-intent`)**:
    - Validates billing plan (`BASIC`, `PRO`, `TEAM`, `STUDIO`) and billing cycle (`monthly`, `yearly`).
    - Upserts workspace `SubscriptionState` in PostgreSQL to `status: "ACTIVE"` with calibrated plan limits (Basic: 200, Pro: 800, Team: 2,000, Studio: 4,000 credits).
    - Logs subscription activation audit trail and returns instant approval with credit capacity.
  - **Pricing Page Simulated Checkout (`/pricing`)**:
    - Updated modal with pre-filled test card (`4242 •••• •••• 4242`), expiry, CVC, and "TEST PAYMENT GATEWAY" badge.
    - Added instant success state with confirmation badge, active credit summary, and links to `/account?section=usage` and `/casynus`.
  - **Account Plan Testing Profile (`/account?section=subscriptions`)**:
    - Interactive 4-tier plan test switcher displaying active plan badge and one-click test plan activation.
    - Real-time limit enforcement suite allowing developers/testers to simulate usage (+1 credit chat, +20 credits 3D model, 80% warning threshold, 100% lockout cap, and reset to 0).
    - Connected to `POST /api/subscription/simulate-usage` with dynamic reload of `AccountUsage` meters, bars, and stats.
  - Verification: `npx tsc --noEmit` (0 errors), `npm run test` (all 204 unit tests passed), `npm run build` (Next.js production build passed with 0 errors).


## AI Chat Recent Conversations: Real Action Handlers (Pin, Add to Project, Mark as Unread, Rename, Share, Delete) (2026-10-30)

- Implemented real actions for Recent chat sessions in `/aichat` (`src/app/aichat/page.tsx`):
  - **Pin / Unpin**:
    - Real toggle persisting to `/api/assistant/conversations/[id]` and local state.
    - Pinned items sort to the top of the Recent list with a rotated `#4284ff` Pin icon badge.
    - Updated `ConversationMenu` to dynamically show "Unpin" vs "Pin" with `Pin` icon from `lucide-react`.
  - **Add to project**:
    - Opens project picker modal with backdrop blur.
    - Shows current project with checkmark `✓` and an explicit "Remove from project" option.
    - Added inline "Create new project" input allowing project creation and instant assignment on the fly via `POST /api/projects`.
    - Shows project name badge (`FolderPlus` icon + project name) in the sidebar.
  - **Mark as unread / Mark as read**:
    - Dynamic toggle persisting `unread: boolean` to server and local storage.
    - Displays unread dot indicator (`h-2 w-2 rounded-full bg-[#4284ff]`) in the sidebar item.
    - Automatically clears unread state when the chat is opened, or manual "Mark as read" toggle.
  - **Rename**:
    - Replaced browser prompt with a styled in-app modal ("Rename chat") with backdrop blur, auto-focused text field, Cancel and Save buttons.
    - Persists title change to `/api/assistant/conversations/[id]` and updates state.
  - **Share**:
    - Uses `shareConversation` (Web Share API with fallback to formatted clipboard copy).
    - Surfaces toast notification: "Conversation copied to clipboard. Ready to share." / "Conversation shared."
  - **Delete**:
    - Added confirmation modal ("Delete chat? Are you sure you want to delete '[title]'? This action cannot be undone.").
    - On confirmation, calls `DELETE /api/assistant/conversations/[id]` (archives on server), removes from local storage and state, and resets active chat if deleted.
  - Verification: `npx tsc --noEmit` (0 errors), `npm run test` (all 204 unit tests passed), `npm run build` (Next.js production build passed with 0 errors).


## Full-Stack Platform Hardening: Account Deletion, Workspace Settings, and Studio Project Lifecycle (2026-10-29)

- Implemented and hardened persistent backend endpoints and client contracts:
  - Account Deletion & Deactivation:
    - Added `DELETE /api/me` with atomic transaction deactivating user (`isActive: false`), soft-deleting workspace projects (`status: DELETED`), and revoking active sessions.
    - Updated `src/app/account/page.tsx` Privacy section with two-step deletion confirmation dialog, error states, and automatic redirect on completion.
  - User Settings & Profile API:
    - Added `GET /api/settings/user` returning user identity and settings.
    - Enhanced `PATCH /api/settings/user` supporting profile attributes (`firstName`, `lastName`, `phone`, `avatarUrl`) and application preferences.
  - Workspace Settings & Members API:
    - Added `GET /api/settings/workspace` returning workspace organization data, settings, and enriched member identities.
    - Connected `src/app/account/page.tsx` Organization and Members sections to load and persist workspace details via the API.
  - Studio & Sketch Project Deletion:
    - Added `DELETE /api/studio-projects` and `DELETE /api/sketch-projects` verifying project ownership and soft-deleting both `blenderProject` and `project` records.
  - Verification: `npx tsc --noEmit` (0 errors), `npm run test` (all 204 unit tests passed), `npm run build` (Next.js production build passed with 0 errors).


## Search Modal Translucent Backdrop Blur Over /aichat (2026-10-29)

- Configured the Casynus Search modal (`searchOpen`) in `/aichat` (`src/app/aichat/page.tsx`):
  - Replaced opaque background (`bg-[var(--studio-bg-elevated)]`) with a translucent blurred backdrop (`bg-black/50 backdrop-blur-md`).
  - Allows `/aichat` (chat history, cards, sidebar, and prompt bar) to stay visible directly underneath with a frosted glass blur.
  - Verification: `npx tsc --noEmit` (0 errors), `npm run test` (all 204 unit tests passed), `npm run build` (Next.js production build passed with 0 errors).

## AI Chat Generated Image Response Frame 6px Gap Border (2026-10-29)

- Added 6px surrounding gap around generated image response card in `/aichat` (`src/app/globals.css`):
  - `.aichat-generated-image-frame`: Configured `padding: 6px; box-sizing: border-box;` creating a continuous 6px `#161616` inset border around the image on all sides.
  - `.aichat-generated-image-wrap`: Added `border-radius: 12px; margin-bottom: 6px;` providing smooth rounded inner corners and separating the image from the action bar with the 6px gap.
  - `.aichat-generated-image-wrap img`: Added `border-radius: 12px;` so all 4 corners of the image stay cleanly rounded.
  - Action bar: Removed the separator border line for a seamless `#161616` dark frame flow.
  - Verification: `npx tsc --noEmit` (0 errors), `npm run test` (all 204 unit tests passed), `npm run build` (Next.js production build passed with 0 errors).

## File and Photo Attachment Support in /aichat (2026-10-29)

- Enabled file and photo attachments in `/aichat` across desktop and mobile layouts:
  - Paperclip attachment action: Clicking the Paperclip button opens the native file selector (`image/*`, `.pdf`, `.txt`, `.md`, `.doc`, `.docx`, `.json`, `.csv`, `.glb`, `.gltf`, `.obj`, `.fbx`, `.stl`, `application/*`).
  - Drag & Drop & Paste: Added drag & drop on the input form with highlighted boundary, as well as clipboard image/file paste detection (`onPaste`).
  - Pre-send preview: Added live attachment chips above the input bar with thumbnails for photos, file icons/names/sizes for documents, and remove buttons (`X`).
  - Lightbox preview: Clicking attached image thumbnails in chat opens a centered full-screen lightbox modal with backdrop blur.
  - Chat bubbles: Render attached images and downloadable file chips directly inside the user's message bubble.
  - AI prompt integration: Includes structured summaries of attached files/photos when querying AI providers, with automatic fallback and image concept detection.
  - Session persistence: Updated `/api/ai-chat/sessions` to store and restore `attachments` and `imageUrl` in conversation metadata.
  - Verification: `npx tsc --noEmit` (0 errors), `npm run test` (all 204 unit tests passed), `npm run build` (Next.js production build passed with 0 errors).

## AI Chat Generated Image Response Frame (638x484px, #161616 Frame & Action Bar) (2026-10-29)

- Implemented Figma-annotated generated image response card in `/aichat` (`src/app/aichat/page.tsx` & `src/app/globals.css`):
  - Fixed dimensions & palette:
    - Basic frame background: `#161616` (`.aichat-generated-image-frame`).
    - Outer frame size: `638px` width (responsive up to 100% on mobile screens), `484px` height.
    - Outer corner radius: `16px` (`rounded-[16px]`).
    - Top image viewport: `410px` height with `object-fit: cover` and top 16px corner radius.
    - Top image source: `public/hh.jpg` (`/hh.jpg`).
    - Bottom action bar: `48px` height with `#161616` background and 16px bottom corner radius.
  - Interactive action bar controls:
    - Left actions: 1) Regenerate (`RotateCcw`), 2) Edit prompt (`Pencil`), 3) Workflow/Variations (`Workflow`), 4) Like toggle (`ThumbsUp`), 5) Dislike toggle (`ThumbsDown`).
    - Right action: Download button (`Download`) directly downloading the generated image (`hh.jpg`).
  - Integration:
    - Updated markdown image parser in `AssistantResponse` to automatically render generated images inside the styled frame.
    - Attached `imageUrl: "/hh.jpg"` upon image-related requests with seamless fallback handling.
  - Verification: `npx tsc --noEmit` (0 errors), `npm run test` (all 204 tests passed), `npm run build` (Next.js production build passed with 0 errors).

## Viewport Shading Dropdown Migration to Physical Material & Top Toolbar Clean-up (2026-10-29)

- Migrated Viewport Shading style selector to a clean `<select>` dropdown inside Properties Inspector (`SceneWorkbench.tsx`):
  - Converted the 5 chip buttons under "Physical material" into a standard full-width dropdown matching the `Choose preset` style (PBR, Normal, Albedo, MatCap, Solid Cavity).
  - Removed the shading mode select dropdown from the top viewport toolbar (`StudioViewportToolbar.tsx`), streamlining the top bar across 3D studios.
  - Fully eliminated any remaining `.scene-opening` overlay on line 533 so project storage or connection issues surface strictly as non-blocking `scene-alert` notifications.
  - Verification: `npx tsc --noEmit` (0 errors), `npm run test` (all 204 tests passed).

## Instant Studio Scene Opening & Viewport Blocking Elimination (2026-10-29)

- Resolved the blocking "Opening scene… Create empty project" viewport overlay on studio entry:
  - Immediate studio readiness: Configured `useSceneDocument` to initialize `ready = true` by default when no specific `requestedId` is requested, rendering the full 3D viewport and scene hierarchy immediately without delay or blocking overlays.
  - Seamless NextAuth session transition: Removed full-viewport unmounting and blocking on `status === "loading"` in `SceneWorkbench.tsx`, and decoupled editor remounting from session identity resolution (`key={projectId ?? "active"}`) to prevent 3D canvas teardown upon identity updates.
  - Robust IndexedDB recovery connection timeout: Added safety timeout (1500ms) and `onblocked` event handler to `database()` in `src/lib/scene/recovery.ts`, preventing unhandled storage hangs from blocking studio initialization.
  - Graceful fallback on missing projects: Configured missing recovery or cloud 404 lookups to cleanly initialize a fresh studio template and set `ready = true`, ensuring users never get stranded on a black error screen.
  - Viewport overlay clean-up: Updated `SceneWorkbench.tsx` line 533 so that `.scene-opening` only renders when an actionable failure occurs, eliminating the unsolicited "Create empty project" button during normal studio loading.
  - Verification: `npx tsc --noEmit` (0 errors), `npm run test` (all 204 tests passed including new instant studio open test), `npm run build` (compiled and exported cleanly with 0 errors).

## Desktop Generation Loader Frame Sidebar Palette Harmonization (2026-10-29)

- Harmonized the desktop 712x140px Studio AI generation loader frame with studio sidebars (Casynus, Architecture, Sketch, Infrastructure):
  - Background: Configured with studio panel background variable (`var(--studio-bg-panel, #161616)`).
  - Border: Swapped isolated translucent white outline for standard ash-gray sidebar border (`1px solid var(--studio-border, #292929)`).
  - Border radius: Softened from 24px to studio panel standard (`var(--studio-radius-panel, 16px)`).
  - Shadow: Aligned with floating sidebar depth (`var(--studio-shadow-floating, 0 8px 24px rgba(0, 0, 0, 0.22))`) eliminating harsh disconnected drop shadow so the frame integrates naturally without standing out ("te mos jet e dalluar").
  - Progress bar track frame: Styled with ash-gray elevated tone (`var(--studio-bg-hover, #282828)`) and border (`var(--studio-border, #292929)`).
  - Verification: tsc (0 errors), npm run test (203 tests passed), npm run build (0 errors).

## Viewport Shading Styles in Casynus Studio: Normal Map, Albedo Map, MatCap, Solid Cavity (2026-10-29)

- Implemented real-time viewport shading style selector in Casynus Studio (/casynus):
  1. PBR (Default): Full physically-based rendering.
  2. Normal Map: Tangent/view-space surface normal orientation.
  3. Albedo Map (Diffuse): Pure unlit base color map.
  4. MatCap (Material Capture): High-contrast spherical wax/clay material capture.
  5. Solid with Cavity: Neutral matte clay plaster with crevice and ambient edge darkening.
- UI controls added in Top Viewport Toolbar and Inspector Properties Panel.
- Preserves original materials via non-destructive userData.__origMaterial caching.
- Verification: tsc (0 errors), npm run test (203 passing), npm run build (0 errors).

## 3D AI Texturing Pipeline & Shader Configuration Specification (2026-10-28)

- Created exhaustive technical director and 3D texture artist specification in `docs/AI-3D-TEXTURING-GUIDE.md`:
  - Normal Map (Tangent Space): Mathematical vector mapping, OpenGL vs. DirectX green-channel handling, vector length normalization, height-to-normal pipeline, and generation prompts.
  - Albedo Map (Base Color / Diffuse): De-lighting techniques, dielectric PBR ranges (30-240 sRGB), metallic reflectance specifications, and shadowless diffusion prompts.
  - MatCap (Material Capture): Mathematical view-space projection ($UV = 0.5 \cdot N_{view} + 0.5$), 2D sphere texture AI prompts, and Blender Eevee/Cycles custom shader nodes.
  - Solid with Cavity (Clay / Crevice Render): Ambient occlusion and pointiness/curvature integration, warm grey clay color ramp parameters, and procedural edge/crevice highlighting.

## Blender 3D Object Import into Casynus Studio (2026-10-28)

- Implemented dedicated import and interactive placement for 3D models designed in Blender into Casynus (`/casynus`, `src/components/scene-studio/SceneWorkbench.tsx`):
  - Supported standard Blender export formats: `.glb` / `.gltf`, `.fbx`, `.obj`, `.stl`.
  - Added Three.js `FBXLoader` integration in `src/lib/scene/geometry.mjs` for Blender-exported FBX files with mesh geometry, physical materials, and hierarchical transforms.
  - Added explicit handling and actionable feedback for `.blend` project files: alerts the user that raw `.blend` files are project archives and advises exporting to glTF 2.0 (`.glb`) or `.fbx`, automatically launching the Blender export guide modal.
  - Smart placement & auto-framing:
    - Automatically lands the root object on the ground plane (`Y >= 0`) at cursor drop coordinates or camera focus target.
    - Automatically selects the newly imported model and activates the translate gizmo (`W` key) for immediate mouse manipulation in the 3D viewport.
  - User Interface:
    - Added dedicated "Blender 3D" import card in the Left Sidebar under "Object library" with direct "Import Blender" button and "Guide" shortcut.
    - Added "Import Blender Object" action with dedicated Blender box icon in the viewport top toolbar (`StudioViewportToolbar`).
    - Added File Menu options: "Import Blender / 3D model" and "Blender export guide".
    - Interactive "Blender Import Guide" modal explaining the 1-click export steps from Blender (`File -> Export -> glTF 2.0 / FBX / OBJ`) with a direct file picker trigger.
  - Verification:
    - Added unit test in `tests/scene-geometry.test.mjs`: `blender .blend files advise exporting to supported 3D formats`.
    - Type check passed: `npx tsc --noEmit` exited 0 with 0 errors.
    - Test suite passed: `npm run test` (all 203 unit/integration tests passed).
    - Production build passed: `npm run build` compiled cleanly.

## Sketch Studio Architectural Drafting: Arch Walls, Room Dragging, Wall Mouse Editing & Tool Removal (2026-10-28)

- Implemented Arch / Curved Wall (`arch-wall`) drafting in Sketch Studio (`Viewport.tsx`, `types.ts`, `floor-plan-export.ts`, `floor-plan-geometry.ts`):
  - Added dedicated Arch tool (`Arch Wall (180° / Circle)`) with `Spline` icon and `A` shortcut.
  - Supports 180° outward semicircle (protruding balcony / bay connecting to apartment walls), 180° inward semicircle (concave cutout / alcove), and full circular wall (`isCircle`).
  - Interactive drag preview showing 180° arc with wall thickness, diameter/span dimension, chord line, and Space shortcut / HUD button to flip between outward and inward.
  - Integrated into SVG and PDF export with exact circular arc and circle path geometries.
- Implemented dynamic room creation with mouse drag ("aq sa deshiron klienti"):
  - Live interactive drag preview displaying translucent room rectangle, perimeter wall outlines, dynamic width/height dimensions, and real-time calculated area (m²).
  - On mouse release, creates the room entity along with 4 enclosing bounding walls (top, right, bottom, left) with standard 180 mm thickness that snap and connect seamlessly to the apartment layout.
- Implemented mouse drag wall editing:
  - Interactive endpoint drag handles (`start` and `end`) rendered on selected walls and arc-walls.
  - Dragging an endpoint handle resizes, lengthens, shortens, and angles the wall with precision grid and ortho snapping.
  - Midpoint handle on arc-walls allows clicking to flip 180° curvature between inward and outward.
  - Dragging the wall line itself translates the entire wall with snapping.
- Removed Play (`{16360169-6FE6-4C51-AA27-D792824C69EA}.png`) and Plus (`{8A9A1042-6AA8-4EC3-B20F-7AE4E1391CA9}.png`) tools strictly in Sketch:
  - Added `hidePlus` and `hidePlay` props to `StudioViewportToolbar.tsx`.
  - Passed `hidePlus` and `hidePlay` to `StudioViewportToolbar` in `Viewport.tsx` (Sketch 2D CAD drafting) and cleaned up Pencil mode toolbar, ensuring both buttons are hidden only in Sketch while remaining available in Architecture and Infrastructure workbenches.
- Verification: `npx tsc --noEmit` passed with 0 errors; all 202 unit/integration tests passed (`npm run test`); production build passed (`npm run build`).

## Desktop Studio AI Chat Generation Loader Frame (2026-10-28)

- Implemented centered generation progress frame for Studio AI Chat prompt submission, strictly scoped to Desktop only (hidden on mobile <= 700px):
  - Trigger: Upon typing a prompt in the Studio AI Chat (StudioAIChat / Studio generation) and pressing Enter or clicking send.
  - Size: 712 × 140 px with rounded-3xl (24px) corners, positioned in the center of the screen with subtle background backdrop.
  - Frame background color: #161616 with subtle depth shadow (0 24px 60px rgba(0,0,0,0.75)).
  - Headline 1: 24px semibold in Roboto font ("Generate house modeling 3D..." or current prompt).
  - Subtitle: 12px medium ("Lorem ipsum dolor sit amet consectetur. Feugiat posuere eleifend mi felis ut risus nibh habitant. Quisque adipiscing sodales felis sed enim.").
  - Timer: Stopwatch icon with dynamic countdown (e.g. End: 00 min 20sec down to 00sec).
  - Loading frame: 657 × 12 px rounded-full progress bar with track color #4C4C4C and gradient fill #0C8CE9 to #074F83.
  - Progress: fills slowly and smoothly over 20 seconds ("blue te mbushet pas 20sec dhe te largohet"), fading out and dismissing automatically once complete.
  - Desktop-only isolation: strictly hidden on mobile devices (< 700px) so mobile layout remains unaffected.
- Verification: npx tsc --noEmit passed with 0 errors; all 202 Node tests passed (npm run test); next build passed with 0 errors.

## Mobile Account page pixel-perfect implementation and dark/light mode palette (2026-10-28)

- Implemented pixel-perfect mobile Account interface strictly scoped to mobile (max-width: 430px) according to {87F9376B-EFED-4BF4-A703-5E680F412341}.png and color palette {8B7B8C3A-7147-4A06-8D53-7A4B961399CE}.png:
  - Exact colors:
    - Dark mode: Background #121212, Frame #161616, Hover #2B2B2B.
    - Light mode: Background #F5F6F8, Frame #FFFFFF, Hover #ECEEF2.
  - Perfect 48×48px circular frames (w-12 h-12 rounded-full):
    - Profile avatar (48×48px).
    - Top header theme toggle (Sun/Moon) and Help icon button (48×48px).
    - Notification Bell button (48×48px) with red notification badge.
    - Transaction "AM" circle badge (48×48px).
    - Transaction "Cashback" return arrow circle badge (48×48px).
  - Currency balance cards row (120px height cards):
    - US Dollar card (259.12, US Dollar with US flag).
    - British Pound card (2,012.60, British Pound with UK flag).
    - New Account card with + button.
  - Big VISA credit/debit card (304 × 208 px):
    - Rich violet/purple wave gradient background with decorative wave SVG layers.
    - VISA logo, metallic gold smart chip circuitry, card number (`•••• •••• •••• 2345`), Card Holder name (John Doe), Expiry Date (02/30).
    - Carousel pagination indicator (40px active pill + 2 dots).
  - Transactions list:
    - Amazon (AM circle, Card payment - Today, - $12.12).
    - Cashback (RotateCcw circle, Received, + 21.00).
  - Sticky bottom navigation bar:
    - 4 tabs: Dashboard (Home), Investing (TrendingUp), Explore (Search), Hub (LayoutGrid).
  - Zero desktop elements on mobile:
    - Guaranteed via .account-desktop-wrapper (hidden min-[431px]:flex) and .account-mobile-wrapper (block min-[431px]:hidden) alongside CSS media queries. Desktop layout is completely unaffected.
- Verification: npx tsc --noEmit passed with 0 errors; all 202 Node tests passed (npm run test); next build passed with 0 errors.

## Mobile and desktop frame isolation across /casynus, /infrastructure, /architecture, /sketch, and /aichat (2026-10-28)

- Strictly isolated mobile frames (< 430px) from desktop frames (> 430px) to prevent mixed layouts:
  - On /casynus, /infrastructure, /architecture, and /sketch: mobile viewport directly loads the mobile studio interface (CrystalStudio) in matching mode (modeling for Casynus/Infrastructure/Architecture, floor-plan for Sketch/Interior) without rendering desktop panels or 404 errors.
  - Added dedicated route wrappers for /architecture and /sketch preserving full desktop workbench vs mobile studio routing.
  - Desktop studio frames in CrystalStudio.tsx (header.crystal-topbar, studio-restore-pill, LeftSidebar, RightPanel, Viewport) are strictly guarded with !mobileViewport, guaranteeing zero desktop frames appear on mobile devices.
  - On /aichat, implemented the exact UI from {CD7C1D34-2BAC-49C7-A72D-BED9DA9D91C8}.png:
    - Top header: 40×40px circular Grid2X2 menu button, "Arch.." workspace title, and 40×40px circular Glasses incognito button.
    - Hero state: Casynus diamond logo with "What's on your mind today?".
    - AI input area: 362 × 197 px container with "Try Casynus Pro" promotional bar (333 × 49 px) with blue Zap icon and "Pay Now" button (75 × 36 px), "What do you want to create?" label, textarea prompt input, 40×40px attach button, 171×40px "Nano Banana" dropdown with Zap icon and chevron, and 40×40px blue circular send button with exact 325px distance between attach and send.
    - Bottom navbar: 292 × 58 px pill containing 5 icon buttons (Home, Book, FilePlus2, Wand2, Settings) and 58 × 58 px circular Search button.
  - Mobile and desktop layouts in /aichat are strictly separated via aichat-desktop-layout (hidden min-[431px]:flex) and aichat-mobile-layout (flex min-[431px]:hidden) alongside scoped CSS media queries.
- Verification: npx tsc --noEmit passed with 0 errors; all 202 Node tests passed (npm run test).

## iPhone 17 mobile UI and pixel-perfect responsive layout (2026-10-28)

- Implemented iPhone 17 mobile-first responsive design strictly scoped to `@media (max-width: 430px)`, guaranteeing zero regression or override to the desktop application.
- Applied dark theme (#0a0a0a near-black background) for mobile studio home.
- Verified exact component dimensions:
  - Bottom input section container: 362 × 197 px.
  - "Try Crystal Pro" promotional bar: 333 × 49 px.
  - "Pay Now" button: 75 × 36 px.
  - Blue circular send button: 40 × 40 px.
  - Attach button: 40 × 40 px.
  - Distance between Attach and Blue Send button: exactly 325 px across the actions row.
  - AI model switcher: 171 × 40 px with "Nano Banana" as the active selection, supported by bottom sheet model choices.
  - Bottom navigation bar: 292 × 58 px pill containing 5 shortcut buttons (48 × 48 px each).
  - Search floating button: 58 × 58 px.
- Top tab bar styled with icons and text (Animate, Modeling, Images) flanked by 40×40px circle grid and glasses buttons.
- Added 3D house / farm isometric models preview cards slider with quick prompt selection.
- Updated Viewport floating action toolbar on mobile: record, cube, sparkle (Sparkles), folder (FolderOpen), camera (Camera), sun (Sun), and help (CircleHelp).
- Retained Texture Modeling panel with 6 spherical material previews (chrome-black, chrome-white, stone, ocean, violet, purple).
- Verification: `npx tsc --noEmit` passed with 0 errors; all 202 Node tests passed (`npm run test`).

## Studio toolbar icon redesign and fill-bold active states (2026-10-28)

- Redesigned studio top toolbar icons across Architecture (`/casynus`), Infrastructure
  (`/infrastructure`), 3D Sketch (`/interior?workspace=3d`), 2D CAD drafting (`/interior`),
  and Pencil Studio (`SketchWorkspace.tsx`) to be immediately recognizable for the
  actions they perform:
  - Replaced ambiguous `Route` (two nodes on a curvy line) with standard 4-way `Move`
    cross arrows for 3D Move/Translate (`SceneWorkbench.tsx`, `ClassicInfrastructure.tsx`).
  - Replaced ambiguous duplicate `Focus` (corners with center circle) with diagonal
    `Maximize2` scale arrows for Scale/Resize (`SceneWorkbench.tsx`, `ClassicInfrastructure.tsx`),
    preserving `Focus` for Fit entire scene.
  - Replaced identical `SquareDashed` placeholders in 2D CAD drafting (`Viewport.tsx`)
    with dedicated architectural icons: `BrickWall` for Wall, `AppWindow` for Window,
    and `LayoutGrid` for Room and Add room.
  - Replaced duplicate `Ruler` for Dimension with `RulerDimensionLine`, and replaced
    `TextCursorInput` with `Type`.
- Implemented fill-bold active icon styling (`.is-active`, `[aria-pressed="true"]`)
  in `viewport-toolbar.css` and `sketch.css`:
  - Active icons render with solid `fill: currentColor` on closed silhouettes
    (`lucide-mouse-pointer2`, `lucide-pointer`, `lucide-play`, `lucide-home`,
    `lucide-house`, `lucide-sparkles`, `lucide-tree-pine`, `lucide-pencil`,
    `lucide-door-open`, `lucide-focus circle`, `lucide-layout-grid rect`,
    `lucide-trash2`, `lucide-sofa`, `lucide-armchair`), a heavier `stroke-width: 2.35px`,
    and a subtle depth shadow (`filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25))`).
  - Inactive / unclicked icons render slightly thinner (`stroke-width: 1.65px`) with
    high-contrast geometric definition (`color: var(--studio-text-secondary, #cbd5e1)`,
    `shape-rendering: geometricPrecision`), transitioning smoothly to `1.85px` on hover.
  - Synchronized React icon properties (`size={18}`, `strokeWidth={a.active ? 2.35 : 1.65}`)
    in `StudioViewportToolbar.tsx` to match CSS rules and eliminate rendering jitter.
- Verification: all 202 Node tests (`npm test`) and full TypeScript check
  (`npm run typecheck`) passed with 0 errors.

## Casynus Sketch Studio, UI layout, toolbars and persistence (2026-10-27)

- Renamed user-facing Interior labels to Sketch across `InteriorSceneSidebar`,
  `LeftSidebar`, `StudioAIChat`, `StudioMaterialLibrary`, `ui.tsx`,
  `SceneWorkbench`, `CrystalStudio` and `unified-sidebar` while preserving the
  `/interior` and `/interior?workspace=3d` routes, CAD floor-plan drafting,
  Scene hierarchy, Properties inspector and AI Chat dock.
- Preserved the original architectural floor-plan drafting workspace (`#0f0f0f` /
  `var(--studio-draft-paper)`, `InteriorSceneSidebar`, `RightPanel`, CAD HUD and
  shortcuts hint) when Pencil mode is inactive, and implemented a dedicated,
  sidebar-free Pencil Drawing Studio when the top-toolbar Pencil button
  (`Sketch Drawing & Paint`, 54×54px outer / 40×40px inner surface) is clicked.
- Added the `#404040` empty-state screen (`New Canvas` + `Open Existing Project`)
  when entering Pencil Studio without an existing canvas (`!sheet.created` and no
  strokes), plus the `Canvas Setup Dialog` (`role="dialog"`, width/height, A4/A3/Square
  presets, Portrait/Landscape orientation and background color defaulting to
  `#ffffff`) and `Exit Pencil mode` to return to CAD drafting without losing work.
- Organized the primary drawing tools in a horizontal top toolbar
  (`.sketch-top-toolbar` with 54×54px frames and 40×40px hover/active surfaces:
  Exit Pencil mode, Select/Move, Pencil, Brush, Eraser, Line, Rectangle, Ellipse,
  Freehand Selection, Color Picker, Fill/Paint Bucket, Highlighter, Text,
  Undo/Redo, Zoom/Pan, Fit to Canvas, Canvas setup, Save, Projects, Clear and
  Export), placed expandable secondary panels (Drawing controls, HSV+HEX Color
  Picker and Layers) in a compact right-side dock (`.sketch-right-dock`) above
  the 54px bottom-right navigation bar, added the top-left `.sketch-top-left-bar` with Profile (`Your profile`) and Settings (`Studio settings`) buttons in Pencil mode, and kept `StudioAIChat` centered at the bottom like Architecture and Infrastructure.
  collapsed toggle to exact `54 × 256px` outer dimensions (`.pencil-studio-ai`)
  that expands the existing floating `StudioAIChat` panel when clicked.
- Implemented pointer-captured mouse/pen/touch freehand drawing with quadratic
  smoothing, chronological SVG mask erasing, scanline flood-fill regions, stroke
  selection/translation/duplication/deletion, independent drawing undo/redo,
  combined CAD+sketch exports (PNG, SVG, PDF, JSON Scene), per-identity browser
  recovery and authenticated `/api/sketch-projects` workspace persistence with
  JSONB key-order-safe revision reconciliation and fresh-browser cloud project
  adoption on login.
- Added the shared HSV color wheel + saturation/value square + HEX input +
  opacity slider + 10 color swatches + custom color palette (`SceneColorField` /
  `.scene-color-panel` in `SceneWorkbench.tsx` and `scene-studio.css`) to `Base color` and `Light color` in the Architecture (`/casynus`), Infrastructure (`/infrastructure`) and 3D Sketch (`/interior?workspace=3d`) Properties inspectors, opening as a floating panel to the left of the right sidebar only when the color button is clicked while preserving `[aria-label="Base color"]` and `[aria-label="Light color"]` compatibility.
- Unified `StudioViewportToolbar` (`StudioViewportToolbar.tsx`, `viewport-toolbar.css`, `sketch.css`) across Architecture (`/casynus`), Infrastructure (`/infrastructure`) and Sketch 2D CAD (`/interior`) to use the `54px` toolbar height (`border-radius: 14px`, `#161616` panel surface) with `54 × 54px` tool button frames and `40 × 40px` (`border-radius: 10px`) inner hover (`#282828`) and active (`#4284ff`) surfaces.
- Added the floating Casynus Profile Menu (`StudioProfileMenu` in `StudioSidebarFooter.tsx`, `SketchWorkspace.tsx`, `Viewport.tsx`, `cedium-shell.tsx`, `account/page.tsx`, `aichat/page.tsx`, `viewport-toolbar.css`) with Profile, Upgrade to Pro, Appearance (`Dark` / `Light` mode switcher via `useCrystalTheme` and `useCoreforgeMode`), Billing, Settings and Logout (`signOut`) across the homepage / public navigation (`CoreforgeNav`), Account page (`/account`), AI Chat (`/aichat`), Pencil Studio top-left bar (`.sketch-top-left-bar`) and the studio sidebar footer (`.cs-sidebar-footer`), plus the floating Casynus AI Studio Settings frame (`StudioSettingsFrame`) with Default AI Model, AI Scene & Sketch Auto-Assist, Render & Viewport Quality, Appearance Mode, Viewport Grid, Precision Snapping, Units (`mm`/`cm`/`m`), Drawing Scale (`1:50`/`1:100`/`1:200`), Stroke Smoothing & Pen Pressure, Cloud Autosave & Browser Recovery status, Canvas Setup and Sync Now actions.
- Wired the toolbar triangle (`Play`) button across all studios (`StudioViewportToolbar.tsx`, `SceneWorkbench.tsx`, `SceneViewport.tsx`, `Viewport.tsx`, `SketchWorkspace.tsx`, `ClassicInfrastructure.tsx`) as a toggleable slow object/scene rotation action (`Slowly rotate object` / `Stop slow object rotation` with active state `aria-pressed="true"`): clicking starts smooth continuous rotation of the selected object (or scene/canvas when no single object is selected) and unclicking stops it immediately and commits the final rotation.
- Fixed the `"Project storage is unavailable. Your browser recovery copy has not been uploaded."` 503 error on `/api/studio-projects`: normalized `DATABASE_URL` in `src/lib/prisma.ts` (percent-encoding unescaped password characters before `@` and raising narrow `connection_limit=3` pooler caps to `connection_limit=10`, `pool_timeout=20`, `connect_timeout=15` with `pgbouncer=true`), cached verified `userId -> workspaceId` lookups and serialized `ensureWorkspaceDefaultsOnce` upserts in `src/lib/platform/api.ts` so concurrent `.upsert()` transactions no longer starve a 3-connection pool (`P2024`) during studio load, and added `{ maxWait: 15000, timeout: 15000 }` to `prisma.$transaction` in `src/app/api/studio-projects/route.ts` and `src/lib/platform/api.ts`.
- Verification: all 202 Node tests (`npm test`), standalone TypeScript
  (`npm run typecheck`), focused Next.js lint and production build passed.
  Real installed-Chrome live acceptance (`node scripts/verify-sketch.mjs --live`)
  passed CAD workspace preservation, sidebar-free Pencil Studio transition,
  initial `#404040` `New Canvas` dialog (A4/A3/Square, Portrait/Landscape),
  54×54px/40×40px top toolbar and right dock geometry, 54×256px bottom-left AI
  Chat toggle expand/collapse, mouse/pen/touch strokes, brush, rectangle, paint
  bucket fill, eraser mask, undo/redo, layer CRUD/blend/opacity,
  line/ellipse/highlighter/text/lasso/color picker, zoom/pan/15° rotation with
  preserved CAD geometry, real Credentials login, delayed cloud save
  reconciliation, page reload, PNG/SVG/PDF/JSON downloads, logout/login cloud
  restoration, CAD return, light mode and 390px mobile layout (artifacts in
  `.tmp/sketch-qa-1793137975371/`).

## AI chat sidebar and authenticated chat acceptance (2026-10-27)

- Replaced notification-only Pin, Mark as unread and Add to project with
  persisted conversation fields and a workspace project picker. Rename and
  archive/delete now surface actual API failures; pinned ordering survives
  reload, and opening unread conversations marks them read. Conversation
  GET/PATCH/DELETE also require the authenticated user, not only workspace.
- Share now sends the selected transcript/citations through native sharing,
  with a clipboard transcript fallback. It does not create a public URL.
  Cancelled sharing never silently copies private content.
- Cancel pending chat responses when changing accounts/conversations. Restore
  failed prompts for retry, retain actionable server errors, and guard local
  recovery writes against account changes and unavailable browser storage.
- Added `prisma/ai-chat-sidebar.sql` (idempotent additive columns), regenerated
  Prisma and applied the SQL to the configured database. Temporary-record live
  checks passed sidebar persistence and usage reserve/refund. Local and stored
  cloud DB configuration match the same project/database; no secrets logged.
- Real local production-server acceptance passed Credentials sign-in,
  Groq/You answers and cloud message persistence, Gemini-to-Groq failover,
  pin/unpin, rename, unread/read, project assignment, archive/delete and
  logout/login persistence. Fresh QA data was cleaned. Native Gemini returned
  FAILED_PRECONDITION/billing required; Google AI Studio billing remains an
  external prerequisite. No authenticated production or browser-click acceptance
  is claimed. Reusable opt-in verifier: `scripts/verify-ai-chat.mjs --live`.
- Initial live probe used the legacy `.env` URL and failed with invalid port;
  merging `.env.local` resolved it. The first SQL probe split a comment at its
  semicolon (42601), corrected before successful application. Initial local
  server provider calls failed TLS trust; restarting QA with the existing
  Windows CA bundle resolved them without disabling TLS verification.
- Final validation: all 189 tests passed; focused lint completed with existing
  image/accessibility warnings; TypeScript and final production build passed.
  The first final-build attempt hit Windows Prisma DLL EPERM while the QA server
  was running; stopping that identified QA process resolved it. Whitespace check
  passed. Existing CSR/Browserslist/punycode build warnings remain. Unrelated
  dirty files and asset deletions were preserved. No deployment was performed.


## AI usage reservation reliability (2026-10-26)

- Reproduced live reservation failures with isolated temporary workspaces:
  Prisma P2002 first-month upsert races and P2028 transaction failures.
  Replaced the empty monthly upsert update with an idempotent resetAt update
  to enable native PostgreSQL conflict handling. Reservation/refund transactions
  now have bounded 15-second acquisition and execution budgets.
- Live production-database verifier now passes four plan limits, 12 concurrent
  reservations with exact cap enforcement, history, workspace isolation,
  upgrade continuity, refund and UTC rollover. All temporary records cleaned.
  No customer plans or provider calls changed. The verifier now reports sanitized
  storage error codes before quota assertions.
- New regression failed before the fix; all 183 tests, TypeScript and focused
  lint pass. Production build and whitespace checks pass; existing CSR and
  deprecation warnings remain. Build used the existing Windows trusted CA file.
  Deployment and authenticated browser acceptance remain pending.


## AI chat production provider configuration (2026-10-26)

- Configured GEMINI_API_KEY, GROQ_API_KEY and YOU_API_KEY as sensitive Vercel
  Production variables using existing local credentials; no secrets enter Git.
- Direct live Groq and You Answer probes returned HTTP 200 with answer text.
  Gemini returned HTTP 400 FAILED_PRECONDITION: free tier unavailable in this
  country; Google AI Studio project billing must be enabled. Existing Gemini
  to Groq failover remains available. Commit d8fd008 reached Vercel Production
  Ready; the public `/api/ai-chat` reports all three provider keys configured.
- Added actionable Gemini billing error handling and a regression that failed
  before the fix. All 182 tests, TypeScript, focused route lint and production
  build passed (existing CSR/deprecation warnings remain).
  No authenticated production conversation or browser acceptance is claimed.


## Cloud project loading and safe recovery synchronization

- Fix commit `5270a8c` was pushed to main and its exact Vercel deployment reached
  Ready with the production alias. Post-deployment `node
  scripts/verify-studio-storage.mjs --production` passed real three-studio
  save/read, hierarchy/material/light/camera round-trip, concurrent 200/409,
  two-account read/list/write isolation, signed-out denial and logout/login
  reopening. Both isolated QA accounts were cleaned; no customer project or
  GPU job was modified. No deployment or database configuration blocker remains
  for this acceptance; the affected customer's original request is unobserved.

- Confirmed client defects: recovery fallback replaced every GET error with one
  generic warning; a never-uploaded revision-zero project's expected 404 looked
  like a cloud outage; autosave could PUT recovery before a verified GET; a clean
  cached hash could falsely satisfy verified-save after a failed reload. Stored
  scene corruption was also incorrectly reported by GET as database 503.
- Preserve actual API messages/status (including non-JSON HTTP errors), validate
  document identity/revision/scene before opening, and return 422 plus
  INVALID_PROJECT_DATA for invalid stored scenes without changing the record.
- Existing recovery requires a successful cloud read before uploads. Reconnect
  adopts an unmodified clean recovery's current cloud state, saves edits only
  against its verified revision, and exposes the existing conflict choices for
  divergent edits. No PUT is sent after auth, permission, missing-saved-project,
  corrupt-data or transient GET failures. Authenticated 404 permits first upload
  only at local revision zero; server foreign-ID/revision checks remain intact.
- Keep edits made during a pending reload. Explicit Open cloud copy first
  archives dirty recovery as an independently openable local project. IndexedDB
  records are never deleted. Browser online events retry unopened cloud loads
  and pending recovery verification. Existing JSON backup and visual UI remain.
- Current Vercel Production environment was pulled into ignored private storage:
  both database URLs parse and pass read-only SELECT 1. Runtime uses a Supabase
  pooler, pgbouncer=true and connection_limit=3. Read-only local model reads pass;
  production stored-scene audit found no invalid documents/revisions, ID mismatch
  or non-default workspace association. No database/environment changes needed.
- Production storage log query (last 24h, studio-project-storage) returned no
  matching entries. Real production isolated QA acceptance passed three-studio
  save/read, hierarchy/material/texture/light/camera round-trip, two-account
  read/list/write isolation, concurrent 200/409 and logout/login reopening.
  Only fresh QA records were cleaned. The affected customer's failing request
  is still unobserved; these results do not prove its exact underlying HTTP cause.
- New loader regressions first failed on accepted invalid data and lost HTTP
  status for non-JSON errors. Those now pass. Final full suite passed 181 tests,
  including first-upload-after-outage and transient-network loader regression.
  TypeScript, focused lint, whitespace checks and final production rebuild
  passed. Build uses the existing Windows trusted CA bundle/OpenFreeMap override;
  existing CSR deoptimization warnings remain. Full-repository lint was not
  rerun; its unrelated unused-variable errors remain documented above/below.
  No new configuration, migration, database or UI design is introduced.
- Initial generation browser regression passed Architecture/Infrastructure but
  stopped at Interior's Opening screen during a tool-host interruption. The
  dedicated cloud browser run then passed all per-studio fresh-load, refresh
  outage, no-PUT, reconnect, conflict and archive assertions, but final harness
  validation failed on two CDP Invalid InterceptionId cancellation races. Waiting
  for Network.loadingFailed alone did not resolve those; the verifier now also
  identifies requests from a superseded navigation. Final `--cloud-loading`
  browser acceptance passed all three studios, with mocked HTTP, against the
  local production build. Artifacts: `.tmp/hunyuan-browser-1793030110278/`.
  The final revision-zero first-upload-after-outage addition is unit-tested;
  it was made after that browser build. Live GPU generation is not claimed.
- Final-build `STUDIO_QA_URL=http://127.0.0.1:3036 node
  scripts/verify-hunyuan-studios.mjs` passed all three studios: real GLB preview,
  insertion, object transforms/history, autosave/reopen and light/dark WebGL.
  Auth/database/provider HTTP was mocked; no actual GPU was called. Artifacts:
  `.tmp/hunyuan-browser-1793030330995/`. An attempted server restart on 3035 hit
  EADDRINUSE from the leftover task server; that stale run was canceled, the
  identified server stopped, and the final build started fresh on 3036.


## Studio chat language selector removal

- Removed the SQ/EN/DE voice-language dropdown from the shared studio AI chat
  composer as requested. Existing speech settings and all other chat controls
  remain unchanged. No style or persistence changes.
- TypeScript and whitespace checks passed; focused lint passed with the existing
  image-element warning. Browser verification and a rebuild were not run for
  this single-control removal.

## Workspace persistence follow-up (2026-10-26)

- The exact workspace alert originates in PUT context initialization, before
  scene writes. The previously documented production URL repair remains effective:
  fresh real production Credentials login, save/read, concurrent 200/409,
  signed-out 401 and logout/login reopening passed today. No new database outage
  was reproduced for an isolated account; the affected customer's request and
  sanitized Prisma error remain unobserved.
- Read-only local schema reads passed for all seven workspace/project models.
  Stored production/preview configurations connected and confirmed required
  tables, enabled RLS and server CRUD privileges. The older audit script's
  select-id probe reports Prisma validation errors for three models without an
  id column; the full local model reads pass. No migration or record reset.
- Fixed false lost-response conflicts when PostgreSQL JSON object key order
  differs; array order and exact revision/document content remain protected.
  The new regression failed before the fix and passed afterward.
- Preserve pending rendered scenes on navigation, pagehide and page hiding,
  scoped to their original identity/studio. Reject stale-scope save/recovery
  callbacks and avoid inheriting the prior identity's rendered scene during
  authentication transitions. Existing debounced autosave, validated versioned
  JSON, IndexedDB recovery and UI presentation are retained.
- Expanded live acceptance to three studios, material/texture-reference,
  hierarchy/light/camera round-trips and two-account read/list/write isolation.
  These assertions passed before final re-login: first expanded run hit auth
  HTTP 429; the paced rerun hit UND_ERR_CONNECT_TIMEOUT on final auth HTTP.
  Both runs cleaned only their isolated QA data. Earlier single-account
  logout/login acceptance passed. Neither failure establishes a storage outage.
- Full Node suite passed all 167 tests, including navigation and recovery
  scope regression; TypeScript passed. Production build passed with the
  existing trusted CA bundle and OpenFreeMap override, including the final
  rebuild. Focused lint passed without warnings. Full lint still fails on
  existing unused imports/variables in unrelated app pages, legacy studio
  panels, email and PayPal modules (full output `.tmp/storage-lint.log`).
  No live GPU generation or affected-account verification is claimed.
- `STUDIO_QA_URL=http://127.0.0.1:3035 node scripts/verify-hunyuan-studios.mjs`
  passed all three studio image/chat asset insertion, transforms/history,
  save/reopen and light/dark WebGL checks. Storage 503 error propagation,
  preserved recovery and retry passed; HTTP auth/database/jobs were mocked,
  and GLB data was real. Artifacts: `.tmp/hunyuan-browser-1793023764501/`.
  The first attempt ran before the local server was ready and failed with
  ERR_CONNECTION_REFUSED; rerun passed. Dev Google Fonts downloads used fallback
  fonts because that server lacked the trusted CA environment; no CSS changed.
- JSON scene validation and geometry export/import round-trips are covered by
  the Node suite; full browser JSON download/reimport and a live generated
  asset/logout/login round-trip were not run in this increment. Recovery remains
  IndexedDB-backed (8 MB validated scene budget); Hunyuan models use private
  asset references. Production GPU/storage provisioning remains outstanding.


## Workspace persistence recheck and recovery isolation

- Re-ran `node scripts/verify-studio-storage.mjs --production` with the existing
  Windows trusted CA bundle: real Credentials login, workspace initialization,
  save/read, concurrent 200/409, signed-out 401 and login/reopen passed. Only the
  fresh isolated QA records were cleaned. Initial invocation failed before HTTP
  with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`; TLS verification was never disabled.
- The screenshot message is emitted by the PUT route's context initialization
  catch, before scene writes. Prior malformed production URL correction remains
  effective for this isolated account; the affected user's exact Prisma failure
  still requires sanitized production logs. No new database migration is needed.
- Fixed the shared active-project pointer across studios. New recovery writes
  carry optional studio metadata; without a tab pointer the latest valid recovery
  for that identity/studio is restored. Legacy records remain readable by project
  ID and through Open; no records are deleted or guessed into a studio.
- Cloud opening now has bounded request deadlines, transient retries and
  cancellation. Authentication/not-found errors are preserved without retries.
  Save confirmation, revision protection and existing visual components remain.
- Corrected an incomplete Prisma error-class mock uncovered by the full suite.
  Added load retry/cancellation and recovery identity/studio/corruption coverage.
- No new live GPU generation or affected-account browser interaction was run.
  Production Hunyuan still needs its separate remote worker/private asset setup.


## Workspace recovery follow-up (2026-10-25)

- The screenshot's exact `PUT /api/studio-projects` 503 occurs while resolving
  `requirePlatformContext`, before the scene transaction. Production and Preview
  database URLs passed read-only connections through transaction/session poolers;
  required workspace tables, RLS flags and service-role CRUD privileges were
  present. Recent production logs had no matching 503, so the specific failing
  Prisma code for the user's request remains unobserved. The route now logs only
  operation and safe Prisma code for future diagnosis, never secrets or scenes.
- Existing workspace lookup previously executed four default upserts on every
  request. Defaults now initialize once per warm process and coalesce parallel
  requests; first workspace creation and defaults run in one serializable
  transaction with bounded serialization retry. No migration or data deletion.
- Client scene saves now retry transient failures, reconcile a lost PUT response
  against the exact cloud document and revision, and keep browser recovery when
  cloud storage fails. Automatic retries and the browser `online` event resync
  pending edits, while revision conflicts continue to block stale overwrites.
- Verified 162 Node tests, TypeScript and production build. Repository-wide lint
  still fails on existing unused variables/imports outside this increment.
  Deployment `f20cd06` reached Vercel Production Ready. Live acceptance after
  deployment could not start: both Node fetch and curl to the production alias
  timed out before HTTP (`UND_ERR_CONNECT_TIMEOUT` / curl 28). The isolated QA
  principal created by each attempted test was cleaned. The user's affected
  account/session remains unverified; mocked tests are not live Hunyuan runs.

## Workspace save configuration and confirmation

- Reproduced the screenshot's failing boundary: its top alert is emitted when
  authenticated workspace initialization throws, before scene persistence.
  An actual local Credentials sign-in, workspace initialization and first save
  returned 200/revision 1 using an isolated QA principal, then cleaned its data.
- Downloaded the current Vercel production configuration into ignored storage:
  both DATABASE_URL and DIRECT_URL failed URL parsing. Verified the working local
  poolers identify the same database project, database name and password before
  updating only those two production settings using private CLI stdin. Pulled
  the updated settings again; both now pass read-only SELECT 1. Deployment
  `f7c5d90` activated those settings in running production functions. No credentials
  were printed or committed; no customer records or subscriptions were changed.
- Save confirmation now requires `saved: true`, the expected project ID and
  next revision. Save failures retain their actual server message/status for
  generation and voice callers rather than replacing them with a generic
  confirmation error. Failed saves still prevent GPU submission.
- Added an opt-in localhost `node scripts/verify-studio-storage.mjs` acceptance
  using actual Credentials auth and database persistence; no email or GPU call.
  `--production` explicitly permits the verified project production alias only;
  other remote origins and remote tests without that flag are rejected before
  creating records. It uses an isolated synthetic QA account, not a customer.
- Verification so far: 159 Node tests, TypeScript and focused lint passed.
- Real single-account HTTP/database acceptance passed initialization, first
  save/read, two concurrent saves (200/409), sign-out denial and sign-in/reopen;
  fresh QA records were cleaned. An initial expanded run stopped during a second
  isolated account's sign-in (reported `Error`), so live foreign-account checking
  remains pending; existing mocked route ownership regressions passed.
- Installed Chrome against the development server passed exact 503-message
  propagation into chat, zero GPU submissions on failed save, recovery/retry,
  and the existing preview/insertion/transforms/history/reopen flow in all three
  3D studios. Auth/database/job HTTP in this browser regression were mocked;
  real storage acceptance is recorded separately above. Artifacts:
  `.tmp/hunyuan-browser-1792892717008/`.
- Production build passed with the existing Windows trusted CA bundle and
  OpenFreeMap build override; existing client-render warnings remain. Focused
  save-response/origin-guard tests and changed-file lint passed afterward.
- Final full suite passed all 160 tests; post-build TypeScript passed. Commit
  `f7c5d90` was pushed and its Vercel production deployment reached Ready.
  `node scripts/verify-studio-storage.mjs --production` then passed actual
  Credentials sign-in, workspace initialization, save/read, concurrent 200/409,
  signed-out 401 and sign-in/reopen at `https://alternusartgallery.vercel.app`.
  QA records were cleaned; no customer account, email or GPU request was used.
  This verifies deployed workspace persistence, not remote Hunyuan generation:
  production still has no configured GPU worker or private asset bucket.


## Hunyuan availability and sign-in errors

- Replaced the toolbar's synchronous check of an initially empty provider list
  with a fresh awaited discovery request. A failed discovery is distinct from a
  server without Hunyuan configuration; retry rechecks instead of selecting an
  unavailable mode. The toggle is disabled while checking.
- Guest image generation now shows Sign in before submission, preserves the
  attached image in the current tab, and links to login with a studio return URL.
  Generation/resume also checks the server session before saving or requesting
  jobs; expired sessions receive the same action. Existing API authentication,
  user/workspace ownership and production-worker restrictions remain enforced.
- Actual local HTTP checks: provider discovery lists Hunyuan; worker health is
  healthy with its pipeline loaded. This does not configure a public deployment.
- Verification: 157 Node tests, TypeScript and focused lint passed (existing chat
  image warning). Browser regression now includes delayed discovery, missing
  configuration/retry and guest sign-in without GPU submission. No user account
  was signed in by automation. Computer Use initialization crashed; browser QA
  uses the existing isolated installed-Chrome verifier.
- Production build and post-build TypeScript passed. Port 3033 was occupied;
  final production QA uses 3047. The initial dev-server verifier completed the
  scene interactions but failed its final error assertion on canceled delayed
  CDP interceptions; it now ignores that specific protocol error only when
  Network.loadingFailed confirms the request was canceled.
- Final production Chrome run passed delayed discovery/missing-provider retry,
  guest sign-in guidance with retained attachment/no GPU submission, and full
  GLB preview/insertion/transforms/history/save/reopen in all three 3D studios.
  Auth/database/job HTTP remained mocked. Artifacts:
  `.tmp/hunyuan-browser-1792892076071/`.

## Hunyuan generation workflow continuation

- Added the toolbar generation toggle, explicit image generation action, actual
  worker stages/diffusion step counts, reconnecting polling, and GLB preview,
  insertion and download actions. Preview remains uncommitted until insertion.
  Recovery initialization disables edits until its latest lookup finishes.
- Worker checkpoint loading temporarily uses mapped ZIP checkpoint reads and
  fp16 initialization, restoring Torch globals afterward. CPU contract tests
  cover callbacks and restoration; this continuation did not run CUDA inference.
- Added optional private Supabase Storage uploads and 120-second signed downloads
  behind the existing authenticated ownership check, with scoped studio CSP.
  Uploads and signing both reject public buckets. Remote production generation
  requires storage configuration; no bucket or remote GPU was provisioned.
- Added secret-safe read-only environment verification and opt-in localhost
  authenticated browser QA using an isolated test principal.
- Read-only `node scripts/verify-hunyuan-environment.mjs` now passes SELECT 1
  through both configured Supavisor transaction/runtime and session/direct URLs.
  This supersedes the earlier invalid local URL blocker. The shell has a stale
  inherited database override; the verifier reports and checks file values.
- Verification: 155 Node tests, five CPU worker tests, standalone TypeScript,
  and focused Next lint passed (existing chat image warning). The added public
  download regression failed before the signing fix and passed afterward.
  Initial `npm run build` hit Prisma DLL EPERM; the identified repository dev
  server was stopped and the retry passed using the existing trusted CA bundle
  and OpenFreeMap build override. Existing client-render warnings remain.
  npm-forwarded lint dropped file flags;
  direct `node node_modules/next/dist/bin/next lint --file ...` passed.
- Fresh Chrome verification against the production build passed Architecture,
  Infrastructure and Interior 3D: toolbar toggle, reference upload, uncommitted
  native GLB preview, explicit insertion, selection, transforms, duplicate,
  deletion, Undo/Redo and snapshot/reopen with light/dark screenshots. Auth,
  database and job HTTP were mocked; source GLB geometry was real. Artifacts:
  `.tmp/hunyuan-browser-1792891360390/`. Final post-build TypeScript and staged
  diff checks passed. Live authenticated GPU acceptance remains pending.


## Hunyuan3D local shape generation

- Extended existing studio chat/provider/job/import flows without changing any
  stylesheet or replacing studios/providers/auth. Reference images use the
  existing paperclip and AI mode selector; completed results offer Insert into
  Studio. The authenticated project saves before a job is submitted.
- Added a loopback-only Python queue using the verified existing Conda/CUDA
  pipeline and cached shape checkpoint. No paint/rembg/Blender/DeepSpeed model
  imports, driver/PyTorch changes or duplicate downloads. One inference thread,
  four queued jobs, bounded staging, explicit OOM/failure/restart handling.
- Next validates bytes/type/dimensions/size and existing user/workspace/project
  ownership. Images are hashed for idempotency, never stored in PostgreSQL.
  Completed GLBs are copied atomically to private local asset storage before
  SUCCEEDED. Worker paths/URLs/tokens never appear in client job DTOs.
- Native `model` scene references preserve full geometry outside the database,
  existing transforms/materials/picking/selection/history/export and project
  snapshots. The original 344,854-vertex demo exceeds embedded-mesh limits, so
  those budgets remain unchanged. Source caches are bounded and identity changes
  reject late downloads. No database migration was needed.
- Real worker startup/health, malformed image rejection, job submission and
  processing→completed CUDA inference passed. Downloaded a fresh valid GLB of
  12,146,620 bytes. Both demo and new output passed full-vertex scene loading,
  selection, transforms, duplicate, history and reference restoration tests.
- Final verification: all 151 Node tests and three worker validation/auth tests
  passed, including private asset copying/authorization, offline completed-job
  resume and late-identity download rejection. Standalone TypeScript, production
  build and focused lint passed (existing chat image warning only).
- Installed Chrome against the final local production build passed all three
  3D routes: image attachment, chat result, explicit insertion, selection,
  move/rotate/scale, duplicate/delete, Undo/Redo and snapshot/reopen restoration.
  Auth/database/job HTTP were isolated test adapters; source geometry was the
  fresh real CUDA GLB. Screenshots in `.tmp/hunyuan-browser-1792869418361/`;
  Architecture dark and Interior light were visually inspected with framed,
  selected generated meshes. No UI stylesheet changed. The preferred browser
  runtime crashed during initialization; the installed-Chrome fallback worked.
- Worker restart/health and completed-job metadata recovery also passed after
  the final worker restart. Corrected Pillow JPEG's
  optional `n_frames` attribute. Type checking and production build passed;
  initial Prisma generation hit EPERM from the old port-3033 Next server's DLL
  lock, then passed after that identified server was stopped. Full lint retains
  pre-existing unrelated unused-code errors.
- Left the final worker on 127.0.0.1:8081 and the configured development app on
  127.0.0.1:3000. Real Next provider discovery includes Hunyuan and an actual
  unauthenticated generation request returns 401. `.env.local` contains only the
  added worker URL; existing credential settings were preserved.
- Read-only database verification reproduced `DATABASE_URL: INVALID_URL; check
  password URL encoding`. Live authenticated generation/cloud reopen remains
  blocked; no authentication bypass was added. Remote production storage/GPU
  infrastructure is unprovisioned. Inspected territorial, commercial and
  redistribution conditions; EU/UK/South Korea are excluded by the installed
  license. No public GPU exposure or deployment was performed.
- See `HUNYUAN3D-LOCAL.md` for startup commands, API contracts, file inventory,
  resource limits, production architecture and verification boundaries.

## Contextual 3D selection and automatic reversible editing

- Added selected hierarchy-path context to the existing floating dock and wired
  contextual roof/wall/material/building-height edits into actual validated scene
  transactions. Native Gemini/Groq commands now auto-apply reversible edits;
  all chat deletions require confirmation. Provider-returned targets are scoped
  to selection/descendants, with stale-document, locked-object and schema checks.
- Added real segmented wall openings/glazing, parametric flat roof conversion,
  one-step history, rendered-document acknowledgment and failed-render rollback.
  Added a non-pickable transparent GPU blue checker/scan overlay scoped to affected
  meshes with completion fade and shader cleanup. Removed the approval footer and
  retained scene-mode controls inside the bottom-aligned existing chat panel.
- Focused geometry/API/selection tests and TypeScript passed after fixing the
  extended route test dependency and requested outline color expectations. Full
  suite passed 145 tests. Initial build hit Prisma Windows DLL `EPERM` rename;
  stopped only the verified earlier QA servers and retried. See
  `CONTEXTUAL-SCENE-EDITING.md` for capability and verification boundaries.
- Continuation verification on 2026-10-24: all 145 tests, focused Next lint,
  standalone TypeScript and production build passed. Build used the existing
  Windows trusted CA bundle and OpenFreeMap build-time override. Focused lint
  retains the existing chat image warning; build retains client-render warnings.
- Real Chrome against the fresh local production build passed component raycast
  selection/context, roof/material/window/group-height edits, GPU lifecycle,
  Enter and keyboard Undo/Redo, IndexedDB reload, deletion confirmation and
  actual unauthenticated native-planner failure without geometry changes. No HTTP
  interception was used. Desktop chat/sidebar alignment passed. Live signed-in
  Gemini/Groq and cloud save/reopen remain unverified external checks.
- Corrected the browser verifier's mobile inspector-collapse selector and added
  an assertion that both panels close before capturing the mobile screenshot.
  Final artifacts: `.tmp/scene-editing-1792852690124/`; desktop and mobile
  screenshots were visually inspected.
  Unrelated Section image deletions, migration helpers and crash reports remain
  outside this increment.

## Reset Password shared auth design

- Both email-link request and token password forms now use the exact shared
  Login/Signup AuthShell, artwork, 1181px horizontal frame, responsive stacking,
  yellow action buttons, fields, footer and stored light/dark preference.
  Success returns to login with the same action styling; errors use accessible
  alerts and theme-aware colors. Existing API endpoints/payloads and password
  length/matching validation are retained.
- Extended the auth browser verifier to both reset modes at 1440/900/390px in
  both themes, plus request/reset errors, password validation and success states.
  It accepts a localhost-only `AUTH_QA_URL` to avoid reusing a stale server.
- Production build, focused lint and final TypeScript passed. The first standalone
  typecheck raced build regeneration of `.next/types` and reported TS6053 missing
  generated files; rerunning after build completion passed. Diff checks passed.
- Chrome against the local production server passed all 24 route/width/theme
  combinations, shared shell alignment/no horizontal overflow, existing login
  code/back and signup validation, stored theme reload, reset request errors/
  success and token password length/mismatch/API-error/success flows. Actual email
  delivery/token consumption was not invoked; auth HTTP responses were fixtures.
  Artifacts: `.tmp/auth-reference-1792784683495/`; desktop dark request and mobile
  light token screenshots visually inspected.

## Microphone policy after client navigation

- Reproduced the missing case with a failing entry-document policy regression:
  homepage/login used `microphone=()` and Next client navigation into a studio
  retained that original document policy. Direct studio-load tests missed it.
- The shared document policy now allows only `microphone=(self)`, still requires
  browser/OS consent and explicit Start, and keeps camera disabled. Removed
  redundant studio-only overrides. Cross-origin parent restrictions still apply.
- The browser verifier now enters Architecture through the actual homepage link,
  asserts that client navigation retained the same document and checks its real
  microphone policy before the existing audio capture/cleanup regressions.
- Correct build-time map override is `NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE`;
  the earlier continuation TODO incorrectly used a `_URL` suffix.
- Verification: 140 tests passed, TypeScript and focused config lint passed;
  production build passed using the existing Windows trusted CA bundle and the
  build-time OpenFreeMap override. Actual homepage/Interior HTTP responses both
  returned `microphone=(self)`. Initial server start on 3003 failed with
  `EADDRINUSE`; the fresh verification server uses 3013 instead.
- Full Chrome verifier passed from homepage client navigation: retained-document
  microphone permission policy, real synthetic capture/analyser/recorder cleanup,
  both voice buttons, 3D/2D commands/history/saves/reloads, map controls and mobile
  modal geometry. Artifacts: `.tmp/studio-actions-1792784350441/`. Recognition,
  playback and provider HTTP remain injected; physical acoustic/audible speech
  and deployed HTTPS checks still require a real device/session. After deployment,
  reload existing tabs to replace the old document's blocking policy.

## Voice Speech continuation verification

- Resumed the pending compact microphone/Voice frame and studio command work for
  commit/push. Fresh `npm test` passed all 140 tests; `npm run typecheck` and
  `npm run build` passed (build used `.tmp/windows-trusted-cas.pem`). Focused
  Next lint passed with existing image/hook warnings; diff checks passed.
- Fresh `node scripts/verify-studio-actions.mjs` passed exact modal/audio,
  3D actions/history/confirmation and browser save, then exited 1 at map readiness:
  the compiled MapTiler placeholder style returned HTTP 403. The remainder of
  this fresh browser run did not execute. Rebuild with the OpenFreeMap style
  override set at build time before rerunning the complete verifier; a runtime
  NEXT_PUBLIC override cannot replace the compiled client setting.
- Unrelated deleted Section images, temporary migration scripts and Node crash
  reports are excluded from the voice commit. Physical microphones, installed
  voices and authenticated production provider/save checks remain pending.

## Context-aware studio commands and compact voice modal

- Both existing voice icons and Ctrl+Q open the same 271×138 Voice Speech modal,
  matching the supplied #222 / #3e3e3e / #579bff reference and exact button sizes.
  Opening is idle; Start acquires audio, real analyser levels drive listening
  bars, Stop finishes transcription and Close/Esc releases capture/playback.
- Added a strict typed finite English/Albanian action schema and shared registry
  for typed chat and voice. Current 3D and 2D adapters call existing geometry,
  template, viewport, toolbar, map, history and persistence functions. Ambiguous
  targets and unsupported capabilities produce clear errors. Bulk deletion/new
  project replacement require a separate, expiring state-bound confirmation.
- Known microphone commands preserve unrelated typed drafts. Voice entry can
  speak confirmed replies using browser TTS; each subsequent turn requires Start.
  Complex geometry requests retain the existing configured AI proposal/approval
  flow. No arbitrary provider-generated JavaScript or fake action results.
- Added identity-scoped validated floor-plan browser recovery before command
  navigation, reload restoration with cleared prior-identity undo history and
  actual read-back confirmation. 3D save results verify workspace/recovery hashes.
  Camera commands now retain actual perspective camera updates in saved scenes.
- Found and fixed a document-CSP issue during real navigation: Next client routing
  from Architecture retained its tile-blocking policy in Infrastructure. Entering
  or leaving Infrastructure now loads the appropriate document after recovery;
  global source permissions remain scoped rather than broadening every route.
- `npm test`: 140 passed. TypeScript and production build passed with the existing
  Windows trusted CA bundle. Focused lint passed with only existing image and
  legacy viewport hook warnings; diff checks passed. Existing full-project lint
  baseline outside this increment was not repaired.
- Chrome against the local production build passed exact modal/button geometry,
  idle/static and real synthetic-device audio-responsive waveform, both icons,
  keyboard opening, capture/close cleanup and actual MediaRecorder fallback.
  It verified cube/building creation, numeric transforms, material, duplicate,
  undo/redo, bulk/stale confirmation, selection clarification, tools/panels,
  export choices and actual IndexedDB save/reload/camera retention.
- The same run passed real policy-correct route navigation, MapLibre external
  tiles, zoom/pan/bearing/pitch/search/focus-error/close, 2D wall edits/history,
  unavailable 3D-in-2D errors, localStorage save/reload, Interior/Floor Plan routes,
  390/1440px modal sizing and returning to the original 3D project. No configured
  text/scene AI endpoint was invoked by known local commands. Browser artifact:
  `.tmp/studio-actions-1792774832164/`; mobile screenshot visually inspected.
- Speech recognition, TTS playback, provider HTTP and geocoding were injected in
  browser QA; microphone/analyser/recorder, studio actions, map engine, tiles and
  local persistence were real. Physical acoustic accuracy, installed SQ/EN voices,
  real geocoding credentials and authenticated cloud/database/provider workflows
  remain external checks. See `STUDIO-ACTIONS.md` for capabilities and limitations.

## Studio microphone and voice repair

- Confirmed root cause in source and the hosted HTTPS `/interior` response:
  `Permissions-Policy: microphone=()` blocked access despite browser Allow.
  Studio documents/aliases now permit only same-origin microphone while keeping
  camera and other routes restricted. Browser recognition `not-allowed` is no
  longer reported as proof of denied device permission.
- Added explicit audio-only getUserMedia capture, actual analyser level meter,
  supported MediaRecorder fallback, precise device/security errors, retry and
  cleanup for tracks, audio contexts, timers, disconnects and late callbacks.
  Native recognition receives the captured audio track where supported; final
  dictation appends to the editable draft, with transient interim status.
- The existing Voice/radio icon now enables a separate opt-in conversation:
  one final utterance -> existing AI adapter -> browser speech playback, then
  resume listening. Capture stops before processing/playback. Stop, spoken
  cancel, Esc, hiding, unmount and identity changes end resources; canceled
  sessions cannot resume through a late reply. Scene preview approval remains.
- Added authenticated `/api/studio-voice/transcribe`: existing server-only Groq
  key, multilingual Whisper, 3 MB audio/3.1 MB multipart bound, safe errors,
  no-store responses, 20-second provider deadline and existing persistent
  per-user 10/15-minute limit. No audio storage. Browser-native failure can use
  recorded transcription; unavailable auth/key/DB produces actionable feedback.
- Full suite: 133 tests passed. Final focused voice/API/policy checks: 20 passed.
  TypeScript and production build passed with the existing trusted CA bundle.
  Focused lint passed with only the existing StudioAIChat image warning; full
  project lint's recorded unrelated baseline remains. No auth/schema redesign.
- Chrome against a local production build passed real synthetic-device
  getUserMedia, MediaRecorder and AudioContext, actual document policy, all
  Architecture/Interior/Infrastructure routes, dictation, permission-denial
  retry, service-refusal fallback, track cleanup, voice submit/TTS wiring,
  unsupported recognition, refresh and 390px Interior controls. First passing
  artifacts: `.tmp/studio-voice-1792763664205/`. Final production run also passed
  spoken cancellation/session teardown in every studio:
  `.tmp/studio-voice-1792763926181/`; mobile screenshot inspected.
- Earlier dev-browser attempts failed when generated `.next` layout chunks
  could not be opened under low disk space. Removed only verified generated
  current-session QA profiles and build cache, preserving screenshots/source;
  production rebuilding restored hydration and successful browser checks.
- Recognition, AI/transcription HTTP and speech playback were injected in
  browser checks; physical audio accuracy, real Groq transcription/limiter DB,
  installed Albanian/English voices, audible output and post-deploy HTTPS
  microphone interaction remain explicit external/device checks.

## Infrastructure geographic selection and scene import

- Extended the existing map/toolbar/viewport without replacing sidebars, chat,
  theme controls or scene editing. OpenFreeMap Liberty is now the default in
  development and production, with scoped CSP and native attribution; custom
  HTTPS styles remain supported. Added address searches to the server adapter.
- Rendered-feature picking highlights bounded GeoJSON and exposes actual
  metadata; fit selection, fullscreen, north/level and 2D/3D controls use the
  retained map. Building fill layers can extrude source heights. Missing
  building/terrain data is reported rather than fabricated.
- Polygon/MultiPolygon import creates real editable building meshes only with
  valid source height, or flat land footprints, preserving courtyard holes.
  WGS84 ellipsoid -> ECEF -> local east/up/south coordinates use the first
  imported object's origin, a 2 km bound and ±85° latitude limit. Validated
  source GeoJSON/origin persist through existing scene snapshots, recovery and
  history. One import is one undo entry. Base maps remain read-only.
- `npm test`: 122 passed. Final focused map/import tests: 11 passed after WGS84
  refinement. TypeScript, focused ESLint and diff checks passed. Production
  build passed with the existing Windows trusted CA bundle; existing
  Browserslist and client-render warnings remain. Full-project lint's recorded
  unrelated baseline was not repaired by this scoped map change.
- Development Chrome passed real OpenFreeMap tiles/navigation and retained
  scene/map canvases, then deterministic GeoJSON rendering/picking/highlight,
  graphics retry, building import and atomic undo/redo, plus 1440/390px resize.
  Artifacts: `.tmp/world-map-1792758999974/`. Screenshot review identified
  overlapping mobile metadata/navigation controls; CSS now reserves control
  space and bounds metadata scrolling. Final production Chrome also passed
  real tiles, wheel zoom, fullscreen/exit, fit selection, pitch, retained state,
  retry, mesh import/undo/redo and mobile control separation. Artifacts:
  `.tmp/world-map-1792759508416/`; final mobile screenshot inspected.
- Initial local browser attempts failed because this checkout has a MapTiler
  style placeholder returning HTTP 403. QA/build override only the process
  environment with OpenFreeMap; no private environment file was changed.
  Remove placeholder style overrides in deployment to use the default. Address
  search still needs a valid MapTiler key; live geocoding and authenticated
  cloud persistence are not claimed. Full road/lane drawing, geometry snapping,
  merged un-clipped feature retrieval and terrain meshes remain future work.

## Infrastructure MapLibre globe

- Fixed the World Map toggle overflowing the Infrastructure viewport toolbar:
  the 113px labelled accent button pushed CSV/Lighting out of view
  (scrollWidth 874 > clientWidth 802 at 1440px). It is now a 33px Globe/Box
  icon button with the same "World Map"/"3D Editor" aria-label and tooltip.
  Headless Chrome at 1440px: toolbar 792/792, no overflow; `tsc --noEmit` passed.
- Added World Map / 3D Editor in the existing Infrastructure toolbar, with
  MapLibre GL JS pinned to 6.15.0. Both canvases stay mounted; model data,
  selection, editor camera, history and chat retain their existing ownership.
  Globe supports pan, zoom, rotation/pitch, coordinate search and selection
  markers. Existing sidebars, chat, routes, auth and database are preserved.
- Fixed v6's separate ESM worker URL under Next bundling, scoped page AND
  worker response CSP for tiles/glyphs, and marker initialization order.
  Earlier readiness failures included incomplete Next development chunks
  under low disk space; clearing generated cache/profiles restored hydration.
  The verifier now captures browser/network diagnostics. Fixed its selector
  quoting, DOM serialization and ambiguous World Map button selector.
- Chrome passed real globe initialization/tiles, zoom, pan, rotation, pitch,
  coordinate markers, missing-key feedback, retained canvas identity, selected
  model and Undo/Redo across mode switches, and 1440/390px resizing. City and
  country result selection used mocked geocoding HTTP; session was mocked as
  signed out. Screenshots inspected; mobile search now clears panel toggles.
  Final browser artifacts: `.tmp/world-map-1792712107372/`; extended history
  and search coverage also passed in `.tmp/world-map-1792712053798/`.
- `npm test`: 118 passed. TypeScript, focused lint and diff checks passed.
  Full-project lint retains 57 unrelated existing errors. `npm run build`
  passed with the Windows trusted CA bundle after narrowly preserving the
  already-minified ESM worker from Next 14's classic-script asset optimizer.
  Production worker bytes match the installed 6.15.0 module exactly. Local
  production Chrome passed Infrastructure rendering, retained model/canvas,
  production style gating (no demo requests), and Architecture/Interior 3D
  rendering with no World Map control. Existing Browserslist/auth client-render
  warnings remain. No live MapTiler request or cloud save is
  claimed: no geocoding key is configured in this checkout. Production mapping
  requires a licensed style and source origins; demo tiles are blocked outside
  development. See `INFRASTRUCTURE-MAP.md`. No deployment was performed.

## Studio object picking and axis movement

- Shared Architecture, Infrastructure and Interior 3D selection now runs on
  click/release, with a 5px gesture threshold and thin-surface picking tolerance.
  Exact surface hits take priority; hidden/locked ancestors are respected.
- Transform gizmos are larger (1.2), retain selection during dragging and
  capture the pointer. Camera orbit is disabled during transforms. Only changed
  transforms create an undo entry; hidden-parent objects cannot show a gizmo.
- Chrome verified all three X/Y/Z drags, unchanged other axes, retained selection,
  single-step Undo and Redo in all three studios. Existing multi-selection and
  hover checks passed in light/dark, plus original Interior sketch selection.
  Corrected the existing test's empty-space coordinate, which was on a cube.
- `npm test`: 111 passed. TypeScript and focused ESLint passed. Browser artifacts:
  `.tmp/scene-transform-1792691732083` and `.tmp/scene-selection-1792691672015`.
  These are local editor checks with a mocked signed-out session, not cloud-save
  or production verification. `npm run build` passed with the Windows trusted-CA
  bundle; existing Browserslist and auth-page client-render warnings remain.

## Homepage marquee presentation follow-up

- Removed the gray surface and pause control; centered the transparent strip
  on the existing 1280px content alignment. Removed the reduced-motion two-row
  fallback and hover pause per the explicit uninterrupted-scroll request.
  All four brands remain in one continuous horizontal row, with no action icon.
- Chrome passed at 1920/1440/768/390/320px: single row, transparent surface,
  no buttons, movement/hover continuity, icon loading and no overflow/errors.
  Also confirmed the row and animation remain active with reduced motion set.
  Focused lint and diff checks passed; desktop screenshot inspected. Build and
  typecheck were not repeated for this presentation/state-removal follow-up.

## Production audit and Homepage tools marquee

- Audited 73 production URLs and opened 11 key routes in real signed-out Chrome.
  108 local tests, TypeScript and baseline build passed. Full lint has 57
  existing errors. Found Help Center 404, reproduced React #418/#423 and broken
  code highlighting in `/workspace/code`, and confirmed an empty live 3D
  provider registry. Local DB verification still fails URL parsing; payment
  helpers remain stubs. See `SITE-AUDIT-2026-10-22.md` for scope and limitations.
- Added Blender, Unreal Engine, Unity and Autodesk icon/text marquee directly
  after Hero. Two repeated groups scroll continuously; duplicate content is
  hidden from assistive technology. Pause/resume and reduced motion supported.
  Local Simple Icons assets do not imply verified integrations or endorsement.
- Local Chrome passed at 1920/1440/768/390/320px: order, continuous movement,
  pause/resume, reduced motion, four icons, no overflow/runtime exceptions.
  Desktop screenshot inspected; focused lint and TypeScript passed. Final
  build initially hit ENOSPC; QA-created Chrome profiles were cleaned up.
- Final build then passed with the Windows trusted CA bundle. Diff checks
  passed; no application routes outside Homepage were modified in this work.

## Homepage width, sticky navigation and corners

- Matched navbar and section content to a 1280px maximum width with shared
  responsive gutters. Made the Homepage navbar sticky in the existing main
  scroll container by removing the intermediate overflow trap; glass remains.
  Action buttons use 8px corners; hero/feature/capability images use 24px.
- Chrome checks passed at all six existing widths in light/dark: navbar/hero
  edges match, header stays at top after 600px scroll, exact corner values,
  no overflow, unchanged text/links/typography and video/CTA interactions.
  Desktop screenshot inspected; zero runtime exceptions. CSS parse and diff
  checks passed. Build/typecheck were not repeated for this CSS-only change.

## Homepage editorial redesign, isolated to `/`

- Added a Homepage-only wrapper and stylesheet for an open editorial hero,
  wide existing architectural image, capability image strips, alternating
  feature spreads, horizontal service rows, open workflow/control layouts,
  restrained desktop/download surfaces and spaced footer groups. Shared shell
  source, studios, authentication, pricing logic and APIs are unchanged.
- Preserved the existing navbar glass surface per the follow-up request;
  refined its buttons only. Other Homepage surfaces render without gradients,
  shadows or blur, with restrained corners and visible keyboard focus.
- Local Chrome baseline comparison passed at 1920/1440/1280/768/390/320px in
  both themes: all 10 sections in order, 105 text/link/button elements and
  their typography properties unchanged; primary CTA remains #4284FF.
  No horizontal overflow or runtime exceptions. Actual theme toggle, video
  opening/Escape, focus and Download CTA navigation passed. Auth session was
  mocked as signed out; no backend/provider changes or production verification.
  Desktop/mobile section screenshots were visually inspected. Temporary QA
  script and artifacts: `.tmp/home-qa.mjs`, `.tmp/home-redesign/`.
- TypeScript and focused Homepage lint passed; full-project lint remains
  blocked by pre-existing unused variables in aicode, archplan, API seed,
  studio-shell, email and PayPal code, among other unrelated files.
- Production build passed using the existing Windows trusted CA bundle via
  NODE_EXTRA_CA_CERTS; existing client-rendering warnings remain. CSS parsing,
  Homepage selector isolation and diff checks passed. QA server was stopped.


## Restore original Usage and Limits presentation with real AI quotas

- Restored the original account section typography, blue eyebrows, 820px
  card width, three statistic cards, thin meters and daily bar chart with
  hover values, peak/average and 7/15/30/90-day controls. Cards show actual
  consumed credits, current plan/allowance and remaining credits. No demo
  knowledge/voice metrics or unlimited quotas were reintroduced.
- Limits now has its own original row-card presentation with actual monthly
  allowance, consumption, remaining credits, shared 1/1/20 request costs and
  UTC renewal. It reuses the authenticated usage API and plan ratios. Loading
  and errors retain the card layout with unknown-value placeholders.
- Added a cancellable 15-second usage fetch deadline and Retry, so an
  unresponsive backend cannot leave the screen loading indefinitely. This is
  a client reliability change; it does not resolve the existing Supabase
  connection blocker or invent usage when the backend is unavailable.
- `npm test`: 108 passed; TypeScript passed. Focused lint passed with only the
  existing account image warning; diff checks passed. Chrome checked both
  Usage and Limits in light/dark, all plans/ranges, real hover behavior,
  warning/cap/empty/error cases, loading placeholders, an actual 15-second
  stalled request followed by Retry, and signed-out visibility. Auth and API
  HTTP were mocked. Zero runtime exceptions. Screenshots visually inspected;
  artifacts `.tmp/account-usage-1792674108599/`. QA server stopped for build.
- `npm run build`: passed with the Windows trusted CA bundle loaded through
  NODE_EXTRA_CA_CERTS; existing client-rendering warnings remain. No database
  schema changes, production database writes or live-provider calls were made.

## Restore AI chat frame spacing in both themes

- Removed only the two shared-kit background overrides for `/aichat` aside
  and main. Existing JSX colors now apply again: canvas/sidebar background
  around the panel, panel background inside the existing 8px margin/radius.
  This makes the original spacing visible in light and dark. No chat markup,
  handlers, content, dimensions or other studio styling changed.
- Local Chrome checked 1920/390px in both themes using the actual theme button:
  8px top/right/bottom and desktop sidebar gap, distinct panel/frame colors,
  no horizontal overflow, retained welcome/composer and no runtime exceptions.
  Auth HTTP was mocked as signed out. Desktop screenshots visually inspected;
  artifacts `.tmp/aichat-frame-1792672738394/`. CSS parse and diff checks passed.
  Production build/typecheck were not repeated for this two-rule CSS removal.

## Usage activation follow-up: Prisma routing, production build and browser QA

- Prisma CLI now uses DIRECT_URL for schema operations, while DATABASE_URL
  remains the runtime connection; a missing DIRECT_URL retains the old fallback.
  Two focused config tests cover this routing. Added an opt-in live verifier:
  `scripts/verify-ai-usage-database.mjs`, read-only by default, with explicit
  flags for additive plan SQL and temporary workspace regression data/cleanup.
- `npm test`: 105 passed; `npm run typecheck`: passed. Focused lint on the new
  config/scripts passed without warnings; `git diff --check` passed.
- `npm run build`: passed with NODE_EXTRA_CA_CERTS using exported Windows
  trusted Root/CA certificates in ignored `.tmp/windows-trusted-cas.pem`. No TLS
  bypass, global trust change or font source change. Existing client-rendering
  warnings remain on account/login/reset-password.
- Installed headless Chrome passed `node scripts/verify-account-usage.mjs`
  against that local production build. Auth and Usage HTTP were mocked:
  all four plan percentages, chart ranges, 80%/100% warnings, zero history,
  503/error recovery and signed-out visibility. No runtime exceptions; light
  desktop screenshot visually inspected. Artifacts:
  `.tmp/account-usage-1792672172903/`. Local QA server stopped afterward.
- Supabase activation is still blocked in this workspace: both .env URLs fail
  parsing. Password encoding fixes their syntax in memory, but both Prisma
  connections remain unreachable; DNS reports no IPv4 and one IPv6 address
  for each direct host. Need the exact project's Session pooler URLs in local
  .env (5432 for schema operations), with URL-encoded password. No credentials
  were printed/changed, no SQL applied, no test/customer records written, and
  no deployment or paid provider call was performed. See `docs/AI-USAGE.md`.

## Real profile AI usage and differentiated plan limits

- Replaced demo Usage/Limits/Subscriptions with authenticated workspace data:
  actual consumed/remaining percentages, monthly UTC renewal, daily history
  at 7/15/30/90 days, 80%/100% warnings and refresh/focus polling. Pricing and
  subscription entitlements show Basic 200, Pro 800, Teams 2,000, Studio 4,000.
- Added transactional durable monthly/daily counters using existing Prisma
  RateLimitBucket storage. Chat and native scene proposals cost 1 application
  credit; submitted 3D jobs cost 20 including refinement. Manual edits cost 0.
  Auth/quota verification now precedes provider calls even without cloud chat
  history. Exhausted allowance returns 429; unavailable quota storage returns
  503. Failed chat/scene requests refund; submitted/ambiguous 3D stays charged.
- Added BASIC/STUDIO enum values and additive deployment SQL. Existing TRIAL/
  FREE subscriptions use Basic. Paid plan activation still requires a trusted
  verified subscription; automatic billing remains unconfigured. Tracking starts
  on deployment; no invented historic consumption. See `docs/AI-USAGE.md`.
- `npm test`: 103 passed. `npm run typecheck`: passed, including after Prisma
  regeneration. Focused ESLint passed with the existing account image warning;
  `git diff --check` passed. Tests use mocked auth/database/provider adapters.
- `npm run build`: Prisma generation passed; Next compilation failed fetching
  Roboto/Roboto Flex due to `UNABLE_TO_VERIFY_LEAF_SIGNATURE` / `unable to verify
  the first certificate`. Live SQL/database/provider behavior, browser UI and
  production deployment were not verified. No TLS bypass or production changes.

## Interior drafting interaction and precision

- Select now supports real pointer-captured drag of rooms, walls, furniture,
  openings and annotations. Preview stays local until release; Esc/pointer
  cancellation discards it. A 3px threshold prevents clicks from moving objects.
  Wall/dimension translation retains endpoint vectors and dimensions.
- Removed child event blockers so Wall/Room tools work over existing geometry.
  Wall stays active for repeated drawing. Degenerate rooms are rejected.
  Door/window placement projects to the wall, uses its thickness/rotation and
  clamps the complete opening within endpoints. Opening drag stays on valid
  nearby walls. These are independent drafting objects, not full CAD constraints;
  moving a wall does not automatically move previously placed openings.
- Door inspector now exposes Left/Right hinge and Inward/Outward swing; actual
  quarter-circle arc, leaf, hinge and jamb drawing follows all four combinations.
  Windows include pane/mullion detail and Single/Double control. Shared export
  segments preserve rotated opening symbols and include swing arcs in bounds.
- Added precise X/Y, opening rotation and editable wall length, grid/precision
  controls, 1mm arrow nudging (Shift uses the grid step), and bounded 100-step
  document undo/redo with Ctrl+Z/Ctrl+Shift+Z. Dimensions commit with Enter/blur;
  partial/negative input no longer jumps while typing. m/cm formatting preserves
  the configured millimeter precision. Corrected the starter window proportions
  and inward entry-door orientation. Inspector header cannot shrink as content grows.
- Ten focused geometry/export/history tests and TypeScript passed. Focused lint
  has no errors; existing legacy img/hook warnings remain. Chrome verified real
  mouse selection/drag, cancel, undo/redo, repeated walls over room geometry,
  door/window placement and movement, handedness/swing, 1mm nudging, incremental
  negative typing, unit-suffixed wall length and JSON output in both themes:
  `scripts/verify-floor-plan-editing.mjs` (also `--light`), artifacts
  `.tmp/floor-plan-editing-1792635355795/` and `1792635363541/`.
- An additional real mouse check confirmed that editing wall thickness and
  immediately dragging the same wall commits the input without overwriting it;
  `.tmp/floor-plan-editing-1792635595263/`.
- SVG/PDF/PNG actual downloads still pass (`verify-floor-plan-export.mjs`);
  Interior layout/save/reopen checks pass at 1440/390px in both themes
  (`verify-studio-spacing.mjs --interior-only`, artifacts
  `.tmp/studio-spacing-1792635443334/`). Initial checks found header shrink and
  a test expecting per-keystroke commits; header sizing and Enter-commit test
  were corrected, then rerun successfully. Zero runtime exceptions in passing QA.
- Production build was not repeated; the previously recorded local Google
  Fonts certificate blocker remains. No cloud/provider or full CAD claims.

## Interior floor-plan export framing

- SVG, PDF and raster exports now share a centered, uniform fit to the sheet
  with a 10mm minimum white margin. Portrait plans use portrait paper; small
  and large plans fill the available area independently of viewport pan/zoom.
  Wall thickness and centered opening extents are included in the fit.
- Output is labeled `Fit to page` instead of claiming the editor's fixed print
  scale. Model coordinates, dimensions and JSON project data are unchanged.
  PDF wall widths and opening origins now match the shared geometry framing.
- Four focused tests passed (including negative coordinates and empty plans),
  TypeScript passed and focused lint passed. Chrome downloaded real SVG/PDF/PNG;
  PNG geometry covered x=77..922, y=34..672 on a 1000x707 sample, with clear
  borders. Opened SVG was visually inspected. No runtime exceptions.
  Reproduce with `node scripts/verify-floor-plan-export.mjs`; artifacts:
  `.tmp/floor-plan-export-1792633729876/`.
- Production build was not repeated; the existing Google Fonts certificate
  blocker remains. PDF download/content coordinates were checked; no separate
  PDF renderer was used for visual verification.

## Toolbar texture library and static sidebar footer

- The shared toolbar plus button toggles a horizontal Texture material library
  12px below the toolbar, matching its width. Eight procedural PNG/PBR assets
  cover concrete, wood, marble, ceramic, fabric, brick, metal and glass; category
  filters, active material feedback and bounded PNG/JPEG/WebP upload work.
  Uploaded palette assets survive closing/reopening within the current workspace
  session; applied maps live in the existing scene document/recovery/export data.
- 3D material application commits once for the complete selection/group geometry,
  supports undo and validates locks, ancestors, stale IDs and embedded map rules.
  The original Interior SVG sketcher shows the browse library and explicitly
  links to Interior 3D for application; its Add room action remains available.
- Added shared Settings/Profile footer outside the scrolling sidebar content.
  3D Settings opens the existing lighting inspector; Profile recovers the scene
  before navigating to `/account`. Interior Settings opens its inspector; Profile
  opens `/account` in a new tab to preserve the current unsaved drafting state.
- Focused material tests and typecheck passed; focused lint has no errors or
  warnings in the new/shared components. Chrome verified all three 3D studios
  in both themes: open/filter/apply to multi-select, one-step undo, image upload,
  real embedded-map JSON export, palette reopen and unchanged footer position
  during hierarchy scrolling. Interior browse/settings/profile callback and
  mobile overflow checks passed. Zero runtime exceptions. Script:
  `scripts/verify-material-library.mjs`; screenshots:
  `.tmp/material-library-1792632451420/`.
- No external texture service or authentication changes. Production build was
  not repeated; the existing local Google Fonts certificate blocker remains.

## Multi-selection outlines and hierarchy identification

- Shared 3D studios now draw a real bounding outline for every selected object:
  first selected blue (#4284ff), additional selections green (#22c55e).
  Shift/Ctrl/Cmd-click toggles selection in the canvas or hierarchy, preserving
  order; removing the primary promotes the next selection to blue. Existing
  primary-object gizmo and selection-dependent actions are retained.
- Selection rows use matching colors/pressed states. Canvas hover identifies
  the matching hierarchy row and scrolls it into view; selection also reveals
  its row. Interior's original SVG sketcher gains hover/selection identification
  in its hierarchy while retaining its existing single-selection interaction.
- Non-pickable outline helpers update with geometry, respect hidden ancestors
  and are disposed when replaced. They stay outside the editable/exported root;
  scene schemas and materials are unchanged.
- Nine selection/geometry tests passed, including GLB roundtrip and OBJ/STL
  geometry checks. Typecheck passed; focused lint has no errors, with existing
  image/hook warnings in legacy CrystalStudio/Viewport files.
- Chrome passed real canvas picking/multi-click, primary promotion, deselection,
  hierarchy modifier selection, hover/scroll identification and measured blue/
  green WebGL pixels for Architecture, Infrastructure and Interior 3D in both
  themes. Interior SVG hover/picking identifies its actual room hierarchy.
  Zero runtime exceptions. Script: `scripts/verify-scene-selection.mjs`.
  Screenshots: `.tmp/scene-selection-1792631083951/`.
- Production build was not repeated for this focused renderer/interaction change;
  the existing local Google Fonts certificate blocker remains unresolved.

## Casynus AI voice commands

- Added shared studio microphone dictation, opt-in Hey Casynus wake listening,
  Ctrl + Q activation from minimized chat/input focus, and SQ/EN/DE selection.
  Recognized text remains editable; a separate Send/Dërgo utterance submits
  through existing AI/provider adapters. Existing 3D preview approval remains.
- `studio-voice.mjs` owns recognition sessions, wake filtering, start/permission
  status, explicit send/cancel, 30-second capture timeout and bounded restarts.
  `useStudioVoice` binds keyboard/visibility lifecycle and cancels on identity
  changes/unmount. Voice never starts automatically. Unsupported/browser-service
  failures are reported without fake transcription. See `VOICE-COMMANDS.md`.
- 13 focused voice/AI tests passed; typecheck passed; focused lint passed with
  one existing image warning. Chrome passed all four studio routes: Ctrl + Q,
  minimized wake, ambient filtering, transcript editing, exactly one voice
  submission, real 3D proposal preview, permission error and background stop.
  Also checked mobile Interior dictation/control bounds and unsupported browser.
  Zero runtime exceptions. Speech/session/provider APIs were mocked; physical
  microphone and live speech/provider services were not exercised. Artifacts:
  `.tmp/studio-voice-1792619909808/`. Reproduce with
  `node scripts/verify-studio-voice.mjs`.
- Production build not rerun: existing Google Fonts certificate and limited disk
  constraints persist. Next deployment check: physical microphone permission,
  wake accuracy and Albanian/English/German recognition on the target browser.

## Interior right inspector styling

- Interior's drafting inspector now matches the 3D studios' Properties header,
  collapse icon, panel palette, section spacing, typography and input styling.
  Removed the extra Copy link/header icon from this presentation. Dimensions
  use contained vertical rows instead of overflowing paired input pills.
- Existing plan controls, selection/edit/delete handlers and exports remain;
  classic editor presentation is unchanged. Styles are scoped to the restored
  Interior workspace and an explicit `scenePresentation` prop.
- Typecheck passed; focused lint has no errors and five existing CrystalStudio
  image warnings. Chrome passed `node scripts/verify-studio-spacing.mjs
  --interior-only` for 1440/390px dark/light: panel geometry, room creation,
  selection/deletion, contained room inputs, wall thickness change to 250mm,
  real inspector JSON export and reopen. Zero runtime exceptions. Screenshots:
  `.tmp/studio-spacing-1792618797433/`.
- Earlier full browser runs hit CDP timeouts/resource exhaustion (including
  PowerShell CoreCLR heap initialization failure); generated QA profiles were
  removed to recover space and focused Interior checks passed. Production build
  was not rerun; existing Google Fonts certificate/disk constraints remain.

## Horizontal Login and Signup reference layout

- Both routes use `AuthShell`: abstract CSS visual panel on the left and
  account form on the right, rounded dark frame with a yellow action accent.
  Width is capped at 1181px; height follows form content. At 640px and below,
  the visual and form stack without horizontal scrolling. Dark is the initial
  theme; existing persisted theme preference and toggle remain available.
- Kept OAuth providers, login/email-code/age handlers, registration, callback
  handling, reset-password and legal links. OAuth buttons retain accessible
  provider names while presenting compact icons. No server auth changes.
- Typecheck, focused lint (zero warnings/errors), and diff checks passed.
  `node scripts/verify-auth-layout.mjs` passed both routes at 1440/900/390px
  in both themes, checking the exact 1181px desktop cap, panel order, overflow,
  fields and three provider buttons. It also passed mocked login/registration
  API errors, login code/back flow, password validation and theme persistence.
  Zero runtime exceptions; screenshots: `.tmp/auth-reference-1792617742067/`.
  Paid/live OAuth, email delivery and authenticated age submission were not
  exercised. Production build was not rerun: existing Google Fonts certificate
  failures and low disk space remain local blockers.

## Studio overlay alignment and Interior sidebar

- Toolbar tops and compact/minimized AI dock bottoms now align with the
  existing 12px sidebar insets. Chat dimensions and engine logic are retained.
- Removed Architecture's unused previous-modeling-tools footer.
- `/interior` keeps its SVG architectural sketcher with a matching studio
  header, navigation and project row followed only by the actual plan hierarchy.
  Library/template/setup sections are omitted from this sidebar. Selection
  updates the existing plan inspector; JSON/SVG/PDF actions use real exports.
  Open accepts the exported plan's `objects` field as well as older snapshots.
- Typecheck passed; focused Next lint passed with five existing image warnings;
  `git diff --check` passed. Installed Chrome verified all three default routes
  at 1440px/390px in dark/light mode with no runtime exceptions. Desktop checks
  assert toolbar y=12 and compact/minimized chat bottom=888 at height 900;
  Interior checks cover room creation/deletion, hierarchy selection and JSON
  save/reopen. Script: `scripts/verify-studio-spacing.mjs`.
- Production build was not repeated for this presentation change: the existing
  Google Fonts certificate blocker remains, with less than 0.5GB disk free.
  Live provider/cloud verification remains a separate pending deployment task.

## Real 3D provider frontend/backend integration

- Added server-only Meshy v2 (preview + PBR refinement) and Tripo v3
  text-to-model adapters, following their official current API documentation.
  Configured providers appear in the existing 3D assistant through
  `/api/ai3d/providers`; no API keys reach the browser. Setup and exact
  deployment steps are in `docs/AI3D-SETUP.md` and `.env.example`.
- Authenticated job creation, status polling, listing/resume and a bounded
  asset proxy use existing `AIProviderJob` storage. Every query scopes workspace
  AND user; project ownership is checked. Requests persist before provider
  submission; unique request IDs prevent duplicates. Atomic Meshy refinement
  claims prevent concurrent polls from submitting a second texture task.
  Ambiguous provider submissions are not automatically retried.
- Frontend downloads and validates GLB, imports real editable meshes/materials,
  previews without committing, and applies in one undoable operation. Generation
  jobs can resume after interruption without another paid submission. CDN
  downloads have a 20 MB bound; same-origin proxy has a 4 MB bound for Vercel.
  Added only official provider asset domains to the existing CSP allowlist.
- Gemini/Groq structured scene mode now starts enabled in 3D workspaces and
  supports validated transforms, group material propagation, PBR properties,
  template placement and sunlight/render settings. You remains research chat.
  The original Interior 2D sketcher remains unchanged; 3D uses
  `/interior?workspace=3d`.
- `npm test`: 67 passed; typecheck passed; focused lint has zero errors and
  one existing image warning. Tests exercise provider request contracts,
  persistence/idempotency, refinement races, project scope, aborts, invalid
  assets and real GLB import/apply/undo. Provider HTTP/database adapters are
  mocked in these tests; no live paid Meshy/Tripo call is claimed.
- Installed Chrome passed Architecture, Infrastructure and Interior 3D:
  Meshy selection, job progress, real GLB preview, Apply, Undo, job resume with
  no new POST, Discard and Gemini structured proposals. HTTP providers/jobs
  were intercepted; genuine GLB parsing/Three.js rendering were exercised.
  Zero runtime exceptions. Artifacts: `.tmp/ai3d-browser-1792615278282/`.
  Reproducible script: `scripts/verify-ai3d-studios.mjs`.
- Real local HTTP probes returned capabilities 200 and unauthenticated job
  creation 401. Live signed-in database generation/save/reopen and actual
  Meshy/Tripo model access remain deployment checks after keys/credits exist.
- Google Fonts still fails local certificate validation
  (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`); dev uses fallback fonts. Disk capacity
  also limited browser/build work; only generated QA profiles/cache were
  cleaned. Production build was not rerun with these known environment blockers.

## Full-window design canvas behind inset panels

- Moved the shared real 3D viewport out of the center controls section into
  an absolute, edge-to-edge layer. Sidebars retain 12px insets/corners above
  the scene; toolbar/chat stay in the center workspace. Transparent controls
  pass pointer input through to the canvas, including the padding gaps.
  Drag/drop handling moved to the workbench root to retain asset/file drops.
- Removed the Infrastructure sidebar's `Open detailed site editor` footer
  link as requested. Its existing classic route/source remain preserved.
- Chrome spacing checks passed Architecture, Interior and Infrastructure at
  1440/390px in both themes: full-window 3D canvas bounds, canvas hit-testing
  in padding, panel hit-testing above it, 12px panel geometry, and no runtime
  errors/overflow. Original Interior SVG drafting remains unchanged.
  Screenshots: `.tmp/studio-spacing-1792612260879/`.
- Typecheck and focused ESLint passed. The local production-build certificate
  blocker documented below remains; no production-build success is claimed.

## Shared Infrastructure-style viewport toolbar

- Reused the original Infrastructure toolbar's order, icons and styling in
  `StudioViewportToolbar`, shared by Architecture, Infrastructure and the
  original Interior drafting viewport. Creation/modeling actions vary by
  studio; Interior keeps wall/door/window/room/dimension/annotation/furniture
  tools, selection and deletion. No drafting engine was replaced.
- Added working camera view/zoom/reset/fit controls, a format-selection Export
  dialog, actual scene-data CSV downloads and studio-specific settings actions.
  Existing 3D undo/redo, duplicate, delete, snapping and focus remain available
  in the sidebar action menus and keyboard shortcuts. Export formats and
  scene storage are retained.
- Corrected a legacy CSS background specificity conflict so the center
  controls layer is truly transparent above the full-window canvas. Browser
  screenshots were inspected: real geometry is visible centrally and through
  padding, and the Infrastructure extra footer link is absent.
- `npm test`: 55 passed; TypeScript passed; focused lint has no errors and four
  pre-existing hook/image warnings in Viewport. Chrome theme/mobile/layout and
  Interior add/delete tests passed at 1440/390px in both themes. Artifacts:
  `.tmp/studio-spacing-1792612726710/`.
- The repeated export/navigation run hit local `ENOSPC` in Next/Chrome writes.
  Removed only generated QA profiles and webpack cache; production build is
  still subject to the existing trusted-certificate blocker. Retry results
  are recorded after the final run, not inferred from the earlier run.
- After freeing disk, the full 3D workflow passed: transforms, undo/redo,
  all seven exports plus toolbar CSV, refresh recovery, three studio switches
  preserving document data and template creation; zero runtime exceptions.
  Artifacts: `.tmp/scene-workflow-1792612990521/`.
- Final layout/dialog sweep also passed all 12 route/theme/width combinations:
  native Export dialog opens/closes, toolbars stay between desktop panels at
  46px height, correct per-studio tools, full-window canvas and transparent
  controls layer. No runtime exceptions. Final screenshots:
  `.tmp/studio-spacing-1792613117435/`.

## Studio spacing correction and original Interior drafting restoration

- Audited `8d22f00` against pre-3D UI commit `a531c16`; created local checkpoint
  branch `checkpoint/studio-ui-before-restore-8d22f00` and an ignored worktree
  patch before editing. Unrelated deleted images and untracked scripts remain
  untouched. The user's follow-up narrowed the UI request to padding and
  removal of the new top strip, plus the original Interior plan sketcher.
- Removed the full-width workbench menubar. Its real File/Edit/View/Tools/
  Camera/Render/Export/Save handlers remain in the project-row actions menu.
  Sidebars and viewport start at the top with 12px insets/gaps and 12px corners;
  panel restore controls remain available when collapsed. Changes are scoped
  to the scene workbench and the Interior drafting root.
- `/interior` again mounts the original `CrystalStudio` floor-plan editor:
  original SVG drafting, sidebars, toolbar and AI chat, with scoped 12px panel
  geometry. `/interior?workspace=3d` retains the full new 3D editor; its stored
  scenes are not migrated or deleted. The drafting 3D Studio control opens
  the real `/casynus` engine instead of the previous simulated viewport.
- Chrome's 3D workflow passed transformations, undo/redo, all seven exports,
  IndexedDB recovery, templates and document-preserving 3D route switching,
  with zero runtime exceptions. `npm test`: 55 passed; typecheck passed;
  focused lint has no errors and five existing image warnings in CrystalStudio.
- `scripts/verify-studio-spacing.mjs` passed all three routes at 1440/390px
  in both actual themes: no top strip or horizontal overflow, desktop panel
  bounds/corners exactly 12px, mobile 3D sidebar reopening at 12px, and original
  Interior room creation/deletion. No runtime exceptions. Screenshots are in
  ignored `.tmp/studio-spacing-1792611885922/`; 3D workflow artifacts are in
  `.tmp/scene-workflow-1792611695125/`.
- Production build retains the known local Google Fonts certificate blocker;
  this session's dev compilation again reported `UNABLE_TO_VERIFY_LEAF_SIGNATURE`
  and used fallback fonts. A production build is not claimed here.

## Shared real 3D modeling workflow

- Added the default R3F/Three.js workbench to Architecture, Interior and
  Infrastructure, preserving previous editors under `?workspace=classic`.
  Real meshes, transform gizmos, material/light inspectors, editable studio
  templates, hierarchy, undo/redo, import/export and IndexedDB recovery work
  through one validated scene document. See `docs/SCENE-STUDIOS.md` for scope.
- Added authenticated workspace/user-scoped cloud snapshots with atomic
  revisions and conflict handling; API tests use mocked Prisma/auth. Live
  signed-in cloud save/reopen/logout/login remains unverified.
- Gemini/Groq native tool proposals are independently validated on server and
  browser, previewed before Apply, and committed as one undoable action. Native
  request/response tests use mocked HTTP; You remains research text chat.
- Final `npm test`: 55 passed, including group/ungroup world-transform and
  ancestor-lock checks. TypeScript and focused ESLint passed. Real Chrome
  verified object transformations, undo/redo, all seven downloaded formats,
  refresh recovery, same-document studio switching, three generated templates,
  correct viewport/inspector bounds and no mobile horizontal overflow; zero
  JavaScript exceptions. `scripts/verify-scene-studios.mjs` reproduces this.
- Advanced mesh editing, semantic CAD constraints, terrain/curved road editing,
  path tracing/AO and full production acceptance remain unfinished; unavailable
  menu tools are explicitly marked. This is the first working end-to-end 3D
  increment, not completion of the entire master specification.
- Build attempts encountered Google Fonts certificate verification in a
  duplicate legacy font configuration (removed in favor of the root font),
  then disk ENOSPC. Removed only generated QA Chrome profiles, freeing 300 MB.
  `npm run build` then hit Prisma DLL `EPERM` during generation; an existing
  process holds the client DLL. The first separate `npx next build` exhausted
  Windows memory (`memory allocation of 49152 bytes failed`, exit 3221226505).
  After removing only `.next/cache/webpack` (about 900 MB), geometry tests
  passed. The final `npx next build` failed downloading root Roboto/Roboto Flex
  with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Production build is NOT verified;
  restore a trusted Node certificate chain and rerun on a host with free disk
  and an unlocked Prisma DLL. TLS verification was not disabled.

## Gemini, Groq and You chat connections

- Production probes on the canonical `https://www.alternusart.com` origin
  returned real `OK` answers from Gemini and Groq. A direct You Answer call
  using the local configured key returned HTTP 200 with an answer. You's
  unauthenticated production chat request correctly returned 401. The
  original apex-domain probe followed a www redirect with the wrong Origin
  and received CSRF 403; the canonical-origin probes passed without changing
  CSRF protections. No key values were logged or committed.
- Found that studio docks used local parsers/demo replies rather than the
  configured chat providers. Connected modeling, floor-plan and infrastructure
  docks to `/api/ai-chat`, with Gemini/Groq/You selections and Gemini initially
  selected. Mobile home now offers those same providers and sends its actual
  selection to the dock. Local layout/scene/site modes remain explicitly local.
  Text replies do not generate meshes, CAD files, images, or scene edits.
- Studio requests carry bounded history, display provider replies and errors,
  preserve prompts on failure, and cancel stale requests on account changes
  and unmount. You remains authenticated, but no longer requires a cloud
  conversation ID when used from a tab-local studio conversation.
- Decoupled provider success from workspace persistence: lookup/write errors
  now return the answer with `saved: false` and a visible storage warning.
  Foreign conversation IDs still return 404, with no provider call or write.
  Added `YDC_API_KEY` support, configured/default You detection, a 60-second
  route duration, 20-second Gemini/Groq request deadlines, and You diagnostics.
  Removed assistant text previews from server logs.
- `npm test` passed (40 tests), including the actual route with mocked
  auth/storage/HTTP adapters, provider request serialization, key aliasing,
  storage failures, ownership conflicts, and authenticated/stateless You.
  Focused ESLint passed with 15 existing image/hook warnings; typecheck and
  production build passed (87 static pages, existing auth/Browserslist warnings).
- Chrome verified all three provider selections and displayed replies across
  `/casynus`, `/interior` and `/infrastructure`, provider error/prompt recovery,
  mobile home Groq routing, and pending reply isolation after account changes.
  This browser run mocked provider HTTP responses and client sessions; the
  separate live probes above verified provider credentials. Artifacts remain
  ignored under `.tmp/provider-browser/`. Updated the existing studio smoke
  script to select the explicit local floor-plan mode for its layout test.
- Authenticated deployed You/database reload remains unverified. Vercel CLI
  `whoami` failed certificate validation (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`)
  while fetching OpenID configuration. No Vercel environment values were
  downloaded or changed; TLS verification stayed enabled.

## Studio sidebar header refinement

- Rebuilt the shared modeling/floor-plan sidebar header to match the supplied
  reference: 72px header, regular centered 14px title, 36px controls with
  20px icons, a rounded theme button, and no divider under the header.
  The default modeling title is now `Generative 3D`; selected asset names
  still replace it. Long titles retain ellipsis and their full title tooltip.
- Removed legacy reference classes from `StudioHeader` and explicitly scoped
  its geometry/typography in `kit.css` to override old sidebar rules.
- `npm test` passed (22 tests), focused ESLint on all three changed TSX files,
  `npm run typecheck`, `git diff --check`, and `npm run build` passed
  (87 static pages). Existing Browserslist/auth client-rendering warnings and
  unrelated full-project lint errors remain as previously documented.
- Chrome inspected `/casynus` and `/interior` at 1440/768px in both themes:
  14px regular title, 72px header, contained 36px controls, no horizontal
  overflow. The existing responsive layout hides these sidebars at 390px;
  the initial mobile assertion expected a visible header and was corrected
  to check that existing behavior. Screenshots: `.tmp/header-browser/`.
- Header theme toggling, collapse, and back-to-project navigation passed;
  the browser run reported no runtime exceptions.

## Homepage wave-card revision

- Moved the three capability headings above their images onto the card
  backgrounds, retained the original copy, and set descriptions to 24px.
  Added the supplied `wave0.jpg`, `wave1.webp`, and `wave2.jpg` in order.
  The desktop row now spans 1180px, aligned with the feature/CTA frame below.
- Explicit image-panel widths prevent aspect-ratio/min-height sizing from
  extending images outside mobile cards. Description and heading sizes
  override the existing global mobile 12px rule within these cards only.
- Initial typecheck raced Next dev's regeneration of `.next/types` and
  reported TS6053 missing generated route files; final checks follow below.
- Final `npm test` passed (22 tests), `npm run typecheck`, focused ESLint,
  `git diff --check`, and `npm run build` passed (87 static pages). Existing
  Browserslist/auth-route warnings remain; the full-project lint errors
  documented above are outside this change.
- Installed Chrome verified the final production build at 1440/768/390px
  in both themes: loaded wave images, headings above images, computed 24px
  descriptions, three visible cards, content contained by the card frames,
  no horizontal page overflow, and no runtime exceptions. Visually inspected
  desktop alignment and the corrected mobile screenshot. Artifacts remain
  ignored under `.tmp/wave-browser/`.

## Homepage capability frames

- Removed the five category chips below the homepage hero. Rebuilt Core focus,
  Design areas, and Design coverage as rounded frames with inset architecture,
  interior, and infrastructure images, overlay headings, and the original
  values and descriptions. All three cards now remain visible on mobile.
- Styles are scoped in `src/app/home-highlights.css`; light frames are pale
  gray and dark frames charcoal. Existing local images are reused.
- `npm test` passed (22 tests), `npm run typecheck`, focused ESLint on
  `src/app/page.tsx`, and `git diff --check` passed. Full `npm run lint`
  fails on existing unrelated unused-symbol/prefer-const errors.
- Installed Chrome checked 1440, 768, and 390 CSS pixels in both themes:
  three visible cards, loaded images, text inside frames, removed chips,
  no horizontal overflow, and no runtime exceptions. Screenshots are under
  ignored `.tmp/home-browser/`. Dev uses fallback fonts because Google Fonts
  downloads report `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
- After the final frame-color adjustment, visually inspected the desktop
  light screenshot; a repeat browser sweep stopped on its second navigation
  with `CDP timeout: Page.navigate`. The first full sweep passed; repeat the
  sweep against a fresh local server if further browser changes are made.
- `npm run build` passed (87 static pages). The first attempt failed with
  Prisma `EPERM` renaming `query_engine-windows.dll.node`; stopping the
  temporary port-3003 server released the lock and the retry passed. Existing
  auth/account client-rendering and Browserslist warnings remain.

## Soft login redesign

- Rebuilt `/login` around a light two-panel layout: centered sign-in form on a
  quiet neutral surface and a blue gradient studio overview with a code-native
  agent tile and capability cards. At 900px and below the overview yields to
  the full-width form. The saved dark preference and toggle still work.
- Preserved Google, GitHub, Discord, password plus email-code verification,
  age collection, reset-password and signup links. OAuth now carries the safe
  relative `callbackUrl`; request and sign-in network failures show inline
  errors. The global sign-in popup stays hidden on auth routes.
- Installed Chrome browser QA at 1440, 900, and 390 CSS pixels found no
  horizontal overflow or runtime exceptions. Mocked the login-code endpoint
  to verify API errors, code-step entry, the six-digit gate, back navigation,
  and theme persistence. No real account, email delivery, or OAuth round trip
  was attempted.
- `npm test` passed (22 tests), `npm run typecheck` passed, focused ESLint on
  both changed TSX files passed, `git diff --check` passed, and `npm run build`
  passed (87 static pages). The build retains the existing `useSearchParams()`
  client-rendering warnings for auth/account routes. Full-project `npm run
  lint` still fails on pre-existing errors in unrelated files.

## Resumed studio UI kit and browser-session conversation increment

- Recovered the interrupted work from the dirty tree after `fae23f2`, the
  handoff docs, and the three `.studio-*.cjs` migration scripts. The prior
  conversation was not available in this session. Already implemented:
  shared theme, You Answer integration, infrastructure local autosave, and
  existing studio routes. Partly implemented at resume: extracted theme
  styles, shared UI primitives, viewport palette, and session-backed AI dock.
- Finished that existing increment without rerunning the migration scripts.
  `tokens.css`, `studio.css`, and `kit.css` now provide the shared palette,
  layout, and controls. Fixed font-token scope, mobile creation-home themes,
  interior SVG canvas contrast, gizmo axis colors, active-button contrast,
  expanded-chat sizing, and overlapping mobile toolbars/panel toggles.
- Fixed a browser-discovered root hydration failure by keeping the global
  style and scripts inside `<head>`. Restored accessible new/clear conversation
  actions and the supplied dock status label.
- `StudioConversationProvider` retains messages and dock state across studio
  navigation and reload within a browser tab. Identity changes reset visible
  chat before rendering another account and reject updates from stale account
  callbacks without remounting the editor. Snapshots retain at most 200 recent
  messages within the reader's 1,000,000-character limit. This is browser
  session recovery, not authenticated workspace/cloud persistence.
- Verified `npm test` (22 passed), `npm run typecheck`, focused ESLint across
  changed implementation/tests (0 errors; 15 existing image/hook warnings),
  and PostCSS parsing of all four affected stylesheets. Full `npm run lint`
  still fails on existing unused-symbol/prefer-const errors in unrelated
  routes, legacy editor components, email, and PayPal modules.
- Headless installed Chrome verified `/casynus`, `/interior`, `/infrastructure`,
  and `/aichat` at 1440 and 390 CSS pixels in both themes with no horizontal
  page overflow or runtime exceptions. Verified mobile editor entry, mobile
  infrastructure Library/Inspector access, inspector collapse, toolbar arrow
  navigation, a local floor-plan prompt, chat expand/minimize/reopen, new chat,
  reload/theme recovery, and cross-studio navigation. Mock-session account
  switching/signout isolated chat without replacing the mounted editor. No
  real account or database round trip was used. Infrastructure WebGL rendered;
  exhaustive camera/transform/lighting/export checks remain separate.
- Repeat browser checks with `node scripts/verify-studios.mjs` against a local
  Next server on port 3002 (Node 22, installed Chrome; `CHROME_PATH` and
  `STUDIO_QA_URL` can override defaults). Screenshots/results are under ignored
  `.tmp/studio-browser/`. The CUA tool could not start due to
  `helper_sandbox_lock_failed` / `SetNamedSecurityInfoW ... failed: 5`.
  Installing isolated Playwright failed with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`;
  the saved harness instead uses installed Chrome through DevTools. Local dev
  font downloads hit the same certificate error and used Next's font fallback.
- Final `npm run build` passed: Prisma generated and all 87 static pages
  completed. The first final attempt stopped at Prisma with `EPERM` renaming
  `query_engine-windows.dll.node`; stopping the temporary QA server released
  the lock and the retry passed. Existing Browserslist and client-rendering
  warnings for `/login`, `/reset-password`, and `/account` remain. Builds skip
  lint by existing configuration; the separate lint results above still apply.
  Final `git diff --check` and browser-script syntax validation also passed.
- Existing deleted infrastructure images, migration scripts, and crash reports
  were preserved. Cloud studio chat/scene storage, configured image generation,
  and live You/database/deployment verification remain pending.

## Shared Crystal studio theme and AI dock increment

- Added one persisted light/dark setting for `/casynus`, `/interior`,
  `/infrastructure`, and `/aichat`, with a shared Sun/Moon toggle. Existing
  `/aichat` theme preferences are read when the new key is absent. An early
  layout script applies the saved theme before hydration.
- Centralized studio palette tokens and added dark surfaces for the shared
  sidebars, toolbar, inspector, menus, and AI dock. Architecture and
  Infrastructure viewport backgrounds, grids, and ground now adapt to the
  selected theme without replacing scene objects or remounting the canvas.
- Added a minimize control to the existing shared `StudioAIChat`. Its messages
  remain in parent state when the dock closes and reopens.
- Verified: `npm test` (17 passed), `npm run typecheck`, focused ESLint (0
  errors; 15 existing image/hook warnings), `npm run build`, and
  `git diff --check` passed. Browser verification is still open: the browser
  automation process exited unexpectedly on two attempts to open the local
  studio. The existing local server on port 3001 did not respond; a temporary
  server on port 3002 started successfully and was then stopped.
- This increment does not add authenticated studio chat persistence, new CAD
  engines, or image generation. The You.com documentation currently lists
  Search, Answer, Contents, Research, and Finance Research APIs, with no
  documented image-generation endpoint; the existing You Answer integration
  remains the supported capability.

## `/aichat` You.com Answer integration

- Added You to the existing model selector and routed its requests through the
  server-only You Answer API (`POST https://api.you.com/v1/answer`, `X-API-Key`).
  Responses retain native cited answer text and clickable source URLs. The API
  accepts a single query up to 400 characters, so recent conversation context
  is folded into a bounded follow-up query; this is not a multi-turn You API.
- Signed-in `/aichat` sessions now load from and save to the existing
  `AssistantConversation` and `AssistantMessage` tables, scoped by workspace
  and user. Existing browser-local sessions are imported on load. Gemini and
  Groq keep their previous provider behavior and also save responses in these
  tables when sent from the chat page.
- Added explicit missing-key, authentication, billing, rate-limit, invalid
  response, and timeout errors without exposing `YOU_API_KEY` to the browser.
- `npm test` passed (17 tests), `npm run typecheck` passed, focused ESLint passed
  with five existing image warnings, and `npm run build` completed. Live You
  request, database round trip, browser/mobile interaction, and Vercel
  deployment verification remain pending because no nonempty `YOU_API_KEY` or
  database test session was available in this checkout. Browser automation
  crashed twice while opening the local page, so visual interaction was not
  verified.

## Soft Dark AI Platform Website (`/studio-ai`) & Complete Soft Dark UI Kit (`/ui-kit`)

- Designed and implemented the **Soft Dark Generative AI Platform Website**
  (`src/app/studio-ai/page.tsx`, `src/app/studio-ai/showcase.tsx`) and a
  complete interactive **Soft Dark UI Kit** (`src/app/ui-kit/page.tsx`), backed
  by a scoped `.sui` Soft Dark design system (`src/components/soft-ui/soft-ui.css`,
  `src/components/soft-ui/primitives.tsx`, `src/components/soft-ui/showcase-art.tsx`,
  `src/components/soft-ui/site-chrome.tsx`):
  - **Soft Dark Aesthetic & Tokens:** Near-black and deep charcoal canvas
    hierarchy (`#0F0F0F`, `#161616`, `#1A1A1A`), generous `16px–32px` rounded
    geometry, hairline soft borders, gentle glassmorphism (`backdrop-filter: blur(22px)`),
    and calm studio accents (Soft Periwinkle `#A5B1FF`, Architectural Sage
    `#A9CDBD`, Warm Sand `#E2C9A6`, semantic Success `#6ED3A5`, Warning `#EEBD6B`,
    and Error `#F28C96`).
  - **Platform Landing Page (`/studio-ai`):** Hero section with 3-column
    Interactive Studio Preview Frame (left scene hierarchy, center 3D
    architectural wireframe + floor plan + infrastructure preview with floating
    AI prompt bar, and right parameter inspector), dedicated feature sections for
    **3D Architecture Studio**, **Interior & Floor Planning**, and
    **Infrastructure & Site Planning** with custom SVG concept illustrations,
    6 soft floating tool cards, filterable generated-project showcase (`All`,
    `Architecture`, `Interior`, `Infrastructure`), 3-step studio workflow, and
    footer.
  - **Interactive Soft Dark UI Kit (`/ui-kit`):** Live interactive showcase of
    all 7 component families:
    1. **Buttons** (`Primary`, `Secondary`, `Tertiary`, `Ghost`, `Destructive`,
       `sm`/`md`/`lg` sizes, loading spinner, disabled, and icon-only states)
    2. **Icons** (`1.6px` rounded line stroke, `sm`/`md`/`lg`/`xl` sizes, and
       `default`/`hover`/`active`/`disabled` tile states)
    3. **Cards & Frames** (`elevated`, `glass`, `interactive`, `subtle`, floating
       panels, and soft gradient dividers)
    4. **Form Elements** (text inputs with prefixes/suffixes, textareas, selects,
       checkboxes, radio groups, animated switches, and gentle focus/valid/error
       states)
    5. **Navigation** (glassmorphic top header, pill tabs, vertical studio
       sidebar nav, and pill breadcrumbs)
    6. **Feedback Components** (status alerts, floating toasts, hover tooltips,
       linear/circular progress indicators, loading spinners/dots, and a live
       interactive modal dialog)
    7. **Typography & Color System** (Display XL through Caption/Mono type scale
       plus interactive copy-to-clipboard color token swatches).
- Focused ESLint (`npx eslint src/components/soft-ui src/app/studio-ai src/app/ui-kit`),
  full-project typecheck (`NODE_OPTIONS="--max-old-space-size=4096" npm run typecheck`),
  and `npm test` passed. Browser rendering was not verified.

## Casynus Cyber-Shield Website Security System

- Built and integrated the multi-layered **Casynus Cyber-Shield** security engine
  (`src/lib/security/cyber-shield.mjs`, `src/lib/security/cyber-shield.d.ts`)
  across Edge Middleware (`src/middleware.ts`), platform API helpers
  (`src/lib/platform/api.ts`), AI Chat (`src/app/api/ai-chat/route.ts`), Admin
  Auth (`src/app/api/admin/auth/login/route.ts`), and Next.js config
  (`next.config.mjs`):
  - **Multi-Pass WAF Threat Inspector (`inspectRequestThreat`, `decodeInspectableText`):**
    Performs multi-pass URL decoding to defeat double/triple encoding evasion and
    blocks SQL Injection (`UNION SELECT`, `INFORMATION_SCHEMA`, blind `SLEEP` /
    `WAITFOR DELAY`), Cross-Site Scripting (`<script>`, `javascript:`, event
    handlers), Command Injection / RCE, SSRF (`169.254.169.254`,
    `metadata.google.internal`, `gopher://`, `file://`), XXE, Path Traversal,
    Null-Byte Injection, sensitive path probes (`/.env`, `/.git`, `/wp-admin`,
    `/phpmyadmin`, `/actuator`), and automated vulnerability scanners (`sqlmap`,
    `nuclei`, `nikto`, `nmap`, `masscan`, `gobuster`, `acunetix`, `nessus`).
  - **CSRF Same-Origin Mutation Guard (`verifySameOriginMutation`):** Protects
    state-changing API requests (`POST`, `PUT`, `PATCH`, `DELETE`) by verifying
    `Origin`, `Referer`, and `Sec-Fetch-Site` against the target `Host` while
    preserving webhook exemptions (`/api/stripe/webhook`, `/api/paypal/webhook`,
    `/api/auth/`).
  - **Cryptographic Edge Admin Session Verification (`verifyAdminSessionEdge`):**
    Replaced the format-only Edge middleware cookie check with Web Crypto API
    (`crypto.subtle`) constant-time HMAC-SHA256 verification for both `/admin/*`
    routes and `/api/admin/*` endpoints.
  - **Adaptive IP Reputation & Tiered Rate Limiting (`CyberDefenseTracker`):**
    Tracks security strikes per IP with automatic temporary ban escalation for
    repeat offenders, exponential backoff lockouts on failed admin logins, and
    tiered per-minute rate limits (`auth`, `ai`, `payment`, `support`, `api`).
  - **Recursive JSON Payload Sanitizer (`sanitizeAndInspectPayload`):** Enforces
    payload size/depth/key bounds and blocks `__proto__` / `constructor.prototype`
    pollution, NoSQL operator injection (`$ne`, `$where`, `$regex`), and null
    bytes in `readJsonBody`, `/api/ai-chat`, and `/api/admin/auth/login`.
  - **Security Posture Endpoint (`/api/security/status`):** Reports active
    defense layers and (when authenticated as admin) live WAF/rate-limit
    telemetry.
- Added 6 focused automated tests in `tests/cyber-shield.test.mjs`; `npm test`
  passed (14/14 tests), `npx eslint` passed (0 errors), and
  `NODE_OPTIONS="--max-old-space-size=4096" npm run typecheck` passed.

## Casynus Studio Ecosystem UI/UX redesign

- Added the dedicated `/interior` route (`src/app/interior/page.tsx`) for the 2D
  Floor Plan & Interior Studio while preserving `/casynus?mode=floor-plan`
  compatibility and updating `StudioModeNav` (`src/components/crystal-studio/ui.tsx`)
  and `UnifiedSidebar` (`src/components/unified-sidebar.tsx`) to link to
  `/interior`.
- Fundamentally transformed the visual design of `/casynus` (Architecture 3D
  Studio), `/interior` & `/casynus?mode=floor-plan` (Interior 2D Floor Plan
  Studio), and `/infrastructure` & `/infrastructur` (Infrastructure Studio)
  into a soft, clean, modern architectural daylight workspace (`src/app/globals.css`,
  `src/components/crystal-studio/Viewport.tsx`, `src/components/crystal-studio/RightPanel.tsx`,
  `src/components/crystal-studio/ui.tsx`, `src/app/infrastructure/page.tsx`,
  `src/app/infrastructure/infrastructure-scene.tsx`):
  - Replaced legacy `#0F0F0F !important` / `#111316 !important` dark-box
    overrides with a warm alabaster/stone workspace backdrop (`#EEECE6`) and
    floating frosted-porcelain sidebars (`rgba(255, 255, 255, 0.90)`, `22px`
    radius, `backdrop-filter: blur(24px)`, soft ambient elevation shadows, and
    crisp slate `#0F172A` typography).
  - Updated the 3D Architecture viewport (`CanvasScene` in `Viewport.tsx`) to a
    soft architectural studio daylight gradient (`#F6F5F1` → `#EFECE6` →
    `#E5E2DA`), translucent porcelain ground plane with slate grid lines, and
    ground contact shadow; updated the 3D Infrastructure Three.js scene
    (`infrastructure-scene.tsx`) so `"Day"` (`#eeece6`) and `"Studio"`
    (`#f5f4f0`) lighting presets render a clean architectural masterplan site
    model (`#e3e5dd`).
  - Styled the top-center floating pill toolbar (`.ref-top-toolbar`), bottom
    3D orientation gizmo + `Orthographic` / `Perspective` switcher
    (`.ref-viewport-gizmo-dock`), right inspector (`InspectorCollaboratorBar`,
    `BinaryToggle` `Yes`/`No` and `Show`/`Hide` pills), and bottom
    `StudioAIChat` composer (frosted porcelain card with subtle rainbow
    architectural border and Cobalt Blue `#2563EB` accents) to match the unified
    soft architectural aesthetic.
- Focused ESLint on all modified studio files passed (0 errors), full-project
  typecheck (`NODE_OPTIONS="--max-old-space-size=4096" npm run typecheck`)
  passed, and `npm test` passed (8 tests). Browser rendering was not verified.

## Homepage mobile category placement

- Centered the homepage category chips on mobile and allowed them to wrap into
  rows, keeping Architecture and Interior Design visually centered between the
  hero and the following section. Desktop category layout is unchanged.
- Browser rendering has not been verified.

## Mobile text sizing

- Standardized mobile interface text, including labels, buttons, menus, and
  content, at 12px; larger display typography remains intact and SVG icons are
  excluded.
- The rule is limited to viewports at or below 700px; desktop styles are
  unchanged.
- PostCSS parsing and a focused assertion of the 12px mobile text standard
  passed; `npm test` passed (8 tests). Browser rendering was not verified.

## Homepage mobile CTA

- On mobile only, reordered the homepage CTA buttons to show Download App
  before Launch Studio and enlarged them to rounded pill controls, matching the
  provided reference while keeping the label text at the 12px mobile standard.
- Kept the homepage's Platform, Design, Company, and Legal footer visible and
  scrollable on mobile; retained its responsive column layout and set the
  footer content to a precise 24px left/right inset.
- Changed the homepage design-category chips to a single horizontal,
  touch-scrollable row with stable chip widths and the existing mobile side
  gutter.
- PostCSS parsing and a focused assertion of the mobile CTA order, button
  dimensions, shape, and label size passed; `npm test` passed (8 tests), and
  `git diff --check` passed. Browser rendering was not verified.

## Homepage mobile navigation

- Reworked the mobile header into a left menu-grid control, centered Casynus
  wordmark, and right profile icon; desktop navigation remains unchanged.
- Removed the rounded panel frame behind the mobile wordmark and controls in
  both light and dark themes while preserving the individual navigation
  actions.
- Precisely centered the mobile Casynus wordmark and standardized the Menu and
  Profile controls to matching 48×48px frames with identical borders and
  corners.
- PostCSS parsing and responsive layout assertions passed; `npm run typecheck`,
  `npm test` (8 tests), and `git diff --check` passed. Focused ESLint passed
  with one existing `<img>` warning after disabling the known unused
  `scrolled` parameter error. Browser rendering was not verified.
- Follow-up CSS measurement assertion and `npm test` passed for the centered
  wordmark and matching Menu/Profile frames. A repeated `npm run typecheck`
  and focused ESLint invocation terminated because Node ran out of memory;
  neither check completed for this follow-up.

## Mobile studio creation screen

- Replaced the mobile studio activity list with a focused creation home,
  segmented studio modes, central welcome mark, Pro banner, prompt composer,
  and bottom shortcut navigation inspired by the supplied reference.
- Refined the mobile components to the reference dimensions: 362×197px
  composer, 49px Pro banner, 40px attachment/model/action controls, 292×58px
  primary bottom navigation, and 58px search control. The top tabs now match
  Interior, Modeling, and Images, with Nano Banana as the default model.
- Set the mobile screen's horizontal inset to 24px; the segmented header
  center column contracts on narrower phones to preserve both side controls.
- Refined the mobile bottom navigation to match the supplied reference: a
  separated five-action capsule, a distinct active Home circle, subdued
  inactive icons, and a standalone circular Search control.
- Replaced the mobile prompt submit button's voice-wave icon with an
  enter-style right arrow to match the supplied reference.
- Standardized the mobile bottom row to the 24px screen inset, kept the Search
  control in a distinct 58px circular frame, and made the five capsule actions
  shrink evenly on narrow screens without overflowing.
- Aligned the complete mobile studio layout to the supplied measurement scale:
  44px top safe spacing, 40px header controls, 8/12/16/24px spacing increments,
  a 208px composer, 48px bottom navigation controls, and 24px bottom safe
  spacing; the 12px mobile text standard and desktop layout are preserved.
- The `/project` entry now opens this creation home on mobile while retaining
  the project dashboard on desktop. Menu, profile, pricing, workspace
  switching, new-scene, prompt, attachment, and generation actions remain
  connected to existing controls.
- `npm run typecheck`, `npm test` (8 tests), PostCSS parsing, responsive-rule
  assertions, and `git diff --check` passed. Focused ESLint reports existing
  unused-state errors; with that rule disabled it reports five existing
  `<img>` warnings. Browser rendering was not verified.

## Main navigation profile hover

- The signed-in profile dropdown opens and closes when its trigger is clicked;
  hovering over the trigger does not open it. Menu items have rounded corners
  and a light gray hover highlight, including the Log out button.
- `npm run typecheck`, `npm test` (8 tests), and `git diff --check`: passed.
- ESLint reports one existing unused `scrolled` parameter error and an existing
  `<img>` warning in this component; rerunning with only the unused-variable
  rule disabled reported no errors. Browser interaction was not verified.

## Homepage feature headings

- Removed the legacy “Planarch 3” and “Infra” prefixes from the homepage
  feature headings and replaced them with descriptive titles.
- Updated the matching titles across English, German, French, Italian, Chinese,
  Japanese, and Arabic translations.
- `npm run typecheck`, `npm test` (8 tests), `npx eslint src/app/page.tsx`, and
  `git diff --check`: passed. Browser rendering was not verified.

## Casynus product rebrand

- Replaced the former product name across user-facing page copy,
  descriptions, navigation labels, email templates, generated billing pages,
  and SEO/social browser metadata with Casynus.
- Added `/casynus` as the primary modeling route, updated internal links, and
  kept `/crystal` as a query-preserving redirect for existing links.
- Retained lowercase implementation identifiers and browser storage keys to
  preserve CSS bindings, component imports, and saved user data.
- `npm run typecheck`: passed; `npm test`: passed (8 tests); focused lint for the
  new/legacy routes and app metadata passed. Linting all changed TypeScript files
  reported 38 existing lint errors and 26 warnings, mainly unused symbols plus
  image/hook warnings; those unrelated findings were not changed for this
  rebrand.

## Casynus modeling UI kit

- Refined the `/casynus` modeling workspace into a componentized dark UI kit
  with a scene/assets sidebar, live model properties, viewport toolbar, and
  output controls.
- Connected topology, texture, and advanced toggles to workspace state; added
  searchable asset selection, hierarchy lock/visibility states, render queue,
  and sign-out actions.
- Reworked the viewport toolbar to include play, fullscreen, transform,
  selection, pen/eraser, cube, lighting, export, and camera navigation controls.
  The right utility buttons now drive viewport lighting, world, camera, grid,
  and help controls.
- `npm test`: passed (8 tests); `npm run typecheck`: passed; PostCSS parsing and
  `git diff --check`: passed.
- Focused ESLint reported no errors; it retains six existing warnings in
  `Viewport.tsx` (hook dependencies and `<img>` usage). Browser rendering and
  responsive interaction were not verified.

## `/aichat` Casynus logo theme styling

- Removed the blue square background and shadow from the Casynus mark in both
  expanded and collapsed sidebar states.
- The mark is white in dark mode and medium gray in light mode.
- Browser rendering was not verified.

## `/aichat` response typography

- Assistant responses now render markdown-style headings, numbered and bulleted
  lines, bold emphasis, and inline code instead of showing those markers raw.
- Assistant body text and headings use the common 16px chat reading size in
  Roboto; body text is regular weight, headings and numbered markers are bold,
  and emphasized text is bold. Light mode has matching readable colors.
- `npm test`: passed (8 tests); `npm run typecheck`: passed.
- Focused ESLint completed with no errors and five existing image/alt-text
  warnings in the page. `git diff --check`: passed.
- Browser rendering was not verified.

## `/aichat` standard reading size

- Increased assistant response body and heading text from 12px to 16px, matching
  the common default reading size used in chat interfaces; body weight is 400
  and headings retain bold emphasis.
- Inline code scales to 14px to remain legible within the larger response text.
- Browser rendering was not verified.

## `/aichat` empty-chat welcome

- Removed the centered Casynus logo and replaced the two-line personalized
  greeting with “What's on your mind today?” at the existing heading size.
- Kept the welcome text gray in dark mode and a darker gray in light mode. The
  heading was subsequently brightened for readability in dark mode.
- Browser rendering was not verified.

## `/aichat` response emphasis and lists

- Removed underlines from emphasized response text while retaining bold weight.
- Rendered consecutive markdown bullet items as numbered lists, restarting at
  1 after paragraphs, headings, blank lines, or explicitly numbered items.
- Browser rendering was not verified.

## `/aichat` composer typography

- Set the composer text and placeholder to 14px regular Roboto and aligned its
  single-line content vertically in the existing input frame using matching
  line height and compact vertical padding.
- Browser rendering was not verified.

## `/aichat` live provider responses

- Replaced the hard-coded sample reply with a request to `/api/ai-chat`, passing
  the conversation history to the server-side configured provider.
- Added working Gemini/Groq model selection; each selection uses its provider
  key on the server, with the other configured provider as a failover.
- Removed local sample-response fallback so missing provider configuration is
  returned as an error instead of appearing to be a real answer.
- Provider/API failures and empty responses are surfaced to the user rather
  than replaced by a success-shaped sample answer.
- Gemini and Groq API keys are present in local `.env` configuration and
  `.env` is ignored by Git; key values were not inspected or recorded.
- Updated the deprecated Groq model default to `openai/gpt-oss-20b` and
  normalize the old `llama-3.1-8b-instant` setting to the working default.
- Live Groq API request succeeded and returned `OK`; selecting Gemini currently
  fails over to Groq because Gemini reports that its free tier is unavailable
  in this country and billing must be enabled for the Google AI project.
- `npm test`: passed (8 tests); `npm run typecheck`: passed.
- Focused ESLint completed with no errors and five existing image/alt-text
  warnings in the page. `git diff --check`: passed.

## Infrastructure Studio

- Commit `f882192` added an interactive procedural 3D site editor to the
  existing `/infrastructure` route and `/infrastructur` alias. Its scene
  includes editable roads, buildings, water, bridges, parking, trees, paths,
  and public-realm elements; it also includes camera, lighting, selection,
  transforms, hierarchy, export, and local demo planning controls.
- The first editor increment had no durable client-side scene recovery. The
  current working increment adds versioned browser-local autosave with input
  validation, corrupt-data detection, explicit storage errors, and reload
  recovery. Cloud/workspace persistence remains unimplemented.

## Worktree notes

The infrastructure implementation is being updated after `f882192`.
`public/Section/Infra.png` and `public/Section/infra.jpg` were already deleted
in the worktree and are unrelated; they have not been restored or included.

## Compact viewport layout

- Removed the full-width editor header and moved undo/redo into the compact
  tools panel and scene export actions into the floating camera toolbar.
- Made the 3D canvas occupy the full viewport, with rounded translucent
  floating sidebars that preserve access to the tool library and inspector.
- Reduced camera and transform controls to compact toolbar buttons and added
  mobile panel toggles.
- `npm test`: passed (8 tests).
- Focused ESLint and focused TypeScript validation of the infrastructure
  modules: passed.
- PostCSS parsed the complete stylesheet and `git diff --check` passed.
- Browser rendering remains unverified. Full-repository typecheck and
  production build have previously terminated from Node/V8 out-of-memory and
  remain environment-limited.

## Browser-local scene persistence increment

- `tests/infrastructure-storage.test.mjs` covers empty storage, round-trip save,
  corrupt/unsupported snapshots, invalid/duplicate objects, and browser storage
  access/quota failures.
- `npm test`: passed (8 tests).
- Focused ESLint on the changed infrastructure editor and test modules: passed.
- Focused TypeScript validation on the infrastructure page, scene, storage
  declarations, and route alias: passed.
- `npm run typecheck`: blocked by Node.js heap out-of-memory in this checkout;
  the focused TypeScript validation passed, but the full repository typecheck
  remains unverified.
- `npm run build` with temporary local `DATABASE_URL` and `DIRECT_URL` values:
  Prisma Client generation passed; Next.js production compilation terminated
  with a V8 zone out-of-memory error. No live database connection was used.
- `git diff --check`: passed.
- Browser/WebGL interaction and reload testing remain unverified because no
  browser automation run was available.


## Remove legacy /aicode and /archplan pages and clean navigation links

- Deleted `src/app/aicode` and `src/app/archplan` page routes per user request.
- Cleaned up dangling references in `src/app/aichat/page.tsx` (removed unused Code2 icon, search destinations, and redirected New Project link to `/project`).
- Updated `src/app/workflow/page.tsx`, `src/components/crystal-studio/CrystalStudio.tsx`, and `src/components/crystal-studio/DesignDashboard.tsx` to link to `/interior`, `/infrastructure`, and `/casynus` instead of `/archplan`.
- Cleared cached Next.js types in `.next/types/app/aicode` and `.next/types/app/archplan`.
- `npx tsc --noEmit`: passed with 0 errors.
- `npm run test`: 202 tests passed, 0 failures.


## Refine /project dashboard, UnifiedSidebar, search, profile menu, and wave backgrounds

- Cleaned `UnifiedSidebar` items to include only functional Casynus routes (`Dashboard`, `Modeling`, `Sketch`, `Infrastructure`, `Workflows`, `AI Chat`), removing placeholder sections (`Favorites`, `Records`) and fake upgrade banner.
- Standardized search bar styling to `h-9 rounded-xl` matching `/aichat`.
- Connected user session and integrated `StudioProfileMenu` across expanded and collapsed sidebar states, matching the architecture studio and homepage.
- Renamed `Launch Studio` to `New Project` routing to `/casynus`.
- Set dark grey background (`#202124`) on `/project` dashboard and main container.
- Removed rounded corners on the dashboard top header (`border-radius: 0 !important`, flat straight edges).
- Added `wave0.jpg`, `wave1.webp`, and `wave2.jpg` backgrounds for the recent project cards.
- `npx tsc --noEmit`: passed with 0 errors.
- `npm run test`: passed 202/202 tests.


## Set #161616 project background, #2B2B2B header and profile frame, and full-frame card images

- Updated `/project` dashboard background to `#161616` across desktop and responsive styles.
- Styled top header and home button to `#2B2B2B` with matching hover state.
- Updated project cards so wave thumbnail images span the entire card frame (`position: absolute; inset: 0; width: 100%; height: 100%`) with frosted-glass caption overlay.
- Styled sidebar profile trigger button with `#2B2B2B` background and matching hover.
- `npx tsc --noEmit`: passed with 0 errors.
- `npm run test`: passed 202/202 tests.
