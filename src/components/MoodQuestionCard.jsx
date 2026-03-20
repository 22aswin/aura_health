import React from 'react';
import { Brain, CheckCircle } from 'lucide-react';
import { AnswerOptions } from '../data/moodQuestions';

const MoodQuestionCard = ({ question, sessionType = 'morning', onAnswer, isLoading }) => {
    const getSessionTitle = (sessionType) => {
        switch (sessionType) {
            case 'morning':
                return 'Morning Check-in';
            case 'afternoon':
                return 'Afternoon Check-in';
            case 'evening':
                return 'Evening Reflection';
            default:
                return 'Daily Check-in';
        }
    };

    const getSessionProgress = (sessionType) => {
        switch (sessionType) {
            case 'morning':
                return ['🌅', '⏸️', '⏸️'];
            case 'afternoon':
                return ['✅', '🌞', '⏸️'];
            case 'evening':
                return ['✅', '✅', '🌙'];
            default:
                return ['⏸️', '⏸️', '⏸️'];
        }
    };

    const progressIcons = getSessionProgress(sessionType);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
            <div className="glass-card p-8 w-full max-w-2xl text-center">
                <div className="flex items-center justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-glow">
                        <Brain size={40} className="text-slate-900" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                    {getSessionTitle(sessionType)}
                </h2>

                <div className="flex justify-center gap-4 mb-8">
                    {progressIcons.map((icon, index) => (
                        <div
                            key={index}
                            className={`text-2xl ${icon === '✅' ? 'opacity-100' : 'opacity-40'}`}
                        >
                            {icon}
                        </div>
                    ))}
                </div>

                <div className="mb-8">
                    <p className="text-xl text-white/90 mb-6 font-medium">
                        {question.question}
                    </p>

                    <div className="flex justify-center items-center gap-2 text-sm text-white/60">
                        <span>Rate how you feel:</span>
                        <span className="text-calm-teal">Very Low</span>
                        <span>→</span>
                        <span className="text-purple-400">Very High</span>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-8">
                    {AnswerOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => !isLoading && onAnswer(option.value)}
                            disabled={isLoading}
                            className={`group relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${isLoading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 hover:border-purple-500/50'
                                }`}
                        >
                            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                {option.emoji}
                            </div>
                            <div className="text-xs text-white/70 group-hover:text-white transition-colors">
                                {option.label}
                            </div>
                            <div className="text-xs text-white/50 mt-1">
                                {option.value}
                            </div>
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-purple-400 p-4 bg-purple-500/10 rounded-xl">
                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving your response...</span>
                    </div>
                )}

                <div className="text-xs text-white/40 mt-4">
                    Your response helps track your emotional wellness patterns
                </div>
            </div>
        </div>
    );
};

export default MoodQuestionCard;
