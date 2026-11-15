import type { ComponentId } from '@/types/domain';
import { COMPONENT_MAP } from '@/services/dataLoader';
import { Badge } from '@/components/ui/Primitives';

interface Hotspot {
  id: ComponentId;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
}

const HOTSPOTS: Hotspot[] = [
  { id: 'comp-reservoir', x: 20, y: 70, w: 185, h: 115, label: 'Reservoir', color: '#2589D8' },
  { id: 'comp-dam', x: 205, y: 55, w: 60, h: 255, label: 'Concrete Dam', color: '#6D7680' },
  { id: 'comp-trash-rack', x: 186, y: 145, w: 18, h: 38, label: 'Trash Rack', color: '#7E8F9F' },
  { id: 'comp-water-intake', x: 205, y: 145, w: 32, h: 38, label: 'Intake', color: '#36C5D9' },
  { id: 'comp-intake-gate', x: 232, y: 120, w: 16, h: 65, label: 'Intake Gate', color: '#9FB1C2' },
  { id: 'comp-spillway', x: 228, y: 55, w: 58, h: 30, label: 'Spillway', color: '#8C9BA8' },
  { id: 'comp-headrace', x: 265, y: 152, w: 65, h: 24, label: 'Headrace', color: '#4E5E6E' },
  { id: 'comp-pressure-tunnel', x: 330, y: 152, w: 80, h: 24, label: 'Pressure Tunnel', color: '#3D4E5E' },
  { id: 'comp-surge-tank', x: 388, y: 65, w: 28, h: 88, label: 'Surge Tank', color: '#2589D8' },
  { id: 'comp-penstock', x: 410, y: 165, w: 95, h: 125, label: 'Penstock', color: '#3D4E5E' },
  { id: 'comp-main-inlet-valve', x: 500, y: 270, w: 34, h: 32, label: 'Inlet Valve', color: '#7E8F9F' },
  { id: 'comp-spiral-casing', x: 536, y: 264, w: 72, h: 42, label: 'Spiral Casing', color: '#4E5E6E' },
  { id: 'comp-stay-vanes', x: 546, y: 272, w: 12, h: 26, label: 'Stay Vanes', color: '#7E8F9F' },
  { id: 'comp-guide-vanes', x: 558, y: 272, w: 12, h: 26, label: 'Guide Vanes', color: '#36C5D9' },
  { id: 'comp-runner', x: 570, y: 270, w: 34, h: 30, label: 'Francis Runner', color: '#B6C4D1' },
  { id: 'comp-runner-blades', x: 575, y: 276, w: 24, h: 18, label: 'Runner Blades', color: '#36C5D9' },
  { id: 'comp-draft-tube', x: 572, y: 302, w: 88, h: 66, label: 'Draft Tube', color: '#586878' },
  { id: 'comp-main-shaft', x: 581, y: 190, w: 12, h: 80, label: 'Main Shaft', color: '#9AA8B5' },
  { id: 'comp-bearings', x: 569, y: 205, w: 36, h: 18, label: 'Bearings', color: '#697D91' },
  { id: 'comp-generator-housing', x: 538, y: 132, w: 98, h: 62, label: 'Gen. Housing', color: '#2B3540' },
  { id: 'comp-stator', x: 546, y: 140, w: 82, h: 46, label: 'Stator', color: '#4E5E6E' },
  { id: 'comp-stator-winding', x: 552, y: 145, w: 70, h: 36, label: 'Stator Winding', color: '#B86B35' },
  { id: 'comp-rotor', x: 560, y: 148, w: 54, h: 30, label: '24-Pole Rotor', color: '#8C9BA8' },
  { id: 'comp-field-winding', x: 564, y: 152, w: 46, h: 22, label: 'Field Winding', color: '#C4773B' },
  { id: 'comp-excitation-system', x: 544, y: 98, w: 36, h: 28, label: 'Exciter', color: '#36C5D9' },
  { id: 'comp-cooling-system', x: 636, y: 144, w: 22, h: 38, label: 'Coolers', color: '#4A6278' },
  { id: 'comp-generator-terminal', x: 636, y: 186, w: 26, h: 20, label: 'Terminals', color: '#F5B942' },
  { id: 'comp-busbar', x: 662, y: 188, w: 45, h: 14, label: 'Busbar', color: '#8B98A5' },
  { id: 'comp-circuit-breaker', x: 707, y: 178, w: 28, h: 32, label: 'Breaker', color: '#F5B942' },
  { id: 'comp-step-up-transformer', x: 742, y: 162, w: 54, h: 52, label: 'GSU Transformer', color: '#3A4654' },
  { id: 'comp-switchyard', x: 804, y: 158, w: 58, h: 56, label: 'Switchyard', color: '#7D8A97' },
  { id: 'comp-transmission-line', x: 862, y: 118, w: 68, h: 85, label: 'HV Line', color: '#F5B942' },
  { id: 'comp-electrical-grid', x: 932, y: 148, w: 52, h: 56, label: 'Grid', color: '#32C786' },
  { id: 'comp-draft-tube-outlet', x: 660, y: 325, w: 42, h: 43, label: 'Outlet Bay', color: '#6D7680' },
  { id: 'comp-tailrace', x: 702, y: 332, w: 140, h: 38, label: 'Tailrace', color: '#2589D8' },
  { id: 'comp-downstream-channel', x: 842, y: 334, w: 140, h: 36, label: 'River Channel', color: '#1D6AA8' },
];

export function PlantSchematic2DFallback({
  selectedComponentId,
  highlightedComponentIds = [],
  onSelectComponent,
  reason = 'WebGL2 unavailable or disabled — interactive 2D engineering schematic active.',
}: {
  selectedComponentId?: ComponentId | null;
  highlightedComponentIds?: ComponentId[];
  onSelectComponent?: (id: ComponentId) => void;
  reason?: string;
}) {
  return (
    <div
      data-testid="webgl-2d-fallback"
      className="flex h-full w-full flex-col justify-between bg-canvas p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <Badge variant="warning">2D Schematic Mode (WebGL2 Fallback)</Badge>
        <span className="text-xs text-text-secondary">{reason}</span>
      </div>

      <div className="relative flex-1 overflow-auto rounded border border-subtle bg-[#0E151E] p-2">
        <svg
          viewBox="0 0 1000 410"
          className="h-full w-full min-w-[680px]"
          role="img"
          aria-label="Interactive 2D cross-section schematic of DENRYU hydroelectric power plant"
        >
          {/* Background datum lines */}
          <line x1="15" y1="70" x2="985" y2="70" stroke="#2589D8" strokeDasharray="4 4" strokeOpacity="0.35" />
          <text x="20" y="62" fill="#60B2F5" fontSize="11" fontFamily="monospace">
            HEADWATER DATUM (Z_hw | ~85 m NET HEAD)
          </text>
          <line x1="15" y1="332" x2="985" y2="332" stroke="#2589D8" strokeDasharray="4 4" strokeOpacity="0.35" />
          <text x="20" y="395" fill="#697D91" fontSize="11" fontFamily="monospace">
            TAILWATER DATUM (Z_tw) — CLICK ANY COMPONENT TO INSPECT
          </text>

          {/* Flow path connector behind components */}
          <path
            d="M 185 164 L 400 164 L 515 286 L 587 286 L 587 348 L 970 348"
            fill="none"
            stroke="#2589D8"
            strokeWidth="8"
            strokeOpacity="0.25"
          />
          <path
            d="M 636 196 L 742 196 L 804 185 L 955 175"
            fill="none"
            stroke="#F5B942"
            strokeWidth="4"
            strokeOpacity="0.35"
          />

          {HOTSPOTS.map((spot) => {
            const isSelected = selectedComponentId === spot.id;
            const isHighlighted = highlightedComponentIds.includes(spot.id);
            const comp = COMPONENT_MAP[spot.id];
            return (
              <g
                key={spot.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${comp?.officialName ?? spot.label}`}
                onClick={() => onSelectComponent?.(spot.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectComponent?.(spot.id);
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                <rect
                  x={spot.x}
                  y={spot.y}
                  width={spot.w}
                  height={spot.h}
                  rx={3}
                  fill={spot.color}
                  fillOpacity={isSelected ? 0.55 : isHighlighted ? 0.42 : 0.24}
                  stroke={isSelected ? '#36C5D9' : isHighlighted ? '#F5B942' : '#2B3B4A'}
                  strokeWidth={isSelected ? 2.5 : isHighlighted ? 2 : 1}
                />
                <text
                  x={spot.x + spot.w / 2}
                  y={spot.y + spot.h / 2 + 3}
                  textAnchor="middle"
                  fill="#EEF4F8"
                  fontSize="9.5"
                  fontFamily="Inter, sans-serif"
                  fontWeight={isSelected ? 700 : 500}
                >
                  {spot.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
