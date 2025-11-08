from openai import OpenAI, AsyncOpenAI
from typing import Dict, Any, Optional, List
from app.config import settings


class OpenAIService:
    """Service for interacting with OpenAI API."""

    def __init__(self):
        """Initialize OpenAI client."""
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not set in environment variables")
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.sync_client = OpenAI(api_key=settings.openai_api_key)

    async def generate_text(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate text using OpenAI model.

        Args:
            prompt: The user prompt
            temperature: Sampling temperature
            system_prompt: Optional system prompt

        Returns:
            Dict containing the response and metadata
        """
        temperature = temperature or settings.openai_temperature

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                temperature=temperature,
            )

            return {
                "success": True,
                "content": response.choices[0].message.content,
                "model": settings.openai_model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
                "finish_reason": response.choices[0].finish_reason,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": settings.openai_model,
            }

    async def stream_text(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        system_prompt: Optional[str] = None,
    ):
        """
        Stream text generation using OpenAI model.

        Args:
            prompt: The user prompt
            temperature: Sampling temperature
            system_prompt: Optional system prompt

        Yields:
            Text chunks as they are generated
        """
        temperature = temperature or settings.openai_temperature

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            stream = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                temperature=temperature,
                stream=True,
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            yield f"Error: {str(e)}"

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Multi-turn chat completion using OpenAI model.

        Args:
            messages: List of message dictionaries with 'role' and 'content'
            temperature: Sampling temperature
            system_prompt: Optional system prompt

        Returns:
            Dict containing the response and metadata
        """
        temperature = temperature or settings.openai_temperature

        # Add system prompt if provided
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=full_messages,
                temperature=temperature,
            )

            return {
                "success": True,
                "content": response.choices[0].message.content,
                "model": settings.openai_model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
                "finish_reason": response.choices[0].finish_reason,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": settings.openai_model,
            }


# Singleton instance
openai_service = OpenAIService()
