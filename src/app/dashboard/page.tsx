'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, Lesson } from '@/store/useStore';
import { generateDailyLesson } from '@/services/aiService';
import { NavigationBar } from '@/components/NavigationBar';

export default function Dashboard() {
    const router = useRouter();
    const { isHydrated, hasCompletedOnboarding, apiKey, userProfile, lessons, addLesson, markLessonDone, streakCalendar } = useStore();

    const [loading, setLoading] = useState(true);
    const [todayLesson, setTodayLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        if (!isHydrated) return;

        if (!hasCompletedOnboarding || !apiKey || !userProfile) {
            router.push('/');
            return;
        }

        const loadLesson = async () => {
            const today = new Date().toISOString().split('T')[0];
            const existingLesson = lessons.find(l => l.date === today);

            if (existingLesson) {
                setTodayLesson(existingLesson);
                setLoading(false);
            } else {
                try {
                    const generated = await generateDailyLesson(apiKey, userProfile);
                    const newLesson: Lesson = {
                        id: Date.now().toString(),
                        date: today,
                        ...generated,
                        category: userProfile.focus
                    };
                    addLesson(newLesson);
                    setTodayLesson(newLesson);
                } catch (error) {
                    console.error("AI Gen Failed:", error);
                    setTodayLesson({
                        id: 'err', date: today, category: 'error',
                        title: 'Connection Lost',
                        content: 'Your mentor could not reach the servers. Please check your API key or connection.'
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        loadLesson();

        // Auto-mark as done when viewing
        const todayStr = new Date().toISOString().split('T')[0];
        if (!streakCalendar.includes(todayStr)) {
            setTimeout(() => markLessonDone(todayStr), 3000); // mark done after 3 secs of reading
        }

    }, [isHydrated, hasCompletedOnboarding, apiKey, userProfile, lessons, router, addLesson, markLessonDone, streakCalendar]);

    if (!isHydrated || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-black text-white selection:bg-white/20 flex flex-col items-center pb-24">
            {/* Ambient Background Blur for Dashboard */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-zinc-900/10 blur-[150px] rounded-full pointer-events-none" />

            <NavigationBar />

            <main className="flex-1 w-full max-w-6xl px-4 md:px-8 pt-28 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10 w-full">

                <div className="flex justify-between items-end mb-8 px-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Morning, {userProfile?.name}</h1>
                        <p className="text-zinc-500 text-sm font-medium">Your daily synchronization is ready.</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-zinc-500 text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Main Transmission (Hero Card) - Spans 2 cols on lg */}
                    <div className="lg:col-span-2 flex flex-col h-full bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-white/10 transition-all duration-700 relative overflow-hidden group">

                        {/* Hover internal glow */}
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                        <div className="flex justify-between mb-8">
                            <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold flex items-center gap-3">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                                </span>
                                Daily Transmission
                            </p>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium text-zinc-400 uppercase tracking-wide">
                                {todayLesson?.category || userProfile?.focus} Focus
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-600">
                            {todayLesson?.title}
                        </h2>

                        <div className="prose prose-invert max-w-none relative z-10 flex-grow">
                            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                                {todayLesson?.content}
                            </p>
                        </div>
                    </div>

                    {/* Column 2: Context / Stats Side Panel */}
                    <div className="flex flex-col gap-6 lg:h-[600px]">

                        {/* Identity Context Card */}
                        <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-6 hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-300 group flex-1">
                            <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mb-4">Current Directive</p>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-zinc-600 mb-1">Overcoming</p>
                                    <h3 className="text-lg font-medium text-white truncate group-hover:text-amber-100 transition-colors">
                                        {userProfile?.struggle}
                                    </h3>
                                </div>
                                <div className="h-px w-full bg-white/5" />
                                <div>
                                    <p className="text-xs text-zinc-600 mb-1">Modeling</p>
                                    <h3 className="text-lg font-medium text-white group-hover:text-blue-100 transition-colors">
                                        {userProfile?.admires}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Consistency / Streak Card */}
                        <div className="bg-zinc-900/30 font-mono backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-6 hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-300 group relative overflow-hidden cursor-pointer" onClick={() => router.push('/calendar')}>

                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 blur-2xl rounded-bl-full group-hover:bg-white/10 transition-colors duration-500" />

                            <p className="text-zinc-500 uppercase tracking-tight text-[10px] font-bold mb-2">Resilience Protocol</p>

                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
                                    {streakCalendar.length}
                                </span>
                                <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Days</span>
                            </div>

                            <p className="text-xs text-zinc-400 font-sans group-hover:text-white transition-colors duration-300">
                                View Consistency Log →
                            </p>
                        </div>

                        {/* Screen Time Analytics Teaser */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-xl border border-indigo-500/20 rounded-[1.5rem] p-6 hover:border-indigo-400/40 transition-all duration-300 group cursor-pointer flex-1 flex flex-col justify-between" onClick={() => router.push('/analytics')}>
                            <div>
                                <p className="text-indigo-400/80 uppercase tracking-widest text-[10px] font-bold mb-3 flex items-center justify-between">
                                    Digital Mirror
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                </p>
                                <h3 className="text-white font-medium mb-1">Analyze Screen Time</h3>
                                <p className="text-xs text-indigo-200/50 mb-3 line-clamp-2">
                                    Is your daily consumption aligning with your goal of overcoming {userProfile?.struggle}?
                                </p>
                            </div>
                            <button className="w-full py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 hover:text-white transition-all">
                                Open Analytics Engine
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
