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
        <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col items-center">
            <NavigationBar />

            <main className="flex-1 w-full max-w-2xl px-6 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-12">
                    <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Daily Transmission
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-8">
                        {todayLesson?.title}
                    </h1>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                            {todayLesson?.content}
                        </p>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-zinc-900 flex justify-between items-center text-sm text-zinc-600">
                    <p>End of transmission.</p>
                    <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </main>
        </div>
    );
}
