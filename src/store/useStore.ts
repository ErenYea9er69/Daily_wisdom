import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserProfile = {
  name: string;
  focus: 'tough_love' | 'empathy' | 'history' | 'philosophy';
  struggle: string;
  admires: string;
};

export type AppUsage = {
  appName: string;
  durationMinutes: number;
  category: 'social' | 'productivity' | 'entertainment' | 'other';
};

export type Lesson = {
  id: string;
  date: string; // YYYY-MM-DD
  quote: string;
  insight: string;
  action: string;
  category: string;
  reflections?: { role: 'user' | 'assistant'; content: string }[];
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

interface AppState {
  hasCompletedOnboarding: boolean;
  apiKey: string | null;
  apiProvider: 'gemini' | 'longcat';
  userProfile: UserProfile | null;
  lessons: Lesson[];
  chatHistory: ChatMessage[];
  streakCalendar: string[]; // Array of YYYY-MM-DD dates completed
  screenTimeData: AppUsage[]; // Mock data for now
  
  // Actions
  setApiKey: (key: string, provider: 'gemini' | 'longcat') => void;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  addLesson: (lesson: Lesson) => void;
  updateLessonReflections: (date: string, reflection: { role: 'user' | 'assistant'; content: string }) => void;
  markLessonDone: (date: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;
  resetAll: () => void;
  isHydrated: boolean;
  setHydrated: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      apiKey: null,
      apiProvider: 'gemini',
      userProfile: null,
      lessons: [],
      chatHistory: [],
      streakCalendar: [],
      screenTimeData: [
        { appName: 'TikTok', durationMinutes: 184, category: 'social' },
        { appName: 'Instagram', durationMinutes: 120, category: 'social' },
        { appName: 'VS Code', durationMinutes: 45, category: 'productivity' },
        { appName: 'YouTube', durationMinutes: 90, category: 'entertainment' },
      ],
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),
      setApiKey: (key, provider) => set({ apiKey: key, apiProvider: provider }),
      setProfile: (profile) => set({ userProfile: profile }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      addLesson: (lesson) => 
        set((state) => ({ lessons: [...state.lessons, lesson] })),

      updateLessonReflections: (date, reflection) =>
        set((state) => ({
          lessons: state.lessons.map(l => 
            l.date === date 
              ? { ...l, reflections: [...(l.reflections || []), reflection] }
              : l
          )
        })),
        
      markLessonDone: (date) => 
        set((state) => {
          if (!state.streakCalendar.includes(date)) {
            return { streakCalendar: [...state.streakCalendar, date] };
          }
          return state;
        }),
        
      addChatMessage: (msg) => 
        set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
        
      clearChatHistory: () => set({ chatHistory: [] }),
      
      resetAll: () => set({
        hasCompletedOnboarding: false,
        apiKey: null,
        apiProvider: 'gemini',
        userProfile: null,
        lessons: [],
        chatHistory: [],
        streakCalendar: [],
        screenTimeData: [
          { appName: 'TikTok', durationMinutes: 184, category: 'social' },
          { appName: 'Instagram', durationMinutes: 120, category: 'social' },
          { appName: 'VS Code', durationMinutes: 45, category: 'productivity' },
          { appName: 'YouTube', durationMinutes: 90, category: 'entertainment' },
        ]
      }),
    }),
    {
      name: 'mentor-storage-v2',
      // skip hydration during SSR to avoid hydration errors
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
