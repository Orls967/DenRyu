# TEST_PLAN — Verification, Engineering Validation & QA Strategy

**Project:** DENRYU — Power Plant Anatomy & Energy Systems Explorer  
**Document Version:** 1.0.0  
**Status:** Authoritative Verification Blueprint

---

## 1. Testing Pyramid & Toolchain Overview

| Layer | Test Runner | Scope | Pass Gate |
|---|---|---|---|
| **Rust Engine Unit & Physics** | `cargo test` + `wasm-pack test --headless --chrome` | Equations, efficiency curves, constraints, determinism, Serde JSON parity | `100%` pass; `<= 1e-4` relative tolerance vs. analytical reference |
| **Python Analytics & Validation** | `pytest` + `httpx.AsyncClient` | FastAPI endpoints, Pydantic 422 boundaries, NumPy sensitivity, cross-validation | `100%` pass; `<= 1e-5` parity vs. Rust reference vectors |
| **Frontend Unit & Component** | `vitest` + `@testing-library/react` | Stores, formatters, schema loader, UI controls, Worker message bridge mock | `100%` pass; zero console errors |
| **Data & Asset Integrity** | `vitest` / Node schema script | 36 `componentId`s across `PLANT_ANATOMY_SPEC`, JSON, `manifest.json`, `stages.json` | `0` orphan IDs or broken stage refs |
| **End-to-End (E2E) Browser** | `playwright` | 6 pages, 10 critical user journeys, WebGL fallback, Reduced Motion, responsiveness | `100%` pass on Chromium |

---

## 2. Rust Simulation Engine Tests (`crates/denryu-engine`)

### 2.1 Analytical & Boundary Unit Tests (`cargo test`)
- **Zero-Flow Check:** $Q_{\text{req}} = 0 \implies Q_{\text{actual}} = 0, P_h = 0, P_m = 0, P_e = 0, T = 0$ (no `NaN`).
- **Zero-Head Check:** $H = 0 \implies Q_{\text{avail}} = 0, Q_{\text{actual}} = 0, P_h = 0, P_m = 0, P_e = 0$.
- **Zero-Speed / Shutdown Torque Guard:** `operatingCondition = Shutdown` $\implies \omega = 0, T = 0$ (verifies division-by-zero protection when $\omega < 0.5\ \text{rad/s}$).
- **Fixed-Manual Textbook Parity:** $(H=85, Q=60, \text{GVO}=85\%, \eta_t=0.91, \eta_g=0.97, \text{mode}=\text{FixedManual}) \implies P_h = 50{,}013{,}915\ \text{W}, P_m = 45{,}512{,}662.65\ \text{W}, P_e = 44{,}147{,}282.77\ \text{W}$ within `±1.0 W`.
- **Synchronous Speed Invariance to Load:** Varying `requestedLoadW` from `10 MW` to `48 MW` under `Normal` keeps `rotationalSpeedRpm == 250.0` (at `50 Hz`, `24` poles).
- **Efficiency & Conservation Bounds:** For 500 fuzz combinations inside valid input ranges, verify `0.0 <= turbineEfficiency <= 0.96`, `0.0 <= generatorEfficiency <= 0.99`, and `0.0 <= deliveredElectricalPowerW <= electricalGeneratedPowerW <= turbineMechanicalPowerW <= hydraulicPowerW + 1e-6`.
- **Energy Accumulation & Reset:** Stepping `dt = 1.0 s` for `3600` ticks at constant `P_e = 40.0 MW` accumulates `cumulativeGeneratedEnergyJ = 1.44e11 J` (`40.0 MWh` within `1e-6`); `reset()` returns `0.0`.
- **Determinism:** Two independent `SimulationEngine` instances fed identical sequences yield bit-identical `SimulationOutput` structs.
- **Invalid Input Rejection:** `NaN`, `-Infinity`, `netHeadM = -5.0`, `guideVaneOpeningPct = 110.0`, `turbineEfficiencyRef = 1.2` return explicit `Err(...)`.

### 2.2 Engineering Reference Scenarios (`AC-10`, `AC-11`)

Expected verified target outputs (`rho = 1000.0`, `g = 9.80665`, `operating_curve` mode, tolerance `±0.01 MW` / `±0.001 MN·m` / `±0.0005` eff):

| Test Case | $Q_{\text{act}}$ ($\text{m}^3/\text{s}$) | $\eta_t$ | $\eta_g$ | $P_h$ (MW) | $P_m$ (MW) | $P_e$ (MW) | $P_{\text{del}}$ (MW) | $T$ ($\text{MN}\cdot\text{m}$) | Expected Warnings |
|---|---|---|---|---|---|---|---|---|---|
| **Scenario A (Normal)** | `60.000` | `0.9183` | `0.9700` | `50.014` | `45.928` | `44.552` | `40.000` | `1.754` | `[]` |
| **Scenario B (Reduced Flow)** | `32.000` | `0.8128` | `0.9679` | `26.674` | `21.681` | `20.986` | `20.986` | `0.828` | `INSUFFICIENT_GENERATION_FOR_LOAD` |
| **Scenario C (Reduced Head)** | `49.229` | `0.8963` | `0.9691` | `26.553` | `23.800` | `23.064` | `23.064` | `0.909` | `FLOW_CONSTRAINED_BY_GATE_OR_HEAD`, `INSUFFICIENT_GENERATION_FOR_LOAD` |
| **Scenario D (Degraded Eff)** | `60.000` | `0.7786` | `0.8840` | `50.014` | `38.939` | `34.420` | `34.420` | `1.487` | `INSUFFICIENT_GENERATION_FOR_LOAD` |
| **Scenario E (Load 48 MW)** | `60.000` | `0.9183` | `0.9700` | `50.014` | `45.928` | `44.552` | `44.552` | `1.754` | `INSUFFICIENT_GENERATION_FOR_LOAD` |

---

## 3. Python FastAPI Analytics Tests (`apps/api/tests/`)

- `test_health_endpoint`: `GET /api/v1/health` returns `200` and `"status": "healthy"`.
- `test_sensitivity_head_sweep`: `POST /api/v1/analytics/sensitivity` over `30..115 m` returns exact point count, monotonic `hydraulicPowerW`, and analytical derivative matching central finite difference within `1%`.
- `test_sensitivity_validation_errors`: `minValue >= maxValue` returns `400`; `steps = 500` or `netHeadM = NaN` or `netHeadM = 200.0` returns `422` using standard `ErrorEnvelope`.
- `test_compare_scenarios_parity`: `POST /api/v1/analytics/compare-scenarios` reproduces Scenario A–E expected outputs within `1e-5` relative tolerance vs. Rust vectors.
- `test_validate_output_endpoint`: Detects intentional tampered `electricalGeneratedPowerW > turbineMechanicalPowerW` and returns `parityPassed: false`.

---

## 4. Frontend & Integration Tests (`apps/web`)

1. **Canonical Data Consistency (`dataIntegrity.test.ts`):**
   - Asserts `components.json` contains exactly the `36` canonical `componentId`s across `6` subsystems.
   - Asserts every `fromComponentId` / `toComponentId` in `relationships.json` exists in `components.json`.
   - Asserts `stages.json` contains all `9` stages (`stage-01-water-storage` .. `stage-09-water-discharge`) and every referenced `activeComponentIds` / `highlightedComponentIds` / `transparentShellIds` is valid.
   - Asserts `public/models/manifest.json` maps every one of the `36` `componentId`s.
2. **Worker & WASM Bridge (`simulationBridge.test.ts`):**
   - Verifies Worker initialization, sequential request correlation IDs, rapid slider debounce handling, and clean error reporting if Worker fails to spawn.
3. **UI Components & Accessibility (`*.test.tsx`):**
   - Hierarchy Tree filters & selects all 36 components; Runner selection exposes 5-mode inspection toolbar; Simulator renders inline validation messages on invalid input (`AC-15`); Insights page operates cleanly when `analyticsClient` returns `{ ok: false, reason: 'BACKEND_UNAVAILABLE' }` (`NFR-REL-002`).

---

## 5. End-to-End Playwright Test Suite

### 5.1 Critical 10-Step User Journey (`e2e/core-journey.spec.ts`)
1. Open `/` (`Overview`) → verify 3D canvas mounted, plant configuration summary visible, zero runtime console errors (`AC-01`).
2. Navigate to `/anatomy` → verify all 6 subsystems expandable in left tree (`AC-02`).
3. Select `comp-runner` via tree & search → verify Component Inspector loads all 7 metadata tabs (`AC-03`, `AC-06`).
4. Toggle **Exploded View** (`50%`, `100%`), **Section Cut**, **Isolate**, and **Blade Inspection** → verify state controls update cleanly (`AC-04`, `AC-05`).
5. Navigate to `/journey` → step sequentially from `stage-01-water-storage` to `stage-09-water-discharge` via `Next`, verify stage title, equation card, and active component chips update (`AC-07`, `AC-08`).
6. Navigate to `/simulator` → verify Rust/WASM engine initializes (`AC-09`, `AC-12`) and default Scenario A outputs match `~44.55 MW` (`AC-10`, `AC-11`).
7. Switch to `Scenario B` and adjust `Net Head` slider → verify KPI readouts and Recharts SVG bars recalculate cleanly (`AC-12`).
8. Enter out-of-range numeric input (`Net Head = 180`) → verify field validation error prevents invalid state (`AC-15`).
9. Navigate to `/insights` → verify client-side interpretation text and loss breakdown reflect active simulator state even with backend disabled (`AC-13`, `NFR-REL-002`), and test mocked/live sensitivity sweep (`AC-14`).
10. Navigate to `/library` → search `"Francis"` and `"120f"`, verify glossary & equation cards filter accurately.

### 5.2 Resilience, Fallback & Accessibility E2E (`e2e/resilience.spec.ts`)
- **WebGL Fallback (`AC-17`):** Launch Chromium with `--disable-webgl` (or mock `getContext('webgl2') => null`) → verify `PlantSchematic2DFallback` renders interactive plant diagram and selecting a component opens Inspector cleanly.
- **Reduced Motion (`AC-18`):** Emulate `prefers-reduced-motion: reduce` → verify camera auto-orbit disabled and reduced-motion indicator active.
- **Responsive Viewports (`AC-16`):** Test `1440×900` (desktop), `834×1112` (tablet), and `390×844` (mobile) → assert `document.documentElement.scrollWidth <= window.innerWidth` (zero horizontal overflow).

---

## 6. Measurable Performance Targets (Pre-Implementation Targets)

> **Reporting Rule:** The values below are **design targets to be measured after Phase 7/8 build**, NOT claimed benchmark results.

| Metric | Measurement Method | Target Threshold |
|---|---|---|
| Initial Shell Interactive (TTI) | Lighthouse / Playwright on built `dist/` | `< 2.5 s` (broadband simulated) |
| Initial JS/CSS Bundle Size | Vite build output (`gzip`) | `< 450 KB` (excluding lazy `.glb` & `.wasm`) |
| 3D Viewport Frame Rate | `r3f` / Chrome DevTools FPS trace during orbit + flow | `>= 50 FPS` target (`>= 30 FPS` min floor) |
| Component Selection Response | Click event → Inspector DOM update | `< 50 ms` |
| WASM Simulation Step Round-Trip | `performance.now()` across Worker `postMessage` | `< 20 ms` (`< 2 ms` pure Rust eval) |
| Peak WebGL Heap / JS Heap | Chrome DevTools Memory snapshot after 5 min exploration | `< 350 MB` total browser tab memory |
