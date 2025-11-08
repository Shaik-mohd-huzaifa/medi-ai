from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""

    # OpenAI Configuration
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o"
    openai_temperature: float = 0.7

    # ElevenLabs Configuration
    elevenlabs_api_key: Optional[str] = None
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Rachel - default voice
    elevenlabs_model_id: str = "eleven_monolingual_v1"

    # Firecrawl Configuration
    firecrawl_api_key: Optional[str] = None

    # API Configuration
    api_title: str = "Medi-AI FastAPI Backend"
    api_version: str = "1.0.0"
    api_description: str = "FastAPI backend with OpenAI integration"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
