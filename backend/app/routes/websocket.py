from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.openai_service import openai_service
from app.services.elevenlabs_service import elevenlabs_service
import json
import base64
import asyncio

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time voice conversation.
    
    Flow:
    1. Client sends audio chunks (base64 encoded)
    2. Server transcribes with Whisper
    3. Server gets GPT response
    4. Server generates voice with ElevenLabs
    5. Server streams audio back to client
    
    Message format:
    Client -> Server: {"type": "audio", "data": "base64_audio_data"}
    Server -> Client: {"type": "transcript", "text": "transcribed_text"}
    Server -> Client: {"type": "response", "text": "gpt_response"}
    Server -> Client: {"type": "audio", "data": "base64_audio_data"}
    """
    await websocket.accept()
    
    conversation_history = []
    
    try:
        while True:
            # Receive message from client
            message = await websocket.receive_text()
            data = json.loads(message)
            
            if data["type"] == "audio":
                try:
                    # Decode audio data
                    audio_data = base64.b64decode(data["data"])
                    
                    # Transcribe with Whisper
                    audio_file = ("audio.webm", audio_data, "audio/webm")
                    transcript = await openai_service.transcribe_audio(audio_file)
                    
                    # Send transcript back to client
                    await websocket.send_json({
                        "type": "transcript",
                        "text": transcript
                    })
                    
                    # Check for goodbye
                    goodbye_phrases = ['goodbye', 'bye', 'end call', 'hang up', 'stop', 'quit', 'exit']
                    if any(phrase in transcript.lower() for phrase in goodbye_phrases):
                        goodbye_msg = "Thank you for using AIRA. Take care of your health. Goodbye!"
                        
                        # Send goodbye response
                        await websocket.send_json({
                            "type": "response",
                            "text": goodbye_msg
                        })
                        
                        # Generate goodbye audio
                        goodbye_audio = await elevenlabs_service.text_to_speech(goodbye_msg)
                        goodbye_audio_b64 = base64.b64encode(goodbye_audio).decode('utf-8')
                        
                        await websocket.send_json({
                            "type": "audio",
                            "data": goodbye_audio_b64
                        })
                        
                        # Send end signal
                        await websocket.send_json({
                            "type": "end"
                        })
                        break
                    
                    # Build conversation context
                    messages = [
                        {
                            "role": "system",
                            "content": "You are AIRA (AI Responsive & Intelligent Assistant), a comprehensive medical AI assistant. You can help with symptom analysis, appointments, medications, health coaching, emergencies, and all healthcare needs. Provide supportive and informative responses. Always recommend consulting with healthcare professionals for serious symptoms. Keep responses concise and clear for voice interaction."
                        },
                        *conversation_history,
                        {
                            "role": "user",
                            "content": transcript
                        }
                    ]
                    
                    # Get GPT response
                    response = await openai_service.chat_completion(
                        messages=messages,
                        temperature=0.7
                    )
                    
                    if response["success"]:
                        response_text = response["content"]
                        
                        # Update conversation history
                        conversation_history.append({"role": "user", "content": transcript})
                        conversation_history.append({"role": "assistant", "content": response_text})
                        
                        # Keep only last 10 messages for context
                        if len(conversation_history) > 10:
                            conversation_history = conversation_history[-10:]
                        
                        # Send text response
                        await websocket.send_json({
                            "type": "response",
                            "text": response_text
                        })
                        
                        # Generate audio with ElevenLabs
                        audio_bytes = await elevenlabs_service.text_to_speech(response_text)
                        
                        # Encode audio to base64
                        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                        
                        # Send audio back to client
                        await websocket.send_json({
                            "type": "audio",
                            "data": audio_b64
                        })
                    else:
                        # Send error response
                        await websocket.send_json({
                            "type": "error",
                            "message": "Failed to generate response"
                        })
                        
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Error processing audio: {str(e)}"
                    })
            
            elif data["type"] == "ping":
                # Respond to ping to keep connection alive
                await websocket.send_json({"type": "pong"})
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass
