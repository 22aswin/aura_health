import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MorningQuestions, AfternoonQuestions, EveningQuestions } from '../data/moodQuestions';
import MoodQuestionCard from '../components/MoodQuestionCard';
import { saveMoodResponse, checkSessionCompleted, getCurrentSession } from '../services/moodService';
import { ArrowLeft, CheckCircle, Activity, Heart, Sparkles, AlertCircle } from 'lucide-react';

const MoodCheck = () => {
    const navigate = useNavigate();

    // Core States
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get a random question for the current session
    const getRandomQuestion = (sessionType) => {
        let questions;
        switch (sessionType) {
            case 'morning':
                questions = MorningQuestions;
                break;
            case 'afternoon':
                questions = AfternoonQuestions;
                break;
            case 'evening':
                questions = EveningQuestions;
                break;
            default:
                questions = MorningQuestions;
        }

        const randomIndex = Math.floor(Math.random() * questions.length);
        return { ...questions[randomIndex], sessionType };
    };

    useEffect(() => {
        const initializeMoodCheck = async () => {
            try {
                const session = getCurrentSession();
                const isCompleted = await checkSessionCompleted(session);
                setIsAlreadyCompleted(isCompleted);

                if (!isCompleted) {
                    const question = getRandomQuestion(session);
                    setCurrentQuestion(question);
                }
            } catch (error) {
                console.error('Error initializing mood check:', error);
            } finally {
                setIsLoadingInit(false);
            }
        };

        initializeMoodCheck();
    }, []);

    const handleAnswer = async (score) => {
        if (!currentQuestion || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await saveMoodResponse(
                currentQuestion.id,
                score,
                currentQuestion.sessionType
            );
            setIsAlreadyCompleted(true);
        } catch (error) {
            console.error('Error saving mood response:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const getSessionIcon = (sessionType) => {
        switch (sessionType) {
            case 'morning':
                return '🌅';
            case 'afternoon':
                return '🌞';
            case 'evening':
                return '🌙';
            default:
                return '📅';
        }
    };

    if (isLoadingInit) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
                <div className="glass-card p-8 w-full max-w-2xl text-center">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-calm-teal to-calm-blue rounded-2xl shadow-glow">
                            <Activity size={40} className="text-slate-900" />
                        </div>
                    </div>
                    <div className="w-16 h-16 border-4 border-calm-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white/70 mt-4">Loading your mood check...</p>
                </div>
            </div>
        );
    }

    if (isAlreadyCompleted) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
                <div className="glass-card p-8 w-full max-w-2xl text-center">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-glow">
                            <CheckCircle size={40} className="text-slate-900" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
                        Check-in Complete!
                    </h2>

                    <div className="text-6xl mb-4">{getSessionIcon(currentQuestion?.sessionType || 'morning')}</div>

                    <p className="text-white/70 mb-8">
                        Your {currentQuestion?.sessionType || 'daily'} mood check has been recorded. Thank you for taking care of your emotional wellness!
                    </p>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-calm-teal to-calm-blue text-slate-900 shadow-glow"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (currentQuestion) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
                <div className="glass-card p-2 w-full max-w-2xl mb-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors p-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                </div>

                <MoodQuestionCard
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    isLoading={isSubmitting}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
            <div className="glass-card p-8 w-full max-w-2xl text-center">
                <h2 className="text-2xl font-bold text-white mb-4">No Check-in Available</h2>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-calm-teal to-calm-blue text-slate-900 shadow-glow"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default MoodCheck;