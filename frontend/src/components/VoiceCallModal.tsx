'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { bedrockApi } from '@/services/api';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function VoiceCallModal({ isOpen, onClose }: VoiceCallModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoListenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user wants to end conversation
  const checkForGoodbye = (text: string): boolean => {
    const goodbyePhrases = [
      'goodbye', 'bye', 'end call', 'hang up', 'stop', 
      'quit', 'exit', 'thank you goodbye', 'that\'s all',
      'end conversation', 'disconnect'
    ];
    const lowerText = text.toLowerCase();
    return goodbyePhrases.some(phrase => lowerText.includes(phrase));
  };

  const speak = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
      // Get audio from ElevenLabs
      const audioBlob = await bedrockApi.textToSpeech(text);
      
      // Create audio element and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        setIsSpeaking(false);
        
        // Auto-restart listening after AIRA finishes speaking (if not closed)
        if (isOpen && !isListening) {
          autoListenTimeoutRef.current = setTimeout(() => {
            startListening();
          }, 500); // Small delay before restarting
        }
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing ElevenLabs audio:', error);
      setIsSpeaking(false);
      
      // Fallback to browser speech synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          setIsSpeaking(false);
          // Auto-restart listening
          if (isOpen && !isListening) {
            autoListenTimeoutRef.current = setTimeout(() => {
              startListening();
            }, 500);
          }
        };
        
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [isOpen, isListening]);

  const processVoiceInput = useCallback(async (transcript: string) => {
    if (isProcessing) return;

    // Check if user wants to end the call
    if (checkForGoodbye(transcript)) {
      const goodbyeMsg = "Thank you for using AIRA. Take care of your health. Goodbye!";
      setAssistantResponse(goodbyeMsg);
      await speak(goodbyeMsg);
      
      // Close after goodbye message
      setTimeout(() => {
        onClose();
      }, 3000);
      return;
    }

    setIsProcessing(true);
    try {
      // Build conversation context
      const messages: Message[] = [
        {
          role: 'system',
          content: 'You are AIRA (AI Responsive & Intelligent Assistant), a comprehensive medical AI assistant. You can help with symptom analysis, appointments, medications, health coaching, emergencies, and all healthcare needs. Provide supportive and informative responses. Always recommend consulting with healthcare professionals for serious symptoms. Keep responses concise and clear for voice interaction. If the user says goodbye or wants to end the conversation, acknowledge it warmly.',
        },
        ...conversationHistory,
        {
          role: 'user',
          content: transcript,
        },
      ];

      const response = await bedrockApi.chatCompletion({
        messages,
        temperature: 0.7,
      });

      if (response.success && response.content) {
        const responseText = response.content;
        setAssistantResponse(responseText);
        
        // Update conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: transcript },
          { role: 'assistant', content: responseText },
        ]);
        
        // Speak the response (will auto-restart listening after)
        await speak(responseText);
      } else {
        const errorMsg = "I'm sorry, I'm having trouble right now. Please try again.";
        setAssistantResponse(errorMsg);
        await speak(errorMsg);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      const errorMsg = 'I apologize, there was an error. Please try again.';
      setAssistantResponse(errorMsg);
      await speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, conversationHistory, speak, onClose]);

  const startListening = async () => {
    if (isSpeaking || isListening || isProcessing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsListening(false);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Transcribe audio using Whisper
        try {
          setIsProcessing(true);
          const transcription = await bedrockApi.transcribeAudio(audioBlob);
          
          if (transcription.success && transcription.text) {
            setCurrentTranscript(transcription.text);
            await processVoiceInput(transcription.text);
          } else {
            const errorMsg = "Sorry, I couldn't understand that. Please try again.";
            setAssistantResponse(errorMsg);
            await speak(errorMsg);
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
          const errorMsg = 'There was an error processing your audio. Please try again.';
          setAssistantResponse(errorMsg);
          await speak(errorMsg);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
      await startListening();
    }
  };

  // Initial greeting when modal opens
  useEffect(() => {
    if (isOpen) {
      setConversationHistory([]);
      setCurrentTranscript('');
      setAssistantResponse('');
      
      // Play welcome message and start listening
      const greeting = "Hello! I'm AIRA, your comprehensive AI medical assistant. How can I help you today?";
      setAssistantResponse(greeting);
      speak(greeting);
    }
  }, [isOpen, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (autoListenTimeoutRef.current) {
        clearTimeout(autoListenTimeoutRef.current);
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleClose = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (autoListenTimeoutRef.current) {
      clearTimeout(autoListenTimeoutRef.current);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setCurrentTranscript('');
    setAssistantResponse('');
    setConversationHistory([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="text-center space-y-6 py-4">
          {/* Header */}
          <div>
            <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
              🤖 AIRA Voice Assistant
            </h3>
            <div className="flex items-center justify-center gap-2 mt-3 text-green-600">
              <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-600 animate-pulse' : isListening ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`} />
              <span className="text-sm">
                {isSpeaking ? 'AIRA is speaking...' : isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Connected'}
              </span>
            </div>
          </div>

          {/* Voice Avatar */}
          <div className="py-8">
            <div
              className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg ${
                isListening || isSpeaking ? 'animate-pulse' : ''
              }`}
            >
              🤖
            </div>
          </div>

          {/* Transcript */}
          {currentTranscript && (
            <div className="bg-slate-50 border-l-4 border-indigo-500 rounded-lg p-4 text-left max-h-24 overflow-y-auto">
              <p className="font-semibold text-sm mb-1">You said:</p>
              <p className="text-sm">{currentTranscript}</p>
            </div>
          )}

          {/* Assistant Response */}
          {assistantResponse && (
            <div className="bg-slate-50 border-l-4 border-purple-500 rounded-lg p-4 text-left max-h-32 overflow-y-auto">
              <p className="font-semibold text-sm mb-1">AIRA:</p>
              <p className="text-sm">{assistantResponse}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-slate-600 text-sm">
            <p>
              {isSpeaking 
                ? 'AIRA is responding...' 
                : isListening 
                  ? 'Speak now...' 
                  : isProcessing 
                    ? 'Processing your request...' 
                    : 'Click the microphone to speak'}
            </p>
            <p className="text-xs mt-1 text-slate-400">Say "goodbye" to end the conversation</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              onClick={toggleListening}
              size="lg"
              disabled={isSpeaking || isProcessing}
              className={`w-16 h-16 rounded-full ${
                isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <span className="text-2xl">🎤</span>
            </Button>
            <Button onClick={handleClose} variant="destructive" size="lg">
              📞 End Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
