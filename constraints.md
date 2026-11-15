# constraints.md — Project Boundaries, Engineering Rules & Agent Guardrails

**Project:** DENRYU — Power Plant Anatomy & Energy Systems Explorer  
**Document Version:** 1.0.0  
**Status:** Mandatory Hard Constraints for All Implementation & Review Phases

---

## 1. Product Constraints

1. **Single-Plant Scope Lock:** DENRYU models **only** a conventional storage-reservoir hydroelectric power plant with a single vertical-shaft **Francis turbine** generating unit.
2. **Primary Experience Focus:** Interactive 3D component exploration (`Plant Anatomy`) and guided process storytelling (`Energy Journey`) are the primary user experiences; simulation exists to prove and reinforce those physical concepts.
3. **One Primary Simulator Only:** Exactly one simulator (`Hydroelectric Power Generation Simulator`) is permitted. Do NOT introduce auxiliary mini-simulators (e.g., separate electrical grid dispatchers, reservoir hydrology planners, or dam structural FEA apps).
4. **Educational Purpose:** Every chart, equation, and component brief must explain engineering principles transparently without pretending to be an industrial control suite.

---

## 2. Simulation & Scientific Constraints

1. **System-Level Mathematical Model Only:** Use explicit algebraic equations and smooth $C^1$ synthetic operating-point curves documented in `SIMULATION_SPEC.md`.
2. **No CFD / FEA / MOC Transients:** Do NOT implement Navier-Stokes mesh solvers, 3D turbulence CFD, structural finite-element modeling, or Method-of-Characteristics (MOC) elastic water-hammer PDEs.
3. **Transparent Synthetic Data:** All nominal parameters (`85 m` head, `60 m³/s` flow, `50 MW` rating, `24` poles, `50 Hz`) and efficiency curves MUST be explicitly labeled in UI and outputs (`isSyntheticEducationalModel: true`) as illustrative educational values, never as validated manufacturer or real-station telemetry.
4. **No Unphysical Simplifications:**
   - Do NOT let electrical load demand change steady-state synchronous rotor speed arbitrarily while synchronized to the grid ($n = n_s = 120f/N_p$).
   - Do NOT pretend 100% energy conversion or hide turbine/generator efficiency variation across operating points.
   - Do NOT allow zero-speed division-by-zero in torque ($T = P_m / \omega$).
5. **Bounded Operating Conditions:** Reject `NaN`/`Infinity` and out-of-range inputs (`netHeadM` in `[0, 130]`, `requestedFlowRateM3s` in `[0, 80]`, `guideVaneOpeningPct` in `[0, 100]`, `turbineEfficiencyRef` in `[0.40, 0.95]`, `generatorEfficiencyRef` in `[0.60, 0.99]`) cleanly with structured errors/warnings.

---

## 3. Technical & Architectural Constraints

1. **Strict 3-Language Boundary:**
   - **TypeScript / React / Three.js:** UI, routing, 3D visualization, camera control, local diagnostic prose, chart rendering. **Zero core simulator physics formulas allowed in TypeScript.**
   - **Rust / WASM (via Web Worker):** Single source of truth for real-time simulator calculations (`hydraulics`, `turbine`, `generator`, `energy_conversion`).
   - **Python / FastAPI:** Optional higher-order analytics (`sensitivity`, `compare-scenarios`, `validate-output`). Do NOT duplicate single-step browser simulation behind mandatory API calls.
2. **Offline-Core Independence:** All 6 pages and the Generation Simulator MUST function 100% cleanly when the Python backend is offline, unconfigured, or unreachable.
3. **No Premature Abstraction:** Build strictly the directories and abstractions needed for the current phase; do NOT create empty speculative frameworks, ORMs, auth layers, or database engines.

---

## 4. 3D Asset & Rendering Constraints

1. **Deterministic `componentId` Binding:** Every interactive 3D mesh MUST map deterministically to one of the `36` canonical `componentId`s via glTF `extras.componentId` + `public/models/manifest.json`.
2. **Coordinate System & Units:** Right-handed `+Y` Up, `1 unit = 1 meter`, turbine shaft centerline on `(X=0, Z=0)`.
3. **Honest Geometry Sourcing:** When custom Blender/CAD `.glb` models are unavailable, use cleanly engineered procedural Three.js geometry and document it transparently in `ASSET_GUIDELINES.md`; never claim primitive placeholders are industrial CAD assemblies.
4. **Licensing Integrity:** Use only verified `CC0`, `CC-BY 4.0` (attributed), `MIT`, `Apache 2.0`, or original assets logged in `assets/ASSET_LICENSE_LOG.md`. Never use non-commercial (`CC-BY-NC`) or unlicensed scraped assets.
5. **Performance & Fallbacks:** Cap desktop triangle budgets (`<= 180k`), cap `devicePixelRatio <= 2`, support `prefers-reduced-motion: reduce` (`AC-18`), and provide `PlantSchematic2DFallback` when WebGL2 is unavailable (`AC-17`).

---

## 5. Data & Unit Constraints

1. **Internal SI Units Everywhere:** Base SI units (`m`, `m³/s`, `W`, `J`, `N·m`, `rad/s`, `kg/m³`, `s`, `Hz`, dimensionless ratios `0..1`) across Rust, Worker payloads, and FastAPI requests/responses (with explicitly named `Rpm` and `Pct` fields where standard).
2. **Single Source of Truth:** `PLANT_ANATOMY_SPEC.md` is authoritative for the 36 components; `ENERGY_JOURNEY_SPEC.md` is authoritative for the 9 stages; `SIMULATION_SPEC.md` is authoritative for equations.
3. **JSON Field Convention:** `camelCase` across TypeScript, `serde_wasm_bindgen`, and Pydantic v2 JSON payloads.

---

## 6. Deployment & Repository Constraints

1. **GitHub Pages Base-Path Safety:** Use `VITE_BASE_PATH` in `vite.config.ts`, `HashRouter` for client routing, `import.meta.env.BASE_URL` for public `.glb` models, and `new URL(..., import.meta.url)` for Worker/WASM assets.
2. **No Secrets in Frontend:** Never embed private tokens, API keys, or internal host credentials in `apps/web` or `VITE_*` variables.
3. **Explicit CORS Allow-List:** FastAPI `ALLOWED_ORIGINS` MUST explicitly whitelist configured frontend origins (`GitHub Pages` + local dev), never wildcard `*` with credentials.
4. **Workspace Isolation:** Never inspect, edit, delete, or commit inside sibling projects (such as `AoKira` or any other folder outside `/Users/orl123456/Documents/DenRyu`). Never run `git push` without explicit user permission.

---

## 7. Explicitly Out-of-Scope (Prohibited Features)

- Solar PV/CSP, nuclear, coal-fired, wind turbine, pumped-storage, Pelton, or Kaplan multi-plant simulators.
- Multi-plant regional electrical grid dispatch, OPF, or AC transient stability solvers.
- Real-time industrial SCADA/OPC-UA/Modbus connectivity or hardware-in-the-loop PLC interfaces.
- Certified structural/civil dam safety or regulatory licensing calculation claims.
- User accounts, login screens, backend databases, or multi-tenant billing/admin panels.
