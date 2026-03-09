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
        <div className="min-h-screen relative overflow-hidden bg-black text-white flex flex-col">
            {/* Ambient Background Blur */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

            <NavigationBar />

            <main className="flex-1 flex flex-col items-center px-6 pt-32 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-600">
                    Consistency.
                </h1>
                <p className="text-zinc-500 mb-16 text-center max-w-md font-medium">
                    "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                </p>

                <div className="w-full max-w-md relative">
                    <div className="grid grid-cols-5 gap-3 md:gap-5 mb-12">
                        {past30Days.map((date, i) => {
                            const isDone = streakCalendar.includes(date);
                            const isToday = date === today.toISOString().split('T')[0];
                            const animationDelay = `${i * 20}ms`; // staggered fade in

                            return (
                                <div
                                    key={date}
                                    title={date}
                                    style={{ animationDelay }}
                                    className={`aspect-square rounded-[1rem] transition-all duration-700 flex items-center justify-center border animate-in zoom-in-50 fade-in ${isDone
                                        ? 'bg-white border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10'
                                        : 'bg-black/40 backdrop-blur-sm border-white/5 hover:border-white/20 hover:bg-white/5'
                                        } ${isToday && !isDone ? 'ring-2 ring-zinc-700 ring-offset-4 ring-offset-black scale-105' : ''}`}
                                />
                            )
                        })}
                    </div>

                    <div className="bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-10 text-center flex flex-col items-center justify-center gap-3 shadow-2xl hover:border-white/10 transition-colors duration-500 group relative overflow-hidden">
                        {/* Hover internal glow */}
                        <div className="absolute inset-0 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                        <span className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-700 relative z-10">
                            {streakCalendar.length}
                        </span>
                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs relative z-10">Total Days Captured</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
