import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Cpu, Wrench } from 'lucide-react';
import {
  COMPONENT_MAP,
  STAGE_MAP,
  SUBSYSTEM_MAP,
  getComponentNeighbors,
} from '@/services/dataLoader';
import { useAnatomyStore } from '@/stores/anatomyStore';
import { Badge, Button, EmptyState, TabList } from '@/components/ui/Primitives';

type InspectorTab =
  | 'overview'
  | 'principle'
  | 'construction'
  | 'operation'
  | 'relations'
  | 'parameters'
  | 'maintenance';

const TABS: { id: InspectorTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'principle', label: 'Principle' },
  { id: 'construction', label: 'Construction' },
  { id: 'operation', label: 'Operation' },
  { id: 'relations', label: 'Relations' },
  { id: 'parameters', label: 'Parameters' },
  { id: 'maintenance', label: 'Failure & Maint.' },
];

export function ComponentInspector() {
  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');
  const selectedComponentId = useAnatomyStore((s) => s.selectedComponentId);
  const selectComponent = useAnatomyStore((s) => s.selectComponent);
  const setRunnerMode = useAnatomyStore((s) => s.setRunnerMode);

  const comp = selectedComponentId ? COMPONENT_MAP[selectedComponentId] : undefined;

  if (!comp) {
    return (
      <div className="flex h-full items-center justify-center bg-surface border-l border-subtle p-4">
        <EmptyState
          title="No Component Selected"
          description="Select any of the 36 plant components from the hierarchy tree or click a mesh in the 3D scene."
          action={
            <Button variant="primary" size="sm" onClick={() => selectComponent('comp-runner', { focusCamera: true })}>
              Inspect Francis Runner
            </Button>
          }
        />
      </div>
    );
  }

  const subsystem = SUBSYSTEM_MAP[comp.subsystemId];
  const neighbors = getComponentNeighbors(comp.id);
  const primaryStage = comp.relatedStageIds[0] ? STAGE_MAP[comp.relatedStageIds[0]] : undefined;

  return (
    <div className="flex h-full flex-col bg-surface border-l border-subtle overflow-hidden">
      <div className="border-b border-subtle p-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <Badge variant="cyan">
            Subsystem {subsystem?.code ?? '?'}
          </Badge>
          <span className="text-[11px] font-mono text-text-muted">{comp.id}</span>
          {comp.supportsRunnerModes ? (
            <Badge variant="energy">Hero 5-Mode</Badge>
          ) : null}
        </div>
        <h2 className="font-display text-lg font-semibold text-text-primary">
          {comp.officialName}
        </h2>
        {comp.alternativeNames.length > 0 ? (
          <p className="mt-0.5 text-xs text-text-muted">
            Also known as: {comp.alternativeNames.join(' · ')}
          </p>
        ) : null}
      </div>

      <TabList tabs={TABS} activeTab={activeTab} onChange={setActiveTab} className="px-2" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm leading-relaxed text-text-secondary">
        {activeTab === 'overview' ? (
          <>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                Physical Location
              </h3>
              <p className="text-text-primary">{comp.physicalLocation}</p>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                Primary Purpose
              </h3>
              <p>{comp.purpose}</p>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                Educational Takeaway
              </h3>
              <div className="rounded-md border border-cyan-accent/30 bg-cyan-accent/5 p-3 text-text-primary">
                {comp.educationalExplanation}
              </div>
            </div>
            {comp.supportsRunnerModes ? (
              <div className="rounded-md border border-energy-accent/30 bg-energy-accent/5 p-3">
                <div className="text-xs font-mono uppercase tracking-wider text-energy-accent mb-1">
                  Interactive Runner Modes Available
                </div>
                <p className="text-xs text-text-secondary mb-2">
                  Use the Francis Runner Inspection Bar above the viewport or jump directly to blade close-up mode.
                </p>
                <Button size="sm" variant="secondary" onClick={() => setRunnerMode('blade_inspection')}>
                  Open Blade Close-Up
                </Button>
              </div>
            ) : null}
          </>
        ) : null}

        {activeTab === 'principle' ? (
          <>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                Engineering Principle
              </h3>
              <p>{comp.engineeringPrinciple}</p>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                Related Simulation Variables
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {comp.relatedSimulationVariables.map((v) => (
                  <span
                    key={v}
                    className="rounded border border-subtle bg-canvas px-2 py-0.5 text-xs font-mono text-cyan-accent"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'construction' ? (
          <>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                Construction & Materials
              </h3>
              <p>{comp.constructionAndMaterials}</p>
            </div>
            <div className="rounded border border-subtle bg-elevated/40 p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">3D Mesh Node</span>
                <span className="font-mono text-text-primary">{comp.assetRef.nodeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Bounding Radius</span>
                <span className="font-mono text-text-primary">{comp.assetRef.boundingRadiusM} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Cutaway Transparency</span>
                <span className="font-mono text-text-primary">
                  {comp.assetRef.supportsCutawayTransparency ? 'Supported' : 'Solid'}
                </span>
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'operation' ? (
          <>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                Operating Mechanism
              </h3>
              <p>{comp.operatingMechanism}</p>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                Typical Operating Considerations
              </h3>
              <p>{comp.typicalOperatingConsiderations}</p>
            </div>
          </>
        ) : null}

        {activeTab === 'relations' ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                Upstream Inputs ({neighbors.upstream.length})
              </h3>
              {neighbors.upstream.length === 0 ? (
                <p className="text-xs text-text-muted">Top-level source boundary in this model.</p>
              ) : (
                <div className="space-y-2">
                  {neighbors.upstream.map(({ component: source, relation }) => (
                    <div
                      key={relation.id}
                      className="rounded border border-subtle bg-elevated/40 p-2.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => selectComponent(source.id, { focusCamera: true })}
                          className="font-medium text-cyan-accent hover:underline text-left"
                        >
                          {source.officialName}
                        </button>
                        <Badge variant="neutral">{relation.kind.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-text-secondary">{relation.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                Downstream Outputs ({neighbors.downstream.length})
              </h3>
              {neighbors.downstream.length === 0 ? (
                <p className="text-xs text-text-muted">Terminal boundary of this plant model.</p>
              ) : (
                <div className="space-y-2">
                  {neighbors.downstream.map(({ component: target, relation }) => (
                    <div
                      key={relation.id}
                      className="rounded border border-subtle bg-elevated/40 p-2.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => selectComponent(target.id, { focusCamera: true })}
                          className="font-medium text-cyan-accent hover:underline text-left"
                        >
                          {target.officialName}
                        </button>
                        <Badge variant="neutral">{relation.kind.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-text-secondary">{relation.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                Linked Energy Journey Stages
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {comp.relatedStageIds.map((stId) => {
                  const st = STAGE_MAP[stId];
                  return (
                    <Link
                      key={stId}
                      to={`/journey?stage=${stId}`}
                      className="inline-flex items-center gap-1 rounded border border-subtle bg-elevated px-2.5 py-1 text-xs text-text-primary hover:border-cyan-accent hover:text-cyan-accent"
                    >
                      <Compass className="h-3 w-3" />
                      {st ? `0${st.order} · ${st.shortLabel}` : stId}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'parameters' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted">
                Engineering Parameters
              </h3>
              <Badge variant="neutral">Synthetic Baseline</Badge>
            </div>
            <div className="overflow-x-auto rounded border border-subtle">
              <table className="w-full text-left text-xs">
                <thead className="bg-elevated text-text-muted font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-2.5 py-2">Parameter</th>
                    <th className="px-2.5 py-2">Value</th>
                    <th className="px-2.5 py-2">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle/60">
                  {comp.engineeringParameters.map((param) => (
                    <tr key={param.key} className="bg-canvas/40">
                      <td className="px-2.5 py-2">
                        <div className="font-medium text-text-primary">
                          {param.label}
                          {param.symbol ? (
                            <span className="ml-1 font-mono text-cyan-accent">({param.symbol})</span>
                          ) : null}
                        </div>
                        {param.notes ? (
                          <div className="text-[11px] text-text-muted">{param.notes}</div>
                        ) : null}
                      </td>
                      <td className="px-2.5 py-2 font-mono text-text-primary">{param.valueText}</td>
                      <td className="px-2.5 py-2 font-mono text-text-muted">{param.unit || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === 'maintenance' ? (
          <div className="space-y-4">
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-status-warning mb-2">
                <Wrench className="h-3.5 w-3.5" />
                Potential Failure Modes
              </h3>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-text-secondary">
                {comp.potentialFailureModes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-accent mb-2">
                Inspection & Maintenance Considerations
              </h3>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-text-secondary">
                {comp.maintenanceConsiderations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-subtle bg-elevated/40 p-3 flex flex-wrap items-center justify-between gap-2">
        {primaryStage ? (
          <Link
            to={`/journey?stage=${primaryStage.id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-cyan-accent hover:underline"
          >
            <Compass className="h-3.5 w-3.5" />
            View in Stage 0{primaryStage.order}
          </Link>
        ) : (
          <span />
        )}
        <Link
          to="/simulator"
          className="inline-flex items-center gap-1 text-xs font-medium text-energy-accent hover:underline"
        >
          <Cpu className="h-3.5 w-3.5" />
          Open Simulator
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
