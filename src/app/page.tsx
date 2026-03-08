'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, UserProfile } from '@/store/useStore';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { hasCompletedOnboarding, apiKey, setProfile, completeOnboarding, setApiKey } = useStore();

  const [step, setStep] = useState(0);
  const [profileDraft, setProfileDraft] = useState<Partial<UserProfile>>({});
  const [keyInput, setKeyInput] = useState('');
  const [provider, setProviderInput] = useState<'gemini' | 'longcat'>('gemini');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hasCompletedOnboarding && apiKey) {
      router.push('/dashboard');
    }
  }, [mounted, hasCompletedOnboarding, apiKey, router]);

  if (!mounted) return null; // Avoid hydration mismatch

  const questions = [
    { title: 'Welcome.', subtitle: 'What shall I call you?', type: 'input', field: 'name', placeholder: 'Your name...' },
    {
      title: 'What brings you here today?', type: 'choice', field: 'struggle',
      options: [
        { label: 'I want to be more disciplined.', value: 'Discipline and focus' },
        { label: 'I feel lost and need guidance.', value: 'Finding purpose' },
        { label: 'To stop caring about what others think.', value: 'Social anxiety and confidence' },
        { label: 'I just love learning history/philosophy.', value: 'Curiosity and learning' },
      ]
    },
    {
      title: 'How do you prefer to learn?', type: 'choice', field: 'focus',
      options: [
        { label: 'Tough love. Tell it to me straight.', value: 'tough_love' },
        { label: 'Gentle and empathetic guidance.', value: 'empathy' },
        { label: 'Purely historical facts and stories.', value: 'history' },
        { label: 'Deep philosophical concepts.', value: 'philosophy' },
      ]
    },
    { title: 'Lastly, who is a thinker you admire?', subtitle: 'This helps me shape your mentor.', type: 'input', field: 'admires', placeholder: 'E.g., Marcus Aurelius, Buddha, Tesla' },
    { title: 'Connect Your Engine', type: 'api-setup' }
  ];

  const currentQ = questions[step];

  const handleNext = () => {
    if (step < questions.length - 2) {
      setStep(step + 1);
    } else if (step === questions.length - 2) {
      setProfile({
        name: profileDraft.name || 'Friend',
        focus: profileDraft.focus as any || 'philosophy',
        struggle: profileDraft.struggle || 'General growth',
        admires: profileDraft.admires || 'Marcus Aurelius',
      });
      completeOnboarding();
      setStep(step + 1);
    }
  };

  const handleFinish = () => {
    if (keyInput.trim().length > 10) {
      setApiKey(keyInput.trim(), provider);
      router.push('/dashboard');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-black text-white selection:bg-white/20">
      <div className="w-full max-w-md flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center tracking-tight transition-all">
          {currentQ.title}
        </h1>
        {currentQ.subtitle && (
          <p className="text-zinc-400 mb-8 text-center">{currentQ.subtitle}</p>
        )}

        <div className="w-full my-8 min-h-[200px] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentQ.type === 'input' && (
            <input
              type="text"
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-white transition-all placeholder:text-zinc-600"
              placeholder={currentQ.placeholder}
              value={(profileDraft as any)[currentQ.field!] || ''}
              onChange={(e) => setProfileDraft({ ...profileDraft, [currentQ.field!]: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          )}

          {currentQ.type === 'choice' && (
            <div className="flex flex-col gap-3">
              {currentQ.options?.map((opt, i) => {
                const isSelected = (profileDraft as any)[currentQ.field!] === opt.value;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setProfileDraft({ ...profileDraft, [currentQ.field!]: opt.value });
                      setTimeout(handleNext, 300); // Auto-advance feeling
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 ${isSelected ? 'bg-zinc-800 border-white text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-500'
                      }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'api-setup' && (
            <div className="flex flex-col gap-6">
              <p className="text-center text-zinc-400 text-sm mb-2">
                This app runs 100% locally. Select an AI engine and provide an API key.
              </p>

              <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setProviderInput('gemini')}
                  className={`flex-1 py-2 text-sm rounded-lg transition-colors ${provider === 'gemini' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                >Gemini</button>
                <button
                  onClick={() => setProviderInput('longcat')}
                  className={`flex-1 py-2 text-sm rounded-lg transition-colors ${provider === 'longcat' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                >LongCat</button>
              </div>

              <a
                href={provider === 'gemini' ? 'https://aistudio.google.com/app/apikey' : 'https://longcat.chat/'}
                target="_blank" rel="noreferrer"
                className="text-center text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4"
              >
                Get a free {provider === 'gemini' ? 'Gemini' : 'LongCat'} key here
              </a>

              <input
                type="password"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-white transition-all placeholder:text-zinc-600"
                placeholder={`Paste ${provider} API Key...`}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFinish()}
              />
            </div>
          )}
        </div>

        {currentQ.type !== 'api-setup' ? (
          <button
            onClick={handleNext}
            disabled={!(profileDraft as any)[currentQ.field!] && currentQ.field !== 'admires'}
            className="mt-4 w-full bg-white text-black font-bold py-4 rounded-full disabled:opacity-30 transition-opacity hover:opacity-90"
          >
            {step === questions.length - 2 ? 'Customize Engine' : 'Next'}
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={keyInput.length < 10}
            className="mt-4 w-full bg-white text-black font-bold py-4 rounded-full disabled:opacity-30 transition-opacity hover:opacity-90"
          >
            Start Journey
          </button>
        )}
      </div>
    </main>
  );
}
