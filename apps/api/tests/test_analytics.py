from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

BASE_INPUT = {
    "netHeadM": 85.0,
    "requestedFlowRateM3s": 60.0,
    "guideVaneOpeningPct": 85.0,
    "turbineEfficiencyRef": 0.92,
    "generatorEfficiencyRef": 0.975,
    "requestedLoadW": 40_000_000.0,
    "operatingCondition": "normal",
    "efficiencyMode": "operating_curve",
}


def test_get_plant_config():
    res = client.get("/api/v1/plant/config")
    assert res.status_code == 200
    body = res.json()
    assert body["plantId"] == "denryu-hydro-unit-01"
    assert body["ratedNetHeadM"] == 85.0
    assert body["poleCount"] == 24


def test_sensitivity_head_sweep():
    res = client.post(
        "/api/v1/analytics/sensitivity",
        json={
            "baseInput": BASE_INPUT,
            "sweepParameter": "netHeadM",
            "minValue": 40.0,
            "maxValue": 115.0,
            "steps": 11,
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["plantId"] == "denryu-hydro-unit-01"
    assert body["isSyntheticEducationalModel"] is True
    assert len(body["points"]) == 11
    # Monotonic increase in generated electrical power across [40, 115] at 60 m3/s?
    assert body["points"][-1]["electricalGeneratedPowerW"] > body["points"][0]["electricalGeneratedPowerW"]
    assert body["sensitivityAtBasePoint"]["unit"] == "W/m"
    assert body["sensitivityAtBasePoint"]["localDerivativeElecPowerPerUnit"] > 0.0


def test_sensitivity_validation_errors():
    # minValue >= maxValue -> 400 ErrorEnvelope
    bad_bounds = client.post(
        "/api/v1/analytics/sensitivity",
        json={
            "baseInput": BASE_INPUT,
            "sweepParameter": "netHeadM",
            "minValue": 90.0,
            "maxValue": 80.0,
            "steps": 11,
        },
    )
    assert bad_bounds.status_code == 400
    err = bad_bounds.json()["error"]
    assert err["code"] == "INVALID_PARAMETER_BOUNDS"
    assert err["requestId"].startswith("req_")

    # steps > 201 -> 422 ErrorEnvelope
    bad_steps = client.post(
        "/api/v1/analytics/sensitivity",
        json={
            "baseInput": BASE_INPUT,
            "sweepParameter": "netHeadM",
            "minValue": 40.0,
            "maxValue": 100.0,
            "steps": 300,
        },
    )
    assert bad_steps.status_code == 422
    assert bad_steps.json()["error"]["code"] == "VALIDATION_ERROR"


def test_compare_scenarios_parity():
    res = client.post(
        "/api/v1/analytics/compare-scenarios",
        json={
            "scenarios": [
                {"id": "scenario-a", "name": "Nominal", "input": BASE_INPUT},
                {
                    "id": "scenario-b",
                    "name": "Reduced Flow",
                    "input": {**BASE_INPUT, "requestedFlowRateM3s": 32.0, "operatingCondition": "partial_load"},
                },
            ]
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["baselineScenarioId"] == "scenario-a"
    assert len(body["comparisons"]) == 2
    # IEEE-754 parity check against expected Scenario A values (~44.55 MW)
    sc_a = body["comparisons"][0]
    assert abs(sc_a["hydraulicPowerW"] - 50_013_915.0) / 50_013_915.0 < 1e-5
    assert abs(sc_a["electricalGeneratedPowerW"] - 44_551_816.0) / 44_551_816.0 < 5e-5
    assert body["comparisons"][1]["deltaElectricalPowerVsBaselineW"] < 0


def test_validate_output_endpoint():
    valid_payload = {
        "input": BASE_INPUT,
        "clientOutput": {
            "hydraulicPowerW": 50_013_915.0,
            "turbineMechanicalPowerW": 45_927_671.42,
            "electricalGeneratedPowerW": 44_551_816.33,
            "overallEfficiency": 0.89078842,
        },
    }
    res_ok = client.post("/api/v1/analytics/validate-output", json=valid_payload)
    assert res_ok.status_code == 200
    assert res_ok.json()["passed"] is True
    assert res_ok.json()["maxRelativeError"] < 1e-5

    bad_payload = {
        "input": BASE_INPUT,
        "clientOutput": {
            "hydraulicPowerW": 40_000_000.0,
            "turbineMechanicalPowerW": 35_000_000.0,
            "electricalGeneratedPowerW": 30_000_000.0,
            "overallEfficiency": 0.70,
        },
    }
    res_fail = client.post("/api/v1/analytics/validate-output", json=bad_payload)
    assert res_fail.status_code == 200
    assert res_fail.json()["passed"] is False
