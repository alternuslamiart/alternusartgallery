# Verified progress

Last updated: 2026-10-19

## Casynus Studio Ecosystem UI/UX redesign

- Added the dedicated `/interior` route (`src/app/interior/page.tsx`) for the 2D
  Floor Plan & Interior Studio while preserving `/casynus?mode=floor-plan`
  compatibility and updating `StudioModeNav` (`src/components/crystal-studio/ui.tsx`)
  and `UnifiedSidebar` (`src/components/unified-sidebar.tsx`) to link to
  `/interior`.
- Redesigned `/casynus`, `/interior` (`/casynus?mode=floor-plan`), and
  `/infrastructure` (`/infrastructur`) to match the reference 3D/CAD studio
  layout (`src/app/globals.css`, `.ref-*` classes):
  - Floating dark charcoal rounded side panels (`#141518`, `16px` radius) with
    hierarchical scene trees, connector lines (`├`, `└`, `│`), disclosure
    chevrons, inline visibility/lock controls, collapsible setup drawers, and
    the bottom `Library` / `Import` / `Help & Feedback` footer.
  - Compact top-center floating pill toolbar (`.ref-top-toolbar`) with `+` add
    and shape/drawing tools, solid electric blue (`#1a8cff`) active selection
    state, view framing, zoom percentage readout (`100% ▾`), solid blue
    `Export` button, and preview/play trigger.
  - Circular 3D Orientation Axis Gizmo (`X` / `Y` / `Z`) and
    `Orthographic` | `Perspective` projection switcher on the 3D viewports,
    while preserving a pure 2D drafting canvas on `/interior`.
  - Right properties inspector with top collaborator avatar stack
    (`InspectorCollaboratorBar` + `Invite`), `Camera`, `Frame` (color swatch,
    hex, opacity, `Edit Frame`), `Global Settings` (`BinaryToggle` `Yes`/`No`
    and `Show`/`Hide` blue pills), `Post-Processing` switch, `Environment`
    (`Light`, `Ambient`, `Fog` gear icons + `Yes`/`No` pills), and `Export`.
  - Bottom `StudioAIChat` (`src/components/crystal-studio/StudioAIChat.tsx`)
    starting in a compact composer state with a `Tools ▾` dropdown menu, Model
    Selector, attachment preview, and expandable message history.
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
