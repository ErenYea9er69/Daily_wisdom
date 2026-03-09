import { Calendar, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SettingsModal } from './SettingsModal';

export function NavigationBar() {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-8 duration-700">
            <nav className="flex items-center gap-6 px-8 py-3.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all hover:bg-black/80 hover:border-white/20">
                <Link href="/dashboard" className="text-zinc-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300">
                    <ArrowLeft size={22} className="stroke-[2.5]" />
                </Link>

                <div className="w-[1px] h-6 bg-white/10"></div>

                <div className="flex gap-6 items-center">
                    <Link href="/calendar" className="text-zinc-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300">
                        <Calendar size={22} className="stroke-[2.5]" />
                    </Link>
                    <Link href="/chat" className="text-zinc-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300">
                        <MessageCircle size={22} className="stroke-[2.5]" />
                    </Link>
                    <div className="hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center">
                        <SettingsModal />
                    </div>
                </div>
            </nav>
        </div>
    );
}
