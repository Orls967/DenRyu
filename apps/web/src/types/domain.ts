export type SubsystemId =
  | 'sub-reservoir-dam'
  | 'sub-water-conveyance'
  | 'sub-turbine'
  | 'sub-generator'
  | 'sub-electrical-transmission'
  | 'sub-discharge';

export type ComponentId =
  | 'comp-reservoir'
  | 'comp-dam'
  | 'comp-water-intake'
  | 'comp-trash-rack'
  | 'comp-intake-gate'
  | 'comp-spillway'
  | 'comp-headrace'
  | 'comp-pressure-tunnel'
  | 'comp-surge-tank'
  | 'comp-penstock'
  | 'comp-main-inlet-valve'
  | 'comp-spiral-casing'
  | 'comp-stay-vanes'
  | 'comp-guide-vanes'
  | 'comp-runner'
  | 'comp-runner-blades'
  | 'comp-main-shaft'
  | 'comp-draft-tube'
  | 'comp-rotor'
  | 'comp-stator'
  | 'comp-field-winding'
  | 'comp-stator-winding'
  | 'comp-excitation-system'
  | 'comp-bearings'
  | 'comp-cooling-system'
  | 'comp-generator-housing'
  | 'comp-generator-terminal'
  | 'comp-busbar'
  | 'comp-circuit-breaker'
  | 'comp-step-up-transformer'
  | 'comp-switchyard'
  | 'comp-transmission-line'
  | 'comp-electrical-grid'
  | 'comp-draft-tube-outlet'
  | 'comp-tailrace'
  | 'comp-downstream-channel';

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

export type OperatingCondition = 'startup' | 'normal' | 'partial_load' | 'high_load' | 'shutdown';

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
  explodeVector: [number, number, number];
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
  animationMode:
    | 'storage'
    | 'intake'
    | 'conveyance'
    | 'turbine'
    | 'shaft'
    | 'generator'
    | 'transformer'
    | 'transmission'
    | 'discharge';
  narrationText: string;
  defaultDwellSeconds: number;
}

export interface SimulationConfiguration {
  plantId: string;
  waterDensityKgM3: number;
  gravityMS2: number;
  ratedNetHeadM: number;
  minOperatingHeadM: number;
  maxOperatingHeadM: number;
  maxInputHeadM: number;
  ratedGateCapacityFlowM3s: number;
  ratedBepFlowM3s: number;
  minStableFlowM3s: number;
  maxInputFlowM3s: number;
  ratedTurbineMechPowerW: number;
  maxTurbineMechPowerW: number;
  maxGeneratorElecPowerW: number;
  gridFrequencyHz: 50 | 60;
  poleCount: number;
  minTorqueAngularSpeedRadS: number;
  startupRampDurationS: number;
}

export interface SimulationInput {
  netHeadM: number;
  requestedFlowRateM3s: number;
  guideVaneOpeningPct: number;
  turbineEfficiencyRef: number;
  generatorEfficiencyRef: number;
  requestedLoadW: number;
  operatingCondition: OperatingCondition;
  efficiencyMode: EfficiencyMode;
}

export interface SimulationScenarioPreset {
  id: string;
  code: string;
  name: string;
  shortLabel: string;
  summary: string;
  input: SimulationInput;
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

export interface GlossaryEntry {
  id: string;
  term: string;
  category: 'Hydraulics' | 'Turbomachinery' | 'Electrical';
  symbol: string;
  unit: string;
  definition: string;
  relatedComponentIds: ComponentId[];
}

export interface EquationEntry {
  id: string;
  title: string;
  latex: string;
  variables: string;
  notes: string;
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

export interface LibraryDataBundle {
  glossary: GlossaryEntry[];
  equations: EquationEntry[];
  assumptionsAndLimitations: { title: string; detail: string }[];
  assetCredits: { asset: string; author: string; license: string; notes: string }[];
  references: TechnicalReference[];
}
