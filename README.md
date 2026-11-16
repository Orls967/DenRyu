<div align="center">

# DENRYU

### Power Plant Anatomy & Energy Systems Explorer

**Understand. Explore. Deconstruct. Generate.**

An interactive 3D look inside a conventional storage hydroelectric power plant, from reservoir to grid, running entirely in the browser.

[![CI & Pages](https://github.com/Orls967/DenRyu/actions/workflows/ci-deploy.yml/badge.svg)](https://github.com/Orls967/DenRyu/actions/workflows/ci-deploy.yml)
[![Live Demo](https://img.shields.io/badge/live%20demo-GitHub%20Pages-36C5D9?logo=github)](https://orls967.github.io/DenRyu/)
![Rust](https://img.shields.io/badge/Rust-WASM-orange?logo=rust)
![React](https://img.shields.io/badge/React-Three.js%20%2F%20R3F-61DAFB?logo=react)
![Python](https://img.shields.io/badge/Python-FastAPI%20%2B%20NumPy-3776AB?logo=python)

**[▶ Open the live demo](https://orls967.github.io/DenRyu/)**

![DENRYU Overview: live 3D hydroelectric plant with the reference unit specification](docs/screenshots/01-overview-hero.png)

</div>

> [!IMPORTANT]
> **Educational model only.** DENRYU is a deterministic, synthetic engineering demonstrator. It is **not** SCADA telemetry, a CFD solver, a transient water-hammer (MOC) analysis, or a certified plant design tool. Every curve and parameter is an *illustrative synthetic baseline* and is labelled as such in the UI.

---

## Contents

- [What is DENRYU?](#what-is-denryu)
- [Live demo & run modes](#live-demo--run-modes)
- [Feature tour (screenshots)](#feature-tour)
  - [01 · Overview](#01--overview)
  - [02 · Plant Anatomy](#02--plant-anatomy)
  - [03 · Energy Journey](#03--energy-journey)
  - [04 · Generation Simulator](#04--generation-simulator)
  - [05 · Engineering Insights](#05--engineering-insights)
  - [06 · Technical Library](#06--technical-library)
  - [Mobile layout](#mobile-layout)
- [Reference unit & scenario presets](#reference-unit--scenario-presets)
- [Physics model](#physics-model)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Testing & CI/CD](#testing--cicd)
- [Documentation index](#documentation-index)
- [Known limitations](#known-limitations)

---

## What is DENRYU?

**DENRYU** (電流, Japanese for *electric current*) explains how a hydroelectric power plant turns stored water into electricity. Textbook diagrams are flat, plant brochures skip the engineering, and full simulators are locked away in commercial tools. DENRYU puts the structure, the energy chain and the physics in one place.

It covers one locked reference configuration in depth instead of many plant types superficially:

| | |
|---|---|
| **Plant type** | Conventional storage hydroelectric plant, single generating unit |
| **Turbine** | Vertical-shaft **Francis reaction turbine** |
| **Generator** | Salient-pole **synchronous generator**, 24 poles, 50 Hz (configurable 50–60 Hz) |
| **Delivery** | Generator step-up transformer (GSU) → switchyard → overhead line → grid |

- **Every component is explained.** 36 canonical components in 6 subsystems, each with location, purpose, principle, construction, operation, relationships, parameters, failure modes and maintenance.
- **Every number is computed.** The simulator is a **Rust → WebAssembly** engine running in a Web Worker: hydraulic power, Francis efficiency curve, shaft torque, synchronous speed, generator losses and grid dispatch.
- **Works offline.** All six pages run client-side. An optional **Python/FastAPI** service adds sensitivity sweeps and a cross-language parity check.

**Built for:** engineering students learning hydropower, educators who need a visual aid, and anyone curious about where grid electricity comes from.

---

## Live demo & run modes

| Mode | What runs | What you get |
|---|---|---|
| **[GitHub Pages](https://orls967.github.io/DenRyu/)** (static) | React UI + Rust/WASM engine in your browser | All six pages. The FastAPI panel on Insights shows a graceful offline notice. |
| **Local full stack** | The above + FastAPI on `:8000` with `VITE_API_BASE_URL` set | Adds multi-point sensitivity sweeps and `< 1e-5` Rust ↔ Python parity validation. |

> All screenshots below were captured from the deployed GitHub Pages site by [`apps/web/screenshots/capture.spec.ts`](apps/web/screenshots/capture.spec.ts) (see [Regenerating screenshots](#regenerating-screenshots)).

---

## Feature tour

The top bar has six pages. On the right, two badges show the motion setting (`Standard` / `Reduced`) and the reference unit (`UNIT 01 · 50 HZ · SYNTHETIC MODEL`). Routing uses `HashRouter` (`#/anatomy`, `#/journey`, …) so deep links work on GitHub Pages.

### 01 · Overview

The landing page. A 3D diorama of the complete plant (reservoir, a 140 m concrete gravity dam with a gated ogee spillway, surface penstock, cut-away powerhouse, switchyard, transmission line and tailrace) set in a valley, with animated water flow and a slowly orbiting camera. Drag to orbit, scroll to zoom, click any structure to open it in Plant Anatomy.

Below the hero:

- **Reference Unit Specification:** net head `85.0 m`, flow `60.00 m³/s`, Scenario A output `44.55 MW`, sync speed `250.0 rpm`, `50 Hz`, `24` poles.
- **Water-to-Grid Energy Conversion Chain:** seven milestones that jump straight to the matching component.
- **Six Plant Subsystems:** cards with descriptions and an `Inspect Subsystem` shortcut to a pre-framed camera.

<details>
<summary>Full Overview page</summary>

![Overview full page](docs/screenshots/01-overview-full.png)

</details>

---

### 02 · Plant Anatomy

The main 3D lab. Three panels: the **Plant Hierarchy** (36 components) on the left, the **3D viewport** in the middle, and the **7-tab Component Inspector** on the right.

![Plant Anatomy default view](docs/screenshots/02-anatomy-default.png)
<sub>Default view: full plant with the Runner selected</sub>

**Hierarchy.** Components are grouped by subsystem (A Reservoir & Dam · B Water Conveyance · C Turbine · D Generator · E Electrical Transmission · F Discharge). Search filters the tree. Each row has **isolate** (⌖) and **show/hide** (👁) buttons, and each subsystem can be hidden as a group.

**Toolbar.** Camera preset selector (Full Plant, Dam & Reservoir, Submerged Intake, Conveyance Profile, Turbine Pit, Blade Close-Up, Shaft & Bearings, Generator Hall, Transformer Bay and more), `Explode 0–100 %`, `Section Cut` on X/Y/Z with an offset slider, `Isolate`, `Labels` and `Reset`.

<table>
<tr>
<td width="50%"><img src="docs/screenshots/02-anatomy-search-spiral-casing.png" alt="Search and select Spiral Casing"><br><sub>Searching <b>"Spiral"</b> and selecting the Spiral Casing</sub></td>
<td width="50%"><img src="docs/screenshots/02-anatomy-plant-exploded.png" alt="Exploded view 70%"><br><sub><b>Exploded View</b> at 70 %</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/02-anatomy-section-cut.png" alt="Section cut"><br><sub><b>Section Cut</b> clipping plane enabled</sub></td>
<td width="50%"><img src="docs/screenshots/02-anatomy-inspector-parameters.png" alt="Inspector parameters tab" width="60%"><br><sub>Inspector <b>Parameters</b> tab</sub></td>
</tr>
</table>

**Francis Runner, 5 inspection modes.** Selecting the Runner or Runner Blades opens a dedicated inspection bar: `Normal` · `Exploded Assembly` · `Cross-Section` · `Blade Close-Up` · `Flow Path`.

<table>
<tr>
<td width="50%"><img src="docs/screenshots/02-anatomy-runner-exploded.png" alt="Runner exploded assembly"><br><sub>Exploded Assembly</sub></td>
<td width="50%"><img src="docs/screenshots/02-anatomy-runner-cross-section.png" alt="Runner cross-section"><br><sub>Cross-Section</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/02-anatomy-runner-blade-closeup.png" alt="Runner blade close-up"><br><sub>Blade Close-Up with leading/trailing edge labels</sub></td>
<td width="50%"><img src="docs/screenshots/02-anatomy-runner-flow-path.png" alt="Runner flow path"><br><sub>Flow Path (radial inlet → axial outlet)</sub></td>
</tr>
</table>

**Inspector tabs:** `Overview` · `Principle` · `Construction` · `Operation` · `Relations` (clickable upstream/downstream chips) · `Parameters` · `Failure & Maint.` The footer links to the matching Energy Journey stage and to the Simulator.

---

### 03 · Energy Journey

A guided 9-stage walkthrough of the energy chain. Each stage moves the camera, highlights the active components, makes the surrounding shell transparent and shows the flow (streamlines, torque, flux or current cues). The side panel explains the physical process, the losses at that stage and the governing equations (KaTeX).

| # | Stage | Energy form |
|---|---|---|
| 01 | Water Storage | Gravitational potential |
| 02 | Water Intake | Potential → pressure |
| 03 | Water Conveyance | Pressure + kinetic (with friction loss) |
| 04 | Turbine Conversion | Hydraulic → mechanical shaft power |
| 05 | Mechanical Transmission | Shaft torque to the rotor |
| 06 | Electrical Generation | Mechanical → 3-phase AC |
| 07 | Voltage Transformation | 11 kV → transmission voltage |
| 08 | Power Transmission | Delivery to the grid |
| 09 | Water Discharge | Draft tube and tailrace return |

Controls: `Prev` / `Play` / `Next`, the stage strip along the bottom, and `←` / `→` keys. If you orbit away manually, a **Re-center Stage Camera** button appears. Stage 04 links into the 5-mode Runner inspector, and Stage 09 offers Replay or Open Simulator.

<table>
<tr>
<td width="50%"><img src="docs/screenshots/03-journey-stage-01.png" alt="Stage 01"><br><sub>01 · Water Storage</sub></td>
<td width="50%"><img src="docs/screenshots/03-journey-stage-03.png" alt="Stage 03"><br><sub>03 · Water Conveyance</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/03-journey-stage-04.png" alt="Stage 04"><br><sub>04 · Turbine Conversion</sub></td>
<td width="50%"><img src="docs/screenshots/03-journey-stage-06.png" alt="Stage 06"><br><sub>06 · Electrical Generation</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/03-journey-stage-08.png" alt="Stage 08"><br><sub>08 · Power Transmission</sub></td>
<td width="50%"><img src="docs/screenshots/03-journey-stage-09.png" alt="Stage 09"><br><sub>09 · Water Discharge (completion panel)</sub></td>
</tr>
</table>

---

### 04 · Generation Simulator

One deterministic **Hydroelectric Power Generation Simulator**, computed by the Rust/WASM engine in a Web Worker so the 3D view never stutters.

- **Operating Controls:** `Run` / `Step +1s` / `Reset`, scenario presets **A–F**, sliders with numeric inputs for Net Head, Requested Flow, Guide Vane Opening, Requested Grid Load, and turbine/generator peak efficiency, plus `Operating Curve` vs `Fixed Manual` efficiency and the operating condition (normal, partial load, high load, startup, shutdown).
- **KPI strip:** hydraulic input, shaft mechanical power, electrical generation, grid delivered, torque & speed, cumulative energy.
- **Synchronized 3D cutaway:** guide vane angle, flow particles and rotor speed follow the live result.
- **Charts:** power conversion cascade, Francis efficiency curve with the operating point, available power vs requested load, and a dispatch timeline.

![Simulator running Scenario A](docs/screenshots/04-simulator-running.png)
<sub>Scenario A running for 6.5 s: 44.55 MW generated, 40.00 MW delivered, 89.08 % overall efficiency</sub>

<table>
<tr>
<td width="50%"><img src="docs/screenshots/04-simulator-scenario-b-warning.png" alt="Scenario B warning"><br><sub>Scenario B: <code>INSUFFICIENT_GENERATION_FOR_LOAD</code> warning linked to the affected components</sub></td>
<td width="50%"><img src="docs/screenshots/04-simulator-validation.png" alt="Validation"><br><sub>Out-of-range input (Net Head 180 m) rejected by the WASM validator with an inline alert</sub></td>
</tr>
</table>

---

### 05 · Engineering Insights

Rule-based diagnostics for the current operating point (BEP proximity, loss partitioning, dispatch reserve), an energy-loss chart, and a **Scenario A–E comparison matrix** computed by Rust/WASM. The optional FastAPI panel runs sensitivity sweeps when a backend is configured, and shows a clear offline notice on GitHub Pages.

<table>
<tr>
<td width="50%"><img src="docs/screenshots/05-insights-full.png" alt="Insights"><br><sub>Diagnostics, loss chart and scenario matrix</sub></td>
<td width="50%"><img src="docs/screenshots/05-insights-offline.png" alt="Insights offline"><br><sub>FastAPI sweep on the static site: graceful offline fallback</sub></td>
</tr>
</table>

---

### 06 · Technical Library

A searchable glossary filtered by domain (Hydraulics, Turbomachinery, Electrical, …) with links back to Plant Anatomy, the governing equations in KaTeX, SI unit conversions, the documented synthetic assumptions and limitations, asset credits and IEC / IEEE / USBR references.

<table>
<tr>
<td width="50%"><img src="docs/screenshots/06-library-search.png" alt="Library search"><br><sub>Turbomachinery filter + search for "Francis"</sub></td>
<td width="50%"><details><summary>Full Library page</summary><img src="docs/screenshots/06-library-full.png" alt="Library full page"></details></td>
</tr>
</table>

---

### Mobile layout

Below the desktop breakpoint, the top bar becomes a menu button and Plant Anatomy switches to `Hierarchy` / `3D Plant` / `Inspector` tabs. There is no horizontal overflow at 390 × 844.

<table>
<tr>
<td width="25%"><img src="docs/screenshots/07-mobile-overview.png" alt="Mobile overview"><br><sub>Overview</sub></td>
<td width="25%"><img src="docs/screenshots/07-mobile-anatomy.png" alt="Mobile anatomy"><br><sub>Plant Anatomy</sub></td>
<td width="25%"><img src="docs/screenshots/07-mobile-journey.png" alt="Mobile journey"><br><sub>Energy Journey</sub></td>
<td width="25%"><img src="docs/screenshots/07-mobile-simulator.png" alt="Mobile simulator"><br><sub>Simulator</sub></td>
</tr>
</table>

---

## Reference unit & scenario presets

The illustrative reference unit `denryu-hydro-unit-01`: `85.0 m` net head, `60.0 m³/s` flow, `50.0 MW` mechanical rating, `50 Hz`, `24` salient poles (`250.0 rpm`).

| Preset | Head | Flow | Guide vanes | Load | Electrical gen. | Overall η | What it shows |
|---|---|---|---|---|---|---|---|
| **A: Normal** | 85 m | 60 m³/s | 85 % | 40 MW | 44.55 MW | 89.08 % | Nominal operation near BEP with 4.55 MW spinning reserve |
| **B: Reduced Flow** | 85 m | 32 m³/s | 50 % | 35 MW | 20.99 MW | 78.67 % | Part-load efficiency drop and a generation deficit |
| **C: Reduced Head** | 55 m | 60 m³/s | 85 % | 40 MW | 23.06 MW | 86.86 % | Low reservoir level, output scales with head |
| **D: Degraded Eff.** | 85 m | 60 m³/s | 85 % | 40 MW | 34.42 MW | 68.82 % | Worn runner (η 0.78) and generator (η 0.90) |
| **E: High Load** | 85 m | 60 m³/s | 85 % | 48 MW | 44.55 MW | 89.08 % | Demand above available output, dispatch clamping |
| **F: Fixed Manual** | 85 m | 60 m³/s | 85 % | 45 MW | 44.15 MW | 88.27 % | Fixed η (0.91 / 0.97) for textbook hand-calculation parity |

---

## Physics model

All in SI units (see [SIMULATION_SPEC.md](SIMULATION_SPEC.md)):

| Quantity | Equation |
|---|---|
| Hydraulic power | $P_h = \rho g Q H$ |
| Turbine shaft power | $P_m = \eta_t(Q/Q_{BEP})\, P_h$ (smooth Francis efficiency curve) |
| Synchronous speed | $n_s = 120 f / N_p$ → `250 rpm` at 50 Hz, 24 poles |
| Shaft torque | $T = P_m / \omega$ |
| Electrical power | $P_e = \eta_g P_m$ |
| Delivered power | $P_{grid} = \min(P_e, P_{load})$ with reserve / deficit reporting |

Grid-tied modes lock rotor speed to $n_s$. `startup` ramps speed with the breaker open, and `shutdown` guards against division by zero. The engine raises warnings such as `DEEP_PART_LOAD_CAVITATION_RISK` and `INSUFFICIENT_GENERATION_FOR_LOAD`.

---

## How it works

```mermaid
flowchart LR
  subgraph Browser["Browser (GitHub Pages)"]
    UI["React UI<br/>6 pages · Zustand stores"]
    R3F["Three.js / R3F<br/>36-component plant scene"]
    W["Web Worker"]
    WASM["denryu-engine<br/>Rust → WASM"]
    DATA["Canonical JSON<br/>data/*"]
    UI <--> R3F
    UI -- "postMessage(inputs)" --> W
    W --> WASM
    WASM -- "SimulationResult" --> W
    W -- "result / validation error" --> UI
    DATA --> UI
  end
  API["FastAPI + NumPy<br/>(optional, apps/api)"]
  UI -. "VITE_API_BASE_URL<br/>sweeps & parity" .-> API
```

1. **Canonical data** (`data/`) describes the plant, 36 components, relationships, 9 stages, 6 scenarios and the glossary. The web app, the Rust engine and the API all read from it.
2. **The simulator** posts inputs to a Web Worker, which calls the WASM engine and returns a typed result or a validation error, so the WebGL thread is never blocked.
3. **The 3D scene** is built procedurally in React Three Fiber, one group per component ID. Selection, isolation, explode, section cuts and journey highlighting all drive the same scene.
4. **If WebGL2 is unavailable**, an interactive 2D SVG schematic takes over automatically.

---

## Tech stack

| Layer | Technology |
|---|---|
| Web UI | TypeScript, React 18, Vite 5, Tailwind CSS, Zustand, React Router (hash) |
| 3D | Three.js, React Three Fiber, Drei |
| Charts & math | Recharts, KaTeX |
| Simulation engine | Rust, `wasm-bindgen`, `serde-wasm-bindgen`, `wasm-pack`, Web Worker |
| Optional analytics | Python 3.11+, FastAPI, Pydantic v2, NumPy, Docker |
| Testing | `cargo test`, pytest, Vitest + Testing Library, Playwright |
| Delivery | GitHub Actions → GitHub Pages |

---

## Repository structure

```text
DenRyu/
├── apps/
│   ├── web/                     # React + Three.js app (deployed to GitHub Pages)
│   │   ├── src/
│   │   │   ├── app/             # AppShell, navigation
│   │   │   ├── components/      # UI primitives, WebGL boundary, 2D fallback
│   │   │   ├── components-3d/   # PlantScene, subsystems A–F, flow effects, camera presets
│   │   │   ├── features/        # overview, plant-anatomy, energy-journey, simulator, insights, library
│   │   │   ├── services/        # simulation bridge, analytics client
│   │   │   ├── stores/          # Zustand stores
│   │   │   └── workers/         # simulation.worker.ts (loads the WASM engine)
│   │   ├── e2e/                 # Playwright E2E specs
│   │   └── screenshots/         # README screenshot capture spec
│   └── api/                     # Optional FastAPI analytics service + Dockerfile
├── crates/denryu-engine/        # Rust physics engine (hydraulics, turbine, generator, energy_conversion)
├── data/                        # Canonical plant, component, journey, scenario and glossary JSON
├── docs/screenshots/            # Images used in this README
├── assets/ASSET_LICENSE_LOG.md  # Asset provenance
└── *.md                         # Phase 0 engineering blueprint (PRD, specs, architecture)
```

---

## Getting started

### Prerequisites

- **Node.js 20+** and npm
- **Rust 1.80+** with the `wasm32-unknown-unknown` target and [`wasm-pack`](https://rustwasm.github.io/wasm-pack/)
- **Python 3.11+** (only for the optional API)

### 1 · Build the WASM engine

```bash
rustup target add wasm32-unknown-unknown
npm run build:wasm        # outputs to apps/web/src/wasm/pkg
```

### 2 · Run the web app

```bash
npm --prefix apps/web install
npm run dev               # http://localhost:5173
```

### 3 · Run the API (optional)

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

Then start the web app with `VITE_API_BASE_URL=http://localhost:8000` to unlock the sweep and parity panels on Insights.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_BASE_PATH` | `/` | Public base path. CI sets `/DenRyu/` for GitHub Pages. |
| `VITE_API_BASE_URL` | unset | URL of the optional FastAPI service. |

---

## Testing & CI/CD

```bash
npm run test:rust                                   # Rust engine
cd apps/api && pytest                               # FastAPI
npm run typecheck && npm run lint && npm run test:web
npm --prefix apps/web run test:e2e                  # Playwright (builds + previews /DenRyu/)
```

| Suite | Coverage |
|---|---|
| **Rust** (9 tests) | Scenarios A–E, fixed-manual textbook parity, shutdown / zero-flow guards, synchronous speed invariance, 500-case energy-conservation fuzz test |
| **Python** (6 tests) | Health, plant config, head sensitivity sweep, validation errors, scenario comparison parity, output validation |
| **Web** (17 tests) | Data integrity of all canonical JSON, anatomy tree / inspector, journey stages, simulator store + worker bridge, insights and library |
| **E2E** (7 tests) | All 6 routes with zero console errors, 36-component search, 5-mode Runner, 9 stages, live WASM simulator + validation, offline Insights, WebGL2 fallback, 3D surviving route changes, reduced motion, no overflow at 1440 / 834 / 390 px |

**GitHub Actions** ([`ci-deploy.yml`](.github/workflows/ci-deploy.yml)) runs on every push and PR to `main`: Rust tests → pytest → `wasm-pack` build → typecheck, lint and Vitest → `/DenRyu/` production build → deploy to GitHub Pages (on `main` only).

### Regenerating screenshots

```bash
cd apps/web
SHOTS_BASE_URL=https://orls967.github.io/DenRyu/ npm run screenshots
```

Images are written to `docs/screenshots/`.

---

## Documentation index

| Document | Covers |
|---|---|
| [PRD.md](PRD.md) | Vision, personas, 6-page IA, requirements, acceptance criteria `AC-01`–`AC-20` |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Three-language architecture, Worker/WASM bridge, error boundaries, deployment |
| [DESIGN.md](DESIGN.md) | Dark-lab design tokens, typography, 3D material language, reduced motion, WebGL fallback |
| [PLANT_ANATOMY_SPEC.md](PLANT_ANATOMY_SPEC.md) | Authoritative spec for the 6 subsystems, 36 components and 5 Runner modes |
| [ENERGY_JOURNEY_SPEC.md](ENERGY_JOURNEY_SPEC.md) | The 9 energy-conversion stages, losses and camera choreography |
| [SIMULATION_SPEC.md](SIMULATION_SPEC.md) | Equations, efficiency curves, synchronous speed, scenarios, warnings |
| [DATA_MODEL.md](DATA_MODEL.md) | TypeScript interfaces, Rust Serde mirror, SI units, JSON examples |
| [API_CONTRACT.md](API_CONTRACT.md) | FastAPI `/api/v1` endpoints, error envelope, CORS |
| [ASSET_GUIDELINES.md](ASSET_GUIDELINES.md) | 3D coordinate conventions, component-ID mapping, polygon budgets, licensing |
| [TEST_PLAN.md](TEST_PLAN.md) | Test strategy and engineering reference tolerances |
| [flow.md](flow.md) · [constraints.md](constraints.md) | Implementation roadmap and hard constraints |
| [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) | Phase-by-phase delivery log |

---

## Known limitations

1. **Synthetic physics.** Steady-state and quasi-static equations with smooth synthetic curves. No CFD, no water-hammer transients, no governor dynamics.
2. **Procedural 3D geometry.** The plant is generated in code (extruded profiles, lathe surfaces and parametric blades), not from CAD/GLB models. The dam, runner and powerhouse follow real proportions, but details such as the generator internals and switchyard are simplified, and the powerhouse is an open cut-away.
3. **The hosted demo has no backend.** GitHub Pages serves static files only, so sweeps and parity checks need a local or separately hosted API.
4. **Locale-formatted inputs.** Numeric inputs follow the browser locale (for example `0,92` instead of `0.92`).

---

<div align="center">
<sub>DENRYU: an educational engineering demonstrator. Not for operating or designing real power plants.</sub>
</div>
