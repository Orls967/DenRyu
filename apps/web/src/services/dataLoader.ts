import plantConfigJson from '@data/plant-config/denryu-unit-01.json';
import subsystemsJson from '@data/component-metadata/subsystems.json';
import componentsJson from '@data/component-metadata/components.json';
import relationshipsJson from '@data/component-metadata/relationships.json';
import stagesJson from '@data/energy-journey/stages.json';
import scenariosJson from '@data/simulation-scenarios/scenarios.json';
import glossaryAndRefsJson from '@data/reference-data/glossary-and-refs.json';

import type {
  ComponentId,
  ComponentRelationship,
  EnergyJourneyStage,
  EnergyJourneyStageId,
  LibraryDataBundle,
  Plant,
  PlantComponent,
  PlantSubsystem,
  SimulationScenarioPreset,
  SubsystemId,
} from '@/types/domain';

export const PLANT_CONFIG = plantConfigJson as Plant;
export const SUBSYSTEMS = subsystemsJson as PlantSubsystem[];
export const COMPONENTS = componentsJson as PlantComponent[];
export const RELATIONSHIPS = relationshipsJson as ComponentRelationship[];
export const JOURNEY_STAGES = stagesJson as EnergyJourneyStage[];
export const SCENARIO_PRESETS = scenariosJson as SimulationScenarioPreset[];
export const LIBRARY_DATA = glossaryAndRefsJson as LibraryDataBundle;

export const COMPONENT_MAP: Record<ComponentId, PlantComponent> = COMPONENTS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ComponentId, PlantComponent>
);

export const SUBSYSTEM_MAP: Record<SubsystemId, PlantSubsystem> = SUBSYSTEMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<SubsystemId, PlantSubsystem>
);

export const STAGE_MAP: Record<EnergyJourneyStageId, EnergyJourneyStage> = JOURNEY_STAGES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<EnergyJourneyStageId, EnergyJourneyStage>
);

export function getComponentNeighbors(componentId: ComponentId): {
  upstream: { component: PlantComponent; relation: ComponentRelationship }[];
  downstream: { component: PlantComponent; relation: ComponentRelationship }[];
} {
  const upstream: { component: PlantComponent; relation: ComponentRelationship }[] = [];
  const downstream: { component: PlantComponent; relation: ComponentRelationship }[] = [];

  for (const rel of RELATIONSHIPS) {
    if (rel.toComponentId === componentId && COMPONENT_MAP[rel.fromComponentId]) {
      upstream.push({ component: COMPONENT_MAP[rel.fromComponentId], relation: rel });
    }
    if (rel.fromComponentId === componentId && COMPONENT_MAP[rel.toComponentId]) {
      downstream.push({ component: COMPONENT_MAP[rel.toComponentId], relation: rel });
    }
  }
  return { upstream, downstream };
}
