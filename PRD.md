# PRD — Product Requirements Document

**Project:** DENRYU  
**Full Title:** DENRYU — Power Plant Anatomy & Energy Systems Explorer  
**Document Version:** 1.0.0  
**Status:** Specification Baseline (Documentation Phase)  
**Authoritative Scope Owner:** Product & Systems Engineering

---

## 1. Product Overview

### 1.1 Product Name & Identity

- **Name:** **DENRYU** (*Denryu*, 電流 — Japanese for *electric current*).
- **Tagline:** *Understand. Explore. Deconstruct. Generate.*
- **Full Product Title:** **DENRYU — Power Plant Anatomy & Energy Systems Explorer**.
- **Domain:** Interactive Engineering Education / Digital Twin Visualization.

### 1.2 Product Vision

DENRYU enables learners, educators, and technical practitioners to inspect, disassemble, and understand a conventional hydroelectric power plant as a coherent physical and mathematical engineering system. Rather than presenting a superficial 3D showcase or a generic utility dashboard, DENRYU operates as an interactive digital engineering laboratory that links 3D mechanical/civil/electrical structures directly to first-principles physics, system relationships, and a deterministic mathematical generation simulator.

### 1.3 Problem Statement

Existing hydroelectric educational materials suffer from three structural gaps:
1. **Disconnected Media:** Textbooks and static diagrams separate civil works, fluid mechanics, turbomachinery, and electrical power engineering into isolated chapters, obscuring how a change in reservoir head or wicket gate angle propagates through the entire energy chain.
2. **Opaque 3D Models:** Conventional web 3D viewers display decorative meshes without deterministic component identity, internal sectional inspection, physical relationships, or engineering specifications.
3. **Oversimplified or Overly Complex Simulators:** Online calculators often multiply fixed numbers without operating-point behavior, while industrial CFD/transient suites require specialized licenses and hide core system-level principles behind solver complexity.

### 1.4 Product Objectives

| Objective ID | Objective | Measurable Outcome |
|---|---|---|
| `OBJ-01` | Deliver a deep single-plant anatomy explorer | All 36 canonical components across 6 subsystems are selectable, isolatable, inspectable in 3D, and linked to standardized engineering specifications. |
| `OBJ-02` | Visualize the full water-to-grid energy conversion chain | A 9-stage guided Energy Journey connects camera transitions, flow animation, component highlights, and energy-form equations seamlessly. |
| `OBJ-03` | Provide one transparent, deterministic generation simulator | A Rust/WASM-powered Hydroelectric Power Generation Simulator evaluates hydraulic, mechanical, and electrical power under documented operating-point curves in `< 16 ms` per step. |
| `OBJ-04` | Bridge simulation outputs to engineering interpretation | Engineering Insights converts live and scenario outputs into loss breakdowns, operating-point diagnostics, and optional Python-backed sensitivity analyses. |
| `OBJ-05` | Maintain complete offline-core capability | All 6 primary pages and the core simulator run purely client-side on static hosting (GitHub Pages) even when the optional Python analytics backend is offline. |

### 1.5 Target Audience & Value Proposition

- **Primary Audience:** Undergraduate and graduate engineering students (civil, mechanical, electrical, energy systems), engineering educators, and technical self-learners.
- **Secondary Audience:** Entry-level power generation engineers, technical museum/science exhibit curators, and software/simulation engineers reviewing system architecture.
- **Value Proposition:** *Don't just show how a power plant looks. Explain how every component works, why it exists, and how the entire system generates electricity.*

### 1.6 Product Positioning

DENRYU sits at the intersection of:
- **Modern Science Museum:** High-clarity, atmospheric visual storytelling that invites curiosity without clutter.
- **Engineering Laboratory:** Rigorous component taxonomy, explicit equations, SI units, and transparent assumptions.
- **Industrial Digital Twin:** Hierarchical assembly navigation, exploded views, sectional cutaways, and synchronized state telemetry.

### 1.7 Core Experience & Locked Decisions

1. **Single-Plant Deep Focus:** Conventional storage hydroelectric power plant with an elevated reservoir, concrete dam, penstock conveyance, vertical-shaft **Francis turbine**, salient-pole synchronous generator, step-up transformer, and switchyard tie.
2. **One Primary Simulator:** Only one simulator exists (`Hydroelectric Power Generation Simulator`), preventing feature dilution.
3. **System-Level Mathematical Model:** Documented analytical and smooth empirical-style synthetic curves—explicitly labeled as educational/synthetic, not CFD or certified design calculations.
4. **Desktop-First, Responsive:** Designed primarily for desktop widescreen engineering exploration (`>= 1280 px`), gracefully adapting down to tablet (`768–1279 px`) and mobile (`< 768 px`) viewports.

---

## 2. User Personas

| Persona | Profile & Knowledge Level | Primary Goals | Key Use Cases | Critical Interactions |
|---|---|---|---|---|
| **P1: Mechanical / Fluid Engineering Student** | Year 2–4 undergrad; understands Bernoulli's equation and basic thermodynamics, learning turbomachinery. | Understand how pressure energy converts into shaft torque in a Francis runner and why draft tubes exist. | Inspect Turbine subsystem in exploded/sectional view; test part-load efficiency drop in simulator. | Blade inspection, sectional cut, water-flow toggle, efficiency curve chart inspection. |
| **P2: Electrical Power Systems Student** | Year 2–4 undergrad; understands Faraday's law and AC phasors, learning synchronous generation and grid tie. | Connect mechanical shaft torque to synchronous speed, excitation, stator winding voltage, and step-up transformation. | Follow Energy Journey stages 05–08; observe synchronous speed lock vs. load demand in simulator. | Generator housing cutaway, load-variation scenario, transformer/grid relationship tracing. |
| **P3: Civil / Hydropower Enthusiast** | General technical literacy; curious about dams, spillways, surge tanks, and water cycles. | Understand the big picture of how dams store potential energy and return water safely downstream. | Start at Overview, walk through full 9-stage Energy Journey, inspect Dam & Conveyance components. | Guided walkthrough playback, camera presets, upstream/downstream relationship navigation. |
| **P4: Engineering Educator / Lecturer** | University instructor or lab TA teaching energy conversion or renewable systems. | Use live 3D cutaway and parameter manipulation during lectures or guided student lab exercises. | Switch presets (`Normal`, `Reduced Flow`, `Reduced Head`, `Efficiency Degradation`, `Load Variation`) and project Insights. | Reset view, isolate component, hide casing, parameter sensitivity comparison, Technical Library glossary lookup. |
| **P5: Technical Reviewer / Systems Architect** | Practicing engineer evaluating technical fidelity, transparency of assumptions, and simulation rigor. | Verify unit consistency, equation traceability, boundary conditions, and engineering caveats. | Cross-check Simulator equations against Technical Library formulas and Python validation outputs. | Inspect Engineering Parameters, Assumptions drawer, Python sensitivity table, synthetic-data disclaimers. |

---

## 3. User Journey

```mermaid
flowchart LR
    J1["1. Overview Landing"] --> J2["2. Understand Plant Scope & Specs"]
    J2 --> J3["3. Enter Plant Anatomy 3D"]
    J3 --> J4["4. Select & Isolate Components"]
    J4 --> J5["5. Inspect Exploded & Section Views"]
    J5 --> J6["6. Follow 9-Stage Energy Journey"]
    J6 --> J7["7. Launch Generation Simulator"]
    J7 --> J8["8. Adjust Hydraulic & Load Parameters"]
    J8 --> J9["9. Inspect Power, Torque & Efficiency"]
    J9 --> J10["10. Analyze Engineering Insights"]
    J10 --> J11["11. Verify Equations in Technical Library"]
```

1. **Enter Overview (`/`):** User views a cinematic real-time 3D scene of the hydroelectric facility with animated water flow and turbine rotation, reads the mission statement and locked plant configuration (`Conventional Hydro / Francis Turbine / Single Unit`), and sees direct entry portals to Plant Anatomy, Energy Journey, and Generation Simulator.
2. **Understand Plant Architecture:** User views key reference metrics (illustrative rated head, flow, output, and 6-subsystem overview) before diving into anatomy.
3. **Explore Plant Anatomy (`/anatomy`):** User enters the 3-pane engineering workspace (Hierarchy Tree left, 3D Viewport center, Component Inspector right, Specifications & Relationships tray bottom).
4. **Select & Disassemble Components:** User clicks a component in 3D or the tree, highlights it, isolates it, toggles exploded assembly or cross-sectional cut, and inspects internal construction (e.g., Runner Blades inside Spiral Casing).
5. **Read Engineering Knowledge:** User reads standardized structured tabs (`Overview`, `Principle`, `Construction`, `Operation`, `System Relations`, `Parameters`, `Failure & Maintenance`).
6. **Follow Energy Journey (`/journey`):** User steps through Stages 01–09 (`Water Storage` to `Water Discharge`), watching synchronized camera moves, cutaway transparency, directional water/torque/current animations, and stage-specific equations.
7. **Open Generation Simulator (`/simulator`):** User opens the interactive simulator paired with the 3D turbine-generator sub-assembly.
8. **Modify Operating Parameters:** User adjusts `Net Head`, `Water Flow Rate`, `Guide Vane Opening`, `Turbine Efficiency`, `Generator Efficiency`, `Electrical Load`, or `Operating Condition` (or triggers Scenarios A–E).
9. **Observe Real-Time Calculations:** Rust/WASM computes updated hydraulic, mechanical, electrical, torque, speed, and cumulative energy metrics and updates live Recharts visualizations and 3D rotation/flow speed.
10. **Review Engineering Insights (`/insights`):** User reads dynamic diagnostic explanations of what just changed (e.g., why efficiency fell at part load or why requested load exceeded available capacity) and optionally runs Python-backed parameter sensitivity sweeps.
11. **Consult Technical Library (`/library`):** User cross-checks glossary definitions, full equations with SI units, operating assumptions, and authoritative IEC/IEEE/USBR references.

---

## 4. Application Information Architecture (Six Primary Pages)

| Page | Route | Primary Purpose | Core Content & Modules |
|---|---|---|---|
| **1. Overview** | `/` | Cinematic introduction and system framing | Hero 3D plant scene with live ambient water/turbine motion; system identity & reference configuration table; 6-subsystem preview cards; primary CTA links to Plant Anatomy and Energy Journey. |
| **2. Plant Anatomy** | `/anatomy` | Primary 3D structural deconstruction laboratory | Left: 6-subsystem, 36-component hierarchy tree + visibility/search filter. Center: Full 3D viewport with Orbit/Pan/Zoom, Exploded View slider, Section Cut plane controls, Isolate/Hide toggles, 3D Labels, Camera Presets, Runner Special Inspection modes. Right: Component Information Inspector. Bottom: Engineering Parameters & Upstream/Downstream Relationship strip. |
| **3. Energy Journey** | `/journey` | Step-by-step energy conversion walkthrough | Stage timeline stepper (Stages 01–09); synchronized 3D viewport with automated camera choreography, cutaway transparency, flow vectors, torque rings, and electromagnetic field/current pulses; stage engineering narrative, active component links, energy-form transition card, Play/Pause/Prev/Next/Replay controls. |
| **4. Generation Simulator** | `/simulator` | Interactive mathematical power generation simulator | Paired 3D Turbine-Generator cutaway view reacting to live speed/flow/load; Parameter Control Deck (`Net Head`, `Flow Rate`, `Guide Vane Opening`, `Turbine Eff.`, `Generator Eff.`, `Electrical Load`, `Operating Condition`, Scenarios A–E); Real-time Telemetry KPIs; Recharts Power Waterfall, Efficiency Operating-Point Curve, Load vs. Available Capacity bar, and Cumulative Energy timeline; Synthetic-Data disclaimer banner. |
| **5. Engineering Insights** | `/insights` | Interpretive analysis & parameter sensitivity | Automated rule-based diagnostic summary derived from active simulator state (client-side always available); Energy Conversion & Loss Breakdown waterfall; Operating-Point Health assessment; Scenario A–E side-by-side comparison; Optional Python/FastAPI Sensitivity Sweep & Engineering Report Generator (with graceful offline notice if API unreachable). |
| **6. Technical Library** | `/library` | Authoritative reference & educational glossary | Searchable Engineering Glossary; Formula & Unit Reference (`P_h`, `P_m`, `P_e`, `n_s`, `T`, `E`, head-loss & curve approximations); Reference Plant Assumptions & Limitations; Bibliography of IEC, IEEE, USBR, USACE, and textbook sources. |

### 4.1 Page Specifications: Inputs, Outputs, Navigation, Loading & Error States

- **Overview (`/`)**
  - *Inputs:* Camera preset or mouse orbit interaction, subsystem quick-select click.
  - *Outputs:* 3D scene render, quick navigation deep-links (`/anatomy?component=comp-runner`).
  - *Loading State:* Skeleton hero overlay + progressive GLB load bar (`0–100%`) with procedural preview fallback.
  - *Error State:* WebGL unsupported/context-lost triggers accessible 2D schematic plant overview fallback (`AC-17`) with full links to Simulator, Insights, and Library.
- **Plant Anatomy (`/anatomy`)**
  - *Inputs:* Query param `?component=<id>`, tree click, 3D raycast click, search query, exploded factor (`0–1`), section axis & offset, Runner inspection mode (`normal`, `exploded`, `cross_section`, `blade_inspection`, `water_flow`).
  - *Outputs:* Highlighted/isolated 3D mesh, smooth camera framing, 7-section standardized component brief, clickable upstream/downstream component chips.
  - *Loading/Error:* Asset manifest validation error displays component procedural proxy with warning badge; missing metadata ID falls back to safe error card without crashing viewport.
- **Energy Journey (`/journey`)**
  - *Inputs:* Query param `?stage=<id>`, Play/Pause, Next, Previous, Replay, Stage selector, Manual Override toggle (allows free orbiting without losing stage text).
  - *Outputs:* Stage camera animation, dynamic casing opacity, directional flow particles, stage equation & loss callout.
  - *Loading/Error:* Reduced-motion preference (`prefers-reduced-motion: reduce`) disables smooth flying transitions and switches to instant camera snaps and static directional arrows (`AC-18`).
- **Generation Simulator (`/simulator`)**
  - *Inputs:* Continuous sliders/numeric inputs (`H`, `Q_req`, `guideVaneOpeningPct`, `turbinePeakEff`, `generatorPeakEff`, `electricalLoadW`), `efficiencyMode`, `operatingCondition`, `scenarioPreset`, `timeControl` (`play`, `pause`, `step`, `reset`).
  - *Outputs:* `SimulationOutput` struct from Rust/WASM Web Worker, chart updates, 3D animation speed/flow rate, active constraint/warning banners.
  - *Loading/Error:* WASM Worker initialization state (`Initializing simulation engine...`); if WASM fails to load, displays explicit diagnostic banner and prevents stale/fabricated metrics from appearing; invalid numerical inputs are clamped/rejected with field-level validation messages (`AC-15`).
- **Engineering Insights (`/insights`)**
  - *Inputs:* Active `SimulationInput` + `SimulationOutput` from client store; optional sweep axis & step count for Python sensitivity request; scenario selection for comparison.
  - *Outputs:* Client-side diagnostic prose & energy loss waterfall (zero backend dependency); optional Python-computed sensitivity chart & JSON/Markdown report export.
  - *Loading/Error:* If Python FastAPI backend is offline or times out (`> 5000 ms`), core Insights remain 100% functional using local Rust/TS state while the "Advanced Sensitivity Analytics (Backend)" panel displays an explicit `Offline / Optional Service Unavailable` badge without blocking the UI.
- **Technical Library (`/library`)**
  - *Inputs:* Category filter (`Hydraulics`, `Turbomachinery`, `Electrical`, `Standards`), search string.
  - *Outputs:* Filtered glossary cards, KaTeX/formatted equations, verified references, unit conversion table.
  - *Loading/Error:* Static JSON/Markdown data bundled with frontend; if optional `/api/v1/references` is reachable, enriches metadata; otherwise uses bundled canonical dataset.

---

## 5. Functional Requirements

### 5.1 Overview & Navigation (`FR-NAV`)
- `FR-NAV-001`: The application SHALL provide persistent top-level navigation across all 6 primary pages (`Overview`, `Plant Anatomy`, `Energy Journey`, `Generation Simulator`, `Engineering Insights`, `Technical Library`) with active-route indication and mobile drawer collapse.
- `FR-NAV-002`: Deep links between pages SHALL preserve context via URL query parameters (e.g., clicking a component in Energy Journey opens `/anatomy?component=comp-runner`; clicking "Analyze in Insights" transfers current simulator state via store).
- `FR-NAV-003`: Overview SHALL display the complete hydroelectric facility in an interactive 3D hero canvas with camera orbit boundaries, plant configuration summary, and subsystem entry cards.

### 5.2 Plant Anatomy (`FR-ANAT`)
- `FR-ANAT-001`: Plant Anatomy SHALL present a hierarchical tree of all 6 subsystems and 36 canonical components defined in `PLANT_ANATOMY_SPEC.md`, synchronized bidirectionally with 3D mesh selection.
- `FR-ANAT-002`: Users SHALL be able to orbit, pan, zoom, reset camera, and select predefined camera presets (`Full Plant`, `Dam & Intake`, `Water Conveyance`, `Turbine Pit`, `Generator Hall`, `Switchyard`, `Tailrace`).
- `FR-ANAT-003`: Clicking or hovering any selectable 3D component mesh SHALL resolve to a deterministic `componentId` and highlight the corresponding mesh and tree node.
- `FR-ANAT-004`: Users SHALL be able to **Isolate** a selected component or subsystem (dimming or hiding all unrelated geometry) and **Hide/Show** individual assemblies.
- `FR-ANAT-005`: Users SHALL be able to scrub an **Exploded Assembly** control (`0%` to `100%`), smoothly translating subsystem/component meshes along documented engineering disassembly axes.
- `FR-ANAT-006`: Users SHALL be able to toggle a **Section Cut** clipping plane across selectable axes (`X`, `Y`, `Z`) with offset scrubbing to inspect internal assemblies (such as runner inside spiral casing, rotor inside stator).
- `FR-ANAT-007`: Users SHALL be able to toggle floating 3D **Component Labels** (with clutter-aware visibility limited to active subsystem or zoomed focus).
- `FR-ANAT-008`: Selecting any component SHALL populate the Component Inspector with the 7 standardized educational sections (`Overview`, `Engineering Principle`, `Construction`, `Operation`, `System Relationships`, `Engineering Parameters`, `Failure & Maintenance`).
- `FR-ANAT-009`: Selecting the Francis Runner (`comp-runner` or `comp-runner-blades`) SHALL expose a dedicated 5-mode inspection toolbar: `Normal Assembly`, `Exploded View`, `Cross-Sectional View`, `Blade Inspection`, and `Water-Flow Visualization`.
- `FR-ANAT-010`: Upstream and downstream relationship links inside the inspector SHALL be clickable to navigate focus directly to adjacent physical components.

### 5.3 Energy Journey (`FR-JOUR`)
- `FR-JOUR-001`: Energy Journey SHALL implement all 9 sequential stages defined in `ENERGY_JOURNEY_SPEC.md` (`stage-01-water-storage` through `stage-09-water-discharge`).
- `FR-JOUR-002`: Selecting or advancing to a stage SHALL trigger synchronized camera framing, highlight active `componentIds`, adjust enveloping casing transparency where specified, and run stage-consistent flow/rotation/electrical indicators.
- `FR-JOUR-003`: Users SHALL have `Play`, `Pause`, `Next Stage`, `Previous Stage`, `Replay`, and direct stage-pill selection controls.
- `FR-JOUR-004`: Users SHALL be able to manually orbit/zoom during any stage without losing the stage narrative, with a one-click `Re-center Stage Camera` button.
- `FR-JOUR-005`: Each stage SHALL display its energy transformation type (e.g., Gravitational Potential → Hydraulic Pressure/Kinetic → Shaft Mechanical → 3-Phase Electrical), active losses, and governing equations.

### 5.4 Generation Simulator (`FR-SIM`)
- `FR-SIM-001`: The Generation Simulator SHALL expose controls for `Net Head (H)`, `Water Flow Rate (Q_req)`, `Guide Vane Opening (%)`, `Turbine Reference Efficiency`, `Generator Reference Efficiency`, `Electrical Load Demand`, `Efficiency Model Mode`, and `Operating Condition`.
- `FR-SIM-002`: All core hydraulic, mechanical, electrical, torque, rotational speed, efficiency, and energy-accumulation computations SHALL execute deterministically inside the Rust/WASM simulation module running in a Web Worker.
- `FR-SIM-003`: Changing any valid parameter SHALL recalculate and update outputs within one UI frame budget (`< 50 ms` round-trip including Worker messaging) and update the paired 3D turbine-generator visualization (water stream density/velocity, wicket gate opening angle, rotor/runner rotation state).
- `FR-SIM-004`: The simulator SHALL provide one-click scenario presets matching Section 7 of the specification: `Scenario A: Normal Operation`, `Scenario B: Reduced Water Flow`, `Scenario C: Reduced Head`, `Scenario D: Efficiency Degradation`, and `Scenario E: Load Variation`, plus a `Reset to Reference Defaults` action.
- `FR-SIM-005`: The simulator SHALL display real-time charts using actual Rust/WASM outputs: Power Conversion Cascade (`P_h`, `P_m`, `P_e_avail`, `P_delivered`), Turbine Efficiency Operating-Point Curve showing current `(Q/Q_BEP, eta_t)`, Available Power vs. Requested Load comparison, and Cumulative Energy (`kWh` / `MWh`) over simulation time.
- `FR-SIM-006`: Out-of-range inputs, non-finite numbers, and invalid operating combinations SHALL be validated before calculation and surfaced with clear engineering constraint warnings (`SimulationWarning[]`), never silently producing `NaN` or negative power.
- `FR-SIM-007`: All simulator readouts and charts SHALL display an unambiguous badge/caption stating that values are from an illustrative system-level synthetic model, not validated physical plant telemetry.

### 5.5 Engineering Insights & Technical Library (`FR-INS`, `FR-LIB`)
- `FR-INS-001`: Engineering Insights SHALL automatically generate human-readable engineering interpretations explaining how the active simulator parameters caused current efficiency, losses, torque, and load balance outcomes—completely client-side without backend reliance.
- `FR-INS-002`: Engineering Insights SHALL display energy loss breakdown (conveyance/gate context, turbine hydraulic/mechanical losses, generator electrical/mechanical losses) and compare active state against the Baseline Reference (`Scenario A`).
- `FR-INS-003`: When the optional Python/FastAPI backend is configured and reachable, Engineering Insights SHALL allow users to request multi-point parameter sensitivity sweeps (`H`, `Q`, or `Guide Vane Opening` sweeps), scenario batch comparison matrices, and structured engineering report exports.
- `FR-LIB-001`: Technical Library SHALL provide a searchable glossary of all hydro, mechanical, and electrical terms, full equations with SI units and variable definitions, model boundary assumptions, and verified engineering references.

---

## 6. Non-Functional Requirements

| ID | Category | Requirement | Target / Verification Criterion |
|---|---|---|---|
| `NFR-PERF-001` | 3D Rendering Performance | Maintain interactive frame rate during orbit, explode, and Energy Journey animation on mid-range desktop GPU/integrated graphics. | `>= 50 FPS` target (`>= 30 FPS` minimum floor) at `1920x1080` with pixel ratio capped at `2.0`. |
| `NFR-PERF-002` | Initial Load Performance | Fast time-to-interactive for initial bundle before lazy 3D detail assets complete. | Initial JS/CSS gzipped payload `< 450 KB` (excluding lazy GLB/WASM chunks); initial app shell interactive `< 2.5 s` on broadband. |
| `NFR-PERF-003` | Simulation Latency | Rust/WASM step evaluation latency inside Web Worker. | `< 2 ms` per single simulation tick; `< 20 ms` end-to-end UI update latency. |
| `NFR-A11Y-001` | Accessibility | Full keyboard navigation for all UI controls, hierarchy trees, tabs, and simulator sliders; ARIA labels and contrast compliance. | WCAG 2.1 AA contrast (`>= 4.5:1` body text); 100% non-3D UI operable via keyboard; `Tab`/`Arrow` support in tree & stage stepper. |
| `NFR-A11Y-002` | Reduced Motion | Respect OS/browser `prefers-reduced-motion` and provide explicit in-app Reduced Motion toggle (`AC-18`). | Disables continuous camera flying, suppresses pulsing particle motion, uses crisp state transitions. |
| `NFR-REL-001` | Graceful Fallback | Provide non-WebGL fallback when WebGL2 is unavailable or context is lost (`AC-17`). | Interactive 2D SVG/schematic plant diagram + full component inspector + full Simulator, Insights, and Library remain usable. |
| `NFR-REL-002` | Offline Backend Tolerance | Core application and simulator run if Python FastAPI backend is unavailable or unconfigured. | `0` uncaught exceptions when `VITE_API_BASE_URL` is unset or returns network failure; optional analytics panel gracefully degrades. |
| `NFR-RESP-001` | Responsiveness | Support desktop (`>= 1280 px`), tablet (`768–1279 px`), and mobile (`360–767 px`) without horizontal overflow (`AC-16`). | Layout adapts from 3-pane desktop lab to stacked/drawer panels on smaller screens; `0` clipped controls. |
| `NFR-MAINT-001` | Determinism & Traceability | Single source of truth for component IDs, stage IDs, equations, and units. | Schema validation passes across TypeScript JSON data, Rust structs, and Pydantic models. |
| `NFR-SEC-001` | Security & Static Hosting | Safe static frontend deployment on GitHub Pages and hardened CORS/input limits on Python API. | Zero secrets in frontend build; strict Pydantic payload limits; CORS allow-list restricted to configured origins. |
| `NFR-COMP-001` | Browser Compatibility | Modern evergreen desktop & mobile browsers supporting ES2022, WebGL2, and WebAssembly. | Verified on latest Chrome, Firefox, Safari, and Edge. |

---

## 7. Scope and Non-Scope

### 7.1 In Scope (Locked)
- Conventional storage hydroelectric power plant (single generating unit).
- Vertical-shaft **Francis turbine** + salient-pole **synchronous generator** + step-up transformer + switchyard.
- 6 pages: Overview, Plant Anatomy, Energy Journey, Generation Simulator, Engineering Insights, Technical Library.
- 36 canonical physical components across 6 subsystems with deterministic 3D selection, explode, section cut, isolate, hide/show, and 5 Runner inspection modes.
- 9-stage Energy Journey synchronized with 3D visualization.
- 1 primary simulator (`Hydroelectric Power Generation Simulator`) in Rust/WASM + Web Worker.
- Optional Python/FastAPI backend for sensitivity sweeps, scenario comparisons, cross-validation, and report generation.

### 7.2 Explicitly Out of Scope
- Other plant types: solar PV/CSP, nuclear, coal-fired thermal, wind farms, pumped-storage hydro, run-of-river bulb/Kaplan/Pelton plants (except brief conceptual comparison inside Runner educational copy).
- Multi-unit or multi-plant dispatch and wide-area power grid load-flow / OPF simulation.
- Industrial CFD (Navier-Stokes mesh simulation), finite-element structural analysis (FEA), or real-time water-hammer MOC transient pipe simulation.
- Real-time SCADA integration, OPC-UA/Modbus telemetry, PLC/governor hardware-in-the-loop (HIL) control, or certified engineering design/safety calculations.
- User authentication, user-generated accounts, or persistent multi-tenant databases.

---

## 8. Acceptance Criteria Traceability Matrix

Every product-level acceptance criterion maps to concrete specifications and test verification:

| AC ID | Criterion | Authoritative Spec | Verification Method (in `TEST_PLAN.md`) |
|---|---|---|---|
| `AC-01` | Landing page renders 3D plant cleanly | `DESIGN.md`, `ASSET_GUIDELINES.md` | E2E render check + FPS/mesh load test |
| `AC-02` | All 6 main subsystems explorable | `PLANT_ANATOMY_SPEC.md` | E2E subsystem tree & camera preset sweep |
| `AC-03` | All 36 individual components selectable | `PLANT_ANATOMY_SPEC.md`, `DATA_MODEL.md` | Unit mapping test + E2E selection audit |
| `AC-04` | Exploded view translates assemblies accurately | `PLANT_ANATOMY_SPEC.md`, `ASSET_GUIDELINES.md` | Component bounding-box delta assertion + E2E |
| `AC-05` | Sectional view enables internal inspection | `DESIGN.md`, `ASSET_GUIDELINES.md` | Clipping plane state + E2E visual toggle test |
| `AC-06` | Component metadata linked deterministically to 3D objects | `DATA_MODEL.md`, `ASSET_GUIDELINES.md` | Static asset-to-JSON integrity test |
| `AC-07` | Energy Journey explains 9 conversion stages | `ENERGY_JOURNEY_SPEC.md` | Content schema check + E2E stage traversal |
| `AC-08` | Journey animations match stage physics | `ENERGY_JOURNEY_SPEC.md` | Stage controller unit & state-machine test |
| `AC-09` | Simulator accepts & validates all inputs | `SIMULATION_SPEC.md` | Rust & TS input validation unit tests |
| `AC-10` | Hydraulic power calculation matches $P_h = \rho g Q H$ | `SIMULATION_SPEC.md` | Rust analytical verification vs. independent calc |
| `AC-11` | Turbine & generator outputs match governing formulas | `SIMULATION_SPEC.md` | Reference scenario test vectors (A–E) |
| `AC-12` | Simulator results update in real time | `ARCHITECTURE.md`, `SIMULATION_SPEC.md` | Worker round-trip latency & React chart sync test |
| `AC-13` | Python analytics ingests & analyzes simulation data | `API_CONTRACT.md` | FastAPI Pytest contract & physics cross-check |
| `AC-14` | Parameter sensitivity analysis functions end-to-end | `API_CONTRACT.md`, `PRD.md` | Pytest sensitivity sweep + UI integration test |
| `AC-15` | Invalid parameters & errors handled gracefully | `SIMULATION_SPEC.md`, `API_CONTRACT.md` | Boundary fuzz test + HTTP 422 / UI warning test |
| `AC-16` | UI responsive across desktop, tablet, mobile | `DESIGN.md` | Playwright multi-viewport layout tests |
| `AC-17` | WebGL fallback renders usable alternative | `DESIGN.md`, `ARCHITECTURE.md` | Playwright WebGL-disabled simulation test |
| `AC-18` | Reduced-motion support disables aggressive motion | `DESIGN.md` | Playwright `emulateMedia({ reducedMotion: 'reduce' })` |
| `AC-19` | Build & automated test suites pass | `TEST_PLAN.md` | `npm test`, `cargo test`, `pytest`, `npm run build` |
| `AC-20` | Deployment verified for GitHub Pages & container API | `ARCHITECTURE.md`, `TEST_PLAN.md` | Base-path preview smoke test + container `/health` |
