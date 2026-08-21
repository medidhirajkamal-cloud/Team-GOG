import React, { useState, useEffect, useRef } from 'react';
import { ReportItem } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoCreateReport?: (report: Partial<ReportItem>) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onAutoCreateReport
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcriptHistory, setTranscriptHistory] = useState<Array<{ sender: 'user' | 'gemini'; text: string; time: string }>>([
    {
      sender: 'gemini',
      text: 'CityPulse Live Voice Dispatcher online. Press the microphone and speak to report an issue, check status, or request emergency municipal dispatch.',
      time: 'Ready'
    }
  ]);
  const [currentSpeech, setCurrentSpeech] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize Speech Recognition & WebSocket connection
  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

    // Connect WebSocket to /ws/live
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'agent_response' && data.text) {
            setIsProcessing(false);
            setTranscriptHistory((prev) => [
              ...prev,
              {
                sender: 'gemini',
                text: data.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            speakText(data.text);
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
      };
    } catch (err) {
      console.warn('WebSocket connection error, will use HTTP fallback:', err);
    }

    // Initialize Web Speech API for voice recognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const speechText = final || interim;
        setCurrentSpeech(speechText);

        if (final.trim()) {
          sendVoiceInput(final.trim());
          setCurrentSpeech('');
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsListening(false);
    setIsProcessing(false);
  };

  const startVoiceCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Web Audio API for waveform metering
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setIsListening(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is needed for live voice conversation. You can also type your voice query below.');
    }
  };

  const stopVoiceCapture = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsListening(false);
    setAudioLevel(0);
  };

  const sendVoiceInput = async (text: string) => {
    if (!text.trim()) return;

    setTranscriptHistory((prev) => [
      ...prev,
      {
        sender: 'user',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsProcessing(true);

    // Try WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'user_speech',
          text,
          model: 'gemini-3.1-flash-live-preview'
        })
      );
    } else {
      // HTTP Fallback
      try {
        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: text }],
            model: 'gemini-3.1-flash-lite',
            systemInstruction:
              'You are the CityPulse 311 Live Voice Dispatcher. Speak concisely and clearly in 1-2 spoken sentences suitable for voice delivery.'
          })
        });
        const data = await response.json();
        const reply = data.content || 'Report received by municipal dispatch.';
        setIsProcessing(false);
        setTranscriptHistory((prev) => [
          ...prev,
          {
            sender: 'gemini',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        speakText(reply);
      } catch (err) {
        setIsProcessing(false);
        console.error('Voice send error:', err);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-[#131b2e] text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#86f2e4]/30 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2b354d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#86f2e4] text-[#003833] flex items-center justify-center font-bold shadow-lg shadow-[#86f2e4]/20">
              <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] tracking-tight">Gemini Live Voice Dispatcher</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#86f2e4]/20 text-[#86f2e4] border border-[#86f2e4]/40">
                  gemini-3.1-flash-live-preview
                </span>
              </div>
              <p className="text-[12px] text-[#9ca3af]">Real-time bidirectional 311 municipal audio assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9ca3af] hover:text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Live Audio Visualizer Pulse */}
        <div className="py-6 flex flex-col items-center justify-center bg-[#0d1322] rounded-xl my-4 border border-[#2b354d]">
          <div className="relative flex items-center justify-center w-28 h-28 mb-3">
            {/* Animated Rings */}
            {isListening && (
              <>
                <div
                  className="absolute inset-0 rounded-full border border-[#86f2e4]/40 animate-ping"
                  style={{ animationDuration: '2s' }}
                />
                <div
                  className="absolute rounded-full bg-[#86f2e4]/10 transition-all duration-100"
                  style={{
                    inset: `${Math.max(0, 20 - audioLevel / 3)}px`,
                    transform: `scale(${1 + audioLevel / 100})`
                  }}
                />
              </>
            )}

            <button
              onClick={isListening ? stopVoiceCapture : startVoiceCapture}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                isListening
                  ? 'bg-rose-500 text-white shadow-rose-500/40 ring-4 ring-rose-400/30'
                  : 'bg-[#86f2e4] text-[#003833] hover:bg-[#a6f7ee] shadow-[#86f2e4]/30'
              }`}
            >
              <span className="material-symbols-outlined text-[36px]">
                {isListening ? 'mic' : 'mic_none'}
              </span>
            </button>
          </div>

          <div className="text-center">
            <span className="text-[13.5px] font-semibold text-white">
              {isListening ? 'Listening to your voice...' : isProcessing ? 'AI Dispatcher generating response...' : 'Tap Mic to Speak with 311 AI'}
            </span>
            <div className="text-[11.5px] text-[#86f2e4] mt-0.5">
              {isListening ? `Live input level: ${audioLevel}%` : 'Hands-free voice triage powered by Gemini Live API'}
            </div>
          </div>
        </div>

        {/* Transcript Conversation Thread */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#0d1322]/60 rounded-xl border border-[#2b354d] min-h-[160px] max-h-[220px]">
          {transcriptHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-semibold text-[#9ca3af]">
                  {item.sender === 'user' ? 'You' : '311 Live AI'}
                </span>
                <span className="text-[10px] text-[#6b7280]">• {item.time}</span>
              </div>
              <div
                className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed max-w-[85%] ${
                  item.sender === 'user'
                    ? 'bg-[#006a61] text-white rounded-br-none'
                    : 'bg-[#1e273d] text-[#e5e7eb] rounded-bl-none border border-[#374151]'
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}
          {currentSpeech && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-[#86f2e4] mb-1">Speaking...</span>
              <div className="px-3.5 py-2 rounded-xl text-[12.5px] bg-[#006a61]/60 text-white italic">
                {currentSpeech}
              </div>
            </div>
          )}
        </div>

        {/* Quick Voice Prompts */}
        <div className="mt-4 pt-3 border-t border-[#2b354d]">
          <div className="text-[11.5px] text-[#9ca3af] mb-2 font-medium">Try saying:</div>
          <div className="flex flex-wrap gap-2">
            {[
              'Report an overflowing storm drain on 5th Ave',
              'Check status of water main repair #CW-2023-894',
              'What is the emergency hotline for hazardous gas leaks?'
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendVoiceInput(prompt)}
                className="text-[12px] bg-[#1e273d] hover:bg-[#2b354d] text-[#86f2e4] px-3 py-1.5 rounded-lg border border-[#374151] transition-colors text-left"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
