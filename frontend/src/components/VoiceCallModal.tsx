'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceCallModal({ isOpen, onClose }: VoiceCallModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Play audio from blob
  const playAudioBlob = useCallback(async (audioBlob: Blob) => {
    setIsSpeaking(true);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudioRef.current = null;
      setIsSpeaking(false);
    };
    
    try {
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
    }
  }, []);

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log('Attempting to connect to WebSocket...');
    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket('ws://localhost:8000/ws/voice');
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully!');
        setConnectionStatus('connected');
        
        // Just show ready status - no auto greeting
        console.log('Ready for voice input!');
      };
    
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'transcript':
          console.log('Transcript received:', data.text);
          setCurrentTranscript(data.text);
          break;
          
        case 'response':
          console.log('Response received:', data.text);
          setAssistantResponse(data.text);
          setIsProcessing(false);
          break;
          
        case 'audio':
          console.log('Audio received');
          // Decode base64 audio and play
          const audioData = atob(data.data);
          const audioArray = new Uint8Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i);
          }
          const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
          await playAudioBlob(audioBlob);
          break;
          
        case 'error':
          console.error('WebSocket error:', data.message);
          setIsProcessing(false);
          setIsSpeaking(false);
          alert('Error: ' + data.message);
          break;
          
        case 'end':
          console.log('Conversation ended');
          setTimeout(() => {
            onClose();
          }, 2000);
          break;
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      console.error('Make sure backend is running on http://localhost:8000');
      setConnectionStatus('disconnected');
      alert('Failed to connect to voice server. Make sure the backend is running on port 8000.');
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      setConnectionStatus('disconnected');
    };
    
      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      setConnectionStatus('disconnected');
      alert('Failed to connect to voice server. Error: ' + error);
    }
  }, [onClose, playAudioBlob]);


  // Send audio to server via WebSocket
  const sendAudio = useCallback(async (audioBlob: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    setIsProcessing(true);
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = (reader.result as string).split(',')[1];
      
      // Send to server
      wsRef.current?.send(JSON.stringify({
        type: 'audio',
        data: base64Audio
      }));
    };
    reader.readAsDataURL(audioBlob);
  }, []);

  // Start recording
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
        
        // Send audio via WebSocket
        await sendAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  // Toggle recording
  const toggleListening = async () => {
    if (isListening) {
      // Stop recording - this will trigger sending
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Stop AIRA's voice if speaking
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      
      // Start recording
      await startListening();
    }
  };

  // Connect WebSocket when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset all states
      setCurrentTranscript('');
      setAssistantResponse('');
      setIsProcessing(false);
      setIsSpeaking(false);
      setIsListening(false);
      
      // Connect to WebSocket
      connectWebSocket();
    }
    
    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen, connectWebSocket]);

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
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (wsRef.current) {
        wsRef.current.close();
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
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Reset all states
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    setCurrentTranscript('');
    setAssistantResponse('');
    setConnectionStatus('disconnected');
    
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
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? isSpeaking 
                    ? 'bg-blue-600 animate-pulse' 
                    : isListening 
                      ? 'bg-red-600 animate-pulse' 
                      : 'bg-green-600'
                  : connectionStatus === 'connecting'
                    ? 'bg-yellow-600 animate-pulse'
                    : 'bg-gray-400'
              }`} />
              <span className="text-sm text-slate-600">
                {connectionStatus === 'connected'
                  ? isSpeaking 
                    ? 'AIRA is speaking...' 
                    : isListening 
                      ? 'Listening...' 
                      : isProcessing 
                        ? 'Processing...' 
                        : 'Connected'
                  : connectionStatus === 'connecting'
                    ? 'Connecting...'
                    : 'Disconnected'}
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

          {/* Visual indicator only - no text displayed */}
          {currentTranscript && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                <span className="text-sm text-indigo-700 font-medium">Voice detected</span>
              </div>
            </div>
          )}

          {assistantResponse && !isSpeaking && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full">
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
                <span className="text-sm text-purple-700 font-medium">Response ready</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-slate-600 text-sm">
            <p>
              {connectionStatus !== 'connected'
                ? 'Connecting to AIRA...'
                : isSpeaking 
                  ? 'AIRA is responding... (Click mic to interrupt)' 
                  : isListening 
                    ? 'Recording... Click again when done speaking' 
                    : isProcessing 
                      ? 'Processing your request...' 
                      : 'Click microphone to start speaking'}
            </p>
            <p className="text-xs mt-1 text-slate-400">
              {isListening ? 'Click mic to stop and send' : 'Say "goodbye" to end the conversation'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              onClick={toggleListening}
              size="lg"
              disabled={isProcessing || connectionStatus !== 'connected'}
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
