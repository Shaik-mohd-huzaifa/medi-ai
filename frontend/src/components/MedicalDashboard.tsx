'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/Sidebar';
import { VoiceCallModal } from '@/components/VoiceCallModal';
import { Settings, Share2, MoreVertical, Paperclip, Mic, Send, Mail, Calendar, Phone } from 'lucide-react';
import { bedrockApi } from '@/services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function MedicalDashboard() {
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await bedrockApi.chatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are AIRA (AI Responsive & Intelligent Assistant), a comprehensive medical AI assistant. You can help with symptom analysis, appointments, medications, health coaching, emergencies, and all healthcare needs. Provide supportive and informative responses about health concerns. Always recommend consulting with healthcare professionals for serious symptoms.',
          },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          {
            role: 'user',
            content: userMessage.content,
          },
        ],
        temperature: 0.7,
      });

      if (response.success && response.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Sorry, I'm having trouble connecting right now. Please try again." 
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'There was an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#0A7373]">
      {/* Voice Call Modal */}
      <VoiceCallModal 
        isOpen={isVoiceCallActive} 
        onClose={() => setIsVoiceCallActive(false)} 
      />

      {/* Sidebar */}
      <Sidebar selectedAgent="aira" onSelectAgent={() => {}} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-gray-700">Medical AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setIsVoiceCallActive(true)}
            >
              <Phone className="h-4 w-4 mr-2" />
              Voice Call
            </Button>
            <Button variant="ghost" size="sm" className="text-sm">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-8 py-12">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 animate-pulse">
                    <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
                      <span className="text-3xl">🤖</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-semibold">AIRA Medical Assistant</h1>
                  <p className="text-gray-600 max-w-xl mx-auto">
                    Your comprehensive AI medical assistant. Ask me anything about your health, symptoms, medications, or appointments.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm text-gray-500 text-center">Try asking about:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200" onClick={() => setUserInput('I have a headache and fever')}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Mail className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium mb-1">
                              Check my symptoms
                            </p>
                            <p className="text-xs text-gray-500">
                              Analyze your current health concerns
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200" onClick={() => setUserInput('Help me schedule an appointment')}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium mb-1">
                              Schedule appointment
                            </p>
                            <p className="text-xs text-gray-500">
                              Book a consultation with your doctor
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user' 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-start gap-3">
                        {message.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-xs flex-shrink-0">
                            🤖
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-xs">
                          🤖
                        </div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="What can I help with today?"
                className="min-h-[60px] pr-28 resize-none text-sm"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsListening(!isListening)}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsListening(!isListening)}
                >
                  <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full bg-teal-700 hover:bg-teal-800"
                  onClick={sendMessage}
                  disabled={!userInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI-generated content may contain errors. Please verify critical information.{' '}
              <button className="underline hover:text-gray-700">Learn More</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
