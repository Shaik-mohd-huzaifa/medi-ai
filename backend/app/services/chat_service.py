from typing import Dict, Set
from fastapi import WebSocket
import json
from datetime import datetime


class ConnectionManager:
    """
    Manages WebSocket connections for real-time chat.
    Implements pub/sub pattern for message delivery.
    """
    
    def __init__(self):
        # Map of user_id -> Set of WebSocket connections
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        
        # Map of conversation_id -> Set of user_ids who are in this conversation
        self.conversation_users: Dict[int, Set[int]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept a WebSocket connection and register user"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        print(f"✅ User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            # Clean up if no more connections
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                print(f"❌ User {user_id} disconnected. No active connections.")
    
    def subscribe_to_conversation(self, conversation_id: int, user_id: int):
        """Subscribe a user to a conversation"""
        if conversation_id not in self.conversation_users:
            self.conversation_users[conversation_id] = set()
        
        self.conversation_users[conversation_id].add(user_id)
        print(f"📝 User {user_id} subscribed to conversation {conversation_id}")
    
    def unsubscribe_from_conversation(self, conversation_id: int, user_id: int):
        """Unsubscribe a user from a conversation"""
        if conversation_id in self.conversation_users:
            self.conversation_users[conversation_id].discard(user_id)
            
            # Clean up if no subscribers
            if not self.conversation_users[conversation_id]:
                del self.conversation_users[conversation_id]
    
    async def send_personal_message(self, message: dict, user_id: int):
        """Send a message to a specific user (all their connections)"""
        if user_id in self.active_connections:
            dead_connections = set()
            
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"❌ Error sending to user {user_id}: {e}")
                    dead_connections.add(connection)
            
            # Clean up dead connections
            for dead_conn in dead_connections:
                self.disconnect(dead_conn, user_id)
    
    async def broadcast_to_conversation(self, message: dict, conversation_id: int, exclude_user_id: int = None):
        """
        Broadcast a message to all users in a conversation (pub/sub pattern).
        Optionally exclude the sender.
        """
        if conversation_id not in self.conversation_users:
            print(f"⚠️ No users subscribed to conversation {conversation_id}")
            return
        
        for user_id in self.conversation_users[conversation_id]:
            # Skip sender if specified
            if exclude_user_id and user_id == exclude_user_id:
                continue
            
            await self.send_personal_message(message, user_id)
            print(f"📤 Broadcast message to user {user_id} in conversation {conversation_id}")
    
    async def send_typing_indicator(self, conversation_id: int, user_id: int, is_typing: bool):
        """Send typing indicator to other users in conversation"""
        message = {
            "type": "typing",
            "conversation_id": conversation_id,
            "user_id": user_id,
            "is_typing": is_typing,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.broadcast_to_conversation(message, conversation_id, exclude_user_id=user_id)
    
    async def send_read_receipt(self, conversation_id: int, user_id: int, message_id: int):
        """Send read receipt to other users"""
        message = {
            "type": "read",
            "conversation_id": conversation_id,
            "user_id": user_id,
            "message_id": message_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.broadcast_to_conversation(message, conversation_id, exclude_user_id=user_id)
    
    async def send_online_status(self, user_id: int, is_online: bool):
        """Broadcast user's online status to relevant conversations"""
        message = {
            "type": "online_status",
            "user_id": user_id,
            "is_online": is_online,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Find all conversations this user is part of
        for conversation_id, users in self.conversation_users.items():
            if user_id in users:
                await self.broadcast_to_conversation(message, conversation_id, exclude_user_id=user_id)
    
    def get_online_users(self) -> Set[int]:
        """Get set of currently online user IDs"""
        return set(self.active_connections.keys())
    
    def is_user_online(self, user_id: int) -> bool:
        """Check if a user is online"""
        return user_id in self.active_connections


# Global connection manager instance
manager = ConnectionManager()
