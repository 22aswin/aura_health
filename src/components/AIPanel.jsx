import React, { useState, useEffect, useRef } from 'react';
import { Mic, Activity, Bot, Send } from 'lucide-react';
import { chatWithAura } from '../services/geminiService';

const AIPanel = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState([
        { text: "Hello! I am your Aura AI. How are you feeling today?", isUser: false }
    ]);
    const inputRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);

    // Audio Visualizer states
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        // ... (keep audio init)
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('Speech Recognition API not supported in this browser.');
        }
    }, []);

    const setupAudioVisualizer = async (stream) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        drawVisualizer();
    };

    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const analyser = analyserRef.current;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;

                const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, '#5EEAD4');
                gradient.addColorStop(1, '#C4B5FD');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, height / 2 - barHeight / 2, barWidth - 2, barHeight, 4);
                ctx.fill();

                x += barWidth;
            }
        };

        draw();
    };

    const toggleListening = async () => {
        if (isListening) {
            setIsListening(false);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) await audioContextRef.current.close();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsListening(true);
            await setupAudioVisualizer(stream);

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;

                recognition.onresult = (event) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(currentTranscript);
                };

                recognition.onend = () => {
                    setIsListening(false);
                    if (animationRef.current) cancelAnimationFrame(animationRef.current);
                    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                        audioContextRef.current.close().catch(console.error);
                    }

                    if (transcript) {
                        handleSendMessage(transcript);
                        setTranscript('');
                    }
                };

                recognition.start();
            }
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone.');
        }
    };

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Add User Message
        setMessages(prev => [...prev, { text, isUser: true }]);
        setIsTyping(true);

        try {
            // Call Live Gemini API
            const aiReplyString = await chatWithAura(text);

            // Add AI Response
            setMessages(prev => [...prev, { text: aiReplyString, isUser: false }]);
        } catch (error) {
            console.error("Chat failure:", error);
            setMessages(prev => [...prev, {
                text: "Aura AI is temporarily unavailable. Please try again.",
                isUser: false
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
            <div className="glass-card flex flex-col w-full max-w-4xl h-[85vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-glass-border flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-calm-teal to-calm-purple rounded-xl shadow-glow">
                            <Bot size={28} className="text-slate-900" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-calm-teal to-calm-blue">
                                Aura AI
                            </h2>
                            <p className="text-white/60 text-sm">Always here to support your journey</p>
                        </div>
                    </div>
                    {isListening && (
                        <div className="flex items-center gap-2 text-calm-pink animate-pulse">
                            <Activity size={20} />
                            <span className="text-sm font-semibold">Listening...</span>
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-4 rounded-2xl ${msg.isUser
                                ? 'bg-calm-teal text-slate-900 rounded-br-none shadow-glow'
                                : 'bg-glass-white border border-glass-border text-white/90 rounded-bl-none shadow-md'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {transcript && (
                        <div className="flex justify-end">
                            <div className="max-w-[75%] p-4 rounded-2xl bg-calm-teal/50 text-white/80 rounded-br-none italic border border-calm-teal/30">
                                {transcript}...
                            </div>
                        </div>
                    )}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="max-w-[75%] p-4 rounded-2xl bg-glass-white border border-glass-border text-white/50 rounded-bl-none shadow-md flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-calm-teal animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-calm-teal animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-calm-teal animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Visualizer & Input Area */}
                <div className="p-6 border-t border-glass-border bg-white/5 relative">

                    {/* Audio Canvas overlay when listening */}
                    <canvas
                        ref={canvasRef}
                        className={`absolute bottom-full left-0 w-full h-24 pointer-events-none transition-opacity duration-300 ${isListening ? 'opacity-100' : 'opacity-0'}`}
                        width={800}
                        height={100}
                    />

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleListening}
                            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 flex-shrink-0 relative ${isListening
                                ? 'bg-calm-pink text-white shadow-[0_0_30px_rgba(249,168,212,0.6)]'
                                : 'bg-glass-white border border-glass-border hover:bg-white/10 text-calm-teal'
                                }`}
                        >
                            {isListening && (
                                <div className="absolute inset-0 rounded-full animate-ping bg-calm-pink opacity-40"></div>
                            )}
                            <Mic size={24} />
                        </button>

                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Type your message or use voice..."
                                className="w-full bg-slate-900/50 border border-glass-border rounded-xl px-5 py-4 focus:outline-none focus:border-calm-teal text-white placeholder-white/30 transition-colors"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value) {
                                        handleSendMessage(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-calm-teal hover:text-white transition-colors"
                                onClick={() => {
                                    if (inputRef.current?.value) {
                                        handleSendMessage(inputRef.current.value);
                                        inputRef.current.value = '';
                                    }
                                }}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AIPanel;
