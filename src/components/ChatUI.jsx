import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

const ChatUI = ({ messages, isLoading, onSendMessage, title = "AI Assistant" }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-glass-border overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="bg-slate-800/80 p-4 border-b border-glass-border flex items-center gap-3">
                <div className="p-2 bg-calm-teal/20 text-calm-teal rounded-lg">
                    <Bot size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-white">{title}</h3>
                    <p className="text-xs text-white/60">Powered by Aura AI</p>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-white/40">
                        <p>No messages yet. Start asking a question!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-calm-teal/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot size={16} className="text-calm-teal" />
                                </div>
                            )}
                            <div className={`max-w-[75%] p-4 rounded-2xl ${
                                msg.role === 'user' 
                                ? 'bg-gradient-to-br from-calm-teal to-calm-blue text-slate-900 rounded-tr-none shadow-glow' 
                                : 'glass-card border border-glass-border text-white rounded-tl-none whitespace-pre-wrap'
                            }`}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                                    <User size={16} className="text-white" />
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-calm-teal/20 flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                            <Bot size={16} className="text-calm-teal" />
                        </div>
                        <div className="glass-card border border-glass-border text-white p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                            <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-slate-800/50 border-t border-glass-border">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your diet..."
                        disabled={isLoading}
                        className="w-full bg-slate-900 border border-glass-border rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-calm-teal text-white placeholder-white/30 disabled:opacity-50"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-calm-teal text-slate-900 rounded-lg hover:bg-calm-teal/90 disabled:opacity-50 disabled:hover:bg-calm-teal transition-colors"
                    >
                        <Send size={20} className={input.trim() && !isLoading ? "translate-x-0.5 -translate-y-0.5" : ""} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatUI;
