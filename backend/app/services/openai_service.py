from openai import OpenAI, AsyncOpenAI
from typing import Dict, Any, Optional, List
from app.config import settings
import json


class OpenAIService:
    """Service for interacting with OpenAI API."""

    def __init__(self):
        """Initialize OpenAI client."""
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not set in environment variables")
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.sync_client = OpenAI(api_key=settings.openai_api_key)
        
        # Define available tools/functions for the AI
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "search_caregivers",
                    "description": "Search for healthcare caregivers (doctors, clinics, hospitals) based on patient symptoms, location, urgency, and consultation preferences. Use this when a patient asks for caregiver recommendations or wants to find a doctor.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "symptoms": {
                                "type": "string",
                                "description": "The patient's symptoms or health concerns (e.g., 'chest pain', 'fever', 'cough', 'headache')"
                            },
                            "urgency": {
                                "type": "string",
                                "enum": ["low", "medium", "high", "urgent"],
                                "description": "The urgency level of care needed. Use 'urgent' for emergencies, 'high' for serious symptoms, 'medium' for moderate concerns, 'low' for routine checkups"
                            },
                            "city": {
                                "type": "string",
                                "description": "The city where the patient wants to find caregivers"
                            },
                            "state": {
                                "type": "string",
                                "description": "The state/province where the patient wants to find caregivers"
                            },
                            "country": {
                                "type": "string",
                                "description": "The country where the patient wants to find caregivers (default: India)"
                            },
                            "consultation_mode": {
                                "type": "string",
                                "enum": ["chat", "video", "in-person"],
                                "description": "Preferred mode of consultation"
                            },
                            "specialization": {
                                "type": "string",
                                "description": "Specific medical specialization needed (e.g., 'Cardiology', 'Pediatrics', 'Orthopedics')"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Number of caregivers to return (default: 3, max: 10)",
                                "default": 3
                            }
                        },
                        "required": []
                    }
                }
            }
        ]

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
        use_tools: bool = True,
    ) -> Dict[str, Any]:
        """
        Multi-turn chat completion using OpenAI model with function calling support.

        Args:
            messages: List of message dictionaries with 'role' and 'content'
            temperature: Sampling temperature
            system_prompt: Optional system prompt
            use_tools: Whether to enable function calling tools

        Returns:
            Dict containing the response, metadata, and optional tool calls
        """
        temperature = temperature or settings.openai_temperature

        # Add system prompt if provided
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        try:
            # Make API call with or without tools
            api_params = {
                "model": settings.openai_model,
                "messages": full_messages,
                "temperature": temperature,
            }
            
            if use_tools:
                api_params["tools"] = self.tools
                api_params["tool_choice"] = "auto"
            
            response = await self.client.chat.completions.create(**api_params)
            
            message = response.choices[0].message
            
            # Check if the model wants to call a function
            if message.tool_calls:
                return {
                    "success": True,
                    "content": message.content,
                    "model": settings.openai_model,
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens,
                        "completion_tokens": response.usage.completion_tokens,
                        "total_tokens": response.usage.total_tokens,
                    },
                    "finish_reason": response.choices[0].finish_reason,
                    "tool_calls": [
                        {
                            "id": tool_call.id,
                            "type": tool_call.type,
                            "function": {
                                "name": tool_call.function.name,
                                "arguments": tool_call.function.arguments,
                            }
                        }
                        for tool_call in message.tool_calls
                    ]
                }
            else:
                # Regular response without tool calls
                return {
                    "success": True,
                    "content": message.content,
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

    async def transcribe_audio(
            self,
            audio_file: tuple
        ) -> str:
            """
            Transcribe audio using OpenAI Whisper.

            Args:
                audio_file: Tuple of (filename, audio_data, content_type)

            Returns:
                Transcribed text

            Raises:
                Exception: If transcription fails
            """
            try:
                filename, audio_data, content_type = audio_file
                
                # Create a file-like object
                import io
                audio_buffer = io.BytesIO(audio_data)
                audio_buffer.name = filename

                # Use sync client for file upload
                response = self.sync_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=(filename, audio_data, content_type)
                )
                
                return response.text

            except Exception as e:
                raise Exception(f"Whisper transcription error: {str(e)}")


# Singleton instance
openai_service = OpenAIService()
