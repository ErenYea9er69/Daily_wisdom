import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  name: string;
  focus: 'tough_love' | 'empathy' | 'history' | 'philosophy';
  struggle: string;
  admires: string;
};

export type Lesson = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  category: string;
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
  userProfile: UserProfile | null;
  lessons: Lesson[];
  chatHistory: ChatMessage[];
  streakCalendar: string[]; // Array of YYYY-MM-DD dates completed
  
  // Actions
  setApiKey: (key: string) => void;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  addLesson: (lesson: Lesson) => void;
  markLessonDone: (date: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;
  resetAll: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      apiKey: null,
      userProfile: null,
      lessons: [],
      chatHistory: [],
      streakCalendar: [],

      setApiKey: (key) => set({ apiKey: key }),
      setProfile: (profile) => set({ userProfile: profile }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      addLesson: (lesson) => 
        set((state) => ({ lessons: [...state.lessons, lesson] })),
        
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
        userProfile: null,
        lessons: [],
        chatHistory: [],
        streakCalendar: []
      }),
    }),
    {
      name: 'mentor-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
