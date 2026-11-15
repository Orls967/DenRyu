from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

from app.schemas.analytics import (
    CompareScenariosResponse,
    ParityMetricDiff,
    ScenarioComparisonItem,
    ScenarioInputItem,
    SensitivityAtBasePoint,
    SensitivityPoint,
    SensitivitySweepRequest,
    SensitivitySweepResponse,
    SimulationConfigurationSchema,
    SimulationInputSchema,
    SweepParameterLiteral,
    ValidateOutputResponse,
)


@dataclass(frozen=True)
class PlantConfig:
    plant_id: str = "denryu-hydro-unit-01"
    water_density_kg_m3: float = 1000.0
    gravity_m_s2: float = 9.80665
    rated_net_head_m: float = 85.0
    min_operating_head_m: float = 25.0
    max_operating_head_m: float = 115.0
    max_input_head_m: float = 130.0
    rated_gate_capacity_flow_m3s: float = 72.0
    rated_bep_flow_m3s: float = 58.0
    min_stable_flow_m3s: float = 12.0
    max_input_flow_m3s: float = 80.0
    rated_turbine_mech_power_w: float = 50_000_000.0
    max_turbine_mech_power_w: float = 58_000_000.0
    max_generator_elec_power_w: float = 55_000_000.0
    grid_frequency_hz: int = 50
    pole_count: int = 24
    min_torque_angular_speed_rad_s: float = 0.5
    startup_ramp_duration_s: float = 30.0


DEFAULT_CONFIG = PlantConfig()


def get_config_schema(cfg: PlantConfig = DEFAULT_CONFIG) -> SimulationConfigurationSchema:
    return SimulationConfigurationSchema(
        plantId=cfg.plant_id,
        waterDensityKgM3=cfg.water_density_kg_m3,
        gravityMS2=cfg.gravity_m_s2,
        ratedNetHeadM=cfg.rated_net_head_m,
        minOperatingHeadM=cfg.min_operating_head_m,
        maxOperatingHeadM=cfg.max_operating_head_m,
        maxInputHeadM=cfg.max_input_head_m,
        ratedGateCapacityFlowM3s=cfg.rated_gate_capacity_flow_m3s,
        ratedBepFlowM3s=cfg.rated_bep_flow_m3s,
        minStableFlowM3s=cfg.min_stable_flow_m3s,
        maxInputFlowM3s=cfg.max_input_flow_m3s,
        ratedTurbineMechPowerW=cfg.rated_turbine_mech_power_w,
        maxTurbineMechPowerW=cfg.max_turbine_mech_power_w,
        maxGeneratorElecPowerW=cfg.max_generator_elec_power_w,
        gridFrequencyHz=cfg.grid_frequency_hz,
        poleCount=cfg.pole_count,
        minTorqueAngularSpeedRadS=cfg.min_torque_angular_speed_rad_s,
        startupRampDurationS=cfg.startup_ramp_duration_s,
    )


def evaluate_snapshot_reference(
    inp: SimulationInputSchema,
    cfg: PlantConfig = DEFAULT_CONFIG,
) -> dict:
    sync_rpm = 120.0 * float(cfg.grid_frequency_hz) / float(cfg.pole_count)

    if inp.operating_condition == "shutdown":
        speed_rpm = 0.0
    elif inp.operating_condition == "startup":
        if inp.net_head_m > 0.0 and inp.guide_vane_opening_pct > 0.0 and inp.requested_flow_rate_m3s > 0.0:
            speed_rpm = 0.5 * sync_rpm
        else:
            speed_rpm = 0.0
    else:
        speed_rpm = sync_rpm

    if inp.net_head_m <= 0.0 or inp.guide_vane_opening_pct <= 0.0 or cfg.rated_net_head_m <= 0.0:
        avail_flow = 0.0
    else:
        gate_frac = max(0.0, min(1.0, inp.guide_vane_opening_pct / 100.0))
        head_ratio = max(0.0, inp.net_head_m / cfg.rated_net_head_m)
        avail_flow = cfg.rated_gate_capacity_flow_m3s * gate_frac * math.sqrt(head_ratio)

    if (
        inp.operating_condition == "shutdown"
        or inp.guide_vane_opening_pct <= 0.0
        or inp.net_head_m <= 0.0
    ):
        actual_flow = 0.0
    else:
        actual_flow = min(max(0.0, inp.requested_flow_rate_m3s), max(0.0, avail_flow))

    bep_flow = (
        0.0
        if inp.net_head_m <= 0.0 or cfg.rated_net_head_m <= 0.0
        else cfg.rated_bep_flow_m3s * math.sqrt(inp.net_head_m / cfg.rated_net_head_m)
    )
    flow_ratio = 0.0 if actual_flow <= 0.0 or bep_flow <= 0.0 else actual_flow / bep_flow

    hydraulic_power_w = (
        0.0
        if actual_flow <= 0.0 or inp.net_head_m <= 0.0
        else cfg.water_density_kg_m3 * cfg.gravity_m_s2 * actual_flow * inp.net_head_m
    )

    if actual_flow <= 0.0 or inp.net_head_m <= 0.0:
        eta_t = 0.0
    elif inp.efficiency_mode == "fixed_manual":
        eta_t = max(0.0, min(0.96, inp.turbine_efficiency_ref))
    else:
        q = actual_flow / bep_flow
        h = inp.net_head_m / cfg.rated_net_head_m
        if q <= 1.0:
            term1 = 0.55 * (1.0 - q) ** 2
            deep_part = max(0.0, 0.65 - q)
            term2 = 0.35 * (deep_part ** 2)
            k_q = max(0.15, 1.0 - term1 - term2)
        else:
            k_q = max(0.35, 1.0 - 0.85 * (q - 1.0) ** 2)
        s_q = (q * q) / (q * q + 0.03 ** 2)
        k_h = max(0.75, 1.0 - 0.18 * (h - 1.0) ** 2)
        eta_t = max(0.0, min(0.96, inp.turbine_efficiency_ref * k_q * s_q * k_h))

    raw_pm = max(0.0, hydraulic_power_w * eta_t)
    mech_clamped = raw_pm > cfg.max_turbine_mech_power_w
    pm = cfg.max_turbine_mech_power_w if mech_clamped else raw_pm

    omega = (2.0 * math.pi * speed_rpm) / 60.0
    torque_nm = 0.0 if (omega < cfg.min_torque_angular_speed_rad_s or pm <= 0.0) else pm / omega

    if pm <= 0.0 or inp.operating_condition == "shutdown":
        eta_g = 0.0
    elif inp.efficiency_mode == "fixed_manual":
        eta_g = max(0.0, min(0.99, inp.generator_efficiency_ref))
    else:
        load_ratio = max(0.0, pm / cfg.rated_turbine_mech_power_w)
        lambda_ref = 1.0 - inp.generator_efficiency_ref
        no_load_loss = (0.40 * lambda_ref) / max(0.02, load_ratio)
        copper_loss = 0.60 * lambda_ref * (load_ratio / (0.85 * 0.85))
        eta_g = max(0.0, min(0.99, 1.0 - no_load_loss - copper_loss))

    if inp.operating_condition in ("shutdown", "startup") or pm <= 0.0:
        pe = 0.0
        delivered = 0.0
        elec_clamped = False
    else:
        raw_pe = max(0.0, pm * eta_g)
        elec_clamped = raw_pe > cfg.max_generator_elec_power_w
        pe = min(raw_pe, cfg.max_generator_elec_power_w)
        req = max(0.0, inp.requested_load_w)
        delivered = min(pe, req)

    if hydraulic_power_w <= 0.0 or inp.operating_condition in ("shutdown", "startup"):
        overall_eff = 0.0
    else:
        overall_eff = max(0.0, min(1.0, pe / hydraulic_power_w))

    warning_codes: list[str] = []
    is_sync = inp.operating_condition in ("normal", "partial_load", "high_load")

    if inp.operating_condition != "shutdown" and inp.requested_flow_rate_m3s > avail_flow + 1e-3:
        warning_codes.append("FLOW_CONSTRAINED_BY_GATE_OR_HEAD")
    if 0.0 < inp.net_head_m < cfg.min_operating_head_m:
        warning_codes.append("LOW_HEAD_OPERATING_LIMIT")
    if inp.net_head_m > cfg.max_operating_head_m:
        warning_codes.append("HIGH_HEAD_STRUCTURAL_LIMIT")
    if actual_flow > 0.0 and (actual_flow < cfg.min_stable_flow_m3s or flow_ratio < 0.45):
        warning_codes.append("DEEP_PART_LOAD_CAVITATION_RISK")
    if is_sync and inp.requested_load_w > pe + 1000.0:
        warning_codes.append("INSUFFICIENT_GENERATION_FOR_LOAD")
    if mech_clamped or elec_clamped:
        warning_codes.append("POWER_CEILING_CLAMPED")
    if is_sync and actual_flow <= 1e-3:
        warning_codes.append("ZERO_FLOW_MOTORING_RISK")
    if inp.operating_condition == "startup":
        warning_codes.append("STARTUP_UNSYNCHRONIZED")

    return {
        "actualFlowRateM3s": actual_flow,
        "hydraulicPowerW": hydraulic_power_w,
        "turbineMechanicalPowerW": pm,
        "electricalGeneratedPowerW": pe,
        "deliveredElectricalPowerW": delivered,
        "turbineEfficiency": eta_t,
        "generatorEfficiency": eta_g,
        "overallEfficiency": overall_eff,
        "turbineTorqueNm": torque_nm,
        "warningCodes": warning_codes,
    }


SWEEP_BOUNDS: dict[SweepParameterLiteral, tuple[float, float, str]] = {
    "netHeadM": (0.0, DEFAULT_CONFIG.max_input_head_m, "W/m"),
    "requestedFlowRateM3s": (0.0, DEFAULT_CONFIG.max_input_flow_m3s, "W/(m3/s)"),
    "guideVaneOpeningPct": (0.0, 100.0, "W/%"),
    "requestedLoadW": (0.0, 70_000_000.0, "W/W"),
}


def run_sensitivity_sweep(req: SensitivitySweepRequest) -> SensitivitySweepResponse:
    low, high, unit = SWEEP_BOUNDS[req.sweep_parameter]
    if req.min_value >= req.max_value:
        raise ValueError("minValue must be strictly less than maxValue.")
    if req.min_value < low or req.max_value > high:
        raise ValueError(
            f"Sweep bounds [{req.min_value}, {req.max_value}] exceed allowed range [{low}, {high}] for {req.sweep_parameter}."
        )

    values = np.linspace(req.min_value, req.max_value, req.steps)
    points: list[SensitivityPoint] = []
    base_data = req.base_input.model_dump(by_alias=True)

    for v in values:
        payload = {**base_data, req.sweep_parameter: float(v)}
        snapshot = evaluate_snapshot_reference(SimulationInputSchema.model_validate(payload))
        points.append(
            SensitivityPoint(
                parameterValue=float(v),
                actualFlowRateM3s=snapshot["actualFlowRateM3s"],
                hydraulicPowerW=snapshot["hydraulicPowerW"],
                turbineMechanicalPowerW=snapshot["turbineMechanicalPowerW"],
                electricalGeneratedPowerW=snapshot["electricalGeneratedPowerW"],
                deliveredElectricalPowerW=snapshot["deliveredElectricalPowerW"],
                turbineEfficiency=snapshot["turbineEfficiency"],
                generatorEfficiency=snapshot["generatorEfficiency"],
                overallEfficiency=snapshot["overallEfficiency"],
                turbineTorqueNm=snapshot["turbineTorqueNm"],
                warningCount=len(snapshot["warningCodes"]),
            )
        )

    # Central finite difference around baseInput
    base_val = float(base_data[req.sweep_parameter])
    eps = max(1e-4, 1e-3 * max(1.0, abs(high - low)))
    v_minus = max(low, base_val - eps)
    v_plus = min(high, base_val + eps)
    if v_plus <= v_minus:
        deriv = 0.0
    else:
        s_minus = evaluate_snapshot_reference(
            SimulationInputSchema.model_validate({**base_data, req.sweep_parameter: v_minus})
        )
        s_plus = evaluate_snapshot_reference(
            SimulationInputSchema.model_validate({**base_data, req.sweep_parameter: v_plus})
        )
        deriv = (
            s_plus["electricalGeneratedPowerW"] - s_minus["electricalGeneratedPowerW"]
        ) / (v_plus - v_minus)

    return SensitivitySweepResponse(
        plantId=DEFAULT_CONFIG.plant_id,
        sweepParameter=req.sweep_parameter,
        points=points,
        sensitivityAtBasePoint=SensitivityAtBasePoint(
            localDerivativeElecPowerPerUnit=float(deriv),
            unit=unit,
        ),
    )


def compare_scenarios_reference(scenarios: list[ScenarioInputItem]) -> CompareScenariosResponse:
    baseline = scenarios[0]
    base_snap = evaluate_snapshot_reference(baseline.input)
    comparisons: list[ScenarioComparisonItem] = []

    for sc in scenarios:
        snap = evaluate_snapshot_reference(sc.input)
        comparisons.append(
            ScenarioComparisonItem(
                id=sc.id,
                name=sc.name,
                hydraulicPowerW=snap["hydraulicPowerW"],
                turbineMechanicalPowerW=snap["turbineMechanicalPowerW"],
                electricalGeneratedPowerW=snap["electricalGeneratedPowerW"],
                deliveredElectricalPowerW=snap["deliveredElectricalPowerW"],
                overallEfficiency=snap["overallEfficiency"],
                turbineTorqueNm=snap["turbineTorqueNm"],
                deltaElectricalPowerVsBaselineW=snap["electricalGeneratedPowerW"]
                - base_snap["electricalGeneratedPowerW"],
                deltaOverallEfficiencyVsBaseline=snap["overallEfficiency"]
                - base_snap["overallEfficiency"],
                warningCodes=snap["warningCodes"],
            )
        )

    return CompareScenariosResponse(
        plantId=DEFAULT_CONFIG.plant_id,
        baselineScenarioId=baseline.id,
        comparisons=comparisons,
    )


def validate_output_parity(
    inp: SimulationInputSchema,
    client_output: dict,
    tolerance: float = 1e-5,
) -> ValidateOutputResponse:
    ref = evaluate_snapshot_reference(inp)
    metrics_to_check = [
        "hydraulicPowerW",
        "turbineMechanicalPowerW",
        "electricalGeneratedPowerW",
        "deliveredElectricalPowerW",
        "overallEfficiency",
        "turbineEfficiency",
        "generatorEfficiency",
        "turbineTorqueNm",
    ]
    diffs: list[ParityMetricDiff] = []
    max_rel_err = 0.0

    for m in metrics_to_check:
        if m not in client_output:
            continue
        c_val = float(client_output[m])
        r_val = float(ref[m])
        denom = max(1e-9, abs(r_val))
        rel_err = abs(c_val - r_val) / denom
        max_rel_err = max(max_rel_err, rel_err)
        diffs.append(
            ParityMetricDiff(
                metric=m,
                clientValue=c_val,
                referenceValue=r_val,
                relativeError=rel_err,
                passed=rel_err < tolerance,
            )
        )

    all_passed = len(diffs) > 0 and all(d.passed for d in diffs)
    return ValidateOutputResponse(
        passed=all_passed,
        tolerance=tolerance,
        maxRelativeError=max_rel_err,
        metrics=diffs,
    )
