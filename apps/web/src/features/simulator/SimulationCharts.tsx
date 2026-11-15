import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EfficiencyCurvePoint, SimulationOutput } from '@/types/domain';
import type { HistoryPoint } from '@/stores/simulatorStore';
import { Panel } from '@/components/ui/Primitives';
import { formatPowerNumberMW } from '@/services/formatters';

const AXIS_STYLE = { fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };
const TOOLTIP_STYLE = {
  backgroundColor: '#151E27',
  borderColor: '#2B3B4A',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#F1F5F9',
};

export function SimulationCharts({
  output,
  efficiencyCurve,
  history,
}: {
  output: SimulationOutput;
  efficiencyCurve: EfficiencyCurvePoint[];
  history: HistoryPoint[];
}) {
  const cascadeData = [
    { stage: 'Hydraulic', mw: formatPowerNumberMW(output.hydraulicPowerW), fill: '#2589D8' },
    { stage: 'Turbine Mech', mw: formatPowerNumberMW(output.turbineMechanicalPowerW), fill: '#36C5D9' },
    { stage: 'Elec Gen', mw: formatPowerNumberMW(output.electricalGeneratedPowerW), fill: '#F5B942' },
    { stage: 'Delivered', mw: formatPowerNumberMW(output.deliveredElectricalPowerW), fill: '#32C786' },
  ];

  const loadBalanceData = [
    { metric: 'Generated', mw: formatPowerNumberMW(output.electricalGeneratedPowerW), fill: '#F5B942' },
    { metric: 'Req. Load', mw: formatPowerNumberMW(output.requestedLoadW), fill: '#36C5D9' },
    {
      metric: output.powerDeficitW > 0 ? 'Deficit' : 'Reserve',
      mw: formatPowerNumberMW(
        output.powerDeficitW > 0 ? output.powerDeficitW : output.reserveMarginW,
      ),
      fill: output.powerDeficitW > 0 ? '#EF4444' : '#32C786',
    },
  ];

  const curveData = efficiencyCurve.map((pt) => ({
    flow: Number(pt.flowRateM3s.toFixed(1)),
    effPct: Number((pt.turbineEfficiency * 100).toFixed(2)),
  }));

  const opFlow = Number(output.actualFlowRateM3s.toFixed(1));
  const opEff = Number((output.turbineEfficiency * 100).toFixed(2));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* 1. Power Conversion Cascade */}
      <Panel className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Power Conversion Cascade (MW)</h3>
          <span className="font-mono text-[11px] text-text-muted">
            Losses: {formatPowerNumberMW(output.turbineLossW + output.generatorLossW).toFixed(2)} MW
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cascadeData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#2B3B4A" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tick={AXIS_STYLE} axisLine={{ stroke: '#2B3B4A' }} />
              <YAxis tick={AXIS_STYLE} axisLine={{ stroke: '#2B3B4A' }} unit=" MW" width={55} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="mw" radius={[4, 4, 0, 0]}>
                {cascadeData.map((entry) => (
                  <Cell key={entry.stage} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* 2. Francis Efficiency Operating Point */}
      <Panel className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Francis Turbine Efficiency Curve (%)
          </h3>
          <span className="font-mono text-[11px] text-cyan-accent">
            BEP @ {output.bepFlowAtHeadM3s.toFixed(1)} m³/s
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#2B3B4A" strokeDasharray="3 3" />
              <XAxis
                dataKey="flow"
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={AXIS_STYLE}
                unit=" m³/s"
              />
              <YAxis domain={[0, 100]} tick={AXIS_STYLE} unit="%" width={45} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="effPct"
                stroke="#36C5D9"
                fill="#36C5D9"
                fillOpacity={0.18}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <ReferenceDot
                x={opFlow}
                y={opEff}
                r={6}
                fill="#F5B942"
                stroke="#0B1016"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* 3. Generation vs Requested Grid Load */}
      <Panel className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Available Power vs. Requested Load
          </h3>
          <span
            className={`font-mono text-[11px] ${
              output.powerDeficitW > 0 ? 'text-status-error' : 'text-status-success'
            }`}
          >
            {output.powerDeficitW > 0
              ? `Deficit ${formatPowerNumberMW(output.powerDeficitW).toFixed(2)} MW`
              : `Reserve +${formatPowerNumberMW(output.reserveMarginW).toFixed(2)} MW`}
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loadBalanceData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#2B3B4A" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="metric" tick={AXIS_STYLE} axisLine={{ stroke: '#2B3B4A' }} />
              <YAxis tick={AXIS_STYLE} axisLine={{ stroke: '#2B3B4A' }} unit=" MW" width={55} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="mw" radius={[4, 4, 0, 0]}>
                {loadBalanceData.map((entry) => (
                  <Cell key={entry.metric} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* 4. Simulation Timeline */}
      <Panel className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Power Dispatch Timeline (MW)
          </h3>
          <span className="font-mono text-[11px] text-text-muted">
            {history.length} samples · {output.timestampSimS.toFixed(1)} s
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#2B3B4A" strokeDasharray="3 3" />
              <XAxis dataKey="simTimeS" tick={AXIS_STYLE} unit="s" />
              <YAxis tick={AXIS_STYLE} unit=" MW" width={55} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="generatedMW"
                name="Generated MW"
                stroke="#F5B942"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="deliveredMW"
                name="Delivered MW"
                stroke="#32C786"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="loadMW"
                name="Req Load MW"
                stroke="#36C5D9"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
