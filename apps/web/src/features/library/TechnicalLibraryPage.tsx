import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Search, ShieldAlert } from 'lucide-react';
import { KaTeXFormula } from '@/components/ui/KaTeXFormula';
import { Badge, EmptyState, Panel, SectionHeader } from '@/components/ui/Primitives';
import { COMPONENT_MAP, LIBRARY_DATA } from '@/services/dataLoader';

type CategoryFilter = 'All' | 'Hydraulics' | 'Turbomachinery' | 'Electrical';

const CATEGORIES: CategoryFilter[] = ['All', 'Hydraulics', 'Turbomachinery', 'Electrical'];

const SI_UNITS = [
  { quantity: 'Net Hydraulic Head', symbol: 'H', unit: 'm', conversion: '1 m ≈ 9.807 kPa' },
  { quantity: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s', conversion: '1 m³/s = 1,000 L/s' },
  { quantity: 'Power (Hyd / Mech / Elec)', symbol: 'P_h, P_m, P_e', unit: 'W', conversion: '1 MW = 10⁶ W' },
  { quantity: 'Shaft Torque', symbol: 'T', unit: 'N·m', conversion: '1 MN·m = 10⁶ N·m' },
  { quantity: 'Rotational / Angular Speed', symbol: 'n_s / ω', unit: 'rpm / rad/s', conversion: 'ω = 2π·n / 60' },
  { quantity: 'Generated / Delivered Energy', symbol: 'E', unit: 'J', conversion: '1 MWh = 3.6 × 10⁹ J' },
];

export function TechnicalLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');

  const query = searchQuery.trim().toLowerCase();

  const filteredGlossary = useMemo(
    () =>
      LIBRARY_DATA.glossary.filter((entry) => {
        if (category !== 'All' && entry.category !== category) return false;
        if (!query) return true;
        return (
          entry.term.toLowerCase().includes(query) ||
          entry.definition.toLowerCase().includes(query) ||
          entry.symbol.toLowerCase().includes(query)
        );
      }),
    [category, query],
  );

  const filteredEquations = useMemo(
    () =>
      LIBRARY_DATA.equations.filter((eq) => {
        if (!query) return true;
        return (
          eq.title.toLowerCase().includes(query) ||
          eq.variables.toLowerCase().includes(query) ||
          eq.notes.toLowerCase().includes(query)
        );
      }),
    [query],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <SectionHeader
        eyebrow="Engineering Reference & Methodology"
        title="Technical Library"
        description="Structured hydropower glossary, governing SI equations, model boundary assumptions, and primary technical bibliography."
        right={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              aria-label="Search technical library"
              placeholder="Search glossary or equations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-subtle bg-surface py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-cyan-accent focus:outline-none"
            />
          </div>
        }
      />

      {/* Glossary Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-text-primary">
            <BookOpen className="h-4 w-4 text-cyan-accent" />
            Domain Glossary ({filteredGlossary.length})
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={category === cat}
                onClick={() => setCategory(cat)}
                className={`rounded px-3 py-1 text-xs font-medium border transition-colors ${
                  category === cat
                    ? 'border-cyan-accent bg-cyan-accent/15 text-cyan-accent'
                    : 'border-subtle bg-surface text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredGlossary.length === 0 ? (
          <EmptyState
            title="No matching glossary terms"
            description="Adjust your search query or reset the domain category filter."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGlossary.map((item) => (
              <Panel key={item.id} className="p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="cyan">{item.category}</Badge>
                    <span className="font-mono text-xs text-energy-accent">
                      {item.symbol} [{item.unit}]
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-text-primary">
                    {item.term}
                  </h3>
                  <p className="text-xs leading-relaxed text-text-secondary">{item.definition}</p>
                </div>
                {item.relatedComponentIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-subtle/60">
                    {item.relatedComponentIds.map((cid) => (
                      <Link
                        key={cid}
                        to={`/anatomy?component=${cid}`}
                        className="rounded border border-subtle bg-elevated px-2 py-0.5 text-[11px] text-text-primary hover:border-cyan-accent hover:text-cyan-accent"
                      >
                        {COMPONENT_MAP[cid]?.officialName ?? cid}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </Panel>
            ))}
          </div>
        )}
      </section>

      {/* Core Equations & SI Conversions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Governing Simulation Equations
          </h2>
          <div className="space-y-3">
            {filteredEquations.map((eq) => (
              <Panel key={eq.id} className="p-4 space-y-2">
                <div className="font-medium text-sm text-text-primary">{eq.title}</div>
                <div className="rounded border border-subtle bg-canvas/70 px-3 py-2">
                  <KaTeXFormula latex={eq.latex} displayMode />
                </div>
                <div className="text-xs font-mono text-cyan-accent">{eq.variables}</div>
                <p className="text-xs text-text-secondary">{eq.notes}</p>
              </Panel>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <Panel className="p-4 space-y-3">
            <h2 className="font-display text-base font-semibold text-text-primary">
              SI Engineering Quantities
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-subtle bg-elevated/60 font-mono text-[10px] uppercase text-text-muted">
                  <tr>
                    <th className="px-2.5 py-2">Quantity</th>
                    <th className="px-2.5 py-2">Symbol</th>
                    <th className="px-2.5 py-2">SI Unit</th>
                    <th className="px-2.5 py-2">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle/60">
                  {SI_UNITS.map((row) => (
                    <tr key={row.quantity}>
                      <td className="px-2.5 py-2 text-text-primary">{row.quantity}</td>
                      <td className="px-2.5 py-2 font-mono text-cyan-accent">{row.symbol}</td>
                      <td className="px-2.5 py-2 font-mono text-energy-accent">{row.unit}</td>
                      <td className="px-2.5 py-2 font-mono text-text-muted">{row.conversion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel className="p-4 border-energy-accent/35 bg-energy-accent/5 space-y-3">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-energy-accent">
              <ShieldAlert className="h-4 w-4" />
              Synthetic Model Assumptions & Limitations
            </h2>
            <ul className="space-y-2.5 text-xs text-text-secondary">
              {LIBRARY_DATA.assumptionsAndLimitations.map((item) => (
                <li key={item.title}>
                  <strong className="text-text-primary">{item.title}: </strong>
                  {item.detail}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>

      {/* Asset Credits & Bibliography */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel className="p-4 sm:p-5 space-y-3">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-text-primary">
            <FileText className="h-4 w-4 text-cyan-accent" />
            3D Asset Provenance & Credits
          </h2>
          <div className="space-y-2.5 text-xs">
            {LIBRARY_DATA.assetCredits.map((credit) => (
              <div key={credit.asset} className="rounded border border-subtle bg-canvas/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-text-primary">{credit.asset}</span>
                  <Badge variant="neutral">{credit.license}</Badge>
                </div>
                <div className="mt-1 text-text-muted">Author: {credit.author}</div>
                <p className="mt-1 text-text-secondary">{credit.notes}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-4 sm:p-5 space-y-3">
          <h2 className="font-display text-base font-semibold text-text-primary">
            Technical Standards & References
          </h2>
          <div className="space-y-2.5 text-xs">
            {LIBRARY_DATA.references.map((ref) => (
              <div key={ref.id} className="rounded border border-subtle bg-canvas/50 p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-text-primary">{ref.title}</span>
                  <Badge variant="cyan">{ref.identifier ?? ref.category}</Badge>
                </div>
                <div className="font-mono text-[11px] text-text-muted">
                  {ref.organizationOrAuthors} · {ref.year}
                </div>
                <p className="text-text-secondary leading-relaxed">{ref.scopeSummary}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
