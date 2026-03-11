import React from 'react';
import { Brain, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

const InsightsPanel = () => {
  const insights = [
    {
      type: 'achievement',
      title: 'Great Progress!',
      description: 'You\'ve maintained good hydration for 5 days straight.',
      icon: TrendingUp,
      color: 'text-calm-teal',
      bgColor: 'bg-calm-teal/20'
    },
    {
      type: 'suggestion',
      title: 'Sleep Tip',
      description: 'Try going to bed 30 minutes earlier for optimal recovery.',
      icon: Lightbulb,
      color: 'text-calm-purple',
      bgColor: 'bg-calm-purple/20'
    },
    {
      type: 'alert',
      title: 'Activity Reminder',
      description: 'You\'re 1,500 steps away from your daily goal.',
      icon: AlertCircle,
      color: 'text-calm-pink',
      bgColor: 'bg-calm-pink/20'
    }
  ];

  const aiSuggestions = [
    'Consider adding more vegetables to your meals for better nutrition.',
    'Your mood patterns suggest evening walks might be beneficial.',
    'Water intake is good, but try to spread it throughout the day.',
    'Sleep quality improves with consistent bedtime routines.'
  ];

  return (
    <div className="space-y-4">
      {/* AI Insights Header */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-r from-calm-teal to-calm-purple rounded-lg">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Insights</h3>
            <p className="text-xs text-white/60">Personalized health recommendations</p>
          </div>
        </div>
      </div>

      {/* Insights Cards */}
      {insights.map((insight, index) => {
        const Icon = insight.icon;
        return (
          <div 
            key={index}
            className="glass-card p-4 hover:scale-105 transition-transform duration-200"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="flex gap-3">
              <div className={`p-2 ${insight.bgColor} rounded-lg flex-shrink-0`}>
                <Icon size={16} className={insight.color} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm mb-1">{insight.title}</h4>
                <p className="text-xs text-white/70">{insight.description}</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* AI Suggestions */}
      <div className="glass-card p-4">
        <h4 className="font-medium text-white text-sm mb-3">Wellness Suggestions</h4>
        <div className="space-y-2">
          {aiSuggestions.map((suggestion, index) => (
            <div key={index} className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-calm-teal rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-xs text-white/70 leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Health Score */}
      <div className="glass-card p-4 bg-gradient-to-br from-calm-teal/10 to-calm-purple/10">
        <h4 className="font-medium text-white text-sm mb-3">Today's Wellness Score</h4>
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-glass-border flex items-center justify-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-calm-teal to-calm-purple bg-clip-text text-transparent">
                85
              </span>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-calm-teal/30 border-t-calm-teal animate-spin-slow" />
          </div>
        </div>
        <p className="text-xs text-center text-white/60 mt-3">Excellent progress!</p>
      </div>
    </div>
  );
};

export default InsightsPanel;
