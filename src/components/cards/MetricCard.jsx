import React from 'react';

const MetricCard = ({ title, value, unit, icon: Icon, trend, colorClass = "text-calm-teal" }) => {
    return (
        <div className="glass-card p-5 flex flex-col gap-3 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-current ${colorClass} blur-xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg bg-glass-white ${colorClass}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`text-sm font-medium ${trend > 0 ? 'text-calm-teal' : 'text-calm-pink'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-white/60 text-sm font-medium">{title}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    <span className="text-white/50 text-sm">{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
