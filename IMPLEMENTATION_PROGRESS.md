# IMPLEMENTATION_PROGRESS — Blueprint & Implementation Status Tracker

**Project:** DENRYU — Power Plant Anatomy & Energy Systems Explorer  
**Last Updated:** 2026-11-16  
**Current Stage:** **Phases 1–10 Complete — Production-Ready Release Verified Across Rust, WASM Worker, Python FastAPI, React/Three.js & Playwright E2E**

---

## 1. Documentation Package Completion Status

| # | File | Status | Owner Spec Scope |
|---|---|---|---|
| 1 | `PRD.md` | Complete — Audited | Product vision, personas, 6-page IA, FR/NFR, scope, AC-01..AC-20 |
| 2 | `ARCHITECTURE.md` | Complete — Audited | TS/Rust/Python split, module structure, Worker/WASM, GitHub Pages & container deploy |
| 3 | `DESIGN.md` | Complete — Audited | Design tokens, typography, PBR 3D language, page layouts, WebGL fallback, Reduced Motion |
| 4 | `PLANT_ANATOMY_SPEC.md` | Complete — Audited | Canonical 6 subsystems & 36 components (20 fields each), relationships, 5 Runner modes |
| 5 | `ENERGY_JOURNEY_SPEC.md` | Complete — Audited | Canonical 9 stages, energy/loss accounting, camera choreography, state machine |
| 6 | `SIMULATION_SPEC.md` | Complete — Audited | System-level equations, smooth Francis/generator curves, synchronous speed, Scenarios A–F |
| 7 | `DATA_MODEL.md` | Complete — Audited | 13 core entities, TS interfaces, Rust Serde mirror, SI units, JSON examples |
| 8 | `API_CONTRACT.md` | Complete — Audited | FastAPI `/api/v1` endpoints, schemas, validation, error envelope, CORS |
| 9 | `ASSET_GUIDELINES.md` | Complete — Audited | Coordinate system, 36-mesh inventory, deterministic ID mapping, LOD/budgets, licensing |
| 10 | `TEST_PLAN.md` | Complete — Audited | Rust, Python, Vitest, integrity, Playwright E2E, Scenario tolerances, perf targets |
| 11 | `flow.md` | Complete — Audited | Phases 0–8 roadmap, dependency DAG, tasks, deliverables, acceptance criteria, risks |
| 12 | `constraints.md` | Complete — Audited | Locked product, scientific, technical, 3D, data, deployment, and isolation boundaries |
| 13 | `README.md` | Complete — Audited | Project introduction, architecture overview, doc index, prerequisites |
| 14 | `IMPLEMENTATION_PROGRESS.md` | Active Tracker | Documentation status, cross-doc audit results, unresolved decisions, next steps |

---

## 2. Cross-Document Audit Checklist (L6 Verification)

*(Completed on 2026-11-16 across all 14 Markdown blueprint documents.)*

- [x] **Product Consistency:** 6 pages, single simulator rule, locked Francis conventional hydro scope verified across `PRD`, `DESIGN`, `README`, `constraints`.
- [x] **Component & Stage ID Parity:** Exact match of all `36` `comp-*` IDs (`6` subsystems `sub-*`) and `9` `stage-*` IDs verified programmatically across `PLANT_ANATOMY_SPEC`, `ENERGY_JOURNEY_SPEC`, `DATA_MODEL`, `ASSET_GUIDELINES`, and `TEST_PLAN`.
- [x] **Simulation Math & Schema Parity:** All equations, SI units, bounds, warning codes (`8` codes), `serde` camelCase mappings, and Scenario A–F / sensitivity sample values reconciled to exact IEEE-754 parity across `SIMULATION_SPEC`, `DATA_MODEL`, `API_CONTRACT`, and `TEST_PLAN`.
- [x] **Technical & Deployment Consistency:** Offline-core independence, GitHub Pages `base`/HashRouter/Worker/WASM handling, and Python FastAPI responsibilities verified across `ARCHITECTURE`, `API_CONTRACT`, `flow`, and `constraints`.

---

## 3. Documented Engineering Assumptions (Synthetic Educational Baseline)

1. **Reference Plant (`denryu-hydro-unit-01`):** `85.0 m` rated net head, `60.0 m³/s` nominal flow (`72.0 m³/s` max gate capacity at `85 m`, `58.0 m³/s` BEP flow), `50.0 MW` mechanical rating, `55.0 MW` max generator ceiling, `50 Hz`, `24` salient poles (`250.0 rpm` synchronous speed).
2. **Smooth Curve Simplification:** Francis turbine efficiency and generator load-loss curves use documented $C^1$-smooth synthetic approximations rather than OEM proprietary hill-chart lookup tables or CFD results.
3. **Synchronous Lock:** Grid-tied modes (`normal`, `partial_load`, `high_load`) lock steady-state rotor speed to $n_s = 120f/N_p$; `startup` models speed-no-load ramp with open generator breaker; `shutdown` guards torque division-by-zero cleanly.
4. **Conveyance Loss Framing:** `netHeadM` ($H$) in the simulator already represents effective net head after penstock friction loss; `comp-penstock` and `Engineering Insights` explain gross-to-net head loss contextually without duplicating a second hydraulic network solver.

---

## 4. Open / Owner-Owned Decisions Before or During Implementation

| Decision | Impact Phase | Current Default / Recommendation | Owner |
|---|---|---|---|
| **GitHub Repository & Pages URL Path** | Phase 1 / Phase 8 | Repository connected: `https://github.com/Orls967/DenRyu.git` → default `VITE_BASE_PATH=/DenRyu/` (adjust only if custom domain is added later). | Resolved (`Orls967/DenRyu`) |
| **3D Custom GLB Sourcing vs. Procedural Tier-B Start** | Phase 2 / Phase 3 | Begin Phase 2 with engineered procedural geometry for all 36 `componentId`s + replace Tier-A hero parts (`comp-runner`, `comp-runner-blades`, `comp-spiral-casing`, `comp-rotor`) with Blender `.glb` exports cleanly via `manifest.json`. | Owner + Implementation Agent |
| **Optional Python API Hosting Provider** | Phase 7 / Phase 8 | Containerized FastAPI (`apps/api/Dockerfile`) deployable to Cloud Run / Fly.io / Railway; optional at runtime since core app runs standalone on GitHub Pages. | Project Owner |
| **Default Grid Frequency (`50 Hz` vs `60 Hz`)** | Phase 1 / Phase 5 | `50 Hz` (`24` poles → `250 rpm`) default in `SimulationConfiguration`; configurable to `60 Hz` (`300 rpm`) via config if desired. | Locked Default (`50 Hz`) |

---

## 5. Identified Implementation Risks

1. **WebGL Shader / Clipping Complexity:** Three.js `localClippingEnabled` with transparent shells (`comp-spiral-casing`) and `InstancedMesh` requires careful render-order and `side: DoubleSide` management to avoid depth-sorting glitches.
2. **Vite Subpath + WASM + Worker Bundling:** Deploying WASM inside a Web Worker under GitHub Pages subpath (`/DenRyu/`) fails if root-relative `/...` URLs are hardcoded; mitigated strictly by `ARCHITECTURE.md` Section 8.1 rules and early Phase 1 `vite preview` verification.
3. **3D Blade Geometry Readability:** Procedural boxes cannot explain why Francis blades twist radially-to-axially; Phase 2/3 must use genuine swept/twisted blade surfaces (either parametric Blender Python script exported to `.glb` or analytic 3D NURBS/Bezier surface triangulation).

---

## 6. Implementation Milestone Log

- **Phase 1 (Complete):**
  - Hardened `.gitignore` for Node, Rust/WASM, Python, OS, IDE, and test artifacts.
  - Scaffolded `apps/web` (React 18 + TypeScript + Vite + Tailwind CSS + Three.js/R3F/Drei + Zustand + Recharts + KaTeX + Vitest + ESLint) with `HashRouter` and `VITE_BASE_PATH` support.
  - Authored canonical `data/` JSON datasets (`denryu-unit-01.json`, `subsystems.json`, `components.json` with all 36 components, `relationships.json`, `stages.json` with all 9 stages, `scenarios.json`, `glossary-and-refs.json`) and `apps/web/public/models/manifest.json`.
  - Implemented `crates/denryu-engine` (`hydraulics`, `turbine`, `generator`, `energy_conversion`, `simulation`, `wasm-bindgen` exports) and verified `cargo test` (9/9 passing, Scenario A–F + 500-case fuzz) and `wasm-pack build`.
  - Scaffolded `apps/api` FastAPI service (`/api/v1/health`, Dockerfile, `pytest` 1/1 passing).
  - Verified `npm run typecheck`, `npm run lint`, `vitest` (5/5 integrity tests passing), and `VITE_BASE_PATH=/DenRyu/ vite build`.
- **Phase 2 (Complete):**
  - Implemented Zustand stores (`uiStore`, `anatomyStore`, `journeyStore`), responsive `AppShell` with Reduced Motion toggle, `ErrorBoundary`, `WebGLBoundary`, and `PlantSchematic2DFallback`.
  - Implemented `OverviewPage` with `PlantScene` hero, synthetic nominal plant KPIs, quick subsystem preview strip, and route cards.
  - Built 3D environment (`StudioLighting`, `PlantScene`, `presets`, `FlowVisualizers`, `plantModelLoader`, `ComponentGroup`, and Subsystems A–F covering all 36 `comp-*` IDs with helical spiral casing, 20 pivoting guide vanes, 15 double-curved Francis blades, 24-pole rotor, explode/section-cut clipping planes, and 5-mode Francis Runner inspection highlights).
  - Verified `npm run typecheck`, `npm run lint`, `npm run test:web` (5/5 passing), and `VITE_BASE_PATH=/DenRyu/ vite build`.
- **Phase 3 (Complete):**
  - Implemented `PlantAnatomyPage` responsive 3-pane workbench (`HierarchyTree`, `AnatomyToolbar`, `ComponentInspector`) wired to `/anatomy` and URL deep-links (`?component=...&mode=...`).
  - Supported searchable 6-subsystem / 36-component hierarchy, eye visibility toggles, camera focus, 7-preset camera dropdown, Exploded View slider (`0–100%`), X/Y/Z Section Cut controls, Isolate toggle, Labels toggle, 5-mode Francis Runner inspection bar, and 7-tab technical inspector with clickable upstream/downstream chips.
  - Verified `npm run typecheck`, `npm run lint`, `npm run test:web` (8/8 passing), and `VITE_BASE_PATH=/DenRyu/ vite build`.
- **Phase 4 (Complete):**
  - Implemented `EnergyJourneyPage` (`/journey`) with camera choreography presets, highlight/transparent shell states, physics animation modes, manual-orbit detection with **Re-center Stage Camera**, auto-play dwell timer, keyboard Arrow navigation, KaTeX governing formulas, loss mechanisms, clickable active component chips (`/anatomy?component=...`), Stage 04 5-mode Runner CTA, and Stage 09 Replay/Simulator completion flow.
  - Verified `npm run typecheck`, `npm run lint`, `npm run test:web` (10/10 passing), and `VITE_BASE_PATH=/DenRyu/ vite build`.
- **Phase 5 & 6 (Complete):**
  - Built `simulation.worker.ts` + `SimulationBridge` (`apps/web/src/services/simulationBridge.ts`) executing `crates/denryu-engine` WASM inside a dedicated Web Worker with correlation IDs and structured `SimulationValidationError` handling (zero physics duplicated in TS).
  - Implemented `simulatorStore.ts` (120-point ring buffer, inline Rust field error propagation, Scenario Presets A–F, play/pause/step/reset).
  - Implemented `GenerationSimulatorPage`, `ControlDeck`, and `SimulationCharts` (live KPIs, operating warnings with deep links to `/anatomy`, paired live 3D turbine-generator cutaway, and 4 Recharts visualizations).
  - Verified `npm run typecheck`, `npm run lint`, `npm run test:web` (14/14 passing), and `VITE_BASE_PATH=/DenRyu/ vite build` (bundling `simulation.worker.js` and `denryu_engine_bg.wasm`).
- **Phase 7 (Complete):**
  - Implemented `insightsEngine.ts`, `analyticsClient.ts` (`5000ms` timeout & standalone offline graceful degradation), and `EngineeringInsightsPage` (`/insights`) with active operating diagnostics, loss waterfall chart, WASM-evaluated Scenario A–E comparison table, and optional FastAPI sensitivity sweep + parity validator.
  - Implemented `TechnicalLibraryPage` (`/library`) with domain category/search filters, glossary cards linking to `/anatomy`, KaTeX equations, SI unit conversion table, Synthetic Model assumptions/limitations, asset credits, and technical bibliography.
  - Completed FastAPI analytics endpoints (`GET /api/v1/plant/config`, `POST /api/v1/analytics/sensitivity`, `POST /api/v1/analytics/compare-scenarios`, `POST /api/v1/analytics/validate-output`) with unified `ErrorEnvelope` handling (`400`, `422`, `500`) and `< 1e-5` IEEE-754 parity with `denryu-engine`.
  - Verified `pytest` (6/6 passing), `npm run test:web` (17/17 passing), `typecheck`, `lint`, and `VITE_BASE_PATH=/DenRyu/ vite build`.
- **Phases 8–10 (Complete):**
  - Added `.github/workflows/ci-deploy.yml` automating Rust tests, Python pytest, wasm-pack build, frontend typecheck/lint/vitest, subpath Vite build (`VITE_BASE_PATH=/DenRyu/`), and GitHub Pages deployment on `main`.
  - Added `assets/ASSET_LICENSE_LOG.md` and synchronized `README.md` with actual monorepo build, test, and deployment procedures.
  - Added `apps/web/playwright.config.ts`, `apps/web/e2e/core-journey.spec.ts`, and `apps/web/e2e/resilience.spec.ts`; hardened `simulation.worker.ts` `serde_wasm_bindgen` `Map`/enum validation unwrapping and mobile grid `min-w-0`/`overflow-x-hidden` constraints.
  - Full verification run passing cleanly: `cargo test` (9/9), `pytest` (6/6), `vitest` (17/17), `typecheck`, `eslint`, `VITE_BASE_PATH=/DenRyu/ vite build`, and `playwright test` (6/6 in Chromium against `/DenRyu/` preview).
- **Post-release hardening (2026-11-16):**
  - **GitHub Pages went live** at https://orls967.github.io/DenRyu/. The first deploy had failed: `setup-node` cached against a missing root lockfile, `npm ci` ran at the root, and pytest was not installed. Pages was also not enabled with the GitHub Actions source.
  - **Fixed a 3D regression that escaped the E2E suite.** After any client-side route change, every later 3D view fell back to the 2D schematic. R3F calls `forceContextLoss()` on the unmounted canvas, and the `webglcontextlost` listener flipped the global flag. The listener is now detached on unmount, and `e2e/resilience.spec.ts` covers this (verified to fail without the fix).
  - **3D remodel.**
    - Dam: realistic gravity-dam profile, 140 m crest length (was 56 m), lift and monolith joints, crest road with parapets and lamps, and a hoist house.
    - Spillway: rebuilt as an ogee crest with radial gates, a chute on the downstream face, a flip bucket and a stilling basin. It replaces the 108 m slab that cut across the powerhouse.
    - Reservoir: wedged water body with a free surface.
    - Site: valley backdrop and a cut-away powerhouse (walls, generator floor, roof trusses, bridge crane).
    - Francis runner: 15 closed double-curved blades with ~60°/40° crown/band wrap, plus lathe-profiled crown, band and nose cone.
    - Cameras: overview, full-plant and dam presets re-framed for the new geometry.
  - **UI fixes.**
    - Component inspector renders inline markdown, and its tabs wrap.
    - Journey chips no longer show the stage number twice.
    - Insights loss chart is a true floating waterfall.
    - Overlapping 2D-fallback labels became callouts with leader lines.
    - Simulator control deck is sticky.
    - Runner close-up hides surrounding parts and flow particles.
  - **README rewritten** with a screenshot tour captured from the live site (`apps/web/screenshots/capture.spec.ts`, run with `npm run screenshots`). Vitest now excludes `screenshots/`.
  - **Verification:** `typecheck`, `eslint`, `vitest` (17/17) and `playwright test` (7/7) all pass.
