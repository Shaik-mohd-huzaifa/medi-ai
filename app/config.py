from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""

    # AWS Configuration
    aws_region: str = "us-east-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None

    # Bedrock Configuration
    bedrock_model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    bedrock_max_tokens: int = 4096
    bedrock_temperature: float = 0.7

    # API Configuration
    api_title: str = "Medi-AI FastAPI Backend"
    api_version: str = "1.0.0"
    api_description: str = "FastAPI backend with AWS Bedrock integration"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
