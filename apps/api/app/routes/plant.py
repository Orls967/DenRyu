from fastapi import APIRouter

from app.analytics.physics import get_config_schema
from app.schemas.analytics import SimulationConfigurationSchema

router = APIRouter(tags=["plant"])


@router.get("/plant/config", response_model=SimulationConfigurationSchema)
async def get_plant_config() -> SimulationConfigurationSchema:
    return get_config_schema()
