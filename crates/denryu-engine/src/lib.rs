pub mod config;
pub mod energy_conversion;
pub mod generator;
pub mod hydraulics;
pub mod simulation;
pub mod turbine;
pub mod types;

use crate::simulation::SimulationEngine;
use crate::types::{EfficiencyMode, SimulationConfiguration, SimulationInput};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmSimulationEngine {
    inner: SimulationEngine,
}

#[wasm_bindgen]
impl WasmSimulationEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: SimulationEngine::default(),
        }
    }

    #[wasm_bindgen(js_name = getConfig)]
    pub fn get_config(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.inner.config)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    #[wasm_bindgen(js_name = setConfig)]
    pub fn set_config(&mut self, config_val: JsValue) -> Result<(), JsValue> {
        let config: SimulationConfiguration = serde_wasm_bindgen::from_value(config_val)
            .map_err(|e| JsValue::from_str(&format!("Invalid configuration: {}", e)))?;
        self.inner.config = config;
        Ok(())
    }

    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.inner.reset();
    }

    #[wasm_bindgen(js_name = validateInput)]
    pub fn validate_input(&self, input_val: JsValue) -> Result<JsValue, JsValue> {
        let input: SimulationInput = serde_wasm_bindgen::from_value(input_val)
            .map_err(|e| JsValue::from_str(&format!("Malformed input: {}", e)))?;
        match self.inner.validate_input(&input) {
            Ok(()) => serde_wasm_bindgen::to_value(&true)
                .map_err(|e| JsValue::from_str(&e.to_string())),
            Err(err) => Err(serde_wasm_bindgen::to_value(&err)
                .unwrap_or_else(|_| JsValue::from_str(&err.to_string()))),
        }
    }

    #[wasm_bindgen(js_name = evaluateSnapshot)]
    pub fn evaluate_snapshot(&self, input_val: JsValue) -> Result<JsValue, JsValue> {
        let input: SimulationInput = serde_wasm_bindgen::from_value(input_val)
            .map_err(|e| JsValue::from_str(&format!("Malformed input: {}", e)))?;
        let output = self.inner.evaluate_snapshot(&input).map_err(|err| {
            serde_wasm_bindgen::to_value(&err).unwrap_or_else(|_| JsValue::from_str(&err.to_string()))
        })?;
        serde_wasm_bindgen::to_value(&output).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    #[wasm_bindgen]
    pub fn step(&mut self, input_val: JsValue, dt_seconds: f64) -> Result<JsValue, JsValue> {
        let input: SimulationInput = serde_wasm_bindgen::from_value(input_val)
            .map_err(|e| JsValue::from_str(&format!("Malformed input: {}", e)))?;
        let output = self.inner.step(&input, dt_seconds).map_err(|err| {
            serde_wasm_bindgen::to_value(&err).unwrap_or_else(|_| JsValue::from_str(&err.to_string()))
        })?;
        serde_wasm_bindgen::to_value(&output).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    #[wasm_bindgen(js_name = evaluateEfficiencyCurve)]
    pub fn evaluate_efficiency_curve(
        &self,
        net_head_m: f64,
        turbine_efficiency_ref: f64,
        efficiency_mode_str: &str,
        points: usize,
    ) -> Result<JsValue, JsValue> {
        let mode = match efficiency_mode_str {
            "fixed_manual" => EfficiencyMode::FixedManual,
            _ => EfficiencyMode::OperatingCurve,
        };
        let curve = self
            .inner
            .evaluate_efficiency_curve(net_head_m, turbine_efficiency_ref, mode, points)
            .map_err(|err| {
                serde_wasm_bindgen::to_value(&err)
                    .unwrap_or_else(|_| JsValue::from_str(&err.to_string()))
            })?;
        serde_wasm_bindgen::to_value(&curve).map_err(|e| JsValue::from_str(&e.to_string()))
    }
}

impl Default for WasmSimulationEngine {
    fn default() -> Self {
        Self::new()
    }
}
