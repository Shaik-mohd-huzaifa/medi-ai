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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const processVoiceInput = useCallback(async (transcript: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await bedrockApi.chatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are AIRA (AI Responsive & Intelligent Assistant), a comprehensive medical AI assistant. You can help with symptom analysis, appointments, medications, health coaching, emergencies, and all healthcare needs. Provide supportive and informative responses. Always recommend consulting with healthcare professionals for serious symptoms. Keep responses concise and clear for voice interaction.',
          },
          {
            role: 'user',
            content: transcript,
          },
        ],
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
    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Welcome message when modal opens
      speak("Hello! I'm AIRA, your comprehensive AI medical assistant. How can I help you today?");
    }
  }, [isOpen]);

  const toggleListening = async () => {
    if (isListening) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
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
              speak(errorMsg);
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
            const errorMsg = 'There was an error processing your audio. Please try again.';
            setAssistantResponse(errorMsg);
            speak(errorMsg);
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
    }
  };

  const speak = async (text: string) => {
    try {
      // Get audio from ElevenLabs
      const audioBlob = await bedrockApi.textToSpeech(text);
      
      // Create audio element and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing ElevenLabs audio:', error);
      // Fallback to browser speech synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleClose = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
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
              🤖 AIRA Voice Assistant
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
              🤖
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
              <p className="font-semibold text-sm mb-1">AIRA:</p>
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
