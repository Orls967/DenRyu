use crate::energy_conversion::{compute_losses, compute_overall_efficiency};
use crate::generator::{
    compute_angular_speed_rad_s, compute_electrical_outputs, compute_generator_efficiency,
    compute_synchronous_speed_rpm,
};
use crate::hydraulics::{compute_actual_flow, compute_available_flow, compute_hydraulic_power};
use crate::turbine::{
    compute_bep_flow, compute_flow_ratio, compute_mechanical_power, compute_torque,
    compute_turbine_efficiency,
};
use crate::types::{
    EfficiencyCurvePoint, EfficiencyMode, OperatingCondition, SimulationConfiguration,
    SimulationError, SimulationInput, SimulationOutput, SimulationWarning, ValidationErrorDetail,
    WarningCode, WarningSeverity,
};

#[derive(Debug, Clone)]
pub struct SimulationEngine {
    pub config: SimulationConfiguration,
    pub elapsed_time_s: f64,
    pub cumulative_generated_energy_j: f64,
    pub cumulative_delivered_energy_j: f64,
    pub current_startup_rpm: f64,
}

impl Default for SimulationEngine {
    fn default() -> Self {
        Self::new(SimulationConfiguration::default())
    }
}

impl SimulationEngine {
    pub fn new(config: SimulationConfiguration) -> Self {
        Self {
            config,
            elapsed_time_s: 0.0,
            cumulative_generated_energy_j: 0.0,
            cumulative_delivered_energy_j: 0.0,
            current_startup_rpm: 0.0,
        }
    }

    pub fn reset(&mut self) {
        self.elapsed_time_s = 0.0;
        self.cumulative_generated_energy_j = 0.0;
        self.cumulative_delivered_energy_j = 0.0;
        self.current_startup_rpm = 0.0;
    }

    pub fn validate_input(&self, input: &SimulationInput) -> Result<(), SimulationError> {
        let checks = [
            ("netHeadM", input.net_head_m, 0.0, self.config.max_input_head_m),
            (
                "requestedFlowRateM3s",
                input.requested_flow_rate_m3s,
                0.0,
                self.config.max_input_flow_m3s,
            ),
            ("guideVaneOpeningPct", input.guide_vane_opening_pct, 0.0, 100.0),
            ("turbineEfficiencyRef", input.turbine_efficiency_ref, 0.40, 0.95),
            ("generatorEfficiencyRef", input.generator_efficiency_ref, 0.60, 0.99),
            ("requestedLoadW", input.requested_load_w, 0.0, 70_000_000.0),
        ];

        for (field, val, min_v, max_v) in checks {
            if !val.is_finite() {
                return Err(SimulationError::NonFiniteInput {
                    field: field.to_string(),
                });
            }
            if val < min_v || val > max_v {
                return Err(SimulationError::OutOfRange {
                    detail: ValidationErrorDetail {
                        field: field.to_string(),
                        message: format!("Value {} must be within [{}, {}].", val, min_v, max_v),
                    },
                });
            }
        }
        Ok(())
    }

    fn compute_core(
        &self,
        input: &SimulationInput,
        rotational_speed_rpm: f64,
        timestamp_sim_s: f64,
        cum_gen_j: f64,
        cum_del_j: f64,
    ) -> SimulationOutput {
        let sync_rpm = compute_synchronous_speed_rpm(&self.config);
        let available_flow_limit_m3s = compute_available_flow(
            &self.config,
            input.net_head_m,
            input.guide_vane_opening_pct,
        );
        let actual_flow_rate_m3s = compute_actual_flow(
            input.operating_condition,
            input.requested_flow_rate_m3s,
            available_flow_limit_m3s,
            input.net_head_m,
            input.guide_vane_opening_pct,
        );
        let bep_flow_at_head_m3s = compute_bep_flow(&self.config, input.net_head_m);
        let flow_ratio_to_bep = compute_flow_ratio(actual_flow_rate_m3s, bep_flow_at_head_m3s);
        let hydraulic_power_w =
            compute_hydraulic_power(&self.config, actual_flow_rate_m3s, input.net_head_m);

        let turbine_efficiency = compute_turbine_efficiency(
            &self.config,
            input.efficiency_mode,
            input.turbine_efficiency_ref,
            actual_flow_rate_m3s,
            input.net_head_m,
        );
        let (turbine_mechanical_power_w, mech_clamped) =
            compute_mechanical_power(&self.config, hydraulic_power_w, turbine_efficiency);

        let angular_speed_rad_s = compute_angular_speed_rad_s(rotational_speed_rpm);
        let turbine_torque_nm =
            compute_torque(&self.config, turbine_mechanical_power_w, angular_speed_rad_s);

        let generator_efficiency = compute_generator_efficiency(
            &self.config,
            input.operating_condition,
            input.efficiency_mode,
            input.generator_efficiency_ref,
            turbine_mechanical_power_w,
        );

        let elec = compute_electrical_outputs(
            &self.config,
            input.operating_condition,
            turbine_mechanical_power_w,
            generator_efficiency,
            input.requested_load_w,
        );

        let overall_efficiency = compute_overall_efficiency(
            input.operating_condition,
            hydraulic_power_w,
            elec.electrical_generated_power_w,
        );
        let (turbine_loss_w, generator_loss_w) = compute_losses(
            input.operating_condition,
            hydraulic_power_w,
            turbine_mechanical_power_w,
            elec.electrical_generated_power_w,
        );

        let warnings = self.collect_warnings(
            input,
            available_flow_limit_m3s,
            actual_flow_rate_m3s,
            flow_ratio_to_bep,
            elec.electrical_generated_power_w,
            mech_clamped || elec.ceiling_clamped,
        );

        SimulationOutput {
            timestamp_sim_s,
            available_flow_limit_m3s,
            actual_flow_rate_m3s,
            bep_flow_at_head_m3s,
            flow_ratio_to_bep,
            hydraulic_power_w,
            turbine_mechanical_power_w,
            electrical_generated_power_w: elec.electrical_generated_power_w,
            delivered_electrical_power_w: elec.delivered_electrical_power_w,
            requested_load_w: input.requested_load_w,
            power_deficit_w: elec.power_deficit_w,
            reserve_margin_w: elec.reserve_margin_w,
            turbine_loss_w,
            generator_loss_w,
            turbine_efficiency,
            generator_efficiency,
            overall_efficiency,
            turbine_torque_nm,
            synchronous_speed_rpm: sync_rpm,
            rotational_speed_rpm,
            angular_speed_rad_s,
            cumulative_generated_energy_j: cum_gen_j,
            cumulative_delivered_energy_j: cum_del_j,
            operating_condition: input.operating_condition,
            efficiency_mode: input.efficiency_mode,
            warnings,
            is_synthetic_educational_model: true,
        }
    }

    fn collect_warnings(
        &self,
        input: &SimulationInput,
        available_flow_limit_m3s: f64,
        actual_flow_rate_m3s: f64,
        flow_ratio_to_bep: f64,
        electrical_generated_power_w: f64,
        ceiling_clamped: bool,
    ) -> Vec<SimulationWarning> {
        let mut warnings = Vec::new();
        let is_synchronized = matches!(
            input.operating_condition,
            OperatingCondition::Normal
                | OperatingCondition::PartialLoad
                | OperatingCondition::HighLoad
        );

        if input.operating_condition != OperatingCondition::Shutdown
            && input.requested_flow_rate_m3s > available_flow_limit_m3s + 1e-3
        {
            warnings.push(SimulationWarning {
                code: WarningCode::FlowConstrainedByGateOrHead,
                severity: WarningSeverity::Warning,
                message: format!(
                    "Requested flow ({:.2} m3/s) exceeds current gate/head limit ({:.2} m3/s); actual flow is constrained.",
                    input.requested_flow_rate_m3s, available_flow_limit_m3s
                ),
                affected_components: vec![
                    "comp-guide-vanes".to_string(),
                    "comp-penstock".to_string(),
                ],
            });
        }

        if input.net_head_m > 0.0 && input.net_head_m < self.config.min_operating_head_m {
            warnings.push(SimulationWarning {
                code: WarningCode::LowHeadOperatingLimit,
                severity: WarningSeverity::Warning,
                message: format!(
                    "Net head ({:.1} m) is below the recommended Francis design floor ({:.1} m); cavitation and low torque risk.",
                    input.net_head_m, self.config.min_operating_head_m
                ),
                affected_components: vec![
                    "comp-reservoir".to_string(),
                    "comp-runner".to_string(),
                    "comp-draft-tube".to_string(),
                ],
            });
        }

        if input.net_head_m > self.config.max_operating_head_m {
            warnings.push(SimulationWarning {
                code: WarningCode::HighHeadStructuralLimit,
                severity: WarningSeverity::Warning,
                message: format!(
                    "Net head ({:.1} m) exceeds nominal reference limit ({:.1} m); structural pressure margin reduced.",
                    input.net_head_m, self.config.max_operating_head_m
                ),
                affected_components: vec![
                    "comp-penstock".to_string(),
                    "comp-spiral-casing".to_string(),
                ],
            });
        }

        if actual_flow_rate_m3s > 0.0
            && (actual_flow_rate_m3s < self.config.min_stable_flow_m3s || flow_ratio_to_bep < 0.45)
        {
            warnings.push(SimulationWarning {
                code: WarningCode::DeepPartLoadCavitationRisk,
                severity: WarningSeverity::Warning,
                message: "Deep part-load operation induces draft-tube helical vortex rope, pulsations, and lower efficiency.".to_string(),
                affected_components: vec![
                    "comp-runner-blades".to_string(),
                    "comp-draft-tube".to_string(),
                ],
            });
        }

        if is_synchronized && input.requested_load_w > electrical_generated_power_w + 1_000.0 {
            let deficit_mw = (input.requested_load_w - electrical_generated_power_w) / 1e6;
            warnings.push(SimulationWarning {
                code: WarningCode::InsufficientGenerationForLoad,
                severity: WarningSeverity::Error,
                message: format!(
                    "Requested grid load exceeds available electrical generation; deficit of {:.2} MW occurs.",
                    deficit_mw
                ),
                affected_components: vec![
                    "comp-electrical-grid".to_string(),
                    "comp-stator-winding".to_string(),
                ],
            });
        }

        if ceiling_clamped {
            warnings.push(SimulationWarning {
                code: WarningCode::PowerCeilingClamped,
                severity: WarningSeverity::Warning,
                message: "Output clamped at unit thermal/mechanical nameplate ceiling (58 MW mech / 55 MW elec).".to_string(),
                affected_components: vec![
                    "comp-runner".to_string(),
                    "comp-stator".to_string(),
                ],
            });
        }

        if is_synchronized && actual_flow_rate_m3s <= 1e-3 {
            warnings.push(SimulationWarning {
                code: WarningCode::ZeroFlowMotoringRisk,
                severity: WarningSeverity::Warning,
                message: "Generator breaker closed with zero water flow risks reverse-power motoring.".to_string(),
                affected_components: vec![
                    "comp-circuit-breaker".to_string(),
                    "comp-runner".to_string(),
                ],
            });
        }

        if input.operating_condition == OperatingCondition::Startup {
            warnings.push(SimulationWarning {
                code: WarningCode::StartupUnsynchronized,
                severity: WarningSeverity::Info,
                message: "Unit ramping speed with breaker open; zero power exported to grid until synchronized.".to_string(),
                affected_components: vec![
                    "comp-circuit-breaker".to_string(),
                    "comp-rotor".to_string(),
                ],
            });
        }

        warnings
    }

    pub fn evaluate_snapshot(&self, input: &SimulationInput) -> Result<SimulationOutput, SimulationError> {
        self.validate_input(input)?;
        let sync_rpm = compute_synchronous_speed_rpm(&self.config);
        let speed_rpm = match input.operating_condition {
            OperatingCondition::Shutdown => 0.0,
            OperatingCondition::Startup => {
                if input.net_head_m > 0.0 && input.guide_vane_opening_pct > 0.0 && input.requested_flow_rate_m3s > 0.0 {
                    0.50 * sync_rpm
                } else {
                    0.0
                }
            }
            OperatingCondition::Normal
            | OperatingCondition::PartialLoad
            | OperatingCondition::HighLoad => sync_rpm,
        };

        Ok(self.compute_core(
            input,
            speed_rpm,
            self.elapsed_time_s,
            self.cumulative_generated_energy_j,
            self.cumulative_delivered_energy_j,
        ))
    }

    pub fn step(
        &mut self,
        input: &SimulationInput,
        dt_seconds: f64,
    ) -> Result<SimulationOutput, SimulationError> {
        self.validate_input(input)?;
        if !dt_seconds.is_finite() || dt_seconds < 0.0 {
            return Err(SimulationError::InvalidTimestep {
                message: format!("Timestep dtSeconds ({}) must be finite and >= 0.", dt_seconds),
            });
        }

        let sync_rpm = compute_synchronous_speed_rpm(&self.config);
        let avail_flow = compute_available_flow(
            &self.config,
            input.net_head_m,
            input.guide_vane_opening_pct,
        );
        let actual_flow = compute_actual_flow(
            input.operating_condition,
            input.requested_flow_rate_m3s,
            avail_flow,
            input.net_head_m,
            input.guide_vane_opening_pct,
        );

        let speed_rpm = match input.operating_condition {
            OperatingCondition::Shutdown => {
                self.current_startup_rpm = 0.0;
                0.0
            }
            OperatingCondition::Startup => {
                if actual_flow > 0.0 && self.config.startup_ramp_duration_s > 0.0 {
                    let ramp_rate = sync_rpm / self.config.startup_ramp_duration_s;
                    self.current_startup_rpm =
                        (self.current_startup_rpm + ramp_rate * dt_seconds).min(sync_rpm);
                } else {
                    self.current_startup_rpm = (self.current_startup_rpm - 20.0 * dt_seconds).max(0.0);
                }
                self.current_startup_rpm
            }
            OperatingCondition::Normal
            | OperatingCondition::PartialLoad
            | OperatingCondition::HighLoad => {
                self.current_startup_rpm = sync_rpm;
                sync_rpm
            }
        };

        self.elapsed_time_s += dt_seconds;
        let preliminary = self.compute_core(
            input,
            speed_rpm,
            self.elapsed_time_s,
            self.cumulative_generated_energy_j,
            self.cumulative_delivered_energy_j,
        );

        self.cumulative_generated_energy_j += preliminary.electrical_generated_power_w * dt_seconds;
        self.cumulative_delivered_energy_j += preliminary.delivered_electrical_power_w * dt_seconds;

        Ok(SimulationOutput {
            cumulative_generated_energy_j: self.cumulative_generated_energy_j,
            cumulative_delivered_energy_j: self.cumulative_delivered_energy_j,
            ..preliminary
        })
    }

    pub fn evaluate_efficiency_curve(
        &self,
        net_head_m: f64,
        turbine_efficiency_ref: f64,
        efficiency_mode: EfficiencyMode,
        points: usize,
    ) -> Result<Vec<EfficiencyCurvePoint>, SimulationError> {
        if !net_head_m.is_finite() || net_head_m < 0.0 || net_head_m > self.config.max_input_head_m {
            return Err(SimulationError::OutOfRange {
                detail: ValidationErrorDetail {
                    field: "netHeadM".to_string(),
                    message: format!("netHeadM must be within [0, {}]", self.config.max_input_head_m),
                },
            });
        }
        if !turbine_efficiency_ref.is_finite()
            || turbine_efficiency_ref < 0.40
            || turbine_efficiency_ref > 0.95
        {
            return Err(SimulationError::OutOfRange {
                detail: ValidationErrorDetail {
                    field: "turbineEfficiencyRef".to_string(),
                    message: "turbineEfficiencyRef must be within [0.40, 0.95]".to_string(),
                },
            });
        }

        let n = points.clamp(5, 101);
        let bep_flow = compute_bep_flow(&self.config, net_head_m);
        let max_q = self.config.max_input_flow_m3s;
        let mut curve = Vec::with_capacity(n);

        for i in 0..n {
            let frac = i as f64 / (n - 1) as f64;
            let q_m3s = frac * max_q;
            let eta_t = compute_turbine_efficiency(
                &self.config,
                efficiency_mode,
                turbine_efficiency_ref,
                q_m3s,
                net_head_m,
            );
            let q_ratio = if bep_flow > 0.0 { q_m3s / bep_flow } else { 0.0 };
            curve.push(EfficiencyCurvePoint {
                flow_rate_m3s: q_m3s,
                flow_ratio_to_bep: q_ratio,
                turbine_efficiency: eta_t,
            });
        }

        Ok(curve)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;

    #[test]
    fn scenario_a_normal_operation_matches_spec() {
        let engine = SimulationEngine::default();
        let input = SimulationInput::default();
        let out = engine.evaluate_snapshot(&input).expect("Scenario A valid");

        assert_relative_eq!(out.actual_flow_rate_m3s, 60.0, epsilon = 1e-4);
        assert_relative_eq!(out.turbine_efficiency, 0.918298, epsilon = 1e-4);
        assert_relative_eq!(out.generator_efficiency, 0.970043, epsilon = 1e-4);
        assert_relative_eq!(out.hydraulic_power_w / 1e6, 50.013915, epsilon = 1e-3);
        assert_relative_eq!(out.turbine_mechanical_power_w / 1e6, 45.927671, epsilon = 1e-3);
        assert_relative_eq!(out.electrical_generated_power_w / 1e6, 44.551816, epsilon = 1e-3);
        assert_relative_eq!(out.delivered_electrical_power_w / 1e6, 40.0, epsilon = 1e-3);
        assert_relative_eq!(out.turbine_torque_nm / 1e6, 1.754308, epsilon = 1e-3);
        assert_relative_eq!(out.rotational_speed_rpm, 250.0, epsilon = 1e-6);
        assert!(out.warnings.is_empty());
    }

    #[test]
    fn scenario_b_reduced_flow_matches_spec() {
        let engine = SimulationEngine::default();
        let input = SimulationInput {
            net_head_m: 85.0,
            requested_flow_rate_m3s: 32.0,
            guide_vane_opening_pct: 50.0,
            turbine_efficiency_ref: 0.92,
            generator_efficiency_ref: 0.975,
            requested_load_w: 35_000_000.0,
            operating_condition: OperatingCondition::PartialLoad,
            efficiency_mode: EfficiencyMode::OperatingCurve,
        };
        let out = engine.evaluate_snapshot(&input).expect("Scenario B valid");

        assert_relative_eq!(out.actual_flow_rate_m3s, 32.0, epsilon = 1e-4);
        assert_relative_eq!(out.turbine_efficiency, 0.8128, epsilon = 5e-4);
        assert_relative_eq!(out.generator_efficiency, 0.9679, epsilon = 5e-4);
        assert_relative_eq!(out.hydraulic_power_w / 1e6, 26.674, epsilon = 1e-2);
        assert_relative_eq!(out.turbine_mechanical_power_w / 1e6, 21.681, epsilon = 1e-2);
        assert_relative_eq!(out.electrical_generated_power_w / 1e6, 20.986, epsilon = 1e-2);
        assert_relative_eq!(out.turbine_torque_nm / 1e6, 0.828, epsilon = 1e-3);
        assert!(out
            .warnings
            .iter()
            .any(|w| w.code == WarningCode::InsufficientGenerationForLoad));
    }

    #[test]
    fn scenario_c_reduced_head_matches_spec() {
        let engine = SimulationEngine::default();
        let input = SimulationInput {
            net_head_m: 55.0,
            requested_flow_rate_m3s: 60.0,
            guide_vane_opening_pct: 85.0,
            turbine_efficiency_ref: 0.92,
            generator_efficiency_ref: 0.975,
            requested_load_w: 40_000_000.0,
            operating_condition: OperatingCondition::PartialLoad,
            efficiency_mode: EfficiencyMode::OperatingCurve,
        };
        let out = engine.evaluate_snapshot(&input).expect("Scenario C valid");

        assert_relative_eq!(out.actual_flow_rate_m3s, 49.229, epsilon = 1e-2);
        assert_relative_eq!(out.turbine_efficiency, 0.8963, epsilon = 5e-4);
        assert_relative_eq!(out.generator_efficiency, 0.9691, epsilon = 5e-4);
        assert_relative_eq!(out.hydraulic_power_w / 1e6, 26.553, epsilon = 1e-2);
        assert_relative_eq!(out.turbine_mechanical_power_w / 1e6, 23.800, epsilon = 1e-2);
        assert_relative_eq!(out.electrical_generated_power_w / 1e6, 23.064, epsilon = 1e-2);
        assert_relative_eq!(out.turbine_torque_nm / 1e6, 0.909, epsilon = 1e-3);
        assert!(out
            .warnings
            .iter()
            .any(|w| w.code == WarningCode::FlowConstrainedByGateOrHead));
        assert!(out
            .warnings
            .iter()
            .any(|w| w.code == WarningCode::InsufficientGenerationForLoad));
    }

    #[test]
    fn scenario_d_efficiency_degradation_matches_spec() {
        let engine = SimulationEngine::default();
        let input = SimulationInput {
            net_head_m: 85.0,
            requested_flow_rate_m3s: 60.0,
            guide_vane_opening_pct: 85.0,
            turbine_efficiency_ref: 0.78,
            generator_efficiency_ref: 0.900,
            requested_load_w: 40_000_000.0,
            operating_condition: OperatingCondition::Normal,
            efficiency_mode: EfficiencyMode::OperatingCurve,
        };
        let out = engine.evaluate_snapshot(&input).expect("Scenario D valid");

        assert_relative_eq!(out.turbine_efficiency, 0.7786, epsilon = 5e-4);
        assert_relative_eq!(out.generator_efficiency, 0.8840, epsilon = 5e-4);
        assert_relative_eq!(out.turbine_mechanical_power_w / 1e6, 38.939, epsilon = 1e-2);
        assert_relative_eq!(out.electrical_generated_power_w / 1e6, 34.420, epsilon = 1e-2);
        assert_relative_eq!(out.turbine_torque_nm / 1e6, 1.487, epsilon = 1e-3);
        assert!(out
            .warnings
            .iter()
            .any(|w| w.code == WarningCode::InsufficientGenerationForLoad));
    }

    #[test]
    fn scenario_e_load_variation_matches_spec() {
        let engine = SimulationEngine::default();
        let input = SimulationInput {
            net_head_m: 85.0,
            requested_flow_rate_m3s: 60.0,
            guide_vane_opening_pct: 85.0,
            turbine_efficiency_ref: 0.92,
            generator_efficiency_ref: 0.975,
            requested_load_w: 48_000_000.0,
            operating_condition: OperatingCondition::HighLoad,
            efficiency_mode: EfficiencyMode::OperatingCurve,
        };
        let out = engine.evaluate_snapshot(&input).expect("Scenario E valid");

        assert_relative_eq!(out.electrical_generated_power_w / 1e6, 44.552, epsilon = 1e-2);
        assert_relative_eq!(out.delivered_electrical_power_w / 1e6, 44.552, epsilon = 1e-2);
        assert_relative_eq!(out.power_deficit_w / 1e6, 3.448, epsilon = 1e-2);
        assert_relative_eq!(out.rotational_speed_rpm, 250.0, epsilon = 1e-6);
        assert!(out
            .warnings
            .iter()
            .any(|w| w.code == WarningCode::InsufficientGenerationForLoad));
    }

    #[test]
    fn fixed_manual_textbook_parity() {
        let engine = SimulationEngine::default();
        let input = SimulationInput {
            net_head_m: 85.0,
            requested_flow_rate_m3s: 60.0,
            guide_vane_opening_pct: 85.0,
            turbine_efficiency_ref: 0.91,
            generator_efficiency_ref: 0.97,
            requested_load_w: 45_000_000.0,
            operating_condition: OperatingCondition::Normal,
            efficiency_mode: EfficiencyMode::FixedManual,
        };
        let out = engine.evaluate_snapshot(&input).expect("Scenario F valid");

        assert_relative_eq!(out.hydraulic_power_w, 50_013_915.0, epsilon = 1.0);
        assert_relative_eq!(out.turbine_mechanical_power_w, 45_512_662.65, epsilon = 1.0);
        assert_relative_eq!(out.electrical_generated_power_w, 44_147_282.77, epsilon = 1.0);
    }

    #[test]
    fn zero_flow_zero_head_and_shutdown_guards() {
        let engine = SimulationEngine::default();

        let zero_flow = SimulationInput {
            requested_flow_rate_m3s: 0.0,
            ..Default::default()
        };
        let out_zf = engine.evaluate_snapshot(&zero_flow).unwrap();
        assert_eq!(out_zf.actual_flow_rate_m3s, 0.0);
        assert_eq!(out_zf.hydraulic_power_w, 0.0);
        assert_eq!(out_zf.turbine_mechanical_power_w, 0.0);
        assert_eq!(out_zf.electrical_generated_power_w, 0.0);
        assert_eq!(out_zf.turbine_torque_nm, 0.0);
        assert!(out_zf
            .warnings
            .iter()
            .any(|w| w.code == WarningCode::ZeroFlowMotoringRisk));

        let zero_head = SimulationInput {
            net_head_m: 0.0,
            ..Default::default()
        };
        let out_zh = engine.evaluate_snapshot(&zero_head).unwrap();
        assert_eq!(out_zh.available_flow_limit_m3s, 0.0);
        assert_eq!(out_zh.actual_flow_rate_m3s, 0.0);
        assert_eq!(out_zh.hydraulic_power_w, 0.0);

        let shutdown = SimulationInput {
            operating_condition: OperatingCondition::Shutdown,
            ..Default::default()
        };
        let out_sd = engine.evaluate_snapshot(&shutdown).unwrap();
        assert_eq!(out_sd.angular_speed_rad_s, 0.0);
        assert_eq!(out_sd.turbine_torque_nm, 0.0);
        assert_eq!(out_sd.electrical_generated_power_w, 0.0);
        assert!(!out_sd.turbine_torque_nm.is_nan());
    }

    #[test]
    fn synchronous_speed_invariant_to_load_and_energy_accumulates() {
        let mut engine = SimulationEngine::default();
        for load_mw in [10.0, 25.0, 48.0] {
            let input = SimulationInput {
                requested_load_w: load_mw * 1e6,
                ..Default::default()
            };
            let out = engine.evaluate_snapshot(&input).unwrap();
            assert_eq!(out.rotational_speed_rpm, 250.0);
        }

        let input_40 = SimulationInput {
            requested_load_w: 40_000_000.0,
            turbine_efficiency_ref: 0.90,
            generator_efficiency_ref: 0.90,
            ..Default::default()
        };
        for _ in 0..3600 {
            engine.step(&input_40, 1.0).unwrap();
        }
        assert!(engine.cumulative_generated_energy_j > 0.0);
        assert_relative_eq!(engine.elapsed_time_s, 3600.0, epsilon = 1e-6);
        engine.reset();
        assert_eq!(engine.elapsed_time_s, 0.0);
        assert_eq!(engine.cumulative_generated_energy_j, 0.0);
    }

    #[test]
    fn invalid_inputs_rejected_and_conservation_fuzz_holds() {
        let engine = SimulationEngine::default();
        assert!(engine
            .evaluate_snapshot(&SimulationInput {
                net_head_m: f64::NAN,
                ..Default::default()
            })
            .is_err());
        assert!(engine
            .evaluate_snapshot(&SimulationInput {
                net_head_m: -5.0,
                ..Default::default()
            })
            .is_err());
        assert!(engine
            .evaluate_snapshot(&SimulationInput {
                guide_vane_opening_pct: 110.0,
                ..Default::default()
            })
            .is_err());
        assert!(engine
            .evaluate_snapshot(&SimulationInput {
                turbine_efficiency_ref: 1.2,
                ..Default::default()
            })
            .is_err());

        // 500-case deterministic grid fuzz check
        for i in 0..500 {
            let h = (i % 13) as f64 * 10.0;
            let q = ((i * 7) % 81) as f64;
            let gvo = ((i * 11) % 101) as f64;
            let eta_t_ref = 0.40 + ((i % 12) as f64) * 0.05;
            let eta_g_ref = 0.60 + ((i % 8) as f64) * 0.05;
            let load = ((i * 3) % 71) as f64 * 1e6;
            let cond = match i % 5 {
                0 => OperatingCondition::Normal,
                1 => OperatingCondition::PartialLoad,
                2 => OperatingCondition::HighLoad,
                3 => OperatingCondition::Startup,
                _ => OperatingCondition::Shutdown,
            };
            let input = SimulationInput {
                net_head_m: h,
                requested_flow_rate_m3s: q,
                guide_vane_opening_pct: gvo,
                turbine_efficiency_ref: eta_t_ref.min(0.95),
                generator_efficiency_ref: eta_g_ref.min(0.99),
                requested_load_w: load,
                operating_condition: cond,
                efficiency_mode: EfficiencyMode::OperatingCurve,
            };
            let out = engine.evaluate_snapshot(&input).unwrap();
            assert!(out.turbine_efficiency >= 0.0 && out.turbine_efficiency <= 0.96);
            assert!(out.generator_efficiency >= 0.0 && out.generator_efficiency <= 0.99);
            assert!(out.delivered_electrical_power_w <= out.electrical_generated_power_w + 1e-6);
            assert!(out.electrical_generated_power_w <= out.turbine_mechanical_power_w + 1e-6);
            assert!(out.turbine_mechanical_power_w <= out.hydraulic_power_w + 1e-6);
            assert!(out.turbine_torque_nm.is_finite());
        }
    }
}
