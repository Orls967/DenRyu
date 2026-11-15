import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Compass,
  Cpu,
  Gauge,
  Layers,
  Menu,
  Sparkles,
  X,
} from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { Badge } from '@/components/ui/Primitives';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: Compass, end: true },
  { to: '/anatomy', label: 'Plant Anatomy', icon: Layers, end: false },
  { to: '/journey', label: 'Energy Journey', icon: Activity, end: false },
  { to: '/simulator', label: 'Simulator', icon: Gauge, end: false },
  { to: '/insights', label: 'Insights', icon: Sparkles, end: false },
  { to: '/library', label: 'Technical Library', icon: BookOpen, end: false },
];

export function AppShell() {
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const toggleReducedMotion = useUiStore((s) => s.toggleReducedMotion);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-canvas text-text-primary">
      <header className="sticky top-0 z-40 border-b border-subtle bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-cyan-accent/40 bg-cyan-accent/10 text-cyan-accent">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="font-display text-sm font-bold tracking-wide text-text-primary group-hover:text-cyan-accent transition-colors">
                  DENRYU
                </div>
                <div className="hidden text-[10px] font-mono uppercase tracking-wider text-text-muted sm:block">
                  Francis Hydro Digital Twin
                </div>
              </div>
            </NavLink>
          </div>

          <nav aria-label="Primary Navigation" className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-accent/15 text-cyan-accent border border-cyan-accent/35'
                      : 'text-text-secondary hover:bg-elevated hover:text-text-primary border border-transparent'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleReducedMotion}
              aria-pressed={reducedMotion}
              data-testid="reduced-motion-toggle"
              className={`hidden sm:inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-mono transition-colors ${
                reducedMotion
                  ? 'border-status-warning/50 bg-status-warning/15 text-status-warning'
                  : 'border-subtle bg-elevated text-text-secondary hover:text-text-primary'
              }`}
              title="Toggle Reduced Motion mode (disables camera fly-throughs and moving particles)"
            >
              <span>{reducedMotion ? 'Motion: Reduced' : 'Motion: Standard'}</span>
            </button>

            <Badge variant="neutral" className="hidden xl:inline-flex">
              Unit 01 · 50 Hz · Synthetic Model
            </Badge>

            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-subtle bg-elevated text-text-primary lg:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="border-t border-subtle bg-surface px-4 py-3 lg:hidden">
            <nav aria-label="Mobile Navigation" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded border px-3 py-2 text-xs font-medium ${
                      isActive
                        ? 'border-cyan-accent/40 bg-cyan-accent/15 text-cyan-accent'
                        : 'border-subtle bg-elevated text-text-secondary'
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-subtle pt-2.5">
              <span className="text-[11px] font-mono text-text-muted">
                Unit 01 · Educational Synthetic Model
              </span>
              <button
                type="button"
                onClick={toggleReducedMotion}
                aria-pressed={reducedMotion}
                className="rounded border border-subtle bg-elevated px-2.5 py-1 text-[11px] font-mono text-text-secondary"
              >
                {reducedMotion ? 'Motion: Reduced' : 'Motion: Standard'}
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
