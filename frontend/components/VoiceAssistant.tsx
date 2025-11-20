// components/VoiceAssistant.tsx

'use client';

import { useState, useRef, useEffect } from 'react';

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        fetchResponse(spokenText);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const fetchResponse = async (prompt: string) => {
    setResponse('🤔 Thinking...');
    try {
      const res = await fetch('/api/dao-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const reply = data.response || 'No response received.';
      setResponse(reply);

      const utter = new SpeechSynthesisUtterance(reply);
      speechSynthesis.speak(utter);
    } catch (err) {
      console.error(err);
      setResponse('⚠️ Error getting response.');
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 mt-10 text-black border border-gray-200">
      <h2 className="text-xl font-bold mb-4">🎙️ Dream DAO Voice Assistant</h2>

      <button
        onClick={handleMicClick}
        className={`w-full py-3 rounded transition-colors duration-200 ${
          isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-bold`}
        aria-label={isRecording ? 'Stop voice assistant' : 'Start voice assistant'}
      >
        {isRecording ? '🛑 Stop Listening' : '🎤 Start Talking'}
      </button>

      {transcript && (
        <div className="mt-4">
          <p className="text-gray-600 text-sm">🗣 You said:</p>
          <p className="font-medium">{transcript}</p>
        </div>
      )}

      {response && (
        <div className="mt-4">
          <p className="text-gray-600 text-sm">🤖 Assistant says:</p>
          <p className="font-medium">{response}</p>
        </div>
      )}
    </div>
  );
}
