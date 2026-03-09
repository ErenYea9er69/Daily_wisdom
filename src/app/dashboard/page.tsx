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
        <div className="min-h-screen relative overflow-hidden bg-black text-white selection:bg-white/20 flex flex-col items-center">
            {/* Ambient Background Blur for Dashboard */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

            <NavigationBar />

            <main className="flex-1 w-full max-w-3xl px-6 pt-32 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                <div className="mb-12 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl hover:border-white/10 transition-colors duration-700 relative overflow-hidden group">
                    {/* Hover internal glow */}
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                    <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-6 flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                        </span>
                        Daily Transmission
                    </p>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-300 to-zinc-600">
                        {todayLesson?.title}
                    </h1>

                    <div className="prose prose-invert max-w-none relative z-10">
                        <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                            {todayLesson?.content}
                        </p>
                    </div>
                </div>

                <div className="px-6 border-t border-white/5 flex justify-between items-center text-sm text-zinc-600 font-medium">
                    <p>End of transmission.</p>
                    <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </main>
        </div>
    );
}
