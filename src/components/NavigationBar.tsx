import { Calendar, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SettingsModal } from './SettingsModal';

export function NavigationBar() {
    return (
        <nav className="w-full p-6 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50 animate-in slide-in-from-top-4 duration-500">
            <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft size={24} />
            </Link>

            <div className="flex gap-6 items-center">
                <Link href="/calendar" className="text-zinc-500 hover:text-white transition-colors">
                    <Calendar size={24} />
                </Link>
                <Link href="/chat" className="text-zinc-500 hover:text-white transition-colors">
                    <MessageCircle size={24} />
                </Link>
                <SettingsModal />
            </div>
        </nav>
    );
}
