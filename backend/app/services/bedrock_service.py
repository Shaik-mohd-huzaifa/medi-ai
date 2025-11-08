import json
import boto3
from typing import Dict, Any, Optional, List
from app.config import settings


class BedrockService:
    """Service for interacting with AWS Bedrock."""

    def __init__(self):
        """Initialize Bedrock client."""
        session_kwargs = {"region_name": settings.aws_region}

        if settings.aws_access_key_id and settings.aws_secret_access_key:
            session_kwargs["aws_access_key_id"] = settings.aws_access_key_id
            session_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key

        self.bedrock_runtime = boto3.client(
            service_name="bedrock-runtime",
            **session_kwargs
        )

    async def generate_text(
        self,
        prompt: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate text using AWS Bedrock Claude model.

        Args:
            prompt: The user prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            system_prompt: Optional system prompt

        Returns:
            Dict containing the response and metadata
        """
        max_tokens = max_tokens or settings.bedrock_max_tokens
        temperature = temperature or settings.bedrock_temperature

        # Prepare the request body for Claude 3.5 Sonnet
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }

        if system_prompt:
            body["system"] = system_prompt

        try:
            response = self.bedrock_runtime.invoke_model(
                modelId=settings.bedrock_model_id,
                body=json.dumps(body)
            )

            response_body = json.loads(response["body"].read())

            return {
                "success": True,
                "content": response_body["content"][0]["text"],
                "model": settings.bedrock_model_id,
                "usage": response_body.get("usage", {}),
                "stop_reason": response_body.get("stop_reason"),
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": settings.bedrock_model_id,
            }

    async def stream_text(
        self,
        prompt: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        system_prompt: Optional[str] = None,
    ):
        """
        Stream text generation using AWS Bedrock Claude model.

        Args:
            prompt: The user prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            system_prompt: Optional system prompt

        Yields:
            Text chunks as they are generated
        """
        max_tokens = max_tokens or settings.bedrock_max_tokens
        temperature = temperature or settings.bedrock_temperature

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }

        if system_prompt:
            body["system"] = system_prompt

        try:
            response = self.bedrock_runtime.invoke_model_with_response_stream(
                modelId=settings.bedrock_model_id,
                body=json.dumps(body)
            )

            stream = response.get("body")
            if stream:
                for event in stream:
                    chunk = event.get("chunk")
                    if chunk:
                        chunk_data = json.loads(chunk.get("bytes").decode())
                        if chunk_data["type"] == "content_block_delta":
                            if "delta" in chunk_data and "text" in chunk_data["delta"]:
                                yield chunk_data["delta"]["text"]

        except Exception as e:
            yield f"Error: {str(e)}"

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Multi-turn chat completion using AWS Bedrock Claude model.

        Args:
            messages: List of message dictionaries with 'role' and 'content'
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            system_prompt: Optional system prompt

        Returns:
            Dict containing the response and metadata
        """
        max_tokens = max_tokens or settings.bedrock_max_tokens
        temperature = temperature or settings.bedrock_temperature

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages
        }

        if system_prompt:
            body["system"] = system_prompt

        try:
            response = self.bedrock_runtime.invoke_model(
                modelId=settings.bedrock_model_id,
                body=json.dumps(body)
            )

            response_body = json.loads(response["body"].read())

            return {
                "success": True,
                "content": response_body["content"][0]["text"],
                "model": settings.bedrock_model_id,
                "usage": response_body.get("usage", {}),
                "stop_reason": response_body.get("stop_reason"),
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": settings.bedrock_model_id,
            }


# Singleton instance
bedrock_service = BedrockService()
