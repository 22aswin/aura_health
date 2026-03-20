import React, { useState, useEffect } from 'react';
import { generateWeeklyReport, fetchLatestWeeklyReport } from '../services/weeklyReportService';
import { Calendar, Target, Zap, ArrowLeft } from 'lucide-react';

const WeeklyReport = () => {
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInitial = async () => {
            const latest = await fetchLatestWeeklyReport();
            if (latest) {
                setReport(latest.aiSummary);
            }
        };
        loadInitial();
    }, []);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const newReport = await generateWeeklyReport();
            setReport(newReport.text);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to generate weekly report. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatMarkdown = (text) => {
        if (!text) return null;
        
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-calm-teal">$1</strong>');
        formatted = formatted.replace(/\*(.*?)\n/g, '<li class="ml-4 list-disc text-white/80">$1</li>\n');
        formatted = formatted.replace(/## (.*?)\n/g, '<h2 class="text-2xl font-bold text-white mt-8 mb-4 border-b border-glass-border pb-2">$1</h2>\n');
        formatted = formatted.replace(/# (.*?)\n/g, '<h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-calm-purple to-calm-pink mt-6 mb-4">$1</h1>\n');
        
        formatted = formatted.replace(/<\/li>\n<li/g, '</li><li');
        formatted = formatted.replace(/(<li.*<\/li>)/g, '<ul class="my-2 space-y-2">$1</ul>');

        return <div className="prose prose-invert max-w-none space-y-4" dangerouslySetInnerHTML={{ __html: formatted }} />;
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-900 overflow-y-auto p-6 md:p-8">
            <div className="max-w-4xl w-full mx-auto animate-fade-in-up space-y-8 pb-12">
                <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>
                
                <div className="text-center glass-card p-8 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl border border-glass-border">
                    <div className="w-16 h-16 mx-auto bg-calm-teal/20 rounded-2xl flex items-center justify-center mb-4 border border-calm-teal/30">
                        <Calendar className="text-calm-teal w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Weekly Wellness Report</h1>
                    <p className="text-white/70 max-w-2xl mx-auto text-lg mb-8">
                        Review your emotional and physical trends over the past 7 days, powered by Aura AI.
                    </p>

                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="px-10 py-4 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-calm-teal to-calm-blue shadow-glow transform transition-all shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 mx-auto"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                <span>Analyzing your week...</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5" />
                                <span>Generate New Report</span>
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-calm-pink/10 border border-calm-pink/30 rounded-xl text-calm-pink text-center animate-fade-in-up">
                        {error}
                    </div>
                )}

                {report && !isLoading && (
                    <div className="glass-card p-8 md:p-10 border border-glass-border animate-fade-in-up bg-slate-800/50 shadow-2xl">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-glass-border">
                            <Target className="text-calm-purple w-8 h-8" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Your Weekly Insights</h2>
                                <p className="text-white/60 text-sm">Actionable patterns inferred from your data</p>
                            </div>
                        </div>
                        <div className="text-white/90 leading-relaxed text-lg pb-10">
                            {formatMarkdown(report)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeeklyReport;
