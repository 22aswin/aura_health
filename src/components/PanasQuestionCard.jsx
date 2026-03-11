import React from 'react';
import { scoreOptions } from '../data/panasQuestions';

const PanasQuestionCard = ({ question, onAnswer, currentIndex, totalIndex }) => {
    return (
        <div className="w-full max-w-2xl mx-auto glass-card p-10 transform transition-all duration-500 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <span className="text-calm-teal font-medium text-lg">Question {currentIndex + 1} of {totalIndex}</span>
                <div className="flex gap-1">
                    {Array.from({ length: totalIndex }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-calm-teal shadow-glow' :
                                    i < currentIndex ? 'w-4 bg-calm-teal/50' : 'w-4 bg-glass-border'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
                    How <span className="text-transparent bg-clip-text bg-gradient-to-r from-calm-teal to-calm-purple">{question.emotion.toLowerCase()}</span> do you feel?
                </h2>
                <p className="text-xl text-white/70 italic">"{question.text}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {scoreOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onAnswer(question.id, option.value)}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-glass-border bg-slate-900/40 hover:bg-slate-800/60 hover:border-calm-teal transition-all duration-300 transform hover:scale-105 group"
                    >
                        <span className="text-4xl transform group-hover:-translate-y-2 transition-transform duration-300">{option.emoji}</span>
                        <span className="text-sm text-white/80 font-medium text-center">{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PanasQuestionCard;
