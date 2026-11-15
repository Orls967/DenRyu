import { ChevronDown, ChevronRight, Eye, EyeOff, Focus, Search, X } from 'lucide-react';
import { COMPONENTS, SUBSYSTEMS } from '@/services/dataLoader';
import { useAnatomyStore } from '@/stores/anatomyStore';
import type { ComponentId, SubsystemId } from '@/types/domain';
import { Badge } from '@/components/ui/Primitives';

export function HierarchyTree() {
  const selectedComponentId = useAnatomyStore((s) => s.selectedComponentId);
  const hoveredComponentId = useAnatomyStore((s) => s.hoveredComponentId);
  const expandedSubsystems = useAnatomyStore((s) => s.expandedSubsystems);
  const hiddenComponentIds = useAnatomyStore((s) => s.hiddenComponentIds);
  const isolatedComponentId = useAnatomyStore((s) => s.isolatedComponentId);
  const searchQuery = useAnatomyStore((s) => s.searchQuery);

  const selectComponent = useAnatomyStore((s) => s.selectComponent);
  const setHoveredComponent = useAnatomyStore((s) => s.setHoveredComponent);
  const toggleSubsystemExpanded = useAnatomyStore((s) => s.toggleSubsystemExpanded);
  const toggleComponentVisibility = useAnatomyStore((s) => s.toggleComponentVisibility);
  const toggleSubsystemVisibility = useAnatomyStore((s) => s.toggleSubsystemVisibility);
  const setSearchQuery = useAnatomyStore((s) => s.setSearchQuery);

  const query = searchQuery.trim().toLowerCase();

  const matchesQuery = (compId: ComponentId) => {
    if (!query) return true;
    const comp = COMPONENTS.find((c) => c.id === compId);
    if (!comp) return false;
    return (
      comp.officialName.toLowerCase().includes(query) ||
      comp.id.toLowerCase().includes(query) ||
      comp.alternativeNames.some((n) => n.toLowerCase().includes(query))
    );
  };

  return (
    <div className="flex h-full flex-col bg-surface border-r border-subtle">
      <div className="border-b border-subtle p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">
            Plant Hierarchy (36)
          </span>
          {isolatedComponentId ? <Badge variant="cyan">Isolated</Badge> : null}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            aria-label="Search plant components"
            placeholder="Search 36 components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-subtle bg-canvas py-1.5 pl-8 pr-7 text-xs text-text-primary placeholder:text-text-muted focus:border-cyan-accent focus:outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              aria-label="Clear component search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {SUBSYSTEMS.map((sub) => {
          const subComponents = COMPONENTS.filter((c) => c.subsystemId === sub.id);
          const visibleMatches = subComponents.filter((c) => matchesQuery(c.id));
          if (query && visibleMatches.length === 0) return null;

          const isExpanded = query ? true : expandedSubsystems[sub.id as SubsystemId];
          const allHidden = subComponents.every((c) => Boolean(hiddenComponentIds[c.id]));

          return (
            <div key={sub.id} className="rounded border border-subtle/70 bg-elevated/30">
              <div className="flex items-center justify-between px-2 py-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => toggleSubsystemExpanded(sub.id as SubsystemId)}
                  className="flex flex-1 items-center gap-1.5 text-left font-medium text-text-primary hover:text-cyan-accent"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  )}
                  <span className="font-mono text-[10px] text-cyan-accent">{sub.code}</span>
                  <span className="truncate">{sub.name}</span>
                  <span className="ml-auto font-mono text-[10px] text-text-muted">
                    {visibleMatches.length}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Toggle visibility for ${sub.name}`}
                  title={allHidden ? 'Show subsystem' : 'Hide subsystem'}
                  onClick={() => toggleSubsystemVisibility(sub.id as SubsystemId)}
                  className="ml-1.5 rounded p-1 text-text-muted hover:bg-elevated hover:text-text-primary"
                >
                  {allHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {isExpanded ? (
                <div className="border-t border-subtle/50 px-1.5 py-1 space-y-0.5">
                  {visibleMatches.map((comp) => {
                    const isSelected = selectedComponentId === comp.id;
                    const isHovered = hoveredComponentId === comp.id;
                    const isHidden = Boolean(hiddenComponentIds[comp.id]);

                    return (
                      <div
                        key={comp.id}
                        onMouseEnter={() => setHoveredComponent(comp.id)}
                        onMouseLeave={() => setHoveredComponent(null)}
                        className={`group flex items-center justify-between rounded px-2 py-1 text-xs transition-colors ${
                          isSelected
                            ? 'bg-cyan-accent/15 text-cyan-accent border border-cyan-accent/40'
                            : isHovered
                              ? 'bg-elevated text-text-primary border border-transparent'
                              : 'text-text-secondary hover:bg-elevated/60 hover:text-text-primary border border-transparent'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectComponent(comp.id, { focusCamera: true })}
                          className="flex flex-1 items-center gap-1.5 text-left truncate"
                        >
                          <span
                            className={`truncate ${isHidden ? 'line-through opacity-50' : ''}`}
                          >
                            {comp.officialName}
                          </span>
                          {comp.supportsRunnerModes ? (
                            <span className="shrink-0 rounded bg-energy-accent/15 px-1 py-0.5 text-[9px] font-mono text-energy-accent">
                              5M
                            </span>
                          ) : null}
                        </button>
                        <div className="ml-1 flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            aria-label={`Focus camera on ${comp.officialName}`}
                            title="Focus camera"
                            onClick={() => selectComponent(comp.id, { focusCamera: true })}
                            className="rounded p-1 opacity-60 hover:opacity-100 hover:bg-surface"
                          >
                            <Focus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Toggle visibility for ${comp.officialName}`}
                            title={isHidden ? 'Show component' : 'Hide component'}
                            onClick={() => toggleComponentVisibility(comp.id)}
                            className="rounded p-1 opacity-70 hover:opacity-100 hover:bg-surface"
                          >
                            {isHidden ? (
                              <EyeOff className="h-3 w-3 text-text-muted" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
