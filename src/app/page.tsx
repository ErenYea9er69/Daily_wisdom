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
  const [startedQuiz, setStartedQuiz] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hasCompletedOnboarding) {
      router.push('/dashboard');
    }
  }, [mounted, hasCompletedOnboarding, router]);

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
    { title: 'Lastly, who is a thinker you admire?', subtitle: 'This helps me shape your mentor.', type: 'input', field: 'admires', placeholder: 'E.g., Marcus Aurelius, Buddha, Tesla' }
  ];

  const currentQ = questions[step];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else if (step === questions.length - 1) {
      setProfile({
        name: profileDraft.name || 'Friend',
        focus: profileDraft.focus as any || 'philosophy',
        struggle: profileDraft.struggle || 'General growth',
        admires: profileDraft.admires || 'Marcus Aurelius',
      });
      // We also auto-set longcat as the default provider in the store
      useStore.getState().setApiKey('auto-configured', 'longcat');
      completeOnboarding();
      router.push('/dashboard');
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-black text-white selection:bg-white/20">

      {/* Ambient Background Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-800/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Glass Modal Panel */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center min-h-[450px] bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">

        {!startedQuiz ? (
          <div className="w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600 text-center text-balance">
              Daily Mentor
            </h1>
            <p className="text-zinc-400 text-center mb-10 max-w-xs leading-relaxed">
              Your premium, privacy-focused daily growth companion.
            </p>

            <button
              onClick={() => setStartedQuiz(true)}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Begin Initialization
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center tracking-tight transition-all animate-in fade-in duration-500">
              {currentQ.title}
            </h1>
            {currentQ.subtitle && (
              <p className="text-zinc-400 mb-8 text-center animate-in fade-in duration-500">{currentQ.subtitle}</p>
            )}

            <div className="w-full my-8 min-h-[200px] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentQ.type === 'input' && (
                <input
                  type="text"
                  autoFocus
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xl text-center text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-zinc-600 shadow-inner"
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
                        className={`p-4 rounded-2xl border text-left transition-all duration-300 ${isSelected ? 'bg-zinc-800 border-white/30 text-white shadow-lg' : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20 hover:bg-zinc-900/60'
                          }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={!(profileDraft as any)[currentQ.field!] && currentQ.field !== 'admires'}
              className="mt-4 w-full bg-white text-black font-bold py-4 rounded-xl disabled:opacity-30 transition-all hover:bg-zinc-200"
            >
              {step === questions.length - 1 ? 'Start Journey' : 'Next'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
