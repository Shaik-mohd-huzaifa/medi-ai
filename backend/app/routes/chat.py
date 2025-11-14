from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.chat import Conversation, Message, ConversationStatus, MessageType
from app.schemas.chat import (
    ConversationCreate, ConversationResponse, ConversationWithMessages,
    MessageCreate, MessageResponse, MarkReadRequest
)
from app.services.chat_service import manager
from app.routes.auth import get_current_active_user
from datetime import datetime
import json

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new conversation between patient and caregiver.
    Patient initiates conversation by clicking "Seek Care".
    """
    try:
        print(f"🔍 Creating conversation - Patient ID: {current_user.id}, Caregiver ID: {data.caregiver_id}")
        
        # Check if conversation already exists
        existing = db.query(Conversation).filter(
            Conversation.patient_id == current_user.id,
            Conversation.caregiver_id == data.caregiver_id,
            Conversation.status == ConversationStatus.ACTIVE
        ).first()
        
        if existing:
            print(f"✅ Found existing conversation: {existing.id}")
            # Return existing conversation
            return format_conversation_response(existing, db)
    except Exception as e:
        print(f"❌ Error checking existing conversation: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating conversation: {str(e)}"
        )
    
    # Create new conversation
    try:
        conversation = Conversation(
            patient_id=current_user.id,
            caregiver_id=data.caregiver_id,
            status=ConversationStatus.ACTIVE
        )
        
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        print(f"✅ Created new conversation: {conversation.id}")
        
        # Send initial message if provided
        if data.initial_message:
            message = Message(
                conversation_id=conversation.id,
                sender_id=current_user.id,
                content=data.initial_message,
                message_type=MessageType.TEXT
            )
            db.add(message)
            conversation.last_message_at = datetime.utcnow()
            conversation.caregiver_unread_count += 1
            db.commit()
            print(f"✅ Sent initial message")
            
            # Notify caregiver via WebSocket
            await notify_new_message(message, db)
        
        return format_conversation_response(conversation, db)
    except Exception as e:
        print(f"❌ Error creating conversation: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating conversation: {str(e)}"
        )


@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for the current user"""
    conversations = db.query(Conversation).filter(
        (Conversation.patient_id == current_user.id) | 
        (Conversation.caregiver_id == current_user.id),
        Conversation.status == ConversationStatus.ACTIVE
    ).order_by(Conversation.last_message_at.desc()).all()
    
    return [format_conversation_response(conv, db) for conv in conversations]


@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get conversation with full message history"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        (Conversation.patient_id == current_user.id) | 
        (Conversation.caregiver_id == current_user.id)
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Get messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()
    
    # Format response
    response = format_conversation_response(conversation, db)
    response_dict = response.__dict__
    response_dict["messages"] = [format_message_response(msg, db) for msg in messages]
    
    return ConversationWithMessages(**response_dict)


@router.post("/messages", response_model=MessageResponse)
async def send_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a message in a conversation"""
    # Verify conversation access
    conversation = db.query(Conversation).filter(
        Conversation.id == data.conversation_id,
        (Conversation.patient_id == current_user.id) | 
        (Conversation.caregiver_id == current_user.id)
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Create message
    message = Message(
        conversation_id=data.conversation_id,
        sender_id=current_user.id,
        content=data.content,
        message_type=MessageType.TEXT
    )
    
    db.add(message)
    
    # Update conversation metadata
    conversation.last_message_at = datetime.utcnow()
    
    # Increment unread count for recipient
    if current_user.id == conversation.patient_id:
        conversation.caregiver_unread_count += 1
    else:
        conversation.patient_unread_count += 1
    
    db.commit()
    db.refresh(message)
    
    # Notify via WebSocket
    await notify_new_message(message, db)
    
    return format_message_response(message, db)


@router.post("/mark-read")
async def mark_messages_read(
    data: MarkReadRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark all messages in a conversation as read"""
    conversation = db.query(Conversation).filter(
        Conversation.id == data.conversation_id,
        (Conversation.patient_id == current_user.id) | 
        (Conversation.caregiver_id == current_user.id)
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Mark messages as read
    db.query(Message).filter(
        Message.conversation_id == data.conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    
    # Reset unread count
    if current_user.id == conversation.patient_id:
        conversation.patient_unread_count = 0
    else:
        conversation.caregiver_unread_count = 0
    
    db.commit()
    
    return {"success": True, "message": "Messages marked as read"}


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time chat.
    Handles connection, message delivery, and typing indicators.
    """
    await manager.connect(websocket, user_id)
    
    # Subscribe user to all their conversations
    conversations = db.query(Conversation).filter(
        (Conversation.patient_id == user_id) | 
        (Conversation.caregiver_id == user_id),
        Conversation.status == ConversationStatus.ACTIVE
    ).all()
    
    for conv in conversations:
        manager.subscribe_to_conversation(conv.id, user_id)
    
    # Broadcast online status
    await manager.send_online_status(user_id, is_online=True)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            message_type = message_data.get("type")
            
            if message_type == "typing":
                # Broadcast typing indicator
                conversation_id = message_data.get("conversation_id")
                is_typing = message_data.get("is_typing", True)
                await manager.send_typing_indicator(conversation_id, user_id, is_typing)
            
            elif message_type == "read":
                # Send read receipt
                conversation_id = message_data.get("conversation_id")
                message_id = message_data.get("message_id")
                await manager.send_read_receipt(conversation_id, user_id, message_id)
            
            elif message_type == "ping":
                # Heartbeat
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        
        # Broadcast offline status
        await manager.send_online_status(user_id, is_online=False)
        
        print(f"Client #{user_id} disconnected")


# Helper functions

def format_conversation_response(conversation: Conversation, db: Session) -> ConversationResponse:
    """Format conversation for API response"""
    patient = db.query(User).filter(User.id == conversation.patient_id).first()
    caregiver = db.query(User).filter(User.id == conversation.caregiver_id).first()
    
    # Get caregiver business name
    caregiver_business_name = None
    if caregiver and hasattr(caregiver, 'caregiver_profile') and caregiver.caregiver_profile:
        caregiver_business_name = caregiver.caregiver_profile.business_name
    
    # Get last message
    last_message = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.desc()).first()
    
    return ConversationResponse(
        id=conversation.id,
        patient_id=conversation.patient_id,
        caregiver_id=conversation.caregiver_id,
        status=conversation.status.value,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        last_message_at=conversation.last_message_at,
        patient_unread_count=conversation.patient_unread_count,
        caregiver_unread_count=conversation.caregiver_unread_count,
        patient_name=patient.full_name if patient else None,
        caregiver_name=caregiver.full_name if caregiver else None,
        caregiver_business_name=caregiver_business_name,
        last_message=last_message.content if last_message else None
    )


def format_message_response(message: Message, db: Session) -> MessageResponse:
    """Format message for API response"""
    sender = db.query(User).filter(User.id == message.sender_id).first()
    
    return MessageResponse(
        id=message.id,
        conversation_id=message.conversation_id,
        sender_id=message.sender_id,
        sender_name=sender.full_name if sender else "Unknown",
        message_type=message.message_type.value,
        content=message.content,
        is_read=message.is_read,
        created_at=message.created_at
    )


async def notify_new_message(message: Message, db: Session):
    """Send WebSocket notification for new message"""
    sender = db.query(User).filter(User.id == message.sender_id).first()
    
    notification = {
        "type": "message",
        "conversation_id": message.conversation_id,
        "message_id": message.id,
        "sender_id": message.sender_id,
        "sender_name": sender.full_name if sender else "Unknown",
        "content": message.content,
        "created_at": message.created_at.isoformat()
    }
    
    # Broadcast to all users in conversation
    await manager.broadcast_to_conversation(
        notification,
        message.conversation_id,
        exclude_user_id=message.sender_id
    )
