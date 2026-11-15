from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    denryu_env: str = "development"
    port: int = 8000
    max_sweep_points: int = 201
    allowed_origins: list[str] = [
        "https://orls967.github.io",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
    ]


settings = Settings()
