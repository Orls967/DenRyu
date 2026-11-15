use crate::types::{EfficiencyMode, SimulationConfiguration};

pub fn compute_bep_flow(config: &SimulationConfiguration, net_head_m: f64) -> f64 {
    if net_head_m <= 0.0 || config.rated_net_head_m <= 0.0 {
        return 0.0;
    }
    config.rated_bep_flow_m3s * (net_head_m / config.rated_net_head_m).sqrt()
}

pub fn compute_flow_ratio(actual_flow_rate_m3s: f64, bep_flow_at_head_m3s: f64) -> f64 {
    if actual_flow_rate_m3s <= 0.0 || bep_flow_at_head_m3s <= 0.0 {
        return 0.0;
    }
    actual_flow_rate_m3s / bep_flow_at_head_m3s
}

pub fn compute_turbine_efficiency(
    config: &SimulationConfiguration,
    efficiency_mode: EfficiencyMode,
    turbine_efficiency_ref: f64,
    actual_flow_rate_m3s: f64,
    net_head_m: f64,
) -> f64 {
    if actual_flow_rate_m3s <= 0.0 || net_head_m <= 0.0 {
        return 0.0;
    }

    match efficiency_mode {
        EfficiencyMode::FixedManual => turbine_efficiency_ref.clamp(0.0, 0.96),
        EfficiencyMode::OperatingCurve => {
            let bep_flow = compute_bep_flow(config, net_head_m);
            if bep_flow <= 0.0 {
                return 0.0;
            }
            let q = actual_flow_rate_m3s / bep_flow;
            let h = net_head_m / config.rated_net_head_m;

            let k_q = if q <= 1.0 {
                let term1 = 0.55 * (1.0 - q).powi(2);
                let deep_part = (0.65 - q).max(0.0);
                let term2 = 0.35 * deep_part.powi(2);
                (1.0 - term1 - term2).max(0.15)
            } else {
                (1.0 - 0.85 * (q - 1.0).powi(2)).max(0.35)
            };

            let s_q = (q * q) / (q * q + 0.03_f64.powi(2));
            let k_h = (1.0 - 0.18 * (h - 1.0).powi(2)).max(0.75);

            (turbine_efficiency_ref * k_q * s_q * k_h).clamp(0.0, 0.96)
        }
    }
}

pub fn compute_mechanical_power(
    config: &SimulationConfiguration,
    hydraulic_power_w: f64,
    turbine_efficiency: f64,
) -> (f64, bool) {
    let raw_pm = (hydraulic_power_w * turbine_efficiency).max(0.0);
    if raw_pm > config.max_turbine_mech_power_w {
        (config.max_turbine_mech_power_w, true)
    } else {
        (raw_pm, false)
    }
}

pub fn compute_torque(
    config: &SimulationConfiguration,
    turbine_mechanical_power_w: f64,
    angular_speed_rad_s: f64,
) -> f64 {
    if angular_speed_rad_s < config.min_torque_angular_speed_rad_s
        || turbine_mechanical_power_w <= 0.0
    {
        return 0.0;
    }
    turbine_mechanical_power_w / angular_speed_rad_s
}
