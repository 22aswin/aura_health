import React, { useState } from 'react';
import { Droplets, Moon, Activity, Heart, Plus, Minus } from 'lucide-react';

const HealthCards = () => {
  const [waterIntake, setWaterIntake] = useState(6);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [steps, setSteps] = useState(8432);
  const [mood, setMood] = useState('good');

  const WaterTracker = () => (
    <div className="floating-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-calm-blue/20 rounded-lg">
            <Droplets size={20} className="text-calm-blue" />
          </div>
          <h3 className="font-semibold text-white">Water Intake</h3>
        </div>
        <span className="text-sm text-calm-teal">{waterIntake}/8 glasses</span>
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-glass-border rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-calm-blue to-calm-teal h-2 rounded-full transition-all duration-300"
            style={{ width: `${(waterIntake / 8) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
          className="flex-1 py-2 px-3 bg-glass-white hover:bg-glass-border rounded-lg transition-colors"
        >
          <Minus size={16} className="mx-auto text-white/70" />
        </button>
        <button
          onClick={() => setWaterIntake(Math.min(8, waterIntake + 1))}
          className="flex-1 py-2 px-3 bg-glass-white hover:bg-glass-border rounded-lg transition-colors"
        >
          <Plus size={16} className="mx-auto text-white/70" />
        </button>
      </div>
    </div>
  );

  const SleepTracker = () => (
    <div className="floating-card p-6" style={{ animationDelay: '0.5s' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-calm-purple/20 rounded-lg">
            <Moon size={20} className="text-calm-purple" />
          </div>
          <h3 className="font-semibold text-white">Sleep</h3>
        </div>
        <span className="text-sm text-calm-purple">{sleepHours} hours</span>
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-glass-border rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-calm-purple to-calm-pink h-2 rounded-full transition-all duration-300"
            style={{ width: `${(sleepHours / 8) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="text-xs text-white/60">
        Quality: Good | Bedtime: 11:00 PM
      </div>
    </div>
  );

  const ActivityTracker = () => (
    <div className="floating-card p-6" style={{ animationDelay: '1s' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-calm-pink/20 rounded-lg">
            <Activity size={20} className="text-calm-pink" />
          </div>
          <h3 className="font-semibold text-white">Physical Activity</h3>
        </div>
        <span className="text-sm text-calm-pink">{steps.toLocaleString()}</span>
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-glass-border rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-calm-pink to-calm-indigo h-2 rounded-full transition-all duration-300"
            style={{ width: `${(steps / 10000) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="text-xs text-white/60">
        Goal: 10,000 steps | Calories: 420
      </div>
    </div>
  );

  const MoodTracker = () => (
    <div className="floating-card p-6" style={{ animationDelay: '1.5s' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-calm-teal/20 rounded-lg">
            <Heart size={20} className="text-calm-teal" />
          </div>
          <h3 className="font-semibold text-white">Mood</h3>
        </div>
        <span className="text-sm text-calm-teal capitalize">{mood}</span>
      </div>
      
      <div className="flex gap-2">
        {['stressed', 'okay', 'good', 'great'].map((moodOption) => (
          <button
            key={moodOption}
            onClick={() => setMood(moodOption)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs transition-all ${
              mood === moodOption 
                ? 'bg-calm-teal text-white' 
                : 'bg-glass-white text-white/70 hover:bg-glass-border'
            }`}
          >
            {moodOption}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <WaterTracker />
      <SleepTracker />
      <ActivityTracker />
      <MoodTracker />
    </div>
  );
};

export default HealthCards;
