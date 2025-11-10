'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiverId: number;
  caregiverName: string;
  caregiverBusinessName: string;
}

export function ChatModal({
  isOpen,
  onClose,
  caregiverId,
  caregiverName,
  caregiverBusinessName
}: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation and WebSocket
  useEffect(() => {
    if (isOpen && user) {
      initializeChat();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, user]);

  const initializeChat = async () => {
    try {
      // Create or get conversation
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          caregiver_id: caregiverId,
          initial_message: `Hi, I would like to seek care from ${caregiverBusinessName}.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.id);

        // Load message history
        await loadMessages(data.id);

        // Connect WebSocket
        connectWebSocket();
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/chat/conversations/${convId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        // Mark messages as read
        await markAsRead(convId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const connectWebSocket = () => {
    if (!user) return;

    const ws = new WebSocket(`ws://localhost:8000/api/v1/chat/ws/${user.id}`);

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        // New message received
        const newMsg: Message = {
          id: data.message_id,
          sender_id: data.sender_id,
          sender_name: data.sender_name,
          content: data.content,
          created_at: data.created_at,
          is_read: false
        };

        setMessages(prev => [...prev, newMsg]);

        // Mark as read if conversation is open
        if (conversationId && data.conversation_id === conversationId) {
          markAsRead(conversationId);
        }
      } else if (data.type === 'typing') {
        // Show typing indicator
        setIsTyping(data.is_typing);
      }
    };

    ws.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: newMessage,
          message_type: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (convId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/v1/chat/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: convId
        })
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="border-b bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                👨‍⚕️
              </div>
              <div>
                <h3 className="font-semibold">{caregiverBusinessName}</h3>
                <p className="text-xs text-white/80">
                  {caregiverName}
                  {isConnected && <span className="ml-2">● Online</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <MoreVertical className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwn
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-1 text-teal-600">
                        {message.sender_name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Input */}
        <div className="border-t p-4 bg-white">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none"
              rows={2}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-teal-600 hover:bg-teal-700 self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
