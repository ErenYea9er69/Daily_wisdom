'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { chatWithMentor } from '@/services/aiService';
import { NavigationBar } from '@/components/NavigationBar';

export default function ChatScreen() {
    const { isHydrated, apiKey, userProfile, chatHistory, addChatMessage } = useStore();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);

    const handleSend = async () => {
        if (!input.trim() || !apiKey || !userProfile) return;

        const userMsg = input.trim();
        setInput('');
        addChatMessage({ id: Date.now().toString(), role: 'user', content: userMsg, timestamp: new Date().toISOString() });

        setLoading(true);
        try {
            const response = await chatWithMentor(apiKey, userProfile, chatHistory, userMsg);
            addChatMessage({ id: Date.now().toString(), role: 'assistant', content: response, timestamp: new Date().toISOString() });
        } catch (err) {
            console.error(err);
            addChatMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: 'I am having trouble connecting to my consciousness right now.',
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isHydrated) return null;

    return (
        <div className="h-screen flex flex-col relative bg-black text-white overflow-hidden">
            {/* Ambient Background Blur for Chat */}
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

            <NavigationBar />

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 md:px-8 pt-32 pb-32 space-y-6 relative z-10"
            >
                {chatHistory.length === 0 && (
                    <div className="text-center text-zinc-500 mt-20 animate-in fade-in duration-1000">
                        <p className="text-2xl font-bold mb-2 tracking-tight text-white">Speak your mind.</p>
                        <p className="text-sm">I am here to guide you, {userProfile?.name}.</p>
                    </div>
                )}

                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
                        <div
                            className={`max-w-[85%] md:max-w-[65%] p-5 rounded-[2rem] text-[15px] leading-relaxed shadow-lg ${msg.role === 'user'
                                ? 'bg-white text-black rounded-tr-md font-medium'
                                : 'bg-black/60 backdrop-blur-xl border border-white/5 text-zinc-200 rounded-tl-md'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-black/60 backdrop-blur-xl border border-white/5 p-5 rounded-[2rem] rounded-tl-md flex gap-2">
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Input Pill */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
                <div className="flex bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full p-2 shadow-2xl focus-within:border-white/30 focus-within:bg-black/80 transition-all duration-300">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your thoughts..."
                        className="flex-1 bg-transparent border-none pl-6 pr-4 py-3 text-white focus:outline-none placeholder:text-zinc-600 font-medium"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="px-6 py-3 font-semibold bg-white text-black rounded-full hover:bg-zinc-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:bg-white/10 disabled:text-zinc-500 disabled:hover:scale-100 transition-all duration-300"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
