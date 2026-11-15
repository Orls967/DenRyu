use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OperatingCondition {
    Startup,
    Normal,
    PartialLoad,
    HighLoad,
    Shutdown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EfficiencyMode {
    OperatingCurve,
    FixedManual,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulationInput {
    pub net_head_m: f64,
    pub requested_flow_rate_m3s: f64,
    pub guide_vane_opening_pct: f64,
    pub turbine_efficiency_ref: f64,
    pub generator_efficiency_ref: f64,
    pub requested_load_w: f64,
    pub operating_condition: OperatingCondition,
    pub efficiency_mode: EfficiencyMode,
}

impl Default for SimulationInput {
    fn default() -> Self {
        Self {
            net_head_m: 85.0,
            requested_flow_rate_m3s: 60.0,
            guide_vane_opening_pct: 85.0,
            turbine_efficiency_ref: 0.92,
            generator_efficiency_ref: 0.975,
            requested_load_w: 40_000_000.0,
            operating_condition: OperatingCondition::Normal,
            efficiency_mode: EfficiencyMode::OperatingCurve,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulationConfiguration {
    pub plant_id: String,
    #[serde(rename = "waterDensityKgM3")]
    pub water_density_kg_m3: f64,
    #[serde(rename = "gravityMS2")]
    pub gravity_m_s2: f64,
    pub rated_net_head_m: f64,
    pub min_operating_head_m: f64,
    pub max_operating_head_m: f64,
    pub max_input_head_m: f64,
    pub rated_gate_capacity_flow_m3s: f64,
    pub rated_bep_flow_m3s: f64,
    pub min_stable_flow_m3s: f64,
    pub max_input_flow_m3s: f64,
    pub rated_turbine_mech_power_w: f64,
    pub max_turbine_mech_power_w: f64,
    pub max_generator_elec_power_w: f64,
    pub grid_frequency_hz: u16,
    pub pole_count: u16,
    pub min_torque_angular_speed_rad_s: f64,
    pub startup_ramp_duration_s: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum WarningCode {
    FlowConstrainedByGateOrHead,
    LowHeadOperatingLimit,
    HighHeadStructuralLimit,
    DeepPartLoadCavitationRisk,
    InsufficientGenerationForLoad,
    PowerCeilingClamped,
    ZeroFlowMotoringRisk,
    StartupUnsynchronized,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WarningSeverity {
    Info,
    Warning,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulationWarning {
    pub code: WarningCode,
    pub severity: WarningSeverity,
    pub message: String,
    pub affected_components: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EfficiencyCurvePoint {
    pub flow_rate_m3s: f64,
    pub flow_ratio_to_bep: f64,
    pub turbine_efficiency: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulationOutput {
    pub timestamp_sim_s: f64,
    pub available_flow_limit_m3s: f64,
    pub actual_flow_rate_m3s: f64,
    pub bep_flow_at_head_m3s: f64,
    pub flow_ratio_to_bep: f64,
    pub hydraulic_power_w: f64,
    pub turbine_mechanical_power_w: f64,
    pub electrical_generated_power_w: f64,
    pub delivered_electrical_power_w: f64,
    pub requested_load_w: f64,
    pub power_deficit_w: f64,
    pub reserve_margin_w: f64,
    pub turbine_loss_w: f64,
    pub generator_loss_w: f64,
    pub turbine_efficiency: f64,
    pub generator_efficiency: f64,
    pub overall_efficiency: f64,
    pub turbine_torque_nm: f64,
    pub synchronous_speed_rpm: f64,
    pub rotational_speed_rpm: f64,
    pub angular_speed_rad_s: f64,
    pub cumulative_generated_energy_j: f64,
    pub cumulative_delivered_energy_j: f64,
    pub operating_condition: OperatingCondition,
    pub efficiency_mode: EfficiencyMode,
    pub warnings: Vec<SimulationWarning>,
    pub is_synthetic_educational_model: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ValidationErrorDetail {
    pub field: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum SimulationError {
    NonFiniteInput { field: String },
    OutOfRange { detail: ValidationErrorDetail },
    InvalidTimestep { message: String },
}

impl fmt::Display for SimulationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SimulationError::NonFiniteInput { field } => {
                write!(f, "Non-finite value (NaN or Infinity) in field '{}'", field)
            }
            SimulationError::OutOfRange { detail } => {
                write!(f, "Validation error in '{}': {}", detail.field, detail.message)
            }
            SimulationError::InvalidTimestep { message } => {
                write!(f, "Invalid timestep: {}", message)
            }
        }
    }
}
