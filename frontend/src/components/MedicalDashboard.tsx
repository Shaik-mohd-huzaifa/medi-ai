'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/Sidebar';
import { VoiceCallModal } from '@/components/VoiceCallModal';
import { Settings, Share2, MoreVertical, Paperclip, Mic, Send, Mail, Calendar, Phone } from 'lucide-react';
import { bedrockApi } from '@/services/api';

const agentInfo: Record<string, { name: string; description: string; icon: string }> = {
  'symptom-checker': {
    name: 'Symptom Checker',
    description: 'Analyzes your symptoms and provides preliminary health assessments. Helps identify potential conditions and recommends next steps.',
    icon: '🔍',
  },
  'appointment-scheduler': {
    name: 'Appointment Scheduler',
    description: 'Schedules and manages your medical appointments. Sends reminders and coordinates with healthcare providers.',
    icon: '📅',
  },
  'medication-advisor': {
    name: 'Medication Advisor',
    description: 'Provides information about medications, dosages, and potential interactions. Helps track your medication schedule.',
    icon: '💊',
  },
  'triage-assistant': {
    name: 'Triage Assistant',
    description: 'Assesses urgency of medical conditions and recommends appropriate level of care.',
    icon: '🚑',
  },
  'health-coach': {
    name: 'Health Coach',
    description: 'Provides personalized wellness guidance and lifestyle recommendations.',
    icon: '💪',
  },
};

export default function MedicalDashboard() {
  const [selectedAgent, setSelectedAgent] = useState('symptom-checker');
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    try {
      const response = await bedrockApi.chatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are AIRA (AI Responsive & Intelligent Assistant), a comprehensive medical AI assistant. You can help with symptom analysis, appointments, medications, health coaching, emergencies, and all healthcare needs. Provide supportive and informative responses about health concerns. Always recommend consulting with healthcare professionals for serious symptoms.',
          },
          {
            role: 'user',
            content: userInput,
          },
        ],
        temperature: 0.7,
      });

      if (response.success && response.content) {
        alert(`Medical AI Response:\n\n${response.content}`);
      } else {
        alert("Sorry, I'm having trouble connecting to the medical database. Please try again.");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('There was an error processing your request. Please try again.');
    }

    setUserInput('');
  };

  const currentAgent = agentInfo[selectedAgent] || agentInfo['symptom-checker'];

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
      <Sidebar selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />

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
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Agent Icon and Title */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-orange-400 animate-pulse">
                <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <span className="text-3xl">{currentAgent.icon}</span>
                </div>
              </div>
              <h1 className="text-3xl font-semibold">{currentAgent.name}</h1>
              <p className="text-gray-600 max-w-xl mx-auto">
                {currentAgent.description}
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="space-y-4">
              <h3 className="text-sm text-gray-500 text-center">Today&apos;s suggested prompt</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
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

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
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
