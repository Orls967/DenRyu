export function formatPowerMW(watts: number): string {
  if (!Number.isFinite(watts)) return '—';
  if (Math.abs(watts) < 1_000_000 && Math.abs(watts) > 0) {
    return `${(watts / 1_000).toFixed(1)} kW`;
  }
  return `${(watts / 1_000_000).toFixed(2)} MW`;
}

export function formatPowerNumberMW(watts: number): number {
  return Number.isFinite(watts) ? Number((watts / 1_000_000).toFixed(3)) : 0;
}

export function formatTorqueMNm(torqueNm: number): string {
  if (!Number.isFinite(torqueNm)) return '—';
  if (Math.abs(torqueNm) < 1_000_000 && Math.abs(torqueNm) > 0) {
    return `${(torqueNm / 1_000).toFixed(1)} kN·m`;
  }
  return `${(torqueNm / 1_000_000).toFixed(3)} MN·m`;
}

export function formatEfficiencyPct(ratio: number): string {
  if (!Number.isFinite(ratio)) return '—';
  return `${(ratio * 100).toFixed(2)} %`;
}

export function formatEnergyMWh(joules: number): string {
  if (!Number.isFinite(joules)) return '—';
  const kwh = joules / 3_600_000;
  if (kwh < 1000) {
    return `${kwh.toFixed(2)} kWh`;
  }
  return `${(kwh / 1000).toFixed(3)} MWh`;
}

export function formatHeadM(meters: number): string {
  if (!Number.isFinite(meters)) return '—';
  return `${meters.toFixed(1)} m`;
}

export function formatFlowM3s(flow: number): string {
  if (!Number.isFinite(flow)) return '—';
  return `${flow.toFixed(2)} m³/s`;
}

export function formatRpm(rpm: number): string {
  if (!Number.isFinite(rpm)) return '—';
  return `${rpm.toFixed(1)} rpm`;
}
