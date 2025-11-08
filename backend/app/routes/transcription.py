from fastapi import APIRouter, HTTPException, status, UploadFile, File
from app.services.openai_service import openai_service

router = APIRouter(prefix="/api/v1/transcription", tags=["transcription"])


@router.post("/whisper")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio using OpenAI Whisper.

    Args:
        audio: Audio file to transcribe (webm, mp3, wav, etc.)

    Returns:
        Dict containing transcription text and metadata

    Raises:
        HTTPException: If transcription fails
    """
    try:
        # Read audio file
        audio_data = await audio.read()
        
        # Create a file-like object for the audio
        audio_file = (audio.filename or "audio.webm", audio_data, audio.content_type)
        
        # Transcribe using OpenAI Whisper
        transcription = await openai_service.transcribe_audio(audio_file)
        
        return {
            "success": True,
            "text": transcription,
            "filename": audio.filename
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}",
        )
