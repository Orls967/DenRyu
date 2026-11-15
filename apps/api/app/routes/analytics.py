from fastapi import APIRouter, HTTPException

from app.analytics.physics import (
    compare_scenarios_reference,
    run_sensitivity_sweep,
    validate_output_parity,
)
from app.core.config import settings
from app.schemas.analytics import (
    CompareScenariosRequest,
    CompareScenariosResponse,
    SensitivitySweepRequest,
    SensitivitySweepResponse,
    ValidateOutputRequest,
    ValidateOutputResponse,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/sensitivity", response_model=SensitivitySweepResponse)
async def post_sensitivity(req: SensitivitySweepRequest) -> SensitivitySweepResponse:
    if req.steps > settings.max_sweep_points:
        raise HTTPException(
            status_code=422,
            detail=f"steps must not exceed {settings.max_sweep_points}",
        )
    try:
        return run_sensitivity_sweep(req)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/compare-scenarios", response_model=CompareScenariosResponse)
async def post_compare_scenarios(req: CompareScenariosRequest) -> CompareScenariosResponse:
    return compare_scenarios_reference(req.scenarios)


@router.post("/validate-output", response_model=ValidateOutputResponse)
async def post_validate_output(req: ValidateOutputRequest) -> ValidateOutputResponse:
    return validate_output_parity(req.input, req.client_output)
