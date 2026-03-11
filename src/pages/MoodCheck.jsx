import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { panasQuestions } from '../data/panasQuestions';
import MoodQuestionCard from '../components/MoodQuestionCard';
import { saveMoodAssessment, checkSessionCompleted } from '../services/moodService';
import { ArrowLeft, CheckCircle, Activity, Heart, Sparkles, AlertCircle } from 'lucide-react';

const MoodCheck = () => {
    const navigate = useNavigate();

    // Core States
    const [sessionType, setSessionType] = useState('');
    const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    // Assessment States
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initSession = async () => {
            try {
                // 1. Determine Session Type
                const hour = new Date().getHours();
                let currentSession = '';
                if (hour >= 5 && hour < 12) currentSession = 'morning';
                else if (hour >= 12 && hour < 18) currentSession = 'afternoon';
                else currentSession = 'evening';

                setSessionType(currentSession);

                // 2. Check if Complete
                const completed = await checkSessionCompleted(currentSession);
                if (completed) {
                    setIsAlreadyCompleted(true);
                    setIsLoadingInit(false);
                    return;
                }

                // 3. Fetch 5 Questions from Gemini
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (!apiKey) throw new Error("API Key Missing");

                const prompt = `You are a wellness assistant selecting PANAS mood questions.
Session type: ${currentSession}
From the provided question pool, select exactly 5 questions that best evaluate the user's emotional state for this time of day. Try to balance positive and negative.
Return ONLY a valid JSON array of 5 integers representing the question IDs. No markdown, no text.
Pool: ${JSON.stringify(panasQuestions.map(q => ({ id: q.id, emotion: q.emotion, type: q.type })))}`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                });

                if (!response.ok) throw new Error("Failed to fetch questions");

                const data = await response.json();
                let questionIds = [];
                try {
                    const textResp = data.candidates[0].content.parts[0].text;
                    questionIds = JSON.parse(textResp);
                } catch (e) {
                    // Fallback to random 5 if JSON parsing fails
                    questionIds = [1, 5, 12, 16, 20];
                }

                // Map IDs back to objects safely
                const mappedQuestions = panasQuestions.filter(q => questionIds.includes(q.id)).slice(0, 5);

                // Absolute fallback in case Gemini returned bad data or IDs
                if (mappedQuestions.length < 5) {
                    setSelectedQuestions(panasQuestions.slice(0, 5));
                } else {
                    setSelectedQuestions(mappedQuestions);
                }

            } catch (err) {
                console.error("Initialization Error:", err);
                setError("Failed to load your session. Please try again.");
            } finally {
                setIsLoadingInit(false);
            }
        };

        initSession();
    }, []);

    const fetchGeminiReflection = async (paScore, naScore) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const prompt = `A user completed a PANAS mood check during the ${sessionType}.
Positive Affect: ${paScore}
Negative Affect: ${naScore}
Explain the emotional state briefly and provide exactly 3 supportive wellness suggestions. Keep the response entirely in valid JSON format. Provide two keys: "summary" (string) and "suggestions" (Array of 3 strings).`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error("AI Integration Failed");
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
    };

    const handleAnswer = async (questionId, score) => {
        const newAnswers = [...answers, { questionId, score }];

        if (currentIdx < selectedQuestions.length - 1) {
            setAnswers(newAnswers);
            setCurrentIdx(currentIdx + 1);
        } else {
            // Processing
            setAnswers(newAnswers);
            setIsSummarizing(true);
            setError(null);

            try {
                let paScore = 0;
                let naScore = 0;
                const questionsAsked = selectedQuestions.map(q => q.id);

                newAnswers.forEach(ans => {
                    const question = selectedQuestions.find(q => q.id === ans.questionId);
                    if (question.type === 'positive') paScore += ans.score;
                    else naScore += ans.score;
                });

                // Fetch AI Reflection natively
                const aiResponse = await fetchGeminiReflection(paScore, naScore);

                // Store to Firestore
                await saveMoodAssessment({
                    sessionType,
                    questionsAsked,
                    positiveAffect: paScore,
                    negativeAffect: naScore,
                    answers: newAnswers,
                    aiSummary: aiResponse.summary,
                    suggestions: aiResponse.suggestions
                });

                setResults({ paScore, naScore, ...aiResponse });

            } catch (err) {
                console.error("Mood Check End Error:", err);
                setError("Failed to save your logic.");
            } finally {
                setIsSummarizing(false);
            }
        }
    };

    if (isLoadingInit) {
        return (
            <div className="flex flex-col h-screen bg-slate-900 items-center justify-center p-6 text-center">
                <div className="relative w-24 h-24 mb-6 animate-spin-slow">
                    <div className="absolute inset-0 border-4 border-calm-teal/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-calm-teal rounded-full" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Preparing your session...</h2>
                <p className="text-white/60">Aura is customizing questions for your {sessionType || 'current part of the day'}.</p>
            </div>
        );
    }

    if (isAlreadyCompleted) {
        return (
            <div className="flex h-screen w-full bg-slate-900 items-center justify-center p-6">
                <div className="max-w-md w-full glass-card p-10 text-center animate-fade-in-up">
                    <CheckCircle className="text-calm-teal w-16 h-16 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">You're All Set</h2>
                    <p className="text-white/70 mb-8 leading-relaxed">
                        You have already completed your {sessionType} mood check-in. Check back during the next session to continue tracking your emotional wellness!
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-calm-teal/20 text-calm-teal font-semibold py-4 rounded-xl hover:bg-calm-teal/30 transition-colors border border-calm-teal/50"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (isSummarizing) {
        return (
            <div className="flex flex-col h-screen bg-slate-900 items-center justify-center p-6 text-center">
                <div className="relative w-32 h-32 mb-8 animate-spin-slow">
                    <div className="absolute inset-0 border-4 border-calm-teal/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-calm-teal rounded-full" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                        <Sparkles className="text-calm-purple w-12 h-12" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Aura is analyzing your mood...</h2>
                <p className="text-white/60">Generating personalized wellness suggestions.</p>
            </div>
        );
    }

    if (results) {
        return (
            <div className="flex h-screen w-full bg-slate-900 overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full p-8 pt-12 space-y-8 animate-fade-in-up">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span>Return to Dashboard</span>
                    </button>

                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-white mb-4">{sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Assessment Complete</h1>
                        <p className="text-white/70">Here is your personalized psychological breakdown.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
                            <Activity className="text-calm-teal mb-4 w-12 h-12" />
                            <h3 className="text-xl font-bold text-white mb-2">Positive Affect</h3>
                            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-calm-teal to-calm-blue mb-4">{results.paScore}<span className="text-lg text-white/30 font-medium">/25</span></p>
                            <p className="text-sm text-white/60">Energy, Concentration, & Engagement</p>
                        </div>
                        <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
                            <Heart className="text-calm-purple mb-4 w-12 h-12" />
                            <h3 className="text-xl font-bold text-white mb-2">Negative Affect</h3>
                            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-calm-purple to-calm-pink mb-4">{results.naScore}<span className="text-lg text-white/30 font-medium">/25</span></p>
                            <p className="text-sm text-white/60">Distress, Lethargy, & Tension</p>
                        </div>
                    </div>

                    <div className="glass-card p-8 mt-8 border border-calm-teal/30 relative overflow-hidden">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-6"><Sparkles className="text-calm-teal" /> Aura AI Interpretation</h3>
                        <p className="text-lg text-white/90 leading-relaxed mb-8">{results.summary}</p>
                        <h4 className="text-lg font-bold text-white mb-4">Wellness Suggestions</h4>
                        <ul className="space-y-4">
                            {results.suggestions.map((suggestion, i) => (
                                <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-glass-border">
                                    <CheckCircle className="text-calm-teal flex-shrink-0 mt-0.5" size={20} />
                                    <span className="text-white/80">{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            <div className="absolute top-8 left-8 z-20">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors glass-card px-4 py-2 rounded-xl border border-glass-border bg-slate-900/50 hover:bg-slate-800">
                    <ArrowLeft size={20} />
                    <span>Exit Assessment</span>
                </button>
            </div>

            <div className="w-full flex items-center justify-center p-6 relative z-10">
                {error && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-calm-pink/20 border border-calm-pink/50 text-white px-6 py-3 rounded-xl flex items-center gap-3 animate-fade-in-up">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}
                {selectedQuestions.length > 0 && (
                    <MoodQuestionCard
                        question={selectedQuestions[currentIdx]}
                        onAnswer={handleAnswer}
                        currentIndex={currentIdx}
                        totalIndex={selectedQuestions.length}
                    />
                )}
            </div>
        </div>
    );
};

export default MoodCheck;
