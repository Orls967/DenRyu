# SIMULATION_SPEC — Mathematical Engineering Specification

**Project:** DENRYU — Hydroelectric Power Generation Simulator  
**Document Version:** 1.0.0  
**Status:** Authoritative Mathematical & Rust/WASM Specification

> **Scientific Integrity Notice:** The **Hydroelectric Power Generation Simulator** is an educational, deterministic **system-level mathematical model** configured with documented synthetic reference parameters (`denryu-hydro-unit-01`). It is **not** a Computational Fluid Dynamics (CFD) solver, water-hammer Method-of-Characteristics (MOC) solver, or certified engineering design/dispatch tool.

---

## 1. Simulation Objectives

The simulator enables users to manipulate hydraulic, mechanical, efficiency, and grid-load inputs and observe quantitative cause-and-effect across:
1. Hydraulic input power ($P_h$).
2. Turbine mechanical shaft power ($P_m$).
3. Available generated electrical power ($P_e$) vs. grid-delivered electrical power ($P_{\text{delivered}}$).
4. Mechanical shaft torque ($T$).
5. Synchronous vs. transient rotational speed estimate ($n$).
6. Turbine ($\eta_t$), generator ($\eta_g$), and overall ($\eta_{\text{overall}}$) efficiencies under smooth operating-point curves.
7. Available hydraulic discharge vs. user-requested discharge ($Q_{\text{avail}}$ vs. $Q_{\text{req}}$ vs. $Q_{\text{actual}}$).
8. Cumulative electrical energy generation ($E$) over simulation time.
9. Operating boundary constraints, deficits, and diagnostic warnings.

---

## 2. Canonical Internal Unit System (SI)

All computations inside Rust (`crates/denryu-engine`) and cross-layer schemas (`DATA_MODEL.md`) MUST execute strictly in **base SI units** (except `rotationalSpeedRpm` and `guideVaneOpeningPct`, whose units are explicitly named). Unit conversion to `MW`, `kWh`, `MWh`, `MN·m`, or `%` happens strictly at UI display formatting.

| Symbol | Quantity | Canonical Internal Unit | Display Unit(s) |
|---|---|---|---|
| $\rho$ | Water density | $\text{kg/m}^3$ | $\text{kg/m}^3$ |
| $g$ | Gravitational acceleration | $\text{m/s}^2$ | $\text{m/s}^2$ |
| $H$ | Net hydraulic head | $\text{m}$ | $\text{m}$ |
| $Q$ | Volumetric water flow rate | $\text{m}^3/\text{s}$ | $\text{m}^3/\text{s}$ |
| $u_{\text{gv}}$ | Guide vane opening | $\%$ (`0.0..=100.0`) | $\%$ |
| $\eta_t, \eta_g, \eta_{\text{overall}}$ | Conversion efficiencies | Dimensionless (`0.0..=1.0`) | $\%$ (`0.0..=100.0%`) |
| $P_h, P_m, P_e, P_{\text{delivered}}, P_{\text{load}}$ | Power | $\text{W}$ | $\text{MW}$ (or $\text{kW}$) |
| $E$ | Energy | $\text{J}$ | $\text{kWh}$ / $\text{MWh}$ |
| $T$ | Mechanical torque | $\text{N}\cdot\text{m}$ | $\text{MN}\cdot\text{m}$ / $\text{kN}\cdot\text{m}$ |
| $n, n_s$ | Rotational speed | $\text{rpm}$ | $\text{rpm}$ |
| $\omega$ | Angular velocity | $\text{rad/s}$ | $\text{rad/s}$ |
| $f$ | Electrical grid frequency | $\text{Hz}$ | $\text{Hz}$ |
| $\Delta t$ | Simulation timestep | $\text{s}$ | $\text{s}$ |

---

## 3. Reference Plant Parameters & Operating Constraints

These synthetic illustrative defaults parameterize `SimulationConfiguration` for `denryu-hydro-unit-01`:

| Parameter | Symbol | Default Value | Allowed Range / Bounds | Source / Rationale |
|---|---|---|---|---|
| Water density | $\rho$ | `1000.0 kg/m³` | `995.0..=1005.0 kg/m³` | Standard freshwater reference |
| Standard gravity | $g$ | `9.80665 m/s²` | Fixed physical constant | ISO 80000-3 standard |
| Rated net head | $H_{\text{rated}}$ | `85.0 m` | `25.0..=115.0 m` (input `0.0..=130.0 m`) | Medium-head Francis range |
| Minimum operating head | $H_{\min}$ | `25.0 m` | — | Warning below `25.0 m` |
| Maximum rated head | $H_{\max}$ | `115.0 m` | — | Structural/cavitation warning above `115.0 m` |
| Gate flow capacity at $H_{\text{rated}}$ | $Q_{\text{cap,rated}}$ | `72.0 m³/s` | — | Full `100%` wicket gate capacity |
| BEP flow at $H_{\text{rated}}$ | $Q_{\text{bep,rated}}$ | `58.0 m³/s` | — | Synthetic Francis BEP (`~80.6%` gate) |
| Minimum stable flow | $Q_{\min}$ | `12.0 m³/s` | — | Deep part-load vortex-rope warning threshold |
| Maximum input flow | $Q_{\max,\text{input}}$ | `80.0 m³/s` | `0.0..=80.0 m³/s` | Clamped/validated input bound |
| Rated turbine mech. power | $P_{m,\text{rated}}$ | `50.0e6 W` (`50 MW`) | Cap `58.0e6 W` (`58 MW`) | Generator mechanical base rating |
| Max generator electrical power | $P_{e,\max}$ | `55.0e6 W` (`55 MW`) | — | Thermal/MVA ceiling clamp |
| Grid frequency | $f$ | `50.0 Hz` | `50.0` or `60.0 Hz` | Configurable grid standard |
| Generator pole count | $N_p$ | `24` | Even integer `4..=64` | Salient-pole hydro rotor (`n_s = 250 rpm` at `50 Hz`) |
| Nominal turbine peak efficiency | $\eta_{t,\text{ref,default}}$ | `0.92` (`92.0%`) | `0.40..=0.95` | Typical Francis peak (`90–95%`) |
| Nominal generator peak efficiency | $\eta_{g,\text{ref,default}}$ | `0.975` (`97.5%`) | `0.60..=0.99` | Typical hydro generator (`96–98.5%`) |
| Minimum safe angular speed | $\omega_{\min}$ | `0.5 rad/s` | — | Division-by-zero torque guard |

---

## 4. Primary Inputs & Operating Conditions

### 4.1 Continuous Numerical Inputs (`SimulationInput`)
1. `netHeadM` ($H$, m): Effective net head at turbine inlet (`0.0..=130.0 m`; default `85.0`).
2. `requestedFlowRateM3s` ($Q_{\text{req}}$, $\text{m}^3/\text{s}$): Target water flow rate requested by user (`0.0..=80.0 m³/s`; default `60.0`).
3. `guideVaneOpeningPct` ($u_{\text{gv}}$, %): Wicket gate opening (`0.0..=100.0%`; default `85.0`).
4. `turbineEfficiencyRef` ($\eta_{t,\text{ref}}$, `0..1`): Reference peak hydraulic-to-mechanical efficiency capability (default `0.92`).
5. `generatorEfficiencyRef` ($\eta_{g,\text{ref}}$, `0..1`): Reference rated mechanical-to-electrical efficiency capability (default `0.975`).
6. `requestedLoadW` ($P_{\text{load,req}}$, W): Electrical grid demand (`0.0..=70.0e6 W`; default `40.0e6`).

### 4.2 Discrete Modes (`OperatingCondition` & `EfficiencyMode`)
- **`operatingCondition`:**
  - `'normal'`: Grid-synchronized generation near nominal rating.
  - `'partial_load'`: Grid-synchronized operation below `75%` of rated capacity.
  - `'high_load'`: Grid-synchronized operation at elevated load (`>= 85%` rated capacity / high demand).
  - `'startup'`: Unsynchronized speed ramp (`circuit breaker open`); `deliveredElectricalPowerW = 0.0`, `electricalGeneratedPowerW = 0.0`, speed ramps smoothly toward $n_s$ (snapshot default `0.50 * n_s`).
  - `'shutdown'`: Main inlet valve / wicket gates closed; `actualFlowRateM3s = 0.0`, all powers `= 0.0`, speed `= 0.0`, torque `= 0.0`.
- **`efficiencyMode`:**
  - `'operating_curve'` *(Default)*: Computes $\eta_t(Q, H)$ and $\eta_g(P_m)$ dynamically using the documented smooth characteristic curves scaled by $\eta_{t,\text{ref}}$ and $\eta_{g,\text{ref}}$.
  - `'fixed_manual'`: Uses $\eta_{t,\text{ref}}$ and $\eta_{g,\text{ref}}$ directly for transparent hand-verification of textbook equations ($P_e = \rho g Q H \eta_t \eta_g$).

---

## 5. Governing Equations & Modeling Decisions

### 5.1 Hydraulic Gate Capacity & Actual Flow Rate
The wicket gates and available net head impose an explicit hydraulic discharge ceiling:

$$Q_{\text{avail}}(H, u_{\text{gv}}) = Q_{\text{cap,rated}} \cdot \left(\frac{u_{\text{gv}}}{100}\right) \cdot \sqrt{\frac{\max(H, 0)}{H_{\text{rated}}}}$$

In `'shutdown'` mode (or when $u_{\text{gv}} \le 0$ or $H \le 0$), actual flow is identically zero:
$$Q_{\text{actual}} = 0$$

Otherwise:
$$Q_{\text{actual}} = \min\!\big(\max(Q_{\text{req}}, 0),\ Q_{\text{avail}}(H, u_{\text{gv}})\big)$$

**Engineering Rationale:** This explicitly separates **user-requested flow** ($Q_{\text{req}}$) from **actual simulated flow** ($Q_{\text{actual}}$). Closing guide vanes or dropping net head restricts physically achievable discharge, emitting a `FLOW_CONSTRAINED_BY_GATE_OR_HEAD` warning whenever $Q_{\text{req}} > Q_{\text{avail}} + 10^{-3}$.

### 5.2 Hydraulic Input Power
$$P_h = \rho \, g \, Q_{\text{actual}} \, H$$

### 5.3 Francis Turbine Operating-Point Efficiency ($\eta_t$)
First compute head-scaled Best Efficiency Point (BEP) discharge via hydraulic affinity scaling:

$$Q_{\text{bep}}(H) = Q_{\text{bep,rated}} \sqrt{\frac{\max(H, 0)}{H_{\text{rated}}}}$$

Define dimensionless flow ratio $q$ and head ratio $h$ (for $H > 0, Q_{\text{actual}} > 0$):

$$q = \frac{Q_{\text{actual}}}{Q_{\text{bep}}(H)}, \qquad h = \frac{H}{H_{\text{rated}}}$$

In `'operating_curve'` mode, the synthetic Francis efficiency curve combines:
1. **$C^1$-smooth flow-ratio factor $k_q(q)$:** Asymmetric profile reflecting steeper efficiency collapse in deep part-load ($q < 0.65$) due to incidence shock and draft-tube vortex swirl, broad peak at $q = 1.0$, and moderate overload falloff for $q > 1.0$:
   $$k_q(q) = \begin{cases} \max\!\big(0.15,\ 1 - 0.55(1 - q)^2 - 0.35\max(0, 0.65 - q)^2\big), & 0 < q \le 1.0 \\ \max\!\big(0.35,\ 1 - 0.85(q - 1)^2\big), & q > 1.0 \end{cases}$$
2. **No-load / parasitic threshold ramp $s(q)$:** Smoothly sends efficiency to zero at tiny flows where internal circulation & seal losses absorb fluid power:
   $$s(q) = \frac{q^2}{q^2 + 0.03^2}$$
3. **Head-deviation factor $k_h(h)$:** Smooth efficiency penalty as operating head moves away from design head $H_{\text{rated}}$:
   $$k_h(h) = \max\!\big(0.75,\ 1 - 0.18(h - 1)^2\big)$$

Combined turbine efficiency:
$$\eta_t = \begin{cases} 0, & Q_{\text{actual}} \le 0 \text{ or } H \le 0 \\ \text{clamp}\!\big(\eta_{t,\text{ref}} \cdot k_q(q) \cdot s(q) \cdot k_h(h),\ 0,\ 0.96\big), & \text{'operating\_curve'} \\ \text{clamp}\!\big(\eta_{t,\text{ref}},\ 0,\ 0.96\big), & \text{'fixed\_manual'} \end{cases}$$

### 5.4 Turbine Mechanical Power
$$P_m = \min\!\big(P_{m,\max},\ P_h \cdot \eta_t\big)$$
where $P_{m,\max} = 58.0\ \text{MW}$.

### 5.5 Synchronous Speed & Rotational Speed Estimate ($n$)
Because the generator is a salient-pole synchronous machine tied to a large electrical grid:
$$n_s = \frac{120 f}{N_p}$$
With defaults $f = 50.0\ \text{Hz}$ and $N_p = 24$ poles, $n_s = 250.0\ \text{rpm}$.

- **Important Physics Rule:** Varying `requestedLoadW` ($P_{\text{load,req}}$) during synchronized operation (`normal`, `partial_load`, `high_load`) **does NOT alter steady-state rotor speed** ($n = n_s = 250.0\ \text{rpm}$); it alters electromagnetic load torque balance and reserve/deficit margin!
- **Operating-condition speed behavior:**
  - `normal` / `partial_load` / `high_load`: $n = n_s$ (when $Q_{\text{actual}} > 0$; if $Q_{\text{actual}} = 0$ while synchronized is selected, warns `ZERO_FLOW_MOTORING_RISK` and reports $n = n_s$ with $P_m = 0$).
  - `startup`: Unsynchronized speed ramp: snapshot returns $n = 0.50 \, n_s$; time-stepped mode ramps `startupSpeedRpm` from $0 \to n_s$ over `30.0 s` whenever $Q_{\text{actual}} > 0$.
  - `shutdown`: $n = 0.0\ \text{rpm}$.

Angular velocity:
$$\omega = \frac{2\pi n}{60}$$

### 5.6 Mechanical Torque ($T$) — Zero-Speed Protected
$$T = \begin{cases} \dfrac{P_m}{\omega}, & \omega \ge \omega_{\min}\ (0.5\ \text{rad/s}) \\ 0.0, & \omega < \omega_{\min} \end{cases}$$

### 5.7 Generator Efficiency ($\eta_g$) & Electrical Output ($P_e$)
Let mechanical load ratio $\ell = P_m / P_{m,\text{rated}}$ ($P_{m,\text{rated}} = 50.0\ \text{MW}$). In `'operating_curve'` mode, generator losses combine a **40% constant no-load loss** (stator core hysteresis/eddy + windage + bearing friction) and a **60% load-squared $I^2R$ copper loss** referenced to $\eta_{g,\text{ref}}$ at $\ell_{\text{ref}} = 0.85$:

$$\Lambda_{\text{ref}} = 1 - \eta_{g,\text{ref}}$$
$$\eta_g(\ell) = \begin{cases} 0, & P_m \le 0 \text{ or } \text{shutdown} \\ \text{clamp}\!\left(1 - \dfrac{0.40\,\Lambda_{\text{ref}}}{\max(\ell,\ 0.02)} - 0.60\,\Lambda_{\text{ref}}\,\dfrac{\ell}{0.85^2},\ 0.0,\ 0.99\right), & \text{'operating\_curve'} \\ \text{clamp}\!\big(\eta_{g,\text{ref}},\ 0.0,\ 0.99\big), & \text{'fixed\_manual'} \end{cases}$$

Available electrical output power:
$$P_e = \begin{cases} 0, & \text{'shutdown' or 'startup'} \\ \min\!\big(P_{e,\max},\ P_m \cdot \eta_g\big), & \text{synchronized states} \end{cases}$$

Delivered electrical power vs. requested load:
$$P_{\text{delivered}} = \min\!\big(P_e,\ P_{\text{load,req}}\big)$$
$$\Delta P_{\text{deficit}} = \max\!\big(0,\ P_{\text{load,req}} - P_e\big), \qquad \Delta P_{\text{reserve}} = \max\!\big(0,\ P_e - P_{\text{load,req}}\big)$$

Overall plant conversion efficiency (water-to-terminal):
$$\eta_{\text{overall}} = \begin{cases} \dfrac{P_e}{P_h}, & P_h > 0 \text{ and } \text{synchronized} \\ 0, & \text{otherwise} \end{cases}$$

### 5.8 Cumulative Energy Accumulation ($E$)
With deterministic forward Euler accumulation over validated timestep $\Delta t > 0$:
$$E_{\text{gen}}(t + \Delta t) = E_{\text{gen}}(t) + P_e \cdot \Delta t \quad [\text{J}]$$
$$E_{\text{del}}(t + \Delta t) = E_{\text{del}}(t) + P_{\text{delivered}} \cdot \Delta t \quad [\text{J}]$$
Display conversion: $E_{\text{kWh}} = E_{\text{J}} / 3.6 \times 10^6$, $E_{\text{MWh}} = E_{\text{J}} / 3.6 \times 10^9$. Calling `reset()` zeros `elapsedTimeS`, `cumulativeGeneratedEnergyJ`, and `cumulativeDeliveredEnergyJ`.

---

## 6. Reference Scenarios & Verified Numerical Outputs

All five scenarios (matching Section 7 of product concept) are verified numerically from the exact equations above (`rho = 1000.0`, `g = 9.80665`, `operating_curve` mode):

| Scenario | $H$ (m) | $Q_{\text{req}}$ ($\text{m}^3/\text{s}$) | GVO (%) | $\eta_{t,\text{ref}}$ | $\eta_{g,\text{ref}}$ | $P_{\text{load,req}}$ (MW) | Cond. | $Q_{\text{actual}}$ ($\text{m}^3/\text{s}$) | $\eta_t$ (%) | $\eta_g$ (%) | $P_h$ (MW) | $P_m$ (MW) | $P_e$ (MW) | $P_{\text{del}}$ (MW) | $T$ ($\text{MN}\cdot\text{m}$) | $n$ (rpm) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **A: Normal Operation** | `85.0` | `60.0` | `85.0` | `0.92` | `0.975` | `40.0` | `normal` | `60.000` | `91.83%` | `97.00%` | `50.014` | `45.928` | `44.552` | `40.000` | `1.754` | `250.0` |
| **B: Reduced Water Flow** | `85.0` | `32.0` | `50.0` | `0.92` | `0.975` | `35.0` | `partial_load` | `32.000` | `81.28%` | `96.79%` | `26.674` | `21.681` | `20.986` | `20.986` | `0.828` | `250.0` |
| **C: Reduced Head** | `55.0` | `60.0` | `85.0` | `0.92` | `0.975` | `40.0` | `partial_load` | `49.229` | `89.63%` | `96.91%` | `26.553` | `23.800` | `23.064` | `23.064` | `0.909` | `250.0` |
| **D: Efficiency Degradation** | `85.0` | `60.0` | `85.0` | `0.78` | `0.900` | `40.0` | `normal` | `60.000` | `77.86%` | `88.40%` | `50.014` | `38.939` | `34.420` | `34.420` | `1.487` | `250.0` |
| **E: Load Variation (High)** | `85.0` | `60.0` | `85.0` | `0.92` | `0.975` | `48.0` | `high_load` | `60.000` | `91.83%` | `97.00%` | `50.014` | `45.928` | `44.552` | `44.552` | `1.754` | `250.0` |
| **F: Fixed-Manual Verification** | `85.0` | `60.0` | `85.0` | `0.91` | `0.970` | `45.0` | `normal` | `60.000` | `91.00%` | `97.00%` | `50.014` | `45.513` | `44.147` | `44.147` | `1.739` | `250.0` |

*(Tolerance in automated tests: `±1.0e-4` relative tolerance for MW / MN·m / efficiency outputs.)*

---

## 7. Input Validation & Constraint Warnings

### 7.1 Hard Validation Errors (Rejected Before Calculation)
- Non-finite (`NaN`, `±Infinity`) in any field → returns `SimulationError::NonFiniteInput`.
- Negative `netHeadM`, `requestedFlowRateM3s`, `guideVaneOpeningPct`, `requestedLoadW`, or `dtSeconds` → rejected with structured field error.
- `netHeadM > 130.0`, `requestedFlowRateM3s > 80.0`, `guideVaneOpeningPct > 100.0`, `turbineEfficiencyRef` outside `[0.40, 0.95]` (or `[0.0, 0.96]` in tests? Decision: enforce `[0.40, 0.95]` in UI/API and reject `< 0` or `> 1.0` in Rust engine), `generatorEfficiencyRef` outside `[0.60, 0.99]`.

### 7.2 Engineering Constraint Warnings (`SimulationWarning[]`)

| Warning Code | Severity | Trigger Condition | Educational Message |
|---|---|---|---|
| `FLOW_CONSTRAINED_BY_GATE_OR_HEAD` | `warning` | $Q_{\text{req}} > Q_{\text{avail}}(H, u_{\text{gv}}) + 10^{-3}$ | Actual flow is limited to `Q_avail` by current guide vane opening and net head. |
| `LOW_HEAD_OPERATING_LIMIT` | `warning` | $0 < H < 25.0\ \text{m}$ | Net head is below recommended Francis design floor (`25 m`); cavitation and low torque risk. |
| `HIGH_HEAD_STRUCTURAL_LIMIT` | `warning` | $H > 115.0\ \text{m}$ | Net head exceeds nominal reference limit (`115 m`); structural pressure margin reduced. |
| `DEEP_PART_LOAD_CAVITATION_RISK` | `warning` | $0 < Q_{\text{actual}} < 12.0\ \text{m}^3/\text{s}$ or $q < 0.45$ | Deep part-load operation induces draft-tube helical vortex rope, pulsations, and lower efficiency. |
| `INSUFFICIENT_GENERATION_FOR_LOAD` | `error` | Synchronized & $P_{\text{load,req}} > P_e + 10^3\ \text{W}$ | Requested load exceeds available electrical generation; grid deficit of `ΔP` MW occurs. |
| `POWER_CEILING_CLAMPED` | `warning` | Raw $P_m > 58\ \text{MW}$ or raw $P_e > 55\ \text{MW}$ | Output clamped at unit thermal/mechanical nameplate ceiling. |
| `ZERO_FLOW_MOTORING_RISK` | `warning` | Synchronized & $Q_{\text{actual}} \le 10^{-3}$ | Breaker closed with zero water flow risks reverse-power motoring. |
| `STARTUP_UNSYNCHRONIZED` | `info` | `operatingCondition === 'startup'` | Unit ramping speed with breaker open; zero power exported to grid until synchronized. |

---

## 8. Rust/WASM Simulation Engine Architecture

Inside `crates/denryu-engine/src/`:
- **`types.rs`:** `SimulationInput`, `SimulationOutput`, `SimulationWarning`, `OperatingCondition`, `EfficiencyMode`, `SimulationConfig`.
- **`hydraulics/mod.rs`:** `compute_available_flow()`, `compute_actual_flow()`, `compute_hydraulic_power()`.
- **`turbine/mod.rs`:** `compute_bep_flow()`, `compute_turbine_efficiency()`, `compute_mechanical_power()`, `compute_torque()`.
- **`generator/mod.rs`:** `compute_synchronous_speed()`, `compute_generator_efficiency()`, `compute_electrical_outputs()`.
- **`energy_conversion/mod.rs`:** Loss breakdown (`conveyanceContext`, `turbineLossW`, `generatorLossW`) & cumulative energy integrator.
- **`simulation/mod.rs`:** `SimulationEngine` struct maintaining `elapsed_time_s`, `cumulative_generated_energy_j`, `cumulative_delivered_energy_j`, `current_startup_rpm`; exposes deterministic `evaluate_snapshot()` and `step(input, dt_s)` plus `evaluate_efficiency_curve(head_m, eta_t_ref)` (returns 25 sample points `(q_m3s, eta_t)` so Recharts renders the **exact** Rust curve with zero duplicate curve math in TypeScript!).
- **`lib.rs`:** `#[wasm_bindgen]` wrapper accepting/returning JSON-serialized `serde_wasm_bindgen` structs cleanly to `simulation.worker.ts`.

---

## 9. Visualization Requirements

All Generation Simulator charts consume `SimulationOutput` and `EfficiencyCurvePoint[]` directly from Rust/WASM:
1. **Power Conversion Cascade Bar/Waterfall (`Recharts BarChart`):** Displays `P_h` (`#2589D8`) → `P_m` (`#36C5D9`) → `P_e_avail` (`#F5B942`) → `P_delivered` (`#32C786`), explicitly labeling `Turbine Loss` and `Generator Loss`.
2. **Turbine Operating-Point Curve (`Recharts ComposedChart`):** Plots Rust-generated $\eta_t(Q)$ curve at current $H$, highlights the BEP band (`0.85..=1.10 * Q_bep`), and plots a glowing marker dot at active `(Q_actual, eta_t)`.
3. **Available Power vs. Requested Load (`Recharts BarChart`):** Side-by-side comparison with green margin bar or red deficit bar.
4. **Cumulative Energy & Power Timeline (`Recharts AreaChart`):** Rolling `120`-point ring buffer of `elapsedTimeS`, `P_e`, and `cumulativeGeneratedMWh`.

---

## 10. Validation & Dimensional Analysis

1. **Dimensional Consistency:**
   - $[P_h] = [\rho][g][Q][H] = (\text{kg/m}^3)(\text{m/s}^2)(\text{m}^3/\text{s})(\text{m}) = \frac{\text{kg}\cdot\text{m}^2}{\text{s}^3} = \text{W}$.
   - $[T] = [P_m]/[\omega] = \text{W}/(\text{rad/s}) = \text{N}\cdot\text{m}$.
   - $[E] = [P_e][\Delta t] = \text{W}\cdot\text{s} = \text{J}$.
2. **Boundary Conditions:**
   - $Q = 0 \implies P_h = 0, P_m = 0, P_e = 0, T = 0$.
   - $H = 0 \implies Q_{\text{avail}} = 0 \implies P_h = 0, P_m = 0, P_e = 0$.
   - `shutdown` $\implies n = 0, T = 0, P_e = 0$ (no division by zero!).
   - Monotonicity: holding $H, \eta$ fixed while increasing $Q$ within $[0, Q_{\text{avail}}]$ strictly increases $P_h$.
   - Energy conservation: $\eta_t \in [0, 1], \eta_g \in [0, 1] \implies 0 \le P_{\text{delivered}} \le P_e \le P_m \le P_h$.
