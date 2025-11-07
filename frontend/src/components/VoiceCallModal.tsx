'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { bedrockApi } from '@/services/api';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceCallModal({ isOpen, onClose }: VoiceCallModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const processVoiceInput = useCallback(async (transcript: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await bedrockApi.chatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical AI assistant. Provide supportive and informative responses about health concerns. Always recommend consulting with healthcare professionals for serious symptoms. Keep responses concise for voice interaction.',
          },
          {
            role: 'user',
            content: transcript,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      });

      if (response.success && response.content) {
        setAssistantResponse(response.content);
        speak(response.content);
      } else {
        const errorMsg = "I'm sorry, I'm having trouble connecting to the medical database right now. Please try again.";
        setAssistantResponse(errorMsg);
        speak(errorMsg);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      const errorMsg = 'I apologize, there was an error processing your request. Please try again.';
      setAssistantResponse(errorMsg);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setCurrentTranscript(transcript);
          setIsListening(false);
          processVoiceInput(transcript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [processVoiceInput]);

  useEffect(() => {
    if (isOpen) {
      // Welcome message when modal opens
      speak("Hello! I'm your medical AI assistant. How can I help you today?");
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Try to use a female voice for medical assistant
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes('Female') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Karen')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClose = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setCurrentTranscript('');
    setAssistantResponse('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="text-center space-y-6 py-4">
          {/* Header */}
          <div>
            <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
              🏥 Medical Voice Assistant
            </h3>
            <div className="flex items-center justify-center gap-2 mt-3 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <span className="text-sm">{isListening ? 'Listening...' : 'Connected'}</span>
            </div>
          </div>

          {/* Voice Avatar */}
          <div className="py-8">
            <div
              className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg ${
                isListening ? 'animate-pulse' : ''
              }`}
            >
              🩺
            </div>
          </div>

          {/* Transcript */}
          {currentTranscript && (
            <div className="bg-slate-50 border-l-4 border-indigo-500 rounded-lg p-4 text-left">
              <p className="font-semibold text-sm mb-1">You said:</p>
              <p className="text-sm">{currentTranscript}</p>
            </div>
          )}

          {/* Assistant Response */}
          {assistantResponse && (
            <div className="bg-slate-50 border-l-4 border-indigo-500 rounded-lg p-4 text-left">
              <p className="font-semibold text-sm mb-1">Medical AI:</p>
              <p className="text-sm">{assistantResponse}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-slate-600 text-sm">
            <p>{isListening ? 'Please describe your medical concern...' : 'Click the microphone to speak'}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              onClick={toggleListening}
              size="lg"
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
