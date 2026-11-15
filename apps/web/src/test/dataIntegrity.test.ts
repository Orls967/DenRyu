import { describe, expect, it } from 'vitest';
import {
  COMPONENTS,
  COMPONENT_MAP,
  JOURNEY_STAGES,
  LIBRARY_DATA,
  PLANT_CONFIG,
  RELATIONSHIPS,
  SCENARIO_PRESETS,
  STAGE_MAP,
  SUBSYSTEMS,
} from '@/services/dataLoader';
import manifest from '../../public/models/manifest.json';

describe('Canonical Data Integrity', () => {
  it('contains exactly 6 subsystems and 36 canonical components', () => {
    expect(SUBSYSTEMS).toHaveLength(6);
    expect(COMPONENTS).toHaveLength(36);
    expect(PLANT_CONFIG.subsystemIds).toEqual(SUBSYSTEMS.map((s) => s.id));

    const subsystemComponentIds = SUBSYSTEMS.flatMap((s) => s.componentIds);
    expect(subsystemComponentIds).toHaveLength(36);
    expect(new Set(subsystemComponentIds).size).toBe(36);

    for (const id of subsystemComponentIds) {
      expect(COMPONENT_MAP[id]).toBeDefined();
    }
  });

  it('validates all component relationships point to existing componentIds', () => {
    expect(RELATIONSHIPS.length).toBeGreaterThanOrEqual(30);
    for (const rel of RELATIONSHIPS) {
      expect(COMPONENT_MAP[rel.fromComponentId]).toBeDefined();
      expect(COMPONENT_MAP[rel.toComponentId]).toBeDefined();
    }
  });

  it('contains all 9 Energy Journey stages with valid component and stage links', () => {
    expect(JOURNEY_STAGES).toHaveLength(9);
    for (let i = 0; i < JOURNEY_STAGES.length; i++) {
      const stage = JOURNEY_STAGES[i];
      expect(stage.order).toBe(i + 1);
      for (const compId of [
        ...stage.activeComponentIds,
        ...stage.highlightedComponentIds,
        ...stage.transparentShellIds,
      ]) {
        expect(COMPONENT_MAP[compId]).toBeDefined();
      }
      if (stage.upstreamStageId) {
        expect(STAGE_MAP[stage.upstreamStageId]).toBeDefined();
      }
      if (stage.downstreamStageId) {
        expect(STAGE_MAP[stage.downstreamStageId]).toBeDefined();
      }
    }
  });

  it('maps all 36 componentIds in public/models/manifest.json', () => {
    expect(manifest.components).toHaveLength(36);
    const manifestIds = new Set(manifest.components.map((m) => m.componentId));
    expect(manifestIds.size).toBe(36);
    for (const comp of COMPONENTS) {
      expect(manifestIds.has(comp.id)).toBe(true);
    }
  });

  it('validates simulation presets and technical library entries', () => {
    expect(SCENARIO_PRESETS.length).toBeGreaterThanOrEqual(5);
    expect(LIBRARY_DATA.glossary.length).toBeGreaterThanOrEqual(8);
    expect(LIBRARY_DATA.equations.length).toBeGreaterThanOrEqual(5);
    expect(LIBRARY_DATA.references.length).toBeGreaterThanOrEqual(5);
  });
});
