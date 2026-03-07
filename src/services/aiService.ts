import { UserProfile, Lesson, ChatMessage } from '../store/useStore';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateDailyLesson = async (apiKey: string, profile: UserProfile): Promise<Omit<Lesson, 'id' | 'date'>> => {
  const prompt = `
    You are a premium, highly intellectual mentor.
    User Profile:
    - Name: ${profile.name}
    - They are currently struggling with: ${profile.struggle}
    - Their preferred learning style/focus: ${profile.focus}
    - They admire: ${profile.admires}
    
    Write a daily lesson (approx 150-250 words) that addresses their exact struggle using the teachings of the person they admire or related historical/philosophical concepts. 
    Make the tone match their learning style (if tough_love: be direct and blunt. If empathy: be gentle and understanding. If history/philosophy: focus on facts and core theories).
    
    Return pure JSON with exactly these two keys: "title" (a bold, catchy title), and "content" (the lesson text, formatting with line breaks if needed). Do not wrap in markdown loops, just raw valid JSON.
  `;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from Gemini');
  }

  const data = await response.json();
  const rawJson = data.candidates[0].content.parts[0].text;
  return JSON.parse(rawJson);
};

export const chatWithMentor = async (apiKey: string, profile: UserProfile, history: ChatMessage[], newMessage: string): Promise<string> => {
  const systemPrompt = `
    You are the user's personal mentor. 
    Their name is ${profile.name}, they admire ${profile.admires}, and their current focus is ${profile.focus} related to ${profile.struggle}.
    Respond as the mentor in less than 100 words. Keep it conversational.
  `;

  // Format history for Gemini
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  formattedHistory.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: formattedHistory
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch chat from Gemini');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
