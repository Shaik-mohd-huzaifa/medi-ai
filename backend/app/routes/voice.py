from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from app.services.elevenlabs_service import elevenlabs_service
from typing import Optional

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])


class TextToSpeechRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    model_id: Optional[str] = None


@router.post("/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech using ElevenLabs.

    Args:
        request: TextToSpeechRequest with text and optional voice/model settings

    Returns:
        Audio file in MP3 format

    Raises:
        HTTPException: If text-to-speech conversion fails
    """
    try:
        audio_bytes = await elevenlabs_service.text_to_speech(
            text=request.text,
            voice_id=request.voice_id,
            model_id=request.model_id,
        )

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text-to-speech conversion failed: {str(e)}",
        )


@router.post("/text-to-speech/stream")
async def text_to_speech_stream(request: TextToSpeechRequest):
    """
    Convert text to speech with streaming using ElevenLabs.

    Args:
        request: TextToSpeechRequest with text and optional voice/model settings

    Returns:
        Streaming audio response

    Raises:
        HTTPException: If text-to-speech conversion fails
    """
    try:
        async def generate():
            async for chunk in elevenlabs_service.text_to_speech_stream(
                text=request.text,
                voice_id=request.voice_id,
                model_id=request.model_id,
            ):
                yield chunk

        return StreamingResponse(
            generate(),
            media_type="audio/mpeg",
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text-to-speech streaming failed: {str(e)}",
        )


@router.get("/voices")
async def get_voices():
    """
    Get list of available voices from ElevenLabs.

    Returns:
        List of available voice objects

    Raises:
        HTTPException: If fetching voices fails
    """
    try:
        voices = await elevenlabs_service.get_available_voices()
        return {
            "success": True,
            "voices": [
                {
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category if hasattr(voice, 'category') else None,
                }
                for voice in voices
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch voices: {str(e)}",
        )
