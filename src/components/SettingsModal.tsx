'use client';

import { useState, useEffect } from 'react';
import { Settings, X, Key, Shield, HardDrive } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function SettingsModal() {
    const [isOpen, setIsOpen] = useState(false);
    const { apiKey, apiProvider, setApiKey } = useStore();

    const [draftKey, setDraftKey] = useState(apiKey || '');
    const [draftProvider, setDraftProvider] = useState<'gemini' | 'longcat'>(apiProvider || 'gemini');

    // Handle escape key to close
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Sync draft states when opened
    useEffect(() => {
        if (isOpen) {
            setDraftKey(apiKey || '');
            setDraftProvider(apiProvider || 'gemini');
        }
    }, [isOpen, apiKey, apiProvider]);

    const handleSave = () => {
        setApiKey(draftKey, draftProvider);
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label="Settings"
            >
                <Settings size={24} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    {/* Backdrop with blur */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Glass panel */}
                    <div className="relative w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-300">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Shield className="w-6 h-6 text-zinc-400" />
                                Connection
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                    <HardDrive size={16} />
                                    Engine
                                </label>
                                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setDraftProvider('gemini')}
                                        className={`flex-1 py-2.5 text-sm rounded-lg transition-all duration-300 ${draftProvider === 'gemini' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >Gemini</button>
                                    <button
                                        onClick={() => setDraftProvider('longcat')}
                                        className={`flex-1 py-2.5 text-sm rounded-lg transition-all duration-300 ${draftProvider === 'longcat' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >LongCat</button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                        <Key size={16} />
                                        API Key
                                    </label>
                                    <a
                                        href={draftProvider === 'gemini' ? 'https://aistudio.google.com/app/apikey' : 'https://longcat.chat/'}
                                        target="_blank" rel="noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4"
                                    >
                                        Get Key
                                    </a>
                                </div>
                                <input
                                    type="password"
                                    value={draftKey}
                                    onChange={(e) => setDraftKey(e.target.value)}
                                    placeholder={`Paste ${draftProvider === 'gemini' ? 'Gemini' : 'LongCat'} key here...`}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-zinc-600"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full mt-4 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-colors"
                            >
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
