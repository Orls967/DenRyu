use crate::types::SimulationConfiguration;

impl Default for SimulationConfiguration {
    fn default() -> Self {
        Self {
            plant_id: "denryu-hydro-unit-01".to_string(),
            water_density_kg_m3: 1000.0,
            gravity_m_s2: 9.80665,
            rated_net_head_m: 85.0,
            min_operating_head_m: 25.0,
            max_operating_head_m: 115.0,
            max_input_head_m: 130.0,
            rated_gate_capacity_flow_m3s: 72.0,
            rated_bep_flow_m3s: 58.0,
            min_stable_flow_m3s: 12.0,
            max_input_flow_m3s: 80.0,
            rated_turbine_mech_power_w: 50_000_000.0,
            max_turbine_mech_power_w: 58_000_000.0,
            max_generator_elec_power_w: 55_000_000.0,
            grid_frequency_hz: 50,
            pole_count: 24,
            min_torque_angular_speed_rad_s: 0.5,
            startup_ramp_duration_s: 30.0,
        }
    }
}
