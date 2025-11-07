from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""

    # OpenAI Configuration
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o"
    openai_max_tokens: int = 4096
    openai_temperature: float = 0.7

    # API Configuration
    api_title: str = "Medi-AI FastAPI Backend"
    api_version: str = "1.0.0"
    api_description: str = "FastAPI backend with OpenAI integration"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
