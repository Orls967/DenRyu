use crate::types::{OperatingCondition, SimulationConfiguration};

pub fn compute_available_flow(
    config: &SimulationConfiguration,
    net_head_m: f64,
    guide_vane_opening_pct: f64,
) -> f64 {
    if net_head_m <= 0.0 || guide_vane_opening_pct <= 0.0 || config.rated_net_head_m <= 0.0 {
        return 0.0;
    }
    let gate_fraction = (guide_vane_opening_pct / 100.0).clamp(0.0, 1.0);
    let head_ratio = (net_head_m / config.rated_net_head_m).max(0.0);
    config.rated_gate_capacity_flow_m3s * gate_fraction * head_ratio.sqrt()
}

pub fn compute_actual_flow(
    operating_condition: OperatingCondition,
    requested_flow_rate_m3s: f64,
    available_flow_limit_m3s: f64,
    net_head_m: f64,
    guide_vane_opening_pct: f64,
) -> f64 {
    if operating_condition == OperatingCondition::Shutdown
        || guide_vane_opening_pct <= 0.0
        || net_head_m <= 0.0
    {
        return 0.0;
    }
    requested_flow_rate_m3s
        .max(0.0)
        .min(available_flow_limit_m3s.max(0.0))
}

pub fn compute_hydraulic_power(
    config: &SimulationConfiguration,
    actual_flow_rate_m3s: f64,
    net_head_m: f64,
) -> f64 {
    if actual_flow_rate_m3s <= 0.0 || net_head_m <= 0.0 {
        return 0.0;
    }
    config.water_density_kg_m3 * config.gravity_m_s2 * actual_flow_rate_m3s * net_head_m
}
