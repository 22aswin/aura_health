import React, { useState } from 'react';
import {
  LayoutDashboard,
  Heart,
  Camera,
  Bot,
  Settings,
  Droplets,
  Moon,
  Activity,
  Smile,
  MessageCircle,
  Dumbbell,
  Calendar
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mood', label: 'Mood Check', icon: Heart },
    { id: 'nutrition', label: 'Nutrition Scanner', icon: Camera },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'diet', label: 'Diet Chat', icon: MessageCircle },
    { id: 'exercise', label: 'Exercise Plan', icon: Dumbbell },
    { id: 'weekly', label: 'Weekly Report', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-glass-white backdrop-blur-lg border-r border-glass-border p-6 flex flex-col">
      <div className="mb-8 flex-shrink-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-calm-teal to-calm-purple bg-clip-text text-transparent">
          Wellness Hub
        </h1>
        <p className="text-white/60 text-sm mt-1">Your Health Companion</p>
      </div>

      <nav className="space-y-2 flex-1 overflow-y-auto pr-2 mb-4 scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
            >
              <Icon size={20} className="text-calm-teal" />
              <span className="font-medium">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="flex-shrink-0 mt-auto pt-2">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/80">Quick Stats</span>
            <span className="text-xs text-calm-teal">Today</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Droplets size={14} className="text-calm-blue" />
              <span className="text-xs text-white/70">Water: 6/8 glasses</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon size={14} className="text-calm-purple" />
              <span className="text-xs text-white/70">Sleep: 7.5 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-calm-pink" />
              <span className="text-xs text-white/70">Steps: 8,432</span>
            </div>
            <div className="flex items-center gap-2">
              <Smile size={14} className="text-calm-teal" />
              <span className="text-xs text-white/70">Mood: Good</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-glass-border"
        >
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
