from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.models import (
    GenerateRequest,
    GenerateResponse,
    ChatRequest,
    ChatResponse,
)
from app.services.openai_service import openai_service
from app.database import get_db
import json

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


async def execute_tool_call(function_name: str, arguments: dict, db: Session) -> dict:
    """Execute a tool/function call and return results"""
    if function_name == "search_caregivers":
        # Import here to avoid circular imports
        from app.routes.caregivers import match_caregivers_logic, CaregiverMatchRequest
        
        # Create request from arguments
        match_request = CaregiverMatchRequest(**arguments)
        
        # Execute the search
        caregivers = await match_caregivers_logic(match_request, db)
        
        return {
            "caregivers": caregivers,
            "count": len(caregivers)
        }
    else:
        return {"error": f"Unknown function: {function_name}"}


@router.post("/chat")
async def chat_completion(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Multi-turn chat completion using OpenAI model with function calling support.

    This endpoint supports:
    - Conversation history with multiple messages
    - Agentic function calling (e.g., caregiver search)
    - Tool execution and result synthesis

    Args:
        request: ChatRequest with message history and optional parameters
        db: Database session

    Returns:
        ChatResponse with generated response, metadata, and optional tool results

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
            use_tools=True,
        )
        
        print("✅ OpenAI service returned result")
        print(f"Success: {result.get('success')}")

        if not result["success"]:
            print(f"❌ Chat completion failed: {result.get('error')}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Chat completion failed: {result.get('error', 'Unknown error')}",
            )

        # Check if there are tool calls to execute
        if "tool_calls" in result and result["tool_calls"]:
            print("🛠️ Tool calls detected!")
            tool_results = []
            
            for tool_call in result["tool_calls"]:
                function_name = tool_call["function"]["name"]
                arguments = json.loads(tool_call["function"]["arguments"])
                
                print(f"🔧 Executing tool: {function_name}")
                print(f"   Arguments: {arguments}")
                
                # Execute the tool
                tool_result = await execute_tool_call(function_name, arguments, db)
                
                tool_results.append({
                    "tool_call_id": tool_call["id"],
                    "function_name": function_name,
                    "arguments": arguments,
                    "result": tool_result
                })
                
                print(f"✅ Tool execution complete: {len(tool_result.get('caregivers', []))} caregivers found")
            
            # Add tool results to the response
            result["tool_results"] = tool_results
            
            # Create a summary message for the LLM
            tool_summary = []
            for tr in tool_results:
                if tr["function_name"] == "search_caregivers":
                    caregivers = tr["result"].get("caregivers", [])
                    if caregivers:
                        tool_summary.append(f"Found {len(caregivers)} matching caregivers:")
                        for i, cg in enumerate(caregivers[:3], 1):
                            tool_summary.append(
                                f"{i}. {cg['business_name']} ({cg['caregiver_type']}) - "
                                f"{cg['specialization']} - Rating: {cg['rating']}/5 - "
                                f"Location: {cg['business_city']}, {cg['business_state']} - "
                                f"Match Score: {cg['match_score']:.0f}%"
                            )
                    else:
                        tool_summary.append("No caregivers found matching the criteria.")
            
            # Send tool results back to LLM for synthesis
            messages.append({
                "role": "assistant",
                "content": result.get("content") or "Let me search for caregivers for you.",
                "tool_calls": result["tool_calls"]
            })
            
            # Add tool response messages
            for tr in tool_results:
                messages.append({
                    "role": "tool",
                    "tool_call_id": tr["tool_call_id"],
                    "name": tr["function_name"],
                    "content": json.dumps(tr["result"])
                })
            
            # Get final response from LLM with tool results
            print("🔄 Getting LLM synthesis of tool results...")
            final_result = await openai_service.chat_completion(
                messages=messages,
                temperature=request.temperature,
                system_prompt=request.system_prompt,
                use_tools=False,  # Don't call tools again
            )
            
            if final_result["success"]:
                # Merge the tool results with the final response
                final_result["tool_results"] = tool_results
                result = final_result
                print("✅ LLM synthesis complete")

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
