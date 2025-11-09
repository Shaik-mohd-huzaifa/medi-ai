from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from app.models import (
    GenerateRequest,
    GenerateResponse,
    ChatRequest,
    ChatResponse,
)
from app.services.openai_service import openai_service

# Keep the same prefix for backward compatibility with frontend
router = APIRouter(prefix="/api/v1/bedrock", tags=["openai"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "openai"}


@router.post("/generate", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    """
    Generate text using OpenAI model.

    This endpoint accepts a prompt and generates a response using the configured
    OpenAI model.

    Args:
        request: GenerateRequest with prompt and optional parameters

    Returns:
        GenerateResponse with generated text and metadata

    Raises:
        HTTPException: If generation fails
    """
    try:
        result = await openai_service.generate_text(
            prompt=request.prompt,
            temperature=request.temperature,
            system_prompt=request.system_prompt,
        )

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Text generation failed: {result.get('error', 'Unknown error')}",
            )

        return GenerateResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )


@router.post("/generate/stream")
async def generate_text_stream(request: GenerateRequest):
    """
    Generate text using OpenAI model with streaming.

    This endpoint streams the generated response token-by-token for a better
    user experience with long responses.

    Args:
        request: GenerateRequest with prompt and optional parameters

    Returns:
        StreamingResponse with generated text chunks

    Raises:
        HTTPException: If generation fails
    """
    try:
        async def generate():
            async for chunk in openai_service.stream_text(
                prompt=request.prompt,
                temperature=request.temperature,
                system_prompt=request.system_prompt,
            ):
                yield chunk

        return StreamingResponse(
            generate(),
            media_type="text/plain",
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Streaming generation failed: {str(e)}",
        )


@router.post("/chat", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    """
    Multi-turn chat completion using OpenAI model.

    This endpoint supports conversation history with multiple messages.

    Args:
        request: ChatRequest with message history and optional parameters

    Returns:
        ChatResponse with generated response and metadata

    Raises:
        HTTPException: If chat completion fails
    """
    print("=" * 50)
    print("💬 CHAT REQUEST RECEIVED")
    print(f"Messages count: {len(request.messages)}")
    print(f"Temperature: {request.temperature}")
    print("=" * 50)
    
    try:
        # Convert Pydantic models to dicts
        messages = [msg.model_dump() for msg in request.messages]
        
        print("🔄 Calling OpenAI service...")

        result = await openai_service.chat_completion(
            messages=messages,
            temperature=request.temperature,
            system_prompt=request.system_prompt,
        )
        
        print("✅ OpenAI service returned result")
        print(f"Success: {result.get('success')}")

        if not result["success"]:
            print(f"❌ Chat completion failed: {result.get('error')}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Chat completion failed: {result.get('error', 'Unknown error')}",
            )

        return ChatResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ EXCEPTION in chat completion: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )
