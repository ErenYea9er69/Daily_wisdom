'use client';

import { useStore } from '@/store/useStore';
import { NavigationBar } from '@/components/NavigationBar';

export default function CalendarScreen() {
    const { isHydrated, streakCalendar, userProfile } = useStore();

    if (!isHydrated) return null;

    // Render a simple grid for the last 30 days
    const today = new Date();
    const past30Days = Array.from({ length: 30 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
    });

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <NavigationBar />

            <main className="flex-1 flex flex-col items-center p-6 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h1 className="text-4xl font-black mb-2">Consistency.</h1>
                <p className="text-zinc-500 mb-12 text-center max-w-md">
                    "We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle
                </p>

                <div className="w-full max-w-sm">
                    <div className="grid grid-cols-5 gap-2 md:gap-4 mb-12">
                        {past30Days.map(date => {
                            const isDone = streakCalendar.includes(date);
                            const isToday = date === today.toISOString().split('T')[0];

                            return (
                                <div
                                    key={date}
                                    title={date}
                                    className={`aspect-square rounded-xl md:rounded-2xl transition-all duration-500 flex items-center justify-center border ${isDone
                                            ? 'bg-white border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                            : 'bg-zinc-950 border-zinc-900 opacity-50'
                                        } ${isToday && !isDone ? 'ring-2 ring-zinc-700 ring-offset-2 ring-offset-black' : ''}`}
                                />
                            )
                        })}
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-2">
                        <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600">
                            {streakCalendar.length}
                        </span>
                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Total Days Captured</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
