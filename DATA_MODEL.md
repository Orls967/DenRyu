# DATA_MODEL — Canonical Schemas, Units & Data Ownership

**Project:** DENRYU — Power Plant Anatomy & Energy Systems Explorer  
**Document Version:** 1.0.0  
**Status:** Authoritative Cross-Language Contract Specification

---

## 1. Core Entities & Domain Coverage

Every page and layer in DENRYU operates over 13 canonical data entities:

| Entity | Primary Owner | Consumed By |
|---|---|---|
| `Plant` | Static JSON (`data/plant-config/`) | Overview, Anatomy, Simulator, API |
| `PlantSubsystem` | Static JSON (`data/component-metadata/`) | Overview, Anatomy, Journey, 3D Scene |
| `PlantComponent` | Static JSON (`data/component-metadata/`) | Anatomy, Journey, 3D Scene, Library |
| `ComponentRelationship` | Static JSON (`data/component-metadata/`) | Anatomy, Journey |
| `EnergyJourneyStage` | Static JSON (`data/energy-journey/`) | Journey, Anatomy deep-links |
| `SimulationConfiguration` | Rust Engine + Static Defaults | Simulator, Rust/WASM, Python API |
| `SimulationInput` | Client Store (`simulatorStore`) | Simulator, Rust/WASM, Insights, API |
| `SimulationOutput` | Rust/WASM (`denryu-engine`) | Simulator, Insights, 3D Scene |
| `OperatingCondition` | Shared Enum (`TS / Rust / Python`) | Simulator, 3D Scene, API |
| `EngineeringParameter` | Static JSON (`PlantComponent`) | Anatomy, Library |
| `AssetReference` | Static JSON (`public/models/manifest.json`) | 3D Loader, Anatomy, Journey |
| `TechnicalReference` | Static JSON (`data/reference-data/`) | Technical Library, Insights, API |
| `SimulationWarning` | Rust/WASM (`denryu-engine`) | Simulator, Insights, API |

---

## 2. Canonical TypeScript Interfaces & Rust Serialization Conventions

> **Cross-Language Naming Convention:** JSON payloads crossing between TypeScript, Rust/WASM (`serde_wasm_bindgen`), and Python/FastAPI (`Pydantic v2`) MUST serialize in **`camelCase`** (via `#[serde(rename_all = "camelCase")]` in Rust and `alias_generator=to_camel` in Pydantic) so zero field-renaming glue is required in frontend code.

```typescript
// apps/web/src/types/domain.ts

export type SubsystemId =
  | 'sub-reservoir-dam'
  | 'sub-water-conveyance'
  | 'sub-turbine'
  | 'sub-generator'
  | 'sub-electrical-transmission'
  | 'sub-discharge';

export type ComponentId =
  | 'comp-reservoir' | 'comp-dam' | 'comp-water-intake' | 'comp-trash-rack'
  | 'comp-intake-gate' | 'comp-spillway'
  | 'comp-headrace' | 'comp-pressure-tunnel' | 'comp-surge-tank'
  | 'comp-penstock' | 'comp-main-inlet-valve'
  | 'comp-spiral-casing' | 'comp-stay-vanes' | 'comp-guide-vanes'
  | 'comp-runner' | 'comp-runner-blades' | 'comp-main-shaft' | 'comp-draft-tube'
  | 'comp-rotor' | 'comp-stator' | 'comp-field-winding' | 'comp-stator-winding'
  | 'comp-excitation-system' | 'comp-bearings' | 'comp-cooling-system' | 'comp-generator-housing'
  | 'comp-generator-terminal' | 'comp-busbar' | 'comp-circuit-breaker'
  | 'comp-step-up-transformer' | 'comp-switchyard' | 'comp-transmission-line' | 'comp-electrical-grid'
  | 'comp-draft-tube-outlet' | 'comp-tailrace' | 'comp-downstream-channel';

export type EnergyJourneyStageId =
  | 'stage-01-water-storage'
  | 'stage-02-water-intake'
  | 'stage-03-water-conveyance'
  | 'stage-04-turbine-conversion'
  | 'stage-05-mechanical-transmission'
  | 'stage-06-electrical-generation'
  | 'stage-07-voltage-transformation'
  | 'stage-08-power-transmission'
  | 'stage-09-water-discharge';

export type OperatingCondition =
  | 'startup'
  | 'normal'
  | 'partial_load'
  | 'high_load'
  | 'shutdown';

export type EfficiencyMode = 'operating_curve' | 'fixed_manual';

export type RelationshipKind =
  | 'hydraulic_flow'
  | 'mechanical_coupling'
  | 'electromagnetic'
  | 'electrical_power'
  | 'structural_support'
  | 'thermal_cooling';

export type RunnerInspectionMode =
  | 'normal'
  | 'exploded'
  | 'cross_section'
  | 'blade_inspection'
  | 'water_flow';

export interface Plant {
  id: 'denryu-hydro-unit-01';
  name: string;
  plantType: 'conventional_hydroelectric';
  turbineType: 'francis';
  unitCount: 1;
  dataOrigin: 'synthetic_educational';
  disclaimer: string;
  nominalSpecs: {
    ratedNetHeadM: number;
    ratedFlowRateM3s: number;
    nominalElectricalOutputW: number;
    synchronousSpeedRpm: number;
    gridFrequencyHz: 50 | 60;
    poleCount: number;
  };
  subsystemIds: SubsystemId[];
}

export interface PlantSubsystem {
  id: SubsystemId;
  order: number;
  code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  name: string;
  summary: string;
  cameraPresetKey: string;
  componentIds: ComponentId[];
}

export interface EngineeringParameter {
  key: string;
  label: string;
  symbol?: string;
  valueText: string;
  numericValue?: number;
  unit: string;
  isPlantDependent: boolean;
  notes?: string;
}

export interface AssetReference {
  componentId: ComponentId;
  glbPath: string;
  nodeName: string;
  lodSupported: boolean;
  explodeVector: [number, number, number]; // meters in world space at explode=1.0
  cameraFocusOffset: [number, number, number];
  boundingRadiusM: number;
  supportsCutawayTransparency: boolean;
  defaultGeometryFallback: 'procedural_mesh' | 'glb';
}

export interface PlantComponent {
  id: ComponentId;
  officialName: string;
  alternativeNames: string[];
  subsystemId: SubsystemId;
  physicalLocation: string;
  purpose: string;
  engineeringPrinciple: string;
  constructionAndMaterials: string;
  operatingMechanism: string;
  typicalOperatingConsiderations: string;
  potentialFailureModes: string[];
  maintenanceConsiderations: string[];
  educationalExplanation: string;
  engineeringParameters: EngineeringParameter[];
  relatedStageIds: EnergyJourneyStageId[];
  relatedSimulationVariables: string[];
  supportsRunnerModes: boolean;
  assetRef: AssetReference;
}

export interface ComponentRelationship {
  id: string;
  fromComponentId: ComponentId;
  toComponentId: ComponentId;
  kind: RelationshipKind;
  directionality: 'unidirectional' | 'bidirectional';
  description: string;
}

export interface EnergyJourneyStage {
  id: EnergyJourneyStageId;
  order: number;
  title: string;
  shortLabel: string;
  description: string;
  engineeringExplanation: string;
  physicalProcess: string;
  energyFormFrom: string;
  energyFormTo: string;
  lossMechanismSummary: string;
  equationsLatex: string[];
  activeComponentIds: ComponentId[];
  highlightedComponentIds: ComponentId[];
  transparentShellIds: ComponentId[];
  upstreamStageId: EnergyJourneyStageId | null;
  downstreamStageId: EnergyJourneyStageId | null;
  inputVariables: string[];
  outputVariables: string[];
  cameraPresetKey: string;
  animationMode: 'storage' | 'intake' | 'conveyance' | 'turbine' | 'shaft' | 'generator' | 'transformer' | 'transmission' | 'discharge';
  narrationText: string;
  defaultDwellSeconds: number;
}

export interface SimulationConfiguration {
  plantId: string;
  waterDensityKgM3: number;           // default 1000.0
  gravityMS2: number;                 // default 9.80665
  ratedNetHeadM: number;              // default 85.0
  minOperatingHeadM: number;          // default 25.0
  maxOperatingHeadM: number;          // default 115.0
  maxInputHeadM: number;              // default 130.0
  ratedGateCapacityFlowM3s: number;   // default 72.0
  ratedBepFlowM3s: number;            // default 58.0
  minStableFlowM3s: number;           // default 12.0
  maxInputFlowM3s: number;            // default 80.0
  ratedTurbineMechPowerW: number;     // default 50_000_000
  maxTurbineMechPowerW: number;       // default 58_000_000
  maxGeneratorElecPowerW: number;     // default 55_000_000
  gridFrequencyHz: 50 | 60;           // default 50
  poleCount: number;                  // default 24
  minTorqueAngularSpeedRadS: number;  // default 0.5
  startupRampDurationS: number;       // default 30.0
}

export interface SimulationInput {
  netHeadM: number;                   // [0.0, 130.0]
  requestedFlowRateM3s: number;       // [0.0, 80.0]
  guideVaneOpeningPct: number;        // [0.0, 100.0]
  turbineEfficiencyRef: number;       // [0.40, 0.95]
  generatorEfficiencyRef: number;     // [0.60, 0.99]
  requestedLoadW: number;             // [0.0, 70_000_000]
  operatingCondition: OperatingCondition;
  efficiencyMode: EfficiencyMode;
}

export type WarningCode =
  | 'FLOW_CONSTRAINED_BY_GATE_OR_HEAD'
  | 'LOW_HEAD_OPERATING_LIMIT'
  | 'HIGH_HEAD_STRUCTURAL_LIMIT'
  | 'DEEP_PART_LOAD_CAVITATION_RISK'
  | 'INSUFFICIENT_GENERATION_FOR_LOAD'
  | 'POWER_CEILING_CLAMPED'
  | 'ZERO_FLOW_MOTORING_RISK'
  | 'STARTUP_UNSYNCHRONIZED';

export interface SimulationWarning {
  code: WarningCode;
  severity: 'info' | 'warning' | 'error';
  message: string;
  affectedComponents: ComponentId[];
}

export interface EfficiencyCurvePoint {
  flowRateM3s: number;
  flowRatioToBep: number;
  turbineEfficiency: number;
}

export interface SimulationOutput {
  timestampSimS: number;
  availableFlowLimitM3s: number;
  actualFlowRateM3s: number;
  bepFlowAtHeadM3s: number;
  flowRatioToBep: number;
  hydraulicPowerW: number;
  turbineMechanicalPowerW: number;
  electricalGeneratedPowerW: number;
  deliveredElectricalPowerW: number;
  requestedLoadW: number;
  powerDeficitW: number;
  reserveMarginW: number;
  turbineLossW: number;
  generatorLossW: number;
  turbineEfficiency: number;
  generatorEfficiency: number;
  overallEfficiency: number;
  turbineTorqueNm: number;
  synchronousSpeedRpm: number;
  rotationalSpeedRpm: number;
  angularSpeedRadS: number;
  cumulativeGeneratedEnergyJ: number;
  cumulativeDeliveredEnergyJ: number;
  operatingCondition: OperatingCondition;
  efficiencyMode: EfficiencyMode;
  warnings: SimulationWarning[];
  isSyntheticEducationalModel: true;
}

export interface TechnicalReference {
  id: string;
  title: string;
  organizationOrAuthors: string;
  year: string;
  category: 'standard' | 'government_manual' | 'textbook';
  identifier?: string;
  scopeSummary: string;
}
```

### 2.1 Rust-Compatible Struct Mirror (`crates/denryu-engine/src/types.rs`)

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OperatingCondition {
    Startup,
    Normal,
    PartialLoad,
    HighLoad,
    Shutdown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EfficiencyMode {
    OperatingCurve,
    FixedManual,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulationInput {
    pub net_head_m: f64,
    pub requested_flow_rate_m3s: f64,
    pub guide_vane_opening_pct: f64,
    pub turbine_efficiency_ref: f64,
    pub generator_efficiency_ref: f64,
    pub requested_load_w: f64,
    pub operating_condition: OperatingCondition,
    pub efficiency_mode: EfficiencyMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulationConfiguration {
    pub plant_id: String,
    #[serde(rename = "waterDensityKgM3")]
    pub water_density_kg_m3: f64,
    #[serde(rename = "gravityMS2")]
    pub gravity_m_s2: f64,
    pub rated_net_head_m: f64,
    pub min_operating_head_m: f64,
    pub max_operating_head_m: f64,
    pub max_input_head_m: f64,
    pub rated_gate_capacity_flow_m3s: f64,
    pub rated_bep_flow_m3s: f64,
    pub min_stable_flow_m3s: f64,
    pub max_input_flow_m3s: f64,
    pub rated_turbine_mech_power_w: f64,
    pub max_turbine_mech_power_w: f64,
    pub max_generator_elec_power_w: f64,
    pub grid_frequency_hz: u16,
    pub pole_count: u16,
    pub min_torque_angular_speed_rad_s: f64,
    pub startup_ramp_duration_s: f64,
}
```

---

## 3. Units & Conversion Conventions

| Quantity | Internal Canonical Unit | UI Formatting Helpers (`formatters.ts`) |
|---|---|---|
| Power | Watts (`W`) | `valueW / 1e6` → `XX.XX MW` (or `kW` if `< 1 MW`) |
| Energy | Joules (`J`) | `valueJ / 3.6e6` → `kWh`; `valueJ / 3.6e9` → `MWh` |
| Torque | Newton-meters (`N·m`) | `valueNm / 1e6` → `X.XXX MN·m` (or `kN·m` if `< 1 MN·m`) |
| Efficiency | Ratio (`0.0..=1.0`) | `value * 100` → `XX.X %` |
| Head | Meters (`m`) | `XX.X m` |
| Flow Rate | Cubic meters per second (`m³/s`) | `XX.XX m³/s` |
| Speed | Revolutions per minute (`rpm`) | `XXX.X rpm` |

**Validation Invariants:**
- All numeric inputs MUST satisfy `Number.isFinite(x)` (TS) and `x.is_finite()` (Rust).
- Dimensionless ratios (`turbineEfficiencyRef`, `generatorEfficiencyRef`) MUST remain in `[0.40, 0.95]` and `[0.60, 0.99]` respectively (and `>= 0.0` at runtime).
- Zero negative power, zero `NaN` torque, zero silent unit mismatches.

---

## 4. Data Ownership Matrix

| Data Category | Authoritative Layer | Sync / Persistence Strategy |
|---|---|---|
| Plant static metadata & 36 components | Static JSON (`data/`) | Bundled into frontend; mirrored/loaded into Python `reference_loader.py`. |
| 3D asset coordinates & explode offsets | `public/models/manifest.json` | Validated by test script against `components.json`. |
| Active anatomy/journey UI state | Zustand (`anatomyStore`, `journeyStore`) | Ephemeral browser state + URL query param sync (`?component=`, `?stage=`). |
| Simulation configuration & active output | Rust/WASM (`denryu-engine`) | Held in Worker memory; snapshot pushed to `simulatorStore` + 120-sample UI ring buffer. |
| Sensitivity matrices & validation audits | Python/FastAPI (`apps/api`) | Computed statelessly per HTTP request; cached temporarily in `insightsStore` client memory. |

---

## 5. Canonical JSON Examples

### 5.1 Plant Configuration (`data/plant-config/denryu-unit-01.json`)
```json
{
  "id": "denryu-hydro-unit-01",
  "name": "DENRYU Reference Plant — Unit 01",
  "plantType": "conventional_hydroelectric",
  "turbineType": "francis",
  "unitCount": 1,
  "dataOrigin": "synthetic_educational",
  "disclaimer": "Illustrative synthetic reference configuration for engineering education only; not validated real-world plant data.",
  "nominalSpecs": {
    "ratedNetHeadM": 85.0,
    "ratedFlowRateM3s": 60.0,
    "nominalElectricalOutputW": 44551816.33,
    "synchronousSpeedRpm": 250.0,
    "gridFrequencyHz": 50,
    "poleCount": 24
  },
  "subsystemIds": [
    "sub-reservoir-dam",
    "sub-water-conveyance",
    "sub-turbine",
    "sub-generator",
    "sub-electrical-transmission",
    "sub-discharge"
  ]
}
```

### 5.2 Component Metadata & Relationship Excerpt
```json
{
  "id": "comp-runner",
  "officialName": "Runner",
  "alternativeNames": ["Francis Turbine Runner", "Turbine Wheel"],
  "subsystemId": "sub-turbine",
  "physicalLocation": "Central rotating core inside guide vane ring above draft tube",
  "purpose": "Convert water pressure and angular momentum into rotational shaft torque.",
  "engineeringPrinciple": "Reaction mixed-flow turbomachinery governed by Euler's turbine equation T = rho * Q * (r1 * vu1 - r2 * vu2).",
  "relatedStageIds": ["stage-04-turbine-conversion"],
  "relatedSimulationVariables": ["turbineMechanicalPowerW", "turbineTorqueNm", "turbineEfficiency", "rotationalSpeedRpm"],
  "supportsRunnerModes": true,
  "assetRef": {
    "componentId": "comp-runner",
    "glbPath": "models/denryu-unit-01.glb",
    "nodeName": "Node_Comp_Runner",
    "lodSupported": true,
    "explodeVector": [0.0, -2.5, 0.0],
    "cameraFocusOffset": [4.5, 2.2, 4.5],
    "boundingRadiusM": 1.6,
    "supportsCutawayTransparency": false,
    "defaultGeometryFallback": "glb"
  }
}
```

```json
{
  "id": "rel-guide-vanes-to-runner",
  "fromComponentId": "comp-guide-vanes",
  "toComponentId": "comp-runner",
  "kind": "hydraulic_flow",
  "directionality": "unidirectional",
  "description": "Pivoting wicket gates inject swirl and regulated discharge across the radial vaneless gap into the Francis runner blades."
}
```

### 5.3 Simulation Input & Output JSON (Scenario A — Normal Operation)
```json
{
  "input": {
    "netHeadM": 85.0,
    "requestedFlowRateM3s": 60.0,
    "guideVaneOpeningPct": 85.0,
    "turbineEfficiencyRef": 0.92,
    "generatorEfficiencyRef": 0.975,
    "requestedLoadW": 40000000,
    "operatingCondition": "normal",
    "efficiencyMode": "operating_curve"
  },
  "output": {
    "timestampSimS": 10.0,
    "availableFlowLimitM3s": 61.2,
    "actualFlowRateM3s": 60.0,
    "bepFlowAtHeadM3s": 58.0,
    "flowRatioToBep": 1.034483,
    "hydraulicPowerW": 50013915.0,
    "turbineMechanicalPowerW": 45927671.42,
    "electricalGeneratedPowerW": 44551816.33,
    "deliveredElectricalPowerW": 40000000.0,
    "requestedLoadW": 40000000.0,
    "powerDeficitW": 0.0,
    "reserveMarginW": 4551816.33,
    "turbineLossW": 4086243.58,
    "generatorLossW": 1375855.09,
    "turbineEfficiency": 0.918298,
    "generatorEfficiency": 0.970043,
    "overallEfficiency": 0.890788,
    "turbineTorqueNm": 1754307.82,
    "synchronousSpeedRpm": 250.0,
    "rotationalSpeedRpm": 250.0,
    "angularSpeedRadS": 26.179939,
    "cumulativeGeneratedEnergyJ": 445518163.3,
    "cumulativeDeliveredEnergyJ": 400000000.0,
    "operatingCondition": "normal",
    "efficiencyMode": "operating_curve",
    "warnings": [],
    "isSyntheticEducationalModel": true
  }
}
```
