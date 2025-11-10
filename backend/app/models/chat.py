from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class ConversationStatus(str, enum.Enum):
    """Status of a conversation"""
    ACTIVE = "active"
    CLOSED = "closed"
    ARCHIVED = "archived"


class MessageType(str, enum.Enum):
    """Type of message"""
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"


class Conversation(Base):
    """Chat conversation between patient and caregiver"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    caregiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(ConversationStatus), default=ConversationStatus.ACTIVE)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    
    # Unread message counts
    patient_unread_count = Column(Integer, default=0)
    caregiver_unread_count = Column(Integer, default=0)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], backref="patient_conversations")
    caregiver = relationship("User", foreign_keys=[caregiver_id], backref="caregiver_conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """Individual message in a conversation"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Message content
    message_type = Column(SQLEnum(MessageType), default=MessageType.TEXT)
    content = Column(Text, nullable=False)
    
    # Metadata
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Optional: For attachments
    attachment_url = Column(String, nullable=True)
    attachment_type = Column(String, nullable=True)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
