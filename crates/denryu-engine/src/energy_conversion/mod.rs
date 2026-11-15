use crate::types::OperatingCondition;

pub fn compute_overall_efficiency(
    operating_condition: OperatingCondition,
    hydraulic_power_w: f64,
    electrical_generated_power_w: f64,
) -> f64 {
    if hydraulic_power_w <= 0.0
        || matches!(
            operating_condition,
            OperatingCondition::Shutdown | OperatingCondition::Startup
        )
    {
        return 0.0;
    }
    (electrical_generated_power_w / hydraulic_power_w).clamp(0.0, 1.0)
}

pub fn compute_losses(
    operating_condition: OperatingCondition,
    hydraulic_power_w: f64,
    turbine_mechanical_power_w: f64,
    electrical_generated_power_w: f64,
) -> (f64, f64) {
    let turbine_loss = (hydraulic_power_w - turbine_mechanical_power_w).max(0.0);
    let generator_loss = if matches!(
        operating_condition,
        OperatingCondition::Shutdown | OperatingCondition::Startup
    ) {
        0.0
    } else {
        (turbine_mechanical_power_w - electrical_generated_power_w).max(0.0)
    };
    (turbine_loss, generator_loss)
}
