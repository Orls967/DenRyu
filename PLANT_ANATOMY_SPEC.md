# PLANT_ANATOMY_SPEC — Physical Plant Anatomy & Component Engineering Specification

**Project:** DENRYU — Power Plant Anatomy & Energy Systems Explorer  
**Document Version:** 1.0.0  
**Status:** Authoritative Canonical Reference for Subsystems & Components

> **Single Source of Truth Rule:** All subsystem IDs (`sub-*`), component IDs (`comp-*`), component definitions, engineering explanations, and upstream/downstream relationships across Plant Anatomy, Energy Journey, Overview, and `data/component-metadata/` MUST match this specification verbatim.

---

## 1. Plant System Overview

DENRYU models a **conventional storage-type hydroelectric power plant** arranged as a **single generating unit** powered by a **vertical-shaft Francis reaction turbine** coupled directly to a **vertical salient-pole synchronous generator**.

### 1.1 Reference Configuration Context (Synthetic & Educational)
- **Plant Type:** Conventional storage reservoir hydroelectric facility (medium-head class).
- **Hydraulic Arrangement:** Elevated impoundment reservoir behind a concrete gravity/arch-gravity dam → low-pressure headrace/pressure tunnel → surge tank → steel penstock → main inlet valve → spiral casing → Francis turbine → draft tube → tailrace.
- **Electromechanical Arrangement:** Vertical main shaft coupling the Francis runner directly to a 24-pole salient-pole synchronous generator (`50 Hz` nominal, `250 rpm` synchronous speed), connected via generator busbar and circuit breaker to a three-phase generator step-up (GSU) transformer, outdoor switchyard, transmission line, and electrical grid.
- **Note on Design Variability:** Real Francis turbine installations vary widely in head (`~40 m` to `> 600 m`), unit rating (`< 10 MW` to `> 800 MW`), horizontal vs. vertical shaft orientation, powerhouse placement (surface vs. underground cavern), and surge protection geometry. Throughout this specification, **general engineering principles** are explicitly distinguished from **plant-dependent values** and **DENRYU illustrative reference defaults** (`85 m` nominal net head, `60 m³/s` nominal flow, `~44–45 MW` class unit).

---

## 2. Canonical Subsystem & Component Hierarchy

| Subsystem ID | Subsystem Name | Components (36 Canonical IDs) |
|---|---|---|
| `sub-reservoir-dam` | **A. Reservoir & Dam** | `comp-reservoir`, `comp-dam`, `comp-water-intake`, `comp-trash-rack`, `comp-intake-gate`, `comp-spillway` |
| `sub-water-conveyance` | **B. Water Conveyance** | `comp-headrace`, `comp-pressure-tunnel`, `comp-surge-tank`, `comp-penstock`, `comp-main-inlet-valve` |
| `sub-turbine` | **C. Turbine** | `comp-spiral-casing`, `comp-stay-vanes`, `comp-guide-vanes`, `comp-runner`, `comp-runner-blades`, `comp-main-shaft`, `comp-draft-tube` |
| `sub-generator` | **D. Generator** | `comp-rotor`, `comp-stator`, `comp-field-winding`, `comp-stator-winding`, `comp-excitation-system`, `comp-bearings`, `comp-cooling-system`, `comp-generator-housing` |
| `sub-electrical-transmission` | **E. Electrical Transmission** | `comp-generator-terminal`, `comp-busbar`, `comp-circuit-breaker`, `comp-step-up-transformer`, `comp-switchyard`, `comp-transmission-line`, `comp-electrical-grid` |
| `sub-discharge` | **F. Discharge** | `comp-draft-tube-outlet`, `comp-tailrace`, `comp-downstream-channel` |

---

## 3. Component Relationships (Physical Flow vs. Energy Flow)

```mermaid
flowchart LR
    subgraph SubA["A. Reservoir & Dam"]
        RES["comp-reservoir"] --> INT["comp-water-intake"]
        DAM["comp-dam"] -. "Impounds" .-> RES
        DAM --- SPL["comp-spillway"]
        TRK["comp-trash-rack"] --> INT
        INT --> IGT["comp-intake-gate"]
    end

    subgraph SubB["B. Water Conveyance"]
        IGT --> HDR["comp-headrace"]
        HDR --> PTN["comp-pressure-tunnel"]
        PTN --> SRG["comp-surge-tank"]
        PTN --> PEN["comp-penstock"]
        PEN --> MIV["comp-main-inlet-valve"]
    end

    subgraph SubC["C. Turbine"]
        MIV --> SPC["comp-spiral-casing"]
        SPC --> STV["comp-stay-vanes"]
        STV --> GVN["comp-guide-vanes"]
        GVN --> RUN["comp-runner"]
        RBL["comp-runner-blades"] -. "Sub-part of" .-> RUN
        RUN --> DRT["comp-draft-tube"]
        RUN ==>|"Shaft Torque"| SHF["comp-main-shaft"]
    end

    subgraph SubD["D. Generator"]
        SHF ==>|"Mechanical Power"| ROT["comp-rotor"]
        BRG["comp-bearings"] -. "Supports" .-> SHF
        EXC["comp-excitation-system"] --> FWD["comp-field-winding"]
        FWD -. "Mounted on" .-> ROT
        ROT -. "Magnetic Flux"| SWD["comp-stator-winding"]
        SWD -. "Housed in" .-> STA["comp-stator"]
        HSG["comp-generator-housing"] -. "Encloses" .-> STA
        COL["comp-cooling-system"] -. "Cools" .-> STA
    end

    subgraph SubE["E. Electrical Transmission"]
        SWD ==>|"3-Phase AC"| TRM["comp-generator-terminal"]
        TRM ==> BUS["comp-busbar"]
        BUS ==> BRK["comp-circuit-breaker"]
        BRK ==> XFR["comp-step-up-transformer"]
        XFR ==> SWY["comp-switchyard"]
        SWY ==> TML["comp-transmission-line"]
        TML ==> GRD["comp-electrical-grid"]
    end

    subgraph SubF["F. Discharge"]
        DRT --> DTO["comp-draft-tube-outlet"]
        DTO --> TLR["comp-tailrace"]
        TLR --> DWN["comp-downstream-channel"]
        SPL --> DWN
    end
```

**Distinction Between Physical Connectivity and Energy Transfer:**
- **Hydraulic Mass Flow Path (`→`):** Water passes sequentially from `comp-reservoir` through conveyance and turbine passages to `comp-downstream-channel` without being consumed (mass conservation: $\dot{m}_{\text{in}} = \dot{m}_{\text{out}}$ in steady state). Flood bypass leaves via `comp-spillway` directly to `comp-downstream-channel`.
- **Mechanical & Electromagnetic Transfer (`⇒`):** At `comp-runner`, hydraulic fluid energy transfers into shaft torque along `comp-main-shaft` → `comp-rotor`; electromagnetic induction transfers energy across the air gap from `comp-field-winding` to `comp-stator-winding` (no water enters Subsystem D or E).

---

## 4. Component Inspection Experience Specification

Users explore every component through unified Plant Anatomy interactions (`FR-ANAT-001` through `FR-ANAT-010`):
1. **Select:** Left-click in 3D or click in Hierarchy Tree highlights the mesh (`#36C5D9` rim), focuses camera smoothly if auto-frame is active, and opens the 7-tab standardized brief (`Overview`, `Principle`, `Construction`, `Operation`, `Relations`, `Parameters`, `Failure & Maintenance`).
2. **Highlight & Connected Context:** Selecting a component mildly highlights direct upstream (`#2589D8`) and downstream (`#F5B942`) neighbors on hover of relationship chips.
3. **Isolate & Hide/Show:** Isolating dims non-selected assemblies (`opacity: 0.08`) or hides them; individual eye toggles control visibility per subsystem or component.
4. **Exploded View & Section Cut:** Global explode slider (`0–100%`) shifts covers, housing, rotor, spiral casing halves, and runner subassemblies along defined assembly axes; X/Y/Z clipping planes slice structural enclosures.
5. **Special Francis Runner 5-Mode Inspection (`comp-runner` & `comp-runner-blades`):**
   - *Mode 1 — Normal Assembly:* Runner seated inside stay ring, guide vanes, and spiral casing.
   - *Mode 2 — Exploded View:* Translates head cover up, spiral casing outward, guide vane ring upward, and runner down/out for clear clearance visualization.
   - *Mode 3 — Cross-Sectional View:* Half-section clipping plane bisects spiral casing, stay vanes, wicket gates, runner crown/band, and draft tube cone simultaneously.
   - *Mode 4 — Blade Inspection:* Isolates `comp-runner` + `comp-runner-blades`, orbits closely to showcase the double-curved 3D mixed-flow blade profile (radial inflow at leading edge transitioning to axial discharge at trailing edge).
   - *Mode 5 — Water-Flow Visualization:* Renders casing semi-transparent (`opacity: 0.22`) and animates streamline ribbons showing tangential spiral swirl → radial wicket-gate acceleration → helical energy transfer across blades → axial draft-tube exit swirl.

---

## 5. Detailed Component Specifications (Subsystems A & B)

### Subsystem A: Reservoir & Dam (`sub-reservoir-dam`)

#### A.1 `comp-reservoir` — Reservoir
1. **Component ID:** `comp-reservoir`
2. **Official Name:** Reservoir
3. **Alternative Names:** Impoundment, Headwater Pool, Forebay Storage
4. **Parent Subsystem:** `sub-reservoir-dam`
5. **Physical Location:** Upstream basin behind the dam crest, extending to the watershed valley limits.
6. **Purpose:** Store river inflow and maintain an elevated water surface (headwater elevation) creating gravitational potential energy and regulating seasonal/diurnal flow variability.
7. **Engineering Principle:** Gravitational potential energy per unit volume $E_{\text{pot}}/V = \rho g \Delta z$ and hydrostatic pressure head relative to tailwater elevation ($H_{\text{gross}} = Z_{\text{headwater}} - Z_{\text{tailwater}}$).
8. **Construction and Materials:** Natural valley topography bounded by engineered shoreline stabilization, upstream riprap protection, bathymetric silt basin, and reinforced concrete dam face.
9. **Operating Mechanism:** Inflow from upstream tributaries fills the storage volume between Minimum Operating Level (MOL) and Full Supply Level (FSL); withdrawal through the intake lowers stored volume according to hydrological balance ($\Delta V/\Delta t = Q_{\text{in}} - Q_{\text{turbine}} - Q_{\text{spill}} - Q_{\text{evap}}$).
10. **Upstream Relationship:** Fed by natural river watershed inflows (external boundary to DENRYU plant scope).
11. **Downstream Relationship:** Feeds `comp-water-intake` (`comp-trash-rack`) during normal generation and `comp-spillway` during flood bypass; structurally retained by `comp-dam`.
12. **Important Engineering Parameters:** Headwater elevation ($Z_{\text{hw}}$, plant-dependent; DENRYU illustrative reference `~485 m` ASL yielding `90 m` gross head above tailwater), active storage volume (plant-dependent, $10^7–10^{10}\ \text{m}^3$), water density $\rho \approx 1000\ \text{kg/m}^3$.
13. **Typical Operating Considerations:** Drawdown affects available gross head ($H_{\text{gross}}$) and downstream turbine efficiency; thermal stratification and dissolved oxygen gradients near deep intakes.
14. **Potential Failure Modes:** Reservoir sedimentation reducing live storage; shoreline slope instability/landslides causing impulse waves; eutrophication or floating debris accumulation.
15. **Maintenance Considerations:** Periodic bathymetric silt surveys, debris skimming, water quality monitoring, and watershed inflow gauging.
16. **3D Representation Requirements:** Translucent blue water volume (`#2589D8`, `opacity: 0.58`) with subtle surface normal ripples matching headwater elevation; bounded by terrain cutaway walls.
17. **User Interaction Behavior:** Selectable water body showing elevation datum marker and head potential callout; links directly to Stage 01 (`stage-01-water-storage`).
18. **Related Energy Journey Stages:** `stage-01-water-storage`
19. **Related Simulation Variables:** `netHeadM` (contextual contributor to gross head), `hydraulicPowerW`.
20. **Educational Explanation:** *General principle:* Water does not generate electricity simply by moving fast horizontally—elevation difference above the turbine creates usable hydraulic head. *Simplified representation:* DENRYU visualizes a cutaway upstream reservoir slice and parameterizes effective head directly as `Net Head (H)` in the simulator rather than simulating multi-year reservoir hydrology.

#### A.2 `comp-dam` — Dam
1. **Component ID:** `comp-dam`
2. **Official Name:** Dam
3. **Alternative Names:** Concrete Gravity Dam, Impounding Structure
4. **Parent Subsystem:** `sub-reservoir-dam`
5. **Physical Location:** Across the river gorge between the reservoir and downstream valley.
6. **Purpose:** Safely impound reservoir water, resist hydrostatic, uplift, and seismic forces, and provide structural integration for the intake and spillway.
7. **Engineering Principle:** Static equilibrium against overturning and sliding ($F_{\text{hydrostatic}} = \frac{1}{2} \rho g h^2 L$); concrete gravity section transfers horizontal water thrust downward into bedrock foundation via self-weight and friction/shear keys.
8. **Construction and Materials:** Mass concrete or roller-compacted concrete (RCC) in stepped monolith blocks with vertical waterstops, internal inspection/drainage galleries, foundation grout curtain, and relief drains.
9. **Operating Mechanism:** Passive civil structure continuously balancing fluctuating hydrostatic thrust, pore uplift pressure along the foundation interface, and thermal expansion/contraction across monolith joints.
10. **Upstream Relationship:** Retains `comp-reservoir` along its sloped or vertical upstream face.
11. **Downstream Relationship:** Houses `comp-water-intake` and `comp-spillway`; shields powerhouse and `comp-tailrace` below.
12. **Important Engineering Parameters:** Structural height (plant-dependent; illustrative `105 m`), crest length (plant-dependent), factor of safety against sliding/overturning (governed by USBR/USACE dam safety standards).
13. **Typical Operating Considerations:** Monitoring foundation uplift pressure, seepage flow rates in drainage galleries, and piezometric levels during high-pool events.
14. **Potential Failure Modes:** Excessive foundation uplift reducing shear resistance; alkali-silica reaction (ASR) concrete swelling; monolith joint waterstop leakage; overtopping during extreme probable maximum flood (PMF).
15. **Maintenance Considerations:** Continuous instrumentation telemetry (pendulums, piezometers, weirs), concrete crack grouting, gallery drain cleaning, and periodic dam safety inspections.
16. **3D Representation Requirements:** Matte concrete monolith geometry (`#6D7680`) with visible spillway bays, upstream battered face, crest roadway/parapet, and internal cutaway support for intake conduit.
17. **User Interaction Behavior:** Clicking isolates structural concrete shell; Section Cut reveals embedded intake throat and penstock transition.
18. **Related Energy Journey Stages:** `stage-01-water-storage`
19. **Related Simulation Variables:** Indirect structural enabler of `netHeadM`.
20. **Educational Explanation:** *General principle:* The dam creates the vertical elevation drop required for high head while absorbing millions of kilonewtons of horizontal water thrust. *Plant-specific note:* DENRYU depicts a concrete gravity dam; other real sites use arch dams, buttress dams, or earth/rockfill embankments depending on valley geology.

#### A.3 `comp-water-intake` — Water Intake
1. **Component ID:** `comp-water-intake`
2. **Official Name:** Water Intake
3. **Alternative Names:** Power Intake, Intake Tower, Bellmouth Intake
4. **Parent Subsystem:** `sub-reservoir-dam`
5. **Physical Location:** Submerged on the upstream face of the dam or adjacent abutment below Minimum Operating Level.
6. **Purpose:** Draw water smoothly from the reservoir into the conveyance conduit with minimal hydraulic entrance loss, zero air-entraining vortices, and controlled shutoff capability.
7. **Engineering Principle:** Streamlined bellmouth contraction minimizes flow separation and entrance loss ($h_e = K_e \frac{v^2}{2g}$, typically $K_e \approx 0.04–0.10$); adequate submergence depth ($S > S_{\text{critical}}$) prevents surface air-core vortex formation.
8. **Construction and Materials:** Reinforced concrete bellmouth piers, curved transition throat, embedded steel gate slots, stoplog guides, and air-vent shaft downstream of the gate slot.
9. **Operating Mechanism:** Hydrostatic pressure drives water past the trash rack and bellmouth into the headrace/pressure tunnel whenever the intake gate is open and downstream turbine demand exists.
10. **Upstream Relationship:** Receives submerged water from `comp-reservoir` through `comp-trash-rack`.
11. **Downstream Relationship:** Directs flow past `comp-intake-gate` into `comp-headrace` / `comp-pressure-tunnel`.
12. **Important Engineering Parameters:** Design intake velocity (`~1.5–3.0 m/s` typical at trash rack/throat, plant-dependent), submergence depth above crown, entrance loss coefficient $K_e$.
13. **Typical Operating Considerations:** Avoid low-submergence operation that draws air pockets into the penstock (causing slug flow and pressure surges).
14. **Potential Failure Modes:** Air-entraining vortex ingestion; concrete cavitation or erosion at sharp gate slot edges; submerged silt blockage during low reservoir levels.
15. **Maintenance Considerations:** Underwater ROV/diver inspection of concrete bellmouth surfaces, air vent clearing, and stoplog seal inspection.
16. **3D Representation Requirements:** Flared concrete intake structure positioned on the dam's upstream submerged face with recessed vertical gate slot frame.
17. **User Interaction Behavior:** Selecting focuses submerged intake view; water transparency lets user inspect flow convergence into the throat.
18. **Related Energy Journey Stages:** `stage-02-water-intake`
19. **Related Simulation Variables:** `actualFlowRateM3s`, `requestedFlowRateM3s`.
20. **Educational Explanation:** *General principle:* Accelerating stationary reservoir water smoothly into a pressurized pipe requires a curved bellmouth—sharp square entrances cause turbulence and permanent energy loss before water even enters the tunnel.

#### A.4 `comp-trash-rack` — Trash Rack
1. **Component ID:** `comp-trash-rack`
2. **Official Name:** Trash Rack
3. **Alternative Names:** Intake Screen, Debris Bar Screen
4. **Parent Subsystem:** `sub-reservoir-dam`
5. **Physical Location:** Outer upstream entrance plane of `comp-water-intake`.
6. **Purpose:** Intercept logs, ice, rocks, aquatic vegetation, and solid debris before water enters the hydraulic conveyance and Francis runner passages.
7. **Engineering Principle:** Mechanical bar-screen filtration sized with low approach velocity ($v_{\text{approach}} \le 1.0–1.5\ \text{m/s}$) and streamlined bar profiles to limit differential head loss ($\Delta h_{\text{rack}} = K_{\text{bar}} (t/b)^{4/3} (v^2/2g) \sin\alpha$, Kirschmer's formula).
8. **Construction and Materials:** Galvanized or stainless structural steel flat/teardrop bars welded to horizontal support frames seated in concrete intake guides, often paired with mechanical trash-rack rakes.
9. **Operating Mechanism:** Stationary barrier; differential head sensors upstream and downstream monitor clogging buildup and trigger raking cycles.
10. **Upstream Relationship:** Interfaces directly with `comp-reservoir` water inflow.
11. **Downstream Relationship:** Protects `comp-water-intake`, `comp-intake-gate`, and all downstream `sub-turbine` passages (especially narrow wicket gates and runner blade channels).
12. **Important Engineering Parameters:** Clear bar spacing (plant-dependent, typically `50–150 mm` for medium-head Francis units), clean head loss (`< 0.1–0.3 m`), allowable differential clogging limit (`~1.0–2.0 m`).
13. **Typical Operating Considerations:** Heavy storm inflows can rapidly load racks with leaves/wood; excessive differential pressure can buckle bars if uncleaned.
14. **Potential Failure Modes:** Structural collapse under severe debris blockage; flow-induced bar vibration (vortex shedding) causing weld fatigue; corrosion pitting.
15. **Maintenance Considerations:** Automated or crane-mounted trash raking, differential pressure instrument calibration, periodic underwater coating/weld inspection.
16. **3D Representation Requirements:** Instanced array of vertical steel grating bars mounted cleanly across the intake mouth (`#4E5E6E`).
17. **User Interaction Behavior:** Exploded view slides rack forward into reservoir space; tooltip explains why Francis runners cannot tolerate solid debris.
18. **Related Energy Journey Stages:** `stage-02-water-intake`
19. **Related Simulation Variables:** Indirectly preserves unobstructed `actualFlowRateM3s` and protects `netHeadM` from blockage loss.
20. **Educational Explanation:** *General principle:* A single submerged log passing through high-velocity penstock water can jam guide vanes or fracture curved Francis runner blades; trash racks safeguard the entire plant while keeping velocity low enough to minimize head loss.

#### A.5 `comp-intake-gate` — Intake Gate
1. **Component ID:** `comp-intake-gate`
2. **Official Name:** Intake Gate
3. **Alternative Names:** Head Gate, Emergency Guard Gate, Roller Gate
4. **Parent Subsystem:** `sub-reservoir-dam`
5. **Physical Location:** Vertical gate shaft immediately downstream of the intake bellmouth inside the dam or intake tower.
6. **Purpose:** Isolate the headrace tunnel and penstock from the reservoir for dewatering, maintenance, and emergency overspeed/pipe-rupture closure.
7. **Engineering Principle:** Vertical rectangular steel leaf guided on low-friction rollers or slide bearings, actuated by hydraulic hoists or wire-rope winches; seals under full hydrostatic reservoir pressure against embedded steel frames.
8. **Construction and Materials:** Welded structural carbon steel skin plate and horizontal box girders, stainless-steel sealing seats, elastomeric J-seals, hydraulic cylinder hoist at deck level, and bypass filling valve.
9. **Operating Mechanism:** Normally held fully raised out of the flow path during generation. Before opening against an empty penstock, a small bypass valve floods the conduit to equalize hydrostatic pressure across the gate leaf; in emergency closure, gravity + hydraulic thrust drives closure against flowing water.
10. **Upstream Relationship:** Downstream of `comp-water-intake` and `comp-trash-rack`.
11. **Downstream Relationship:** Controls admission of water into `comp-headrace` / `comp-pressure-tunnel`.
12. **Important Engineering Parameters:** Design hydrostatic pressure head, closure time (plant-dependent, emergency shutoff typically `30–120 s`), hoist lifting capacity.
13. **Typical Operating Considerations:** Never crack-open an un-equalized gate under high head (risk of seal tearing and cavitation); ensure downstream air-vent pipe remains open during draining to avoid vacuum collapse of the conduit.
14. **Potential Failure Modes:** Damaged elastomer seals causing leakage; gate jamming in debris-fouled slots; hydraulic hoist cylinder leakage; failure to seat during emergency shutdown.
15. **Maintenance Considerations:** Periodic stroke testing, seal replacement during planned outages, hydraulic fluid sampling, and slot guide lubrication.
16. **3D Representation Requirements:** Rectangular steel gate leaf suspended inside a visible vertical concrete gate slot, with upper hoist pedestal on the dam crest.
17. **User Interaction Behavior:** Selecting highlights gate leaf and hoist; Exploded view raises leaf vertically out of slot for inspection.
18. **Related Energy Journey Stages:** `stage-02-water-intake`
19. **Related Simulation Variables:** Acts as upstream binary isolation boundary (`OperatingCondition !== 'shutdown'`).
20. **Educational Explanation:** *General principle:* Unlike `comp-guide-vanes` (which throttle flow continuously during generation), the intake gate is an upstream isolation safety barrier—always wide open in normal operation and closed only for emergency shutoff or conduit inspection.

#### A.6 `comp-spillway` — Spillway
1. **Component ID:** `comp-spillway`
2. **Official Name:** Spillway
3. **Alternative Names:** Flood Release Structure, Ogee Crest Spillway, Radial Gate Spillway
4. **Parent Subsystem:** `sub-reservoir-dam`
5. **Physical Location:** Integrated across the central or flank crest bays of `comp-dam`, discharging down a concrete chute into the river below.
6. **Purpose:** Safely pass excess floodwaters around the powerhouse when reservoir inflow exceeds storage capacity and turbine discharge, preventing dam overtopping.
7. **Engineering Principle:** Controlled weir hydraulics ($Q_{\text{spill}} = C_d L H_s^{3/2}$ for free crest flow, or submerged orifice flow under radial tainter gates) paired with an ogee profile matching the lower nappe of a free-falling jet to avoid negative pressure cavitation, ending in a hydraulic-jump stilling basin to dissipate kinetic energy safely.
8. **Construction and Materials:** High-strength abrasion-resistant concrete ogee crest and chute, training walls, radial steel tainter gates (or gated crest piers), and concrete baffle blocks / flip bucket / stilling basin at the toe.
9. **Operating Mechanism:** Radial gates lift incrementally in balanced bay sequences during flood events to release excess water while maintaining safe reservoir water level.
10. **Upstream Relationship:** Draws surplus surface water directly from `comp-reservoir`.
11. **Downstream Relationship:** Discharges dissipated flood flow into `comp-downstream-channel` (bypassing turbine and generator).
12. **Important Engineering Parameters:** Probable Maximum Flood (PMF) discharge capacity (plant-dependent), crest elevation, gate width/height, stilling basin tailwater conjugate depth.
13. **Typical Operating Considerations:** Symmetric gate opening prevents asymmetric cross-currents and riverbed scour in the downstream channel; spilled water represents bypassed potential energy that produces zero electricity.
14. **Potential Failure Modes:** Chute concrete cavitation/erosion at surface irregularities; radial gate trunnion friction corrosion; downstream toe scour undermining the stilling basin.
15. **Maintenance Considerations:** Post-flood chute and stilling basin inspections, gate trunnion lubrication, hoist wire/cylinder inspection, concrete surface repair.
16. **3D Representation Requirements:** Concrete gated spillway bays + stepped/ogee chute + energy-dissipating apron at dam toe with optional translucent overflow sheet during high-inflow preview.
17. **User Interaction Behavior:** Tooltip contrasts spilled energy vs. turbined energy; clickable downstream connection jumps to `comp-downstream-channel`.
18. **Related Energy Journey Stages:** Bypass branch referenced in `stage-01-water-storage` and `stage-09-water-discharge` (not part of the active generation path).
19. **Related Simulation Variables:** Explains excess reservoir water bypass outside `actualFlowRateM3s`.
20. **Educational Explanation:** *General principle:* A spillway protects structural survival of the dam during floods by safely converting massive gravitational potential energy into harmless turbulence inside a stilling basin instead of letting water overtop the dam crest.

---

### Subsystem B: Water Conveyance (`sub-water-conveyance`)

#### B.1 `comp-headrace` — Headrace
1. **Component ID:** `comp-headrace`
2. **Official Name:** Headrace
3. **Alternative Names:** Headrace Conduit, Intake Conduit, Approach Conduit
4. **Parent Subsystem:** `sub-water-conveyance`
5. **Physical Location:** Immediately downstream of `comp-intake-gate`, leading water away from the dam intake toward the pressure tunnel / hillside conveyance.
6. **Purpose:** Convey low-pressure water from the intake structure toward the high-gradient pressure tunnel with minimum friction loss.
7. **Engineering Principle:** Incompressible closed-conduit or covered-channel steady flow governed by continuity ($Q = A v$) and Darcy-Weisbach head loss ($h_f = f \frac{L}{D} \frac{v^2}{2g}$).
8. **Construction and Materials:** Reinforced concrete box or circular conduit with smooth troweled interior finish to minimize Manning/Darcy friction roughness.
9. **Operating Mechanism:** Operates full under moderate reservoir static pressure head; transitions smoothly into the rock-bored or buried pressure tunnel.
10. **Upstream Relationship:** Receives regulated intake water from `comp-intake-gate`.
11. **Downstream Relationship:** Feeds `comp-pressure-tunnel`.
12. **Important Engineering Parameters:** Internal diameter/area (plant-dependent; illustrative `~4.8 m` equivalent diameter yielding `~3.3 m/s` at `60 m³/s`), design velocity (`2.5–4.0 m/s`), roughness height.
13. **Typical Operating Considerations:** Keep velocity moderate so friction losses remain small relative to total head; ensure slow filling during commissioning to purge air pockets.
14. **Potential Failure Modes:** Concrete joint leakage, longitudinal cracking under internal pressure surges, internal biofilm/silt roughness buildup increasing friction loss.
15. **Maintenance Considerations:** Dewatered internal visual walkdown during major multi-year outages, joint sealant renewal.
16. **3D Representation Requirements:** Cutaway concrete conduit segment linking the dam intake base to the tunnel portal (`#5A6570`).
17. **User Interaction Behavior:** Section cut reveals internal translucent water stream moving toward pressure tunnel.
18. **Related Energy Journey Stages:** `stage-03-water-conveyance`
19. **Related Simulation Variables:** `actualFlowRateM3s`, upstream boundary of `netHeadM`.
20. **Educational Explanation:** *Plant-specific note:* In compact dam-toe powerhouses, the intake connects almost directly to a short embedded penstock; in longer terrain layouts (modeled here for full educational clarity), a headrace and pressure tunnel carry water horizontally before the steep penstock drop.

#### B.2 `comp-pressure-tunnel` — Pressure Tunnel
1. **Component ID:** `comp-pressure-tunnel`
2. **Official Name:** Pressure Tunnel
3. **Alternative Names:** Headrace Pressure Tunnel, Rock-Bored Power Tunnel
4. **Parent Subsystem:** `sub-water-conveyance`
5. **Physical Location:** Underground/hillside conduit connecting the headrace to the surge tank base and top of the steep penstock.
6. **Purpose:** Transport pressurized water horizontally through terrain toward the powerhouse drop while withstanding internal hydrostatic pressure and transient surges.
7. **Engineering Principle:** Pressurized conduit flow governed by Bernoulli's equation with Darcy-Weisbach friction loss ($H_{\text{total}} = z + \frac{p}{\rho g} + \frac{v^2}{2g}$); surrounding rock mass and concrete/steel liner share internal hoop tension.
8. **Construction and Materials:** Excavated rock tunnel lined with reinforced concrete (or steel lining near low-cover zones and bifurcations) with contact/consolidation grouting into rock.
9. **Operating Mechanism:** Continuously pressurized column of water transferring fluid mass toward the penstock; elastic water inertia in this long conduit is precisely why a surge tank is required downstream.
10. **Upstream Relationship:** Fed by `comp-headrace`.
11. **Downstream Relationship:** Junctions directly beneath `comp-surge-tank` and transitions into `comp-penstock`.
12. **Important Engineering Parameters:** Length & diameter (plant-dependent; illustrative `~4.5 m` diameter), internal design pressure, rock-cover ratio, friction factor $f$.
13. **Typical Operating Considerations:** Rapid turbine gate closure decelerates the entire tunnel water column ($\Delta p = \rho a \Delta v$ Joukowsky limit if unprotected), producing high transient pressures unless relieved at the surge tank.
14. **Potential Failure Modes:** Unlined rockfall/spalling; concrete liner longitudinal cracking causing external groundwater exfiltration; unvented air accumulation at high points.
15. **Maintenance Considerations:** Periodic dewatered tunnel inspection, rock-trap cleanout upstream of penstock transition, seepage monitoring.
16. **3D Representation Requirements:** Cylindrical tunnel segment embedded in cutaway terrain plinth (`#3D4752`) showing pressurized blue flow core.
17. **User Interaction Behavior:** Clicking highlights entire underground alignment and emphasizes hydraulic inertia connection to `comp-surge-tank`.
18. **Related Energy Journey Stages:** `stage-03-water-conveyance`
19. **Related Simulation Variables:** `actualFlowRateM3s`, `netHeadM` (gross head minus conveyance losses).
20. **Educational Explanation:** *General principle:* Water traveling at `~3–4 m/s` inside a long pressure tunnel carries immense momentum—thousands of metric tons of moving mass that cannot stop instantaneously without severe pressure spikes.

#### B.3 `comp-surge-tank` — Surge Tank
1. **Component ID:** `comp-surge-tank`
2. **Official Name:** Surge Tank
3. **Alternative Names:** Surge Shaft, Surge Chamber, Pressure-Relief Standpipe
4. **Parent Subsystem:** `sub-water-conveyance`
5. **Physical Location:** Vertical cylindrical shaft rising near the junction between `comp-pressure-tunnel` and `comp-penstock`.
6. **Purpose:** Protect the pressure tunnel and penstock from destructive water-hammer pressure surges during rapid turbine load rejection or startup, and supply rapid transient water volume during load acceptance.
7. **Engineering Principle:** Mass oscillation and pressure-wave reflection. When `comp-guide-vanes` close quickly, moving water in the pressure tunnel diverts upward into the open-surface surge tank, converting kinetic energy into temporary potential elevation ($\Delta z_{\text{surge}}$) and reflecting negative pressure waves back rather than hammering the upstream tunnel; governed by Thoma stability criterion ($A_{\text{st}} > A_{\text{Thoma}}$) for damped oscillations.
8. **Construction and Materials:** Vertical reinforced concrete or steel-lined shaft extending above maximum reservoir level (with spillway overflow or upper/lower expansion chambers in throttled/differential designs).
9. **Operating Mechanism:** During steady generation, tank water level sits at reservoir elevation minus tunnel friction head loss. On sudden turbine gate closure, level rises above reservoir elevation and oscillates before damping out; on sudden gate opening, tank supplies immediate water acceleration while tunnel flow catches up.
10. **Upstream Relationship:** Connects directly via vertical riser tee to `comp-pressure-tunnel`.
11. **Downstream Relationship:** Shields `comp-penstock` and `comp-main-inlet-valve` by shortening the effective unprotected water-hammer conduit length.
12. **Important Engineering Parameters:** Tank cross-sectional area ($A_{\text{st}}$), orifice throat diameter (for throttled tanks), maximum upsurge/downsurge elevations (must stay below top spill and above tunnel crown to prevent air ingestion).
13. **Typical Operating Considerations:** Maintain free air venting at top of tank; ensure orifice port remains unobstructed; verify governor opening/closing times align with Thoma stability margin.
14. **Potential Failure Modes:** Downsurge dropping below tunnel crown and drawing air into the penstock; overflow spills; concrete liner spalling from cyclic hydraulic pressures; orifice erosion.
15. **Maintenance Considerations:** Water-level transducer calibration, inspection of top vent screens, concrete surface inspection during shutdowns.
16. **3D Representation Requirements:** Vertical cylindrical tower/cutaway shaft positioned above the tunnel-penstock elbow with visible internal blue water level surface.
17. **User Interaction Behavior:** Section cut clearly reveals open-surface water column inside tank relative to reservoir elevation.
18. **Related Energy Journey Stages:** `stage-03-water-conveyance`
19. **Related Simulation Variables:** Explains transient safety margin enabling rapid `guideVaneOpeningPct` changes without steady-state CFD/MOC modeling in DENRYU.
20. **Educational Explanation:** *General principle:* Think of a surge tank as a hydraulic shock absorber and local buffer—it converts high-speed water-hammer pressure spikes into slow, harmless vertical sloshing inside an atmospheric shaft.

#### B.4 `comp-penstock` — Penstock
1. **Component ID:** `comp-penstock`
2. **Official Name:** Penstock
3. **Alternative Names:** High-Pressure Penstock, Steel Pressure Pipe
4. **Parent Subsystem:** `sub-water-conveyance`
5. **Physical Location:** Inclined or vertical steel pressure conduit descending from the surge tank / tunnel transition down to the powerhouse main inlet valve.
6. **Purpose:** Channel pressurized water steeply downward into the Francis turbine while safely containing full static + dynamic hydrostatic pressure and accelerating flow toward the spiral casing.
7. **Engineering Principle:** Hydrostatic & hydrodynamic pressure containment ($\sigma_{\text{hoop}} = \frac{p D}{2 t}$); internal pressure increases sharply with vertical descent ($p \approx \rho g h_{\text{static}} - \rho g h_f$ during flow). Net head entering the turbine equals gross head minus friction and minor bend losses ($H_{\text{net}} = H_{\text{gross}} - \Delta H_{\text{loss}}$).
8. **Construction and Materials:** High-tensile welded structural steel plates (e.g., ASTM A516/A537 or EN S355 equivalents, plant-dependent), circumferential external stiffener rings, concrete anchor blocks at bends, saddle supports, expansion joints, and internal epoxy anti-corrosion lining.
9. **Operating Mechanism:** Continuously conveys pressurized flow from upper conveyance into the turbine inlet; converts elevation drop directly into high static pressure head at the powerhouse floor.
10. **Upstream Relationship:** Receives flow from `comp-pressure-tunnel` past the `comp-surge-tank` junction.
11. **Downstream Relationship:** Connects through flanged reducer/expansion joint directly into `comp-main-inlet-valve`.
12. **Important Engineering Parameters:** Internal diameter (illustrative `~3.4 m`, accelerating velocity to `~6.6 m/s` at `60 m³/s`), wall thickness (increases toward bottom anchor), design internal pressure (`~1.0–1.4 MPa` class at `~85–100 m` head), illustrative conveyance head loss ($\Delta H_{\text{loss}}$).
13. **Typical Operating Considerations:** Monitor expansion joints, concrete saddle movement, and drain valves; prevent vacuum conditions during rapid shutdowns via upstream air-admission valves.
14. **Potential Failure Modes:** External corrosion or internal lining delamination; fatigue cracking at bifurcation or circumferential welds; water-hammer overpressure rupture if guide vanes slam faster than design; buckling under accidental internal vacuum.
15. **Maintenance Considerations:** Ultrasonic thickness gauging, weld non-destructive testing (NDT), internal epoxy recoating, expansion gland repacking, anchor block drain checks.
16. **3D Representation Requirements:** Industrial dark steel inclined pipe (`#3D4E5E`, metallic `0.78`) with flanged joints, stiffener rings, and concrete thrust/saddle supports; supports cutaway transparency showing rising pressure gradient particles.
17. **User Interaction Behavior:** Detailed component inspector displays pressure-vs-elevation explanation and head-loss note; linked directly to `netHeadM` and `actualFlowRateM3s`.
18. **Related Energy Journey Stages:** `stage-03-water-conveyance`
19. **Related Simulation Variables:** `netHeadM`, `actualFlowRateM3s`, `hydraulicPowerW`.
20. **Educational Explanation:** *General principle:* As water descends the penstock, gravitational elevation drops while internal fluid pressure rises enormously—delivering concentrated hydraulic power ($P_h = \rho g Q H$) right to the turbine entrance. *Assumed simplification:* In DENRYU's simulator, the user directly controls `Net Head (H)` (head already accounting for penstock friction loss), while the Physics & Insights views explain the gross-to-net head loss relationship.

#### B.5 `comp-main-inlet-valve` — Main Inlet Valve
1. **Component ID:** `comp-main-inlet-valve`
2. **Official Name:** Main Inlet Valve
3. **Alternative Names:** Turbine Inlet Valve (TIV), Butterfly Valve / Spherical Valve, Guard Valve
4. **Parent Subsystem:** `sub-water-conveyance`
5. **Physical Location:** Inside the powerhouse turbine valve pit immediately upstream of `comp-spiral-casing`.
6. **Purpose:** Provide positive, watertight isolation of the turbine unit from the pressurized penstock during unit shutdown, maintenance, and emergency runaway protection without draining the entire penstock.
7. **Engineering Principle:** Quarter-turn mechanical valve disc (lattice/through-flow butterfly valve for medium heads ~`50–150 m`, or full-bore rotary spherical valve for higher heads) rotated `90°` by a hydraulic servomotor and/or counterweight closure system; sealed by pressurized service-water or elastomer maintenance/service seals.
8. **Construction and Materials:** Cast or welded steel valve body, streamlined lens-shaped butterfly disc (or spherical rotor plug), stainless-steel trunnion shafts and self-lubricating bronze bushings, hydraulic actuation cylinder, counterweight arm, and upstream/downstream bypass equalization pipe.
9. **Operating Mechanism:** Held fully open (`0°` alignment parallel to flow) during normal generation to minimize head loss. During startup, bypass valve equalizes spiral casing pressure to penstock pressure before main actuator opens the disc. During emergency shutdown or guide vane failure, counterweight/hydraulic pressure closes the valve safely against flow.
10. **Upstream Relationship:** Bolted via dismantling joint directly to downstream end of `comp-penstock`.
11. **Downstream Relationship:** Feeds directly into the tangential inlet nozzle of `comp-spiral-casing`.
12. **Important Engineering Parameters:** Nominal bore diameter (matching spiral casing inlet, illustrative `~3.0–3.2 m`), full-flow head loss coefficient ($K_v \approx 0.1–0.25$ for streamlined butterfly), emergency closing time (`~30–60 s`).
13. **Typical Operating Considerations:** Never operate main actuator with high differential pressure unless engineered for emergency flow cut-off; monitor seal leakage during standstill to avoid turbine creeping.
14. **Potential Failure Modes:** Trunnion bearing seizure; inflatable/mechanical seal failure causing spiral casing leakage at standstill; bypass valve blockage preventing startup equalization; hydraulic actuator seal leak.
15. **Maintenance Considerations:** Periodic partial-stroke exercising, seal replacement during unit overhaul, hydraulic oil cleanliness checks, bypass strainer cleaning.
16. **3D Representation Requirements:** Bolted industrial steel valve body (`#4E5E6E`) with visible external hydraulic actuator cylinder, counterweight lever, and dismantling flange upstream of spiral casing.
17. **User Interaction Behavior:** Section cut reveals internal streamlined disc orientation; Exploded view separates upstream dismantling collar.
18. **Related Energy Journey Stages:** `stage-03-water-conveyance` (boundary to `stage-04-turbine-conversion`)
19. **Related Simulation Variables:** Unit isolation state (`OperatingCondition !== 'shutdown'`).
20. **Educational Explanation:** *General principle:* Draining a long steel penstock takes hours and wastes water; the main inlet valve right outside the turbine allows engineers to isolate the Francis unit in under a minute while keeping the penstock full and pressurized. *Plant-specific note:* Medium-head units (~85 m) typically use streamlined butterfly valves, whereas very high-head units (> 200 m) use zero-obstruction spherical valves.

---

## 6. Detailed Component Specifications (Subsystems C & D)

### Subsystem C: Turbine (`sub-turbine`)

#### C.1 `comp-spiral-casing` — Spiral Casing
1. **Component ID:** `comp-spiral-casing`
2. **Official Name:** Spiral Casing
3. **Alternative Names:** Scroll Case, Volute Casing
4. **Parent Subsystem:** `sub-turbine`
5. **Physical Location:** Surrounding the outer perimeter of the stay ring and Francis runner pit inside the powerhouse substructure.
6. **Purpose:** Distribute pressurized water uniformly around the full `360°` circumference of the stay vanes and guide vanes with constant radial/tangential inlet velocity and minimal hydraulic loss.
7. **Engineering Principle:** Conservation of mass and free-vortex angular momentum ($r v_\theta = \text{const}$): as water flows around the spiral and bleeds inward into the turbine periphery, the circular cross-sectional area decreases progressively with azimuthal angle ($A(\theta) \propto (1 - \theta/2\pi)$) so tangential velocity and static pressure remain uniform around the runner perimeter.
8. **Construction and Materials:** Fabricated welded steel plate segments (forming circular cross-sections wrapped in a snail-shell volute, often partially embedded in powerhouse concrete with compressible cork/foam wrap around upper half to control concrete tensile cracking); welded directly to the cast/welded stay ring.
9. **Operating Mechanism:** Stationary hydraulic distributor; converts rectilinear pipe flow from the main inlet valve into an axisymmetric inward swirling sheet entering the stay vanes.
10. **Upstream Relationship:** Bolted directly downstream of `comp-main-inlet-valve`.
11. **Downstream Relationship:** Feeds water radially inward across the `360°` perimeter into `comp-stay-vanes`.
12. **Important Engineering Parameters:** Inlet diameter (illustrative `~2.8–3.0 m`), design pressure including water-hammer allowance (typically `1.3–1.5×` max static head), spiral wrap angle (`~345°` to nose baffle).
13. **Typical Operating Considerations:** Maintain balanced pressure tapping telemetry (Winter-Kennedy index flow taps often installed on spiral casing cross-sections to monitor relative discharge).
14. **Potential Failure Modes:** Fatigue cracking near the baffle plate / tongue junction; internal erosion-corrosion from silt-laden water; structural concrete-to-steel separation vibration.
15. **Maintenance Considerations:** Periodic dewatered internal inspection of welds (especially tongue/nose vane), Winter-Kennedy piezometer port flushing, coating touch-up.
16. **3D Representation Requirements:** Authentic tapering helical steel scroll case (`#4E5E6E`) wrapping `360°` around the stay ring with segmented weld-seam cues; supports `opacity: 0.22` cutaway during Water-Flow Mode & Stage 04.
17. **User Interaction Behavior:** Clicking highlights scroll shell; toggle transparency or Section Cut immediately reveals `comp-stay-vanes`, `comp-guide-vanes`, and `comp-runner` nested inside.
18. **Related Energy Journey Stages:** `stage-04-turbine-conversion`
19. **Related Simulation Variables:** `netHeadM`, `actualFlowRateM3s`, `hydraulicPowerW`.
20. **Educational Explanation:** *General principle:* If pressurized pipe water hit only one side of a turbine wheel, uneven forces would wreck the bearings and waste energy. The tapering snail-shell geometry ensures every single degree around the `360°` intake receives equal flow and swirl.

#### C.2 `comp-stay-vanes` — Stay Vanes
1. **Component ID:** `comp-stay-vanes`
2. **Official Name:** Stay Vanes
3. **Alternative Names:** Stay Ring Vanes, Speed Ring Pillars
4. **Parent Subsystem:** `sub-turbine`
5. **Physical Location:** Fixed annular ring forming the inner throat of `comp-spiral-casing` immediately outside `comp-guide-vanes`.
6. **Purpose:** Perform a dual mechanical and hydraulic role: structurally transfer massive axial hydraulic pressure and generator/concrete foundation loads across the water passage, while pre-guiding swirling spiral water smoothly toward the movable guide vanes.
7. **Engineering Principle:** Hydrofoil column struts aligned along the natural spiral flow angle ($\alpha_0$) to minimize drag and incidence shock while acting as structural tension/compression columns connecting the upper and lower stay-ring crowns against internal spiral pressure.
8. **Construction and Materials:** Cast or welded structural steel / stainless-clad upper and lower annular crowns joined by `12–24` fixed streamlined hydrofoil vanes (`16–20` typical in medium-head Francis designs).
9. **Operating Mechanism:** Stationary (non-pivoting); serves as structural backbone holding the head cover, bottom ring, and spiral casing open against pressurized water.
10. **Upstream Relationship:** Receives swirling radial-tangential inflow from `comp-spiral-casing`.
11. **Downstream Relationship:** Guides flow directly into the adjustable ring of `comp-guide-vanes`.
12. **Important Engineering Parameters:** Number of stay vanes (typically matches or is half the guide vane count, avoiding harmonic resonance multiples), leading-edge inlet angle matching spiral flow angle.
13. **Typical Operating Considerations:** Flow alignment errors at extreme off-design discharges cause trailing-edge vortex shedding (Von Kármán street), occasionally inducing acoustic singing or vane cracking if natural frequencies coincide.
14. **Potential Failure Modes:** Trailing-edge fatigue cracking from Von Kármán vortex shedding; abrasive sand erosion on leading edges; cavitation pitting in separated wakes.
15. **Maintenance Considerations:** Magnetic-particle or dye-penetrant NDT inspection of vane-to-crown fillets during overhauls; trailing-edge profile grinding ("Donaldson chamfer") if singing occurs.
16. **3D Representation Requirements:** Instanced ring of `16` fixed streamlined outer hydrofoil struts connecting top and bottom annular stay-ring plates (`#6A7A89`).
17. **User Interaction Behavior:** Visually differentiated from the inner movable `comp-guide-vanes` ring; hover tooltip highlights fixed structural role vs. pivoting wicket gates.
18. **Related Energy Journey Stages:** `stage-04-turbine-conversion`
19. **Related Simulation Variables:** Contributes to smooth hydraulic inlet conditioning (`turbineEfficiency`).
20. **Educational Explanation:** *General principle:* Stay vanes look similar to guide vanes, which often confuses learners—the critical difference is that stay vanes are **welded fixed structural pillars** carrying immense forces while pre-aligning the swirl, whereas the inner guide vanes **pivot** to control flow.

#### C.3 `comp-guide-vanes` — Guide Vanes / Wicket Gates
1. **Component ID:** `comp-guide-vanes`
2. **Official Name:** Guide Vanes / Wicket Gates
3. **Alternative Names:** Wicket Gates, Distributor Vanes
4. **Parent Subsystem:** `sub-turbine`
5. **Physical Location:** Concentric annular ring situated immediately between `comp-stay-vanes` and the outer inlet perimeter of `comp-runner`.
6. **Purpose:** Continuously regulate water flow rate ($Q$) entering the runner, set the optimal tangential swirl velocity ($v_{u1}$) required by the runner blades, and shut off water admission to start, load-control, or stop the unit.
7. **Engineering Principle:** Pivoting hydrofoil cascade connected via crank arms and shear pins to a hydraulic governor-actuated regulating ring. Changing gate angle $\alpha_1$ simultaneously adjusts throat opening area ($A_{\text{gate}}$) and angular momentum ($r_1 v_{u1}$) entering the runner per the Euler turbomachinery equation ($T = \rho Q (r_1 v_{u1} - r_2 v_{u2})$).
8. **Construction and Materials:** Precision-machined cast martensitic stainless steel (e.g., CA6NM / 13Cr-4Ni) hydrofoil blades with upper and lower integral trunnion stems rotating in bronze/self-lubricating bushings inside the head cover and bottom ring; linked via levers, breaking links/shear pins, and twin hydraulic servomotors acting on the regulating ring.
9. **Operating Mechanism:** The turbine governor commands hydraulic servomotors to rotate the regulating ring, pivoting all `20–24` guide vanes synchronously from `0%` (fully closed contact) to `100%` (maximum rated opening). Shear pins fracture intentionally if debris jams a single gate, protecting adjacent linkage.
10. **Upstream Relationship:** Receives pre-aligned swirling flow from `comp-stay-vanes`.
11. **Downstream Relationship:** Directs accelerated, angle-controlled flow directly across the vaneless gap into `comp-runner` / `comp-runner-blades`.
12. **Important Engineering Parameters:** Number of wicket gates (illustrative `20` vanes), opening range (`0–100%`, nominal BEP around `~75–85%` opening depending on head), governor stroke rate limits (closing time typically `5–12 s` tuned against penstock surge).
13. **Typical Operating Considerations:** Operating at very small openings (`< 25–30%`) produces severe throttle turbulence, incidence shock, and draft-tube cavitation vortex rope; gate seals wear over time allowing slight leakage at closed position.
14. **Potential Failure Modes:** Shear pin breakage from debris jamming; bushing seizure or galling; end-clearance erosion increasing closed-gate leakage; hydraulic servomotor drift.
15. **Maintenance Considerations:** Gate-to-gate clearance and facing seal checks, regulating ring linkage greasing, shear pin inspection, governor deadband and stroke-time calibration.
16. **3D Representation Requirements:** Instanced annular ring of `20` pivoting hydrofoil blades plus visible upper regulating ring & linkage levers (`#7E8F9F`); vane rotation angles react live to `guideVaneOpeningPct` in Simulator!
17. **User Interaction Behavior:** Interactive inspection shows synchronous gate opening/closing animation; Explorer highlights regulating ring linkage above head cover.
18. **Related Energy Journey Stages:** `stage-04-turbine-conversion`
19. **Related Simulation Variables:** `guideVaneOpeningPct`, `actualFlowRateM3s`, `turbineEfficiency`.
20. **Educational Explanation:** *General principle:* Guide vanes act as the turbine's throttle AND steering wheel at the same time—they decide both *how much* water enters and *at what angle* it strikes the runner blades.

#### C.4 `comp-runner` — Runner (Francis Runner)
1. **Component ID:** `comp-runner`
2. **Official Name:** Runner
3. **Alternative Names:** Francis Turbine Runner, Turbine Wheel
4. **Parent Subsystem:** `sub-turbine`
5. **Physical Location:** Central rotating core inside the distributor throat (`comp-guide-vanes`), bolted onto the bottom flange of `comp-main-shaft` directly above `comp-draft-tube`.
6. **Purpose:** Convert the pressure energy and kinetic angular momentum of incoming pressurized water into smooth mechanical shaft torque and continuous rotational power.
7. **Engineering Principle:** **Reaction + Mixed-Flow Turbomachinery (Euler Turbine Equation):**
   Unlike an impulse Pelton wheel operating in air, a Francis runner runs completely submerged under pressure. As water flows radially inward and curves axially downward through the narrowing blade passages, both static pressure drops (reaction effect, typically ~50% of energy conversion) and tangential velocity decreases (impulse/angular momentum change), generating shaft torque:
   $$T = \rho Q (r_1 v_{u1} - r_2 v_{u2}), \qquad P_m = T \omega = \rho g Q H \eta_t$$
8. **Construction and Materials:** Single-piece cast or fabricated/welded martensitic stainless steel (`13Cr-4Ni` / ASTM A743 CA6NM) consisting of: (1) upper **Crown** (hub bolted to shaft), (2) lower **Band** (shroud ring encircling blade outer tips with labyrinth seal rings), and (3) `13–17` double-curved 3D **Runner Blades** (`comp-runner-blades`) spanning between crown and band.
9. **Operating Mechanism:** Water enters the outer diameter radially around the full `360°` periphery, transfers angular momentum to the blades while dropping in pressure, and exits axially downward out the runner eye into the draft tube at near-zero residual swirl at Best Efficiency Point (BEP).
10. **Upstream Relationship:** Receives pressure/velocity-conditioned swirling inflow across the radial vaneless space from `comp-guide-vanes`.
11. **Downstream Relationship:** Delivers mechanical torque upward to `comp-main-shaft`, and discharges low-pressure axial water downward into `comp-draft-tube`.
12. **Important Engineering Parameters:** Runner discharge diameter ($D_2$, illustrative `~2.4–2.8 m`), specific speed ($N_s$, medium-head Francis typically `~120–250` metric $n_{q}$ equivalent `~35–75`), synchronous speed (`250 rpm` in DENRYU 50 Hz 24-pole configuration), runaway overspeed capability (`~1.7–2.1×` synchronous speed per IEC/IEEE mechanical design margins), peak hydraulic efficiency (`~90–95%` in modern large prototypes; `92%` illustrative peak in DENRYU).
13. **Typical Operating Considerations:** Must stay set below tailwater elevation sufficient to satisfy Thoma cavitation parameter ($\sigma_{\text{plant}} > \sigma_{\text{critical}}$); avoid prolonged operation in rough part-load band (`< 45%` flow) where helical draft-tube vortex rope causes vibration.
14. **Potential Failure Modes:** Cavitation pitting on low-pressure suction side near trailing edge; high-cycle fatigue cracking at blade-to-crown/band fillets (rotor-stator interaction pressure pulsations); silt abrasion erosion; labyrinth seal wear increasing volumetric leakage loss.
15. **Maintenance Considerations:** Periodic cavitation dye-penetrant NDT, stainless weld-overlay repair and template grinding of pitted blades, labyrinth seal clearance measurements, dynamic balancing checks.
16. **3D Representation Requirements:** High-precision geometry showing distinct upper Crown with coupling bolt circle, lower Band/shroud with seal grooves, nose cone, and integrated `comp-runner-blades`; MUST support all **5 Special Inspection Modes** (`Normal`, `Exploded`, `Cross-Section`, `Blade Inspection`, `Water-Flow`).
17. **User Interaction Behavior:** Selecting `comp-runner` activates the **Francis Runner 5-Mode Inspection Bar** in Plant Anatomy; rotates live in Overview, Journey Stage 04+, and Simulator.
18. **Related Energy Journey Stages:** `stage-04-turbine-conversion`
19. **Related Simulation Variables:** `turbineMechanicalPowerW`, `turbineTorqueNm`, `turbineEfficiency`, `rotationalSpeedRpm`.
20. **Educational Explanation:** *Why Francis differs from Pelton & Kaplan:* A **Pelton** runner uses open-air buckets hit by high-velocity water jets (high head, low flow). A **Kaplan** propeller uses flat-pitched axial blades ideal for low heads and huge flows. A **Francis** runner uniquely bridges the middle: water enters **radially** around the edge under full pressure and exits **axially** through the center, giving it signature twisted 3D spoon-shaped blades enclosed between a crown and band.

#### C.5 `comp-runner-blades` — Runner Blades
1. **Component ID:** `comp-runner-blades`
2. **Official Name:** Runner Blades
3. **Alternative Names:** Francis Buckets, Runner Vanes
4. **Parent Subsystem:** `sub-turbine` (structural sub-assembly of `comp-runner`)
5. **Physical Location:** Curved hydrofoil passages welded/cast between the upper crown and lower band of `comp-runner`.
6. **Purpose:** Extract fluid energy smoothly through continuous aerodynamic/hydrodynamic pressure differential between the pressure (concave) face and suction (convex) face while turning the water `90°` from radial inward to axial downward flow.
7. **Engineering Principle:** 3D hydrofoil boundary-layer aerodynamics/hydrodynamics and velocity-triangle matching ($w = c - u$): blade inlet angle ($\beta_1$) aligns smoothly with relative water velocity at BEP to avoid shock loss, while trailing-edge twist ($\beta_2$) matches varying peripheral blade speed ($u = \omega r$) from crown to band so exit whirl approaches zero ($v_{u2} \approx 0$).
8. **Construction and Materials:** `13–17` double-curved hydrofoil blades (illustrative `15` blades—odd/prime-like relative to `20` guide vanes to prevent synchronous pressure-pulse resonance) formed via 5-axis CNC milling or precision investment/sand casting in `13Cr-4Ni` stainless steel.
9. **Operating Mechanism:** Stationary relative to the runner hub; rotates integrally with `comp-runner`, experiencing steady centrifugal + hydraulic bending loads overlaid by periodic pressure pulses as each blade passes stationary guide vanes.
10. **Upstream Relationship:** Leading edge faces water exiting `comp-guide-vanes`.
11. **Downstream Relationship:** Trailing edge discharges water into the runner eye / `comp-draft-tube`; transmits integrated hydrodynamic torque directly into `comp-runner` crown and `comp-main-shaft`.
12. **Important Engineering Parameters:** Blade count (`15` illustrative vs. `20` guide vanes), inlet/outlet blade angles ($\beta_1, \beta_2$ varying spanwise from crown to band), minimum surface pressure margin against vapor pressure ($p_{\min} > p_v$).
13. **Typical Operating Considerations:** At off-BEP flow rates, incoming relative angle mismatches $\beta_1$, causing leading-edge flow separation, eddy losses, and potential suction-side cavitation clouds.
14. **Potential Failure Modes:** Trailing-edge suction-side cavitation pitting; fillet fatigue cracking from rotor-stator interaction (RSI); leading-edge sediment erosion; Karman vortex trailing-edge vibration.
15. **Maintenance Considerations:** Ultrasonic thickness verification, profile-gauge blade shape checking after weld repairs, polishing suction faces to maintain hydraulic smoothness.
16. **3D Representation Requirements:** Dedicated individually pickable/highlightable twisted hydrofoil blade geometry inside `comp-runner` (`#B6C4D1`, low roughness `0.24`, metallic `0.92`) with exaggerated curvature clarity in **Blade Inspection Mode** (including optional velocity-triangle overlay labels).
17. **User Interaction Behavior:** Triggers Runner 5-Mode Inspection Bar; Blade Inspection mode isolates one hero blade + cutaway crown/band slice with annotated Leading Edge (`Inlet — Radial`), Pressure/Suction Faces, and Trailing Edge (`Outlet — Axial`).
18. **Related Energy Journey Stages:** `stage-04-turbine-conversion`
19. **Related Simulation Variables:** Physical determinant of `turbineEfficiency` curve shape and `turbineTorqueNm`.
20. **Educational Explanation:** *General principle:* Notice how a Francis blade twists dramatically from top to bottom—near the outer edge it sits almost vertical to catch radial water cleanly, while near the bottom center it curves nearly horizontal like a fan blade to push water axially downward without wasting rotational energy in the exit swirl.

#### C.6 `comp-main-shaft` — Main Shaft
1. **Component ID:** `comp-main-shaft`
2. **Official Name:** Main Shaft
3. **Alternative Names:** Turbine-Generator Shaft, Vertical Drive Shaft
4. **Parent Subsystem:** `sub-turbine` (mechanical bridge to `sub-generator`)
5. **Physical Location:** Vertical central axis extending from the Francis runner hub upward through the turbine head cover seal, intermediate flange coupling, and generator thrust/guide bearings to `comp-rotor`.
6. **Purpose:** Transmit mechanical torque and rotational power reliably from the submerged turbine runner to the generator rotor while carrying axial hydraulic thrust and shaft weight.
7. **Engineering Principle:** Torsional shear transmission ($\tau_{\max} = \frac{T r}{J}$, where $P_m = T \omega$) combined with axial compression/tension (total weight of runner + shaft + rotor + hydraulic downward thrust on the crown) and lateral whirling critical-speed stiffness ($n_{\text{critical}} \gg n_{\text{runaway}}$).
8. **Construction and Materials:** Heavy forged alloy steel (e.g., AISI 4140 / 34CrNiMo6 class) machined with integral forged coupling flanges joined by precision fitted tension bolts, replaceable stainless shaft sleeve through the turbine shaft seal, and polished bearing journals.
9. **Operating Mechanism:** Rotates synchronously with the runner and generator rotor (`250 rpm` in DENRYU), transferring pure mechanical work upward across the powerhouse floor boundary.
10. **Upstream Relationship:** Bolted directly to the crown of `comp-runner`.
11. **Downstream Relationship:** Bolted directly to the hub of `comp-rotor` (and restrained radially/axially by `comp-bearings`).
12. **Important Engineering Parameters:** Shaft torque ($T = P_m / \omega$, e.g., `~1.74 MN·m` at `45.5 MW, 250 rpm`), outer diameter (illustrative `~0.65–0.80 m` solid or hollow-bored), mechanical shaft seal leakage tolerance, lateral runout tolerance (`< 0.05 mm`).
13. **Typical Operating Considerations:** Maintain shaft alignment plumb within strict tolerances; monitor shaft vibration proximity probes (`X-Y` radial orbit); ensure turbine shaft seal prevents powerhouse flooding.
14. **Potential Failure Modes:** Shaft seal wear/overheating causing water ingress into turbine pit; bearing journal scoring; coupling bolt loosening under torsional shock (short-circuit torque transient); misalignment-induced cyclic bending fatigue.
15. **Maintenance Considerations:** Laser/piano-wire shaft plumbness & coupling runout alignment checks, shaft seal carbon/rubber packing replacement, NDT on flange fillets.
16. **3D Representation Requirements:** Vertical machined steel shaft column (`#9AA8B5`) with bolted intermediate coupling flange, visible shaft seal housing at head cover, and rotating axial keyway/stripe indicator so angular rotation is unmistakably visible.
17. **User Interaction Behavior:** Highlighted brightly in Stage 05 (`stage-05-mechanical-transmission`) with animated circumferential torque vector arrows.
18. **Related Energy Journey Stages:** `stage-05-mechanical-transmission`
19. **Related Simulation Variables:** `turbineTorqueNm`, `turbineMechanicalPowerW`, `rotationalSpeedRpm`.
20. **Educational Explanation:** *General principle:* Even though the shaft simply looks like a thick steel rod, at full load it simultaneously carries hundreds of tons of downward hydraulic thrust and twists under more than a million Newton-meters of torque—yet connects wet fluid mechanics below directly to clean electromagnetism above.

#### C.7 `comp-draft-tube` — Draft Tube
1. **Component ID:** `comp-draft-tube`
2. **Official Name:** Draft Tube
3. **Alternative Names:** Elbow Draft Tube, Diffuser Cone
4. **Parent Subsystem:** `sub-turbine`
5. **Physical Location:** Embedded in concrete powerhouse foundation directly underneath `comp-runner`, curving `90°` horizontally out toward `comp-draft-tube-outlet`.
6. **Purpose:** Recover residual kinetic energy leaving the runner by smoothly decelerating exit water in an expanding diffuser, and enable setting the turbine above tailwater (or recover elevation head down to tailwater) via controlled sub-atmospheric suction pressure.
7. **Engineering Principle:** **Bernoulli Diffuser Pressure Recovery:** Because cross-sectional area increases steadily from runner exit ($A_2$) to outlet ($A_3$), water velocity drops ($v_3 \ll v_2$), converting dynamic velocity head ($\frac{v_2^2 - v_3^2}{2g}$) back into static pressure recovery so pressure right beneath the runner drops below atmospheric ($p_2 < p_{\text{atm}}$), maximizing effective net head across the runner!
8. **Construction and Materials:** Upper conical steel liner (stainless-clad near runner throat to resist cavitation pitting) transitioning into a smooth curved `90°` reinforced concrete elbow and horizontally expanding concrete rectangular diffuser channels (often split by concrete splitter piers).
9. **Operating Mechanism:** Stationary divergent hydraulic passage; runs completely full and submerged below tailwater level at all times during operation to sustain continuous vacuum siphon/pressure recovery without air break.
10. **Upstream Relationship:** Connects directly beneath the band/outlet eye of `comp-runner`.
11. **Downstream Relationship:** Discharges decelerated water through `comp-draft-tube-outlet` into `comp-tailrace`.
12. **Important Engineering Parameters:** Cone divergence angle (typically `6–10°` total angle to prevent boundary-layer separation), submergence elevation relative to tailwater (Thoma cavitation setting), diffuser recovery efficiency (`~70–85%` typical).
13. **Typical Operating Considerations:** At part-load (`40–65%` flow), residual swirl leaving the runner forms an unstable helical **vortex rope** inside the draft tube cone causing `~0.2–0.5 Hz` Rheingans pressure surges and audible thumping; air admission through the runner nose cone is often used industrially to cushion this pulsation.
14. **Potential Failure Modes:** Throat liner cavitation pitting; vortex-rope fatigue vibration cracking steel-to-concrete anchor ties; uplift/collapse of liner if drained rapidly without exterior drain relief.
15. **Maintenance Considerations:** Dewatering via tailrace stoplogs to inspect cone liner, cavitation repair, checking air admission pipe, clearing debris at splitter piers.
16. **3D Representation Requirements:** Distinct steel upper cone (`#586878`) transitioning smoothly into curved `90°` cutaway concrete elbow diffuser channel (`#6D7680`) beneath the runner.
17. **User Interaction Behavior:** Section cut reveals expanding flow streamlines slowing down from runner exit toward horizontal tailrace; educational panel explains why cutting off a draft tube instantly drops turbine power and causes cavitation.
18. **Related Energy Journey Stages:** `stage-04-turbine-conversion` (exit boundary) and `stage-09-water-discharge`
19. **Related Simulation Variables:** Essential physical precondition for realizing full `netHeadM` and peak `turbineEfficiency`.
20. **Educational Explanation:** *General principle:* Without a draft tube, water shooting out of the runner would waste up to 10–15% of total head as unused exit kinetic energy AND the plant would lose the elevation head between the runner and the river surface below. The widening elbow gently brakes the water, creating beneficial suction underneath the runner.

---

### Subsystem D: Generator (`sub-generator`)

#### D.1 `comp-rotor` — Rotor
1. **Component ID:** `comp-rotor`
2. **Official Name:** Rotor
3. **Alternative Names:** Salient-Pole Rotor, Rotating Magnetic Field Assembly
4. **Parent Subsystem:** `sub-generator`
5. **Physical Location:** Inside the vertical generator pit/barrel, mounted concentrically inside `comp-stator` atop `comp-main-shaft`.
6. **Purpose:** Rotate a multi-pole DC magnetic field smoothly past the stationary armature coils (`comp-stator-winding`) to induce three-phase alternating voltage and provide rotational inertia ($H_{\text{inertia}}$) stabilizing grid frequency.
7. **Engineering Principle:** Synchronous electromechanical rotation locked to grid frequency:
   $$n_s = \frac{120 f}{N_p}$$
   (e.g., $N_p = 24$ poles at $f = 50\ \text{Hz} \implies n_s = 250\ \text{rpm}$). Low-speed hydraulic turbines require large-diameter, high-pole-count **salient-pole** rotors rather than 2-pole cylindrical steam-turbine rotors.
8. **Construction and Materials:** Heavy forged steel shaft hub, radial spider arms, laminated high-strength steel rim shrunk/keyed onto spider, and `24` bolted/dovetailed salient pole bodies carrying DC `comp-field-winding` coils plus copper damper (amortisseur) bars embedded in pole shoes, plus upper/lower ventilation fan blades.
9. **Operating Mechanism:** Driven mechanically by `comp-main-shaft` while energized by DC current from `comp-excitation-system`. Magnetic attraction between the rotating rotor poles and the stator's rotating magnetic field locks rotor speed strictly to grid frequency (`n_s`) during synchronized operation, transmitting load torque across the air gap.
10. **Upstream Relationship:** Coupled mechanically to `comp-main-shaft`; receives DC excitation current via slip rings/brushes (or rotating brushless exciter) from `comp-excitation-system`.
11. **Downstream Relationship:** Carries `comp-field-winding` and interacts magnetically across the radial air gap with `comp-stator` / `comp-stator-winding`.
12. **Important Engineering Parameters:** Number of poles ($N_p = 24$ illustrative), synchronous speed (`250 rpm` at `50 Hz`; `300 rpm` at `60 Hz`), air gap radial clearance (typically `~12–25 mm` plant-dependent), runaway overspeed withstand (`~1.8–2.1×` rated speed per IEEE C50.12), flywheel moment ($WR^2$ / inertia constant $H_{\text{inert}} \approx 2.5–4.5\ \text{s}$).
13. **Typical Operating Considerations:** Maintain uniform air gap symmetry (`< 5–10%` eccentricity) to prevent unbalanced magnetic pull (UMP); damper windings suppress hunting oscillations during grid faults.
14. **Potential Failure Modes:** Rotor rim/pole wedge loosening under centrifugal overspeed cycles; inter-turn field winding shorts causing thermal bowing and vibration; damper bar cracking from negative-sequence currents.
15. **Maintenance Considerations:** Air-gap measurement via feeler gauges/capacitive probes, pole-drop impedance testing, wedge tightness taps, brush/slip-ring cleaning, mechanical brake pad inspection on lower rotor brake track.
16. **3D Representation Requirements:** Detailed large-diameter spoked spider rim with `24` protruding laminated salient-pole shoes (`#8C9BA8`) wrapped with distinct copper field coils (`#C4773B`), visibly rotating in Simulator and Journey Stage 06!
17. **User Interaction Behavior:** Exploded view lifts rotor assembly upward cleanly out of `comp-stator` bore; isolated view lets user count salient poles and relate pole count to speed.
18. **Related Energy Journey Stages:** `stage-05-mechanical-transmission` (coupling) and `stage-06-electrical-generation`
19. **Related Simulation Variables:** `rotationalSpeedRpm`, `turbineTorqueNm`, `generatorEfficiency`, `electricalGeneratedPowerW`.
20. **Educational Explanation:** *Why hydro rotors look wide and flat:* Unlike 3000-rpm steam turbines, Francis water wheels spin slowly (`~100–600 rpm`). To still produce `50 Hz` or `60 Hz` grid AC, the rotor needs many magnetic north/south pole pairs (`24` poles in DENRYU) arranged around a wide-diameter flywheel rim.

#### D.2 `comp-stator` — Stator
1. **Component ID:** `comp-stator`
2. **Official Name:** Stator
3. **Alternative Names:** Stator Core & Frame, Armature Frame
4. **Parent Subsystem:** `sub-generator`
5. **Physical Location:** Stationary cylindrical ring encircling `comp-rotor` inside `comp-generator-housing`, bolted down to powerhouse concrete soleplates.
6. **Purpose:** Provide a low-reluctance laminated magnetic return path for rotating rotor flux, structurally support `comp-stator-winding` against electromagnetic short-circuit torques, and channel cooling air radially through core ducts.
7. **Engineering Principle:** Alternating magnetic flux passing through steel experiences eddy-current and hysteresis iron losses ($P_{\text{core}} \propto f^{1.3–2} B_{\max}^2$). Constructing the stator core from thin stacked, varnished silicon-steel laminations dramatically limits eddy current circulation and core heating.
8. **Construction and Materials:** Welded structural steel cylindrical frame with radial support ribs, stacked `0.35–0.5 mm` grain-oriented or low-loss non-oriented electrical silicon-steel core punchings clamped tightly between heavy end-fingers/through-bolts, and axial cooling air spacers creating radial ventilation ducts.
9. **Operating Mechanism:** Remains strictly stationary while conducting alternating magnetic flux induced by the spinning rotor poles and resisting equal-and-opposite electromagnetic reaction torque directly into the powerhouse foundation.
10. **Upstream Relationship:** Receives rotating magnetic flux across the air gap from `comp-rotor` / `comp-field-winding`, while transferring electromagnetic reaction torque into foundation anchor bolts.
11. **Downstream Relationship:** Houses `comp-stator-winding` slots and transfers core heat into `comp-cooling-system`.
12. **Important Engineering Parameters:** Stator bore diameter (plant-dependent, illustrative `~4.8–5.5 m` for a `45 MW, 250 rpm` vertical hydro unit), core stack length, core iron loss fraction (`~0.3–0.6%` of rated MVA), soleplate reaction torque rating.
13. **Typical Operating Considerations:** Core compression clamping pressure must remain tight to prevent lamination fretting ("red-dust" iron oxide powder); avoid over-fluxing ($V/f > 1.05$ p.u.) which saturates core iron and spikes core heating.
14. **Potential Failure Modes:** Loose core lamination wedges causing vibration and slot insulation abrasion; inter-laminar insulation breakdown creating local hot spots; soleplate thermal expansion distortion causing ovalization.
15. **Maintenance Considerations:** ELCID (Electromagnetic Core Imperfection Detection) or rated-flux core ring tests, core-bolt torque checks, RTD core temperature trending, visual bore cleaning.
16. **3D Representation Requirements:** Dark graphite slotted cylindrical ring (`#2B3540`) with visible axial ventilation ribs and vertical stator slots holding copper coil bars (`comp-stator-winding`).
17. **User Interaction Behavior:** Section cut slices stator shell to reveal air gap and radial slot geometry around rotor poles.
18. **Related Energy Journey Stages:** `stage-06-electrical-generation`
19. **Related Simulation Variables:** Contributes to constant iron/core loss component of `generatorEfficiency`.
20. **Educational Explanation:** *General principle:* The stator is not a solid cast iron pipe—it is assembled from tens of thousands of paper-thin insulated steel sheets stacked together so magnetic fields cross smoothly without turning the frame into a giant induction heater.

#### D.3 `comp-field-winding` — Field Winding
1. **Component ID:** `comp-field-winding`
2. **Official Name:** Field Winding
3. **Alternative Names:** Rotor Field Coils, Excitation Windings
4. **Parent Subsystem:** `sub-generator`
5. **Physical Location:** Wound concentrically around each of the `24` salient pole bodies on the outer periphery of `comp-rotor`.
6. **Purpose:** Produce the steady, controllable DC magnetomotive force (MMF) establishing alternating North-South magnetic poles around the rotor perimeter.
7. **Engineering Principle:** Ampère's circuital law ($\oint \mathbf{H}\cdot d\mathbf{l} = N I_f$): passing controlled DC excitation current $I_f$ through multi-turn pole coils builds magnetic flux $\Phi_f$ per pole, directly governing induced internal stator EMF ($E_f \propto \omega \Phi_f$) and generator reactive power ($Q_{\text{VAR}}$) output.
8. **Construction and Materials:** Edge-wound flat copper strap coils (allowing superior heat dissipation on outer edges) or insulated multi-turn rectangular copper conductors, insulated from the steel pole body with Class F/H epoxy-mica/Nomex pole collars and held firmly against centrifugal force by pole shoes and inter-pole V-blocks/braces.
9. **Operating Mechanism:** Series-connected pole coils alternate winding polarity (`N-S-N-S...` around all `24` poles) fed via rotor leads from `comp-excitation-system`. Increasing $I_f$ boosts magnetic flux, raising terminal voltage (open circuit) or reactive power export (grid-tied).
10. **Upstream Relationship:** Fed by DC excitation current from `comp-excitation-system` and mounted on `comp-rotor`.
11. **Downstream Relationship:** Radiates magnetic flux lines across the air gap to cut `comp-stator-winding`.
12. **Important Engineering Parameters:** Rated field current & voltage (plant-dependent, typically `200–1200 A DC` at `100–400 V DC`), insulation thermal class (Class F `155 °C` / Class H `180 °C` per IEEE C50.12), $I^2 R$ copper field loss.
13. **Typical Operating Considerations:** Monitor rotor ground-fault protection (single ground usually alarms, second ground shorts turns causing violent magnetic unbalance); respect field thermal overload limits during voltage sags.
14. **Potential Failure Modes:** Turn-to-turn insulation shorts (causing asymmetric heating and 1× shaft vibration); copper thermal dusting; lead-wire fatigue at shaft bore transitions; earth fault from carbon/oil contamination.
15. **Maintenance Considerations:** Pole-drop AC impedance test, DC winding resistance check, Megger insulation resistance & polarization index (PI), inter-pole brace tightening.
16. **3D Representation Requirements:** Distinct wrapped copper coil bands (`#C4773B`) encircling every salient pole around the rotor rim, subtly glowing with restrained cyan/amber magnetic field indicator lines during Stage 06.
17. **User Interaction Behavior:** Isolating highlights all 24 pole coils uniformly; interactive tooltip links DC excitation strength to terminal voltage control.
18. **Related Energy Journey Stages:** `stage-06-electrical-generation`
19. **Related Simulation Variables:** Supports `generatorEfficiency` (field $I^2R$ copper loss) and `electricalGeneratedPowerW`.
20. **Educational Explanation:** *General principle:* Unlike tiny bicycle dynamos using permanent magnets, utility hydroelectric generators use **electromagnets** on the rotor. Adjusting the DC current in these field coils lets grid operators regulate station voltage and reactive power cleanly even while turbine speed stays locked to `50 Hz`.

#### D.4 `comp-stator-winding` — Stator Winding
1. **Component ID:** `comp-stator-winding`
2. **Official Name:** Stator Winding
3. **Alternative Names:** Armature Winding, Three-Phase Stator Coils
4. **Parent Subsystem:** `sub-generator`
5. **Physical Location:** Embedded inside longitudinal slots around the inner bore of `comp-stator`, with curved end-turns projecting above and below the core iron.
6. **Purpose:** Serve as the stationary electrical conductor circuit where the rotating rotor magnetic field induces three-phase AC voltage and delivers load current out to the plant electrical system.
7. **Engineering Principle:** **Faraday's Law of Electromagnetic Induction:** As `24` alternating magnetic poles sweep past spatially `120°`-displaced phase coil groups (`Phase A, B, C`), time-varying magnetic flux linkage ($\lambda(t)$) induces balanced sinusoidal three-phase EMF:
   $$e(t) = -N \frac{d\Phi}{dt}, \qquad E_{\text{rms}} = 4.44 f N k_w \Phi_f$$
   Output electrical power equals active electromagnetic power minus $I^2 R$ stator copper loss and core/stray losses.
8. **Construction and Materials:** Transposed Roebel copper bars (reduces skin-effect & circulating-current eddy losses inside thick conductors), insulated with high-voltage vacuum-pressure impregnated (VPI) mica-epoxy groundwall tape + semi-conductive corona slot armor, wedged tightly in slots with fiberglass ripple springs and braced at end-turns against short-circuit forces.
9. **Operating Mechanism:** Stationary conductors carrying high-voltage alternating current (`e.g., 10.5–13.8 kV` line-to-line typical medium-high hydro generator class) out via collector phase rings to `comp-generator-terminal`.
10. **Upstream Relationship:** Electromagnetically coupled across air gap to `comp-field-winding` / `comp-rotor`; mechanically anchored inside `comp-stator`.
11. **Downstream Relationship:** Connects phase leads directly to `comp-generator-terminal` and rejects $I^2R$ heat into `comp-cooling-system`.
12. **Important Engineering Parameters:** Rated line-to-line terminal voltage (`10.5–13.8 kV` typical class, plant-dependent; illustrative `11.0 kV` in DENRYU), rated current (`~2.4–2.6 kA` per phase at `~45–50 MVA`), stator copper loss ($\propto I^2 R$, dominant load-dependent loss term in generator efficiency curve).
13. **Typical Operating Considerations:** Slot-wedge tightness and end-winding bracing must resist `2×` to `10×` rated current electromagnetic forces during external faults; monitor partial discharge (PD) activity and embedded slot RTD temperatures.
14. **Potential Failure Modes:** Groundwall mica-epoxy insulation thermal aging or partial-discharge treeing; loose slot wedges causing slot-discharge erosion; end-winding corona or vibration fatigue; cooling blockage overheating conductors.
15. **Maintenance Considerations:** Offline Doble power-factor / tan-delta & partial-discharge testing, hi-pot withstand tests, end-winding bump tests, RTD checks, borescope inspection of wedging.
16. **3D Representation Requirements:** Distinct copper coil bars and characteristic diamond-basket end-turn loops (`#B86B35`) protruding clearly from top and bottom of the dark stator core when housing/cover is cut away.
17. **User Interaction Behavior:** Highlighted during Stage 06 with animated three-phase current pulse ribbons running toward generator terminals.
18. **Related Energy Journey Stages:** `stage-06-electrical-generation`
19. **Related Simulation Variables:** `electricalGeneratedPowerW`, `generatorEfficiency` ($I^2 R$ variable load loss).
20. **Educational Explanation:** *Why stator carries the high power instead of the rotor:* Putting `11 kV` and thousands of amperes on the **stationary** stator avoids pushing gigantic power currents through sliding carbon brushes—only modest DC excitation current goes to the spinning rotor!

#### D.5 `comp-excitation-system` — Excitation System
1. **Component ID:** `comp-excitation-system`
2. **Official Name:** Excitation System
3. **Alternative Names:** Static Excitation System, AVR & Exciter Cubicle
4. **Parent Subsystem:** `sub-generator`
5. **Physical Location:** Auxiliary floor cubicle beside/above the generator housing plus collector slip-ring brush gear (or brushless exciter assembly) on top of the shaft.
6. **Purpose:** Supply regulated DC current to `comp-field-winding` and automatically control terminal voltage, reactive power factor, and transient power-system stability via the Automatic Voltage Regulator (AVR) and Power System Stabilizer (PSS).
7. **Engineering Principle:** Closed-loop feedback voltage/reactive power control: measures stator terminal voltage ($V_t$) via potential transformers (PTs), compares against setpoint, and modulates SCR thyristor firing angles (static excitation drawing from an excitation transformer) to raise or lower DC field current $I_f$ within milliseconds.
8. **Construction and Materials:** Thyristor rectifier bridge cabinets, digital AVR/PSS controller racks, DC field circuit breaker & crowbar discharge resistor, excitation power transformer, and shaft-mounted copper/steel collector slip rings with carbon brush rigging (for static systems).
9. **Operating Mechanism:** During startup, field flashing builds initial voltage from station DC batteries until self-excitation takes over; during grid operation, AVR continuously compensates armature reaction as electrical load varies while respecting under-excitation (stator end-iron heating) and over-excitation (field thermal) limiters.
10. **Upstream Relationship:** Monitors terminal voltage from `comp-generator-terminal` and receives auxiliary AC supply / control commands.
11. **Downstream Relationship:** Delivers regulated DC field current into `comp-field-winding`.
12. **Important Engineering Parameters:** Ceiling voltage ratio (typically `1.6–2.0×` rated field voltage for transient grid stability), response time (`< 50 ms` for static thyristor systems), DC field current rating.
13. **Typical Operating Considerations:** De-excitation crowbar must safely dissipate stored inductive rotor magnetic energy ($\frac{1}{2} L_f I_f^2$) within seconds during an internal generator electrical fault trip.
14. **Potential Failure Modes:** Carbon brush arcing/rapid wear on collector rings; thyristor bridge fuse failure or cooling fan fault; AVR feedback PT loss causing dangerous over-excitation trip; field breaker contact welding.
15. **Maintenance Considerations:** Brush length/spring-tension replacement, slip-ring surface turning/cleaning, AVR calibration & step-response testing during planned outages, rectifier cabinet filter cleaning.
16. **3D Representation Requirements:** Compact control/rectifier cabinet alongside generator deck (`#2A3644` with cyan status panel) connected visually by DC bus leads to the top shaft slip-ring housing.
17. **User Interaction Behavior:** Selecting traces DC excitation feed down to the rotor field poles; explains voltage vs. frequency separation (governor controls active power/frequency; exciter controls voltage/reactive power).
18. **Related Energy Journey Stages:** `stage-06-electrical-generation`
19. **Related Simulation Variables:** Auxiliary excitation power loss factored within `generatorEfficiency`.
20. **Educational Explanation:** *General principle:* Many students think spinning the turbine faster increases voltage—no! On a grid-tied generator, speed MUST stay fixed at synchronous speed (`250 rpm`). Instead, the **excitation system** acts like a magnetic dimmer switch, adjusting rotor magnetism to control voltage and reactive power.

#### D.6 `comp-bearings` — Bearings
1. **Component ID:** `comp-bearings`
2. **Official Name:** Bearings
3. **Alternative Names:** Thrust & Guide Bearings (Tilting-Pad Hydrodynamic Bearings)
4. **Parent Subsystem:** `sub-generator` (also includes turbine guide bearing near shaft seal)
5. **Physical Location:** Upper/lower generator bearing brackets surrounding `comp-main-shaft` (combining an axial **Thrust Bearing** above or below the rotor and radial **Guide Bearings** along the shaft).
6. **Purpose:** Support the entire vertical axial weight of the rotating assembly plus downward hydraulic water thrust on the runner while maintaining concentric radial alignment of the rotor inside the narrow stator air gap with ultra-low friction.
7. **Engineering Principle:** **Hydrodynamic Tilting-Pad Oil-Film Lubrication (Reynolds Equation):** As the rotating thrust collar drags oil into tapered wedge clearances under self-pivoting white-metal (Babbitt) pads, fluid film pressure rises enough to float hundreds of metric tons of rotating mass on an oil film roughly `30–80 µm` thick with zero metal-to-metal contact once running. High-pressure oil-jacking lift pumps inject oil beneath pads during low-speed startup/shutdown before the hydrodynamic wedge forms.
8. **Construction and Materials:** Cast/fabricated steel bearing housing oil pot, mirror-finished forged steel thrust runner collar, pivoted Babbitt-lined (tin-antimony-copper alloy) or PTFE-faced tilting pads mounted on spherical pivots/springs, immersed water-cooled copper/stainless oil-cooler coils, high-pressure startup oil-lift pump manifold, and embedded pad RTDs.
9. **Operating Mechanism:** Stationary oil bath and self-pumping collar grooves circulate turbine oil continuously past tilting shoes and water-cooled heat exchangers; guide bearing pads center radial shaft runout within microns.
10. **Upstream Relationship:** Physically supports `comp-main-shaft`, `comp-rotor`, and `comp-runner` loads.
11. **Downstream Relationship:** Transfers full static weight and dynamic hydraulic thrust into powerhouse concrete structure; rejects friction heat into `comp-cooling-system`.
12. **Important Engineering Parameters:** Axial thrust load capacity (hundreds of metric tons, plant-dependent), normal Babbitt pad operating temperature (`~55–75 °C`, alarm `~85–90 °C`, trip `~95–100 °C`), mechanical friction loss (`~0.2–0.5%` of unit output, factored into `generatorEfficiency` / mechanical windage-friction).
13. **Typical Operating Considerations:** Never run below minimum speed without high-pressure lift oil active (risk of wiping soft Babbitt surface); verify electrical shaft-current insulation on upper bearing bracket to prevent EDM bearing pitting.
14. **Potential Failure Modes:** Babbitt pad wiping due to oil-lift failure or cooling loss; water contamination emulsifying bearing oil; shaft-voltage circulating currents causing electrical pitting; oil seal vapor leakage contaminating stator windings.
15. **Maintenance Considerations:** Periodic oil viscosity/moisture/wear-metal lab analysis, pad clearance & contact-pattern checking, oil-cooler pressure testing, shaft-grounding brush maintenance.
16. **3D Representation Requirements:** Distinct steel bearing bracket spider arms and cylindrical oil-bath pot housing encircling shaft journals above/below the rotor (`#586776`) with radial pad collar detail visible in Section Cut.
17. **User Interaction Behavior:** Section cut clearly reveals how the thrust collar carries the full vertical weight of rotor + shaft + runner.
18. **Related Energy Journey Stages:** `stage-05-mechanical-transmission` and `stage-06-electrical-generation`
19. **Related Simulation Variables:** Friction loss fraction inside `generatorEfficiency` and smooth `rotationalSpeedRpm` operation.
20. **Educational Explanation:** *General principle:* How do you hang 300+ tons spinning at 250 rpm without grinding metal into dust? Tilting-pad bearings use clever wedge geometry so the spinning shaft itself pumps pressurized oil underneath its shoes, levitating the entire rotor-turbine stack on a film of oil thinner than a sheet of paper.

#### D.7 `comp-cooling-system` — Cooling System
1. **Component ID:** `comp-cooling-system`
2. **Official Name:** Cooling System
3. **Alternative Names:** Generator Air-to-Water Heat Exchangers, Closed-Loop Ventilation & Bearing Cooling
4. **Parent Subsystem:** `sub-generator`
5. **Physical Location:** Finned radiator coolers mounted symmetrically around the outer circumference of `comp-stator` inside `comp-generator-housing`, plus cooling water manifolds to `comp-bearings`.
6. **Purpose:** Continuously remove heat generated by stator copper $I^2R$ losses, stator iron core losses, rotor field $I^2R$ losses, windage drag, and bearing friction so electrical insulation and bearing Babbitt remain well within safe thermal limits.
7. **Engineering Principle:** Forced closed-loop air convection + water-cooled heat exchange ($Q_{\text{heat}} = \dot{m}_{\text{air}} c_p \Delta T_{\text{air}} = U A \Delta T_{\text{lm}}$): rotor spider arms and fan blades pump warm air outward through rotor poles, across the air gap, through radial stator core ducts, and out through circumferential finned air-to-water heat exchangers before recirculating cool air back to rotor top/bottom.
8. **Construction and Materials:** Radial cupronickel or stainless-steel finned-tube air-to-water heat exchanger banks bolted onto outer stator frame openings, closed-loop cooling water booster pumps, strainers, thermostatic control valves, and river/penstock raw-water secondary heat exchangers.
9. **Operating Mechanism:** As electrical load increases, stator $I^2R$ losses rise quadratically ($I^2 R$), raising generator air temperature; modulated cooling water flow through finned coils maintains cold air inlet around `~35–40 °C` and avoids moisture condensation during cold standby.
10. **Upstream Relationship:** Absorbs thermal losses rejected by `comp-stator`, `comp-stator-winding`, `comp-field-winding`, and `comp-bearings`.
11. **Downstream Relationship:** Transfers rejected low-grade heat into plant cooling-water return discharged safely downstream.
12. **Important Engineering Parameters:** Heat rejection duty (typically `~1.5–3.0%` of rated MW, i.e., `~0.7–1.4 MW` thermal heat removed on a `45 MW` unit!), cold/hot air design delta (`~40 °C → 65 °C`), cooling water flow rate.
13. **Typical Operating Considerations:** Maintain cooling water pressure slightly lower or carefully monitored against leakage inside generator pit; prevent biological fouling or silt buildup inside finned tubes.
14. **Potential Failure Modes:** Tube fouling/scaling reducing heat transfer and triggering stator over-temperature derating; cooling water tube leak spraying moisture onto high-voltage windings; raw-water strainer blockage.
15. **Maintenance Considerations:** Automated backwash strainer flushing, seasonal acid/mechanical tube descaling, hydrostatic leak testing of exchanger headers, flow-switch alarm verification.
16. **3D Representation Requirements:** Circumferential array of ribbed radiator heat-exchanger modules (`#4A6278`) mounted around the stator outer wall with visible cooling-water supply/return manifolds.
17. **User Interaction Behavior:** Isolating shows closed air circulation path arrows around stator core ducts and coolers; explains why `1–3%` inefficiency equals megawatts of real heat!
18. **Related Energy Journey Stages:** `stage-06-electrical-generation` (explains thermal losses)
19. **Related Simulation Variables:** Directly governs thermal sustainability of `1 - generatorEfficiency` loss power (`P_m - P_e`).
20. **Educational Explanation:** *General principle:* Even at an impressive `97%` generator efficiency, a `45 MW` hydro generator converts roughly `1.4 MW` of mechanical input straight into heat—equivalent to running nearly a thousand household space heaters inside an enclosed concrete room! Closed-loop air coolers carry that heat safely away into water pipes.

#### D.8 `comp-generator-housing` — Generator Housing
1. **Component ID:** `comp-generator-housing`
2. **Official Name:** Generator Housing
3. **Alternative Names:** Generator Enclosure, Air Barrel, Pit Liner & Upper Cover
4. **Parent Subsystem:** `sub-generator`
5. **Physical Location:** Cylindrical outer steel/concrete enclosure on the powerhouse generator floor surrounding `comp-stator`, `comp-rotor`, and `comp-cooling-system`.
6. **Purpose:** Form a sealed closed-loop ventilation chamber for cooling air, attenuate acoustic noise, protect personnel from high-voltage windings and high-speed rotating parts, and support upper bearing bridges and auxiliary sensors.
7. **Engineering Principle:** Sealed structural pressure/containment shell engineered for low acoustic transmission, dust/moisture exclusion (preventing airborne contaminants from fouling HV windings), and fire-containment safety (`CO2` or water-mist suppression integration).
8. **Construction and Materials:** Rolled structural steel cylindrical barrel (or concrete-lined pit barrel with removable steel upper deck covers/hatches), reinforced access doors with safety interlocks, acoustic insulation liner, and observation/fire-suppression ports.
9. **Operating Mechanism:** Passive structural and airflow boundary keeping chilled recirculated air contained and guided strictly through stator cooling ducts and heat exchangers rather than leaking into the generator hall.
10. **Upstream Relationship:** Mechanically bolted to powerhouse deck framing around `comp-stator` and `comp-cooling-system`.
11. **Downstream Relationship:** Supports access openings for `comp-excitation-system` leads and `comp-generator-terminal` phase bus exits.
12. **Important Engineering Parameters:** Housing outer diameter (plant-dependent, illustrative `~7–9 m` barrel), acoustic attenuation (`< 85 dBA` at 1 m on floor), enclosure ingress/air-tightness rating.
13. **Typical Operating Considerations:** Keep access doors dogged tight during operation so cooling airflow pressure drops don't short-circuit ventilation; verify fire-interlock dampers before startup.
14. **Potential Failure Modes:** Door gasket deterioration causing hot-air leaks into powerhouse; panel rattle vibration; condensation drip onto stator end-turns if internal space heaters fail while idle.
15. **Maintenance Considerations:** Door seal inspection, internal anti-condensation heater function check during shutdowns, paint/corrosion maintenance, safety interlock verification.
16. **3D Representation Requirements:** Clean cylindrical industrial slate/graphite outer barrel (`#2B3540`) with upper spider-access hatch and subtle louver/inspection detailing; smoothly fades (`opacity: 0.15`) or explodes upward in Anatomy/Journey views to reveal rotor & stator inside.
17. **User Interaction Behavior:** Toggle transparency / Hide to inspect internal generator assembly without leaving full-plant context.
18. **Related Energy Journey Stages:** `stage-06-electrical-generation` (visual cutaway shell)
19. **Related Simulation Variables:** Passive boundary for `sub-generator`.
20. **Educational Explanation:** *General principle:* In a real hydro powerhouse hall, you rarely see the giant spinning rotor directly—this protective steel barrel seals in cooled air, blocks dust, contains noise, and keeps engineers safe from `11,000-volt` copper bars and moving multi-ton steel inside.

---

## 7. Detailed Component Specifications (Subsystems E & F)

### Subsystem E: Electrical Transmission (`sub-electrical-transmission`)

#### E.1 `comp-generator-terminal` — Generator Terminal
1. **Component ID:** `comp-generator-terminal`
2. **Official Name:** Generator Terminal
3. **Alternative Names:** Stator Output Terminals, Terminal Box & Star-Point Neutral Cubicle
4. **Parent Subsystem:** `sub-electrical-transmission`
5. **Physical Location:** Terminal chamber mounted on the outer wall of `comp-generator-housing` (phase side and neutral star-point side).
6. **Purpose:** Provide the insulated electrical transition point collecting three-phase high-current power leads from `comp-stator-winding` into external busbars while housing metering/protection current transformers (CTs) and surge arresters.
7. **Engineering Principle:** Three-phase star (wye) connected AC termination ($P_e = \sqrt{3} V_L I_L \cos\phi$) where neutral ends connect through a high-resistance or distribution-transformer grounding cubicle to limit single-line-to-ground fault currents and avoid destructive stator core iron burning.
8. **Construction and Materials:** Non-magnetic aluminum or stainless-steel terminal enclosure (prevents inductive eddy-current heating around heavy phase currents), glazed porcelain or epoxy stand-off bushings, bolted silver-plated copper terminal flags with flexible laminated copper expansion shunts, ring-type protection/metering CTs, and neutral-grounding transformer/resistor panel.
9. **Operating Mechanism:** Stationary electrical junction conducting full three-phase generator output current (`~2.4–2.6 kA` at `11 kV` class) safely out of the housing while isolating mechanical vibration via flexible braided shunts.
10. **Upstream Relationship:** Receives induced three-phase AC current directly from `comp-stator-winding` collector rings.
11. **Downstream Relationship:** Feeds directly into `comp-busbar`.
12. **Important Engineering Parameters:** Rated line-to-line voltage (illustrative `11.0 kV` RMS, `50 Hz`), rated continuous current (`~2,500–3,000 A` class), Basic Impulse Insulation Level (`BIL`, e.g., `75–95 kV`), short-time fault withstand rating.
13. **Typical Operating Considerations:** Inspect thermal imaging of bolted joints for loose-connection hotspots; verify neutral grounding resistor continuity and PT/CT secondary shorting blocks.
14. **Potential Failure Modes:** Loose terminal lug overheating/arcing; moisture condensation flashover across porcelain bushings; CT secondary open-circuit overvoltage; surge-arrester failure.
15. **Maintenance Considerations:** Infrared thermography during load runs, contact-resistance micro-ohm (Ductor) tests across bolted flex-links, bushing insulator cleaning, torque verification.
16. **3D Representation Requirements:** Metallic terminal housing protruding from side of `comp-generator-housing` (`#364454`) with three distinct phase insulator bushings (`Phase A/B/C`) leading into enclosed bus duct.
17. **User Interaction Behavior:** Selecting focuses electrical exit wall of powerhouse and shows `3-Phase 11 kV` voltage/current flow transition.
18. **Related Energy Journey Stages:** `stage-06-electrical-generation` (output) and `stage-07-voltage-transformation` (inlet)
19. **Related Simulation Variables:** `electricalGeneratedPowerW`, `deliveredElectricalPowerW`.
20. **Educational Explanation:** *General principle:* Before electricity can head out to a national power grid, the generator's stator coils must tie together cleanly—three live phase leads carry outgoing power while the neutral ends meet in a controlled grounding path that protects the core during faults.

#### E.2 `comp-busbar` — Busbar
1. **Component ID:** `comp-busbar`
2. **Official Name:** Busbar
3. **Alternative Names:** Isolated Phase Bus (IPB) / Segregated Phase Bus Duct, Main Generator Bus
4. **Parent Subsystem:** `sub-electrical-transmission`
5. **Physical Location:** Overhead or gallery-mounted metal-enclosed bus duct running between `comp-generator-terminal`, `comp-circuit-breaker`, and the low-voltage bushings of `comp-step-up-transformer`.
6. **Purpose:** Conduct heavy three-phase AC power at generator terminal voltage cleanly and safely between the generator and step-up transformer with minimal resistive loss, phase-to-phase fault risk, and electromagnetic interference.
7. **Engineering Principle:** Low-resistance high-ampacity conductor sizing ($P_{\text{loss}} = 3 I_{\text{phase}}^2 R_{\text{ac}}$); in Isolated Phase Bus (IPB) construction, each phase conductor sits centered inside an individual grounded aluminum sheath so induced shield currents nearly cancel external magnetic fields around adjacent steel powerhouse beams and eliminate phase-to-phase short circuits.
8. **Construction and Materials:** Hollow tubular or channel-section aluminum or copper conductors supported by porcelain/epoxy post insulators inside weatherproof grounded aluminum enclosures, fitted with flexible braided expansion joints, desiccant breathers / pressurized dry-air systems, and tap-off leads for station service & excitation transformers.
9. **Operating Mechanism:** Passive heavy-duty electrical highway bridging powerhouse indoor switchgear to the outdoor transformer bay.
10. **Upstream Relationship:** Connects directly to `comp-generator-terminal`.
11. **Downstream Relationship:** Feeds through `comp-circuit-breaker` into `comp-step-up-transformer` primary terminals.
12. **Important Engineering Parameters:** Rated voltage (`11.0 kV` illustrative), continuous current rating (`~3,000 A` class), busbar thermal rise limit (`<= 65 K` ambient rise per IEEE C37.23), short-circuit peak withstand (`~80–150 kA` peak).
13. **Typical Operating Considerations:** Maintain dry, dust-free interior enclosure air (anti-condensation heaters or low-pressure dry air purge) to avoid insulator surface tracking.
14. **Potential Failure Modes:** Insulator tracking flashover from moisture/condensation; support insulator cracking from short-circuit electrodynamic forces; overheating at improperly torqued flex-links; enclosure gasket leaks.
15. **Maintenance Considerations:** Thermography along enclosure joints, contact-resistance testing across bolted flex connectors, insulator cleaning and Megger insulation checks, heater continuity testing.
16. **3D Representation Requirements:** Three parallel cylindrical metallic phase ducts (`#8B98A5` aluminum housings with subtle `#36C5D9` energy pulse indicators) spanning neatly from generator hall wall through breaker bay to transformer bay.
17. **User Interaction Behavior:** Isolating traces exact electrical continuity between indoor generator hall and outdoor transformer yard.
18. **Related Energy Journey Stages:** `stage-07-voltage-transformation`
19. **Related Simulation Variables:** `deliveredElectricalPowerW` (minimal $I^2R$ busbar drop within `generatorEfficiency` / plant margin).
20. **Educational Explanation:** *Why heavy aluminum tubes instead of flexible cables?* At `11 kV` and `45 MW`, the generator pushes roughly `2,400 amperes` per phase—far too massive for ordinary insulated cables. Rigid metal-enclosed busbars keep phases physically isolated and dissipate heat safely.

#### E.3 `comp-circuit-breaker` — Circuit Breaker
1. **Component ID:** `comp-circuit-breaker`
2. **Official Name:** Circuit Breaker
3. **Alternative Names:** Generator Circuit Breaker (GCB) / Synchronizing Breaker
4. **Parent Subsystem:** `sub-electrical-transmission`
5. **Physical Location:** Inline along `comp-busbar` between `comp-generator-terminal` and `comp-step-up-transformer` (or paired on the high-voltage switchyard bay side).
6. **Purpose:** Synchronize the generator smoothly onto the live electrical grid, carry continuous load current safely, and interrupt massive normal or short-circuit fault currents within milliseconds to protect the generator and transformer.
7. **Engineering Principle:** **Controlled Arc Interruption at AC Current Zero-Crossing:** Pulling apart live contacts under thousands of amperes creates a superheated plasma arc. Vacuum interrupters or compressed `SF6` / clean-air blast chambers stretch, cool, and de-ionize the arc channel so dielectric strength recovers faster than the Transient Recovery Voltage (TRV) right at natural AC zero-crossing ($i(t) = 0$ occurring `100 times/s` at `50 Hz`). Synchronizing relays close contacts ONLY when generator voltage magnitude, frequency, and phase angle match the grid (`Δθ ≈ 0°`).
8. **Construction and Materials:** Three-pole interrupter chambers (vacuum bottles or `SF6`/gas puffer poles), silver/copper-tungsten main and arcing contacts, spring-hydraulic stored-energy operating mechanism, current transformers, and parallel surge capacitors / disconnect switches.
9. **Operating Mechanism:** Remains open during turbine startup and speed ramp until automatic synchronizer verifies phase match (`< ±5°`), then snaps closed in `~40–60 ms`. On protective relay trip (differential, overcurrent, reverse power, overspeed), trip coil releases stored spring energy to interrupt full fault current in `2–3` AC cycles (`~40–60 ms`).
10. **Upstream Relationship:** Connects between `comp-busbar` (generator side) and downstream transformer feed.
11. **Downstream Relationship:** Feeds `comp-step-up-transformer` (plus switchyard HV breaker coordination).
12. **Important Engineering Parameters:** Rated voltage (`11–15 kV` class GCB), continuous current (`~3,000 A`), symmetrical interrupting rating (typically `40–63 kA` RMS; generator-fed faults exhibit high DC-offset asymmetry requiring special IEEE C37.013 GCB duty), total break time (`~40–60 ms`).
13. **Typical Operating Considerations:** Out-of-phase closing causes catastrophic shaft torsional shock and transformer winding collapse; monitor gas pressure / vacuum integrity and trip-coil supervision continuously.
14. **Potential Failure Modes:** Contact erosion after repeated fault trips; trip-coil open circuit or mechanism spring latch failure ("breaker failure"); `SF6` seal leak / vacuum loss; pole-discrepancy (one phase failing to close/open).
15. **Maintenance Considerations:** Contact timing & travel-curve analyzer tests, static/dynamic contact resistance measurement, gas dew-point/purity checks (if gas-insulated) or vacuum bottle hi-pot checks, trip/close coil battery testing.
16. **3D Representation Requirements:** Distinct three-pole switchgear cubicle/interrupter assembly (`#384858` with visible three porcelain/composite pole cylinders and status indicator) placed clearly along the busbar run.
17. **User Interaction Behavior:** Tooltip contrasts open/closed states across `OperatingCondition` (`shutdown`/`startup` open vs. `normal` synchronized closed).
18. **Related Energy Journey Stages:** `stage-07-voltage-transformation` (protection/synchronization gate)
19. **Related Simulation Variables:** Synchronized grid tie status (`OperatingCondition` gate allowing `deliveredElectricalPowerW > 0`).
20. **Educational Explanation:** *General principle:* You cannot just turn off `45 MW` of spinning electrical power with a household light switch—air would explode into an arc flash. A generator circuit breaker traps and extinguishes that arc safely inside `~0.05 seconds` at the exact instant AC current crosses zero.

#### E.4 `comp-step-up-transformer` — Step-Up Transformer
1. **Component ID:** `comp-step-up-transformer`
2. **Official Name:** Step-Up Transformer
3. **Alternative Names:** Generator Step-Up Transformer (GSU), Main Power Transformer
4. **Parent Subsystem:** `sub-electrical-transmission`
5. **Physical Location:** Concrete outdoor transformer bay immediately outside the powerhouse wall, between the generator busbar exit and `comp-switchyard`.
6. **Purpose:** Transform generated medium-voltage, high-current AC (`~11 kV`) into high-voltage, low-current AC (`~110–220 kV` class) so bulk power transmits long distances with drastically reduced $I^2R$ line losses.
7. **Engineering Principle:** **Mutual Electromagnetic Induction & Joule Heating Reduction:**
   $$\frac{V_2}{V_1} = \frac{N_2}{N_1}, \qquad I_2 = I_1 \frac{N_1}{N_2} \text{ (ideal)}, \qquad P_{\text{line,loss}} = 3 I_2^2 R_{\text{line}} \propto \frac{1}{V_2^2}$$
   Stepping voltage up `10×` (e.g., `11 kV → 110 kV`) or `20×` (`11 kV → 220 kV`) drops transmission current by `10×` or `20×`—cutting resistive line heat losses by **`100×` or `400×`**!
8. **Construction and Materials:** Three-limb grain-oriented electrical steel core, concentric copper primary (Delta) and secondary (Wye-grounded) windings, thermally upgraded Kraft paper insulation immersed in insulating mineral or ester transformer oil inside a heavy welded steel tank, external radiator fin banks with cooling fans (`ONAN/ONAF`), conservator expansion tank with Buchholz gas relay, HV porcelain/composite condenser bushings, and fire-containment oil pit.
9. **Operating Mechanism:** Stationary electromagnetic device operating continuously near `~99.2–99.7%` efficiency; dissipates small no-load core magnetization losses and load-dependent copper $I^2R$ losses via oil thermosyphon circulation through radiator banks.
10. **Upstream Relationship:** Primary LV terminals receive `11 kV` AC from `comp-busbar` / `comp-circuit-breaker`.
11. **Downstream Relationship:** Secondary HV bushings connect via overhead conductors into `comp-switchyard`.
12. **Important Engineering Parameters:** MVA rating (illustrative `50–55 MVA` class matching ~`45 MW` at `0.85–0.90` power factor), voltage ratio (illustrative `11 kV / 132 kV` or `11 kV / 220 kV`, plant-dependent), impedance `%Z` (`~10–14%` typical), cooling class (`ONAN/ONAF`), efficiency (`~99.4%` at rated load).
13. **Typical Operating Considerations:** Monitor top-oil and winding hot-spot temperatures, dissolved gas analysis (DGA) for arcing/overheating indicators, tap-changer position (off-circuit or on-load), and Buchholz relay gas alarms.
14. **Potential Failure Modes:** Winding insulation breakdown from moisture or lightning/switching surge; turn-to-turn short circuit triggering Buchholz/differential trip; HV bushing oil leak or partial discharge explosion; radiator fan/pump cooling fault.
15. **Maintenance Considerations:** Periodic oil Dissolved Gas Analysis (DGA), moisture/dielectric breakdown tests, Doble bushing & winding tan-delta testing, Sweep Frequency Response Analysis (SFRA), silica-gel breather drying, thermography.
16. **3D Representation Requirements:** Signature industrial steel main tank (`#3A4654`) flanked by radiator fin banks, top cylindrical oil conservator drum, 3 angled tall porcelain HV bushings (`#9EB2C2`), and 3 compact LV bus-duct inlets, placed inside a concrete containment bund wall.
17. **User Interaction Behavior:** Prominent centerpiece of Stage 07 (`stage-07-voltage-transformation`); section cut reveals internal three-limb iron core and concentric copper coils!
18. **Related Energy Journey Stages:** `stage-07-voltage-transformation`
19. **Related Simulation Variables:** Transfers `deliveredElectricalPowerW` cleanly (with note in Insights about minor ~`0.5%` transformer/grid-tie losses beyond generator terminal metrics).
20. **Educational Explanation:** *Why step voltage up so high?* Because wire heat loss grows with the **square of current** ($I^2R$). Carrying `45 MW` over 50 km at `11 kV` (`~2,360 A`) would waste tens of percent heating the air; stepping up to `132 kV` drops current to `~197 A`, slashing line losses by over **`144×`**!

#### E.5 `comp-switchyard` — Switchyard
1. **Component ID:** `comp-switchyard`
2. **Official Name:** Switchyard
3. **Alternative Names:** High-Voltage Substation, Outdoor Switchyard Bay
4. **Parent Subsystem:** `sub-electrical-transmission`
5. **Physical Location:** Fenced gravel-surfaced outdoor high-voltage yard adjacent to the transformer bay and take-off transmission gantry.
6. **Purpose:** Safely switch, meter, protect, and route high-voltage power from the step-up transformer onto outgoing regional transmission lines while providing lightning surge arrest and visible maintenance isolation.
7. **Engineering Principle:** Air-insulated high-voltage phase clearances (governed by BIL and phase-to-ground/phase-to-phase dielectric breakdown margins), busbar buswork redundancy (e.g., single-bus, breaker-and-a-half, or ring-bus topologies), instrument transformer voltage/current scaling (`PT/CVT` & `CT`) for protective relaying, and metal-oxide varistor (MOV) surge clamping.
8. **Construction and Materials:** Crushed stone grounding grid surface (controls step-and-touch fault potentials), galvanized steel lattice portal gantries and equipment support stands, HV circuit breakers, motorized air-break disconnect switches, surge arresters, CTs, CVTs, aluminum tubular busbars, and protective ground mat.
9. **Operating Mechanism:** Motorized disconnect switches provide visible air-gap isolation ONLY after HV breakers open; protective relays monitor differential, distance, and overvoltage faults across the yard.
10. **Upstream Relationship:** Connects from HV secondary bushings of `comp-step-up-transformer`.
11. **Downstream Relationship:** Feeds outgoing dead-end gantry spans onto `comp-transmission-line`.
12. **Important Engineering Parameters:** Nominal system voltage (`132 kV` / `220 kV` class, plant-dependent), phase-to-phase air clearance, ground-grid resistance (`< 1 Ω` typical target), BIL rating (`550–950 kV` class).
13. **Typical Operating Considerations:** Strict lock-out/tag-out interlocking prevents opening disconnect switches under load; vegetation/bird/insulator contamination flashover mitigation.
14. **Potential Failure Modes:** Insulator pollution flashover in humid/coastal air; disconnect switch contact hot-spots; surge arrester thermal runaway; relay/DC battery auxiliary trip failure.
15. **Maintenance Considerations:** Infrared hotspot sweeps, breaker timing tests, insulator washing/RTV silicone coating, ground-grid impedance testing, protective relay secondary injection calibration.
16. **3D Representation Requirements:** Realistic compact outdoor HV bay (`#7D8A97` galvanized steel gantry frame, tall porcelain insulator stacks, HV breaker poles, disconnect blades, and overhead strung aluminum bus connections).
17. **User Interaction Behavior:** Isolating highlights electrical path from transformer HV bushings across disconnect switches to outgoing gantry insulators.
18. **Related Energy Journey Stages:** `stage-08-power-transmission`
19. **Related Simulation Variables:** Grid connection point delivering `deliveredElectricalPowerW`.
20. **Educational Explanation:** *General principle:* A switchyard is the traffic interchange between the power plant and the national grid—isolating faults in milliseconds, clamping lightning strikes, and safely decoupling equipment with visible open switches for maintenance crews.

#### E.6 `comp-transmission-line` — Transmission Line
1. **Component ID:** `comp-transmission-line`
2. **Official Name:** Transmission Line
3. **Alternative Names:** High-Voltage Overhead Transmission Line, Take-Off Line
4. **Parent Subsystem:** `sub-electrical-transmission`
5. **Physical Location:** Overhead steel lattice towers and catenary phase conductors departing `comp-switchyard` take-off gantry toward the regional grid corridor.
6. **Purpose:** Transport high-voltage three-phase electrical energy efficiently across tens or hundreds of kilometers from the remote hydroelectric river gorge to population and industrial load centers.
7. **Engineering Principle:** Three-phase AC power transfer across transmission line reactance ($P \approx \frac{V_s V_r}{X} \sin\delta$), balancing resistive Joule losses ($I^2 R$), corona discharge limits, sag-tension mechanical catenary physics, and thermal ampacity.
8. **Construction and Materials:** Aluminum Conductor Steel Reinforced (`ACSR`) stranded phase conductors (aluminum outer strands for conductivity + steel inner core for tensile strength), overhead ground/shield wires (OPGW) above phases for lightning diversion, glass/ceramic/polymer suspension insulator strings, and galvanized steel lattice towers anchored on concrete foundations.
9. **Operating Mechanism:** Passive electromagnetic wave/power corridor carrying active (`MW`) and reactive (`MVAR`) power continuously in phase equilibrium with grid impedance.
10. **Upstream Relationship:** Terminates cleanly at `comp-switchyard` outgoing dead-end gantry.
11. **Downstream Relationship:** Delivers bulk electricity into `comp-electrical-grid`.
12. **Important Engineering Parameters:** Line voltage (`132 kV` / `220 kV` illustrative), thermal ampacity, surge impedance loading (SIL), phase conductor configuration and ground clearance.
13. **Typical Operating Considerations:** Conductor thermal sag increases during high ambient heat + heavy current; wind-induced aeolian vibration and galloping; lightning trip auto-reclose coordination.
14. **Potential Failure Modes:** Lightning back-flashover across insulator strings; tree encroachment / phase-to-ground fault; extreme ice/wind mechanical tower loading; corroded splice overheating.
15. **Maintenance Considerations:** Helicopter/drone LiDAR clearance & corona UV/IR inspections, insulator string integrity testing, tower foundation & guy inspection, vegetation corridor clearing.
16. **3D Representation Requirements:** Steel lattice transmission tower + catenary triple-phase conductors (`#9AA6B2`) with suspension insulator strings and restrained animated yellow-cyan energy flow pulses (`#F5B942` / `#36C5D9`) heading to grid boundary.
17. **User Interaction Behavior:** Animated energy flow velocity/pulse density scales proportionally with `deliveredElectricalPowerW` in Simulator and Journey Stage 08.
18. **Related Energy Journey Stages:** `stage-08-power-transmission`
19. **Related Simulation Variables:** `deliveredElectricalPowerW`, `requestedLoadW`.
20. **Educational Explanation:** *General principle:* Hydroelectric plants sit where valleys and rivers exist—often far from cities. High-voltage ACSR lines carry power over long distances with minimal loss using thin overhead shield wires above to intercept lightning before it strikes the live phases below.

#### E.7 `comp-electrical-grid` — Electrical Grid
1. **Component ID:** `comp-electrical-grid`
2. **Official Name:** Electrical Grid
3. **Alternative Names:** Interconnected Power Grid, Bulk Transmission Network & Load Center
4. **Parent Subsystem:** `sub-electrical-transmission`
5. **Physical Location:** Downstream boundary node at the far end of `comp-transmission-line` representing the interconnected synchronous power system and consumer loads.
6. **Purpose:** Represent the external synchronized alternating-current system that absorbs generated electricity, sets nominal grid frequency (`50 Hz` or `60 Hz`), and imposes dynamic consumer electrical load demand (`requestedLoadW`).
7. **Engineering Principle:** **Active Power Balance & Frequency Lock:** Across an interconnected AC grid, total instantaneous generation must continuously match total consumer load plus losses ($\sum P_{\text{gen}} = \sum P_{\text{load}} + P_{\text{loss}}$). Because a single plant (`~45 MW`) couples synchronously into a much larger grid, grid frequency (`50 Hz`) dictates the rotor's locked synchronous speed (`250 rpm`), while load demand governs electrical torque opposing the turbine.
8. **Construction and Materials:** Conceptual representation of substations, interconnected generation plants, distribution transformers, and industrial/residential end-use loads beyond the plant fence.
9. **Operating Mechanism:** Requests active power (`requestedLoadW` in DENRYU Simulator). If available plant generation (`electricalGeneratedPowerW`) is less than requested load, a **power deficit** exists (`deliveredElectricalPowerW = available`); in a real grid, other plants must pick up the deficit or frequency sags / under-frequency load shedding occurs.
10. **Upstream Relationship:** Receives transmitted power from `comp-transmission-line`.
11. **Downstream Relationship:** Terminal electrical energy sink of the DENRYU system boundary.
12. **Important Engineering Parameters:** System nominal frequency (`50 Hz` illustrative; configurable `50/60 Hz`), requested plant dispatch load (`requestedLoadW`, default `40.0 MW` vs. `~44 MW` nominal output), grid tie status.
13. **Typical Operating Considerations:** Generator governor droop response (`~4–5%` typical) helps share sudden system frequency deviations across interconnected hydro units smoothly.
14. **Potential Failure Modes:** External grid short-circuit faults, voltage collapse, frequency excursions outside protection relay limits (`e.g., < 47.5 Hz` or `> 51.5 Hz`), loss-of-synchronism / islanding events.
15. **Maintenance Considerations:** Out of plant direct maintenance scope; coordinated through Regional Grid Dispatch / System Operator protection settings and telemetry tests.
16. **3D Representation Requirements:** Clean schematic substation/horizon pylon termination node (`#202C37` with restrained `#F5B942` load-sink emblem) visibly terminating the transmission corridor at the edge of the 3D diorama plinth.
17. **User Interaction Behavior:** Selecting opens explanation of **why load changes do NOT freely change synchronous rotor speed** and links directly to Scenario E (`Load Variation`) in Generation Simulator.
18. **Related Energy Journey Stages:** `stage-08-power-transmission`
19. **Related Simulation Variables:** `requestedLoadW`, `deliveredElectricalPowerW`, `gridFrequencyHz`, `rotationalSpeedRpm` (`n_s`).
20. **Educational Explanation:** *Crucial misconception corrected:* Beginners often assume increasing electrical load slows down a hydro generator arbitrarily—or reducing water makes it spin at half speed while still on the grid. In reality, once synchronized to a large electrical grid, magnetic lock holds the generator strictly at `50 Hz` (`250 rpm`); changing load changes mechanical **torque** and guide-vane **flow demand**, not steady-state RPM!

---

### Subsystem F: Discharge (`sub-discharge`)

#### F.1 `comp-draft-tube-outlet` — Draft Tube Outlet
1. **Component ID:** `comp-draft-tube-outlet`
2. **Official Name:** Draft Tube Outlet
3. **Alternative Names:** Draft Tube Exit Portal, Tailwater Outlet Pier Bay
4. **Parent Subsystem:** `sub-discharge`
5. **Physical Location:** Downstream submerged powerhouse wall exit where `comp-draft-tube` emerges horizontally into `comp-tailrace`.
6. **Purpose:** Release low-velocity water smoothly below the minimum tailwater surface without allowing external air backflow into the draft tube, and house stoplog slots for turbine dewatering.
7. **Engineering Principle:** Submerged exit hydraulic seal: submerging the outlet soffit safely below minimum tailwater elevation ensures continuous liquid column vacuum integrity inside the draft tube diffuser while minimizing exit kinetic loss ($\frac{v_{\text{exit}}^2}{2g}$ kept small, typically `< 1–2%` of gross head).
8. **Construction and Materials:** Reinforced concrete twin or single rectangular exit portal bays divided by streamlined structural splitter piers, embedded stainless/painted steel stoplog guide slots, and overhead gantry crane / monorail hoist deck for stoplog gate placement.
9. **Operating Mechanism:** Continuously submerged underwater outlet during generation; stoplog gates drop down into vertical slots solely during turbine inspection outages so dewatering pumps can empty the draft tube and spiral casing safely.
10. **Upstream Relationship:** Direct downstream exit of `comp-draft-tube`.
11. **Downstream Relationship:** Discharges horizontally into `comp-tailrace`.
12. **Important Engineering Parameters:** Outlet exit velocity (typically `~1.5–2.8 m/s`, substantially slower than runner exit), minimum tailwater submergence above outlet crown (`>= 0.5–1.5 m`).
13. **Typical Operating Considerations:** Never drop stoplogs under flowing conditions unless specifically designed as emergency closure gates; check differential water pressure before lifting stoplogs after maintenance.
14. **Potential Failure Modes:** Stoplog guide siltation preventing tight seal during dewatering; concrete spalling around pier noses; uneven exit flow circulation if one bay clogs.
15. **Maintenance Considerations:** Stoplog rubber J-seal replacement, underwater concrete/guide slot cleaning before planned outages, overhead stoplog crane inspection.
16. **3D Representation Requirements:** Submerged concrete powerhouse portal piers with vertical stoplog grooves (`#6D7680`) transitioning into the open tailrace pool.
17. **User Interaction Behavior:** Water transparency toggle lets user view submerged outlet throat beneath tailwater surface.
18. **Related Energy Journey Stages:** `stage-09-water-discharge`
19. **Related Simulation Variables:** `actualFlowRateM3s` (mass flow continuity exits here unchanged), tailwater datum baseline for `netHeadM`.
20. **Educational Explanation:** *General principle:* Notice that the draft tube outlet stays completely underwater—if air could sneak backward up into the draft tube, the vacuum suction underneath the turbine runner would break immediately and efficiency would plunge.

#### F.2 `comp-tailrace` — Tailrace
1. **Component ID:** `comp-tailrace`
2. **Official Name:** Tailrace
3. **Alternative Names:** Tailrace Channel, Tailwater Pool
4. **Parent Subsystem:** `sub-discharge`
5. **Physical Location:** Engineered open channel extending immediately downstream from `comp-draft-tube-outlet` (and adjacent to spillway stilling apron) out toward the natural river.
6. **Purpose:** Convey turbined discharge smoothly away from the powerhouse without backing up tailwater elevation (which would steal net head) while absorbing turbulence before rejoining the natural river channel.
7. **Engineering Principle:** Open-channel subcritical flow (Manning's equation $Q = \frac{1}{n} A R_h^{2/3} S^{1/2}$): wide, gently sloped cross-section keeps tailwater elevation stable and defines the downstream reference datum ($Z_{\text{tailwater}}$) determining gross plant head ($H_{\text{gross}} = Z_{\text{headwater}} - Z_{\text{tailwater}}$).
8. **Construction and Materials:** Excavated rock or reinforced concrete trapezoidal/rectangular channel with riprap bank stabilization, training walls separating powerhouse outflow from spillway turbulence, and tailwater level gauging staff/transducer.
9. **Operating Mechanism:** Continuously collects steady outflow from the draft tube outlet and regulates downstream backpressure elevation naturally via channel geometry and river stage.
10. **Upstream Relationship:** Receives decelerated discharge from `comp-draft-tube-outlet`.
11. **Downstream Relationship:** Flows smoothly into `comp-downstream-channel`.
12. **Important Engineering Parameters:** Tailwater elevation ($Z_{\text{tw}}$, illustrative `~395 m` ASL, `90 m` below `485 m` headwater), channel width & roughness, tailwater rise curve vs. discharge ($Z_{\text{tw}}(Q)$).
13. **Typical Operating Considerations:** Rapid flow increases from `0 → 60 m³/s` during unit load pick-up create mild downstream surge waves; high river floods raise tailwater elevation, temporarily reducing available `Net Head (H)`.
14. **Potential Failure Modes:** Sediment bar deposition or rockslide raising tailwater elevation (reducing head and power output); bank erosion/undercutting during spillway co-discharge.
15. **Maintenance Considerations:** Periodic bathymetric dredging of gravel bars, riprap slope repair, tailwater level sensor calibration.
16. **3D Representation Requirements:** Wide concrete-walled channel pool (`#2589D8` translucent water over `#333E4A` channel bed) carrying slow, calm directional streamlines out of the powerhouse base.
17. **User Interaction Behavior:** Selecting emphasizes elevation datum difference relative to `comp-reservoir` and demonstrates head reduction during high tailwater.
18. **Related Energy Journey Stages:** `stage-09-water-discharge`
19. **Related Simulation Variables:** `actualFlowRateM3s`, lower datum reference for `netHeadM`.
20. **Educational Explanation:** *General principle:* Every meter that water backs up in the tailrace is one full meter of net head stolen directly from the turbine. Keeping the tailrace wide, deep, and unobstructed preserves maximum head across the Francis runner.

#### F.3 `comp-downstream-channel` — Downstream Channel
1. **Component ID:** `comp-downstream-channel`
2. **Official Name:** Downstream Channel
3. **Alternative Names:** Natural River Channel, Downstream River Reach
4. **Parent Subsystem:** `sub-discharge`
5. **Physical Location:** Downstream riverbed beyond the plant tailrace and spillway stilling apron limits.
6. **Purpose:** Return turbined (and any bypassed spillway) water cleanly back into the natural river ecosystem with preserved water volume, controlled velocity, and environmental flow continuity.
7. **Engineering Principle:** **Conservation of Mass (Non-Consumptive Energy Extraction):** Hydroelectric power extracts **gravitational potential and pressure energy**, NOT water molecules! Mass flow leaving the plant equals mass flow entering ($Q_{\text{out}} = Q_{\text{in}}$ in steady state), returning oxygen-managed water downstream for ecology, agriculture, and downstream communities.
8. **Construction and Materials:** Natural river morphology stabilized near the plant exit with river-training riprap and ecological monitoring gauging stations.
9. **Operating Mechanism:** Passive downstream river boundary receiving steady tailrace flow and periodic spillway flood releases.
10. **Upstream Relationship:** Receives continuous discharge from `comp-tailrace` and flood bypass from `comp-spillway`.
11. **Downstream Relationship:** Exits the DENRYU facility boundary into the natural watershed.
12. **Important Engineering Parameters:** Environmental minimum flow requirement (plant/regulatory dependent), river ramping rate limits (how rapidly discharge can increase/decrease to protect downstream river safety & aquatic habitat).
13. **Typical Operating Considerations:** Abrupt load rejections or rapid turbine startups cause downstream river level fluctuations; plants obey strict environmental ramping schedules.
14. **Potential Failure Modes:** Downstream riverbank erosion, rapid-ramping aquatic stranding (operational/environmental risk), gravel bar migration altering tailwater rating curve.
15. **Maintenance Considerations:** Downstream stream-gauge calibration, environmental dissolved-oxygen/temperature monitoring, bank stabilization checks.
16. **3D Representation Requirements:** Natural riverbed cutaway continuation (`#1F2A35` banks with `#2589D8` flowing water surface) exiting the far edge of the 3D diorama plinth.
17. **User Interaction Behavior:** Completes Stage 09 walkthrough with clear visual callout confirming mass conservation: `Water Returned = Water Entered (100% Volume Conserved)`.
18. **Related Energy Journey Stages:** `stage-09-water-discharge`
19. **Related Simulation Variables:** `actualFlowRateM3s` (exiting stream continuity).
20. **Educational Explanation:** *Closing engineering lesson:* Unlike coal or gas plants that burn fuel into exhaust gases, a hydroelectric plant does not consume water—it simply borrows water's elevation drop, converts that gravitational potential into electricity inside the Francis unit, and gives every drop back to the river downstream.

---

## 8. Authoritative Engineering References

1. **IEC 60041 (3rd ed., 1991, Corr. 1996):** *Field acceptance tests to determine the hydraulic performance of hydraulic turbines, storage pumps and pump-turbines.* International Electrotechnical Commission.
2. **IEC 60193 (Ed. 3.0, 2019):** *Hydraulic turbines, storage pumps and pump-turbines — Model acceptance tests.* International Electrotechnical Commission.
3. **USBR Engineering Monograph No. 20 (1954, rev. 1976):** *Selecting Hydraulic Reaction Turbines.* U.S. Department of the Interior, Bureau of Reclamation.
4. **USACE EM 1110-2-4205:** *Hydroelectric Power Plants Mechanical Design.* U.S. Army Corps of Engineers.
5. **USACE EM 1110-2-3006:** *Hydroelectric Power Plants Electrical Design.* U.S. Army Corps of Engineers.
6. **IEEE Std C50.12:** *IEEE Standard for 50 Hz and 60 Hz Synchronous Generators and Generator/Motors Coupled to Hydraulic Turbines and Rated 5 MVA and Above.* Institute of Electrical and Electronics Engineers.
7. **IEEE Std 115 (2019):** *IEEE Guide for Test Procedures for Synchronous Machines Including Acceptance and Performance Testing and Parameter Determination for Dynamic Analysis.*
8. **Gulliver, J. S., & Arndt, R. E. A. (Eds., 1991):** *Hydropower Engineering Handbook.* McGraw-Hill.
9. **Warnick, C. C. (1984):** *Hydropower Engineering.* Prentice-Hall.
10. **Mosonyi, E.:** *Water Power Development* (Volumes I & II). Akadémiai Kiadó.
