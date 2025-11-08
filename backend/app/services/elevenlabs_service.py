from elevenlabs.client import ElevenLabs
from typing import Optional
from app.config import settings
import io


class ElevenLabsService:
    """Service for interacting with ElevenLabs API."""

    def __init__(self):
        """Initialize ElevenLabs client."""
        if not settings.elevenlabs_api_key:
            raise ValueError("ELEVENLABS_API_KEY is not set in environment variables")
        self.client = ElevenLabs(api_key=settings.elevenlabs_api_key)

    async def text_to_speech(
        self,
        text: str,
        voice_id: Optional[str] = None,
        model_id: Optional[str] = None,
    ) -> bytes:
        """
        Convert text to speech using ElevenLabs.

        Args:
            text: Text to convert to speech
            voice_id: Voice ID to use (defaults to settings)
            model_id: Model ID to use (defaults to settings)

        Returns:
            Audio bytes in MP3 format

        Raises:
            Exception: If text-to-speech conversion fails
        """
        voice_id = voice_id or settings.elevenlabs_voice_id
        model_id = model_id or settings.elevenlabs_model_id

        try:
            # Generate audio using ElevenLabs
            audio_generator = self.client.generate(
                text=text,
                voice=voice_id,
                model=model_id,
            )

            # Collect audio chunks
            audio_bytes = b""
            for chunk in audio_generator:
                audio_bytes += chunk

            return audio_bytes

        except Exception as e:
            raise Exception(f"ElevenLabs TTS error: {str(e)}")

    async def text_to_speech_stream(
        self,
        text: str,
        voice_id: Optional[str] = None,
        model_id: Optional[str] = None,
    ):
        """
        Convert text to speech with streaming using ElevenLabs.

        Args:
            text: Text to convert to speech
            voice_id: Voice ID to use (defaults to settings)
            model_id: Model ID to use (defaults to settings)

        Yields:
            Audio chunks as they are generated
        """
        voice_id = voice_id or settings.elevenlabs_voice_id
        model_id = model_id or settings.elevenlabs_model_id

        try:
            # Generate audio using ElevenLabs
            audio_generator = self.client.generate(
                text=text,
                voice=voice_id,
                model=model_id,
                stream=True,
            )

            # Yield audio chunks
            for chunk in audio_generator:
                yield chunk

        except Exception as e:
            raise Exception(f"ElevenLabs TTS streaming error: {str(e)}")

    async def get_available_voices(self):
        """
        Get list of available voices from ElevenLabs.

        Returns:
            List of voice objects with id, name, and other metadata
        """
        try:
            voices = self.client.voices.get_all()
            return voices.voices
        except Exception as e:
            raise Exception(f"Error fetching voices: {str(e)}")


# Singleton instance
elevenlabs_service = ElevenLabsService()
