from __future__ import annotations

import math
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

OperatingConditionLiteral = Literal["startup", "normal", "partial_load", "high_load", "shutdown"]
EfficiencyModeLiteral = Literal["operating_curve", "fixed_manual"]
SweepParameterLiteral = Literal[
    "netHeadM",
    "requestedFlowRateM3s",
    "guideVaneOpeningPct",
    "requestedLoadW",
]


class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


def _check_finite(value: float, field_name: str) -> float:
    if not math.isfinite(value):
        raise ValueError(f"{field_name} must be finite")
    return value


class SimulationInputSchema(CamelModel):
    net_head_m: float = Field(alias="netHeadM", ge=0.0, le=130.0)
    requested_flow_rate_m3s: float = Field(alias="requestedFlowRateM3s", ge=0.0, le=80.0)
    guide_vane_opening_pct: float = Field(alias="guideVaneOpeningPct", ge=0.0, le=100.0)
    turbine_efficiency_ref: float = Field(alias="turbineEfficiencyRef", ge=0.40, le=0.95)
    generator_efficiency_ref: float = Field(alias="generatorEfficiencyRef", ge=0.60, le=0.99)
    requested_load_w: float = Field(alias="requestedLoadW", ge=0.0, le=70_000_000.0)
    operating_condition: OperatingConditionLiteral = Field(alias="operatingCondition")
    efficiency_mode: EfficiencyModeLiteral = Field(alias="efficiencyMode")

    @field_validator(
        "net_head_m",
        "requested_flow_rate_m3s",
        "guide_vane_opening_pct",
        "turbine_efficiency_ref",
        "generator_efficiency_ref",
        "requested_load_w",
    )
    @classmethod
    def ensure_finite(cls, v: float, info) -> float:
        return _check_finite(v, info.field_name)


class SimulationConfigurationSchema(CamelModel):
    plant_id: str = Field(alias="plantId")
    water_density_kg_m3: float = Field(alias="waterDensityKgM3")
    gravity_m_s2: float = Field(alias="gravityMS2")
    rated_net_head_m: float = Field(alias="ratedNetHeadM")
    min_operating_head_m: float = Field(alias="minOperatingHeadM")
    max_operating_head_m: float = Field(alias="maxOperatingHeadM")
    max_input_head_m: float = Field(alias="maxInputHeadM")
    rated_gate_capacity_flow_m3s: float = Field(alias="ratedGateCapacityFlowM3s")
    rated_bep_flow_m3s: float = Field(alias="ratedBepFlowM3s")
    min_stable_flow_m3s: float = Field(alias="minStableFlowM3s")
    max_input_flow_m3s: float = Field(alias="maxInputFlowM3s")
    rated_turbine_mech_power_w: float = Field(alias="ratedTurbineMechPowerW")
    max_turbine_mech_power_w: float = Field(alias="maxTurbineMechPowerW")
    max_generator_elec_power_w: float = Field(alias="maxGeneratorElecPowerW")
    grid_frequency_hz: int = Field(alias="gridFrequencyHz")
    pole_count: int = Field(alias="poleCount")
    min_torque_angular_speed_rad_s: float = Field(alias="minTorqueAngularSpeedRadS")
    startup_ramp_duration_s: float = Field(alias="startupRampDurationS")


class SensitivitySweepRequest(CamelModel):
    base_input: SimulationInputSchema = Field(alias="baseInput")
    sweep_parameter: SweepParameterLiteral = Field(alias="sweepParameter")
    min_value: float = Field(alias="minValue")
    max_value: float = Field(alias="maxValue")
    steps: int = Field(ge=5, le=201)

    @field_validator("min_value", "max_value")
    @classmethod
    def ensure_finite_bounds(cls, v: float, info) -> float:
        return _check_finite(v, info.field_name)


class SensitivityPoint(CamelModel):
    parameter_value: float = Field(alias="parameterValue")
    actual_flow_rate_m3s: float = Field(alias="actualFlowRateM3s")
    hydraulic_power_w: float = Field(alias="hydraulicPowerW")
    turbine_mechanical_power_w: float = Field(alias="turbineMechanicalPowerW")
    electrical_generated_power_w: float = Field(alias="electricalGeneratedPowerW")
    delivered_electrical_power_w: float = Field(alias="deliveredElectricalPowerW")
    turbine_efficiency: float = Field(alias="turbineEfficiency")
    generator_efficiency: float = Field(alias="generatorEfficiency")
    overall_efficiency: float = Field(alias="overallEfficiency")
    turbine_torque_nm: float = Field(alias="turbineTorqueNm")
    warning_count: int = Field(alias="warningCount")


class SensitivityAtBasePoint(CamelModel):
    local_derivative_elec_power_per_unit: float = Field(alias="localDerivativeElecPowerPerUnit")
    unit: str


class SensitivitySweepResponse(CamelModel):
    plant_id: str = Field(alias="plantId")
    sweep_parameter: SweepParameterLiteral = Field(alias="sweepParameter")
    is_synthetic_educational_model: Literal[True] = Field(
        default=True, alias="isSyntheticEducationalModel"
    )
    points: list[SensitivityPoint]
    sensitivity_at_base_point: SensitivityAtBasePoint = Field(alias="sensitivityAtBasePoint")


class ScenarioInputItem(CamelModel):
    id: str
    name: str
    input: SimulationInputSchema


class CompareScenariosRequest(CamelModel):
    scenarios: list[ScenarioInputItem] = Field(min_length=2, max_length=6)


class ScenarioComparisonItem(CamelModel):
    id: str
    name: str
    hydraulic_power_w: float = Field(alias="hydraulicPowerW")
    turbine_mechanical_power_w: float = Field(alias="turbineMechanicalPowerW")
    electrical_generated_power_w: float = Field(alias="electricalGeneratedPowerW")
    delivered_electrical_power_w: float = Field(alias="deliveredElectricalPowerW")
    overall_efficiency: float = Field(alias="overallEfficiency")
    turbine_torque_nm: float = Field(alias="turbineTorqueNm")
    delta_electrical_power_vs_baseline_w: float = Field(alias="deltaElectricalPowerVsBaselineW")
    delta_overall_efficiency_vs_baseline: float = Field(alias="deltaOverallEfficiencyVsBaseline")
    warning_codes: list[str] = Field(alias="warningCodes")


class CompareScenariosResponse(CamelModel):
    plant_id: str = Field(alias="plantId")
    baseline_scenario_id: str = Field(alias="baselineScenarioId")
    comparisons: list[ScenarioComparisonItem]
    is_synthetic_educational_model: Literal[True] = Field(
        default=True, alias="isSyntheticEducationalModel"
    )


class ValidateOutputRequest(CamelModel):
    input: SimulationInputSchema
    client_output: dict = Field(alias="clientOutput")

    @model_validator(mode="after")
    def verify_client_output_keys(self) -> "ValidateOutputRequest":
        required = {
            "hydraulicPowerW",
            "turbineMechanicalPowerW",
            "electricalGeneratedPowerW",
            "overallEfficiency",
        }
        missing = required - set(self.client_output.keys())
        if missing:
            raise ValueError(f"clientOutput missing required keys: {', '.join(sorted(missing))}")
        return self


class ParityMetricDiff(CamelModel):
    metric: str
    client_value: float = Field(alias="clientValue")
    reference_value: float = Field(alias="referenceValue")
    relative_error: float = Field(alias="relativeError")
    passed: bool


class ValidateOutputResponse(CamelModel):
    passed: bool
    tolerance: float
    max_relative_error: float = Field(alias="maxRelativeError")
    metrics: list[ParityMetricDiff]
    is_synthetic_educational_model: Literal[True] = Field(
        default=True, alias="isSyntheticEducationalModel"
    )
