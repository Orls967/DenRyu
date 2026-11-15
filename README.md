# DENRYU — Power Plant Anatomy & Energy Systems Explorer

**Understand. Explore. Deconstruct. Generate.**

> **Project Status: Production-Ready Full Implementation (Phases 1–10)**  
> DENRYU is implemented across **TypeScript/React/Three.js (`apps/web`)**, **Rust/WebAssembly (`crates/denryu-engine`)**, and an **optional Python FastAPI analytics service (`apps/api`)**, backed by canonical engineering datasets (`data/`) and GitHub Pages CI/CD (`.github/workflows/ci-deploy.yml`).

---

## 1. What is DENRYU?

**DENRYU** (*Denryu*, 電流 — Japanese for *electric current*) is an interactive 3D engineering education and digital-twin exploration platform dedicated to unpacking how a **conventional storage hydroelectric power plant** works from elevated reservoir to electrical grid.

Rather than covering every power plant type superficially, DENRYU focuses deeply on one locked reference configuration:
- **Plant Type:** Conventional Storage Hydroelectric Power Plant (Single Generating Unit)
- **Turbine:** Vertical-Shaft **Francis Reaction Turbine**
- **Generator:** Salient-Pole **Synchronous Generator** (`24` poles, `50 Hz` nominal / configurable `50–60 Hz`)
- **Delivery & Grid:** Step-Up Transformer (GSU) → Switchyard → Overhead Transmission Line → Grid
- **Philosophy:** *Don't just show how a power plant looks. Explain how every component works, why it exists, and how the entire system generates electricity.*

---

## 2. Core Capabilities & Six Primary Pages

| Page | Route (`HashRouter`) | Capability |
|---|---|---|
| **1. Overview** | `#/` | Cinematic 3D hero of the complete facility, ambient water/turbine motion, reference plant specs, and subsystem entry portals. |
| **2. Plant Anatomy** | `#/anatomy` | Dominant 3D engineering laboratory: 6-subsystem / 36-component hierarchy, selection, isolation, hide/show, exploded assembly, X/Y/Z section cuts, upstream/downstream links, and a dedicated **5-mode Francis Runner inspector**. |
| **3. Energy Journey** | `#/journey` | Guided 9-stage walkthrough (`Water Storage` → `Water Discharge`) with synchronized camera choreography, cutaway transparency, directional streamlines, torque/flux/current cues, and stage equations. |
| **4. Generation Simulator** | `#/simulator` | One primary mathematical simulator (**Hydroelectric Power Generation Simulator**) driven by Rust/WASM in a Web Worker, exploring Net Head, Flow, Guide Vanes, Efficiency Curves, Torque, Synchronous Speed, Load Demand, and Scenarios A–E. |
| **5. Engineering Insights** | `#/insights` | Client-side rule-based diagnostic interpretations, energy loss waterfalls, scenario comparisons, and optional Python/FastAPI sensitivity sweeps. |
| **6. Technical Library** | `#/library` | Searchable engineering glossary, full SI equations, documented synthetic assumptions/limitations, asset credits, and authoritative IEC/IEEE/USBR references. |

---

## 3. Technology Stack & Responsibility Split

- **TypeScript / React / Vite / Three.js (R3F + Drei) / Zustand / Tailwind / Recharts (`apps/web`):** UI, navigation, 3D scene rendering, component interaction, guided journey choreography, and scientific charts. Deployed statically to **GitHub Pages**.
- **Rust → WebAssembly + Web Worker (`crates/denryu-engine`):** Deterministic, non-blocking system-level physics engine (`hydraulics`, `turbine`, `generator`, `energy_conversion`). Core simulation runs **100% offline from the backend**.
- **Python / FastAPI / Pydantic v2 / NumPy (`apps/api`):** Optional separate containerized analytics service for multi-point sensitivity sweeps, batch scenario comparisons, and independent numerical parity validation.

---

## 4. Documentation Index (Blueprint Package)

| Document | Purpose |
|---|---|
| [`PRD.md`](./PRD.md) | Product vision, personas, user journey, 6-page IA, functional/non-functional requirements, scope, and 20 acceptance criteria (`AC-01..AC-20`). |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Three-language architecture, directory layout, Worker/WASM bridge, error boundaries, Mermaid diagrams, and GitHub Pages + container deployment rules. |
| [`DESIGN.md`](./DESIGN.md) | Dark laboratory design tokens (`#0B1016` / `#36C5D9` / `#2589D8` / `#F5B942`), typography, 3D PBR material language, interactions, Reduced Motion, and WebGL fallback. |
| [`PLANT_ANATOMY_SPEC.md`](./PLANT_ANATOMY_SPEC.md) | **Authoritative source** for all `6` subsystems and `36` components (20 standardized technical fields per component, relationships, and 5 Runner modes). |
| [`ENERGY_JOURNEY_SPEC.md`](./ENERGY_JOURNEY_SPEC.md) | **Authoritative source** for all `9` energy conversion stages, energy-loss tracking, camera choreography, and Mermaid playback state machine. |
| [`SIMULATION_SPEC.md`](./SIMULATION_SPEC.md) | Mathematical specification for the single primary simulator: SI units, equations, smooth Francis & generator curves, synchronous speed physics, Scenarios A–F vectors, and warnings. |
| [`DATA_MODEL.md`](./DATA_MODEL.md) | Canonical TypeScript interfaces, Rust Serde mirror, SI unit conversion rules, data ownership matrix, and consistent JSON examples. |
| [`API_CONTRACT.md`](./API_CONTRACT.md) | FastAPI `/api/v1` endpoints (`/health`, `/plant/config`, `/analytics/sensitivity`, `/analytics/compare-scenarios`, `/analytics/validate-output`), error envelope, CORS, and examples. |
| [`ASSET_GUIDELINES.md`](./ASSET_GUIDELINES.md) | 3D coordinate conventions (`+Y` up, `1 unit = 1 m`), 36-asset inventory, deterministic `componentId` mapping, LOD/polygon budgets, procedural fallback rules, and licensing policy. |
| [`TEST_PLAN.md`](./TEST_PLAN.md) | Comprehensive QA blueprint covering `cargo test`, `wasm-pack test`, `pytest`, `vitest`, `playwright` E2E, engineering reference tolerances, and performance targets. |
| [`flow.md`](./flow.md) | Actionable 9-phase implementation roadmap (`Phase 0` through `Phase 8`) with DAG dependency diagram, tasks, deliverables, and risks. |
| [`constraints.md`](./constraints.md) | Hard product, scientific, technical, 3D, data, deployment, and workspace-isolation rules. |
| [`IMPLEMENTATION_PROGRESS.md`](./IMPLEMENTATION_PROGRESS.md) | Live status tracker for documentation audit, open decisions, assumptions, and handoff checklist for Phase 1 implementation. |

---

## 5. Key Engineering Assumptions & Disclaimers

- **Illustrative Reference Unit (`denryu-hydro-unit-01`):** Nominal `85.0 m` net head, `60.0 m³/s` flow rate, `50.0 MW` mechanical rating, `50 Hz`, `24` salient poles (`250.0 rpm` synchronous speed), `~44.55 MW` nominal output in Scenario A.
- **Educational Scope:** Curves and parameters are synthetic and transparently documented for engineering intuition. DENRYU does **not** perform industrial CFD, transient MOC water-hammer pipe analysis, or certified plant design calculations.

---

## 6. Local Development, Testing & Deployment Quickstart

### Prerequisites
- **Node.js `20+`** & `npm`
- **Rust (`1.80+`)** with `wasm32-unknown-unknown` target and **`wasm-pack`**
- **Python `3.11+`** with `uv` or `pip` (optional for `apps/api`)

### Run Tests & Build Locally
```bash
# 1. Rust physics engine unit + 500-case fuzz tests
npm run test:rust

# 2. Build Rust -> WebAssembly package for the browser Web Worker
npm run build:wasm

# 3. Frontend dependencies, typecheck, lint, Vitest & GitHub Pages subpath build
npm install
npm run typecheck
npm run lint
npm run test:web
VITE_BASE_PATH=/DenRyu/ npm --prefix apps/web run build

# 4. End-to-end Chromium tests (including WebGL2 2D fallback & responsive checks)
npm --prefix apps/web run test:e2e

# 5. Optional Python FastAPI analytics server & pytest parity suite
apps/api/.venv/bin/pytest apps/api/tests
```

---

## 7. GitHub Pages & Optional Backend Deployment

- **GitHub Pages (Primary Web App):** `.github/workflows/ci-deploy.yml` runs `cargo test`, `pytest`, `typecheck`, `eslint`, `vitest`, compiles `denryu-engine` via `wasm-pack`, and builds `apps/web` with `VITE_BASE_PATH=/DenRyu/` before publishing to GitHub Pages.
- **Standalone Offline Core Guarantee:** Overview, Plant Anatomy, Energy Journey, Generation Simulator, Engineering Insights diagnostics, and Technical Library run **100% client-side** in browser/WASM with zero required backend server. If `VITE_API_BASE_URL` is configured to point at a hosted `apps/api` container (`apps/api/Dockerfile`), `/insights` additionally unlocks multi-point sensitivity sweeps and `< 1e-5` cross-language parity checks.
