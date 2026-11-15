# IMPLEMENTATION_PROGRESS — Blueprint & Implementation Status Tracker

**Project:** DENRYU — Power Plant Anatomy & Energy Systems Explorer  
**Last Updated:** 2026-11-16  
**Current Stage:** **Phase 2 Complete — App Shell, Overview Page & 36-Component 3D Plant Environment** (Moving to Phase 3: Plant Anatomy Workspace)

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
