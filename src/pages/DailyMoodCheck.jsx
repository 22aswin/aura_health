import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodQuestionCard from '../components/MoodQuestionCard';
import { 
  getCurrentSession, 
  checkIfSessionCompletedToday, 
  saveMoodResponse, 
  generateDailyMoodAnalysis,
  getTodayMoodData 
} from '../services/moodService';
import { MorningQuestions, AfternoonQuestions, EveningQuestions } from '../data/moodQuestions';
import { Brain, CheckCircle, Calendar } from 'lucide-react';

const DailyMoodCheck = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [dailyAnalysis, setDailyAnalysis] = useState(null);
  const navigate = useNavigate();

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
        const sessionType = getCurrentSession();
        const isCompleted = await checkIfSessionCompletedToday(sessionType);
        
        if (isCompleted) {
          setSessionCompleted(true);
          
          // Check if we should generate daily analysis (after evening session)
          if (sessionType === 'evening') {
            const todayData = await getTodayMoodData();
            if (todayData.length >= 3) {
              const analysis = await generateDailyMoodAnalysis();
              if (analysis) {
                setDailyAnalysis(analysis);
              }
            }
          }
        } else {
          const question = getRandomQuestion(sessionType);
          setCurrentQuestion(question);
        }
      } catch (error) {
        console.error('Error initializing mood check:', error);
      } finally {
        setIsLoading(false);
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

      // Check if this was the evening session and generate daily analysis
      if (currentQuestion.sessionType === 'evening') {
        const analysis = await generateDailyMoodAnalysis();
        if (analysis) {
          setDailyAnalysis(analysis);
        }
      }

      setSessionCompleted(true);
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

  const getNextSessionTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '12:00 PM (Afternoon)';
    if (hour < 18) return '6:00 PM (Evening)';
    return '5:00 AM (Morning)';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
        <div className="glass-card p-8 w-full max-w-2xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-glow">
              <Brain size={40} className="text-slate-900" />
            </div>
          </div>
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/70 mt-4">Loading your mood check...</p>
        </div>
      </div>
    );
  }

  if (sessionCompleted) {
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

          <p className="text-white/70 mb-8">
            Your {getCurrentSession()} mood check has been recorded. Thank you for taking care of your emotional wellness!
          </p>

          <div className="text-sm text-white/50 mb-8">
            Next check-in available at {getNextSessionTime()}
          </div>

          {dailyAnalysis && (
            <div className="mt-8 p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center justify-center gap-2">
                <Calendar size={20} />
                Daily Mood Insight
              </h3>
              <div className="text-white/80 text-left leading-relaxed">
                {dailyAnalysis.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="mt-8 px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-calm-teal to-calm-blue text-slate-900 shadow-glow"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (currentQuestion) {
    return (
      <MoodQuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        isLoading={isSubmitting}
      />
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

export default DailyMoodCheck;
