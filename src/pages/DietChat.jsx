import React, { useState } from 'react';
import ChatUI from '../components/ChatUI';
import { sendMessageToDietAI } from '../services/dietChatService';

const DietChat = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm your AI Diet Nutritionist. How can I help you with your eating habits today? (e.g. 'What should I eat today?', 'Suggest a high protein diet')" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSendMessage = async (text) => {
        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setIsLoading(true);
        setError(null);

        try {
            const aiResponse = await sendMessageToDietAI(text);
            setMessages([...newMessages, { role: 'ai', content: aiResponse }]);
        } catch (err) {
            console.error(err);
            setError("Failed to get a response. Please try again later.");
            setMessages([...newMessages, { role: 'ai', content: "Sorry, I encountered an error while processing your request. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 border-t-0 p-6 md:p-8 overflow-hidden">
            <div className="max-w-4xl w-full mx-auto flex flex-col h-full animate-fade-in-up flex-1 min-h-0">
                <div className="mb-6 flex-shrink-0">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-calm-teal to-calm-blue mb-2">Personalized Diet Chat</h1>
                    <p className="text-white/60">Get AI-powered diet suggestions tailored to your specific body metrics.</p>
                </div>
                
                <div className="flex-1 min-h-0 bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-glass-border">
                    <ChatUI 
                        messages={messages} 
                        isLoading={isLoading} 
                        onSendMessage={handleSendMessage} 
                        title="AI Dietitian"
                    />
                </div>
            </div>
        </div>
    );
};

export default DietChat;
