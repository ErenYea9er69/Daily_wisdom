'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { NavigationBar } from '@/components/NavigationBar';
import { analyzeScreenTime } from '@/services/aiService';

export default function AnalyticsScreen() {
    const { isHydrated, apiKey, userProfile, screenTimeData } = useStore();
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);

    if (!isHydrated) return null;

    const totalMinutes = screenTimeData.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const handleAnalyze = async () => {
        if (!apiKey || !userProfile) return;
        setLoading(true);
        try {
            const result = await analyzeScreenTime(apiKey, userProfile, screenTimeData);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
            setAnalysis("Failed to connect to the engine for analysis.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-black text-white flex flex-col">
            {/* Ambient Background Blur */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

            <NavigationBar />

            <main className="flex-1 flex flex-col items-center px-6 pt-32 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10 w-full max-w-4xl mx-auto">

                <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-600 w-full text-center">
                    Digital Mirror
                </h1>
                <p className="text-zinc-500 mb-12 text-center max-w-md font-medium">
                    Face the reality of your time allocation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">

                    {/* Total Time Bento */}
                    <div className="md:col-span-1 bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 shadow-2xl hover:border-white/10 transition-colors duration-500 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs relative z-10">Total Active Screen Time</span>
                        <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-700 relative z-10">
                            {hours}h {minutes}m
                        </span>
                    </div>

                    {/* App List Bento */}
                    <div className="md:col-span-2 bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 shadow-2xl hover:border-white/10 transition-colors duration-500">
                        <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-6">Today's Consumption</h3>
                        <div className="space-y-4">
                            {screenTimeData.sort((a, b) => b.durationMinutes - a.durationMinutes).map((app, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${app.category === 'social' ? 'bg-red-400' : app.category === 'productivity' ? 'bg-green-400' : 'bg-blue-400'}`} />
                                        <span className="font-medium text-white/90 group-hover:text-white transition-colors">{app.appName}</span>
                                    </div>
                                    <span className="text-zinc-400 font-mono text-sm">
                                        {Math.floor(app.durationMinutes / 60)}h {app.durationMinutes % 60}m
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Analysis Section */}
                <div className="w-full bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative z-10">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Mentor Analysis</h2>
                            <p className="text-zinc-500 text-sm">Have your mentor review your time metrics.</p>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-4 font-bold bg-white text-black rounded-xl hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:bg-white/10 disabled:text-zinc-500 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {loading ? 'Analyzing...' : 'Analyze Behavior'}
                        </button>
                    </div>

                    {analysis && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10 border-t border-white/10 pt-8 mt-4">
                            <div className="prose prose-invert max-w-none">
                                <p className="text-lg text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                                    {analysis}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
