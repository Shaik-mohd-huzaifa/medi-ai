from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MessageCreate(BaseModel):
    """Request to create a new message"""
    conversation_id: int = Field(..., description="Conversation ID")
    content: str = Field(..., description="Message content")
    message_type: str = Field(default="text", description="Message type")
    

class MessageResponse(BaseModel):
    """Response with message details"""
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str
    message_type: str
    content: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    """Request to create a new conversation"""
    caregiver_id: int = Field(..., description="Caregiver user ID")
    initial_message: Optional[str] = Field(None, description="Optional initial message")


class ConversationResponse(BaseModel):
    """Response with conversation details"""
    id: int
    patient_id: int
    caregiver_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    last_message_at: datetime
    patient_unread_count: int
    caregiver_unread_count: int
    
    # Additional info
    patient_name: Optional[str] = None
    caregiver_name: Optional[str] = None
    caregiver_business_name: Optional[str] = None
    last_message: Optional[str] = None
    
    class Config:
        from_attributes = True


class ConversationWithMessages(ConversationResponse):
    """Conversation with full message history"""
    messages: List[MessageResponse] = []


class MarkReadRequest(BaseModel):
    """Request to mark messages as read"""
    conversation_id: int = Field(..., description="Conversation ID")


class WebSocketMessage(BaseModel):
    """WebSocket message format"""
    type: str = Field(..., description="Message type: 'message', 'typing', 'read', 'online'")
    conversation_id: Optional[int] = None
    content: Optional[str] = None
    sender_id: Optional[int] = None
    sender_name: Optional[str] = None
    created_at: Optional[datetime] = None
    message_id: Optional[int] = None
