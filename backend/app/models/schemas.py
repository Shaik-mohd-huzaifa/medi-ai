from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class GenerateRequest(BaseModel):
    """Request model for text generation."""

    prompt: str = Field(..., description="The user prompt", min_length=1)
    max_tokens: Optional[int] = Field(None, description="Maximum tokens to generate", ge=1, le=8192)
    temperature: Optional[float] = Field(None, description="Sampling temperature", ge=0.0, le=1.0)
    system_prompt: Optional[str] = Field(None, description="Optional system prompt")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "prompt": "Explain quantum computing in simple terms",
                    "max_tokens": 500,
                    "temperature": 0.7
                }
            ]
        }
    }


class GenerateResponse(BaseModel):
    """Response model for text generation."""

    success: bool = Field(..., description="Whether the request was successful")
    content: Optional[str] = Field(None, description="Generated text content")
    model: str = Field(..., description="Model used for generation")
    usage: Optional[Dict[str, Any]] = Field(None, description="Token usage information")
    stop_reason: Optional[str] = Field(None, description="Reason for stopping generation")
    error: Optional[str] = Field(None, description="Error message if failed")


class ChatMessage(BaseModel):
    """Individual chat message."""

    role: str = Field(..., description="Role of the message sender (user or assistant)")
    content: str = Field(..., description="Content of the message", min_length=1)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "role": "user",
                    "content": "Hello, how are you?"
                }
            ]
        }
    }


class ChatRequest(BaseModel):
    """Request model for chat completion."""

    messages: List[ChatMessage] = Field(..., description="List of chat messages", min_length=1)
    max_tokens: Optional[int] = Field(None, description="Maximum tokens to generate", ge=1, le=8192)
    temperature: Optional[float] = Field(None, description="Sampling temperature", ge=0.0, le=1.0)
    system_prompt: Optional[str] = Field(None, description="Optional system prompt")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "messages": [
                        {"role": "user", "content": "What is FastAPI?"},
                        {"role": "assistant", "content": "FastAPI is a modern web framework for Python."},
                        {"role": "user", "content": "What are its main features?"}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.7
                }
            ]
        }
    }


class ChatResponse(BaseModel):
    """Response model for chat completion."""

    success: bool = Field(..., description="Whether the request was successful")
    content: Optional[str] = Field(None, description="Generated response content")
    model: str = Field(..., description="Model used for generation")
    usage: Optional[Dict[str, Any]] = Field(None, description="Token usage information")
    stop_reason: Optional[str] = Field(None, description="Reason for stopping generation")
    error: Optional[str] = Field(None, description="Error message if failed")


class ErrorResponse(BaseModel):
    """Error response model."""

    detail: str = Field(..., description="Error details")
    error_type: Optional[str] = Field(None, description="Type of error")
