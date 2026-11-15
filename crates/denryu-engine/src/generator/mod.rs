use crate::types::{EfficiencyMode, OperatingCondition, SimulationConfiguration};

pub fn compute_synchronous_speed_rpm(config: &SimulationConfiguration) -> f64 {
    if config.pole_count == 0 {
        return 0.0;
    }
    120.0 * (config.grid_frequency_hz as f64) / (config.pole_count as f64)
}

pub fn compute_angular_speed_rad_s(rotational_speed_rpm: f64) -> f64 {
    (2.0 * std::f64::consts::PI * rotational_speed_rpm) / 60.0
}

pub fn compute_generator_efficiency(
    config: &SimulationConfiguration,
    operating_condition: OperatingCondition,
    efficiency_mode: EfficiencyMode,
    generator_efficiency_ref: f64,
    turbine_mechanical_power_w: f64,
) -> f64 {
    if turbine_mechanical_power_w <= 0.0 || operating_condition == OperatingCondition::Shutdown {
        return 0.0;
    }

    match efficiency_mode {
        EfficiencyMode::FixedManual => generator_efficiency_ref.clamp(0.0, 0.99),
        EfficiencyMode::OperatingCurve => {
            let load_ratio = (turbine_mechanical_power_w / config.rated_turbine_mech_power_w).max(0.0);
            let lambda_ref = 1.0 - generator_efficiency_ref;
            let no_load_loss_term = (0.40 * lambda_ref) / load_ratio.max(0.02);
            let copper_loss_term = 0.60 * lambda_ref * (load_ratio / (0.85 * 0.85));
            (1.0 - no_load_loss_term - copper_loss_term).clamp(0.0, 0.99)
        }
    }
}

pub struct ElectricalOutputs {
    pub electrical_generated_power_w: f64,
    pub delivered_electrical_power_w: f64,
    pub power_deficit_w: f64,
    pub reserve_margin_w: f64,
    pub ceiling_clamped: bool,
}

pub fn compute_electrical_outputs(
    config: &SimulationConfiguration,
    operating_condition: OperatingCondition,
    turbine_mechanical_power_w: f64,
    generator_efficiency: f64,
    requested_load_w: f64,
) -> ElectricalOutputs {
    if matches!(
        operating_condition,
        OperatingCondition::Shutdown | OperatingCondition::Startup
    ) || turbine_mechanical_power_w <= 0.0
    {
        let deficit = if operating_condition == OperatingCondition::Startup
            || operating_condition == OperatingCondition::Shutdown
        {
            0.0
        } else {
            requested_load_w.max(0.0)
        };
        return ElectricalOutputs {
            electrical_generated_power_w: 0.0,
            delivered_electrical_power_w: 0.0,
            power_deficit_w: deficit,
            reserve_margin_w: 0.0,
            ceiling_clamped: false,
        };
    }

    let raw_pe = (turbine_mechanical_power_w * generator_efficiency).max(0.0);
    let ceiling_clamped = raw_pe > config.max_generator_elec_power_w;
    let pe = raw_pe.min(config.max_generator_elec_power_w);
    let req = requested_load_w.max(0.0);
    let delivered = pe.min(req);
    let deficit = (req - pe).max(0.0);
    let reserve = (pe - req).max(0.0);

    ElectricalOutputs {
        electrical_generated_power_w: pe,
        delivered_electrical_power_w: delivered,
        power_deficit_w: deficit,
        reserve_margin_w: reserve,
        ceiling_clamped,
    }
}
