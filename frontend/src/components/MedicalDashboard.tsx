'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/Sidebar';
import { VoiceCallModal } from '@/components/VoiceCallModal';
import { CaregiverRecommendations } from '@/components/CaregiverRecommendations';
import { ChatModal } from '@/components/ChatModal';
import { Paperclip, Mic, Send, Mail, Calendar, Phone, LogOut, Users, MapPin } from 'lucide-react';
import { bedrockApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tool_results?: any[];
}

export default function MedicalDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCaregiverRecommendations, setShowCaregiverRecommendations] = useState(false);
  const [recommendedCaregivers, setRecommendedCaregivers] = useState<any[]>([]);
  const [activeChatCaregiver, setActiveChatCaregiver] = useState<{id: number; name: string; businessName: string} | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const handleFindCaregivers = async () => {
    try {
      // Extract symptoms and urgency from conversation
      const lastMessages = messages.slice(-5).map(m => m.content).join(' ');
      
      const params = {
        symptoms: lastMessages || 'general consultation',
        urgency: 'medium',
        country: 'India',
        limit: 3
      };

      const caregivers = await bedrockApi.matchCaregivers(params);
      setRecommendedCaregivers(caregivers);
      setShowCaregiverRecommendations(true);
    } catch (error) {
      console.error('Error finding caregivers:', error);
      alert('Failed to find caregivers. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    console.log('💬 Sending message to backend...');

    try {
      const payload = {
        messages: [
          {
            role: 'system' as const,
            content: `You are AIRA (AI Responsive & Intelligent Assistant), a comprehensive medical AI assistant designed to provide thoughtful, structured healthcare guidance.

**Your Primary Responsibilities:**

1. **SYMPTOM ASSESSMENT PHASE** - Always start by gathering comprehensive information:
   - Ask about specific symptoms (pain, fever, nausea, etc.)
   - Duration and severity of symptoms (when started, how severe on 1-10 scale)
   - Any recent activities or triggers (diet changes, injuries, exposure, stress)
   - Current medications or treatments being used
   - Pre-existing medical conditions or allergies
   - Age, general health status, and any relevant medical history

2. **INFORMATION GATHERING PROTOCOL:**
   - Ask ONE question at a time for clarity
   - Be empathetic and supportive in tone
   - Confirm understanding before moving to the next question
   - Take at least 3-5 exchanges to gather sufficient information before making any recommendations
   - Never rush to conclusions without adequate information

3. **ANALYSIS & TRIAGE:**
   After gathering sufficient information, assess the situation:
   
   **EMERGENCY INDICATORS** (Require immediate medical attention):
   - Chest pain, difficulty breathing, severe bleeding
   - Loss of consciousness, seizures, stroke symptoms
   - Severe allergic reactions, high fever (>103°F/39.4°C)
   - Severe abdominal pain, head injury with confusion
   → Response: "⚠️ URGENT: Based on your symptoms, this requires immediate medical attention. Please call emergency services (911) or go to the nearest emergency room right away."

   **NEEDS PROFESSIONAL CONSULTATION:**
   - Persistent symptoms (>3 days)
   - Moderate pain or discomfort affecting daily life
   - Unusual symptoms or changes in health
   - Symptoms that are worsening
   → Response: "Based on the information you've shared, I recommend consulting with a healthcare professional. Would you like me to help you connect with a caregiver?"

   **SELF-CARE APPROPRIATE:**
   - Minor symptoms (mild cold, minor cuts, general wellness)
   - Clear path to self-management
   → Response: Provide home care advice, monitoring guidelines, and when to seek help

4. **CAREGIVER CONNECTION OFFER:**
   When professional consultation is needed, present options clearly:
   
   "I recommend speaking with a healthcare professional about your symptoms. I can help you connect with a qualified caregiver in the following ways:
   
   🩺 **Chat Consultation** - Connect with a doctor via secure chat for advice and prescriptions
   📞 **Voice/Video Call** - Schedule a virtual appointment for a more detailed consultation
   🏥 **In-Person Visit** - Find nearby clinics or hospitals for physical examination
   
   Would you like me to help you book an appointment? Just let me know which option works best for you."

5. **GENERAL GUIDELINES:**
   - Always maintain a caring, professional, and non-judgmental tone
   - Provide evidence-based information when giving advice
   - Use simple language, avoid medical jargon unless necessary
   - Never diagnose conditions - only provide information and guidance
   - Emphasize that you're here to support, not replace, healthcare professionals
   - Respect patient privacy and handle sensitive information carefully

6. **CONVERSATION FLOW:**
   - Start: "Hello! I'm AIRA, your AI health assistant. How can I help you today?"
   - Gather: Ask detailed questions about symptoms
   - Assess: Evaluate severity and urgency
   - Recommend: Provide guidance or connect to caregivers
   - Follow-up: Offer continued support and next steps

Remember: Patient safety is paramount. When in doubt, always err on the side of recommending professional medical consultation.`,
          },
          ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          {
            role: 'user' as const,
            content: userMessage.content,
          },
        ],
        temperature: 0.7,
      };

      console.log('📤 Request payload:', payload);
      
      const response = await bedrockApi.chatCompletion(payload);
      
      console.log('📥 Response received:', response);

      if (response.success && response.content) {
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: response.content || '' 
        };
        
        // Add tool results if present (for caregiver search, etc.)
        if (response.tool_results && response.tool_results.length > 0) {
          assistantMessage.tool_results = response.tool_results;
          console.log('🛠️ Tool results received:', response.tool_results);
        }
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('❌ Response not successful:', response);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Sorry, I'm having trouble connecting right now. Please try again." 
        }]);
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.response?.data?.detail || error.message || 'Unable to connect to server'}` 
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

      {/* Caregiver Recommendations Modal */}
      {showCaregiverRecommendations && (
        <CaregiverRecommendations
          caregivers={recommendedCaregivers}
          onClose={() => setShowCaregiverRecommendations(false)}
        />
      )}

      {/* Chat Modal */}
      {activeChatCaregiver && (
        <ChatModal
          isOpen={true}
          onClose={() => setActiveChatCaregiver(null)}
          caregiverId={activeChatCaregiver.id}
          caregiverName={activeChatCaregiver.name}
          caregiverBusinessName={activeChatCaregiver.businessName}
        />
      )}

      {/* Sidebar */}
      <Sidebar selectedAgent="aira" onSelectAgent={() => {}} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-gray-700">Medical AI Assistant</h2>
            {user && (
              <span className="text-xs text-gray-500 ml-4">
                Welcome, {user.full_name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/caregivers')}
            >
              <Users className="h-4 w-4 mr-2" />
              Browse All
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleFindCaregivers}
            >
              <Users className="h-4 w-4 mr-2" />
              Find Match
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setIsVoiceCallActive(true)}
            >
              <Phone className="h-4 w-4 mr-2" />
              Voice Call
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
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
                  <div key={index} className="space-y-3">
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                    
                    {/* Tool Results Display - Caregiver Cards */}
                    {message.tool_results && message.tool_results.map((toolResult, trIndex) => {
                      if (toolResult.function_name === 'search_caregivers' && toolResult.result.caregivers) {
                        return (
                          <div key={trIndex} className="w-full">
                            {/* Section Header */}
                            <div className="mb-3 pl-2">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Recommended Caregivers ({toolResult.result.caregivers.length})
                              </p>
                            </div>
                            
                            {/* Horizontal Scrollable Cards */}
                            <div className="overflow-x-auto pb-2">
                              <div className="flex gap-4 min-w-max pr-4">
                                {toolResult.result.caregivers.map((caregiver: any, idx: number) => (
                                  <Card 
                                    key={caregiver.id} 
                                    className="hover:shadow-xl transition-all hover:scale-[1.02] border-l-4 border-teal-500 w-[320px] flex-shrink-0"
                                  >
                                    <CardContent className="p-5">
                                      <div className="space-y-3">
                                        {/* Header with Match Badge */}
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded">
                                                #{idx + 1}
                                              </span>
                                              <h4 className="font-bold text-sm text-gray-900 truncate">
                                                {caregiver.business_name}
                                              </h4>
                                            </div>
                                            <p className="text-xs text-gray-600 truncate">{caregiver.full_name}</p>
                                            <p className="text-xs text-teal-600 font-medium mt-0.5 truncate">
                                              {caregiver.specialization}
                                            </p>
                                          </div>
                                          <div className="text-center bg-teal-50 rounded-lg px-3 py-2 flex-shrink-0">
                                            <div className="text-2xl font-bold text-teal-600">
                                              {Math.round(caregiver.match_score)}
                                            </div>
                                            <p className="text-[10px] text-gray-600 font-medium">% Match</p>
                                          </div>
                                        </div>
                                        
                                        {/* Stats */}
                                        <div className="flex items-center gap-3 text-xs text-gray-600 py-2 border-y border-gray-100">
                                          <span className="flex items-center gap-1 font-medium">
                                            ⭐ {caregiver.rating}/5
                                          </span>
                                          <span className="text-gray-300">|</span>
                                          <span className="font-medium">{caregiver.years_of_experience} yrs exp</span>
                                          <span className="text-gray-300">|</span>
                                          <span className="font-medium">{caregiver.total_consultations}+ patients</span>
                                        </div>
                                        
                                        {/* Location */}
                                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                                          <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                                          <span className="font-medium truncate">{caregiver.business_city}, {caregiver.business_state}</span>
                                        </div>
                                        
                                        {/* Consultation Modes */}
                                        <div className="pt-1">
                                          <div className="flex flex-wrap gap-1.5">
                                            {caregiver.consultation_modes?.split(',').map((mode: string, idx: number) => (
                                              <span 
                                                key={idx} 
                                                className="text-xs bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 px-2.5 py-1 rounded-full font-medium border border-teal-100"
                                              >
                                                {mode.trim() === 'chat' && '💬'}
                                                {mode.trim() === 'video' && '📹'}
                                                {mode.trim() === 'in-person' && '🏥'}
                                                {' '}{mode.trim()}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        {/* Seek Care Button */}
                                        <Button
                                          size="sm"
                                          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all"
                                          onClick={() => {
                                            setActiveChatCaregiver({
                                              id: caregiver.id,
                                              name: caregiver.full_name,
                                              businessName: caregiver.business_name
                                            });
                                          }}
                                        >
                                          💬 Chat Now
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                            
                            {/* Scroll Hint */}
                            <div className="mt-2 text-center">
                              <p className="text-xs text-gray-400">← Scroll to see all caregivers →</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
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
