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
        <div className="h-screen flex flex-col bg-black text-white">
            <NavigationBar />

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
            >
                {chatHistory.length === 0 && (
                    <div className="text-center text-zinc-600 mt-20 animate-in fade-in duration-1000">
                        <p className="text-xl mb-2">Speak your mind.</p>
                        <p className="text-sm">I am here to guide you, {userProfile?.name}.</p>
                    </div>
                )}

                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                        <div
                            className={`max-w-[85%] md:max-w-[65%] p-4 rounded-3xl ${msg.role === 'user'
                                    ? 'bg-white text-black rounded-tr-sm'
                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-900 p-4 rounded-3xl rounded-tl-sm flex gap-2">
                            <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 md:p-8 border-t border-zinc-900 bg-black">
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden focus-within:ring-1 focus-within:ring-white transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your thoughts..."
                        className="flex-1 bg-transparent border-none p-4 px-6 text-white focus:outline-none placeholder:text-zinc-600"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="px-6 font-semibold bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
